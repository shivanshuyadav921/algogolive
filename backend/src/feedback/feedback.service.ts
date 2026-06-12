import { Injectable } from '@nestjs/common';

export interface FeedbackDiagnostic {
  type: 'compile' | 'runtime' | 'no-output' | 'wrong-answer' | 'coverage';
  message: string;
  suggestion: string;
  testIndex?: number;
}

export interface ExecutionFeedback {
  status: 'passed' | 'needs-work' | 'blocked';
  summary: string;
  diagnostics: FeedbackDiagnostic[];
  nextAction: string;
}

interface ExecutionResult {
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

interface FeedbackInput {
  success: boolean;
  compileError?: string;
  results: ExecutionResult[];
  pattern?: string;
}

@Injectable()
export class FeedbackService {
  evaluateExecution(input: FeedbackInput): ExecutionFeedback {
    if (input.compileError) {
      const missingEntryPoint = /no solution function|cannot find symbol|no member named|nosuchmethod/i.test(
        input.compileError,
      );
      return {
        status: 'blocked',
        summary: missingEntryPoint
          ? 'The runner could not find the expected solution entry point.'
          : 'The submission did not compile or start.',
        diagnostics: [
          {
            type: 'compile',
            message: input.compileError,
            suggestion: missingEntryPoint
              ? 'Match the imported starter-code function or method signature exactly.'
              : 'Fix the first compiler error before evaluating algorithm behavior.',
          },
        ],
        nextAction: 'Resolve the compile diagnostic, then run the same tests again.',
      };
    }

    if (input.results.length === 0) {
      return {
        status: 'blocked',
        summary: 'No executable input/output test cases were available.',
        diagnostics: [
          {
            type: 'coverage',
            message: 'The imported artifact did not provide complete expected outputs.',
            suggestion:
              'Add at least one concrete input and expected output before judging the solution.',
          },
        ],
        nextAction: 'Provide a complete example or choose a catalog problem with test cases.',
      };
    }

    const diagnostics = input.results.reduce<FeedbackDiagnostic[]>(
      (items, result, index) => {
      if (result.passed) return items;
      if (result.error) {
        items.push({
            type: 'runtime' as const,
            testIndex: index,
            message: result.error.trim(),
            suggestion:
              'Trace the failing input to the first operation that violates the recipe invariant.',
        });
        return items;
      }
      if (!result.actual || result.actual === 'No output') {
        items.push({
            type: 'no-output' as const,
            testIndex: index,
            message: `Expected ${result.expected}, but the program produced no output.`,
            suggestion:
              'Ensure the solution returns a value through the imported entry point instead of only mutating local state.',
        });
        return items;
      }
      items.push({
          type: 'wrong-answer' as const,
          testIndex: index,
          message: `Expected ${result.expected}, received ${result.actual}.`,
          suggestion: this.patternSuggestion(input.pattern),
      });
      return items;
    }, []);

    if (diagnostics.length === 0 && input.success) {
      return {
        status: 'passed',
        summary: `All ${input.results.length} test cases passed.`,
        diagnostics: [],
        nextAction: 'Review complexity and test one additional boundary case.',
      };
    }

    return {
      status: 'needs-work',
      summary: `${diagnostics.length} of ${input.results.length} test cases need attention.`,
      diagnostics,
      nextAction:
        'Fix the earliest failing test first, then rerun before changing later behavior.',
    };
  }

  private patternSuggestion(pattern?: string): string {
    const lower = pattern?.toLowerCase() ?? '';
    if (lower.includes('binary search')) {
      return 'Check interval inclusivity, midpoint calculation, and which half is discarded after each comparison.';
    }
    if (lower.includes('hash')) {
      return 'Check whether lookup happens before insertion and whether duplicate values retain the correct index.';
    }
    if (lower.includes('dynamic programming')) {
      return 'Check base cases, recurrence dependencies, and table fill order.';
    }
    if (lower.includes('stack')) {
      return 'Check empty-stack access and whether each closing token matches the latest unresolved opening token.';
    }
    if (lower.includes('graph')) {
      return 'Check when nodes are marked discovered and whether every required component is traversed.';
    }
    return 'Compare the first mismatching state with the recipe invariant and verify boundary updates.';
  }
}
