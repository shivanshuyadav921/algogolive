/* ═══════════════════════════════════════════════════════
   Input Parser — Detects algorithm from user input
   Handles: algorithm names, URLs, code, plain English
   ═══════════════════════════════════════════════════════ */

import { registry } from './registry.js';

/** URL patterns for known platforms */
const URL_PATTERNS = [
    { platform: 'leetcode', regex: /leetcode\.com\/problems?\/([\w-]+)/i },
    { platform: 'neetcode', regex: /neetcode\.io\/([\w-]+)/i },
    { platform: 'codeforces', regex: /codeforces\.com\/(?:problemset\/)?problem\/(\d+)\/([A-Z])/i },
    { platform: 'geeksforgeeks', regex: /geeksforgeeks\.org\/([^\/\?]+)/i },
    { platform: 'hackerrank', regex: /hackerrank\.com\/challenges?\/([\w-]+)/i },
];

/** Code detection patterns — maps code patterns to algorithm IDs */
const CODE_PATTERNS = [
    { regex: /def\s+merge_sort|void\s+mergeSort|merge\s*\(\s*arr/i, algo: 'merge_sort' },
    { regex: /def\s+quick_sort|void\s+quickSort|partition\s*\(/i, algo: 'quick_sort' },
    { regex: /def\s+bubble_sort|void\s+bubbleSort|bubble/i, algo: 'bubble_sort' },
    { regex: /def\s+insertion_sort|void\s+insertionSort/i, algo: 'insertion_sort' },
    { regex: /def\s+selection_sort|void\s+selectionSort/i, algo: 'selection_sort' },
    { regex: /heap_sort|heapSort|heapify/i, algo: 'heap_sort' },
    { regex: /binary_search|binarySearch|lo\s*,\s*hi|left\s*,\s*right.*mid/i, algo: 'binary_search' },
    { regex: /linear_search|linearSearch|sequential/i, algo: 'linear_search' },
    { regex: /bfs|breadth.first|queue.*visited|from collections import deque.*visited/i, algo: 'bfs' },
    { regex: /dfs|depth.first|def\s+dfs|void\s+dfs/i, algo: 'dfs' },
    { regex: /dijkstra|shortest.path.*priority|heapq.*dist/i, algo: 'dijkstra' },
    { regex: /bellman.ford|relax.*edges/i, algo: 'bellman_ford' },
    { regex: /topological|topo.*sort|in.?degree/i, algo: 'topological_sort' },
    { regex: /kruskal|union.*find.*mst|minimum.*spanning/i, algo: 'kruskal_mst' },
    { regex: /prim.*mst|prim.*minimum/i, algo: 'prim_mst' },
    { regex: /inorder|in.order.*travers/i, algo: 'inorder_traversal' },
    { regex: /preorder|pre.order.*travers/i, algo: 'preorder_traversal' },
    { regex: /postorder|post.order.*travers/i, algo: 'postorder_traversal' },
    { regex: /level.order|bfs.*tree|levelOrder/i, algo: 'level_order_traversal' },
    { regex: /bst.*insert|insert.*bst|binary.*search.*tree.*insert/i, algo: 'bst_insert' },
    { regex: /bst.*search|search.*bst/i, algo: 'bst_search' },
    { regex: /fibonacci|fib\s*\(|memo.*fib|dp.*fib/i, algo: 'fibonacci_dp' },
    { regex: /longest.*common.*subseq|lcs/i, algo: 'lcs' },
    { regex: /knapsack|0\/1.*knapsack/i, algo: 'knapsack' },
    { regex: /longest.*increasing.*subseq|lis\s*\(|patience/i, algo: 'lis' },
    { regex: /coin.*change|min.*coins|fewest.*coins/i, algo: 'coin_change' },
    { regex: /edit.*distance|levenshtein/i, algo: 'edit_distance' },
    { regex: /n.queens|nqueens|place.*queen/i, algo: 'n_queens' },
    { regex: /sudoku.*solv|solve.*sudoku|is.*valid.*board/i, algo: 'sudoku_solver' },
    { regex: /subset|power.*set|generateSubset/i, algo: 'subsets' },
    { regex: /permutation|permute|next.*perm/i, algo: 'permutations' },
    { regex: /kmp|knuth.*morris|failure.*function|lps/i, algo: 'kmp' },
    { regex: /rabin.*karp|rolling.*hash/i, algo: 'rabin_karp' },
    { regex: /two.*sum|twoSum|2sum/i, algo: 'two_sum_sorted' },
    { regex: /three.*sum|threeSum|3sum/i, algo: 'three_sum' },
    { regex: /container.*most.*water|maxArea/i, algo: 'container_water' },
    { regex: /trapping.*rain|trap\s*\(/i, algo: 'trapping_rain_water' },
    { regex: /stack.*push|stack.*pop|class\s+Stack/i, algo: 'stack_operations' },
    { regex: /queue.*enqueue|queue.*dequeue|class\s+Queue/i, algo: 'queue_operations' },
    { regex: /linked.*list|ListNode|head.*next/i, algo: 'linked_list' },
    { regex: /hash.*table|hash.*map|HashMap|dict\s*\{/i, algo: 'hash_table' },
    { regex: /sliding.*window|window.*size/i, algo: 'sliding_window' },
    { regex: /counting.*sort|countSort/i, algo: 'counting_sort' },
];

/** Known LeetCode problem name → algorithm mapping */
const LEETCODE_MAP = {
    'two-sum': 'two_sum_sorted',
    'valid-parentheses': 'stack_operations',
    'merge-two-sorted-lists': 'linked_list',
    'best-time-to-buy-and-sell-stock': 'sliding_window',
    'valid-anagram': 'hash_table',
    'binary-search': 'binary_search',
    'reverse-linked-list': 'linked_list',
    'merge-intervals': 'merge_sort',
    'coin-change': 'coin_change',
    'number-of-islands': 'dfs',
    'longest-substring-without-repeating-characters': 'sliding_window',
    'container-with-most-water': 'container_water',
    'trapping-rain-water': 'trapping_rain_water',
    '3sum': 'three_sum',
    'longest-common-subsequence': 'lcs',
    'edit-distance': 'edit_distance',
    'n-queens': 'n_queens',
    'sudoku-solver': 'sudoku_solver',
    'permutations': 'permutations',
    'subsets': 'subsets',
    'implement-strstr': 'kmp',
    'course-schedule': 'topological_sort',
};

/** Detect whether the input is code */
function isCode(input) {
    const codeIndicators = [
        /\bdef\s+\w+\s*\(/,
        /\bvoid\s+\w+\s*\(/,
        /\bint\s+\w+\s*\(/,
        /\bclass\s+\w+/,
        /\bfunction\s+\w+\s*\(/,
        /\bfor\s*\(.+;.+;/,
        /\bwhile\s*\(/,
        /\breturn\s+/,
        /[{};]\s*$/m,
        /import\s+/,
        /#include/,
        /System\.out/,
        /console\.log/,
        /print\s*\(/,
    ];
    let matches = 0;
    for (const pattern of codeIndicators) {
        if (pattern.test(input)) matches++;
    }
    return matches >= 2;
}

/** Detect whether input is a URL */
function isURL(input) {
    return /^https?:\/\//i.test(input.trim()) || /\b(leetcode|codeforces|geeksforgeeks|neetcode|hackerrank)\b/i.test(input);
}

/** Main input parser */
export class InputParser {
    /**
     * Detect the algorithm from user input.
     * @param {string} input - Raw user input
     * @returns {{ type: string, algorithmId: string|null, plugin: object|null, confidence: number, metadata: object }}
     */
    detect(input) {
        if (!input || !input.trim()) {
            return { type: 'empty', algorithmId: null, plugin: null, confidence: 0, metadata: {} };
        }

        const trimmed = input.trim();

        // 1. Check if it's a URL
        if (isURL(trimmed)) {
            return this.parseURL(trimmed);
        }

        // 2. Check if it's code
        if (isCode(trimmed)) {
            return this.parseCode(trimmed);
        }

        // 3. Try direct name/alias match via registry
        return this.parseName(trimmed);
    }

    parseURL(input) {
        for (const { platform, regex } of URL_PATTERNS) {
            const match = input.match(regex);
            if (match) {
                const slug = match[1].toLowerCase().replace(/_/g, '-');

                // Check known problem map
                if (platform === 'leetcode' && LEETCODE_MAP[slug]) {
                    const plugin = registry.get(LEETCODE_MAP[slug]);
                    if (plugin) {
                        return {
                            type: 'url',
                            algorithmId: plugin.id,
                            plugin,
                            confidence: 85,
                            metadata: { platform, slug }
                        };
                    }
                }

                // Try fuzzy match on slug
                const cleanSlug = slug.replace(/-/g, ' ');
                const plugin = registry.find(cleanSlug);
                if (plugin) {
                    return {
                        type: 'url',
                        algorithmId: plugin.id,
                        plugin,
                        confidence: 70,
                        metadata: { platform, slug }
                    };
                }

                return {
                    type: 'url',
                    algorithmId: null,
                    plugin: null,
                    confidence: 0,
                    metadata: { platform, slug, message: `Detected ${platform} problem "${slug}" but no matching algorithm found in the library.` }
                };
            }
        }

        return {
            type: 'url',
            algorithmId: null,
            plugin: null,
            confidence: 0,
            metadata: { message: 'URL not recognized. Try entering the algorithm name directly.' }
        };
    }

    parseCode(input) {
        for (const { regex, algo } of CODE_PATTERNS) {
            if (regex.test(input)) {
                const plugin = registry.get(algo);
                if (plugin) {
                    return {
                        type: 'code',
                        algorithmId: algo,
                        plugin,
                        confidence: 75,
                        metadata: { detectedPattern: algo }
                    };
                }
            }
        }

        return {
            type: 'code',
            algorithmId: null,
            plugin: null,
            confidence: 0,
            metadata: { message: 'Code detected but algorithm pattern not recognized. Try entering the algorithm name.' }
        };
    }

    parseName(input) {
        const plugin = registry.find(input);
        if (plugin) {
            return {
                type: 'name',
                algorithmId: plugin.id,
                plugin,
                confidence: 90,
                metadata: {}
            };
        }

        // Try searching for partial matches
        const results = registry.search(input);
        if (results.length > 0) {
            return {
                type: 'name',
                algorithmId: results[0].plugin.id,
                plugin: results[0].plugin,
                confidence: results[0].score,
                metadata: { alternatives: results.slice(1, 4).map(r => r.plugin.name) }
            };
        }

        return {
            type: 'name',
            algorithmId: null,
            plugin: null,
            confidence: 0,
            metadata: { message: `No algorithm found matching "${input}". Browse the categories below or try a different name.` }
        };
    }
}

export const parser = new InputParser();
