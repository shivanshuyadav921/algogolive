import { PrismaClient, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AlgoVerse database...');

  // Clean existing entries
  await prisma.starterCode.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.note.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.user.deleteMany();

  // Create initial demo user
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo Candidate',
      email: 'demo@algoverse.com',
      passwordHash: await bcrypt.hash('AlgoVerseDemo2026!', 10),
      streak: {
        create: {
          current: 5,
          longest: 12,
        },
      },
    },
  });

  console.log('Created Demo User:', demoUser.email);

  // Define problem datasets
  const problems = [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: Difficulty.EASY,
      category: 'Arrays',
      leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
      neetcodeSheet: true,
      blind75Sheet: true,
      grind169Sheet: true,
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
      testCases: [
        { input: '[2,7,11,15]\n9', output: '[0,1]' },
        { input: '[3,2,4]\n6', output: '[1,2]' },
        { input: '[3,3]\n6', output: '[0,1]' },
      ],
      starterCodes: [
        {
          language: 'python',
          code: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for index, value in enumerate(nums):\n        complement = target - value\n        if complement in seen:\n            return [seen[complement], index]\n        seen[value] = index\n    return []',
        },
        {
          language: 'cpp',
          code: '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (seen.count(complement)) return {seen[complement], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};',
        },
        {
          language: 'javascript',
          code: 'function twoSum(nums, target) {\n  const seen = new Map();\n  for (let index = 0; index < nums.length; index++) {\n    const complement = target - nums[index];\n    if (seen.has(complement)) return [seen.get(complement), index];\n    seen.set(nums[index], index);\n  }\n  return [];\n}',
        },
        {
          language: 'java',
          code: 'import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int index = 0; index < nums.length; index++) {\n            int complement = target - nums[index];\n            if (seen.containsKey(complement)) return new int[] { seen.get(complement), index };\n            seen.put(nums[index], index);\n        }\n        return new int[0];\n    }\n}',
        },
      ],
    },
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      difficulty: Difficulty.EASY,
      category: 'Stacks',
      leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
      neetcodeSheet: true,
      blind75Sheet: true,
      grind169Sheet: true,
      description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
      testCases: [
        { input: '"()"', output: 'true' },
        { input: '"()[]{}"', output: 'true' },
        { input: '"(]"', output: 'false' },
      ],
      starterCodes: [
        {
          language: 'python',
          code: 'def isValid(s: str) -> bool:\n    pairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n    stack = []\n    for char in s:\n        if char in pairs.values():\n            stack.append(char)\n        elif not stack or stack.pop() != pairs[char]:\n            return False\n    return not stack',
        },
        {
          language: 'cpp',
          code: '#include <string>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        unordered_map<char, char> pairs = {{\')\', \'(\'}, {\']\', \'[\'}, {\'}\', \'{\'}};\n        stack<char> opened;\n        for (char c : s) {\n            if (c == \'(\' || c == \'[\' || c == \'{\') opened.push(c);\n            else if (opened.empty() || opened.top() != pairs[c]) return false;\n            else opened.pop();\n        }\n        return opened.empty();\n    }\n};',
        },
        {
          language: 'javascript',
          code: 'function isValid(s) {\n  const pairs = new Map([[")", "("], ["]", "["], ["}", "{"]]);\n  const stack = [];\n  for (const char of s) {\n    if ([...pairs.values()].includes(char)) stack.push(char);\n    else if (stack.pop() !== pairs.get(char)) return false;\n  }\n  return stack.length === 0;\n}',
        },
        {
          language: 'java',
          code: 'import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        Map<Character, Character> pairs = Map.of(\')\', \'(\', \']\', \'[\', \'}\', \'{\');\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (pairs.containsValue(c)) stack.push(c);\n            else if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;\n        }\n        return stack.isEmpty();\n    }\n}',
        },
      ],
    },
    {
      title: 'Binary Search',
      slug: 'binary-search',
      difficulty: Difficulty.EASY,
      category: 'Binary Search',
      leetcodeUrl: 'https://leetcode.com/problems/binary-search/',
      neetcodeSheet: true,
      blind75Sheet: false,
      grind169Sheet: true,
      description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.',
      testCases: [
        { input: '[-1,0,3,5,9,12]\n9', output: '4' },
        { input: '[-1,0,3,5,9,12]\n2', output: '-1' },
      ],
      starterCodes: [
        {
          language: 'python',
          code: 'def search(nums: list[int], target: int) -> int:\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
        },
        {
          language: 'cpp',
          code: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int left = 0, right = nums.size() - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n};',
        },
        {
          language: 'javascript',
          code: 'function search(nums, target) {\n  let left = 0;\n  let right = nums.length - 1;\n  while (left <= right) {\n    const mid = left + Math.floor((right - left) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
        },
        {
          language: 'java',
          code: 'class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0;\n        int right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}',
        },
      ],
    },
    {
      title: 'Longest Common Subsequence',
      slug: 'longest-common-subsequence',
      difficulty: Difficulty.MEDIUM,
      category: 'Dynamic Programming',
      leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/',
      neetcodeSheet: true,
      blind75Sheet: true,
      grind169Sheet: false,
      description: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.',
      testCases: [
        { input: '"abcde"\n"ace"', output: '3' },
        { input: '"abc"\n"abc"', output: '3' },
        { input: '"abc"\n"def"', output: '0' },
      ],
      starterCodes: [
        {
          language: 'python',
          code: 'def longestCommonSubsequence(text1: str, text2: str) -> int:\n    dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]\n    for i in range(len(text1) - 1, -1, -1):\n        for j in range(len(text2) - 1, -1, -1):\n            if text1[i] == text2[j]:\n                dp[i][j] = 1 + dp[i + 1][j + 1]\n            else:\n                dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])\n    return dp[0][0]',
        },
        {
          language: 'cpp',
          code: '#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        vector<vector<int>> dp(text1.size() + 1, vector<int>(text2.size() + 1, 0));\n        for (int i = text1.size() - 1; i >= 0; i--) {\n            for (int j = text2.size() - 1; j >= 0; j--) {\n                if (text1[i] == text2[j]) dp[i][j] = 1 + dp[i + 1][j + 1];\n                else dp[i][j] = max(dp[i + 1][j], dp[i][j + 1]);\n            }\n        }\n        return dp[0][0];\n    }\n};',
        },
        {
          language: 'javascript',
          code: 'function longestCommonSubsequence(text1, text2) {\n  const dp = Array.from({ length: text1.length + 1 }, () => Array(text2.length + 1).fill(0));\n  for (let i = text1.length - 1; i >= 0; i--) {\n    for (let j = text2.length - 1; j >= 0; j--) {\n      dp[i][j] = text1[i] === text2[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1]);\n    }\n  }\n  return dp[0][0];\n}',
        },
        {
          language: 'java',
          code: 'class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        int[][] dp = new int[text1.length() + 1][text2.length() + 1];\n        for (int i = text1.length() - 1; i >= 0; i--) {\n            for (int j = text2.length() - 1; j >= 0; j--) {\n                if (text1.charAt(i) == text2.charAt(j)) dp[i][j] = 1 + dp[i + 1][j + 1];\n                else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);\n            }\n        }\n        return dp[0][0];\n    }\n}',
        },
      ],
    },
  ];

  for (const prob of problems) {
    const createdProblem = await prisma.problem.create({
      data: {
        title: prob.title,
        slug: prob.slug,
        difficulty: prob.difficulty,
        category: prob.category,
        leetcodeUrl: prob.leetcodeUrl,
        neetcodeSheet: prob.neetcodeSheet,
        blind75Sheet: prob.blind75Sheet,
        grind169Sheet: prob.grind169Sheet,
        description: prob.description,
        testCases: prob.testCases,
        starterCodes: {
          create: prob.starterCodes,
        },
      },
    });
    console.log(`Created Problem: ${createdProblem.title}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
