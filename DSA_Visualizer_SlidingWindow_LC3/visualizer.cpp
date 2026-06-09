/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  LeetCode #3 — Longest Substring Without Repeating Characters        ║
 * ║  Pattern : Sliding Window + HashMap                                  ║
 * ║  Time    : O(n)  |  Space: O(min(m,n))                              ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * COMPILE : g++ -std=c++17 -o visualizer visualizer.cpp
 * RUN     : visualizer.exe          (Windows)
 *           ./visualizer            (Linux/Mac)
 *
 * ─────────────────────────────────────────────────────────────────────
 * PROBLEM STATEMENT:
 *   Given a string s, find the length of the longest substring that
 *   contains NO repeating characters.
 *
 *   Input : "abcabcbb"
 *   Output: 3   (substring "abc")
 *
 *   Input : "bbbbb"
 *   Output: 1   (substring "b")
 *
 *   Input : "pwwkew"
 *   Output: 3   (substring "wke")
 * ─────────────────────────────────────────────────────────────────────
 */

#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <iomanip>
#include <vector>

// ─────────────────────── Utility Helpers ─────────────────────────────

void separator(char c = '-', int w = 62) {
    std::cout << std::string(w, c) << "\n";
}

void printWindow(const std::string& s, int l, int r, int best_l, int best_r) {
    // Print the string with markers
    std::cout << "  String : ";
    for (int i = 0; i < (int)s.size(); ++i) {
        if (i == l && i == r)        std::cout << "[" << s[i] << "]";
        else if (i == l)             std::cout << "[" << s[i];
        else if (i == r)             std::cout << s[i] << "]";
        else if (l <= i && i <= r)   std::cout << s[i];
        else                         std::cout << s[i];
        std::cout << " ";
    }
    std::cout << "\n";

    // Print pointers
    std::cout << "  Index  : ";
    for (int i = 0; i < (int)s.size(); ++i)
        std::cout << std::setw(2) << i << " ";
    std::cout << "\n";

    // Show window
    if (r >= l)
        std::cout << "  Window : \"" << s.substr(l, r - l + 1)
                  << "\"  (len=" << r - l + 1 << ")";
    else
        std::cout << "  Window : \"\" (len=0)";

    if (best_r >= best_l)
        std::cout << "  |  Best: \"" << s.substr(best_l, best_r - best_l + 1)
                  << "\" (len=" << best_r - best_l + 1 << ")";
    std::cout << "\n";
}

// ─────────────────────── APPROACH 1: Brute Force ─────────────────────
/*
 * IDEA: Check every possible substring.
 *       For each pair (i,j), verify if it has all unique characters.
 *
 * TIME : O(n³) — two loops for substrings + O(n) check each
 * SPACE: O(min(m,n)) for the set
 *
 * WHY IT'S BAD: For n=1000, that's 1 billion operations!
 */

bool allUnique(const std::string& s, int l, int r) {
    // Check if s[l..r] has all unique chars using a boolean array
    bool seen[256] = {false};
    for (int i = l; i <= r; ++i) {
        if (seen[(unsigned char)s[i]]) return false;
        seen[(unsigned char)s[i]] = true;
    }
    return true;
}

int bruteForceSolve(const std::string& s, bool verbose = false) {
    int n = (int)s.size();
    int maxLen = 0;
    std::string bestSub = "";

    for (int i = 0; i < n; ++i) {
        for (int j = i; j < n; ++j) {
            if (allUnique(s, i, j)) {
                if (j - i + 1 > maxLen) {
                    maxLen  = j - i + 1;
                    bestSub = s.substr(i, j - i + 1);
                }
                if (verbose)
                    std::cout << "  ✓ \"" << s.substr(i, j-i+1) << "\" is valid (len="
                              << j-i+1 << ")\n";
            } else {
                if (verbose)
                    std::cout << "  ✗ \"" << s.substr(i, j-i+1) << "\" has duplicate\n";
                break; // No point extending further
            }
        }
    }
    return maxLen;
}


// ─────────────────── APPROACH 2: Sliding Window (Optimal) ─────────────
/*
 * IDEA: Use two pointers l and r to define a window.
 *       Expand r; if duplicate found, shrink from l.
 *       Track last-seen index of each char in a hashmap.
 *
 * KEY INSIGHT:
 *   When s[r] is already in the window, we don't need to move l
 *   one step at a time — we can JUMP l directly past the duplicate!
 *
 *   char_map[c] stores the LAST INDEX where c was seen.
 *   New l = max(l, char_map[c] + 1)
 *   The max() ensures l never moves backward.
 *
 * TIME : O(n)  — each character visited at most twice (l and r)
 * SPACE: O(min(m,n)) — hashmap stores at most charset size entries
 */

int slidingWindowSolve(const std::string& s, bool verbose = false) {
    int n = (int)s.size();
    if (n == 0) return 0;

    // char_map[c] = last index where character c was seen
    std::unordered_map<char, int> char_map;

    int l       = 0;    // left boundary of window (inclusive)
    int best    = 0;    // best length found so far
    int best_l  = 0;    // left  index of best window
    int best_r  = -1;   // right index of best window

    if (verbose) {
        separator();
        std::cout << "[SLIDING WINDOW DRY RUN]\n";
        separator();
        std::cout << "  Input: \"" << s << "\"\n\n";
    }

    for (int r = 0; r < n; ++r) {
        char c = s[r];

        // ── STEP 1: Check if duplicate exists in current window ─────────
        // WHY: char_map[c] >= l means c is within [l..r-1]
        if (char_map.count(c) && char_map[c] >= l) {
            if (verbose) {
                std::cout << "\nStep r=" << r << ": s[r]='" << c << "'\n";
                std::cout << "  ⚠ DUPLICATE! '" << c << "' last seen at index "
                          << char_map[c] << " (inside window)\n";
                std::cout << "  Move l: " << l << " → " << char_map[c] + 1 << "\n";
            }
            // ── STEP 2: Jump l past the duplicate ─────────────────────
            // WHY: All indices from l to char_map[c] now invalidated.
            //      We jump in O(1) instead of sliding one-by-one.
            l = char_map[c] + 1;
        } else {
            if (verbose) {
                std::cout << "\nStep r=" << r << ": s[r]='" << c
                          << "' — NEW char, expand window\n";
            }
        }

        // ── STEP 3: Record latest position of this character ────────────
        // WHY: Always update so future lookups reflect the freshest index.
        char_map[c] = r;

        // ── STEP 4: Update best if current window is longer ─────────────
        int win_len = r - l + 1;
        if (win_len > best) {
            best   = win_len;
            best_l = l;
            best_r = r;
            if (verbose)
                std::cout << "  ⭐ NEW BEST: \"" << s.substr(l, win_len)
                          << "\" (len=" << win_len << ")\n";
        }

        if (verbose)
            printWindow(s, l, r, best_l, best_r);
    }

    return best;
}


// ─────────────────── APPROACH 3: Optimized for ASCII ──────────────────
/*
 * IDEA: Replace unordered_map with a fixed-size array of 128.
 *       Array lookup is O(1) with zero hashing overhead.
 *
 * Use case: When charset is known (ASCII/lowercase letters only).
 * TIME : O(n)  — same as approach 2
 * SPACE: O(1)  — fixed 128-element array (constant, not input-dependent)
 */

int optimizedSolve(const std::string& s) {
    int n = (int)s.size();
    if (n == 0) return 0;

    // index_map[c] = last seen index + 1 (0 means not seen)
    int index_map[128] = {0};
    int best = 0;
    int l    = 0;

    for (int r = 0; r < n; ++r) {
        int c = (unsigned char)s[r];
        // If char was seen and is in current window, jump l
        // index_map stores last_index + 1, so if index_map[c] > l, char is in window
        l = std::max(l, index_map[c]);
        best = std::max(best, r - l + 1);
        index_map[c] = r + 1;   // store r+1 so 0 means "not seen"
    }
    return best;
}


// ───────────────────── Performance Comparison ─────────────────────────

void compareApproaches(const std::string& s) {
    separator('═');
    std::cout << "[APPROACH COMPARISON]\n";
    separator('═');

    std::cout << "\n  Input: \"" << s << "\" (n=" << s.size() << ")\n\n";

    // Brute force
    std::cout << "  1. Brute Force (O(n³)):\n";
    int bf = bruteForceSolve(s, false);
    std::cout << "     Result = " << bf << "\n\n";

    // Sliding window
    std::cout << "  2. Sliding Window / HashMap (O(n)):\n";
    int sw = slidingWindowSolve(s, false);
    std::cout << "     Result = " << sw << "\n\n";

    // Optimized
    std::cout << "  3. Optimized Array (O(n), O(1) space):\n";
    int op = optimizedSolve(s);
    std::cout << "     Result = " << op << "\n\n";

    std::cout << "  All approaches agree: " << (bf == sw && sw == op ? "✓ YES" : "✗ NO") << "\n\n";

    separator();
    std::cout << "  ┌─────────────────┬──────────┬────────────┐\n";
    std::cout << "  │  Approach       │  Time    │  Space     │\n";
    std::cout << "  ├─────────────────┼──────────┼────────────┤\n";
    std::cout << "  │  Brute Force    │  O(n³)   │  O(m)      │\n";
    std::cout << "  │  Sliding Window │  O(n)    │  O(m)      │\n";
    std::cout << "  │  Array Lookup   │  O(n)    │  O(1)      │\n";
    std::cout << "  └─────────────────┴──────────┴────────────┘\n";
    std::cout << "  m = size of charset (26 / 128 / 256)\n\n";
}


// ──────────────────────── Edge Cases ──────────────────────────────────

void runEdgeCases() {
    separator('═');
    std::cout << "[EDGE CASES]\n";
    separator('═');

    std::vector<std::pair<std::string,int>> cases = {
        {"",          0},    // empty string
        {"a",         1},    // single character
        {"aa",        1},    // all same
        {"ab",        2},    // all unique
        {"abcabcbb",  3},    // classic
        {"pwwkew",    3},    // tricky end
        {"dvdf",      3},    // jump over duplicate
        {"abcde",     5},    // all unique
        {"aab",       2},    // starts with dup
        {" ",         1},    // space character
        {"au",        2},    // two unique chars
    };

    std::cout << "\n  " << std::left << std::setw(18) << "Input"
              << std::setw(10) << "Expected"
              << std::setw(10) << "Got"
              << "Status\n";
    separator('-', 50);

    bool all_pass = true;
    for (auto& [s, expected] : cases) {
        int got = optimizedSolve(s);
        bool pass = (got == expected);
        if (!pass) all_pass = false;
        std::cout << "  \"" << std::setw(16) << s << "\"  "
                  << std::setw(10) << expected
                  << std::setw(10) << got
                  << (pass ? "✓ PASS" : "✗ FAIL") << "\n";
    }
    std::cout << "\n  All tests: " << (all_pass ? "✓ PASSED" : "✗ SOME FAILED") << "\n\n";
}


// ───────────────────────────── main ───────────────────────────────────

int main() {
    separator('═');
    std::cout << "  LC #3 — Longest Substring Without Repeating Characters\n";
    std::cout << "  Sliding Window + HashMap | O(n) Time | O(m) Space\n";
    separator('═');

    // ── DRY RUN with verbose output ────────────────────────────────────
    std::string input = "abcabcbb";
    std::cout << "\n[VERBOSE DRY RUN]\n";
    int result = slidingWindowSolve(input, true);

    separator();
    std::cout << "\n  ANSWER: " << result << "\n";

    // ── Compare all approaches ─────────────────────────────────────────
    std::cout << "\n";
    compareApproaches("abcabcbb");
    compareApproaches("pwwkew");
    compareApproaches("dvdf");

    // ── Edge cases ────────────────────────────────────────────────────
    runEdgeCases();

    // ── Interview tips ────────────────────────────────────────────────
    separator('═');
    std::cout << "[INTERVIEW INSIGHTS]\n";
    separator('═');
    std::cout << R"(
  KEY PATTERNS TO RECOGNIZE:
  • "longest/shortest substring with condition" → Sliding Window
  • "no repeating characters" → HashSet or HashMap
  • "at most K distinct characters" → Sliding Window variant
  • "minimum window containing all chars" → LC #76, same pattern

  CRITICAL INSIGHT (often missed in interviews):
  • l = max(l, char_map[c] + 1) — the max() is CRUCIAL
  • Without max(), l could move BACKWARD if a char appears
    early in the string and then again outside the window.

  Example: "dvdf"
    d→0, v→1, d→2: without max(), l would go to 0+1=1
    But l is already at 1! max(1, 0+1)=1 — correct.
    Then f→3: window=[1,3]="vdf", length=3 ✓

  COMMON MISTAKES:
  • Using a Set instead of Map (can't jump l efficiently)
  • Forgetting the max() guard
  • Not handling empty string
  • Counting length as r-l instead of r-l+1

)";
    separator('═');
    std::cout << "  Run python visualizer.py for animated GUI!\n";
    separator('═');
    return 0;
}
