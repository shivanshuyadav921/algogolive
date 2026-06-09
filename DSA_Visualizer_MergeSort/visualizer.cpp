/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║        MERGE SORT — Complete C++ Implementation                  ║
 * ║        With Full Dry-Run Comments & Line-by-Line Explanation     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * COMPILE:  g++ -std=c++17 -o visualizer visualizer.cpp
 * RUN:      ./visualizer          (Linux/Mac)
 *           visualizer.exe        (Windows)
 *
 * ALGORITHM OVERVIEW:
 *   Merge Sort is a Divide & Conquer algorithm.
 *   1. DIVIDE  : Split array into two halves
 *   2. CONQUER : Recursively sort each half
 *   3. MERGE   : Merge two sorted halves into one sorted array
 *
 * TIME  COMPLEXITY:  O(n log n) — Best, Average, Worst
 * SPACE COMPLEXITY:  O(n)      — Auxiliary space for merge
 * STABLE?            YES       — Equal elements maintain relative order
 */

#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <iomanip>
#include <chrono>

// ─────────────────────── Utility: Print Array ─────────────────────────

/**
 * @brief Prints the array with optional highlight indices.
 * @param arr     The array to display
 * @param n       Size of the array
 * @param hi      Index to highlight as [L]eft pointer  (-1 = none)
 * @param hj      Index to highlight as [R]ight pointer (-1 = none)
 * @param prefix  Optional label before the array
 */
void printArray(const std::vector<int>& arr, int n,
                int hi = -1, int hj = -1,
                const std::string& prefix = "  Array") {
    std::cout << prefix << " [ ";
    for (int k = 0; k < n; ++k) {
        if (k == hi)       std::cout << "\033[33m" << arr[k] << "\033[0m";  // yellow
        else if (k == hj)  std::cout << "\033[36m" << arr[k] << "\033[0m";  // cyan
        else               std::cout << arr[k];
        if (k < n - 1)     std::cout << ", ";
    }
    std::cout << " ]" << std::endl;
}

/**
 * @brief Prints a separator line with an optional title.
 */
void separator(const std::string& title = "", char ch = '─') {
    std::cout << std::string(60, ch);
    if (!title.empty()) std::cout << " " << title;
    std::cout << std::endl;
}

// ─────────────────────── Core: MERGE Function ─────────────────────────

/**
 * @brief Merges two sorted subarrays arr[l..mid] and arr[mid+1..r].
 *
 * DRY RUN EXAMPLE:
 *   Input:  arr = [3, 27, 38, 1, 9, 43]   l=0, mid=2, r=5
 *   Left:   [3, 27, 38]
 *   Right:  [1, 9, 43]
 *
 *   Step 1: Compare left[0]=3  vs right[0]=1  → place 1  → merged=[1]
 *   Step 2: Compare left[0]=3  vs right[1]=9  → place 3  → merged=[1,3]
 *   Step 3: Compare left[1]=27 vs right[1]=9  → place 9  → merged=[1,3,9]
 *   Step 4: Compare left[1]=27 vs right[2]=43 → place 27 → merged=[1,3,9,27]
 *   Step 5: Compare left[2]=38 vs right[2]=43 → place 38 → merged=[1,3,9,27,38]
 *   Step 6: Copy remaining right[2]=43        → place 43 → merged=[1,3,9,27,38,43]
 *
 * @param arr  The array being sorted (modified in-place)
 * @param l    Left boundary index
 * @param mid  Middle index (end of left subarray)
 * @param r    Right boundary index
 */
void merge(std::vector<int>& arr, int l, int mid, int r) {
    // ─── Step 1: Create temporary subarrays ───────────────────────
    int n1 = mid - l + 1;          // size of left half
    int n2 = r - mid;               // size of right half

    std::vector<int> left(n1);      // temporary left array
    std::vector<int> right(n2);     // temporary right array

    // ─── Step 2: Copy data into temp arrays ───────────────────────
    for (int i = 0; i < n1; ++i)
        left[i] = arr[l + i];       // copy left half from arr

    for (int j = 0; j < n2; ++j)
        right[j] = arr[mid + 1 + j]; // copy right half from arr

    // Pointers for left[], right[], and merged position in arr[]
    int i = 0;   // pointer into left[]
    int j = 0;   // pointer into right[]
    int k = l;   // pointer into original arr[]

    std::cout << "\n  ┌─ MERGE arr[" << l << ".." << r << "]" << std::endl;
    std::cout << "  │  Left  = [ ";
    for (int x = 0; x < n1; ++x) std::cout << left[x] << (x < n1-1?", ":"");
    std::cout << " ]" << std::endl;
    std::cout << "  │  Right = [ ";
    for (int x = 0; x < n2; ++x) std::cout << right[x] << (x < n2-1?", ":"");
    std::cout << " ]" << std::endl;

    // ─── Step 3: Compare and merge ────────────────────────────────
    while (i < n1 && j < n2) {
        // WHY: We compare the current smallest of each half
        //      and pick the smaller one to place into arr[]
        std::cout << "  │  Compare left[" << i << "]=" << left[i]
                  << " vs right[" << j << "]=" << right[j];

        if (left[i] <= right[j]) {
            // Left element is smaller or equal → place it
            // NOTE: <= (not <) ensures STABILITY:
            //       equal elements from left come before right
            arr[k] = left[i];
            std::cout << " → place " << left[i] << " (left wins)\n";
            ++i;
        } else {
            // Right element is smaller → place it
            arr[k] = right[j];
            std::cout << " → place " << right[j] << " (right wins)\n";
            ++j;
        }
        ++k; // advance merged position
    }

    // ─── Step 4: Copy remaining left elements (if any) ─────────────
    // WHY: When right[] is exhausted but left[] still has elements,
    //      those elements are already in sorted order, just append them.
    while (i < n1) {
        arr[k] = left[i];
        std::cout << "  │  Copy remaining left[" << i << "]=" << left[i] << "\n";
        ++i; ++k;
    }

    // ─── Step 5: Copy remaining right elements (if any) ────────────
    // WHY: Symmetric to above — when left[] is exhausted.
    while (j < n2) {
        arr[k] = right[j];
        std::cout << "  │  Copy remaining right[" << j << "]=" << right[j] << "\n";
        ++j; ++k;
    }

    // Print merged result
    std::cout << "  └─ Merged result: [ ";
    for (int x = l; x <= r; ++x) std::cout << arr[x] << (x < r ? ", " : "");
    std::cout << " ] ✓\n";
}


// ─────────────────────── Core: MERGE SORT Function ────────────────────

/**
 * @brief Recursively sorts arr[l..r] using Merge Sort.
 *
 * RECURSION TREE for [38, 27, 43, 3]:
 *
 *                [38, 27, 43, 3]
 *               /               \
 *          [38, 27]           [43, 3]
 *          /      \           /      \
 *        [38]    [27]       [43]    [3]
 *          \      /           \      /
 *          [27, 38]           [3, 43]
 *               \               /
 *             [3, 27, 38, 43]
 *
 * @param arr   Array to sort
 * @param l     Left boundary (start index)
 * @param r     Right boundary (end index)
 * @param depth Recursion depth (for indented logging)
 */
void mergeSort(std::vector<int>& arr, int l, int r, int depth = 0) {
    // ─── BASE CASE ──────────────────────────────────────────────────
    // WHY: A single element is already sorted by definition.
    //      This is where the recursion "bottoms out".
    if (l >= r) {
        std::cout << std::string(depth * 2, ' ')
                  << "Base: arr[" << l << "]=" << arr[l] << " (already sorted)\n";
        return;
    }

    // ─── DIVIDE ─────────────────────────────────────────────────────
    // WHY: We find the midpoint to split the array into two halves.
    //      Using (l + r) / 2 is safe because l and r are both non-negative
    //      and we avoid integer overflow (safe form: l + (r-l)/2).
    int mid = l + (r - l) / 2;

    std::string indent(depth * 2, ' ');
    std::cout << indent << "Divide arr[" << l << ".." << r
              << "] → arr[" << l << ".." << mid
              << "] | arr[" << mid + 1 << ".." << r << "]\n";

    // ─── CONQUER (Recursive Calls) ───────────────────────────────────
    // WHY: We must sort the left half BEFORE the right half before merging.
    //      Each half is halved again until we reach base cases.
    mergeSort(arr, l,     mid, depth + 1);   // sort left  half recursively
    mergeSort(arr, mid+1, r,   depth + 1);   // sort right half recursively

    // ─── COMBINE (Merge) ─────────────────────────────────────────────
    // WHY: Both halves are now sorted. We merge them into one sorted range.
    merge(arr, l, mid, r);
}


// ─────────────────────── Analysis Functions ───────────────────────────

/**
 * @brief Counts comparisons made during merge sort (without printing).
 */
long long countComparisons(std::vector<int> arr, int l, int r) {
    if (l >= r) return 0;
    int mid = l + (r - l) / 2;
    long long cnt = 0;

    // count from left and right recursion
    cnt += countComparisons(arr, l,     mid);
    cnt += countComparisons(arr, mid+1, r  );

    // count comparisons in merge
    std::vector<int> left(arr.begin() + l, arr.begin() + mid + 1);
    std::vector<int> right(arr.begin() + mid + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < (int)left.size() && j < (int)right.size()) {
        ++cnt;
        if (left[i] <= right[j]) { arr[k] = left[i++]; }
        else                     { arr[k] = right[j++]; }
        ++k;
    }
    while (i < (int)left.size()) { arr[k++] = left[i++]; }
    while (j < (int)right.size()) { arr[k++] = right[j++]; }
    return cnt;
}


// ─────────────────────── Main Program ─────────────────────────────────

int main() {
    // ════════════════════════════════════════════════════════════════
    // SECTION 1: BANNER
    // ════════════════════════════════════════════════════════════════
    separator("", '═');
    std::cout << "         MERGE SORT — DSA Visualizer (C++ Edition)\n";
    std::cout << "         Divide & Conquer | Stable | O(n log n)\n";
    separator("", '═');

    // ════════════════════════════════════════════════════════════════
    // SECTION 2: SAMPLE INPUT
    // ════════════════════════════════════════════════════════════════
    std::vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    int n = arr.size();

    std::cout << "\n[INPUT]  Original Array:\n";
    printArray(arr, n, -1, -1, "  Array");
    std::cout << "  Size: " << n << " elements\n";
    std::cout << "  Max recursion depth: log₂(" << n << ") = "
              << (int)std::ceil(std::log2(n)) << "\n";

    // ════════════════════════════════════════════════════════════════
    // SECTION 3: DRY RUN (Step-by-Step)
    // ════════════════════════════════════════════════════════════════
    separator();
    std::cout << "[DRY RUN]  Step-by-step execution:\n\n";
    std::cout << "  Recursion format: Depth increases with each '  ' indent\n";
    std::cout << "  Comparisons are highlighted inside each merge step\n\n";

    std::vector<int> arrCopy = arr;   // sort a copy, keep original
    long long comparisons = countComparisons(arr, 0, n - 1);

    auto startTime = std::chrono::high_resolution_clock::now();
    mergeSort(arrCopy, 0, n - 1);
    auto endTime = std::chrono::high_resolution_clock::now();

    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(endTime - startTime);

    // ════════════════════════════════════════════════════════════════
    // SECTION 4: RESULT
    // ════════════════════════════════════════════════════════════════
    separator();
    std::cout << "\n[RESULT]  Sorted Array:\n";
    printArray(arrCopy, n, -1, -1, "  Array");

    // ════════════════════════════════════════════════════════════════
    // SECTION 5: COMPLEXITY REPORT
    // ════════════════════════════════════════════════════════════════
    separator();
    std::cout << "\n[COMPLEXITY REPORT]\n\n";
    std::cout << "  ┌────────────────────────────────────────────┐\n";
    std::cout << "  │  Time Complexity                            │\n";
    std::cout << "  │    Best Case    : O(n log n)               │\n";
    std::cout << "  │    Average Case : O(n log n)               │\n";
    std::cout << "  │    Worst Case   : O(n log n)               │\n";
    std::cout << "  │  Space Complexity : O(n) [aux arrays]      │\n";
    std::cout << "  │  Stable           : YES                    │\n";
    std::cout << "  │  In-Place         : NO                     │\n";
    std::cout << "  ├────────────────────────────────────────────┤\n";
    std::cout << "  │  Actual Stats (this run):                  │\n";
    std::cout << "  │    Input size   : " << std::setw(5) << n
              << "                   │\n";
    std::cout << "  │    Comparisons  : " << std::setw(5) << comparisons
              << "                   │\n";
    std::cout << "  │    Runtime      : " << std::setw(5) << duration.count()
              << " μs               │\n";
    std::cout << "  └────────────────────────────────────────────┘\n";

    // ════════════════════════════════════════════════════════════════
    // SECTION 6: PRACTICE PROBLEMS
    // ════════════════════════════════════════════════════════════════
    separator();
    std::cout << "\n[PRACTICE PROBLEMS]\n\n";
    std::cout << "  EASY:\n";
    std::cout << "    1. LC 88  - Merge Sorted Array\n";
    std::cout << "    2. LC 21  - Merge Two Sorted Lists\n\n";
    std::cout << "  MEDIUM:\n";
    std::cout << "    3. LC 148 - Sort List (Linked List Merge Sort)\n";
    std::cout << "    4. LC 315 - Count of Smaller Numbers After Self\n\n";
    std::cout << "  HARD:\n";
    std::cout << "    5. LC 493 - Reverse Pairs\n\n";

    // ════════════════════════════════════════════════════════════════
    // SECTION 7: INTERVIEW TIPS
    // ════════════════════════════════════════════════════════════════
    separator();
    std::cout << "\n[INTERVIEW TIPS]\n\n";
    std::cout << "  ✓ Merge Sort is STABLE (Quick Sort is NOT)\n";
    std::cout << "  ✓ Preferred for LINKED LISTS (no random access needed)\n";
    std::cout << "  ✓ Guaranteed O(n log n) worst case (Quick Sort is O(n²) worst)\n";
    std::cout << "  ✓ External sorting uses Merge Sort (data doesn't fit in RAM)\n";
    std::cout << "  ✗ Requires O(n) extra space (unlike Quick Sort's in-place option)\n\n";

    std::cout << "  COMMON MISTAKES:\n";
    std::cout << "    • Using mid = (l+r)/2 without overflow protection\n";
    std::cout << "      → Fix: mid = l + (r-l)/2\n";
    std::cout << "    • Forgetting to copy remaining elements after main while loop\n";
    std::cout << "    • Off-by-one errors in merge boundaries\n\n";

    separator("", '═');
    std::cout << "  Run python visualizer.py for the animated GUI version!\n";
    separator("", '═');
    std::cout << std::endl;

    return 0;
}
