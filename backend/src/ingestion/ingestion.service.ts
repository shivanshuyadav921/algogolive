import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ImportedExample,
  LearningArtifact,
  OperationKind,
  ParsedOperation,
  SourceType,
} from './learning-artifact';

interface LeetCodeQuestionResponse {
  data?: {
    question?: {
      questionId: string;
      title: string;
      titleSlug: string;
      content: string;
      difficulty: string;
      exampleTestcases?: string;
      sampleTestCase?: string;
      topicTags?: Array<{ name: string }>;
      codeSnippets?: Array<{ langSlug: string; code: string }>;
    } | null;
  };
  errors?: Array<{ message?: string }>;
}

@Injectable()
export class IngestionService {
  constructor(private readonly prisma: PrismaService) {}

  async ingest(rawInput: string): Promise<LearningArtifact> {
    const input = rawInput?.trim();
    if (!input) {
      throw new BadRequestException('Input query cannot be empty');
    }

    const sourceType = this.detectSourceType(input);
    if (sourceType === 'leetcode_url') {
      return this.importLeetCodeUrl(input);
    }
    if (sourceType === 'url') {
      throw new BadRequestException(
        'Only LeetCode problem URLs are supported for URL imports',
      );
    }
    return this.createBasicArtifact(input, sourceType);
  }

  private async importLeetCodeUrl(input: string): Promise<LearningArtifact> {
    const url = this.parseLeetCodeUrl(input);
    const slug = this.extractLeetCodeSlug(url);
    const canonicalUrl = `https://leetcode.com/problems/${slug}/`;
    const localProblem = await this.findLocalProblem(slug);

    if (localProblem) {
      return {
        sourceType: 'leetcode_url',
        rawInput: input,
        sourceUrl: canonicalUrl,
        externalId: localProblem.id,
        slug: localProblem.slug,
        title: localProblem.title,
        statement: localProblem.description,
        difficulty: localProblem.difficulty,
        category: localProblem.category,
        topics: [localProblem.category],
        constraints: this.extractConstraints(localProblem.description),
        examples: this.testCasesToExamples(localProblem.testCases),
        starterCodes: localProblem.starterCodes,
        testCases: this.normalizeTestCases(localProblem.testCases),
        metadata: {
          provider: 'local_catalog',
          importedAt: new Date().toISOString(),
        },
      };
    }

    return this.fetchLeetCodeProblem(slug, input, canonicalUrl);
  }

  private parseLeetCodeUrl(input: string): URL {
    let url: URL;
    try {
      url = new URL(input);
    } catch {
      throw new BadRequestException('The LeetCode URL is malformed');
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new BadRequestException('The LeetCode URL must use HTTP or HTTPS');
    }

    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    if (hostname !== 'leetcode.com') {
      throw new BadRequestException(
        'Only URLs from leetcode.com can be imported as LeetCode problems',
      );
    }
    return url;
  }

  private extractLeetCodeSlug(url: URL): string {
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments[0] !== 'problems' || !segments[1]) {
      throw new BadRequestException(
        'Expected a LeetCode problem URL such as https://leetcode.com/problems/two-sum/',
      );
    }

    const slug = segments[1].toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new BadRequestException('The LeetCode problem slug is invalid');
    }
    return slug;
  }

  private async findLocalProblem(slug: string) {
    try {
      return await this.prisma.problem.findUnique({
        where: { slug },
        include: { starterCodes: true },
      });
    } catch {
      return null;
    }
  }

  private async fetchLeetCodeProblem(
    slug: string,
    rawInput: string,
    sourceUrl: string,
  ): Promise<LearningArtifact> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: sourceUrl,
          'User-Agent': 'AlgoVerse/1.0 problem importer',
        },
        body: JSON.stringify({
          operationName: 'questionData',
          variables: { titleSlug: slug },
          query: `
            query questionData($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                questionId
                title
                titleSlug
                content
                difficulty
                exampleTestcases
                sampleTestCase
                topicTags { name }
                codeSnippets { langSlug code }
              }
            }
          `,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new BadGatewayException(
          `LeetCode returned HTTP ${response.status} while importing the problem`,
        );
      }

      const payload = (await response.json()) as LeetCodeQuestionResponse;
      const question = payload.data?.question;
      if (!question) {
        const detail = payload.errors?.[0]?.message;
        throw new NotFoundException(
          detail
            ? `LeetCode problem '${slug}' could not be imported: ${detail}`
            : `LeetCode problem '${slug}' was not found or is not publicly available`,
        );
      }

      const statement = this.htmlToText(question.content);
      const examples = this.extractExamples(question.content);
      if (examples.length === 0) {
        const sampleInput =
          question.exampleTestcases?.trim() || question.sampleTestCase?.trim();
        if (sampleInput) examples.push({ input: sampleInput });
      }

      return {
        sourceType: 'leetcode_url',
        rawInput,
        sourceUrl,
        externalId: question.questionId,
        slug: question.titleSlug,
        title: question.title,
        statement,
        difficulty: question.difficulty,
        category: question.topicTags?.[0]?.name,
        topics: question.topicTags?.map((tag) => tag.name) ?? [],
        constraints: this.extractConstraints(statement),
        examples,
        starterCodes:
          question.codeSnippets?.map((snippet) => ({
            language: this.normalizeLanguage(snippet.langSlug),
            code: snippet.code,
          })) ?? [],
        testCases: examples.flatMap((example) =>
          example.output
            ? [{ input: example.input, output: example.output }]
            : [],
        ),
        metadata: {
          provider: 'leetcode',
          importedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (
        error instanceof BadGatewayException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new BadGatewayException('LeetCode import timed out');
      }
      throw new BadGatewayException(
        `LeetCode import failed: ${
          error instanceof Error ? error.message : 'unknown upstream error'
        }`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private detectSourceType(input: string): SourceType {
    if (/^https?:\/\//i.test(input)) {
      try {
        const hostname = new URL(input).hostname
          .toLowerCase()
          .replace(/^www\./, '');
        return hostname === 'leetcode.com' ? 'leetcode_url' : 'url';
      } catch {
        return 'url';
      }
    }
    if (this.looksLikeCode(input)) return 'code';
    if (this.looksLikePseudocode(input)) return 'pseudocode';
    return 'plain_text';
  }

  private looksLikeCode(input: string): boolean {
    return [
      /\bdef\s+\w+\s*\(/,
      /\bfunction\s+\w+\s*\(/,
      /\bclass\s+\w+/,
      /#include\s*[<"]/,
      /\b(public|private|static)\s+\w+/,
      /\b(const|let|var)\s+\w+\s*=/,
    ].some((signal) => signal.test(input));
  }

  private looksLikePseudocode(input: string): boolean {
    const signals = [
      /^\s*(algorithm|procedure|function)\b/im,
      /^\s*(for each|repeat|while|if|else|return)\b/im,
      /\b(end if|end while|end for)\b/i,
    ];
    return signals.filter((signal) => signal.test(input)).length >= 2;
  }

  private createBasicArtifact(
    input: string,
    sourceType: Exclude<SourceType, 'leetcode_url' | 'url'>,
  ): LearningArtifact {
    if (sourceType === 'plain_text') {
      return this.parsePlainText(input);
    }
    if (sourceType === 'pseudocode') {
      return this.parsePseudocode(input);
    }
    if (sourceType === 'code') {
      return this.parseCode(input);
    }

    const firstLine =
      input.split(/\r?\n/).find((line) => line.trim()) ??
      'Custom Learning Artifact';
    const compact = firstLine.replace(/\s+/g, ' ').trim();
    return {
      sourceType,
      rawInput: input,
      title: compact.length > 80 ? `${compact.slice(0, 77)}...` : compact,
      statement: input,
      topics: [],
      constraints: this.extractConstraints(input),
      examples: [],
      starterCodes: [],
      testCases: [],
      metadata: { importedAt: new Date().toISOString() },
    };
  }

  private parseCode(input: string): LearningArtifact {
    const language = this.detectCodeLanguage(input);
    const signature = this.extractCodeSignature(input, language);
    const lines = input.split(/\r?\n/);
    const operations = lines.flatMap((rawLine, index) => {
      const text = rawLine.trim();
      if (
        !text ||
        text === '{' ||
        text === '}' ||
        /^[/#*]/.test(text) ||
        /^(?:class|public class|private class)\b/.test(text)
      ) {
        return [];
      }
      return [
        {
          line: index + 1,
          kind: this.codeOperationKind(text),
          text,
        },
      ];
    });
    const variables = new Set(signature.parameters);

    for (const operation of operations) {
      const declaration = operation.text.match(
        /^(?:(?:const|let|var|int|long|double|float|boolean|bool|string|String|char|auto)\s+)([A-Za-z_]\w*)/i,
      );
      const pythonAssignment = operation.text.match(/^([A-Za-z_]\w*)\s*=/);
      const loopVariable = operation.text.match(
        /^for\s*(?:\(\s*)?(?:const|let|var|int|long|auto)?\s*([A-Za-z_]\w*)/i,
      );
      if (declaration) variables.add(declaration[1]);
      if (pythonAssignment) variables.add(pythonAssignment[1]);
      if (loopVariable) variables.add(loopVariable[1]);
    }

    return {
      sourceType: 'code',
      rawInput: input,
      title: signature.name
        ? this.humanizeIdentifier(signature.name)
        : 'Imported Code',
      statement: input,
      topics: [],
      constraints: [],
      examples: [],
      starterCodes: [{ language, code: input }],
      testCases: [],
      algorithm: {
        name: signature.name,
        language,
        parameters: signature.parameters,
        variables: [...variables],
        operations,
      },
      metadata: { importedAt: new Date().toISOString() },
    };
  }

  private detectCodeLanguage(
    input: string,
  ): NonNullable<LearningArtifact['algorithm']>['language'] {
    if (/#include\s*[<"]/.test(input)) return 'cpp';
    if (
      /\b(public|private|protected)\s+(?:static\s+)?(?:class|void|int|boolean|String)\b/.test(
        input,
      ) ||
      /\bSystem\.out\./.test(input)
    ) {
      return 'java';
    }
    if (/^\s*def\s+\w+\s*\(/m.test(input)) return 'python';
    if (
      /\b(?:interface|type)\s+\w+/.test(input) ||
      /(?:function\s+\w+\s*\([^)]*:\s*\w+|:\s*(?:number|string|boolean)\b)/.test(
        input,
      )
    ) {
      return 'typescript';
    }
    if (
      /\bfunction\s+\w+\s*\(/.test(input) ||
      /\b(?:const|let|var)\s+\w+\s*=/.test(input)
    ) {
      return 'javascript';
    }
    return 'unknown';
  }

  private extractCodeSignature(
    input: string,
    language: NonNullable<LearningArtifact['algorithm']>['language'],
  ): { name?: string; parameters: string[] } {
    let match: RegExpMatchArray | null = null;
    if (language === 'python') {
      match = input.match(/^\s*def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/m);
    } else if (language === 'javascript' || language === 'typescript') {
      match =
        input.match(/\bfunction\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/) ??
        input.match(
          /\b(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/,
        );
    } else if (language === 'java' || language === 'cpp') {
      match = input.match(
        /(?:public|private|protected)?\s*(?:static\s+)?(?:[\w<>\[\],:&*]+\s+)+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/,
      );
      if (match?.[1] === 'main') {
        const remaining = input.slice((match.index ?? 0) + match[0].length);
        match = remaining.match(
          /(?:public|private|protected)?\s*(?:static\s+)?(?:[\w<>\[\],:&*]+\s+)+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:const\s*)?\{/,
        );
      }
    }

    return {
      name: match?.[1],
      parameters: this.parseParameterNames(match?.[2] ?? '', language),
    };
  }

  private parseParameterNames(
    rawParameters: string,
    language: NonNullable<LearningArtifact['algorithm']>['language'],
  ): string[] {
    if (!rawParameters.trim()) return [];
    return rawParameters.split(',').flatMap((rawParameter) => {
      const withoutDefault = rawParameter.split('=')[0].trim();
      if (!withoutDefault) return [];
      if (language === 'python' || language === 'typescript') {
        const name = withoutDefault.split(':')[0].replace(/^[*.]+/, '').trim();
        return /^[A-Za-z_]\w*$/.test(name) ? [name] : [];
      }
      const tokens = withoutDefault
        .replace(/[&*]/g, ' ')
        .trim()
        .split(/\s+/);
      const name = tokens[tokens.length - 1]?.replace(/\[\]$/, '');
      return name && /^[A-Za-z_]\w*$/.test(name) ? [name] : [];
    });
  }

  private codeOperationKind(text: string): OperationKind {
    if (/^(?:for|while|do)\b/i.test(text)) return 'loop';
    if (/^(?:if|else if|else|switch|case)\b/i.test(text)) return 'condition';
    if (/^return\b/i.test(text)) return 'return';
    if (
      /^(?:const|let|var|int|long|double|float|boolean|bool|string|String|char|auto)\b/.test(
        text,
      )
    ) {
      return 'declaration';
    }
    if (/^[A-Za-z_]\w*(?:\[[^\]]+\])?\s*(?:=|\+=|-=|\*=|\/=)/.test(text)) {
      return 'assignment';
    }
    if (/\b[A-Za-z_]\w*(?:\.\w+)?\s*\([^)]*\)/.test(text)) return 'call';
    return 'other';
  }

  private parsePseudocode(input: string): LearningArtifact {
    const lines = input.split(/\r?\n/);
    const signature = lines
      .map((line) => line.trim())
      .find((line) => /^(?:algorithm|procedure|function)\b/i.test(line));
    const signatureMatch = signature?.match(
      /^(?:algorithm|procedure|function)\s+([A-Za-z_]\w*)\s*(?:\(([^)]*)\))?/i,
    );
    const name = signatureMatch?.[1];
    const parameters =
      signatureMatch?.[2]
        ?.split(',')
        .map((parameter) => parameter.trim())
        .filter(Boolean) ?? [];
    const operations = this.parseOperations(lines);
    const variables = new Set(parameters);

    for (const operation of operations) {
      const assignment = operation.text.match(
        /^(?:set\s+|let\s+|var\s+)?([A-Za-z_]\w*)\s*(?:<-|:=|=)/i,
      );
      if (assignment) variables.add(assignment[1]);
      const loopVariable = operation.text.match(
        /^(?:for\s+each|for)\s+([A-Za-z_]\w*)\b/i,
      );
      if (loopVariable) variables.add(loopVariable[1]);
    }

    return {
      sourceType: 'pseudocode',
      rawInput: input,
      title: name ? this.humanizeIdentifier(name) : 'Imported Pseudocode',
      statement: input,
      topics: [],
      constraints: [],
      examples: [],
      starterCodes: [],
      testCases: [],
      algorithm: {
        name,
        language: 'pseudocode',
        parameters,
        variables: [...variables],
        operations,
      },
      metadata: { importedAt: new Date().toISOString() },
    };
  }

  private parseOperations(lines: string[]): ParsedOperation[] {
    return lines.flatMap((rawLine, index) => {
      const text = rawLine.trim();
      if (
        !text ||
        /^(?:algorithm|procedure|function)\b/i.test(text) ||
        /^(?:end|endif|end if|endwhile|end while|endfor|end for)\b/i.test(text)
      ) {
        return [];
      }
      return [{ line: index + 1, kind: this.operationKind(text), text }];
    });
  }

  private operationKind(text: string): OperationKind {
    if (/^(?:for|for each|while|repeat)\b/i.test(text)) return 'loop';
    if (/^(?:if|else if|else|switch|case)\b/i.test(text)) return 'condition';
    if (/^return\b/i.test(text)) return 'return';
    if (/^(?:declare|initialize|create)\b/i.test(text)) return 'declaration';
    if (/^(?:set\s+|let\s+|var\s+)?[A-Za-z_]\w*\s*(?:<-|:=|=)/i.test(text)) {
      return 'assignment';
    }
    if (/\b[A-Za-z_]\w*\s*\([^)]*\)/.test(text)) return 'call';
    return 'other';
  }

  private humanizeIdentifier(value: string): string {
    return value
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  private parsePlainText(input: string): LearningArtifact {
    const lines = input.split(/\r?\n/);
    const firstContentIndex = lines.findIndex((line) => line.trim());
    const firstLine =
      firstContentIndex >= 0 ? lines[firstContentIndex].trim() : '';
    const explicitTitle = firstLine.match(/^(?:title|problem)\s*:\s*(.+)$/i)?.[1];
    const looksLikeHeading =
      firstLine.length > 0 &&
      firstLine.length <= 100 &&
      !/[.!?]$/.test(firstLine) &&
      !/^(given|you are|write|find|return|determine|calculate)\b/i.test(firstLine);
    const title = explicitTitle || (looksLikeHeading ? firstLine : 'Imported Problem');
    const examples = this.extractTextExamples(lines);
    const constraints = this.extractTextSection(lines, 'constraints');

    return {
      sourceType: 'plain_text',
      rawInput: input,
      title,
      statement: input,
      topics: [],
      constraints:
        constraints.length > 0 ? constraints : this.extractConstraints(input),
      examples,
      starterCodes: [],
      testCases: examples.flatMap((example) =>
        example.output
          ? [{ input: example.input, output: example.output }]
          : [],
      ),
      metadata: { importedAt: new Date().toISOString() },
    };
  }

  private extractTextExamples(lines: string[]): ImportedExample[] {
    const examples: ImportedExample[] = [];
    let current: ImportedExample | null = null;
    let activeField: 'input' | 'output' | 'explanation' | null = null;

    const commit = () => {
      if (current?.input.trim()) {
        examples.push({
          input: current.input.trim(),
          output: current.output?.trim() || undefined,
          explanation: current.explanation?.trim() || undefined,
        });
      }
      current = null;
      activeField = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (/^example\s*\d*\s*:?\s*$/i.test(line)) {
        commit();
        current = { input: '' };
        continue;
      }

      const fieldMatch = line.match(/^(input|output|explanation)\s*:\s*(.*)$/i);
      if (fieldMatch) {
        if (!current) current = { input: '' };
        activeField = fieldMatch[1].toLowerCase() as typeof activeField;
        const value = fieldMatch[2].trim();
        if (activeField && value) {
          current[activeField] = value;
        }
        continue;
      }

      if (/^(constraints?|notes?|follow[- ]?up)\s*:?\s*$/i.test(line)) {
        commit();
        continue;
      }

      if (
        current &&
        activeField &&
        line
      ) {
        current[activeField] = `${current[activeField] ?? ''}\n${line}`.trim();
      }
    }
    commit();
    return examples;
  }

  private extractTextSection(lines: string[], heading: string): string[] {
    const start = lines.findIndex((line) =>
      new RegExp(`^${heading}\\s*:?\\s*$`, 'i').test(line.trim()),
    );
    if (start < 0) return [];

    const values: string[] = [];
    for (const rawLine of lines.slice(start + 1)) {
      const line = rawLine.replace(/^[-*\u2022]\s*/, '').trim();
      if (!line) continue;
      if (/^(example|input|output|explanation|follow[- ]?up|notes?)\b/i.test(line)) {
        break;
      }
      values.push(line);
    }
    return values;
  }

  private normalizeTestCases(value: unknown): Array<{ input: string; output: string }> {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as { input?: unknown }).input === 'string' &&
        typeof (item as { output?: unknown }).output === 'string'
      ) {
        return [
          {
            input: (item as { input: string }).input,
            output: (item as { output: string }).output,
          },
        ];
      }
      return [];
    });
  }

  private testCasesToExamples(value: unknown) {
    return this.normalizeTestCases(value).map((testCase) => ({ ...testCase }));
  }

  private extractConstraints(statement: string): string[] {
    const lines = statement
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
    const headingIndex = lines.findIndex((line) =>
      /^constraints?:?$/i.test(line),
    );
    if (headingIndex >= 0) return lines.slice(headingIndex + 1);
    return lines.filter((line) => /(?:<=|>=|<|>|length|range)/i.test(line));
  }

  private extractExamples(html: string): ImportedExample[] {
    const normalized = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(pre|p|li|div)>/gi, '\n');
    const blocks = normalized.split(
      /<strong[^>]*>\s*Example\s*\d*\s*:?\s*<\/strong>/i,
    );
    return blocks.slice(1).flatMap((block) => {
      const input = block.match(
        /<strong[^>]*>\s*Input\s*:?\s*<\/strong>\s*([^<]+)/i,
      )?.[1];
      const output = block.match(
        /<strong[^>]*>\s*Output\s*:?\s*<\/strong>\s*([^<]+)/i,
      )?.[1];
      const explanation = block.match(
        /<strong[^>]*>\s*Explanation\s*:?\s*<\/strong>\s*([^<]+)/i,
      )?.[1];
      if (!input) return [];
      return [
        {
          input: this.decodeEntities(input.trim()),
          output: output ? this.decodeEntities(output.trim()) : undefined,
          explanation: explanation
            ? this.decodeEntities(explanation.trim())
            : undefined,
        },
      ];
    });
  }

  private htmlToText(html: string): string {
    return this.decodeEntities(
      html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|pre|li|div|h\d)>/gi, '\n')
        .replace(/<li[^>]*>/gi, '- ')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim(),
    );
  }

  private decodeEntities(value: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };
    return value.replace(
      /&(amp|lt|gt|quot|#39|nbsp);/g,
      (entity) => entities[entity] ?? entity,
    );
  }

  private normalizeLanguage(language: string): string {
    const aliases: Record<string, string> = {
      python3: 'python',
      python: 'python',
      cpp: 'cpp',
      java: 'java',
      javascript: 'javascript',
      typescript: 'typescript',
    };
    return aliases[language.toLowerCase()] ?? language.toLowerCase();
  }
}
