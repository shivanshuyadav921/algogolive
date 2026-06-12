export type SourceType = 'leetcode_url' | 'url' | 'code' | 'pseudocode' | 'plain_text';

export interface ImportedExample {
  input: string;
  output?: string;
  explanation?: string;
}

export interface ImportedStarterCode {
  language: string;
  code: string;
}

export type OperationKind =
  | 'declaration'
  | 'assignment'
  | 'loop'
  | 'condition'
  | 'return'
  | 'call'
  | 'other';

export interface ParsedOperation {
  line: number;
  kind: OperationKind;
  text: string;
}

export interface LearningArtifact {
  sourceType: SourceType;
  rawInput: string;
  sourceUrl?: string;
  externalId?: string;
  slug?: string;
  title: string;
  statement: string;
  difficulty?: string;
  category?: string;
  topics: string[];
  constraints: string[];
  examples: ImportedExample[];
  starterCodes: ImportedStarterCode[];
  testCases: Array<{ input: string; output: string }>;
  algorithm?: {
    name?: string;
    language: 'pseudocode' | 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'unknown';
    parameters: string[];
    variables: string[];
    operations: ParsedOperation[];
  };
  metadata: {
    provider?: 'local_catalog' | 'leetcode';
    importedAt: string;
  };
}
