# ⚡ DSA Visualizer — Merge Sort
### Complete Interactive Learning Environment

```
 ______  ______  ______  ______  ______    ______  ______  ______  ______  
|  38  ||  27  ||  43  ||   3  ||   9  |  |   1  ||   3  ||   9  || 10   |
|______||______||______||______||______|  |______||______||______||______|
         UNSORTED ARRAY              →          SORTED ARRAY
```

---

## 📋 Table of Contents
1. [Problem Statement](#1-problem-statement)
2. [Intuition](#2-intuition)
3. [Brute-Force Approach](#3-brute-force-approach)
4. [Optimized Approach — Merge Sort](#4-optimized-approach--merge-sort)
5. [Approach Comparison](#5-approach-comparison)
6. [When to Use Merge Sort](#6-when-to-use-merge-sort)
7. [Interview Patterns](#7-interview-patterns)
8. [Dry Run](#8-dry-run)
9. [Complexity Analysis](#9-complexity-analysis)
10. [Common Mistakes & Edge Cases](#10-common-mistakes--edge-cases)
11. [Practice Problems](#11-practice-problems)
12. [Quiz — Test Yourself](#12-quiz--test-yourself)
13. [How to Run](#13-how-to-run)
14. [Project Structure](#14-project-structure)

---

## 1. Problem Statement

> **Given** an unsorted array of integers,  
> **Return** the same array sorted in ascending order.

```
Input:  [38, 27, 43, 3, 9, 82, 10]
Output: [3, 9, 10, 27, 38, 43, 82]
```

---

## 2. Intuition

Imagine you have a **deck of shuffled playing cards**.

The simplest mental model for Merge Sort:

1. **Divide** the deck into two halves repeatedly until you have individual cards.
2. **Compare** two individual cards — putting them in order takes O(1).
3. **Merge** two ordered piles: always pick the smaller top card from either pile.
4. **Repeat** merging upward until the entire deck is sorted.

This is the classic **Divide & Conquer** strategy:
- A large, hard problem is broken into smaller, easier sub-problems.
- Each sub-problem is solved independently.
- Solutions are combined to form the final answer.

---

## 3. Brute-Force Approach

### Bubble Sort (O(n²))

The brute-force approach scans the entire array repeatedly:

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):          # n passes
        for j in range(n-i-1): # compare adjacent
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]  # swap
    return arr
```

**Problems:**
- ❌ O(n²) time — disastrous for large inputs
- ❌ Makes many unnecessary comparisons
- ✅ O(1) space — in-place
- ✅ Stable

---

## 4. Optimized Approach — Merge Sort

### Core Idea: Divide, Conquer, Merge

```python
def merge_sort(arr):
    if len(arr) <= 1:           # BASE CASE
        return arr

    mid = len(arr) // 2        # DIVIDE
    left  = merge_sort(arr[:mid])    # CONQUER left
    right = merge_sort(arr[mid:])    # CONQUER right

    return merge(left, right)   # COMBINE

def merge(left, right):
    result = []
    i = j  = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:   # <= ensures STABILITY
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])    # remaining left elements
    result.extend(right[j:])   # remaining right elements
    return result
```

**Why it's better:**
- ✅ O(n log n) guaranteed — even worst case
- ✅ Stable sort
- ✅ Predictable performance
- ❌ O(n) extra space

---

## 5. Approach Comparison

| Property         | Bubble Sort  | Merge Sort      |
|:-----------------|:-------------|:----------------|
| Best Case        | O(n)         | O(n log n)      |
| Average Case     | O(n²)        | O(n log n)      |
| Worst Case       | O(n²)        | **O(n log n)**  |
| Space            | O(1)         | O(n)            |
| Stable?          | ✅ Yes       | ✅ Yes          |
| In-Place?        | ✅ Yes       | ❌ No           |
| Adaptive?        | ✅ Yes       | ❌ No           |

> **Verdict**: For n > 1000, Merge Sort is always preferred. Bubble Sort is only acceptable for tiny arrays or nearly-sorted data.

---

## 6. When to Use Merge Sort

| Scenario                                     | Use Merge Sort? |
|:---------------------------------------------|:----------------|
| Large datasets                                | ✅ Yes          |
| Need guaranteed O(n log n) worst case         | ✅ Yes          |
| Sorting **linked lists**                      | ✅ Yes (best!)  |
| External sorting (data doesn't fit in RAM)    | ✅ Yes          |
| Need stable sort (preserving equal order)     | ✅ Yes          |
| Memory is tightly constrained                 | ❌ No (O(n) space)|
| Small arrays (n < 20)                         | ❌ No (use insertion sort)|

---

## 7. Interview Patterns

Merge Sort appears in interviews under these disguises:

| Pattern                          | Example Problem                            |
|:---------------------------------|:-------------------------------------------|
| **Merge K Sorted Lists**         | LC 23 — Merge K Sorted Lists               |
| **Count Inversions**             | Count pairs where arr[i] > arr[j], i < j   |
| **Reverse Pairs**                | LC 493 — Reverse Pairs                     |
| **Smallest Range from K Lists**  | LC 632                                     |
| **External Sort**                | System design: sort 1 TB of data           |
| **Stable sort needed**           | Sort by multiple keys                      |

**Key interview insight:** Merge Sort is the go-to when you need to count something *while sorting* — because during the merge step, you have positional information about elements from both halves.

---

## 8. Dry Run

### Input: `[38, 27, 43, 3]`

```
Step 0: [38, 27, 43, 3]         ← Start
         ↑DIVIDE at mid=1

Step 1: [38, 27] | [43, 3]      ← Two halves
         ↑Divide  ↑Divide

Step 2: [38][27] | [43][3]      ← Base cases (single elements)
         ↑Base   ↑Base  ↑Base  ↑Base

Step 3: MERGE [38] and [27]
  Compare 38 vs 27 → 27 wins → place 27
  Remaining: [38]  → place 38
  Result: [27, 38]              ← Left half sorted!

Step 4: MERGE [43] and [3]
  Compare 43 vs 3  → 3 wins  → place 3
  Remaining: [43]  → place 43
  Result: [3, 43]              ← Right half sorted!

Step 5: MERGE [27, 38] and [3, 43]
  Compare 27 vs 3  → 3 wins  → place 3     → [3]
  Compare 27 vs 43 → 27 wins → place 27    → [3, 27]
  Compare 38 vs 43 → 38 wins → place 38    → [3, 27, 38]
  Remaining: [43]  → place 43              → [3, 27, 38, 43]

Final: [3, 27, 38, 43]          ← Sorted! ✓
```

---

## 9. Complexity Analysis

### Time Complexity

```
Recurrence: T(n) = 2T(n/2) + O(n)
            ↑split into 2    ↑merge takes O(n)

By Master Theorem (case 2):
  T(n) = O(n log n)
```

| Case         | Complexity    | Reason                                |
|:-------------|:--------------|:--------------------------------------|
| Best Case    | O(n log n)    | Even sorted arrays need full merge    |
| Average Case | O(n log n)    | Always log n levels, n work per level |
| Worst Case   | O(n log n)    | Guaranteed — no bad pivots            |

### Space Complexity

| Component          | Space         |
|:-------------------|:--------------|
| Temporary arrays   | O(n)          |
| Call stack depth   | O(log n)      |
| **Total**          | **O(n)**      |

---

## 10. Common Mistakes & Edge Cases

### Common Mistakes

1. **Integer overflow in mid calculation**
   ```cpp
   // ❌ Wrong (can overflow for large l, r):
   int mid = (l + r) / 2;

   // ✅ Correct:
   int mid = l + (r - l) / 2;
   ```

2. **Forgetting to copy remaining elements**
   ```python
   # After the while loop, one half may have leftovers
   result.extend(left[i:])   # ← Don't forget this!
   result.extend(right[j:])  # ← Or this!
   ```

3. **Using < instead of <= in stability check**
   ```python
   # ❌ Unstable (equal elements from right may come first):
   if left[i] < right[j]:

   # ✅ Stable:
   if left[i] <= right[j]:
   ```

### Edge Cases

| Edge Case           | Input         | Expected Output |
|:--------------------|:--------------|:----------------|
| Empty array         | `[]`          | `[]`            |
| Single element      | `[1]`         | `[1]`           |
| Already sorted      | `[1,2,3,4]`   | `[1,2,3,4]`     |
| Reverse sorted      | `[4,3,2,1]`   | `[1,2,3,4]`     |
| All duplicates      | `[3,3,3,3]`   | `[3,3,3,3]`     |
| Two elements        | `[5, 1]`      | `[1, 5]`        |
| Negative numbers    | `[-3, 1, -1]` | `[-3,-1,1]`     |

---

## 11. Practice Problems

### 🟢 Easy

1. **LC 88 — Merge Sorted Array**
   > Given two sorted arrays `nums1` and `nums2`, merge `nums2` into `nums1` in-place.
   - Hint: Start merging from the end to avoid overwriting elements.

2. **LC 21 — Merge Two Sorted Lists**
   > Merge two sorted linked lists into one sorted linked list.
   - Hint: Use a dummy head node and compare node values.

### 🟡 Medium

3. **LC 148 — Sort List**
   > Sort a linked list in O(n log n) time using O(1) space.
   - Hint: Find the middle using slow/fast pointers, then merge sort.

4. **LC 315 — Count of Smaller Numbers After Self**
   > For each element, count how many elements to its right are smaller.
   - Hint: Modify merge step to count inversions.

### 🔴 Hard

5. **LC 493 — Reverse Pairs**
   > Count pairs (i, j) where i < j and nums[i] > 2 × nums[j].
   - Hint: During merge, count pairs from left half vs right half using two pointers.

---

## 12. Quiz — Test Yourself

### Conceptual Questions
1. Why is Merge Sort preferred over Quick Sort for linked lists?
2. What does "stable sort" mean? Give a real-world example where it matters.
3. Why does Merge Sort always have O(n log n) worst case while Quick Sort can be O(n²)?

### Dry-Run Questions
4. Trace Merge Sort on `[5, 2, 8, 1, 9]`. Write each recursive call and merge step.
5. How many comparisons does merging `[1, 3, 5]` and `[2, 4, 6]` require?

### Complexity Questions
6. What is the recurrence relation for Merge Sort? Solve it using Master Theorem.
7. If n = 1,000,000, how many operations does O(n log n) represent?

### Edge-Case Questions
8. What happens if you apply Merge Sort to an already-sorted array? Is it wasteful?
9. Can Merge Sort be made in-place? What would be the trade-off?

> Type `SHOW ANSWERS` to reveal solutions.

---

## 13. How to Run

### Python Visualizer (Animated GUI)

```bash
# Windows
python visualizer.py

# Linux / Mac
python3 visualizer.py
```

**Controls:**
| Button/Control     | Action                              |
|:-------------------|:------------------------------------|
| ▶ Play             | Auto-play through all steps         |
| ⏸ Pause           | Pause auto-play                     |
| ⏭ Next            | Advance one step forward            |
| ⏮ Prev            | Go back one step                    |
| ↺ Reset            | Return to step 0                    |
| Speed Slider       | Control playback speed (slow/fast)  |
| Preset Buttons     | Load different test arrays          |
| Custom Array Input | Type your own: `5,3,8,1,9`          |

### C++ Console Version

```bash
# Compile
g++ -std=c++17 -o visualizer visualizer.cpp

# Run
./visualizer          # Linux/Mac
visualizer.exe        # Windows
```

---

## 14. Project Structure

```
DSA_Visualizer_MergeSort/
├── visualizer.py       ← Python Tkinter animated visualizer (GUI)
├── visualizer.cpp      ← C++ fully-commented implementation
├── README.md           ← This file — complete learning guide
├── requirements.txt    ← Python dependencies
└── sample_input.txt    ← Sample test array
```

---

## 📚 Further Reading

- [Merge Sort on Wikipedia](https://en.wikipedia.org/wiki/Merge_sort)
- [LeetCode #88 — Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/)
- [LeetCode #148 — Sort List](https://leetcode.com/problems/sort-list/)
- [Visualgo — Merge Sort Animation](https://visualgo.net/en/sorting)

---

*Generated by Ultimate DSA Visualizer | Algorithm: Merge Sort*
