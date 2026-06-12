import { LearningArtifact } from '../ingestion/learning-artifact';
import { VisualizerService } from './visualizer.service';

describe('VisualizerService pattern detection', () => {
  const ingest = jest.fn();
  const service = new VisualizerService({ ingest } as never);

  beforeEach(() => jest.resetAllMocks());

  const artifact = (
    overrides: Partial<LearningArtifact>,
  ): LearningArtifact => ({
    sourceType: 'plain_text',
    rawInput: '',
    title: 'Imported Problem',
    statement: '',
    topics: [],
    constraints: [],
    examples: [],
    starterCodes: [],
    testCases: [],
    metadata: { importedAt: '2026-06-09T00:00:00.000Z' },
    ...overrides,
  });

  it.each([
    [
      artifact({
        title: 'Binary Search',
        statement: 'Search for a target in a sorted array in logarithmic time.',
      }),
      'Binary Search Pattern',
    ],
    [
      artifact({
        title: 'Longest Substring Without Repeating Characters',
        statement: 'Find the longest contiguous substring with unique characters.',
      }),
      'Sliding Window Pattern',
    ],
    [
      artifact({
        title: 'Two Sum',
        statement: 'Return indices whose values sum to target using a complement lookup.',
      }),
      'Hash Map / Set Pattern',
    ],
    [
      artifact({
        title: 'Longest Common Subsequence',
        statement: 'Find the longest subsequence of two strings.',
        topics: ['Dynamic Programming'],
      }),
      'Dynamic Programming Pattern',
    ],
    [
      artifact({
        title: 'Number of Islands',
        statement: 'Count connected components in a grid using graph traversal.',
      }),
      'Graph Traversal Pattern',
    ],
    [
      artifact({
        title: 'Valid Parentheses',
        statement: 'Validate matching brackets in last in first out order.',
      }),
      'Stack Pattern',
    ],
  ])('detects %s', async (inputArtifact, expectedPattern) => {
    ingest.mockResolvedValue(inputArtifact);
    const response = await service.processInput(inputArtifact.rawInput || 'input');
    expect(response.pattern).toBe(expectedPattern);
    expect(response.metadata.confidence).toBeGreaterThan(0.5);
    expect(response.metadata.detectedSignals.length).toBeGreaterThan(0);
  });

  it('uses exact signal boundaries instead of matching map inside unrelated words', async () => {
    const inputArtifact = artifact({
      title: 'Dynamic Programming Basics',
      statement: 'Build a recurrence over overlapping subproblems.',
      topics: ['Dynamic Programming'],
    });
    ingest.mockResolvedValue(inputArtifact);

    const response = await service.processInput('input');

    expect(response.pattern).toBe('Dynamic Programming Pattern');
    expect(response.metadata.detectedSignals).not.toContain('map');
  });

  it('returns a low-confidence fallback when no evidence exists', async () => {
    ingest.mockResolvedValue(
      artifact({
        title: 'Custom Exercise',
        statement: 'Transform the supplied values.',
      }),
    );

    const response = await service.processInput('input');

    expect(response.pattern).toBe('Sequence and Pointer Pattern');
    expect(response.metadata.confidence).toBe(0.3);
    expect(response.metadata.assumptions).toHaveLength(1);
  });

  it('generates a problem-specific recipe from examples and constraints', async () => {
    ingest.mockResolvedValue(
      artifact({
        title: 'Binary Search',
        statement: 'Find target in a sorted array.',
        examples: [{ input: 'nums = [1,3,5], target = 3', output: '1' }],
        constraints: ['1 <= nums.length <= 10^4'],
      }),
    );

    const response = await service.processInput('input');

    expect(response.tutorMode.recipe).toMatchObject({
      title: 'Binary Search: Binary Search Pattern',
      invariant: expect.stringContaining('search interval'),
      steps: expect.arrayContaining([
        {
          title: 'Model the input',
          instruction: expect.stringContaining('nums = [1,3,5], target = 3'),
        },
        {
          title: 'Initialize state',
          instruction: expect.stringContaining('left and right'),
        },
      ]),
      validation: expect.arrayContaining(['1 <= nums.length <= 10^4']),
    });
  });

  it('turns parsed pseudocode operations into ordered recipe steps', async () => {
    ingest.mockResolvedValue(
      artifact({
        sourceType: 'pseudocode',
        rawInput: 'FUNCTION search(values, target)',
        title: 'Search',
        statement: 'Binary search pseudocode.',
        algorithm: {
          name: 'search',
          language: 'pseudocode',
          parameters: ['values', 'target'],
          variables: ['values', 'target', 'mid'],
          operations: [
            { line: 2, kind: 'assignment', text: 'mid <- 2' },
            { line: 3, kind: 'return', text: 'RETURN mid' },
          ],
        },
      }),
    );

    const response = await service.processInput('input');

    expect(response.tutorMode.recipe.steps).toEqual(
      expect.arrayContaining([
        { title: 'Apply operation 1', instruction: 'Line 2: mid <- 2' },
        { title: 'Apply operation 2', instruction: 'Line 3: RETURN mid' },
      ]),
    );
  });

  it('generates progressive hints from recognition through update mechanics', async () => {
    ingest.mockResolvedValue(
      artifact({
        title: 'Binary Search',
        statement: 'Search a sorted array for target.',
      }),
    );

    const response = await service.processInput('input');

    expect(response.tutorMode.hints).toHaveLength(4);
    expect(response.tutorMode.hints.map((hint) => hint.level)).toEqual([
      1, 2, 3, 4,
    ]);
    expect(response.tutorMode.hints[0].content).toContain('binary search');
    expect(response.tutorMode.hints[1].content).toContain('search interval');
    expect(response.tutorMode.hints[2].content).toContain('left and right');
    expect(response.tutorMode.hints[3].content).toContain('midpoint');
  });

  it('generates a binary-search trace from imported example values', async () => {
    ingest.mockResolvedValue(
      artifact({
        title: 'Binary Search',
        statement: 'Search a sorted array.',
        examples: [
          { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
        ],
      }),
    );

    const response = await service.processInput('input');

    expect(response.visualizationData.type).toBe('array');
    expect(response.visualizationData.steps.at(-1)).toMatchObject({
      state: { result: 4 },
      highlights: { sorted: [4] },
    });
    expect(response.visualizationData.steps.some((step) =>
      step.explanation.includes('midpoint value equals 9'),
    )).toBe(true);
  });

  it('generates a Two Sum map trace from imported example values', async () => {
    ingest.mockResolvedValue(
      artifact({
        title: 'Two Sum',
        statement: 'Return indices using a hash map complement lookup.',
        examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }],
      }),
    );

    const response = await service.processInput('input');

    expect(response.visualizationData.steps.at(-1)?.state).toMatchObject({
      result: [0, 1],
    });
    expect(response.visualizationData.steps.at(-1)?.explanation).toContain(
      'return [0, 1]',
    );
  });

  it('generates a valid-parentheses stack trace from an example', async () => {
    ingest.mockResolvedValue(
      artifact({
        title: 'Valid Parentheses',
        statement: 'Validate matching brackets.',
        examples: [{ input: '"()[]{}"', output: 'true' }],
      }),
    );

    const response = await service.processInput('input');

    expect(response.visualizationData.type).toBe('list');
    expect(response.visualizationData.steps.at(-1)?.state).toMatchObject({
      stack: [],
      valid: true,
    });
  });

  it('generates an LCS table from concrete string inputs', async () => {
    ingest.mockResolvedValue(
      artifact({
        title: 'Longest Common Subsequence',
        statement: 'Return the longest common subsequence length.',
        topics: ['Dynamic Programming'],
        examples: [{ input: '"abcde"\n"ace"', output: '3' }],
      }),
    );

    const response = await service.processInput('input');
    const finalGrid = (
      response.visualizationData.steps.at(-1)?.state as { grid: number[][] }
    ).grid;

    expect(response.visualizationData.type).toBe('dp');
    expect(finalGrid[0][0]).toBe(3);
  });

  it('uses parsed operations when concrete execution input is unavailable', async () => {
    ingest.mockResolvedValue(
      artifact({
        sourceType: 'pseudocode',
        title: 'Custom Loop',
        statement: 'Iterate through values.',
        algorithm: {
          language: 'pseudocode',
          parameters: ['values'],
          variables: ['values', 'index'],
          operations: [
            { line: 2, kind: 'loop', text: 'FOR EACH value IN values' },
            { line: 3, kind: 'return', text: 'RETURN value' },
          ],
        },
      }),
    );

    const response = await service.processInput('input');

    expect(response.visualizationData.steps).toEqual([
      expect.objectContaining({ line: 2, explanation: expect.stringContaining('FOR EACH') }),
      expect.objectContaining({ line: 3, explanation: expect.stringContaining('RETURN') }),
    ]);
  });

  it('generates graph nodes and traversal states from an edge list', async () => {
    ingest.mockResolvedValue(
      artifact({
        title: 'Graph BFS',
        statement: 'Traverse graph edges with BFS.',
        examples: [
          { input: 'edges = [[0,1],[0,2],[1,3]], start = 0', output: '[0,1,2,3]' },
        ],
      }),
    );

    const response = await service.processInput('input');
    const finalState = response.visualizationData.steps.at(-1)?.state as {
      nodes: number[];
      visited: number[];
    };

    expect(response.visualizationData.type).toBe('graph');
    expect(finalState.nodes).toEqual([0, 1, 2, 3]);
    expect(finalState.visited).toEqual([0, 1, 2, 3]);
  });

  it('generates tree nodes and edges from level-order input', async () => {
    ingest.mockResolvedValue(
      artifact({
        title: 'Binary Tree Preorder Traversal',
        statement: 'Traverse the binary tree from its root node.',
        examples: [{ input: 'root = [10,5,15,3,7]', output: '[10,5,3,7,15]' }],
      }),
    );

    const response = await service.processInput('input');
    const firstState = response.visualizationData.steps[0].state as {
      nodes: Array<{ id: number; label: string }>;
      edges: Array<{ from: number; to: number }>;
    };

    expect(response.visualizationData.type).toBe('tree');
    expect(firstState.nodes).toHaveLength(5);
    expect(firstState.edges).toEqual(
      expect.arrayContaining([
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
      ]),
    );
  });
});
