import { BadRequestException, Injectable } from '@nestjs/common';
import { IngestionService } from '../ingestion/ingestion.service';
import {
  LearningArtifact,
  SourceType,
} from '../ingestion/learning-artifact';

type VisualizationType = 'array' | 'tree' | 'graph' | 'dp' | 'list';

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

interface PatternRule {
  id: string;
  title: string;
  category: string;
  visualizationType: VisualizationType;
  profileId: string;
  titleSignals: string[];
  textSignals: string[];
  codeSignals: string[];
}

interface LearningRecipe {
  title: string;
  recognition: string;
  invariant: string;
  steps: Array<{
    title: string;
    instruction: string;
  }>;
  validation: string[];
}

interface ProgressiveHint {
  level: number;
  title: string;
  content: string;
}

export interface VisualizerResponse {
  artifact: LearningArtifact;
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
    recipe: LearningRecipe;
    hints: ProgressiveHint[];
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
  constructor(private readonly ingestionService: IngestionService) {}

  private readonly rules: PatternRule[] = [
    {
      id: 'binary-search',
      title: 'Binary Search Pattern',
      category: 'Binary Search',
      visualizationType: 'array',
      profileId: 'sequence-search',
      titleSignals: ['binary search', 'search sorted', 'find in rotated sorted'],
      textSignals: ['sorted array', 'search space', 'logarithmic', 'lower bound', 'upper bound'],
      codeSignals: ['mid', 'left <= right', 'right = mid - 1', 'left = mid + 1'],
    },
    {
      id: 'sliding-window',
      title: 'Sliding Window Pattern',
      category: 'Arrays and Strings',
      visualizationType: 'array',
      profileId: 'sequence-search',
      titleSignals: ['sliding window', 'longest substring', 'minimum window', 'maximum window'],
      textSignals: ['contiguous subarray', 'contiguous substring', 'window size', 'at most k'],
      codeSignals: ['window', 'left', 'right', 'while'],
    },
    {
      id: 'two-pointers',
      title: 'Two Pointers Pattern',
      category: 'Arrays and Strings',
      visualizationType: 'array',
      profileId: 'sequence-search',
      titleSignals: ['two pointers', 'container with most water', 'three sum', 'valid palindrome'],
      textSignals: ['two pointers', 'from both ends', 'sorted array'],
      codeSignals: ['left', 'right', 'left++', 'right--'],
    },
    {
      id: 'hashing',
      title: 'Hash Map / Set Pattern',
      category: 'Hashing',
      visualizationType: 'array',
      profileId: 'sequence-search',
      titleSignals: ['two sum', 'group anagrams', 'contains duplicate', 'frequency map'],
      textSignals: ['hash map', 'hash set', 'frequency', 'complement', 'lookup'],
      codeSignals: ['unordered_map', 'hashmap', 'new map', 'new set', 'seen', 'dictionary'],
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Programming Pattern',
      category: 'Dynamic Programming',
      visualizationType: 'dp',
      profileId: 'dynamic-programming',
      titleSignals: ['dynamic programming', 'longest common subsequence', 'coin change', 'knapsack'],
      textSignals: ['overlapping subproblems', 'minimum cost', 'maximum profit', 'number of ways', 'subsequence'],
      codeSignals: ['dp[', 'memo', 'cache', 'lru_cache'],
    },
    {
      id: 'graph-traversal',
      title: 'Graph Traversal Pattern',
      category: 'Graphs',
      visualizationType: 'graph',
      profileId: 'graph-traversal',
      titleSignals: ['graph', 'course schedule', 'number of islands', 'network delay'],
      textSignals: ['vertices', 'edges', 'connected component', 'shortest path', 'topological'],
      codeSignals: ['adjacency', 'neighbors', 'visited', 'bfs', 'dfs'],
    },
    {
      id: 'tree-recursion',
      title: 'Tree Recursion Pattern',
      category: 'Trees',
      visualizationType: 'tree',
      profileId: 'tree-recursion',
      titleSignals: ['binary tree', 'binary search tree', 'lowest common ancestor', 'tree traversal'],
      textSignals: ['root node', 'leaf node', 'subtree', 'tree height'],
      codeSignals: ['treenode', '.left', '.right'],
    },
    {
      id: 'stack',
      title: 'Stack Pattern',
      category: 'Stacks',
      visualizationType: 'list',
      profileId: 'stack-queue',
      titleSignals: ['valid parentheses', 'monotonic stack', 'next greater', 'largest rectangle'],
      textSignals: ['last in first out', 'matching brackets', 'monotonic stack'],
      codeSignals: ['stack', '.push', '.pop'],
    },
    {
      id: 'queue',
      title: 'Queue / Deque Pattern',
      category: 'Queues',
      visualizationType: 'list',
      profileId: 'stack-queue',
      titleSignals: ['queue', 'sliding window maximum', 'level order'],
      textSignals: ['first in first out', 'deque', 'level order'],
      codeSignals: ['queue', 'deque', 'popleft', 'shift()'],
    },
    {
      id: 'backtracking',
      title: 'Backtracking Pattern',
      category: 'Backtracking',
      visualizationType: 'tree',
      profileId: 'tree-recursion',
      titleSignals: ['backtracking', 'permutations', 'subsets', 'combination sum', 'n queens'],
      textSignals: ['all combinations', 'all permutations', 'choose and unchoose'],
      codeSignals: ['backtrack', 'path.pop', 'remove last'],
    },
    {
      id: 'sorting',
      title: 'Sorting Pattern',
      category: 'Sorting',
      visualizationType: 'array',
      profileId: 'sequence-search',
      titleSignals: ['sort', 'merge sort', 'quick sort', 'insertion sort'],
      textSignals: ['sorted order', 'stable sort', 'partition'],
      codeSignals: ['.sort', 'sorted(', 'merge(', 'partition('],
    },
    {
      id: 'prefix-sum',
      title: 'Prefix Sum Pattern',
      category: 'Arrays',
      visualizationType: 'array',
      profileId: 'sequence-search',
      titleSignals: ['prefix sum', 'range sum', 'subarray sum equals'],
      textSignals: ['range sum', 'cumulative sum', 'subarray sum'],
      codeSignals: ['prefix', 'running_sum', 'cumulative'],
    },
    {
      id: 'heap',
      title: 'Heap / Priority Queue Pattern',
      category: 'Heaps',
      visualizationType: 'tree',
      profileId: 'tree-recursion',
      titleSignals: ['kth largest', 'top k frequent', 'merge k sorted'],
      textSignals: ['priority queue', 'min heap', 'max heap', 'top k'],
      codeSignals: ['priority_queue', 'heapq', 'minheap', 'maxheap'],
    },
    {
      id: 'union-find',
      title: 'Union Find Pattern',
      category: 'Graphs',
      visualizationType: 'graph',
      profileId: 'graph-traversal',
      titleSignals: ['union find', 'disjoint set', 'redundant connection'],
      textSignals: ['disjoint set', 'connected components'],
      codeSignals: ['parent[', 'find(', 'union(', 'rank['],
    },
    {
      id: 'sequence-search',
      title: 'Sequence and Pointer Pattern',
      category: 'Arrays and Strings',
      visualizationType: 'array',
      profileId: 'sequence-search',
      titleSignals: ['array', 'string', 'sequence'],
      textSignals: ['array', 'string', 'index', 'subarray', 'substring'],
      codeSignals: ['for', 'while', 'index'],
    },
  ];

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

    const artifact = await this.ingestionService.ingest(userInput);
    const classification = this.classify(artifact);
    const trace = this.createTrace(
      artifact,
      classification.rule,
      classification.profile,
    );
    const recipe = this.createRecipe(
      artifact,
      classification.rule,
      classification.profile,
      classification.detectedSignals,
    );

    return {
      artifact,
      pattern: classification.rule.title,
      problemTitle: artifact.title,
      category: classification.rule.category,
      metadata: {
        sourceType: artifact.sourceType,
        normalizedTitle: artifact.title,
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
        recipe,
        hints: this.createHints(
          artifact,
          classification.rule,
          recipe,
          classification.detectedSignals,
        ),
      },
      quiz: this.createQuiz(classification.profile),
      visualizationData: trace,
    };
  }

  private classify(artifact: LearningArtifact): {
    rule: PatternRule;
    profile: PatternProfile;
    confidence: number;
    assumptions: string[];
    detectedSignals: string[];
  } {
    const title = `${artifact.title} ${artifact.slug ?? ''}`.toLowerCase();
    const text = [
      artifact.statement,
      artifact.category,
      ...artifact.topics,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const code = artifact.rawInput.toLowerCase();
    const scored = this.rules
      .map((rule) => {
        const titleHits = rule.titleSignals.filter((signal) =>
          this.hasSignal(title, signal),
        );
        const textHits = rule.textSignals.filter((signal) =>
          this.hasSignal(text, signal),
        );
        const codeHits =
          artifact.sourceType === 'code' || artifact.sourceType === 'pseudocode'
            ? rule.codeSignals.filter((signal) => this.hasSignal(code, signal))
            : [];
        return {
          rule,
          score: titleHits.length * 6 + textHits.length * 3 + codeHits.length * 2,
          detectedSignals: [...titleHits, ...textHits, ...codeHits],
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          this.rules.indexOf(a.rule) - this.rules.indexOf(b.rule),
      );

    const best = scored[0];
    const fallbackRule =
      this.rules.find((rule) => rule.id === 'sequence-search') ?? this.rules[0];
    const selectedRule = best?.score > 0 ? best.rule : fallbackRule;
    const profile =
      this.profiles.find((item) => item.id === selectedRule.profileId) ??
      this.profiles[0];

    if (!best || best.score === 0) {
      return {
        rule: fallbackRule,
        profile,
        confidence: 0.3,
        assumptions: ['No strong pattern-specific signal was found, so AlgoVerse selected a general sequence trace.'],
        detectedSignals: [],
      };
    }

    const secondScore = scored[1]?.score ?? 0;
    const margin = best.score - secondScore;
    return {
      rule: best.rule,
      profile,
      confidence: Math.min(0.98, 0.5 + best.score * 0.025 + margin * 0.015),
      assumptions:
        margin <= 2
          ? ['Multiple patterns have similar evidence; the highest weighted match was selected.']
          : [],
      detectedSignals: best.detectedSignals,
    };
  }

  private hasSignal(haystack: string, signal: string): boolean {
    const escaped = signal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const startsWithWord = /^[a-z0-9_]/i.test(signal);
    const endsWithWord = /[a-z0-9_]$/i.test(signal);
    return new RegExp(
      `${startsWithWord ? '\\b' : ''}${escaped}${endsWithWord ? '\\b' : ''}`,
      'i',
    ).test(haystack);
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

  private createRecipe(
    artifact: LearningArtifact,
    rule: PatternRule,
    profile: PatternProfile,
    detectedSignals: string[],
  ): LearningRecipe {
    const patternGuidance: Record<
      string,
      { invariant: string; setup: string; transition: string; finish: string }
    > = {
      'binary-search': {
        invariant:
          'If the target exists, it remains inside the inclusive search interval.',
        setup: 'Set left and right to the boundaries of the ordered search space.',
        transition:
          'Inspect the midpoint and discard the half that cannot contain the target.',
        finish:
          'Return immediately on a match; otherwise stop when the interval is empty.',
      },
      'sliding-window': {
        invariant:
          'The active window contains exactly the state needed to decide whether it is valid.',
        setup: 'Initialize both boundaries and the frequency or summary state for an empty window.',
        transition:
          'Expand the right boundary, then shrink the left boundary until validity is restored.',
        finish: 'Update the answer only while the window satisfies the problem condition.',
      },
      'two-pointers': {
        invariant:
          'Every pointer movement permanently eliminates candidates that cannot improve the answer.',
        setup: 'Place pointers at the ends or at the first two meaningful sequence positions.',
        transition:
          'Compare the active values and move the pointer justified by the ordering invariant.',
        finish: 'Stop when the pointers meet, cross, or produce the requested result.',
      },
      hashing: {
        invariant:
          'The map or set contains exactly the previously processed facts needed for constant-time lookup.',
        setup: 'Choose the key and stored value that answer the future lookup question.',
        transition:
          'Check for the needed key before inserting the current item when self-use is forbidden.',
        finish: 'Return the stored match or the required aggregate after one pass.',
      },
      'dynamic-programming': {
        invariant:
          'Every computed state has all dependencies available and represents one precise subproblem.',
        setup: 'Define state dimensions and initialize all base cases.',
        transition: 'Apply the recurrence in an order that respects dependency direction.',
        finish: 'Read the requested state and compress memory only when dependencies allow it.',
      },
      'graph-traversal': {
        invariant:
          'Every discovered node is recorded before it can be added to the frontier again.',
        setup: 'Build or identify adjacency, initialize visited state, and seed the frontier.',
        transition: 'Remove one frontier node, process it, and add undiscovered neighbors.',
        finish: 'Stop when the target is reached or the frontier is empty.',
      },
      'tree-recursion': {
        invariant:
          'Each recursive call returns a clearly defined fact about exactly one subtree.',
        setup: 'Define the null-node base case and the value returned by a subtree.',
        transition: 'Recurse into children, then combine child results with local node state.',
        finish: 'Return the root result or update the global answer at the correct traversal phase.',
      },
      stack: {
        invariant:
          'The stack stores unresolved items in the order required to resolve the newest one first.',
        setup: 'Initialize an empty stack and define what each entry represents.',
        transition: 'Push unresolved items and pop only when the current item resolves or invalidates them.',
        finish: 'Use the remaining stack to determine validity or unresolved work.',
      },
      queue: {
        invariant:
          'The queue contains pending work in the exact order it must be processed.',
        setup: 'Seed the queue and mark the initial state as discovered.',
        transition: 'Remove from the front, process it, and append newly discovered work.',
        finish: 'Stop when the queue is empty or the target condition is met.',
      },
      backtracking: {
        invariant:
          'The current path represents one valid partial candidate before the next choice is made.',
        setup: 'Initialize the path and define the completion and rejection conditions.',
        transition: 'Choose an option, recurse, then undo that choice before trying the next option.',
        finish: 'Record a copy of each complete valid candidate.',
      },
      sorting: {
        invariant:
          'The processed region satisfies the algorithm-specific ordering guarantee.',
        setup: 'Identify the sortable range and any temporary storage or pivot state.',
        transition: 'Compare, move, partition, or merge elements while preserving the guarantee.',
        finish: 'Stop when every region is reduced or merged into sorted order.',
      },
      'prefix-sum': {
        invariant:
          'Each prefix entry summarizes all values before or through one boundary consistently.',
        setup: 'Initialize the neutral prefix value before the first element.',
        transition: 'Extend the running aggregate and store or query prior prefix values.',
        finish: 'Answer each range by subtracting the appropriate prefix boundaries.',
      },
      heap: {
        invariant:
          'The heap root is always the next minimum or maximum candidate required by the problem.',
        setup: 'Choose min-heap or max-heap semantics and seed the candidate set.',
        transition: 'Push new candidates and remove the root when it is selected or exceeds the size bound.',
        finish: 'Read the root or consume the heap until the requested rank or merge is complete.',
      },
      'union-find': {
        invariant:
          'Each node points toward a representative for its current connected component.',
        setup: 'Initialize every node as its own parent with rank or size metadata.',
        transition: 'Find compressed roots and union different components by rank or size.',
        finish: 'Use representative equality or component count to produce the result.',
      },
      'sequence-search': {
        invariant:
          'The maintained state summarizes all processed values needed for the next decision.',
        setup: 'Define the iteration boundaries and answer accumulator.',
        transition: 'Process one state at a time and update the accumulator without losing required history.',
        finish: 'Return the accumulator after all required states are examined.',
      },
    };
    const guidance =
      patternGuidance[rule.id] ?? patternGuidance['sequence-search'];
    const steps: LearningRecipe['steps'] = [
      {
        title: 'Model the input',
        instruction: this.inputInstruction(artifact),
      },
      {
        title: 'Initialize state',
        instruction: guidance.setup,
      },
    ];

    const parsedOperations = artifact.algorithm?.operations ?? [];
    if (parsedOperations.length > 0) {
      steps.push(
        ...parsedOperations.slice(0, 6).map((operation, index) => ({
          title: `Apply operation ${index + 1}`,
          instruction: `Line ${operation.line}: ${operation.text}`,
        })),
      );
    } else {
      steps.push({
        title: 'Apply the transition',
        instruction: guidance.transition,
      });
    }
    steps.push({
      title: 'Finish and return',
      instruction: guidance.finish,
    });

    const evidence =
      detectedSignals.length > 0
        ? `Signals: ${[...new Set(detectedSignals)].slice(0, 5).join(', ')}.`
        : 'No strong named signal was present, so the general sequence workflow is used.';

    return {
      title: `${artifact.title}: ${rule.title}`,
      recognition: `${evidence} ${profile.intuition}`,
      invariant: guidance.invariant,
      steps,
      validation: [
        ...artifact.constraints.slice(0, 4),
        ...profile.edgeCases,
      ].filter((item, index, values) => values.indexOf(item) === index),
    };
  }

  private inputInstruction(artifact: LearningArtifact): string {
    const parameters = artifact.algorithm?.parameters ?? [];
    if (parameters.length > 0) {
      return `Treat ${parameters.join(', ')} as the explicit inputs and preserve their stated roles.`;
    }
    if (artifact.examples.length > 0) {
      return `Use the first example (${artifact.examples[0].input}) to dry-run the state before generalizing.`;
    }
    return 'Identify the input collection, target values, and required output before choosing mutable state.';
  }

  private createHints(
    artifact: LearningArtifact,
    rule: PatternRule,
    recipe: LearningRecipe,
    detectedSignals: string[],
  ): ProgressiveHint[] {
    const signal =
      [...new Set(detectedSignals)][0] ??
      artifact.topics[0] ??
      rule.category;
    const setupStep =
      recipe.steps.find((step) => step.title === 'Initialize state') ??
      recipe.steps[1];
    const transitionStep =
      recipe.steps.find((step) => step.title === 'Apply the transition') ??
      recipe.steps.find((step) => step.title.startsWith('Apply operation'));

    return [
      {
        level: 1,
        title: 'Recognize the pattern',
        content: `Focus on "${signal}". Which ${rule.title.toLowerCase()} invariant would let you avoid rechecking discarded work?`,
      },
      {
        level: 2,
        title: 'Name the invariant',
        content: recipe.invariant,
      },
      {
        level: 3,
        title: 'Choose the state',
        content:
          setupStep?.instruction ??
          'Identify the smallest state that preserves the invariant after each step.',
      },
      {
        level: 4,
        title: 'Apply the update',
        content:
          transitionStep?.instruction ??
          recipe.steps[recipe.steps.length - 1].instruction,
      },
    ];
  }

  private createTrace(
    artifact: LearningArtifact,
    rule: PatternRule,
    profile: PatternProfile,
  ): VisualizerResponse['visualizationData'] {
    if (rule.id === 'binary-search') {
      const trace = this.createBinarySearchTrace(artifact);
      if (trace) return trace;
    }
    if (rule.id === 'hashing') {
      const trace = this.createTwoSumTrace(artifact);
      if (trace) return trace;
    }
    if (rule.id === 'stack') {
      const trace = this.createParenthesesTrace(artifact);
      if (trace) return trace;
    }
    if (rule.id === 'dynamic-programming') {
      const trace = this.createLcsTrace(artifact);
      if (trace) return trace;
    }
    if (rule.id === 'graph-traversal') {
      const trace = this.createGraphTraversalTrace(artifact);
      if (trace) return trace;
    }
    if (rule.id === 'tree-recursion') {
      const trace = this.createTreeTraversalTrace(artifact);
      if (trace) return trace;
    }

    const operationTrace = this.createOperationTrace(artifact, rule);
    if (operationTrace) return operationTrace;

    return this.createGenericTrace({
      ...profile,
      visualizationType: rule.visualizationType,
    });
  }

  private createBinarySearchTrace(
    artifact: LearningArtifact,
  ): VisualizerResponse['visualizationData'] | null {
    const input = this.concreteInput(artifact);
    const array = this.extractFirstNumberArray(input);
    const targetMatch = input.match(/\btarget\s*=\s*(-?\d+(?:\.\d+)?)/i);
    const target = targetMatch ? Number(targetMatch[1]) : undefined;
    if (!array || target === undefined || array.length === 0) return null;

    const steps: VisualizerResponse['visualizationData']['steps'] = [];
    let left = 0;
    let right = array.length - 1;
    steps.push({
      explanation: `Initialize the inclusive search interval [${left}, ${right}] for target ${target}.`,
      state: { array, left, right, target, result: null },
      highlights: { active: [left, right] },
    });

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      steps.push({
        explanation: `Inspect index ${mid}, where the value is ${array[mid]}.`,
        state: { array, left, right, mid, target, result: null },
        highlights: { comparing: [mid], active: [left, right] },
      });
      if (array[mid] === target) {
        steps.push({
          explanation: `The midpoint value equals ${target}; return index ${mid}.`,
          state: { array, left, right, mid, target, result: mid },
          highlights: { sorted: [mid] },
        });
        return { type: 'array', initialState: steps[0].state, steps };
      }
      if (array[mid] < target) {
        left = mid + 1;
        steps.push({
          explanation: `The midpoint value is too small, so discard indices through ${mid}.`,
          state: { array, left, right, target, result: null },
          highlights: { active: left <= right ? [left, right] : [] },
        });
      } else {
        right = mid - 1;
        steps.push({
          explanation: `The midpoint value is too large, so discard indices from ${mid} onward.`,
          state: { array, left, right, target, result: null },
          highlights: { active: left <= right ? [left, right] : [] },
        });
      }
    }

    steps.push({
      explanation: `The interval is empty, so target ${target} is not present.`,
      state: { array, left, right, target, result: -1 },
      highlights: {},
    });
    return { type: 'array', initialState: steps[0].state, steps };
  }

  private createTwoSumTrace(
    artifact: LearningArtifact,
  ): VisualizerResponse['visualizationData'] | null {
    const input = this.concreteInput(artifact);
    const array = this.extractFirstNumberArray(input);
    const targetMatch = input.match(/\btarget\s*=\s*(-?\d+(?:\.\d+)?)/i);
    const target = targetMatch ? Number(targetMatch[1]) : undefined;
    if (!array || target === undefined || array.length === 0) return null;

    const seen = new Map<number, number>();
    const steps: VisualizerResponse['visualizationData']['steps'] = [
      {
        explanation: `Initialize an empty value-to-index map for target ${target}.`,
        state: { array, target, index: -1, seen: {}, result: null },
        highlights: {},
      },
    ];

    for (let index = 0; index < array.length; index++) {
      const value = array[index];
      const complement = target - value;
      steps.push({
        explanation: `At index ${index}, look for complement ${complement} before storing ${value}.`,
        state: {
          array,
          target,
          index,
          value,
          complement,
          seen: Object.fromEntries(seen),
          result: null,
        },
        highlights: { comparing: [index] },
      });
      if (seen.has(complement)) {
        const firstIndex = seen.get(complement)!;
        steps.push({
          explanation: `Complement ${complement} was stored at index ${firstIndex}; return [${firstIndex}, ${index}].`,
          state: {
            array,
            target,
            index,
            seen: Object.fromEntries(seen),
            result: [firstIndex, index],
          },
          highlights: { sorted: [firstIndex, index] },
        });
        return { type: 'array', initialState: steps[0].state, steps };
      }
      seen.set(value, index);
    }

    steps.push({
      explanation: 'No pair produced the target sum.',
      state: { array, target, seen: Object.fromEntries(seen), result: [] },
      highlights: {},
    });
    return { type: 'array', initialState: steps[0].state, steps };
  }

  private createParenthesesTrace(
    artifact: LearningArtifact,
  ): VisualizerResponse['visualizationData'] | null {
    const input = this.concreteInput(artifact);
    const value = input.match(/["']([()[\]{}]+)["']/)?.[1];
    if (!value) return null;

    const stack: string[] = [];
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    const steps: VisualizerResponse['visualizationData']['steps'] = [
      {
        explanation: 'Initialize an empty stack for unresolved opening brackets.',
        state: { input: value, stack: [], index: -1, valid: null },
      },
    ];

    for (let index = 0; index < value.length; index++) {
      const token = value[index];
      if (!pairs[token]) {
        stack.push(token);
        steps.push({
          explanation: `Push opening bracket ${token} at index ${index}.`,
          state: { input: value, stack: [...stack], index, valid: null },
        });
        continue;
      }
      const opened = stack.pop();
      const valid = opened === pairs[token];
      steps.push({
        explanation: valid
          ? `Closing bracket ${token} matches ${opened}; remove the resolved opening bracket.`
          : `Closing bracket ${token} does not match the latest opening bracket.`,
        state: { input: value, stack: [...stack], index, valid },
      });
      if (!valid) return { type: 'list', initialState: steps[0].state, steps };
    }

    steps.push({
      explanation:
        stack.length === 0
          ? 'The stack is empty, so every bracket was matched.'
          : 'Opening brackets remain unresolved, so the input is invalid.',
      state: { input: value, stack: [...stack], index: value.length, valid: stack.length === 0 },
    });
    return { type: 'list', initialState: steps[0].state, steps };
  }

  private createLcsTrace(
    artifact: LearningArtifact,
  ): VisualizerResponse['visualizationData'] | null {
    if (!/longest common subsequence/i.test(`${artifact.title} ${artifact.statement}`)) {
      return null;
    }
    const quoted = this.concreteInput(artifact)
      .match(/["']([^"']*)["']/g)
      ?.map((value) => value.slice(1, -1));
    if (!quoted || quoted.length < 2) return null;
    const [left, right] = quoted;
    const grid = Array.from({ length: left.length + 1 }, () =>
      Array(right.length + 1).fill(0),
    );
    const steps: VisualizerResponse['visualizationData']['steps'] = [
      {
        explanation: 'Initialize the extra base row and column to zero.',
        state: { grid: grid.map((row) => [...row]), left, right },
      },
    ];

    for (let row = left.length - 1; row >= 0; row--) {
      for (let column = right.length - 1; column >= 0; column--) {
        grid[row][column] =
          left[row] === right[column]
            ? 1 + grid[row + 1][column + 1]
            : Math.max(grid[row + 1][column], grid[row][column + 1]);
        steps.push({
          explanation:
            left[row] === right[column]
              ? `${left[row]} matches ${right[column]}; take one plus the diagonal state.`
              : `${left[row]} and ${right[column]} differ; take the better adjacent subproblem.`,
          state: {
            grid: grid.map((values) => [...values]),
            left,
            right,
            activeCell: [row, column],
          },
        });
      }
    }
    return { type: 'dp', initialState: steps[0].state, steps };
  }

  private createOperationTrace(
    artifact: LearningArtifact,
    rule: PatternRule,
  ): VisualizerResponse['visualizationData'] | null {
    const operations = artifact.algorithm?.operations;
    if (!operations?.length) return null;
    const array = this.extractFirstNumberArray(this.concreteInput(artifact)) ?? [];
    const steps = operations.map((operation, index) => ({
      line: operation.line,
      explanation: `Execute ${operation.kind}: ${operation.text}`,
      state: {
        array,
        operationIndex: index,
        operation: operation.text,
        variables: artifact.algorithm?.variables ?? [],
      },
      highlights:
        array.length > 0
          ? { active: [Math.min(index, array.length - 1)] }
          : undefined,
    }));
    return {
      type: rule.visualizationType,
      initialState: steps[0].state,
      steps,
    };
  }

  private createGraphTraversalTrace(
    artifact: LearningArtifact,
  ): VisualizerResponse['visualizationData'] | null {
    const input = this.concreteInput(artifact);
    const match = input.match(
      /\[\s*\[\s*-?\d+\s*,\s*-?\d+\s*\](?:\s*,\s*\[\s*-?\d+\s*,\s*-?\d+\s*\])*\s*\]/,
    );
    if (!match) return null;

    let pairs: number[][];
    try {
      pairs = JSON.parse(match[0]);
    } catch {
      return null;
    }
    if (
      !Array.isArray(pairs) ||
      pairs.length === 0 ||
      !pairs.every(
        (edge) =>
          Array.isArray(edge) &&
          edge.length === 2 &&
          edge.every((node) => typeof node === 'number'),
      )
    ) {
      return null;
    }

    const nodes = [...new Set(pairs.flat())].sort((a, b) => a - b);
    const edges = pairs.map(([from, to]) => ({ from, to }));
    const adjacency = new Map<number, number[]>();
    for (const node of nodes) adjacency.set(node, []);
    for (const [from, to] of pairs) {
      adjacency.get(from)?.push(to);
      adjacency.get(to)?.push(from);
    }

    const startMatch = input.match(/\bstart\s*=\s*(-?\d+)/i);
    const start = startMatch ? Number(startMatch[1]) : nodes[0];
    if (!adjacency.has(start)) return null;
    const queue = [start];
    const discovered = new Set([start]);
    const visited: number[] = [];
    const steps: VisualizerResponse['visualizationData']['steps'] = [
      {
        explanation: `Start breadth-first traversal at node ${start}.`,
        state: { nodes, edges, visited: [], frontier: [...queue] },
        highlights: { active: [start] },
      },
    ];

    while (queue.length > 0) {
      const node = queue.shift()!;
      visited.push(node);
      for (const neighbor of adjacency.get(node) ?? []) {
        if (!discovered.has(neighbor)) {
          discovered.add(neighbor);
          queue.push(neighbor);
        }
      }
      steps.push({
        explanation: `Visit node ${node}; enqueue each undiscovered neighbor.`,
        state: { nodes, edges, visited: [...visited], frontier: [...queue] },
        highlights: { active: [node], visited: [...visited] },
      });
    }
    return { type: 'graph', initialState: steps[0].state, steps };
  }

  private createTreeTraversalTrace(
    artifact: LearningArtifact,
  ): VisualizerResponse['visualizationData'] | null {
    const input = this.concreteInput(artifact);
    const match = input.match(
      /\[\s*(?:-?\d+|null)(?:\s*,\s*(?:-?\d+|null))*\s*\]/i,
    );
    if (!match) return null;

    let values: Array<number | null>;
    try {
      values = JSON.parse(match[0]);
    } catch {
      return null;
    }
    if (values.length === 0 || values[0] === null) return null;

    const nodes = values.flatMap((value, index) =>
      value === null ? [] : [{ id: index, label: String(value) }],
    );
    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = nodes.flatMap((node) => {
      const children = [node.id * 2 + 1, node.id * 2 + 2];
      return children
        .filter((child) => nodeIds.has(child))
        .map((child) => ({ from: node.id, to: child }));
    });
    const order: number[] = [];
    const visit = (id: number) => {
      if (!nodeIds.has(id)) return;
      order.push(id);
      visit(id * 2 + 1);
      visit(id * 2 + 2);
    };
    visit(0);

    const visited: number[] = [];
    const steps = order.map((id, index) => {
      visited.push(id);
      return {
        explanation: `Visit node ${nodes.find((node) => node.id === id)?.label} in pre-order and preserve its child subproblems.`,
        state: { nodes, edges, visited: [...visited], active: id },
        highlights: { active: [id], visited: [...visited] },
        line: index + 1,
      };
    });
    return { type: 'tree', initialState: steps[0].state, steps };
  }

  private concreteInput(artifact: LearningArtifact): string {
    return artifact.examples[0]?.input || artifact.rawInput;
  }

  private extractFirstNumberArray(input: string): number[] | null {
    const match = input.match(/\[\s*-?\d+(?:\.\d+)?(?:\s*,\s*-?\d+(?:\.\d+)?)*\s*\]/);
    if (!match) return null;
    try {
      const value = JSON.parse(match[0]);
      return Array.isArray(value) && value.every((item) => typeof item === 'number')
        ? value
        : null;
    } catch {
      return null;
    }
  }

  private createGenericTrace(profile: PatternProfile): VisualizerResponse['visualizationData'] {
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

}
