import { BadRequestException, Injectable } from '@nestjs/common';

type VisualizationType = 'array' | 'tree' | 'graph' | 'dp' | 'list';
type SourceType = 'url' | 'code' | 'pseudocode' | 'plain_text';

interface PatternProfile {
  id: string;
  title: string;
  category: string;
  visualizationType: VisualizationType;
  keywords: string[];
  codeSignals: string[];
  intuition: string;
  bruteForce: string;
  optimized: string;
  time: string;
  space: string;
  edgeCases: string[];
  mistakes: string[];
  tips: string[];
}

export interface VisualizerResponse {
  pattern: string;
  problemTitle: string;
  category: string;
  metadata: {
    sourceType: SourceType;
    normalizedTitle: string;
    confidence: number;
    assumptions: string[];
    detectedSignals: string[];
  };
  tutorMode: {
    intuition: string;
    bruteForce: string;
    optimized: string;
    complexity: {
      time: string;
      space: string;
    };
    edgeCases: string[];
    commonMistakes: string[];
    interviewTips: string[];
  };
  quiz: Array<{
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }>;
  visualizationData: {
    type: VisualizationType;
    initialState: unknown;
    steps: Array<{
      line?: number;
      explanation: string;
      state: unknown;
      highlights?: {
        active?: number[];
        comparing?: number[];
        swapping?: number[];
        sorted?: number[];
        visited?: number[];
      };
    }>;
  };
}

@Injectable()
export class VisualizerService {
  private readonly profiles: PatternProfile[] = [
    {
      id: 'graph-traversal',
      title: 'Graph Traversal Pattern',
      category: 'Graphs',
      visualizationType: 'graph',
      keywords: ['graph', 'node', 'edge', 'dfs', 'bfs', 'shortest path', 'topological', 'component', 'network'],
      codeSignals: ['adj', 'visited', 'queue', 'stack', 'neighbors', 'edges'],
      intuition: 'Model the input as connected states. At each step, choose a frontier item, mark it, and expand its neighbors while preserving the traversal invariant.',
      bruteForce: 'Explore every possible route without remembering visited state. This is simple but can repeat work or loop on cyclic graphs.',
      optimized: 'Track visited nodes, frontier contents, and distance or parent metadata. Choose DFS, BFS, priority queues, or ordering based on the invariant the problem asks for.',
      time: 'O(V + E) for standard traversal; weighted variants may add priority queue costs.',
      space: 'O(V) for visited state, parent/distance maps, and traversal frontier.',
      edgeCases: ['Disconnected graph', 'Cycle in directed or undirected input', 'Single node graph', 'Repeated edges or self loops'],
      mistakes: ['Marking visited too late', 'Mutating the frontier while iterating over it incorrectly', 'Using BFS where weighted relaxation is required'],
      tips: ['Name the invariant: what makes a node safe to process now?', 'Clarify directed vs undirected edges before coding.'],
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Programming Pattern',
      category: 'Dynamic Programming',
      visualizationType: 'dp',
      keywords: ['dp', 'memo', 'subsequence', 'knapsack', 'ways', 'minimum cost', 'maximum profit', 'recurrence', 'state transition'],
      codeSignals: ['dp[', 'memo[', 'cache', 'recurrence', 'lru_cache'],
      intuition: 'Break the problem into overlapping subproblems, define the state, then fill or memoize answers so each state is solved once.',
      bruteForce: 'Try every choice recursively. This explains the search space but recomputes the same states many times.',
      optimized: 'Define state dimensions, base cases, transition, iteration order, and answer extraction. Compress space when only recent rows or states are required.',
      time: 'O(number of states * transition cost).',
      space: 'O(number of states), reducible when transitions only depend on a small window.',
      edgeCases: ['Empty input', 'Impossible state', 'Boundary row or column', 'Large constraints requiring compression'],
      mistakes: ['Unclear state definition', 'Wrong base case', 'Filling the table in an order that reads unavailable values'],
      tips: ['Say the recurrence out loud before writing loops.', 'Derive bottom-up order from dependency arrows.'],
    },
    {
      id: 'tree-recursion',
      title: 'Tree Recursion Pattern',
      category: 'Trees',
      visualizationType: 'tree',
      keywords: ['tree', 'root', 'leaf', 'bst', 'traversal', 'height', 'ancestor', 'subtree'],
      codeSignals: ['treenode', '.left', '.right', 'root', 'leaf'],
      intuition: 'A tree problem usually asks for local work at a node plus information flowing from children, parent context, or both.',
      bruteForce: 'Recompute subtree facts at each node. It is often easy to reason about but can degrade to quadratic time.',
      optimized: 'Return structured information from each recursive call, or pass context downward, so each node is visited a constant number of times.',
      time: 'O(N) for one pass over the nodes in most traversal solutions.',
      space: 'O(H) recursion stack, where H is tree height.',
      edgeCases: ['Empty tree', 'Single node', 'Skewed tree', 'Duplicate values in BST-like prompts'],
      mistakes: ['Forgetting null base cases', 'Mixing pre-order, in-order, and post-order responsibilities', 'Assuming balanced height'],
      tips: ['Decide whether the answer is built before children, after children, or while passing parent context.'],
    },
    {
      id: 'stack-queue',
      title: 'Stack or Queue Pattern',
      category: 'Stacks and Queues',
      visualizationType: 'list',
      keywords: ['stack', 'queue', 'parentheses', 'monotonic', 'next greater', 'window maximum', 'deque'],
      codeSignals: ['push', 'pop', 'append', 'popleft', 'deque', 'stack'],
      intuition: 'Use an ordered worklist when the most recent item, earliest item, or a monotonic boundary determines the next valid operation.',
      bruteForce: 'For each position, scan backward or forward to find the matching or dominating element.',
      optimized: 'Maintain a stack, queue, or deque whose contents preserve the exact candidates that can still affect future answers.',
      time: 'O(N) when each element is inserted and removed at most once.',
      space: 'O(N) for the auxiliary collection.',
      edgeCases: ['Empty structure access', 'Duplicate priorities', 'Odd-length bracket streams', 'Window boundary expiration'],
      mistakes: ['Popping before checking emptiness', 'Storing values when indices are needed', 'Forgetting to remove expired candidates'],
      tips: ['Explain what each stored item still promises to future steps.'],
    },
    {
      id: 'sequence-search',
      title: 'Sequence and Pointer Pattern',
      category: 'Arrays and Strings',
      visualizationType: 'array',
      keywords: ['array', 'string', 'pointer', 'window', 'search', 'partition', 'prefix', 'suffix', 'hash map', 'two pointer'],
      codeSignals: ['for ', 'while ', 'left', 'right', 'map', 'set', 'index'],
      intuition: 'Track one or more moving boundaries over a sequence. Each movement should discard impossible candidates or record useful prefix knowledge.',
      bruteForce: 'Enumerate all candidate ranges, pairs, or positions and test each one directly.',
      optimized: 'Use pointers, prefix data, hashing, or monotonic boundaries to avoid revisiting candidates that are already known to be invalid.',
      time: 'Usually O(N), O(N log N), or O(N * K) depending on sorting, lookup, and transition work.',
      space: 'O(1) for pure pointers, O(N) when auxiliary maps, sets, or prefix arrays are required.',
      edgeCases: ['Empty sequence', 'Single element', 'Duplicate values', 'Negative numbers or mixed character classes'],
      mistakes: ['Off-by-one boundaries', 'Updating the answer before the window is valid', 'Forgetting duplicate handling'],
      tips: ['Define exactly what the current interval means before changing either boundary.'],
    },
  ];

  async processInput(userInput: string): Promise<VisualizerResponse> {
    if (!userInput || userInput.trim() === '') {
      throw new BadRequestException('Input query cannot be empty');
    }

    const rawInput = userInput.trim();
    const sourceType = this.detectSourceType(rawInput);
    const normalizedTitle = this.normalizeTitle(rawInput, sourceType);
    const classification = this.classify(rawInput);
    const trace = this.createTrace(classification.profile);

    return {
      pattern: classification.profile.title,
      problemTitle: normalizedTitle,
      category: classification.profile.category,
      metadata: {
        sourceType,
        normalizedTitle,
        confidence: classification.confidence,
        assumptions: classification.assumptions,
        detectedSignals: classification.detectedSignals,
      },
      tutorMode: {
        intuition: classification.profile.intuition,
        bruteForce: classification.profile.bruteForce,
        optimized: classification.profile.optimized,
        complexity: {
          time: classification.profile.time,
          space: classification.profile.space,
        },
        edgeCases: classification.profile.edgeCases,
        commonMistakes: classification.profile.mistakes,
        interviewTips: classification.profile.tips,
      },
      quiz: this.createQuiz(classification.profile),
      visualizationData: trace,
    };
  }

  private detectSourceType(input: string): SourceType {
    const lower = input.toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://')) return 'url';
    if (this.looksLikeCode(lower)) return 'code';
    if (lower.includes('for each') || lower.includes('while') || lower.includes('return')) return 'pseudocode';
    return 'plain_text';
  }

  private looksLikeCode(input: string): boolean {
    return [
      'def ',
      'class ',
      'public static',
      'function ',
      '#include',
      'import java',
      'const ',
      'let ',
    ].some((signal) => input.includes(signal));
  }

  private normalizeTitle(input: string, sourceType: SourceType): string {
    if (sourceType === 'url') {
      const path = input.split('?')[0].replace(/\/$/, '');
      const slug = path.split('/').filter(Boolean).pop() ?? 'Imported Problem';
      return this.titleCase(slug.replace(/[-_]/g, ' '));
    }

    const firstLine = input.split(/\r?\n/).find((line) => line.trim()) ?? 'Custom Learning Artifact';
    const compact = firstLine.replace(/\s+/g, ' ').trim();
    return compact.length > 80 ? `${compact.slice(0, 77)}...` : this.titleCase(compact);
  }

  private classify(input: string): {
    profile: PatternProfile;
    confidence: number;
    assumptions: string[];
    detectedSignals: string[];
  } {
    const lower = input.toLowerCase();
    const scored = this.profiles
      .map((profile) => {
        const keywordHits = profile.keywords.filter((keyword) => lower.includes(keyword));
        const codeHits = profile.codeSignals.filter((signal) => lower.includes(signal));
        return {
          profile,
          score: keywordHits.length * 2 + codeHits.length,
          detectedSignals: [...keywordHits, ...codeHits],
        };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    const fallback = this.profiles.find((profile) => profile.id === 'sequence-search') ?? this.profiles[0];

    if (!best || best.score === 0) {
      return {
        profile: fallback,
        confidence: 0.38,
        assumptions: ['No strong pattern-specific signal was found, so AlgoVerse selected a general sequence trace.'],
        detectedSignals: [],
      };
    }

    return {
      profile: best.profile,
      confidence: Math.min(0.92, 0.45 + best.score * 0.09),
      assumptions: ['Classification is heuristic in this scaffold; production should enrich it with AST parsing and catalog lookup.'],
      detectedSignals: best.detectedSignals,
    };
  }

  private createQuiz(profile: PatternProfile): VisualizerResponse['quiz'] {
    return [
      {
        question: `What invariant matters most for the ${profile.category} pattern?`,
        options: [
          'The current state must preserve enough information to make the next step valid.',
          'The input must always be sorted before processing.',
          'Every algorithm should use recursion.',
          'The fastest solution never uses extra memory.',
        ],
        answerIndex: 0,
        explanation: 'A useful visualization and explanation both come from naming the invariant that remains true after each step.',
      },
      {
        question: 'Why are intermediate trace states valuable during interview prep?',
        options: [
          'They replace complexity analysis.',
          'They expose boundary errors, stale state, and wrong update order.',
          'They make all brute-force solutions optimal.',
          'They remove the need for test cases.',
        ],
        answerIndex: 1,
        explanation: 'Most implementation bugs come from state changing at the wrong time or under the wrong condition.',
      },
    ];
  }

  private createTrace(profile: PatternProfile): VisualizerResponse['visualizationData'] {
    switch (profile.visualizationType) {
      case 'graph':
        return {
          type: 'graph',
          initialState: {
            nodes: ['A', 'B', 'C', 'D'],
            edges: [
              { from: 'A', to: 'B', weight: 1 },
              { from: 'A', to: 'C', weight: 1 },
              { from: 'B', to: 'D', weight: 1 },
              { from: 'C', to: 'D', weight: 1 },
            ],
            visited: [],
            frontier: ['A'],
          },
          steps: [
            { line: 1, explanation: 'Initialize the frontier with the chosen start state and keep visited empty.', state: { visited: [], frontier: ['A'] }, highlights: { active: [0] } },
            { line: 2, explanation: 'Remove the next frontier item. Mark it visited before expanding neighbors to avoid repeated work.', state: { visited: ['A'], frontier: ['B', 'C'] }, highlights: { active: [0], visited: [0] } },
            { line: 3, explanation: 'Expand reachable neighbors that are not already visited. Alternative choices depend on DFS, BFS, or priority ordering.', state: { visited: ['A', 'B'], frontier: ['C', 'D'] }, highlights: { active: [1], visited: [0, 1] } },
            { line: 4, explanation: 'Continue until the frontier is empty or the target condition is satisfied.', state: { visited: ['A', 'B', 'C', 'D'], frontier: [] }, highlights: { sorted: [0, 1, 2, 3] } },
          ],
        };
      case 'dp':
        return {
          type: 'dp',
          initialState: {
            stateDefinition: 'dp[i][j] stores the best answer for a prefix/subproblem boundary.',
            grid: [
              [0, 0, 0, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
            ],
          },
          steps: [
            { line: 1, explanation: 'Define state dimensions and initialize base cases.', state: { grid: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] } },
            { line: 2, explanation: 'Fill the first dependent state from its base neighbors.', state: { grid: [[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]] } },
            { line: 3, explanation: 'Apply the recurrence consistently so every cell reads already-computed dependencies.', state: { grid: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 2, 0]] } },
            { line: 4, explanation: 'Extract the answer from the final state or aggregate, then consider whether space can be compressed.', state: { grid: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 2, 3]] } },
          ],
        };
      case 'tree':
        return {
          type: 'tree',
          initialState: { root: 10, traversal: [], callStack: ['visit(10)'] },
          steps: [
            { line: 1, explanation: 'Start at the root. Decide whether this problem needs pre-order, in-order, or post-order information.', state: { traversal: [10], callStack: ['visit(10)'] }, highlights: { active: [1] } },
            { line: 2, explanation: 'Recurse into a child and preserve the parent context on the call stack.', state: { traversal: [10, 5], callStack: ['visit(10)', 'visit(5)'] }, highlights: { active: [2], visited: [1] } },
            { line: 3, explanation: 'Return child information to the parent so the parent can combine local and subtree facts.', state: { traversal: [10, 5, 15], callStack: ['visit(10)', 'visit(15)'] }, highlights: { active: [3], visited: [1, 2] } },
            { line: 4, explanation: 'Finish when every reachable node has contributed exactly once to the answer.', state: { traversal: [10, 5, 15, 3, 7], callStack: [] }, highlights: { visited: [1, 2, 3, 4, 5] } },
          ],
        };
      case 'list':
        return {
          type: 'list',
          initialState: { input: 'stream', stack: [], index: 0 },
          steps: [
            { line: 1, explanation: 'Initialize the auxiliary collection and establish what each stored item represents.', state: { stack: [], index: 0 } },
            { line: 2, explanation: 'Read the next token. Push it when it may affect a future decision.', state: { stack: ['candidate-0'], index: 0 } },
            { line: 3, explanation: 'When the current token resolves or invalidates prior candidates, pop until the invariant is restored.', state: { stack: ['candidate-1'], index: 1 } },
            { line: 4, explanation: 'The remaining collection describes unresolved work, a valid nesting, or the final frontier depending on the prompt.', state: { stack: [], index: 2 } },
          ],
        };
      case 'array':
      default:
        return {
          type: 'array',
          initialState: { array: [4, 1, 7, 3, 6], left: 0, right: 4, best: null },
          steps: [
            { line: 1, explanation: 'Initialize sequence boundaries and summary variables.', state: { array: [4, 1, 7, 3, 6], left: 0, right: 4, best: null }, highlights: { active: [0, 4] } },
            { line: 2, explanation: 'Inspect the active candidates and decide whether the invariant is valid or needs adjustment.', state: { array: [4, 1, 7, 3, 6], left: 0, right: 4, best: 10 }, highlights: { comparing: [0, 4] } },
            { line: 3, explanation: 'Move the boundary that can no longer produce a better or valid answer.', state: { array: [4, 1, 7, 3, 6], left: 1, right: 4, best: 10 }, highlights: { active: [1, 4] } },
            { line: 4, explanation: 'Update the tracked answer and continue until all necessary states have been examined.', state: { array: [4, 1, 7, 3, 6], left: 2, right: 3, best: 10 }, highlights: { sorted: [0, 1, 2, 3, 4] } },
          ],
        };
    }
  }

  private titleCase(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
