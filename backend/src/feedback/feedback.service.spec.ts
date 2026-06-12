import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  const service = new FeedbackService();

  it('reports a clean pass with a boundary-case next action', () => {
    expect(
      service.evaluateExecution({
        success: true,
        results: [{ passed: true, expected: '4', actual: '4' }],
      }),
    ).toEqual({
      status: 'passed',
      summary: 'All 1 test cases passed.',
      diagnostics: [],
      nextAction: 'Review complexity and test one additional boundary case.',
    });
  });

  it('turns entry-point compile failures into a specific repair', () => {
    const feedback = service.evaluateExecution({
      success: false,
      compileError: 'Error: No solution function declared.',
      results: [],
    });

    expect(feedback.status).toBe('blocked');
    expect(feedback.diagnostics[0].suggestion).toContain('signature exactly');
  });

  it('distinguishes runtime failures from wrong answers', () => {
    const feedback = service.evaluateExecution({
      success: false,
      pattern: 'Binary Search Pattern',
      results: [
        {
          passed: false,
          expected: '4',
          actual: 'No output',
          error: 'IndexError: list index out of range',
        },
        { passed: false, expected: '-1', actual: '0' },
      ],
    });

    expect(feedback.diagnostics).toEqual([
      expect.objectContaining({ type: 'runtime', testIndex: 0 }),
      expect.objectContaining({
        type: 'wrong-answer',
        testIndex: 1,
        suggestion: expect.stringContaining('interval inclusivity'),
      }),
    ]);
  });

  it('does not pretend to evaluate artifacts without expected outputs', () => {
    const feedback = service.evaluateExecution({
      success: false,
      results: [],
    });
    expect(feedback).toMatchObject({
      status: 'blocked',
      diagnostics: [{ type: 'coverage' }],
    });
  });
});
