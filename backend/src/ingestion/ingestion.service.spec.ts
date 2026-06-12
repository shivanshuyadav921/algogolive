import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';

describe('IngestionService LeetCode import', () => {
  const findUnique = jest.fn();
  const prisma = {
    problem: { findUnique },
  };
  let service: IngestionService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new IngestionService(prisma as never);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('imports a known LeetCode URL from the local catalog', async () => {
    findUnique.mockResolvedValue({
      id: 'problem-1',
      slug: 'two-sum',
      title: 'Two Sum',
      description: 'Given nums and target, return two indices.',
      difficulty: 'EASY',
      category: 'Arrays',
      testCases: [{ input: '[2,7]\n9', output: '[0,1]' }],
      starterCodes: [{ language: 'python', code: 'def twoSum(nums, target):' }],
    });
    global.fetch = jest.fn();

    const artifact = await service.ingest(
      'https://leetcode.com/problems/two-sum/?envType=study-plan',
    );

    expect(findUnique).toHaveBeenCalledWith({
      where: { slug: 'two-sum' },
      include: { starterCodes: true },
    });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(artifact).toMatchObject({
      sourceType: 'leetcode_url',
      sourceUrl: 'https://leetcode.com/problems/two-sum/',
      slug: 'two-sum',
      title: 'Two Sum',
      metadata: { provider: 'local_catalog' },
      testCases: [{ input: '[2,7]\n9', output: '[0,1]' }],
    });
  });

  it('imports an unknown public problem from LeetCode metadata', async () => {
    findUnique.mockResolvedValue(null);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          question: {
            questionId: '121',
            title: 'Best Time to Buy and Sell Stock',
            titleSlug: 'best-time-to-buy-and-sell-stock',
            difficulty: 'Easy',
            content:
              '<p>Find the maximum profit.</p><strong>Example 1:</strong><pre><strong>Input:</strong> prices = [7,1,5,3,6,4]\n<strong>Output:</strong> 5</pre><p><strong>Constraints:</strong></p><ul><li>1 &lt;= prices.length &lt;= 10^5</li></ul>',
            topicTags: [{ name: 'Array' }, { name: 'Dynamic Programming' }],
            codeSnippets: [
              { langSlug: 'python3', code: 'class Solution:\n    pass' },
            ],
          },
        },
      }),
    } as Response);

    const artifact = await service.ingest(
      'https://www.leetcode.com/problems/best-time-to-buy-and-sell-stock/description/',
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://leetcode.com/graphql',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(artifact).toMatchObject({
      sourceType: 'leetcode_url',
      slug: 'best-time-to-buy-and-sell-stock',
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'Easy',
      topics: ['Array', 'Dynamic Programming'],
      examples: [
        { input: 'prices = [7,1,5,3,6,4]', output: '5' },
      ],
      starterCodes: [
        { language: 'python', code: 'class Solution:\n    pass' },
      ],
      metadata: { provider: 'leetcode' },
    });
    expect(artifact.statement).toContain('Find the maximum profit.');
  });

  it.each([
    'https://leetcode.com/problemset/',
    'https://leetcode.com/problems/not_valid/',
    'not a URL',
  ])('rejects malformed problem input: %s', async (input) => {
    if (input === 'not a URL') {
      const artifact = await service.ingest(input);
      expect(artifact.sourceType).toBe('plain_text');
      return;
    }
    await expect(service.ingest(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects non-LeetCode URL imports', async () => {
    await expect(
      service.ingest('https://example.com/problems/two-sum/'),
    ).rejects.toThrow('Only LeetCode problem URLs are supported');
  });

  it('reports a missing or private LeetCode problem', async () => {
    findUnique.mockResolvedValue(null);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { question: null } }),
    } as Response);

    await expect(
      service.ingest('https://leetcode.com/problems/does-not-exist/'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('continues with remote import when the local database is unavailable', async () => {
    findUnique.mockRejectedValue(new Error('database offline'));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          question: {
            questionId: '1',
            title: 'Remote Problem',
            titleSlug: 'remote-problem',
            difficulty: 'Medium',
            content: '<p>Remote statement.</p>',
            topicTags: [],
            codeSnippets: [],
          },
        },
      }),
    } as Response);

    const artifact = await service.ingest(
      'https://leetcode.com/problems/remote-problem/',
    );

    expect(artifact.metadata.provider).toBe('leetcode');
  });
});

describe('IngestionService raw text import', () => {
  const prisma = { problem: { findUnique: jest.fn() } };
  const service = new IngestionService(prisma as never);

  it('extracts title, examples, constraints, and runnable test cases', async () => {
    const artifact = await service.ingest(`Two Sum

Given an array of integers nums and an integer target, return the two indices.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] equals 9.

Example 2:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 10^4
- Exactly one valid answer exists.`);

    expect(artifact).toMatchObject({
      sourceType: 'plain_text',
      title: 'Two Sum',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'nums[0] + nums[1] equals 9.',
        },
        {
          input: 'nums = [3,3], target = 6',
          output: '[0,1]',
        },
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        'Exactly one valid answer exists.',
      ],
      testCases: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
        { input: 'nums = [3,3], target = 6', output: '[0,1]' },
      ],
    });
  });

  it('preserves ambiguous prose without inventing examples', async () => {
    const input =
      'Given a list of values, explain an efficient way to find duplicates.';
    const artifact = await service.ingest(input);

    expect(artifact.title).toBe('Imported Problem');
    expect(artifact.statement).toBe(input);
    expect(artifact.examples).toEqual([]);
    expect(artifact.testCases).toEqual([]);
  });

  it('accepts an explicit title label', async () => {
    const artifact = await service.ingest(
      'Title: Range Sum Query\nReturn the sum for each requested interval.',
    );
    expect(artifact.title).toBe('Range Sum Query');
  });

  it('keeps incomplete examples but does not mark them runnable', async () => {
    const artifact = await service.ingest(
      'Custom Problem\nExample:\nInput: [1,2,3]',
    );
    expect(artifact.examples).toEqual([{ input: '[1,2,3]' }]);
    expect(artifact.testCases).toEqual([]);
  });
});

describe('IngestionService pseudocode import', () => {
  const prisma = { problem: { findUnique: jest.fn() } };
  const service = new IngestionService(prisma as never);

  it('normalizes a pseudocode function into parameters and operations', async () => {
    const artifact = await service.ingest(`FUNCTION binarySearch(values, target)
  left <- 0
  right <- length(values) - 1
  WHILE left <= right
    mid <- floor((left + right) / 2)
    IF values[mid] = target
      RETURN mid
    ELSE IF values[mid] < target
      left <- mid + 1
    ELSE
      right <- mid - 1
  END WHILE
  RETURN -1
END FUNCTION`);

    expect(artifact).toMatchObject({
      sourceType: 'pseudocode',
      title: 'Binary Search',
      algorithm: {
        name: 'binarySearch',
        language: 'pseudocode',
        parameters: ['values', 'target'],
        variables: expect.arrayContaining([
          'values',
          'target',
          'left',
          'right',
          'mid',
        ]),
        operations: expect.arrayContaining([
          { line: 2, kind: 'assignment', text: 'left <- 0' },
          { line: 4, kind: 'loop', text: 'WHILE left <= right' },
          { line: 6, kind: 'condition', text: 'IF values[mid] = target' },
          { line: 7, kind: 'return', text: 'RETURN mid' },
        ]),
      },
    });
  });

  it('imports pseudocode without a named signature', async () => {
    const artifact = await service.ingest(`FOR EACH value IN values
  IF value > best
    best <- value
  END IF
RETURN best`);

    expect(artifact.sourceType).toBe('pseudocode');
    expect(artifact.title).toBe('Imported Pseudocode');
    expect(artifact.algorithm?.operations).toHaveLength(4);
  });
});

describe('IngestionService code import', () => {
  const prisma = { problem: { findUnique: jest.fn() } };
  const service = new IngestionService(prisma as never);

  it('normalizes a Python function and keeps the snippet as starter code', async () => {
    const code = `def max_profit(prices: list[int]) -> int:
    best = 0
    minimum = prices[0]
    for price in prices:
        if price < minimum:
            minimum = price
        best = max(best, price - minimum)
    return best`;
    const artifact = await service.ingest(code);

    expect(artifact).toMatchObject({
      sourceType: 'code',
      title: 'Max Profit',
      starterCodes: [{ language: 'python', code }],
      algorithm: {
        name: 'max_profit',
        language: 'python',
        parameters: ['prices'],
        variables: expect.arrayContaining(['prices', 'best', 'minimum', 'price']),
      },
    });
    expect(artifact.algorithm?.operations).toEqual(
      expect.arrayContaining([
        { line: 4, kind: 'loop', text: 'for price in prices:' },
        { line: 5, kind: 'condition', text: 'if price < minimum:' },
        { line: 8, kind: 'return', text: 'return best' },
      ]),
    );
  });

  it('normalizes a JavaScript arrow function', async () => {
    const artifact = await service.ingest(`const twoSum = (nums, target) => {
  const seen = new Map();
  for (let index = 0; index < nums.length; index++) {
    if (seen.has(target - nums[index])) return [seen.get(target - nums[index]), index];
    seen.set(nums[index], index);
  }
  return [];
};`);

    expect(artifact.title).toBe('Two Sum');
    expect(artifact.algorithm).toMatchObject({
      name: 'twoSum',
      language: 'javascript',
      parameters: ['nums', 'target'],
    });
  });

  it('normalizes a C++ method signature', async () => {
    const artifact = await service.ingest(`#include <vector>
using namespace std;
class Solution {
public:
  int search(vector<int>& nums, int target) {
    int left = 0;
    while (left < nums.size()) {
      if (nums[left] == target) return left;
      left += 1;
    }
    return -1;
  }
};`);

    expect(artifact.algorithm).toMatchObject({
      name: 'search',
      language: 'cpp',
      parameters: ['nums', 'target'],
    });
  });
});
