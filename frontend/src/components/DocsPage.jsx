import { useState } from 'react';
import { Icon } from './Icons.jsx';

/**
 * Documentation Page with Sidebar Navigation and Topic Details
 * Original educational content for interview preparation
 */
export default function DocsPage() {
  const [activePage, setActivePage] = useState('coding');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('a-z');
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Sidebar navigation items
  const navItems = [
    { id: 'coding', label: 'Data Structures & Algorithms', icon: 'code' },
    { id: 'system-design', label: 'System Design', icon: 'systemDesign' },
    { id: 'behavioral', label: 'Behavioral', icon: 'users' },
  ];

  // DSA Topics with content
  const codingTopics = [
    {
      id: 'arrays-hashing',
      title: 'Arrays & Hashing',
      icon: 'code',
      color: '#ef4444',
      questions: 57,
      description: 'Foundation of most coding interviews. Master array manipulation and hash map usage.',
      keyPatterns: ['Two-pass counting', 'Frequency maps', 'Index mapping', 'Prefix sums'],
      timeComplexity: 'O(n) average with hash maps',
      spaceComplexity: 'O(n) for hash map storage',
      commonProblems: ['Two Sum', 'Contains Duplicate', 'Valid Anagram', 'Group Anagrams', 'Top K Frequent Elements'],
      tips: [
        'Use hash maps for O(1) lookups instead of nested loops',
        'Consider sorting when order doesn\'t matter for O(n log n) solution',
        'Prefix sums enable O(1) range queries after O(n) preprocessing',
        'For counting problems, defaultdict or Counter in Python simplifies code'
      ],
      codeExample: `# Two Sum - Classic hash map pattern
def two_sum(nums, target):
    seen = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Time: O(n), Space: O(n)`
    },
    {
      id: 'binary-search',
      title: 'Binary Search',
      icon: 'search',
      color: '#f59e0b',
      questions: 23,
      description: 'Divide and conquer on sorted data. Essential for O(log n) solutions.',
      keyPatterns: ['Standard binary search', 'Left/right boundary', 'Rotated arrays', 'Search in 2D matrix'],
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1) iterative, O(log n) recursive',
      commonProblems: ['Binary Search', 'Search in Rotated Array', 'Find Minimum in Rotated Array', 'Search a 2D Matrix', 'Koko Eating Bananas'],
      tips: [
        'Use left + (right - left) // 2 to avoid integer overflow',
        'Identify if you need leftmost or rightmost occurrence',
        'Binary search works on any monotonic function, not just arrays',
        'For "minimum that satisfies condition" problems, search the answer space'
      ],
      codeExample: `# Binary Search - Find leftmost position
def binary_search_left(nums, target):
    left, right = 0, len(nums)
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left

# Time: O(log n), Space: O(1)`
    },
    {
      id: 'two-pointers',
      title: 'Two Pointers',
      icon: 'chevronsRight',
      color: '#3b82f6',
      questions: 18,
      description: 'Efficient technique for sorted arrays and linked lists. Reduces O(n²) to O(n).',
      keyPatterns: ['Opposite ends', 'Same direction (fast/slow)', 'Sliding window variant', 'Three pointers'],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      commonProblems: ['Two Sum II (sorted)', 'Three Sum', 'Container With Most Water', 'Trapping Rain Water', 'Remove Duplicates'],
      tips: [
        'Works best on sorted arrays or when relative order matters',
        'Fast/slow pointers detect cycles in linked lists',
        'For three sum, fix one pointer and use two-pointer on remainder',
        'Consider what condition moves each pointer'
      ],
      codeExample: `# Container With Most Water
def max_area(height):
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water

# Time: O(n), Space: O(1)`
    },
    {
      id: 'sliding-window',
      title: 'Sliding Window',
      icon: 'chevronsRight',
      color: '#8b5cf6',
      questions: 16,
      description: 'Process subarrays/substrings efficiently. Key for substring and subarray problems.',
      keyPatterns: ['Fixed size window', 'Variable size window', 'Window with constraints', 'Character frequency'],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(k) where k is window size or character set',
      commonProblems: ['Best Time to Buy/Sell Stock', 'Longest Substring Without Repeating', 'Minimum Window Substring', 'Sliding Window Maximum'],
      tips: [
        'Expand window to include elements, shrink to satisfy constraints',
        'Use hash map to track window contents efficiently',
        'For fixed-size windows, add right element and remove left in one step',
        'Track window validity to avoid recomputing from scratch'
      ],
      codeExample: `# Longest Substring Without Repeating Characters
def length_of_longest_substring(s):
    char_index = {}
    max_len = 0
    left = 0

    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)

    return max_len

# Time: O(n), Space: O(min(n, alphabet))`
    },
    {
      id: 'stacks',
      title: 'Stacks',
      icon: 'layers',
      color: '#22c55e',
      questions: 34,
      description: 'LIFO structure for parsing, backtracking, and monotonic stack patterns.',
      keyPatterns: ['Valid parentheses', 'Monotonic stack', 'Expression evaluation', 'Backtracking state'],
      timeComplexity: 'O(n) for most operations',
      spaceComplexity: 'O(n)',
      commonProblems: ['Valid Parentheses', 'Min Stack', 'Daily Temperatures', 'Largest Rectangle in Histogram', 'Evaluate RPN'],
      tips: [
        'Monotonic stack finds next greater/smaller element in O(n)',
        'Use stack to track state in DFS/backtracking',
        'For calculator problems, use two stacks: numbers and operators',
        'Valid parentheses needs matching order, not just counts'
      ],
      codeExample: `# Daily Temperatures - Monotonic Stack
def daily_temperatures(temps):
    n = len(temps)
    result = [0] * n
    stack = []  # indices of temps waiting for warmer day

    for i, temp in enumerate(temps):
        while stack and temps[stack[-1]] < temp:
            prev_idx = stack.pop()
            result[prev_idx] = i - prev_idx
        stack.append(i)

    return result

# Time: O(n), Space: O(n)`
    },
    {
      id: 'linked-lists',
      title: 'Linked Lists',
      icon: 'link',
      color: '#a855f7',
      questions: 31,
      description: 'Pointer manipulation fundamentals. Practice reversing, merging, and cycle detection.',
      keyPatterns: ['Fast/slow pointers', 'Dummy head', 'Reversal', 'Merge two lists'],
      timeComplexity: 'O(n) traversal',
      spaceComplexity: 'O(1) for in-place operations',
      commonProblems: ['Reverse Linked List', 'Merge Two Sorted Lists', 'Linked List Cycle', 'Remove Nth From End', 'Reorder List'],
      tips: [
        'Use dummy head to simplify edge cases (empty list, single node)',
        'Draw out pointer changes before coding',
        'Fast/slow pointers: fast moves 2x, finds middle and detects cycles',
        'For reversal, track prev, curr, next pointers'
      ],
      codeExample: `# Reverse Linked List
def reverse_list(head):
    prev = None
    curr = head

    while curr:
        next_temp = curr.next  # Save next
        curr.next = prev       # Reverse pointer
        prev = curr            # Move prev forward
        curr = next_temp       # Move curr forward

    return prev

# Time: O(n), Space: O(1)`
    },
    {
      id: 'trees',
      title: 'Trees',
      icon: 'share',
      color: '#06b6d4',
      questions: 45,
      description: 'Binary trees and BSTs. Master DFS, BFS, and recursive thinking.',
      keyPatterns: ['DFS (preorder/inorder/postorder)', 'BFS level-order', 'BST properties', 'Path problems'],
      timeComplexity: 'O(n) to visit all nodes',
      spaceComplexity: 'O(h) where h is height, O(n) worst case',
      commonProblems: ['Maximum Depth', 'Invert Binary Tree', 'Validate BST', 'Lowest Common Ancestor', 'Binary Tree Level Order'],
      tips: [
        'Most tree problems are solved with recursion or BFS',
        'For BST, inorder traversal gives sorted order',
        'Track return values carefully: height, validity, path sum',
        'Level-order uses queue, DFS uses stack (implicit or explicit)'
      ],
      codeExample: `# Maximum Depth of Binary Tree
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left),
                   max_depth(root.right))

# Validate BST
def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')):
    if not root:
        return True
    if root.val <= min_val or root.val >= max_val:
        return False
    return (is_valid_bst(root.left, min_val, root.val) and
            is_valid_bst(root.right, root.val, max_val))`
    },
    {
      id: 'graphs',
      title: 'Graphs',
      icon: 'share',
      color: '#ec4899',
      questions: 54,
      description: 'DFS, BFS, and shortest path algorithms. Represent as adjacency list.',
      keyPatterns: ['DFS traversal', 'BFS shortest path', 'Topological sort', 'Union-Find', 'Dijkstra'],
      timeComplexity: 'O(V + E) for traversal',
      spaceComplexity: 'O(V) for visited set',
      commonProblems: ['Number of Islands', 'Clone Graph', 'Course Schedule', 'Pacific Atlantic Water Flow', 'Network Delay Time'],
      tips: [
        'Build adjacency list from edge list for easier traversal',
        'BFS finds shortest path in unweighted graphs',
        'Topological sort: DFS with post-order or Kahn\'s algorithm',
        'Union-Find with path compression for connected components'
      ],
      codeExample: `# Number of Islands - DFS
def num_islands(grid):
    if not grid:
        return 0

    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if (r < 0 or r >= rows or c < 0 or
            c >= cols or grid[r][c] == '0'):
            return
        grid[r][c] = '0'  # Mark visited
        dfs(r+1, c); dfs(r-1, c)
        dfs(r, c+1); dfs(r, c-1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count`
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Programming',
      icon: 'chartLine',
      color: '#3b82f6',
      questions: 42,
      description: 'Optimal substructure and overlapping subproblems. Break into smaller problems.',
      keyPatterns: ['1D DP', '2D DP', 'Knapsack variants', 'LCS/LIS', 'State machine'],
      timeComplexity: 'Varies: O(n), O(n²), O(n*W)',
      spaceComplexity: 'Can often optimize from O(n) to O(1)',
      commonProblems: ['Climbing Stairs', 'Coin Change', 'Longest Increasing Subsequence', 'Edit Distance', 'House Robber'],
      tips: [
        'Start with recursion + memoization, then convert to tabulation',
        'Define state clearly: what does dp[i] represent?',
        'Identify base cases and recurrence relation',
        'Look for space optimization by tracking only needed previous states'
      ],
      codeExample: `# Coin Change - Bottom-up DP
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)

    return dp[amount] if dp[amount] != float('inf') else -1

# Time: O(amount * coins), Space: O(amount)`
    },
    {
      id: 'heaps',
      title: 'Heaps / Priority Queue',
      icon: 'layers',
      color: '#f97316',
      questions: 33,
      description: 'Efficient min/max access. Essential for top-k problems and scheduling.',
      keyPatterns: ['Top-K elements', 'Merge K sorted', 'Two heaps (median)', 'Scheduling'],
      timeComplexity: 'O(log n) push/pop, O(1) peek',
      spaceComplexity: 'O(k) for top-k problems',
      commonProblems: ['Kth Largest Element', 'Top K Frequent Elements', 'Merge K Sorted Lists', 'Find Median from Data Stream', 'Task Scheduler'],
      tips: [
        'Python heapq is min-heap; negate values for max-heap',
        'For top-K largest, use min-heap of size K',
        'Two heaps pattern: max-heap for smaller half, min-heap for larger',
        'Heapify is O(n), more efficient than n insertions'
      ],
      codeExample: `# Kth Largest Element
import heapq

def find_kth_largest(nums, k):
    # Min-heap of size k
    heap = nums[:k]
    heapq.heapify(heap)

    for num in nums[k:]:
        if num > heap[0]:
            heapq.heapreplace(heap, num)

    return heap[0]

# Time: O(n log k), Space: O(k)`
    },
    {
      id: 'backtracking',
      title: 'Backtracking',
      icon: 'refresh',
      color: '#10b981',
      questions: 25,
      description: 'Explore all possibilities with pruning. Generate permutations, combinations, subsets.',
      keyPatterns: ['Permutations', 'Combinations', 'Subsets', 'N-Queens', 'Sudoku solver'],
      timeComplexity: 'Exponential: O(n!), O(2^n), O(n^n)',
      spaceComplexity: 'O(n) recursion depth',
      commonProblems: ['Subsets', 'Permutations', 'Combination Sum', 'Word Search', 'N-Queens'],
      tips: [
        'Use a path/current list to track current state',
        'Make choice, recurse, then undo choice (backtrack)',
        'Prune early to avoid unnecessary exploration',
        'For combinations, use start index to avoid duplicates'
      ],
      codeExample: `# Subsets - Backtracking
def subsets(nums):
    result = []

    def backtrack(start, path):
        result.append(path[:])  # Add copy
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()  # Backtrack

    backtrack(0, [])
    return result

# Time: O(n * 2^n), Space: O(n)`
    },
    {
      id: 'greedy',
      title: 'Greedy',
      icon: 'target',
      color: '#06b6d4',
      questions: 18,
      description: 'Make locally optimal choices. Works when local optimum leads to global optimum.',
      keyPatterns: ['Interval scheduling', 'Activity selection', 'Huffman coding', 'Fractional knapsack'],
      timeComplexity: 'Often O(n log n) due to sorting',
      spaceComplexity: 'O(1) extra space typically',
      commonProblems: ['Jump Game', 'Gas Station', 'Merge Intervals', 'Non-overlapping Intervals', 'Partition Labels'],
      tips: [
        'Prove greedy works: optimal substructure + greedy choice property',
        'Often involves sorting by start/end time or value/weight ratio',
        'If greedy doesn\'t work, consider DP instead',
        'Interval problems: usually sort by end time'
      ],
      codeExample: `# Merge Intervals
def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]

    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    return merged

# Time: O(n log n), Space: O(n)`
    },
    {
      id: 'tries',
      title: 'Tries',
      icon: 'folder',
      color: '#ec4899',
      questions: 12,
      description: 'Prefix tree for string operations. Efficient autocomplete and spell check.',
      keyPatterns: ['Insert/Search', 'Prefix matching', 'Word dictionary', 'Autocomplete'],
      timeComplexity: 'O(m) where m is word length',
      spaceComplexity: 'O(alphabet_size * max_word_length * num_words)',
      commonProblems: ['Implement Trie', 'Word Search II', 'Design Add and Search Words', 'Replace Words'],
      tips: [
        'Each node has children map and end-of-word flag',
        'More space efficient than storing all prefixes in hash set',
        'Use for problems involving multiple prefix queries',
        'Can store additional data at nodes (count, word itself)'
      ],
      codeExample: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_word = True

    def search(self, word):
        node = self._find(word)
        return node is not None and node.is_word`
    },
    {
      id: 'bit-manipulation',
      title: 'Bit Manipulation',
      icon: 'cpu',
      color: '#8b5cf6',
      questions: 13,
      description: 'Operations on binary representations. XOR, AND, OR, shifts.',
      keyPatterns: ['XOR tricks', 'Counting bits', 'Power of two', 'Bit masking'],
      timeComplexity: 'O(1) for single operations, O(log n) for all bits',
      spaceComplexity: 'O(1)',
      commonProblems: ['Single Number', 'Number of 1 Bits', 'Counting Bits', 'Reverse Bits', 'Missing Number'],
      tips: [
        'XOR: a ^ a = 0, a ^ 0 = a (find single number)',
        'Check bit: (n >> i) & 1',
        'Set bit: n | (1 << i)',
        'Clear bit: n & ~(1 << i)',
        'n & (n-1) removes lowest set bit'
      ],
      codeExample: `# Single Number (find unique in pairs)
def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result

# Count set bits
def count_bits(n):
    count = 0
    while n:
        n &= (n - 1)  # Remove lowest set bit
        count += 1
    return count`
    },
    {
      id: 'math-geometry',
      title: 'Math & Geometry',
      icon: 'puzzle',
      color: '#14b8a6',
      questions: 10,
      description: 'Mathematical algorithms and geometric computations.',
      keyPatterns: ['GCD/LCM', 'Prime numbers', 'Modular arithmetic', 'Line intersection', 'Polygon area'],
      timeComplexity: 'Varies by algorithm',
      spaceComplexity: 'Usually O(1)',
      commonProblems: ['Pow(x, n)', 'Sqrt(x)', 'Happy Number', 'Plus One', 'Rotate Image', 'Spiral Matrix'],
      tips: [
        'Use Euclidean algorithm for GCD: O(log min(a,b))',
        'Fast exponentiation: Square and multiply for O(log n)',
        'Be careful with integer overflow in multiplication',
        'For geometry, use cross product for orientation'
      ],
      codeExample: `# Fast Exponentiation
def power(x, n):
    if n < 0:
        x = 1 / x
        n = -n
    result = 1
    while n > 0:
        if n % 2 == 1:
            result *= x
        x *= x
        n //= 2
    return result

# Time: O(log n), Space: O(1)`
    },
    {
      id: 'matrix',
      title: 'Matrix',
      icon: 'layers',
      color: '#6366f1',
      questions: 7,
      description: 'Two-dimensional array traversal and manipulation.',
      keyPatterns: ['Spiral traversal', 'Rotation', 'Search in sorted matrix', 'Dynamic programming on grid'],
      timeComplexity: 'O(m × n) for traversal',
      spaceComplexity: 'O(1) for in-place, O(m × n) for copy',
      commonProblems: ['Rotate Image', 'Spiral Matrix', 'Set Matrix Zeroes', 'Search 2D Matrix', 'Valid Sudoku'],
      tips: [
        'For rotation: transpose then reverse rows (or columns)',
        'Spiral: Use 4 pointers for boundaries',
        'In-place modifications may need marker values',
        'Binary search works on row-wise and column-wise sorted matrices'
      ],
      codeExample: `# Rotate Image 90 degrees clockwise
def rotate(matrix):
    n = len(matrix)
    # Transpose
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Reverse each row
    for row in matrix:
        row.reverse()

# Time: O(n²), Space: O(1)`
    },
    {
      id: 'recursion',
      title: 'Recursion',
      icon: 'refresh',
      color: '#10b981',
      questions: 15,
      description: 'Self-referential problem solving. Foundation for trees, graphs, and DP.',
      keyPatterns: ['Base case + recursive case', 'Divide and conquer', 'Tail recursion', 'Memoization'],
      timeComplexity: 'Depends on branching factor and depth',
      spaceComplexity: 'O(depth) for call stack',
      commonProblems: ['Fibonacci', 'Factorial', 'Reverse String', 'Merge Sort', 'Generate Parentheses'],
      tips: [
        'Always define base case(s) first',
        'Trust the recursion: assume recursive calls work correctly',
        'Draw recursion tree to understand complexity',
        'Convert to iteration if stack overflow is concern'
      ],
      codeExample: `# Generate Parentheses
def generate_parentheses(n):
    result = []

    def backtrack(current, open_count, close_count):
        if len(current) == 2 * n:
            result.append(current)
            return
        if open_count < n:
            backtrack(current + '(', open_count + 1, close_count)
        if close_count < open_count:
            backtrack(current + ')', open_count, close_count + 1)

    backtrack('', 0, 0)
    return result`
    },
    {
      id: 'sorting',
      title: 'Sorting Algorithms',
      icon: 'chartBar',
      color: '#f59e0b',
      questions: 18,
      description: 'Comparison and non-comparison based sorting techniques.',
      keyPatterns: ['Merge sort', 'Quick sort', 'Heap sort', 'Counting/Radix sort', 'Custom comparators'],
      timeComplexity: 'O(n log n) comparison-based, O(n) for counting/radix',
      spaceComplexity: 'O(n) merge sort, O(log n) quick sort, O(1) heap sort',
      commonProblems: ['Sort Array', 'Sort Colors', 'Merge Intervals', 'Largest Number', 'Meeting Rooms'],
      tips: [
        'Merge sort: Stable, guaranteed O(n log n), needs O(n) space',
        'Quick sort: In-place, O(n log n) average, O(n²) worst',
        'Use counting sort for limited range integers',
        'Custom comparators for complex sorting criteria'
      ],
      codeExample: `# Merge Sort
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    return result + left[i:] + right[j:]`
    },
    {
      id: 'intervals',
      title: 'Intervals',
      icon: 'chartBar',
      color: '#84cc16',
      questions: 5,
      description: 'Problems involving ranges and overlapping segments.',
      keyPatterns: ['Merge intervals', 'Insert interval', 'Meeting rooms', 'Interval scheduling'],
      timeComplexity: 'O(n log n) after sorting',
      spaceComplexity: 'O(n) for result',
      commonProblems: ['Merge Intervals', 'Insert Interval', 'Meeting Rooms', 'Non-overlapping Intervals', 'Minimum Intervals to Remove'],
      tips: [
        'Sort by start time (or end time depending on problem)',
        'Check overlap: intervals overlap if a.start < b.end AND b.start < a.end',
        'For scheduling: greedy by end time minimizes conflicts',
        'Use sweep line for complex interval operations'
      ],
      codeExample: `# Merge Intervals
def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]

    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    return merged

# Time: O(n log n), Space: O(n)`
    },
    {
      id: 'search-algorithms',
      title: 'Search Algorithms',
      icon: 'search',
      color: '#0ea5e9',
      questions: 23,
      description: 'Linear search, binary search, and advanced search techniques.',
      keyPatterns: ['Linear search', 'Binary search', 'Ternary search', 'Exponential search', 'Interpolation search'],
      timeComplexity: 'O(n) linear, O(log n) binary',
      spaceComplexity: 'O(1)',
      commonProblems: ['Binary Search', 'Search Insert Position', 'Find Peak Element', 'Search in Rotated Array', 'First Bad Version'],
      tips: [
        'Binary search requires sorted data',
        'Watch for off-by-one errors in boundary conditions',
        'Use binary search on answer space for optimization problems',
        'Ternary search for unimodal functions'
      ],
      codeExample: `# Binary Search - Find exact or insertion point
def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1  # or 'left' for insertion point

# Time: O(log n), Space: O(1)`
    },
    {
      id: 'queues',
      title: 'Queues',
      icon: 'inbox',
      color: '#f43f5e',
      questions: 17,
      description: 'FIFO data structure for BFS, task scheduling, and buffering.',
      keyPatterns: ['BFS', 'Level order traversal', 'Sliding window max', 'Task scheduling'],
      timeComplexity: 'O(1) enqueue/dequeue',
      spaceComplexity: 'O(n)',
      commonProblems: ['Implement Queue using Stacks', 'Design Circular Queue', 'Sliding Window Maximum', 'Task Scheduler', 'Number of Recent Calls'],
      tips: [
        'Use deque for O(1) operations on both ends',
        'BFS uses queue for level-by-level exploration',
        'Monotonic deque for sliding window min/max',
        'Priority queue (heap) when order matters beyond FIFO'
      ],
      codeExample: `# Sliding Window Maximum using Monotonic Deque
from collections import deque

def max_sliding_window(nums, k):
    dq = deque()  # Store indices
    result = []

    for i, num in enumerate(nums):
        # Remove indices outside window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        # Remove smaller elements
        while dq and nums[dq[-1]] < num:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])

    return result`
    },
    {
      id: 'blind-75',
      title: 'Blind 75',
      icon: 'zap',
      color: '#22c55e',
      questions: 75,
      description: 'Curated list of 75 essential LeetCode problems covering all major patterns.',
      keyPatterns: ['Arrays', 'Binary', 'DP', 'Graph', 'Interval', 'Linked List', 'Matrix', 'String', 'Tree', 'Heap'],
      timeComplexity: 'Varies by problem',
      spaceComplexity: 'Varies by problem',
      commonProblems: ['Two Sum', 'Best Time to Buy/Sell Stock', 'Contains Duplicate', 'Product of Array Except Self', 'Maximum Subarray', 'Maximum Product Subarray'],
      tips: [
        'Start with Array and String problems',
        'Progress to Trees and Graphs',
        'Focus on patterns, not memorization',
        'Aim to solve each problem in <45 minutes'
      ],
      codeExample: `# The Blind 75 covers these categories:
# - Array (9 problems)
# - Binary (5 problems)
# - Dynamic Programming (11 problems)
# - Graph (8 problems)
# - Interval (5 problems)
# - Linked List (6 problems)
# - Matrix (4 problems)
# - String (10 problems)
# - Tree (14 problems)
# - Heap (3 problems)
# Total: 75 essential problems`
    },
    {
      id: 'ascend-100',
      title: 'Ascend 100',
      icon: 'ascend',
      color: '#10b981',
      questions: 100,
      description: 'Our curated list of 100 must-solve problems for interview success.',
      keyPatterns: ['All major patterns', 'Company favorites', 'Difficulty progression', 'Pattern mastery'],
      timeComplexity: 'Varies by problem',
      spaceComplexity: 'Varies by problem',
      commonProblems: ['Two Sum', 'Valid Parentheses', 'Merge Two Sorted Lists', 'Best Time to Buy/Sell Stock', 'Valid Anagram', 'Binary Search'],
      tips: [
        'Solve in order for progressive difficulty',
        'Covers all patterns tested at top companies',
        'Includes problems from FAANG interviews',
        'Practice until you can solve each in 30 minutes'
      ],
      codeExample: `# Ascend 100 Problem Distribution:
# - Easy: 35 problems (fundamentals)
# - Medium: 50 problems (core patterns)
# - Hard: 15 problems (advanced techniques)

# Focus areas:
# - Arrays & Strings: 25%
# - Trees & Graphs: 25%
# - Dynamic Programming: 20%
# - Other patterns: 30%`
    },
  ];

  // System Design Topics
  const systemDesignTopics = [
    {
      id: 'fundamentals',
      title: 'Fundamentals',
      icon: 'lightbulb',
      color: '#10b981',
      questions: 12,
      description: 'Core concepts every system design interview requires.',
      concepts: ['Scalability', 'Latency vs Throughput', 'Availability vs Consistency', 'DNS', 'CDN', 'Load Balancing'],
      tips: [
        'Always clarify requirements first: functional and non-functional',
        'Back-of-envelope calculations show you understand scale',
        'Know the difference between vertical and horizontal scaling'
      ]
    },
    {
      id: 'databases',
      title: 'Databases',
      icon: 'database',
      color: '#ef4444',
      questions: 15,
      description: 'SQL vs NoSQL, sharding, replication, and indexing strategies.',
      concepts: ['SQL vs NoSQL tradeoffs', 'ACID properties', 'Sharding strategies', 'Replication', 'Indexes', 'CAP theorem'],
      tips: [
        'SQL for complex queries and transactions',
        'NoSQL for flexible schema and horizontal scaling',
        'Shard by user_id for user-centric applications'
      ]
    },
    {
      id: 'caching',
      title: 'Caching',
      icon: 'zap',
      color: '#f59e0b',
      questions: 10,
      description: 'Redis, Memcached, and cache invalidation strategies.',
      concepts: ['Cache-aside', 'Write-through', 'Write-behind', 'TTL', 'LRU eviction', 'Cache stampede'],
      tips: [
        'Cache frequently accessed, rarely changing data',
        'Consider cache invalidation carefully',
        'Use Redis for complex data structures, Memcached for simple key-value'
      ]
    },
    {
      id: 'message-queues',
      title: 'Message Queues',
      icon: 'inbox',
      color: '#ec4899',
      questions: 7,
      description: 'Async processing with Kafka, RabbitMQ, SQS.',
      concepts: ['Pub/Sub', 'Point-to-point', 'At-least-once delivery', 'Exactly-once semantics', 'Dead letter queues'],
      tips: [
        'Use queues to decouple services and handle traffic spikes',
        'Kafka for high-throughput event streaming',
        'SQS for simple async task processing'
      ]
    },
    {
      id: 'api-design',
      title: 'API Design',
      icon: 'code',
      color: '#6366f1',
      questions: 8,
      description: 'REST, GraphQL, gRPC, and API best practices.',
      concepts: ['REST principles', 'GraphQL vs REST', 'gRPC for microservices', 'API versioning', 'Rate limiting', 'Pagination'],
      tips: [
        'Use REST for public APIs, gRPC for internal microservices',
        'GraphQL when clients need flexible queries',
        'Always version your APIs (v1, v2) in the URL or header'
      ]
    },
    {
      id: 'load-balancing',
      title: 'Load Balancing',
      icon: 'share',
      color: '#14b8a6',
      questions: 6,
      description: 'Distribute traffic across servers effectively.',
      concepts: ['Round Robin', 'Least Connections', 'IP Hash', 'Layer 4 vs Layer 7', 'Health checks', 'Session affinity'],
      tips: [
        'Layer 7 (application) for content-based routing',
        'Layer 4 (transport) for raw performance',
        'Use health checks to remove unhealthy servers'
      ]
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting',
      icon: 'shield',
      color: '#f43f5e',
      questions: 5,
      description: 'Protect services from abuse and overload.',
      concepts: ['Token bucket', 'Leaky bucket', 'Fixed window', 'Sliding window', 'Distributed rate limiting'],
      tips: [
        'Token bucket allows burst while maintaining average rate',
        'Sliding window is most accurate but memory-intensive',
        'Use Redis for distributed rate limiting across servers'
      ]
    },
    {
      id: 'microservices',
      title: 'Microservices',
      icon: 'layers',
      color: '#8b5cf6',
      questions: 10,
      description: 'Service decomposition, communication, and orchestration.',
      concepts: ['Service boundaries', 'API Gateway', 'Service discovery', 'Circuit breaker', 'Saga pattern', 'Event sourcing'],
      tips: [
        'Start monolith, extract services when boundaries are clear',
        'Use API gateway for auth, rate limiting, routing',
        'Circuit breaker prevents cascade failures'
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: 'lock',
      color: '#dc2626',
      questions: 8,
      description: 'Authentication, authorization, and data protection.',
      concepts: ['OAuth 2.0', 'JWT', 'HTTPS/TLS', 'Encryption at rest', 'API keys', 'RBAC', 'SQL injection prevention'],
      tips: [
        'Use OAuth 2.0 for third-party auth, JWT for stateless sessions',
        'Always encrypt sensitive data at rest and in transit',
        'Principle of least privilege for access control'
      ]
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Observability',
      icon: 'eye',
      color: '#0ea5e9',
      questions: 6,
      description: 'Logging, metrics, tracing, and alerting.',
      concepts: ['Logs vs Metrics vs Traces', 'Prometheus/Grafana', 'ELK stack', 'Distributed tracing', 'SLIs/SLOs', 'On-call rotation'],
      tips: [
        'Three pillars: Logs, Metrics, Traces',
        'Set SLOs based on user experience, not server metrics',
        'Use distributed tracing for debugging microservices'
      ]
    },
  ];

  // Common System Designs
  const systemDesigns = [
    {
      id: 'url-shortener',
      title: 'URL Shortener',
      subtitle: 'TinyURL / Bit.ly',
      icon: 'link',
      color: '#10b981',
      difficulty: 'Easy',
      description: 'Design a service that creates short aliases for long URLs and redirects users to the original URL.',

      // Comprehensive Editorial Content
      introduction: `Tiny URL (URL shortener) is one of the most popular system design questions. On the surface it appears simple, but it's possible to go deep on scalability issues which interviewers expect.

This covers two solutions: a basic implementation with scalability issues, and an advanced implementation. Discussing the flaws and solutions shows depth of understanding most candidates lack.`,

      functionalRequirements: [
        'Given a long URL, create a short URL',
        'Given a short URL, redirect to the long URL',
        'Custom short URL aliases (optional)',
        'URL expiration (optional)'
      ],

      nonFunctionalRequirements: [
        'Very low latency (< 100ms)',
        'Very high availability (99.99%)',
        'Short URLs should not be predictable',
        'Scale to handle billions of URLs'
      ],

      dataModel: {
        description: 'Simple table storing URL mappings',
        schema: `urls {
  id: bigint (primary key)
  shortUrl: varchar(7) (indexed, unique)
  longUrl: varchar(2048)
  userId: bigint (optional)
  createdAt: timestamp
  expiresAt: timestamp (nullable)
  clickCount: bigint (default 0)
}`
      },

      apiDesign: {
        description: 'RESTful API - simple, stateless, supports caching',
        endpoints: [
          {
            method: 'POST',
            path: '/create-url',
            params: 'longURL, customAlias? (optional)',
            response: '201 Created, returns { shortUrl }',
            notes: 'Creates a new short URL mapping'
          },
          {
            method: 'GET',
            path: '/{short-url}',
            response: '301 Permanent Redirect',
            notes: 'Redirects to the original long URL'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How long should the short URL be?',
          answer: `Need to know scale to answer this:
• Example: 1,000 URLs/second
• 1,000 × 60 × 60 × 24 × 365 = 31.5 billion URLs/year
• 10:1 read:write ratio = ~300 billion reads/year

Using Base62 (a-z, A-Z, 0-9 = 62 characters):
• 6 characters: 62⁶ = 56 billion unique URLs
• 7 characters: 62⁷ = 3.5 trillion unique URLs

7 characters is sufficient for many years of operation.`
        },
        {
          question: 'What characters can we use?',
          answer: `Alphanumeric Base62:
• a-z: 26 characters
• A-Z: 26 characters
• 0-9: 10 characters
• Total: 62 characters

Avoid special characters (/, +, =) as they cause URL encoding issues.`
        }
      ],

      basicImplementation: {
        title: 'Basic Implementation',
        description: `Client → Load Balancer → Web Server → Count Cache → Database

The web server requests a base-10 number from the count cache, converts it to base-62, and uses it as the short URL. This is stored in the database and returned to the user.`,
        architecture: `
┌────────┐    ┌──────────────┐    ┌────────────┐    ┌─────────────┐
│ Client │───▶│ Load Balancer│───▶│ Web Server │───▶│  Database   │
└────────┘    └──────────────┘    └────────────┘    └─────────────┘
                                        │
                                        ▼
                                 ┌─────────────┐
                                 │ Count Cache │
                                 │  (Redis)    │
                                 └─────────────┘`,
        problems: [
          'Single point of failure in web server, cache, and database',
          'When horizontally scaled, distributed caches can return same number → COLLISION',
          'No coordination among caches causes duplicate short URLs',
          'Collisions are unacceptable in this system'
        ]
      },

      advancedImplementation: {
        title: 'Advanced Implementation with ZooKeeper',
        description: `Instead of distributed count caches, use ZooKeeper as a centralized coordination service. ZooKeeper maintains number ranges (1 million values per range). When a web server starts, it gets a range from ZooKeeper and uses those numbers for short URLs. This avoids collisions.`,
        architecture: `
┌────────┐    ┌──────────────┐    ┌────────────┐    ┌─────────────┐
│ Client │───▶│ Load Balancer│───▶│ Web Servers│───▶│  Database   │
└────────┘    └──────────────┘    └────────────┘    └─────────────┘
                                        │                  │
                                        ▼                  ▼
                               ┌─────────────────┐   ┌─────────┐
                               │   ZooKeeper     │   │  Cache  │
                               │ Range Allocator │   │ (Redis) │
                               │ 0 - 1M          │   └─────────┘
                               │ 1M - 2M         │
                               │ 2M - 3M         │
                               │ ...             │
                               └─────────────────┘`,
        keyPoints: [
          'ZooKeeper allocates ranges of 1 million IDs to each web server',
          'Each server generates IDs independently within its range - no collisions',
          'If a server dies, losing 1M IDs is acceptable given 3.5 trillion total',
          'ZooKeeper only contacted when server needs new range (1M requests/contact)',
          'Much less load than per-request coordination'
        ],
        databaseChoice: 'NoSQL (Cassandra) preferred for high read volume; SQL requires sharding',
        caching: 'Redis/Memcached with LRU eviction for popular URLs'
      },

      createFlow: {
        title: 'Create URL Flow',
        steps: [
          'Client makes POST request with long URL to load balancer',
          'Load balancer distributes request to a web server',
          'Web server generates short URL from its allocated range (converts to base62)',
          'Web server saves long URL + short URL in database',
          'Optionally cache the mapping with TTL',
          'Web server responds with the newly created short URL'
        ]
      },

      redirectFlow: {
        title: 'Redirect URL Flow',
        steps: [
          'Client makes GET request with short URL',
          'Load balancer routes to a web server',
          'Web server checks if short URL exists in cache',
          'If cache miss, retrieve long URL from database',
          'Update cache with the mapping',
          'Web server responds with 301 Permanent Redirect to long URL'
        ]
      },

      discussionPoints: [
        {
          topic: 'Analytics',
          points: [
            'Track click counts per URL for caching decisions',
            'Store IP addresses for geographic distribution insights',
            'Determine optimal cache locations based on traffic patterns'
          ]
        },
        {
          topic: 'Rate Limiting',
          points: [
            'Prevent DDoS attacks by malicious users',
            'Limit URL creation per user/IP',
            'Use token bucket or sliding window algorithms'
          ]
        },
        {
          topic: 'Security Considerations',
          points: [
            'Add random suffix to prevent URL prediction/enumeration',
            'Tradeoff: longer URLs vs security (worth discussing)',
            'Scan long URLs for malware/phishing before creating short URL',
            'Implement URL blacklisting'
          ]
        }
      ],

      // Keep backward compatibility
      requirements: ['Shorten long URLs', '301 redirect', 'Analytics', 'Custom aliases', 'Expiration support'],
      components: ['Load Balancer', 'Web Servers', 'ZooKeeper', 'Database (NoSQL)', 'Cache (Redis)'],
      keyDecisions: [
        'Use ZooKeeper for distributed ID range allocation to avoid collisions',
        'Base62 encoding for 7-character short URLs (3.5 trillion unique)',
        'NoSQL database (Cassandra) for horizontal scaling',
        'Redis cache with LRU eviction for popular URLs',
        '301 Permanent Redirect for SEO and caching benefits'
      ]
    },
    {
      id: 'twitter',
      title: 'Twitter / X',
      subtitle: 'Social Media Feed',
      icon: 'messageSquare',
      color: '#3b82f6',
      difficulty: 'Hard',
      description: 'Design a social media platform where users post short messages, follow others, and view personalized timelines.',

      introduction: `Twitter is a classic system design question that tests your understanding of feed generation, fan-out strategies, and handling viral content. The key challenge is delivering personalized timelines to hundreds of millions of users with low latency.

The most interesting aspect is the fan-out problem: when a user tweets, how do you efficiently deliver that tweet to all their followers? This becomes especially challenging for celebrities with millions of followers.`,

      functionalRequirements: [
        'Post tweets (280 character limit)',
        'Follow and unfollow users',
        'View home timeline (feed of followed users)',
        'View user profile and their tweets',
        'Like and retweet',
        'Search tweets and users',
        'Trending topics'
      ],

      nonFunctionalRequirements: [
        'High availability (99.99%)',
        'Low latency timeline reads (<200ms)',
        'Eventual consistency is acceptable',
        'Scale to 500M+ daily active users',
        'Handle viral tweets (celebrity problem)'
      ],

      dataModel: {
        description: 'Core tables for users, tweets, and relationships',
        schema: `users {
  id: bigint PK
  username: varchar(15) unique
  displayName: varchar(50)
  bio: varchar(160)
  followerCount: int
  followingCount: int
  createdAt: timestamp
}

tweets {
  id: bigint PK (Snowflake ID)
  userId: bigint FK
  content: varchar(280)
  mediaUrls: json
  replyToId: bigint nullable
  retweetOf: bigint nullable
  likeCount: int
  retweetCount: int
  createdAt: timestamp
}

follows {
  followerId: bigint
  followeeId: bigint
  createdAt: timestamp
  PRIMARY KEY (followerId, followeeId)
}`
      },

      apiDesign: {
        description: 'RESTful API with cursor-based pagination for infinite scroll',
        endpoints: [
          {
            method: 'POST',
            path: '/api/tweets',
            params: 'content, mediaIds[], replyToId?',
            response: '201 Created { tweetId, createdAt }',
            notes: 'Creates a new tweet, triggers fan-out'
          },
          {
            method: 'GET',
            path: '/api/timeline',
            params: 'cursor?, limit=20',
            response: '200 { tweets[], nextCursor }',
            notes: 'Returns personalized home timeline'
          },
          {
            method: 'POST',
            path: '/api/users/{id}/follow',
            response: '200 { following: true }',
            notes: 'Follow a user'
          },
          {
            method: 'GET',
            path: '/api/search',
            params: 'q, type=tweets|users, cursor?',
            response: '200 { results[], nextCursor }',
            notes: 'Full-text search via Elasticsearch'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How to handle the fan-out problem?',
          answer: `Three approaches:

1. Fan-out on Write (Push Model):
   • When user tweets, push to all followers' timelines
   • Good for users with few followers
   • Problem: Celebrity with 10M followers = 10M writes per tweet

2. Fan-out on Read (Pull Model):
   • Timeline generated on request by fetching from followed users
   • Good for celebrities
   • Problem: Slow for users following many people

3. Hybrid Approach (Twitter's solution):
   • Fan-out on write for users with < 10K followers
   • Fan-out on read for celebrities
   • Best of both worlds`
        },
        {
          question: 'How to generate Snowflake IDs?',
          answer: `64-bit unique IDs that are:
• Sortable by time (first 41 bits = timestamp)
• Globally unique without coordination
• Generated at 10K+ IDs/second per machine

Structure:
| 41 bits timestamp | 10 bits machine ID | 12 bits sequence |
= 69 years × 1024 machines × 4096 IDs/ms`
        }
      ],

      basicImplementation: {
        title: 'Basic Implementation (Fan-out on Write)',
        description: 'When a user posts a tweet, immediately push it to all followers\' timeline caches.',
        architecture: `
┌────────┐    ┌──────────────┐    ┌─────────────┐
│ Client │───▶│ Tweet Service│───▶│  Tweet DB   │
└────────┘    └──────────────┘    └─────────────┘
                     │
                     ▼
              ┌─────────────┐
              │  Fan-out    │
              │  Service    │
              └─────────────┘
                     │
         ┌──────────┴──────────┐
         ▼                     ▼
┌─────────────────┐    ┌─────────────────┐
│ Timeline Cache  │    │ Timeline Cache  │
│  (Follower 1)   │    │  (Follower N)   │
└─────────────────┘    └─────────────────┘`,
        problems: [
          'Celebrity tweets to 10M followers = 10M cache writes',
          'Hot celebrities cause massive write amplification',
          'Wasted storage for inactive users',
          'Delay in tweet appearing (fan-out takes time)'
        ]
      },

      advancedImplementation: {
        title: 'Hybrid Fan-out (Twitter\'s Approach)',
        description: 'Use fan-out on write for regular users (<10K followers), fan-out on read for celebrities. Timeline reads merge cached feed with celebrity tweets fetched on-demand.',
        architecture: `
┌────────┐    ┌──────────────┐    ┌─────────────┐
│ Client │───▶│ Tweet Service│───▶│  Tweet DB   │
└────────┘    └──────────────┘    └─────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│ Fan-out Write │         │ Celebrity     │
│ (< 10K foll.) │         │ Tweet Cache   │
└───────────────┘         └───────────────┘
        │                         │
        ▼                         │
┌───────────────┐                 │
│ User Timeline │◀────────────────┘
│    Cache      │    (merged on read)
└───────────────┘`,
        keyPoints: [
          'Follower threshold (e.g., 10K) determines fan-out strategy',
          'Timeline read merges pre-computed feed + celebrity tweets',
          'Redis sorted sets store timeline (score = timestamp)',
          'Only keep last 800 tweets in cache per user',
          'Celebrities\' tweets fetched and merged on read'
        ],
        databaseChoice: 'MySQL with sharding by userId for tweets; Redis for timeline cache',
        caching: 'Redis sorted sets (ZADD/ZRANGE) with tweet IDs, 800 items max per timeline'
      },

      createFlow: {
        title: 'Post Tweet Flow',
        steps: [
          'Client sends POST /api/tweets with content',
          'Tweet Service validates content (280 chars, spam check)',
          'Generate Snowflake ID for the tweet',
          'Store tweet in Tweet DB (sharded by userId)',
          'Check user\'s follower count',
          'If < 10K followers: Fan-out service pushes tweetId to all followers\' timeline caches',
          'If >= 10K followers: Only store in celebrity cache (no fan-out)',
          'Update user\'s tweet count, return tweetId to client'
        ]
      },

      redirectFlow: {
        title: 'Read Timeline Flow',
        steps: [
          'Client requests GET /api/timeline with cursor',
          'Timeline Service fetches user\'s pre-computed timeline from Redis',
          'Fetch list of celebrities user follows',
          'Query celebrity cache for recent tweets from those celebrities',
          'Merge pre-computed timeline with celebrity tweets',
          'Sort by timestamp, apply cursor pagination',
          'Hydrate tweet IDs with full tweet data',
          'Return tweets with next cursor for pagination'
        ]
      },

      discussionPoints: [
        {
          topic: 'Search Architecture',
          points: [
            'Elasticsearch cluster for full-text search',
            'Index tweets asynchronously via Kafka',
            'Separate indices for tweets vs users',
            'Real-time indexing for trending topics'
          ]
        },
        {
          topic: 'Trending Topics',
          points: [
            'Stream processing (Kafka + Flink) for real-time counts',
            'Count-min sketch for approximate hashtag counting',
            'Time-decay to favor recent activity',
            'Geographic segmentation for local trends'
          ]
        },
        {
          topic: 'Media Storage',
          points: [
            'Store images/videos in object storage (S3)',
            'CDN for global delivery',
            'Transcode videos to multiple resolutions',
            'Lazy loading for timeline performance'
          ]
        }
      ],

      requirements: ['Post tweets (280 chars)', 'Follow/unfollow users', 'Home timeline', 'Search tweets', 'Notifications', 'Trending topics'],
      components: ['Tweet Service', 'Timeline Service', 'Fan-out Service', 'Search (Elasticsearch)', 'Cache (Redis)', 'Notification Service'],
      keyDecisions: [
        'Hybrid fan-out: Push for regular users, pull for celebrities',
        'Snowflake IDs for globally unique, time-sortable tweet IDs',
        'Redis sorted sets for O(log N) timeline operations',
        'Elasticsearch for real-time tweet search',
        'Kafka for async fan-out and search indexing'
      ]
    },
    {
      id: 'uber',
      title: 'Uber / Lyft',
      subtitle: 'Ride-Sharing Service',
      icon: 'mapPin',
      color: '#8b5cf6',
      difficulty: 'Hard',
      description: 'Design a ride-sharing platform that matches riders with nearby drivers in real-time.',

      introduction: `Uber is a location-based service that matches riders with nearby drivers in real-time. The key challenges are efficient geospatial queries (finding nearby drivers), handling millions of location updates per second, and calculating accurate ETAs.

This problem tests your understanding of geospatial indexing, real-time systems, and handling geographic distribution of load.`,

      functionalRequirements: [
        'Riders can request rides with pickup/dropoff locations',
        'Match riders with nearby available drivers',
        'Real-time location tracking during ride',
        'Calculate fare based on distance and time',
        'Driver and rider ratings',
        'Payment processing',
        'Ride history'
      ],

      nonFunctionalRequirements: [
        'Match driver within 30 seconds',
        'Location updates with <1 second latency',
        'Handle 1M+ concurrent drivers',
        '99.99% availability',
        'Surge pricing during high demand'
      ],

      dataModel: {
        description: 'Users (riders/drivers), rides, and location tracking',
        schema: `users {
  id: bigint PK
  type: enum(RIDER, DRIVER)
  name: varchar
  phoneNumber: varchar
  rating: decimal
  paymentMethods: json
}

drivers {
  userId: bigint FK
  vehicleInfo: json
  licenseNumber: varchar
  isAvailable: boolean
  currentLocation: point
  lastLocationUpdate: timestamp
}

rides {
  id: bigint PK
  riderId: bigint FK
  driverId: bigint FK nullable
  pickup: point
  dropoff: point
  status: enum(REQUESTED, MATCHED, ARRIVING, IN_PROGRESS, COMPLETED, CANCELLED)
  fare: decimal nullable
  distance: decimal nullable
  requestedAt: timestamp
  startedAt: timestamp nullable
  completedAt: timestamp nullable
}`
      },

      apiDesign: {
        description: 'REST for ride management, WebSocket for real-time updates',
        endpoints: [
          {
            method: 'POST',
            path: '/api/rides',
            params: 'pickupLocation, dropoffLocation',
            response: '201 { rideId, estimatedFare, estimatedETA }',
            notes: 'Request a ride, triggers driver matching'
          },
          {
            method: 'PUT',
            path: '/api/drivers/location',
            params: 'latitude, longitude, heading, speed',
            response: '200 { success }',
            notes: 'Driver location update (every 3-4 seconds)'
          },
          {
            method: 'GET',
            path: '/api/rides/{id}',
            response: '200 { ride, driverLocation, eta }',
            notes: 'Get ride status with real-time driver location'
          },
          {
            method: 'WS',
            path: '/ws/ride/{id}',
            response: 'Real-time ride updates',
            notes: 'WebSocket for live location during ride'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How to efficiently find nearby drivers?',
          answer: `Geospatial Indexing Options:

1. Geohash:
   • Encode lat/lng into string prefix (e.g., "9q8yyk")
   • Same prefix = nearby locations
   • Query: Find all drivers with prefix "9q8yy*"
   • Pros: Simple, works with any database

2. QuadTree:
   • Recursively divide space into 4 quadrants
   • Each leaf node contains drivers in that area
   • Query: Find leaf containing pickup, get nearby leaves
   • Pros: Adaptive to density, efficient updates

3. S2 Geometry (Google's choice):
   • Maps sphere to cells at multiple levels
   • Better handling of edge cases near poles
   • Used by Google Maps, Uber`
        },
        {
          question: 'How to handle 1M location updates/second?',
          answer: `Write Path Optimization:

1. Batch location updates:
   • Aggregate updates over 1-2 second windows
   • Bulk write to database

2. In-memory spatial index:
   • Keep recent locations in Redis with geospatial commands
   • GEOADD, GEORADIUS for nearby queries

3. Separate hot/warm/cold storage:
   • Hot: Last 5 min in Redis (for matching)
   • Warm: Last 24h in time-series DB (for analytics)
   • Cold: S3 for historical data

4. Cell-based sharding:
   • Divide city into cells
   • Each cell handled by dedicated server
   • Reduces contention`
        }
      ],

      basicImplementation: {
        title: 'Basic Implementation',
        description: 'Simple approach with single database and basic matching.',
        architecture: `
┌────────┐    ┌──────────────┐    ┌─────────────┐
│ Rider  │───▶│ Ride Service │◀───│   Driver    │
│  App   │    └──────────────┘    │     App     │
└────────┘           │            └─────────────┘
                     ▼
              ┌─────────────┐
              │  Database   │
              │  (PostGIS)  │
              └─────────────┘`,
        problems: [
          'Database cannot handle 1M location updates/second',
          'PostGIS queries slow at scale',
          'Single point of failure',
          'No real-time tracking capability'
        ]
      },

      advancedImplementation: {
        title: 'Scalable Implementation with Cell-based Architecture',
        description: 'Divide the city into cells, each managed by dedicated services. Use in-memory spatial index for fast matching.',
        architecture: `
┌────────┐    ┌──────────────┐    ┌─────────────┐
│ Rider  │───▶│   Gateway    │◀───│   Driver    │
└────────┘    └──────────────┘    └─────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Cell A     │ │  Cell B     │ │  Cell C     │
│  Service    │ │  Service    │ │  Service    │
└─────────────┘ └─────────────┘ └─────────────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
              ┌─────────────┐    ┌─────────────┐
              │   Redis     │    │   Kafka     │
              │ (Locations) │    │  (Events)   │
              └─────────────┘    └─────────────┘
                                       │
                                       ▼
                              ┌─────────────┐
                              │    Ride     │
                              │  Database   │
                              └─────────────┘`,
        keyPoints: [
          'Divide city into S2 cells (roughly 1km²)',
          'Each cell service manages drivers in that area',
          'Redis GEOADD/GEORADIUS for O(log N + M) nearby queries',
          'Kafka streams location updates to analytics',
          'Gateway routes requests to appropriate cell',
          'Cross-cell matching when driver moves between cells'
        ],
        databaseChoice: 'PostgreSQL with PostGIS for ride records; Redis for real-time location',
        caching: 'Redis Geo for driver locations, sorted sets for availability'
      },

      createFlow: {
        title: 'Ride Request Flow',
        steps: [
          'Rider opens app, sends pickup and dropoff locations',
          'Gateway determines cell containing pickup location',
          'Route request to that cell\'s matching service',
          'Matching service queries Redis GEORADIUS for drivers within 5km',
          'Filter by availability, rating, vehicle type',
          'Select best match (closest, highest rating)',
          'Send ride request to selected driver via push notification',
          'If driver accepts within 15s, confirm match',
          'If no accept, try next best driver',
          'Return matched driver info and ETA to rider'
        ]
      },

      redirectFlow: {
        title: 'Ride Tracking Flow',
        steps: [
          'Match confirmed, both apps establish WebSocket connection',
          'Driver app sends location updates every 3-4 seconds',
          'Location service updates Redis and broadcasts to rider',
          'Rider app renders driver position on map in real-time',
          'ETA service continuously recalculates arrival time',
          'When driver arrives, status changes to ARRIVING',
          'Rider confirms pickup, ride status changes to IN_PROGRESS',
          'During ride, continue tracking for fare calculation',
          'On arrival at destination, calculate final fare'
        ]
      },

      discussionPoints: [
        {
          topic: 'ETA Calculation',
          points: [
            'Historical travel times by road segment',
            'Real-time traffic from driver locations',
            'Machine learning model for predictions',
            'Update ETA continuously during approach'
          ]
        },
        {
          topic: 'Surge Pricing',
          points: [
            'Monitor supply (drivers) vs demand (requests)',
            'Per-cell surge multiplier',
            'Smooth transitions to avoid gaming',
            'Cap surge at reasonable levels'
          ]
        },
        {
          topic: 'Dispatch Optimization',
          points: [
            'Minimize total wait time across all requests',
            'Consider driver heading (already driving toward pickup)',
            'Balance driver utilization',
            'Handle simultaneous requests'
          ]
        }
      ],

      requirements: ['Match riders with drivers', 'Real-time location tracking', 'ETA calculation', 'Payments', 'Ratings', 'Surge pricing'],
      components: ['Cell Services', 'Redis (Geospatial)', 'Kafka', 'Matching Service', 'ETA Service', 'Payment Service'],
      keyDecisions: [
        'S2/Geohash cells for geographic sharding',
        'Redis GEORADIUS for O(log N) nearby driver queries',
        'WebSocket for real-time location streaming',
        'Kafka for location event processing',
        'Cell-based architecture for horizontal scaling'
      ]
    },
    {
      id: 'youtube',
      title: 'YouTube',
      subtitle: 'Video Streaming',
      icon: 'video',
      color: '#ef4444',
      difficulty: 'Hard',
      description: 'Design a video sharing platform supporting upload, processing, streaming, and recommendations.',

      introduction: `YouTube is the world's largest video sharing platform, handling over 500 hours of video uploaded every minute and serving 1 billion hours of video watched daily. The system must handle massive-scale video upload, processing, storage, and delivery.

The key challenges include efficient video transcoding, global content delivery, search and recommendation at scale, and supporting various viewing experiences (mobile, TV, web).`,

      functionalRequirements: [
        'Upload videos (up to 12 hours, 256GB)',
        'Process videos into multiple resolutions/formats',
        'Stream videos with adaptive bitrate',
        'Search videos by title, description, tags',
        'Recommend videos based on user behavior',
        'Support likes, comments, subscriptions',
        'Live streaming capability',
        'Video analytics (views, watch time, demographics)'
      ],

      nonFunctionalRequirements: [
        'Video available within 10 minutes of upload (for standard quality)',
        'Global playback latency <100ms to start',
        '99.99% availability for streaming',
        'Support 2B+ users, 800M DAU',
        'Handle 500 hours video uploaded per minute',
        'Serve 1 billion hours of video daily'
      ],

      dataModel: {
        description: 'Videos, users, channels, and engagement data',
        schema: `videos {
  id: varchar(11) PK (e.g., "dQw4w9WgXcQ")
  channelId: bigint FK
  title: varchar(100)
  description: text
  uploadStatus: enum(PROCESSING, READY, FAILED)
  duration: int (seconds)
  viewCount: bigint
  likeCount: bigint
  uploadedAt: timestamp
  thumbnailUrl: varchar
}

video_formats {
  videoId: varchar(11) FK
  resolution: enum(360, 480, 720, 1080, 1440, 2160)
  codec: enum(H264, VP9, AV1)
  bitrate: int
  storageUrl: varchar
  segmentManifest: varchar (HLS/DASH)
}

channels {
  id: bigint PK
  userId: bigint FK
  name: varchar(100)
  subscriberCount: bigint
  totalViews: bigint
  createdAt: timestamp
}

watch_history {
  userId: bigint PK
  videoId: varchar(11) PK
  watchedAt: timestamp
  watchDuration: int (seconds)
  completionRate: float
}`
      },

      apiDesign: {
        description: 'Chunked upload for large files, HLS/DASH for streaming',
        endpoints: [
          {
            method: 'POST',
            path: '/api/upload/init',
            params: '{ title, description, tags[], privacy }',
            response: '{ uploadId, uploadUrl, chunkSize }'
          },
          {
            method: 'PUT',
            path: '/api/upload/{uploadId}/chunk',
            params: '{ chunkNumber, data, checksum }',
            response: '{ received: true, progress: 45% }'
          },
          {
            method: 'POST',
            path: '/api/upload/{uploadId}/complete',
            params: '{}',
            response: '{ videoId, status: PROCESSING, eta: 600 }'
          },
          {
            method: 'GET',
            path: '/api/video/{id}/manifest',
            params: '?format=hls|dash',
            response: 'HLS/DASH manifest with quality options'
          },
          {
            method: 'GET',
            path: '/api/feed/home',
            params: '?pageToken=',
            response: '{ videos[], nextPageToken }'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How much storage do we need daily?',
          answer: `500 hours/min × 60 min × 24 hours = 720,000 hours of video/day
Raw upload: ~1GB per hour = 720TB raw/day
Transcoded (5 resolutions): 720TB × 5 = 3.6PB/day
Monthly: 3.6PB × 30 = 108PB/month
This requires massive object storage (S3-like) with hot/cold tiering.`
        },
        {
          question: 'How do we handle peak streaming load?',
          answer: `1B hours watched/day ÷ 86400 sec = 11,574 hours/sec average
Peak is ~3x average = 35,000 hours streaming simultaneously
Average bitrate 5 Mbps = 175 Tbps peak bandwidth
CDN with 100+ PoPs globally, cache hit ratio >95% for popular content.`
        },
        {
          question: 'How long does transcoding take?',
          answer: `Standard: 1-2x realtime (1 hour video = 1-2 hours processing)
Optimized with distributed workers: Process in parallel chunks
Priority queue: Higher priority for popular uploaders
Quick quality first: 360p available in minutes, 4K later`
        }
      ],

      basicImplementation: {
        title: 'Basic Architecture',
        description: 'Monolithic upload, transcoding, and streaming with single CDN',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────┐
│                              YOUTUBE BASIC                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────┐          │
│  │  Client  │─────▶│ API Gateway  │─────▶│  Upload Service  │          │
│  └──────────┘      └──────────────┘      └────────┬─────────┘          │
│                                                    │                    │
│                                           ┌────────▼─────────┐          │
│                                           │   Raw Storage    │          │
│                                           │      (S3)        │          │
│                                           └────────┬─────────┘          │
│                                                    │                    │
│                                           ┌────────▼─────────┐          │
│                                           │  Transcoding     │          │
│                                           │    Workers       │          │
│                                           └────────┬─────────┘          │
│                                                    │                    │
│  ┌──────────┐      ┌──────────────┐      ┌────────▼─────────┐          │
│  │  Client  │◀────▶│     CDN      │◀────▶│ Transcoded Store │          │
│  │ (Watch)  │      │              │      │      (S3)        │          │
│  └──────────┘      └──────────────┘      └──────────────────┘          │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────┐         │
│  │                      Metadata DB                           │         │
│  │    videos | channels | comments | subscriptions            │         │
│  └───────────────────────────────────────────────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`,
        problems: [
          'Single transcoding queue becomes bottleneck',
          'No adaptive bitrate - fixed quality',
          'Single region storage - high latency globally',
          'Basic recommendation - just popular videos',
          'No live streaming support'
        ]
      },

      advancedImplementation: {
        title: 'Production Architecture',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           YOUTUBE PRODUCTION                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  UPLOAD PIPELINE                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │ Client → Chunked Upload → Upload Service → Message Queue            │        │
│  │    │                            │               │                    │        │
│  │    └── Resume Capability        │               ▼                    │        │
│  │                            ┌────▼────┐   ┌──────────────┐           │        │
│  │                            │Raw Store│──▶│  Transcode   │           │        │
│  │                            │  (S3)   │   │  Coordinator │           │        │
│  │                            └─────────┘   └──────┬───────┘           │        │
│  │                                                 │                    │        │
│  │         ┌───────────────────────────────────────┼───────────────┐   │        │
│  │         ▼                   ▼                   ▼               ▼   │        │
│  │   ┌──────────┐        ┌──────────┐        ┌──────────┐   ┌──────┐  │        │
│  │   │ 360p GPU │        │ 720p GPU │        │1080p GPU │   │ 4K   │  │        │
│  │   │ Worker   │        │ Worker   │        │ Worker   │   │Worker│  │        │
│  │   └────┬─────┘        └────┬─────┘        └────┬─────┘   └──┬───┘  │        │
│  │        └───────────────────┼───────────────────┼────────────┘      │        │
│  │                            ▼                                        │        │
│  │                   ┌─────────────────┐                              │        │
│  │                   │ Transcoded Store│                              │        │
│  │                   │ (Multi-Region)  │                              │        │
│  │                   └─────────────────┘                              │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  STREAMING / CDN                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                                                                      │        │
│  │  Client ◀──▶ Edge PoP ◀──▶ Regional PoP ◀──▶ Origin                 │        │
│  │    │           │              │                │                     │        │
│  │    │    ┌──────┴─────┐  ┌─────┴────┐    ┌─────┴────┐               │        │
│  │    │    │Edge Cache  │  │Regional  │    │ Origin   │               │        │
│  │    │    │(Popular)   │  │Cache     │    │ Storage  │               │        │
│  │    │    └────────────┘  └──────────┘    └──────────┘               │        │
│  │    │                                                                 │        │
│  │    └── Adaptive Bitrate (HLS/DASH)                                  │        │
│  │        - Quality selection based on bandwidth                        │        │
│  │        - Seamless quality switching                                  │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  RECOMMENDATION ENGINE                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  User Activity ──▶ Kafka ──▶ ML Pipeline ──▶ Feature Store         │        │
│  │        │                          │                │                 │        │
│  │        │                    ┌─────▼─────┐    ┌────▼────┐           │        │
│  │        │                    │Candidate  │    │Ranking  │           │        │
│  │        │                    │Generation │──▶ │Model    │──▶ Feed   │        │
│  │        │                    │(1000s)    │    │(Top 50) │           │        │
│  │        │                    └───────────┘    └─────────┘           │        │
│  │        │                                                            │        │
│  │        └── Watch history, likes, subscriptions, demographics        │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'Chunked upload with resume: Handle large files (up to 256GB)',
          'Parallel transcoding: Each resolution processed independently',
          'Multi-codec support: H.264 for compatibility, VP9/AV1 for efficiency',
          'Tiered CDN: Edge PoPs for popular content, regional for medium, origin for rare',
          'Two-stage recommendation: Candidate generation (1000s) → Ranking (top 50)',
          'Hot/cold storage: Recent/popular in fast storage, old in Glacier'
        ]
      },

      uploadFlow: {
        title: 'Video Upload Flow',
        steps: [
          'Client initiates upload with POST /api/upload/init, receives uploadId and chunk size',
          'Client splits video into chunks (typically 5-50MB each)',
          'Upload each chunk with checksum, server validates and stores',
          'If network fails, client resumes from last successful chunk',
          'On completion, server merges chunks and queues for transcoding',
          'Transcoding workers pull from queue, process in parallel per resolution',
          'Each resolution generates HLS/DASH segments and manifest',
          'Notify client when first quality (360p) ready, continue processing higher',
          'Update video status to READY, make searchable/recommendable'
        ]
      },

      watchFlow: {
        title: 'Video Watch Flow',
        steps: [
          'Client requests video page, metadata loaded from DB',
          'Request manifest file for adaptive streaming (HLS/DASH)',
          'Manifest contains URLs for each quality level segments',
          'Client measures bandwidth, selects appropriate quality',
          'Request video segments from CDN (edge PoP)',
          'CDN cache hit: Serve immediately from edge',
          'CDN cache miss: Fetch from regional cache or origin',
          'Client buffers segments, adjusts quality based on buffer health',
          'Track watch events: Start, 25%, 50%, 75%, 100% completion',
          'Send analytics asynchronously to Kafka for processing'
        ]
      },

      discussionPoints: [
        {
          topic: 'Adaptive Bitrate Streaming',
          points: [
            'HLS (Apple) vs DASH (Google) - most use both',
            'Video split into 2-10 second segments',
            'Manifest lists all available quality levels',
            'Client decides quality based on bandwidth/buffer',
            'Seamless quality transitions during playback'
          ]
        },
        {
          topic: 'Video Transcoding Optimization',
          points: [
            'GPU-accelerated encoding (NVENC, Intel QSV)',
            'Per-title encoding: Optimize bitrate per content type',
            'Scene detection for efficient keyframe placement',
            'Parallel encoding: Split video, encode chunks, merge',
            'Priority queuing: Popular uploaders get faster processing'
          ]
        },
        {
          topic: 'Content Delivery at Scale',
          points: [
            'CDN with 100+ global PoPs',
            'Predictive pre-warming: Cache likely viral content',
            'Long-tail challenge: Most videos rarely watched',
            'Cost optimization: Hot/warm/cold storage tiers',
            'Regional origin replication for disaster recovery'
          ]
        },
        {
          topic: 'Recommendation System',
          points: [
            'Watch time is primary optimization metric',
            'Collaborative filtering: Similar users like similar videos',
            'Content-based: Analyze video features (topics, thumbnails)',
            'Deep learning: Two-tower models for candidate generation',
            'Explore vs exploit: Balance showing popular vs new content'
          ]
        }
      ],

      requirements: ['Upload videos', 'Stream videos globally', 'Search', 'Recommendations', 'Comments', 'Live streaming'],
      components: ['Upload service', 'Transcoding pipeline', 'CDN', 'Metadata DB', 'Search service', 'Recommendation engine'],
      keyDecisions: [
        'Async transcoding: Upload triggers job queue → multiple resolutions',
        'CDN for global delivery: Cache popular videos at edge',
        'Adaptive bitrate (HLS/DASH): Client switches quality based on bandwidth',
        'Chunked upload for large files with resume capability',
        'Separate hot/cold storage: S3 Glacier for old videos'
      ]
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Messaging Service',
      icon: 'messageCircle',
      color: '#25d366',
      difficulty: 'Hard',
      description: 'Design a real-time messaging application supporting 1-1 chat, group chat, and media sharing.',

      introduction: `WhatsApp is a real-time messaging system handling billions of messages daily. The key challenges are maintaining persistent connections, ensuring message delivery even when users are offline, and implementing end-to-end encryption.

Unlike social media feeds, messaging requires strong delivery guarantees - users expect messages to arrive in order and not be lost. This makes the consistency and reliability requirements much stricter.`,

      functionalRequirements: [
        'One-on-one messaging',
        'Group chat (up to 256 members)',
        'Media sharing (images, videos, documents)',
        'Read receipts (sent, delivered, read)',
        'Online/last seen status',
        'Typing indicators',
        'Message history sync across devices'
      ],

      nonFunctionalRequirements: [
        'Real-time delivery (<100ms when both online)',
        'Guaranteed delivery (even if recipient offline)',
        'End-to-end encryption',
        'Message ordering within conversation',
        'Support 2B+ users, 500M DAU',
        'Handle 100B+ messages/day'
      ],

      dataModel: {
        description: 'Users, conversations, and messages with delivery tracking',
        schema: `users {
  id: bigint PK
  phoneNumber: varchar(15) unique
  publicKey: blob (for E2E encryption)
  lastSeen: timestamp
  pushToken: varchar (for notifications)
}

conversations {
  id: bigint PK
  type: enum(DIRECT, GROUP)
  name: varchar (for groups)
  participants: bigint[]
  createdAt: timestamp
}

messages {
  id: uuid PK
  conversationId: bigint FK
  senderId: bigint FK
  content: blob (encrypted)
  mediaUrl: varchar nullable
  sentAt: timestamp
  deliveredAt: timestamp nullable
  readAt: timestamp nullable
}`
      },

      apiDesign: {
        description: 'WebSocket for real-time + REST for offline sync',
        endpoints: [
          {
            method: 'WS',
            path: '/ws/chat',
            params: 'authToken in header',
            response: 'Bidirectional message stream',
            notes: 'Primary channel for real-time messaging'
          },
          {
            method: 'POST',
            path: '/api/messages',
            params: 'conversationId, content, mediaUrl?',
            response: '201 { messageId, sentAt }',
            notes: 'Fallback when WebSocket unavailable'
          },
          {
            method: 'GET',
            path: '/api/conversations/{id}/messages',
            params: 'before?, limit=50',
            response: '200 { messages[], hasMore }',
            notes: 'Sync message history'
          },
          {
            method: 'PUT',
            path: '/api/messages/{id}/read',
            response: '200 { readAt }',
            notes: 'Mark message as read'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How to handle offline message delivery?',
          answer: `Message Queue Pattern:

1. Sender sends message via WebSocket
2. Server stores in persistent queue for recipient
3. If recipient online: deliver immediately via WebSocket
4. If recipient offline: hold in queue
5. When recipient connects: flush queued messages
6. Recipient ACKs receipt → remove from queue

Use Kafka or similar for reliable message queuing with
at-least-once delivery semantics.`
        },
        {
          question: 'How to scale WebSocket connections?',
          answer: `Connection Management:

• 500M concurrent connections ÷ 100K per server = 5000 servers
• Use consistent hashing to route user to specific chat server
• Store connection mapping: userId → serverId in Redis
• For cross-server messaging:
  1. Look up recipient's server
  2. Route message via internal message bus

Sticky sessions ensure reconnection goes to same server.`
        }
      ],

      basicImplementation: {
        title: 'Basic Implementation',
        description: 'Single chat server handling WebSocket connections and message routing.',
        architecture: `
┌────────┐    ┌──────────────┐    ┌─────────────┐
│ Client │◀══▶│  Chat Server │───▶│ Message DB  │
│  (WS)  │    │  (WebSocket) │    └─────────────┘
└────────┘    └──────────────┘
                     │
                     ▼
              ┌─────────────┐
              │   Redis     │
              │ (Sessions)  │
              └─────────────┘`,
        problems: [
          'Single server limits concurrent connections',
          'No message persistence if server crashes',
          'Cannot route between users on different servers',
          'No offline message delivery'
        ]
      },

      advancedImplementation: {
        title: 'Distributed Chat System',
        description: 'Multiple chat servers with message broker for cross-server communication and persistent message queue for offline delivery.',
        architecture: `
┌────────┐    ┌──────────────┐    ┌─────────────┐
│ Client │◀══▶│   Gateway    │───▶│ Chat Server │
│  (WS)  │    │ (Load Bal.)  │    │   Cluster   │
└────────┘    └──────────────┘    └─────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
             ┌───────────┐      ┌─────────────┐     ┌─────────────┐
             │  Kafka    │      │   Redis     │     │ Message DB  │
             │ (Message  │      │ (Sessions/  │     │ (Cassandra) │
             │   Bus)    │      │  Presence)  │     └─────────────┘
             └───────────┘      └─────────────┘
                    │
                    ▼
             ┌─────────────┐
             │ Push Service│
             │  (Offline)  │
             └─────────────┘`,
        keyPoints: [
          'Consistent hashing routes users to specific chat servers',
          'Kafka enables cross-server message routing',
          'Redis stores session mapping (userId → serverId)',
          'Cassandra for message persistence (write-heavy workload)',
          'Push notifications via FCM/APNs for offline users',
          'Message queue holds messages until delivery confirmed'
        ],
        databaseChoice: 'Cassandra - optimized for write-heavy workloads, eventual consistency acceptable',
        caching: 'Redis for session storage, recent messages cache, presence status'
      },

      createFlow: {
        title: 'Send Message Flow',
        steps: [
          'Sender types message, client encrypts with recipient\'s public key',
          'Client sends encrypted message via WebSocket',
          'Chat server receives message, generates messageId and timestamp',
          'Store message in Cassandra with status=SENT',
          'Look up recipient\'s chat server from Redis session store',
          'If recipient online: Route message via Kafka to their chat server',
          'If recipient offline: Queue message, trigger push notification',
          'Recipient\'s chat server delivers to client via WebSocket',
          'Client ACKs delivery → update status to DELIVERED',
          'When recipient reads → update status to READ, notify sender'
        ]
      },

      redirectFlow: {
        title: 'Receive Message Flow',
        steps: [
          'User opens app, establishes WebSocket connection',
          'Chat server registers connection in Redis session store',
          'Server checks message queue for pending messages',
          'Deliver all queued messages via WebSocket',
          'Client decrypts messages with private key',
          'Client sends delivery ACK for each message',
          'Server updates message status, removes from queue',
          'Server notifies sender of delivery status'
        ]
      },

      discussionPoints: [
        {
          topic: 'End-to-End Encryption',
          points: [
            'Signal Protocol for E2E encryption',
            'Key exchange during first message',
            'Server cannot read message content',
            'Forward secrecy with ratcheting keys'
          ]
        },
        {
          topic: 'Group Messaging',
          points: [
            'Fan-out to all group members',
            'Sender keys optimization (encrypt once)',
            'Group size limit (256) for performance',
            'Admin controls for membership'
          ]
        },
        {
          topic: 'Media Handling',
          points: [
            'Encrypt media before upload',
            'Store in object storage (S3)',
            'CDN for delivery, signed URLs',
            'Thumbnail generation for previews'
          ]
        }
      ],

      requirements: ['1-1 messaging', 'Group chat (256 members)', 'Media sharing', 'Read receipts', 'Online status', 'End-to-end encryption'],
      components: ['Chat Servers', 'Kafka (Message Bus)', 'Redis (Sessions)', 'Cassandra', 'Push Service', 'Media Service'],
      keyDecisions: [
        'WebSocket for real-time bidirectional communication',
        'Kafka for cross-server message routing',
        'Message queue with ACK for guaranteed delivery',
        'Signal Protocol for end-to-end encryption',
        'Cassandra for write-heavy message storage'
      ]
    },
    {
      id: 'instagram',
      title: 'Instagram',
      subtitle: 'Photo Sharing',
      icon: 'camera',
      color: '#e4405f',
      difficulty: 'Medium',
      description: 'Design a photo-sharing social network with feeds, stories, and social features.',

      introduction: `Instagram is a photo and video sharing social network with over 2 billion monthly active users. The system handles image uploads, processing, feed generation, stories, and social interactions at massive scale.

The key challenges include generating personalized feeds for hundreds of millions of users, processing and delivering billions of images daily, and implementing ephemeral content (Stories) that disappears after 24 hours.`,

      functionalRequirements: [
        'Upload photos and videos with filters',
        'Create posts with captions and hashtags',
        'Generate personalized news feed',
        'Stories (disappear after 24 hours)',
        'Follow/unfollow users',
        'Like and comment on posts',
        'Direct messaging (DMs)',
        'Explore page with trending content',
        'User search and hashtag discovery'
      ],

      nonFunctionalRequirements: [
        'Feed loads in <500ms',
        'Media upload completes in <5 seconds',
        'Stories available within 1 second of posting',
        'Support 2B+ users, 500M DAU',
        'Handle 95M+ posts per day',
        '99.9% availability'
      ],

      dataModel: {
        description: 'Users, posts, media, and social graph',
        schema: `users {
  id: bigint PK
  username: varchar(30) unique
  displayName: varchar(100)
  bio: text
  profilePicUrl: varchar
  followerCount: int
  followingCount: int
  postCount: int
  isPrivate: boolean
  createdAt: timestamp
}

posts {
  id: bigint PK
  userId: bigint FK
  caption: text
  location: varchar
  likeCount: int
  commentCount: int
  createdAt: timestamp
}

media {
  id: bigint PK
  postId: bigint FK
  type: enum(IMAGE, VIDEO, CAROUSEL)
  url: varchar
  thumbnailUrl: varchar
  width: int
  height: int
  duration: int (for video)
  orderIndex: int
}

stories {
  id: bigint PK
  userId: bigint FK
  mediaUrl: varchar
  type: enum(IMAGE, VIDEO)
  createdAt: timestamp
  expiresAt: timestamp (createdAt + 24h)
  viewCount: int
}

follows {
  followerId: bigint PK
  followeeId: bigint PK
  createdAt: timestamp
  status: enum(ACTIVE, PENDING) -- for private accounts
}

feed_cache {
  userId: bigint PK
  posts: jsonb -- pre-computed list of postIds
  updatedAt: timestamp
}`
      },

      apiDesign: {
        description: 'REST APIs for posts, feed, and social features',
        endpoints: [
          {
            method: 'POST',
            path: '/api/media/upload',
            params: '{ type: IMAGE|VIDEO, data }',
            response: '{ mediaId, uploadUrl }'
          },
          {
            method: 'POST',
            path: '/api/post',
            params: '{ mediaIds[], caption, location, tags[] }',
            response: '{ postId, createdAt }'
          },
          {
            method: 'GET',
            path: '/api/feed',
            params: '?cursor=&limit=20',
            response: '{ posts[], nextCursor }'
          },
          {
            method: 'GET',
            path: '/api/stories',
            params: '',
            response: '{ stories[] grouped by user }'
          },
          {
            method: 'POST',
            path: '/api/story',
            params: '{ mediaId }',
            response: '{ storyId, expiresAt }'
          },
          {
            method: 'POST',
            path: '/api/follow/{userId}',
            params: '{}',
            response: '{ status: FOLLOWING|PENDING }'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How do we generate feeds for 500M daily users?',
          answer: `Two approaches:
1. Push model (active users): Pre-generate feed when followees post
   - Store feed in Redis/Cassandra cache
   - Update on new posts from followed users
   - Good for users with <1000 followings

2. Pull model (inactive/celebrity followers): Generate on-demand
   - Query posts from followed users at read time
   - Merge and rank in real-time
   - Cache result for short TTL

Hybrid: Push for regular users, pull for celebrity followers (>1M)`
        },
        {
          question: 'How much storage for images?',
          answer: `95M posts/day × average 1.5 images/post = 142M images/day
Average image 2MB (multiple resolutions) = 284TB/day
Monthly: 284TB × 30 = 8.5PB/month
Use object storage (S3) with CDN caching for delivery.
Generate thumbnails + multiple resolutions (150px, 320px, 640px, 1080px).`
        },
        {
          question: 'How do Stories work with 24h expiry?',
          answer: `Store stories with createdAt and expiresAt (createdAt + 24h)
Query: WHERE expiresAt > NOW() for active stories
Background job cleans up expired stories
Use Redis sorted set with expiry timestamp as score
Ring buffer pattern: Stories are circular, auto-evict after 24h`
        }
      ],

      basicImplementation: {
        title: 'Basic Architecture',
        description: 'Monolithic service with pull-based feed generation',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────┐
│                           INSTAGRAM BASIC                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────┐          │
│  │  Client  │─────▶│ API Gateway  │─────▶│   App Server     │          │
│  └──────────┘      └──────────────┘      └────────┬─────────┘          │
│                                                    │                    │
│                    ┌───────────────────────────────┼──────────────┐     │
│                    │                               │              │     │
│               ┌────▼────┐    ┌─────────┐    ┌─────▼────┐        │     │
│               │ Media   │    │ Users   │    │  Posts   │        │     │
│               │ Storage │    │   DB    │    │   DB     │        │     │
│               │  (S3)   │    │(Postgres)│   │(Postgres)│        │     │
│               └─────────┘    └─────────┘    └──────────┘        │     │
│                    │                                              │     │
│               ┌────▼──────────────────────────────────────┐      │     │
│               │                   CDN                      │      │     │
│               └────────────────────────────────────────────┘      │     │
│                                                                         │
│  FEED GENERATION (Pull Model):                                          │
│  1. Get list of followed users                                         │
│  2. Query recent posts from each user                                  │
│  3. Merge, sort by timestamp                                           │
│  4. Return top N posts                                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`,
        problems: [
          'Feed query is slow: N+1 queries for each followed user',
          'Celebrities cause fan-out explosion',
          'No ranking - just chronological',
          'Stories not efficiently handled',
          'Single database becomes bottleneck'
        ]
      },

      advancedImplementation: {
        title: 'Production Architecture',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INSTAGRAM PRODUCTION                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  MEDIA UPLOAD PIPELINE                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │ Client ─▶ Upload Service ─▶ S3 Raw ─▶ Image Processing Queue       │        │
│  │                                              │                       │        │
│  │         ┌───────────────────────────────────┼───────────────┐       │        │
│  │         ▼                   ▼               ▼               ▼       │        │
│  │   ┌──────────┐        ┌──────────┐   ┌──────────┐    ┌──────────┐  │        │
│  │   │Thumbnail │        │  320px   │   │  640px   │    │  1080px  │  │        │
│  │   │ 150px    │        │ resize   │   │ resize   │    │ original │  │        │
│  │   └────┬─────┘        └────┬─────┘   └────┬─────┘    └────┬─────┘  │        │
│  │        └───────────────────┴──────────────┴───────────────┘        │        │
│  │                            ▼                                        │        │
│  │                   ┌─────────────────┐                              │        │
│  │                   │  S3 Processed   │─▶ CDN                        │        │
│  │                   └─────────────────┘                              │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  FEED GENERATION (Hybrid Push/Pull)                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                                                                      │        │
│  │  NEW POST ───▶ Fan-out Service                                      │        │
│  │                     │                                                │        │
│  │     ┌───────────────┼────────────────┐                              │        │
│  │     ▼               ▼                ▼                              │        │
│  │ ┌────────┐    ┌──────────┐    ┌──────────────┐                     │        │
│  │ │Active  │    │ Regular  │    │ Celebrity    │                     │        │
│  │ │Follower│    │ Follower │    │ Followers    │                     │        │
│  │ │(<1000) │    │ (1K-100K)│    │   (>100K)    │                     │        │
│  │ │        │    │          │    │              │                     │        │
│  │ │  PUSH  │    │  PUSH    │    │   SKIP       │                     │        │
│  │ │to feed │    │ to feed  │    │ (pull later) │                     │        │
│  │ │ cache  │    │  cache   │    │              │                     │        │
│  │ └────────┘    └──────────┘    └──────────────┘                     │        │
│  │                                                                      │        │
│  │  FEED READ ───▶ Feed Service                                        │        │
│  │                     │                                                │        │
│  │     ┌───────────────┴────────────────┐                              │        │
│  │     ▼                                ▼                              │        │
│  │ ┌──────────┐                  ┌──────────────┐                     │        │
│  │ │Get cached│                  │Pull celebrity│                     │        │
│  │ │feed posts│──────────────────│posts on-demand│                    │        │
│  │ └────┬─────┘                  └──────┬───────┘                     │        │
│  │      └────────────┬──────────────────┘                              │        │
│  │                   ▼                                                  │        │
│  │           ┌──────────────┐                                          │        │
│  │           │ ML Ranker    │ ─▶ Personalized Feed                    │        │
│  │           │(engagement)  │                                          │        │
│  │           └──────────────┘                                          │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  STORIES                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  Redis Cluster (Sorted Set per user)                                │        │
│  │  ┌─────────────────────────────────────────────────────────┐        │        │
│  │  │ user:123:stories = { storyId: expiryTimestamp, ... }   │        │        │
│  │  │                                                         │        │        │
│  │  │ TTL-based cleanup: ZREMRANGEBYSCORE stories 0 NOW()    │        │        │
│  │  └─────────────────────────────────────────────────────────┘        │        │
│  │                                                                      │        │
│  │  Query: ZRANGEBYSCORE user:123:stories NOW() +INF                   │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'Hybrid feed model: Push for regular users, pull for celebrity followers',
          'Image processing pipeline: Multiple resolutions generated async',
          'ML-based ranking: Optimize for engagement, not just chronology',
          'Stories in Redis: Sorted sets with TTL for 24h expiry',
          'Sharding: Users sharded by userId, posts by postId',
          'CDN caching: Popular images cached at edge locations'
        ]
      },

      postFlow: {
        title: 'Create Post Flow',
        steps: [
          'Client uploads media to pre-signed S3 URL',
          'Image processing queue picks up raw image',
          'Generate multiple resolutions (150, 320, 640, 1080px)',
          'Apply filters if requested (server-side or client-side)',
          'Store processed images in S3, update URLs in DB',
          'Create post record with mediaIds, caption, tags',
          'Fan-out service triggers: push to followers feed caches',
          'For users with many followers, skip push (pull model)',
          'Update hashtag counts for Explore page',
          'Send notifications to tagged users'
        ]
      },

      feedFlow: {
        title: 'Feed Generation Flow',
        steps: [
          'Client requests feed with cursor for pagination',
          'Check feed cache (Redis) for pre-computed posts',
          'If cache hit and fresh: return cached posts',
          'If cache miss or stale: regenerate feed',
          'Fetch pushed posts from feed cache',
          'Pull recent posts from followed celebrities',
          'Merge all posts, remove duplicates',
          'ML ranking: Score by engagement, recency, relationship',
          'Cache ranked feed with short TTL (5 min)',
          'Return paginated results with media URLs'
        ]
      },

      discussionPoints: [
        {
          topic: 'Feed Ranking Algorithm',
          points: [
            'Engagement signals: likes, comments, saves, shares',
            'Relationship: Close friends weighted higher',
            'Recency: Decay factor for older posts',
            'Interest: Match with users past engagement patterns',
            'Diversity: Avoid showing too many posts from same user'
          ]
        },
        {
          topic: 'Celebrity Problem',
          points: [
            'Celebrities have millions of followers',
            'Pushing to all followers on every post is expensive',
            'Solution: Pull model for celebrity content',
            'Hybrid approach based on follower count threshold',
            'Async fan-out with priority queues'
          ]
        },
        {
          topic: 'Stories Architecture',
          points: [
            'Ephemeral content - auto-deletes after 24h',
            'Redis sorted sets for efficient range queries',
            'Story ring at top of feed - separate from main feed',
            'View tracking: Who viewed your story',
            'Story highlights: Saved stories that persist'
          ]
        },
        {
          topic: 'Image Optimization',
          points: [
            'Multiple resolutions for different devices',
            'WebP format for smaller file sizes',
            'Lazy loading in feed - load as user scrolls',
            'Blur placeholders while loading',
            'CDN with aggressive caching for popular images'
          ]
        }
      ],

      requirements: ['Upload photos/videos', 'Apply filters', 'News feed', 'Stories (24h)', 'Follow users', 'Likes/comments', 'Direct messages'],
      components: ['Media service', 'Feed service', 'User service', 'CDN', 'Search', 'Notification service'],
      keyDecisions: [
        'Pre-generate feed for active users (push model)',
        'CDN for image/video delivery worldwide',
        'Stories: TTL-based storage with Redis',
        'Image processing pipeline: resize, compress, filter',
        'Shard user data by userId for locality'
      ]
    },
    {
      id: 'dropbox',
      title: 'Dropbox / Google Drive',
      subtitle: 'File Storage',
      icon: 'folder',
      color: '#0061ff',
      difficulty: 'Hard',
      description: 'Design a cloud file storage system with sync, sharing, and real-time collaboration.',

      introduction: `Dropbox and Google Drive are cloud file storage services that allow users to store files online and sync them across multiple devices. The key challenges include efficient file synchronization (only transferring changes), handling large files, maintaining consistency across devices, and supporting real-time collaboration.

The system must handle millions of concurrent users, petabytes of data, and ensure files are never lost while remaining responsive.`,

      functionalRequirements: [
        'Upload and download files of any size',
        'Sync files across multiple devices automatically',
        'File and folder sharing with permissions',
        'File versioning and history',
        'Real-time collaboration on documents',
        'Offline access with local caching',
        'Search files by name and content',
        'File organization (folders, favorites, tags)'
      ],

      nonFunctionalRequirements: [
        'Sync latency <30 seconds for small files',
        'Support files up to 50GB',
        '99.99% durability - never lose data',
        '99.9% availability',
        'Efficient bandwidth usage (delta sync)',
        'Support 500M+ users, 100M DAU'
      ],

      dataModel: {
        description: 'Files, folders, blocks, and sharing metadata',
        schema: `files {
  id: uuid PK
  userId: bigint FK
  parentFolderId: uuid FK nullable
  name: varchar(255)
  size: bigint
  contentHash: varchar(64) -- SHA-256 of full file
  blockHashes: varchar[] -- ordered list of block hashes
  version: int
  mimeType: varchar
  isDeleted: boolean
  createdAt: timestamp
  modifiedAt: timestamp
}

blocks {
  hash: varchar(64) PK -- content-addressed
  size: int
  storageUrl: varchar -- S3 location
  referenceCount: int -- for deduplication
}

file_versions {
  fileId: uuid FK
  version: int
  blockHashes: varchar[]
  modifiedAt: timestamp
  modifiedBy: bigint FK
}

shares {
  id: uuid PK
  fileId: uuid FK
  sharedWith: bigint FK (userId or groupId)
  permission: enum(VIEW, EDIT, OWNER)
  shareLink: varchar unique nullable
  expiresAt: timestamp nullable
}

sync_cursors {
  userId: bigint PK
  deviceId: varchar PK
  cursor: varchar -- position in change stream
  lastSyncAt: timestamp
}`
      },

      apiDesign: {
        description: 'Block-level APIs for efficient sync, with metadata separation',
        endpoints: [
          {
            method: 'GET',
            path: '/api/files/{id}/metadata',
            params: '',
            response: '{ id, name, size, contentHash, blockHashes[], version }'
          },
          {
            method: 'POST',
            path: '/api/files/upload/init',
            params: '{ path, size, contentHash }',
            response: '{ uploadId, missingBlockHashes[] }'
          },
          {
            method: 'PUT',
            path: '/api/blocks/{hash}',
            params: 'binary block data',
            response: '{ stored: true }'
          },
          {
            method: 'POST',
            path: '/api/files/upload/complete',
            params: '{ uploadId, blockHashes[] }',
            response: '{ fileId, version }'
          },
          {
            method: 'GET',
            path: '/api/sync/changes',
            params: '?cursor=',
            response: '{ changes[], newCursor, hasMore }'
          },
          {
            method: 'POST',
            path: '/api/share',
            params: '{ fileId, email, permission }',
            response: '{ shareId, shareLink }'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How does block-level sync work?',
          answer: `Files are split into fixed-size blocks (typically 4MB).
Each block is hashed (SHA-256) for identification.

When syncing:
1. Client computes block hashes locally
2. Sends hashes to server
3. Server returns which blocks it doesn't have
4. Client uploads only missing/changed blocks
5. Server assembles file from blocks

Benefits:
- Small change in large file = upload one block
- Deduplication: Same block only stored once globally
- Resume interrupted uploads: Skip already-uploaded blocks`
        },
        {
          question: 'How do we handle conflicts?',
          answer: `Conflicts occur when same file modified on multiple devices offline.

Detection:
- Each device tracks version number
- On sync, compare local vs server version
- If server version > local expected = conflict

Resolution options:
1. Last-writer-wins (by timestamp)
2. Create conflicted copy (Dropbox approach)
3. Three-way merge for text files
4. User chooses which version to keep

For real-time collaboration (Google Docs), use OT/CRDT to merge concurrent edits.`
        },
        {
          question: 'How do we notify devices of changes?',
          answer: `Options:
1. Polling: Simple but delayed and wasteful
2. Long polling: Client holds connection, server responds on change
3. WebSocket: Bidirectional, real-time, persistent connection
4. Server-Sent Events (SSE): One-way push from server

Dropbox uses long polling with fallback to regular polling.
Changes are pushed through notification service, client then fetches full delta.`
        }
      ],

      basicImplementation: {
        title: 'Basic Architecture',
        description: 'Simple upload/download without block-level sync',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────┐
│                           DROPBOX BASIC                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────┐          │
│  │  Client  │─────▶│ API Gateway  │─────▶│   File Service   │          │
│  │  (Sync)  │      └──────────────┘      └────────┬─────────┘          │
│  └──────────┘                                      │                    │
│                                           ┌────────┴────────┐           │
│                                           │                 │           │
│                                    ┌──────▼──────┐   ┌──────▼──────┐   │
│                                    │  Metadata   │   │  File Store │   │
│                                    │     DB      │   │    (S3)     │   │
│                                    └─────────────┘   └─────────────┘   │
│                                                                         │
│  SYNC PROCESS:                                                          │
│  1. Poll server for changes every 30 seconds                           │
│  2. Download entire changed files                                      │
│  3. Upload entire modified files                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`,
        problems: [
          'Entire file uploaded/downloaded on any change',
          'Polling wastes bandwidth when no changes',
          'No deduplication - duplicate files stored multiple times',
          'Conflicts not handled gracefully',
          'No offline support'
        ]
      },

      advancedImplementation: {
        title: 'Production Architecture',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DROPBOX PRODUCTION                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  CLIENT (Desktop/Mobile)                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │        │
│  │  │ File Watcher│  │Block Chunker│  │  Local DB   │  │Sync Engine│  │        │
│  │  │ (inotify)   │  │(4MB blocks) │  │(SQLite)     │  │           │  │        │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │        │
│  │         └────────────────┴────────────────┴───────────────┘        │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                      │                                           │
│                                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                            API GATEWAY                               │        │
│  │    Load Balancer → Auth → Rate Limit → Route to Service             │        │
│  └────────────────────────────────────┬────────────────────────────────┘        │
│                                       │                                          │
│     ┌─────────────────────────────────┼─────────────────────────────────┐       │
│     │                                 │                                  │       │
│     ▼                                 ▼                                  ▼       │
│  ┌──────────────┐            ┌──────────────┐               ┌────────────────┐  │
│  │ Block Server │            │Metadata Svc  │               │ Notification   │  │
│  │              │            │              │               │    Service     │  │
│  │ - Upload     │            │- File tree   │               │                │  │
│  │ - Download   │            │- Versions    │               │ - Long polling │  │
│  │ - Dedup check│            │- Permissions │               │ - WebSocket    │  │
│  └──────┬───────┘            └──────┬───────┘               └────────────────┘  │
│         │                           │                                            │
│         ▼                           ▼                                            │
│  ┌──────────────┐            ┌──────────────┐                                   │
│  │ Block Store  │            │ Metadata DB  │                                   │
│  │    (S3)      │            │  (Postgres)  │                                   │
│  │              │            │              │                                   │
│  │Content-addr- │            │- Sharded by  │                                   │
│  │essed storage │            │  userId      │                                   │
│  │              │            │- Versioned   │                                   │
│  └──────────────┘            └──────────────┘                                   │
│                                                                                  │
│  SYNC FLOW                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  1. File change detected → compute block hashes                      │        │
│  │  2. Send hashes to server → receive missing block list              │        │
│  │  3. Upload only missing blocks (dedup!)                              │        │
│  │  4. Commit file metadata with new block list                        │        │
│  │  5. Notification service pushes change to other devices             │        │
│  │  6. Other devices sync only changed blocks                          │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  DEDUPLICATION                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  Block Hash: SHA-256 of block content                               │        │
│  │  Same content → Same hash → Stored once globally                    │        │
│  │                                                                      │        │
│  │  Example: 1M users upload same PDF                                  │        │
│  │           → Stored ONCE, referenced 1M times                        │        │
│  │           → Massive storage savings                                 │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'Block-level sync: 4MB chunks, only upload changed blocks',
          'Content-addressed storage: SHA-256 hash as block ID',
          'Global deduplication: Same block stored once across all users',
          'Long polling for instant sync notifications',
          'Client-side chunking: Work happens on client, server just stores blocks',
          'Metadata/data separation: Different scaling requirements'
        ]
      },

      uploadFlow: {
        title: 'File Upload Flow',
        steps: [
          'Client detects file change via filesystem watcher',
          'Split file into 4MB blocks',
          'Compute SHA-256 hash for each block',
          'Send block hashes to server (not data yet)',
          'Server checks which blocks already exist (dedup check)',
          'Server returns list of missing blocks',
          'Client uploads only missing blocks in parallel',
          'Server stores blocks with hash as key',
          'Client sends commit request with ordered block list',
          'Server creates new file version, updates metadata',
          'Notification sent to users other devices'
        ]
      },

      syncFlow: {
        title: 'Sync Flow (Changes)',
        steps: [
          'Client maintains long-poll connection to notification service',
          'When server has changes, connection returns with delta cursor',
          'Client fetches change list from cursor',
          'For each changed file, get metadata including block hashes',
          'Check which blocks client already has locally',
          'Download only missing blocks',
          'Assemble file from blocks',
          'Update local database with new version',
          'Update cursor position for next sync'
        ]
      },

      discussionPoints: [
        {
          topic: 'Chunking Strategies',
          points: [
            'Fixed-size (4MB): Simple, good for random access',
            'Content-defined (Rabin fingerprinting): Better dedup across versions',
            'Trade-off: Content-defined better for text, fixed better for binary',
            'Block size: Smaller = more metadata, larger = less dedup benefit',
            'Dropbox uses 4MB fixed blocks'
          ]
        },
        {
          topic: 'Conflict Resolution',
          points: [
            'Dropbox: Creates "conflicted copy" file',
            'Google Drive: Last writer wins with version history',
            'Real-time collab: OT (Google Docs) or CRDT',
            'Detection: Compare version vectors',
            'User notification: Alert when conflict occurs'
          ]
        },
        {
          topic: 'Deduplication',
          points: [
            'Block-level dedup: Same block across users stored once',
            'File-level dedup: Whole-file hash check before chunking',
            'Cross-user dedup: Privacy concerns, use hash only',
            'Storage savings: Can be 50%+ for enterprise accounts',
            'Trade-off: CPU cost of hashing vs storage savings'
          ]
        },
        {
          topic: 'Security Considerations',
          points: [
            'Encryption at rest: Server-side (default) or client-side',
            'Encryption in transit: TLS for all connections',
            'Zero-knowledge option: Client encrypts before upload',
            'Key management: Enterprise key management integration',
            'Sharing security: Signed URLs with expiry'
          ]
        }
      ],

      requirements: ['Upload/download files', 'Sync across devices', 'File versioning', 'Sharing', 'Real-time collaboration', 'Offline access'],
      components: ['Block server', 'Metadata service', 'Sync service', 'Notification service', 'CDN'],
      keyDecisions: [
        'Block-level sync: Split files into 4MB blocks, only sync changed blocks',
        'Content-addressable storage: Hash blocks for deduplication',
        'Operational Transform or CRDT for real-time collaboration',
        'Long polling or WebSocket for sync notifications',
        'Client-side encryption option for enterprise'
      ]
    },
    {
      id: 'netflix',
      title: 'Netflix',
      subtitle: 'Video Streaming Platform',
      icon: 'video',
      color: '#e50914',
      difficulty: 'Hard',
      description: 'Design a subscription video streaming service with personalized recommendations.',

      introduction: `Netflix is the world's leading streaming entertainment service with over 230 million paid memberships. The system must deliver high-quality video streams to millions of concurrent users worldwide while providing personalized content recommendations.

The key challenges include building a global content delivery network, maintaining consistent streaming quality, and creating a recommendation engine that keeps users engaged.`,

      functionalRequirements: [
        'Stream movies and TV shows in multiple qualities',
        'Support multiple user profiles per account',
        'Personalized content recommendations',
        'Continue watching across devices',
        'Download content for offline viewing',
        'Search content by title, actor, genre',
        'Support subtitles and multiple audio tracks',
        'Parental controls and content ratings'
      ],

      nonFunctionalRequirements: [
        'Stream start time <3 seconds',
        'Zero buffering during playback',
        'Support 8M+ concurrent streams at peak',
        '99.99% availability',
        'Global reach with consistent quality',
        'Adaptive quality based on network conditions'
      ],

      dataModel: {
        description: 'Content metadata, user profiles, and viewing history',
        schema: `content {
  id: varchar(10) PK
  type: enum(MOVIE, SERIES)
  title: varchar(200)
  releaseYear: int
  duration: int (minutes)
  maturityRating: enum(G, PG, PG13, R, NC17)
  genres: varchar[]
  cast: varchar[]
  director: varchar
  synopsis: text
  thumbnailUrl: varchar
  trailerUrl: varchar
}

episodes {
  id: varchar(10) PK
  contentId: varchar(10) FK
  seasonNumber: int
  episodeNumber: int
  title: varchar(200)
  duration: int
}

video_assets {
  contentId: varchar(10) FK
  quality: enum(SD, HD, FHD, UHD)
  codec: enum(H264, H265, VP9, AV1)
  bitrate: int
  manifestUrl: varchar (HLS/DASH)
}

profiles {
  id: uuid PK
  accountId: bigint FK
  name: varchar(50)
  avatarUrl: varchar
  maturitySetting: enum
  language: varchar
}

watch_history {
  profileId: uuid PK
  contentId: varchar(10) PK
  position: int (seconds)
  duration: int
  watchedAt: timestamp
  completed: boolean
}`
      },

      apiDesign: {
        description: 'REST APIs for browsing and streaming',
        endpoints: [
          {
            method: 'GET',
            path: '/api/browse/home',
            params: '?profileId=',
            response: '{ rows: [{ title, items[] }] }'
          },
          {
            method: 'GET',
            path: '/api/content/{id}',
            params: '',
            response: '{ content, episodes[], similar[] }'
          },
          {
            method: 'GET',
            path: '/api/playback/{contentId}',
            params: '?profileId=',
            response: '{ manifestUrl, subtitles[], audioTracks[], position }'
          },
          {
            method: 'POST',
            path: '/api/watch/progress',
            params: '{ contentId, position, duration }',
            response: '{ saved: true }'
          },
          {
            method: 'GET',
            path: '/api/search',
            params: '?q=&profileId=',
            response: '{ results[], suggestions[] }'
          },
          {
            method: 'GET',
            path: '/api/download/{contentId}',
            params: '?quality=',
            response: '{ downloadUrl, expiresAt, license }'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How does Netflix deliver content globally?',
          answer: `Netflix built Open Connect - their own CDN with 17,000+ servers worldwide.

Deployment:
- Open Connect Appliances (OCAs) placed at ISPs
- Edge servers in IXPs (Internet Exchange Points)
- Each OCA stores popular content for that region

Content Placement:
- ML predicts what content will be popular in each region
- Pre-position content overnight during off-peak hours
- 95%+ of traffic served from edge (not origin)

Benefits:
- Reduced latency: Content is 1-2 hops away
- Better quality: Consistent bitrate from nearby server
- Cost savings: Less transit bandwidth needed`
        },
        {
          question: 'How does the recommendation system work?',
          answer: `Two-stage system:

1. Candidate Generation (1000s of titles):
   - Collaborative filtering: Users like you watched X
   - Content-based: Similar genres, actors, directors
   - Trending: Popular in your region
   - Because you watched: Direct similarity

2. Ranking (order within rows):
   - ML model scores each title for this user
   - Features: Watch history, time of day, device, profile
   - Optimizes for: Engagement (will they click + watch)

Personalization touches:
- Artwork selection: Different thumbnails per user
- Row ordering: Most relevant rows first
- Within-row ordering: Most likely to watch first`
        },
        {
          question: 'How do we handle 8M concurrent streams?',
          answer: `Key strategies:

1. Distributed CDN: 17,000+ edge servers globally
   - Most streams served from local ISP/region
   - Origin only for cache misses

2. Adaptive Bitrate Streaming:
   - Multiple quality levels encoded per video
   - Client switches quality based on bandwidth
   - Buffer management: Pre-buffer next segments

3. Microservices Architecture:
   - Each service scales independently
   - Critical path: Playback service, manifest service
   - Graceful degradation: Recommendations can be cached

4. Chaos Engineering:
   - Chaos Monkey: Random instance failures
   - Test failure scenarios in production
   - Systems designed for failure`
        }
      ],

      basicImplementation: {
        title: 'Basic Architecture',
        description: 'Simple streaming with single CDN',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────┐
│                            NETFLIX BASIC                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────┐          │
│  │  Client  │─────▶│ API Gateway  │─────▶│   App Server     │          │
│  └──────────┘      └──────────────┘      └────────┬─────────┘          │
│       │                                           │                     │
│       │                               ┌───────────┴───────────┐        │
│       │                               │                       │        │
│       │                        ┌──────▼──────┐        ┌───────▼──────┐ │
│       │                        │ Content DB  │        │ User DB      │ │
│       │                        │ (Postgres)  │        │ (Postgres)   │ │
│       │                        └─────────────┘        └──────────────┘ │
│       │                                                                 │
│       │            ┌─────────────────────────────────────┐             │
│       └───────────▶│              CDN                     │◀──┐        │
│         (stream)   │     (Third-party: Akamai)           │   │        │
│                    └─────────────────────────────────────┘   │        │
│                                                               │        │
│                                               ┌───────────────┘        │
│                                               │                        │
│                                        ┌──────▼──────┐                 │
│                                        │  Video      │                 │
│                                        │  Storage    │                 │
│                                        │    (S3)     │                 │
│                                        └─────────────┘                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`,
        problems: [
          'Third-party CDN is expensive at scale',
          'Limited control over edge placement',
          'No regional content pre-positioning',
          'Basic recommendations - just popularity',
          'Single quality level - no adaptation'
        ]
      },

      advancedImplementation: {
        title: 'Production Architecture',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           NETFLIX PRODUCTION                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  CONTROL PLANE (AWS)                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌────────────────┐   │        │
│  │  │ API Svc  │  │Browse Svc │  │Playback Svc│  │Recommendation  │   │        │
│  │  └────┬─────┘  └─────┬─────┘  └──────┬─────┘  │   Service      │   │        │
│  │       │              │               │         └────────────────┘   │        │
│  │       └──────────────┴───────────────┘                              │        │
│  │                      │                                               │        │
│  │  ┌───────────────────▼────────────────────────────────────────┐    │        │
│  │  │                    DATA LAYER                               │    │        │
│  │  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐   │    │        │
│  │  │  │Cassandra│  │   EVCache│  │Elasticsearch│  │  Kafka  │   │    │        │
│  │  │  │(history)│  │  (cache) │  │  (search)  │  │(events) │   │    │        │
│  │  │  └─────────┘  └──────────┘  └──────────┘  └────────────┘   │    │        │
│  │  └────────────────────────────────────────────────────────────┘    │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  DATA PLANE (Open Connect CDN)                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                                                                      │        │
│  │  CLIENT ──▶ ISP OCA ──▶ IXP OCA ──▶ Regional ──▶ Origin (S3)       │        │
│  │    │          │            │                                         │        │
│  │    │    ┌─────┴────┐  ┌────┴────┐                                   │        │
│  │    │    │ 95% hit  │  │ 4% hit  │  (1% goes to origin)             │        │
│  │    │    │ rate     │  │ rate    │                                   │        │
│  │    │    └──────────┘  └─────────┘                                   │        │
│  │    │                                                                 │        │
│  │    └── Adaptive Bitrate Selection                                   │        │
│  │        - Measure bandwidth continuously                              │        │
│  │        - Switch quality mid-stream                                   │        │
│  │        - Buffer 30-60 seconds ahead                                  │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  CONTENT PIPELINE                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  Master ──▶ Encoding ──▶ Quality Check ──▶ Encryption ──▶ Deploy   │        │
│  │    │           │              │                │             │       │        │
│  │    │     Multiple         Automated        DRM (Widevine,    │       │        │
│  │    │     bitrates         testing         PlayReady)       │       │        │
│  │    │     & codecs                                     ▼       │        │
│  │    │                                          ┌────────────┐  │        │
│  │    └── 8K Master                             │Predictive  │  │        │
│  │        10+ encoded versions                  │Placement   │  │        │
│  │        (144p to 4K HDR)                     │Algorithm   │  │        │
│  │                                              └────────────┘  │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  RECOMMENDATION ENGINE                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  Watch Events ──▶ Spark/Flink ──▶ Feature Store ──▶ ML Models     │        │
│  │                                                         │            │        │
│  │                                      ┌──────────────────┘            │        │
│  │                                      ▼                               │        │
│  │                              ┌──────────────┐                       │        │
│  │                              │ Personalized │                       │        │
│  │                              │  Rankings    │                       │        │
│  │                              │ + Artwork    │                       │        │
│  │                              └──────────────┘                       │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'Open Connect CDN: 17,000+ edge servers at ISPs worldwide',
          'Control/Data plane separation: AWS for logic, Open Connect for video',
          '95% cache hit rate: Most content served from ISP-local servers',
          'Adaptive streaming: 10+ quality levels, seamless switching',
          'Content pre-positioning: ML predicts regional popularity',
          'Chaos engineering: Designed for failure, tested in production'
        ]
      },

      playbackFlow: {
        title: 'Video Playback Flow',
        steps: [
          'Client requests playback for content ID',
          'Playback service checks entitlement (subscription valid?)',
          'Get license for DRM-protected content',
          'Receive manifest URL pointing to optimal edge server',
          'Client downloads manifest (HLS/DASH) with quality options',
          'Start buffering segments, beginning with lower quality',
          'Measure bandwidth, upgrade quality as buffer fills',
          'Continuous quality adaptation based on network conditions',
          'Report playback events to analytics (start, buffer, quality changes)',
          'Save watch position every 30 seconds for continue watching'
        ]
      },

      contentFlow: {
        title: 'Content Ingestion Flow',
        steps: [
          'Receive master content from studio (8K/4K source)',
          'Encoding pipeline: Generate 10+ quality levels',
          'Encode multiple codecs: H.264, H.265, VP9, AV1',
          'Quality assurance: Automated testing + human review',
          'Encrypt with DRM (Widevine, PlayReady, FairPlay)',
          'Upload to origin storage (S3)',
          'Predictive placement: ML determines regional popularity',
          'Pre-position on relevant Open Connect Appliances',
          'Content becomes available for streaming',
          'Monitor initial performance, adjust placement if needed'
        ]
      },

      discussionPoints: [
        {
          topic: 'Open Connect Architecture',
          points: [
            'Custom hardware appliances at ISPs/IXPs',
            '150+ Tbps capacity globally',
            'ISPs get free appliance + reduced transit costs',
            'Netflix controls software, updates remotely',
            'Fill during off-peak: Overnight content placement'
          ]
        },
        {
          topic: 'Adaptive Bitrate Streaming',
          points: [
            'DASH + HLS support (different devices)',
            'Per-shot encoding: Complex scenes get more bits',
            'Buffer-based adaptation (BBA) algorithm',
            'Quality of Experience metrics: rebuffer ratio, startup time',
            'AV1 codec: 20% better compression, rolling out for 4K'
          ]
        },
        {
          topic: 'Recommendation Personalization',
          points: [
            'Not just what to recommend, but how to present',
            'Personalized artwork: Different images for different users',
            'Row ordering: Most engaging categories first',
            'Time-of-day awareness: Different recommendations morning vs evening',
            'Explore vs exploit: Balance new content discovery'
          ]
        },
        {
          topic: 'Resilience & Chaos Engineering',
          points: [
            'Chaos Monkey: Random instance termination',
            'Chaos Kong: Simulated region failure',
            'Latency injection: Test degraded network conditions',
            'Circuit breakers: Graceful degradation',
            'Bulkheads: Isolate failures to prevent cascade'
          ]
        }
      ],

      requirements: ['Stream movies/shows', 'Multiple profiles', 'Personalized recommendations', 'Continue watching', 'Download for offline', 'Multiple devices'],
      components: ['Video delivery', 'Content management', 'User service', 'Recommendation engine', 'CDN (Open Connect)', 'Playback service'],
      keyDecisions: [
        'Open Connect CDN: Custom hardware at ISPs',
        'Adaptive streaming: Multiple bitrates per video',
        'Pre-position popular content at edge',
        'ML-based recommendations: Collaborative + content-based filtering',
        'A/B testing infrastructure for UI experiments'
      ]
    },
    {
      id: 'amazon',
      title: 'Amazon E-commerce',
      subtitle: 'Online Shopping',
      icon: 'shoppingCart',
      color: '#ff9900',
      difficulty: 'Hard',
      description: 'Design an e-commerce platform handling millions of products, orders, and payments.',

      introduction: `Amazon is the world's largest e-commerce platform, selling 350+ million products and processing millions of orders daily. The system must handle enormous catalog sizes, high-throughput transactions, real-time inventory management, and complex fulfillment operations.

Key challenges include maintaining inventory consistency during flash sales, providing sub-second search across millions of products, and orchestrating the checkout flow across multiple services reliably.`,

      functionalRequirements: [
        'Browse and search products with filters',
        'View product details, images, reviews',
        'Add products to cart',
        'Checkout with multiple payment methods',
        'Real-time inventory tracking',
        'Order tracking and status updates',
        'Product recommendations',
        'Customer reviews and ratings',
        'Wishlist and save for later'
      ],

      nonFunctionalRequirements: [
        'Search results in <200ms',
        'Handle 66K orders/sec during Prime Day',
        'Inventory never goes negative (overselling)',
        '99.99% availability for checkout',
        'Support 300M+ active customers',
        'Scale to 350M+ products'
      ],

      dataModel: {
        description: 'Products, inventory, orders, and user data',
        schema: `products {
  id: varchar(10) PK (ASIN)
  title: varchar(500)
  description: text
  categoryId: int FK
  sellerId: bigint FK
  price: decimal(10,2)
  images: varchar[]
  attributes: jsonb
  rating: decimal(2,1)
  reviewCount: int
  createdAt: timestamp
}

inventory {
  productId: varchar(10) PK
  warehouseId: int PK
  quantity: int
  reservedQuantity: int
  lastUpdated: timestamp
  version: int -- optimistic locking
}

orders {
  id: bigint PK
  userId: bigint FK
  status: enum(PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
  totalAmount: decimal(10,2)
  shippingAddress: jsonb
  paymentId: varchar FK
  createdAt: timestamp
  updatedAt: timestamp
}

order_items {
  orderId: bigint FK
  productId: varchar(10) FK
  quantity: int
  priceAtPurchase: decimal(10,2)
  fulfillmentStatus: enum
}

cart {
  userId: bigint PK
  items: jsonb -- [{productId, quantity, addedAt}]
  updatedAt: timestamp
}`
      },

      apiDesign: {
        description: 'RESTful APIs with event-driven backend',
        endpoints: [
          {
            method: 'GET',
            path: '/api/search',
            params: '?q=&category=&brand=&minPrice=&maxPrice=&page=',
            response: '{ products[], facets, totalCount }'
          },
          {
            method: 'GET',
            path: '/api/products/{asin}',
            params: '',
            response: '{ product, reviews[], similar[], alsoViewed[] }'
          },
          {
            method: 'POST',
            path: '/api/cart/add',
            params: '{ productId, quantity }',
            response: '{ cart, subtotal }'
          },
          {
            method: 'POST',
            path: '/api/checkout/start',
            params: '{ cartId }',
            response: '{ checkoutSessionId, summary, deliveryOptions[] }'
          },
          {
            method: 'POST',
            path: '/api/checkout/complete',
            params: '{ sessionId, paymentMethod, shippingOption }',
            response: '{ orderId, estimatedDelivery }'
          },
          {
            method: 'GET',
            path: '/api/orders/{id}',
            params: '',
            response: '{ order, items[], tracking }'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How do we prevent overselling during flash sales?',
          answer: `Multiple strategies combined:

1. Inventory Reservation:
   - Reserve inventory when added to cart (soft hold)
   - TTL on reservation (15 min) - auto-release if not purchased
   - Confirm reservation during checkout

2. Optimistic Locking:
   - Version number on inventory record
   - UPDATE ... WHERE quantity >= requested AND version = expected
   - Retry with backoff if version mismatch

3. Distributed Locks (for hot products):
   - Redis lock per productId
   - Short TTL to prevent deadlocks
   - Queue requests during flash sales

4. Pre-allocated inventory:
   - For Prime Day: Pre-allocate inventory pools
   - Partition by region/warehouse`
        },
        {
          question: 'How does checkout work with multiple services?',
          answer: `Saga pattern for distributed transaction:

1. Cart Service: Validate cart, lock prices
2. Inventory Service: Reserve inventory (compensation: release)
3. Payment Service: Charge card (compensation: refund)
4. Order Service: Create order record
5. Notification Service: Send confirmation
6. Fulfillment: Queue for warehouse

If any step fails, run compensation actions in reverse.
Use event-driven choreography or orchestrator (Step Functions).

Idempotency keys prevent duplicate charges on retry.`
        },
        {
          question: 'How do we search 350M products fast?',
          answer: `Elasticsearch cluster with optimizations:

Index Design:
- Sharded by category (better relevance)
- Separate indices for different product types
- Denormalized data (no JOINs needed)

Query Optimization:
- Multi-level caching: Query cache, field data cache
- Use filters (cached) before scoring
- Pre-computed facets for common categories

ML-Enhanced:
- Learning-to-rank for result ordering
- Personalized ranking based on user history
- Query understanding: "iPhone 15 case" → brand:Apple AND category:cases`
        }
      ],

      basicImplementation: {
        title: 'Basic Architecture',
        description: 'Monolithic e-commerce with single database',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────┐
│                            AMAZON BASIC                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────┐          │
│  │  Client  │─────▶│ Load Balancer│─────▶│   Monolith App   │          │
│  └──────────┘      └──────────────┘      └────────┬─────────┘          │
│                                                    │                    │
│                                           ┌────────▼─────────┐          │
│                                           │    PostgreSQL    │          │
│                                           │   (Everything)   │          │
│                                           │                  │          │
│                                           │ - Products       │          │
│                                           │ - Inventory      │          │
│                                           │ - Orders         │          │
│                                           │ - Users          │          │
│                                           └──────────────────┘          │
│                                                                         │
│  CHECKOUT:                                                              │
│  BEGIN TRANSACTION                                                      │
│    1. Decrement inventory                                               │
│    2. Charge payment (external call)                                    │
│    3. Create order                                                      │
│  COMMIT                                                                 │
│                                                                         │
│  Problem: External payment call inside transaction = bad                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`,
        problems: [
          'Single database bottleneck',
          'Long transactions with external calls',
          'Cannot scale services independently',
          'Full table scans for search',
          'Inventory locks cause contention'
        ]
      },

      advancedImplementation: {
        title: 'Production Architecture',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AMAZON PRODUCTION                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                         API GATEWAY                                  │        │
│  │    Auth → Rate Limit → Route → Load Balance                         │        │
│  └────────────────────────────────┬────────────────────────────────────┘        │
│                                   │                                              │
│     ┌────────────┬────────────────┼────────────────┬─────────────┐              │
│     │            │                │                │             │              │
│     ▼            ▼                ▼                ▼             ▼              │
│  ┌──────┐   ┌────────┐    ┌──────────┐    ┌───────────┐   ┌──────────┐         │
│  │Search│   │Product │    │   Cart   │    │  Order    │   │ Payment  │         │
│  │ Svc  │   │  Svc   │    │   Svc    │    │   Svc     │   │   Svc    │         │
│  └──┬───┘   └───┬────┘    └────┬─────┘    └─────┬─────┘   └────┬─────┘         │
│     │           │              │                │              │                │
│     ▼           ▼              ▼                ▼              ▼                │
│  ┌──────┐   ┌────────┐    ┌────────┐    ┌──────────┐    ┌──────────┐           │
│  │Elastic│   │Product │    │ Redis  │    │Order DB  │    │Payment   │           │
│  │search │   │  DB    │    │(Cart)  │    │(Postgres)│    │Gateway   │           │
│  └──────┘   └────────┘    └────────┘    └──────────┘    └──────────┘           │
│                                                                                  │
│  INVENTORY SERVICE                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                                                                      │        │
│  │  ┌──────────────┐     ┌────────────┐     ┌───────────────┐         │        │
│  │  │ Inventory DB │◀───│ Inventory  │◀───│  Reservation   │         │        │
│  │  │  (Postgres)  │     │  Service   │     │    Queue       │         │        │
│  │  │              │     │            │     │   (SQS)        │         │        │
│  │  │ Partitioned  │     │ Optimistic │     │               │         │        │
│  │  │ by warehouse │     │  Locking   │     │               │         │        │
│  │  └──────────────┘     └────────────┘     └───────────────┘         │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  CHECKOUT SAGA (Orchestrator Pattern)                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                                                                      │        │
│  │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐        │        │
│  │   │ Reserve │───▶│ Charge  │───▶│ Create  │───▶│ Notify  │        │        │
│  │   │Inventory│    │ Payment │    │  Order  │    │  User   │        │        │
│  │   └────┬────┘    └────┬────┘    └────┬────┘    └─────────┘        │        │
│  │        │              │              │                             │        │
│  │        ▼              ▼              ▼                             │        │
│  │   (compensate)   (compensate)   (compensate)                      │        │
│  │    Release        Refund        Cancel order                      │        │
│  │                                                                      │        │
│  │   State machine tracks progress, handles retries & compensations   │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  EVENT BUS (Kafka)                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  order.created ──▶ Inventory, Shipping, Analytics, Recommendation  │        │
│  │  payment.completed ──▶ Order, Notification                         │        │
│  │  inventory.low ──▶ Procurement, Alerting                           │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'Microservices: Each domain has own database and scales independently',
          'Saga pattern: Distributed transactions with compensation',
          'Event-driven: Kafka for async communication between services',
          'Elasticsearch: Sub-200ms search across 350M products',
          'Inventory locking: Optimistic + reservation queue for hot items',
          'Cart in Redis: Fast reads, TTL-based cleanup'
        ]
      },

      checkoutFlow: {
        title: 'Checkout Flow (Saga)',
        steps: [
          'User clicks checkout, cart validated against current prices',
          'Checkout service creates checkout session with idempotency key',
          'Reserve inventory for all items (with 15-min TTL)',
          'If inventory unavailable, return error with alternatives',
          'User selects shipping option, confirms address',
          'Payment service authorizes card (not charged yet)',
          'Order service creates order record with PENDING status',
          'Payment service captures charge',
          'Order status updated to CONFIRMED',
          'Events published: Inventory committed, shipping queued, email sent',
          'If any step fails, orchestrator runs compensations in reverse'
        ]
      },

      searchFlow: {
        title: 'Product Search Flow',
        steps: [
          'User enters search query',
          'Query understanding: Spelling correction, synonyms, entity extraction',
          'Build Elasticsearch query with filters, facets',
          'Apply personalization: Boost based on user history',
          'Execute search with timeouts (fallback to cached results)',
          'ML ranking: Reorder results by predicted engagement',
          'Fetch product details from cache/database',
          'Return results with facets for filtering',
          'Log search for analytics and model training'
        ]
      },

      discussionPoints: [
        {
          topic: 'Inventory Management',
          points: [
            'Distributed inventory across warehouses',
            'Real-time sync with warehouse management system',
            'Safety stock buffers for popular items',
            'Reservation vs immediate decrement debate',
            'Eventual consistency acceptable for browse, strict for checkout'
          ]
        },
        {
          topic: 'Search Optimization',
          points: [
            'Sharding strategy: By category vs by product ID',
            'Learning-to-rank models trained on click data',
            'A/B testing ranking algorithms',
            'Query understanding pipeline (NLU)',
            'Personalization without filter bubble'
          ]
        },
        {
          topic: 'Handling Flash Sales',
          points: [
            'Virtual waiting room to throttle traffic',
            'Pre-warmed caches and scaled infrastructure',
            'Inventory pre-allocation by region',
            'Queue-based checkout to handle spikes',
            'Graceful degradation: Disable reviews, recommendations'
          ]
        },
        {
          topic: 'Payment Processing',
          points: [
            'Authorize at checkout, capture at ship time',
            'PCI compliance: Tokenize card data',
            'Multiple payment method support',
            'Fraud detection before authorization',
            'Idempotency keys for retry safety'
          ]
        }
      ],

      requirements: ['Product catalog', 'Search', 'Cart', 'Checkout', 'Payments', 'Order tracking', 'Reviews', 'Recommendations'],
      components: ['Product service', 'Search (Elasticsearch)', 'Cart service', 'Order service', 'Payment service', 'Inventory service', 'Recommendation'],
      keyDecisions: [
        'Microservices architecture: Each domain owns its data',
        'Event-driven: Order events trigger inventory, notification, shipping',
        'Distributed transactions: Saga pattern for checkout flow',
        'Search: Elasticsearch with product embeddings',
        'Inventory: Pessimistic locking for popular items during flash sales'
      ]
    },
    {
      id: 'google-docs',
      title: 'Google Docs',
      subtitle: 'Collaborative Editing',
      icon: 'edit',
      color: '#4285f4',
      difficulty: 'Hard',
      description: 'Design a real-time collaborative document editing system with conflict resolution.',

      introduction: `Google Docs is a real-time collaborative document editing system where multiple users can simultaneously edit the same document. The system must handle concurrent edits, resolve conflicts automatically, and ensure all users see a consistent document state.

The key technical challenge is maintaining consistency when multiple users edit the same document simultaneously. This requires sophisticated algorithms like Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDTs).`,

      functionalRequirements: [
        'Real-time collaborative editing',
        'Multiple cursors and selections visible',
        'Rich text formatting (bold, italic, headings)',
        'Comments and suggestions',
        'Version history with restore',
        'Offline editing with sync on reconnect',
        'Sharing with permissions (view, comment, edit)',
        'Document templates'
      ],

      nonFunctionalRequirements: [
        'Operation latency <100ms for propagation',
        'Support 100+ concurrent editors per document',
        'Handle 5B+ documents',
        'Eventually consistent - all clients converge',
        '99.99% availability',
        'Offline-first: Work without connection'
      ],

      dataModel: {
        description: 'Documents, operations, and collaboration state',
        schema: `documents {
  id: uuid PK
  ownerId: bigint FK
  title: varchar(500)
  content: text -- current snapshot
  revision: bigint -- current revision number
  createdAt: timestamp
  updatedAt: timestamp
}

operations {
  id: uuid PK
  documentId: uuid FK
  userId: bigint FK
  revision: bigint
  type: enum(INSERT, DELETE, RETAIN, FORMAT)
  position: int
  content: text nullable
  attributes: jsonb nullable (for formatting)
  timestamp: timestamp
}

collaborators {
  documentId: uuid FK
  userId: bigint FK
  permission: enum(VIEW, COMMENT, EDIT, OWNER)
  addedAt: timestamp
}

presence {
  documentId: uuid PK
  userId: bigint PK
  cursorPosition: int
  selectionStart: int
  selectionEnd: int
  color: varchar(7)
  name: varchar(100)
  lastSeen: timestamp
}`
      },

      apiDesign: {
        description: 'WebSocket for real-time sync, REST for document management',
        endpoints: [
          {
            method: 'WS',
            path: '/ws/doc/{id}/collaborate',
            params: 'authToken in header',
            response: 'Bidirectional: send operations, receive operations + presence'
          },
          {
            method: 'OPERATION',
            path: '(via WebSocket)',
            params: '{ type, position, content, baseRevision }',
            response: '{ ack, serverRevision, transformedOps[] }'
          },
          {
            method: 'GET',
            path: '/api/doc/{id}',
            params: '',
            response: '{ document, content, revision, collaborators[] }'
          },
          {
            method: 'GET',
            path: '/api/doc/{id}/history',
            params: '?since=&limit=',
            response: '{ revisions[], hasMore }'
          },
          {
            method: 'POST',
            path: '/api/doc/{id}/share',
            params: '{ email, permission }',
            response: '{ shareLink }'
          },
          {
            method: 'POST',
            path: '/api/doc/{id}/restore',
            params: '{ revision }',
            response: '{ newRevision }'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How does Operational Transformation work?',
          answer: `OT transforms concurrent operations to maintain consistency.

Example:
- User A inserts "X" at position 5
- User B inserts "Y" at position 3
- Both started from same document state

Without transformation:
- A applies A's op, then B's op → result differs
- B applies B's op, then A's op → different result

With transformation:
- When A receives B's op, transform it:
  B's op was at position 3, A inserted before at 5
  So B's op position stays 3
- When B receives A's op, transform it:
  A's op was at position 5, B inserted at 3
  So A's op position becomes 5+1=6

Result: Both converge to same document state.`
        },
        {
          question: 'OT vs CRDT - which to use?',
          answer: `Operational Transformation (Google Docs approach):
+ Proven at scale (Google uses it)
+ Compact operations
- Complex implementation (quadratic transform)
- Requires central server for ordering

CRDT (Figma, Notion use variants):
+ No central coordination needed
+ Mathematically guaranteed convergence
+ Better for P2P scenarios
- Larger data structures
- Can have "surprising" merge results

For Google Docs clone: OT with central server
For offline-first/P2P: CRDT`
        },
        {
          question: 'How do we handle offline editing?',
          answer: `1. Store operations locally when offline:
   - Queue all operations in IndexedDB
   - Apply locally for instant feedback

2. On reconnect:
   - Send all queued operations to server
   - Server transforms against operations that happened while offline
   - Receive transformed operations from others
   - Apply to local document

3. Conflict resolution:
   - OT/CRDT ensures convergence
   - User may see content "jump" as remote changes apply
   - Never lose user's work

4. Version vector:
   - Track which operations each client has seen
   - Sync only missing operations`
        }
      ],

      basicImplementation: {
        title: 'Basic Architecture',
        description: 'Simple last-write-wins without real-time collaboration',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────┐
│                          GOOGLE DOCS BASIC                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────┐          │
│  │  Client  │─────▶│ API Gateway  │─────▶│  Doc Service     │          │
│  └──────────┘      └──────────────┘      └────────┬─────────┘          │
│                                                    │                    │
│  EDITING:                                 ┌────────▼─────────┐          │
│  1. Load document                         │    PostgreSQL    │          │
│  2. Edit locally                          │                  │          │
│  3. Save entire document                  │  - Documents     │          │
│  4. Overwrite what's in DB                │  - Content       │          │
│                                           │                  │          │
│  PROBLEM: User A and B both editing       └──────────────────┘          │
│           A saves → B saves                                             │
│           A's changes are lost!                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`,
        problems: [
          'Last-write-wins causes data loss',
          'No real-time collaboration',
          'No visibility into other editors',
          'Save entire document on each change (inefficient)',
          'No offline support'
        ]
      },

      advancedImplementation: {
        title: 'Production Architecture',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GOOGLE DOCS PRODUCTION                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  CLIENTS                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │        │
│  │  │ Client A │  │ Client B │  │ Client C │  ... (up to 100)         │        │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘                          │        │
│  │       │              │              │                               │        │
│  │       └──────────────┼──────────────┘                               │        │
│  │                      │ WebSocket                                    │        │
│  │                      ▼                                               │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  COLLABORATION LAYER                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                                                                      │        │
│  │  ┌────────────────────────────────────────────────────────┐         │        │
│  │  │              WebSocket Gateway                          │         │        │
│  │  │   (Sticky sessions per document via consistent hash)   │         │        │
│  │  └────────────────────────┬───────────────────────────────┘         │        │
│  │                           │                                          │        │
│  │  ┌────────────────────────▼───────────────────────────────┐         │        │
│  │  │            Collaboration Server (per document)          │         │        │
│  │  │                                                          │         │        │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │         │        │
│  │  │  │ OT Engine   │  │  Presence   │  │  Op Buffer      │ │         │        │
│  │  │  │             │  │  Manager    │  │  (in-memory)    │ │         │        │
│  │  │  │- Transform  │  │             │  │                 │ │         │        │
│  │  │  │- Compose    │  │- Cursors    │  │- Recent ops     │ │         │        │
│  │  │  │- Apply      │  │- Selections │  │- For new joins  │ │         │        │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────┘ │         │        │
│  │  └────────────────────────────────────────────────────────┘         │        │
│  │                           │                                          │        │
│  └───────────────────────────┼──────────────────────────────────────────┘        │
│                              │                                                   │
│  PERSISTENCE LAYER           │                                                   │
│  ┌───────────────────────────┼──────────────────────────────────────────┐       │
│  │                           ▼                                           │       │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │       │
│  │  │ Operation    │  │  Snapshot    │  │  Document    │               │       │
│  │  │    Log       │  │   Store      │  │   Metadata   │               │       │
│  │  │ (Cassandra)  │  │    (GCS)     │  │  (Spanner)   │               │       │
│  │  │              │  │              │  │              │               │       │
│  │  │- All ops     │  │- Periodic    │  │- Ownership   │               │       │
│  │  │- For history │  │  snapshots   │  │- Sharing     │               │       │
│  │  │- Replay      │  │- Quick load  │  │- Permissions │               │       │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │       │
│  └───────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  OPERATION FLOW                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  1. Client sends operation with baseRevision                        │        │
│  │  2. Server checks: is baseRevision current?                         │        │
│  │     - Yes: Apply directly, broadcast to all clients                 │        │
│  │     - No: Transform against ops since baseRevision                 │        │
│  │  3. Assign new revision number, persist to op log                  │        │
│  │  4. Broadcast transformed op to all connected clients              │        │
│  │  5. Each client transforms its pending ops against received op     │        │
│  │  6. All clients converge to same document state                    │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'OT engine: Transforms concurrent operations for consistency',
          'Sticky WebSocket: All clients for a doc connect to same server',
          'Operation log: Append-only log for history and replay',
          'Periodic snapshots: Avoid replaying all ops from beginning',
          'Presence system: Real-time cursor/selection sharing',
          'Offline queue: Buffer ops locally, sync on reconnect'
        ]
      },

      editFlow: {
        title: 'Collaborative Edit Flow',
        steps: [
          'Client types character, creates INSERT operation',
          'Apply operation locally immediately (optimistic)',
          'Send operation to server with current baseRevision',
          'Server receives, checks if baseRevision is current',
          'If not current: transform operation against missed ops',
          'Assign next revision number to operation',
          'Persist operation to operation log',
          'Broadcast operation to all other connected clients',
          'Each client transforms against their pending ops',
          'Clients apply transformed operation to their document',
          'All documents converge to same state'
        ]
      },

      syncFlow: {
        title: 'Initial Load / Reconnect Flow',
        steps: [
          'Client connects via WebSocket with document ID',
          'Server authenticates, checks permissions',
          'Load latest snapshot from storage',
          'Fetch all operations since snapshot revision',
          'Apply operations to snapshot to get current state',
          'Send document content + current revision to client',
          'Send current presence (other users cursors/selections)',
          'Client ready to send/receive operations',
          'If offline operations queued, send them now',
          'Server transforms offline ops, broadcasts results'
        ]
      },

      discussionPoints: [
        {
          topic: 'OT Transform Functions',
          points: [
            'INSERT vs INSERT: Adjust positions based on order',
            'INSERT vs DELETE: Adjust positions, may split delete',
            'DELETE vs DELETE: Handle overlapping ranges',
            'Commutativity: transform(a,b) + transform(b,a) converge',
            'Google Docs uses composition for efficiency'
          ]
        },
        {
          topic: 'Presence System',
          points: [
            'Real-time cursor position updates via WebSocket',
            'Color-coded for each collaborator',
            'Selection highlighting for visible ranges',
            'Throttle updates to prevent flooding',
            'Show "User typing..." indicators'
          ]
        },
        {
          topic: 'Version History',
          points: [
            'Operation log stores every change',
            'Group operations into sessions/revisions',
            'Restore by replaying ops up to point',
            'Diff view: Apply ops incrementally',
            'Named versions for milestones'
          ]
        },
        {
          topic: 'Scale Considerations',
          points: [
            'Sharding: Each document handled by one server',
            'Consistent hashing for server selection',
            'Failover: Replay from op log on new server',
            'Read replicas for view-only users',
            'Rate limiting: Max ops per second per client'
          ]
        }
      ],

      requirements: ['Real-time editing', 'Multiple cursors', 'Comments', 'Version history', 'Offline support', 'Sharing permissions'],
      components: ['Document service', 'Collaboration service', 'Storage service', 'WebSocket servers', 'Version control'],
      keyDecisions: [
        'Operational Transformation (OT): Transform concurrent operations',
        'Or CRDT: Conflict-free replicated data types for eventual consistency',
        'WebSocket for real-time sync',
        'Presence system: Show active cursors/selections',
        'Periodic snapshots + operation log for version history'
      ]
    },
    {
      id: 'payment-system',
      title: 'Payment System',
      subtitle: 'Stripe / PayPal',
      icon: 'creditCard',
      color: '#635bff',
      difficulty: 'Hard',
      description: 'Design a payment processing system handling cards, transfers, and refunds.',

      introduction: `Payment systems like Stripe and PayPal handle trillions of dollars in transactions annually. They must be extremely reliable, secure, and compliant with financial regulations. The system processes card payments, handles refunds, detects fraud, and maintains accurate financial records.

Key challenges include ensuring exactly-once payment processing, maintaining PCI-DSS compliance, implementing real-time fraud detection, and guaranteeing financial accuracy through double-entry bookkeeping.`,

      functionalRequirements: [
        'Process card payments (authorization, capture)',
        'Handle refunds (full and partial)',
        'Support multiple payment methods (cards, bank transfers, wallets)',
        'Recurring billing / subscriptions',
        'Multi-currency support with FX',
        'Real-time fraud detection',
        'Dispute / chargeback handling',
        'Payout to merchants'
      ],

      nonFunctionalRequirements: [
        'Payment latency <500ms for authorization',
        '99.999% availability (5 min downtime/year)',
        'PCI-DSS Level 1 compliance',
        'Exactly-once payment processing',
        'Handle 10K+ transactions/second',
        'Audit trail for all financial operations'
      ],

      dataModel: {
        description: 'Double-entry ledger with transactions and accounts',
        schema: `payments {
  id: varchar(27) PK (pi_xxx)
  merchantId: bigint FK
  customerId: bigint FK
  amount: bigint (cents)
  currency: varchar(3)
  status: enum(PENDING, AUTHORIZED, CAPTURED, FAILED, REFUNDED)
  paymentMethodId: varchar FK
  idempotencyKey: varchar unique
  metadata: jsonb
  createdAt: timestamp
}

ledger_entries {
  id: bigint PK
  transactionId: varchar FK
  accountId: bigint FK
  type: enum(DEBIT, CREDIT)
  amount: bigint
  currency: varchar(3)
  balance: bigint (running balance)
  createdAt: timestamp
}

accounts {
  id: bigint PK
  type: enum(ASSET, LIABILITY, REVENUE, EXPENSE)
  name: varchar
  currency: varchar(3)
  balance: bigint
}

payment_methods {
  id: varchar(27) PK (pm_xxx)
  customerId: bigint FK
  type: enum(CARD, BANK_ACCOUNT, WALLET)
  tokenizedData: varchar (reference to vault)
  last4: varchar(4)
  expiryMonth: int
  expiryYear: int
}

refunds {
  id: varchar(27) PK (re_xxx)
  paymentId: varchar FK
  amount: bigint
  status: enum(PENDING, SUCCEEDED, FAILED)
  reason: varchar
  createdAt: timestamp
}`
      },

      apiDesign: {
        description: 'REST APIs with idempotency for safe retries',
        endpoints: [
          {
            method: 'POST',
            path: '/v1/payment_intents',
            params: '{ amount, currency, payment_method, confirm: true }',
            response: '{ id, status, amount, client_secret }'
          },
          {
            method: 'POST',
            path: '/v1/payment_intents/{id}/capture',
            params: '{ amount_to_capture }',
            response: '{ id, status: captured, amount_captured }'
          },
          {
            method: 'POST',
            path: '/v1/refunds',
            params: '{ payment_intent, amount, reason }',
            response: '{ id, status, amount }'
          },
          {
            method: 'POST',
            path: '/v1/payouts',
            params: '{ amount, currency, destination }',
            response: '{ id, status, arrival_date }'
          },
          {
            method: 'GET',
            path: '/v1/balance',
            params: '',
            response: '{ available: [{amount, currency}], pending: [{amount, currency}] }'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How do we ensure exactly-once payment processing?',
          answer: `Idempotency keys are essential:

1. Client generates unique key per payment attempt
2. Server stores key → result mapping
3. On retry with same key, return cached result

Implementation:
- Store in Redis with TTL (24 hours)
- Check idempotency key BEFORE processing
- Use database transaction to ensure atomic check-and-process
- Return cached result for duplicate requests

Additionally:
- Unique constraints on payment IDs
- Optimistic locking on balance updates
- Saga pattern with compensating transactions`
        },
        {
          question: 'How does double-entry bookkeeping work?',
          answer: `Every transaction creates balanced entries:

Example: Customer pays $100
1. DEBIT  Stripe_Balance  $100 (asset increases)
2. CREDIT Customer_Payable $100 (liability increases)

When merchant is paid out:
3. DEBIT  Merchant_Payable $97 (liability decreases)
4. CREDIT Stripe_Balance   $97 (asset decreases)
5. CREDIT Revenue          $3  (Stripe's fee)

Invariant: Sum of all debits = Sum of all credits

Benefits:
- Self-auditing: Imbalance indicates bug
- Clear money flow visibility
- Required for financial compliance`
        },
        {
          question: 'How do we handle PCI-DSS compliance?',
          answer: `Cardholder Data Environment (CDE) isolation:

1. Card data never touches main systems
   - Tokenization at point of entry
   - PCI vault stores actual card numbers
   - Application uses tokens (pm_xxx)

2. Network segmentation
   - CDE in isolated VPC
   - Strict firewall rules
   - Separate authentication

3. Client-side tokenization
   - Stripe.js collects card data
   - Sends directly to Stripe (not merchant server)
   - Merchant receives token only

4. Key management
   - HSM (Hardware Security Module) for encryption
   - Regular key rotation
   - Audit logging of all access`
        }
      ],

      basicImplementation: {
        title: 'Basic Architecture',
        description: 'Simple payment processing without compliance isolation',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT SYSTEM BASIC                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────┐          │
│  │  Client  │─────▶│   API Server │─────▶│   Payment DB     │          │
│  └──────────┘      └──────┬───────┘      └──────────────────┘          │
│                           │                                             │
│                           │                                             │
│                    ┌──────▼───────┐                                    │
│                    │  Card Network │                                    │
│                    │ (Visa, MC)    │                                    │
│                    └───────────────┘                                    │
│                                                                         │
│  PROBLEMS:                                                              │
│  - Card data stored in main DB (PCI violation)                         │
│  - No idempotency (double charges possible)                            │
│  - Single database = single point of failure                           │
│  - No fraud detection                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`,
        problems: [
          'Card data in main database (PCI violation)',
          'No idempotency - retries cause double charges',
          'Single point of failure',
          'No fraud detection',
          'No audit trail / ledger'
        ]
      },

      advancedImplementation: {
        title: 'Production Architecture',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PAYMENT SYSTEM PRODUCTION                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  CLIENT SIDE                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  ┌──────────┐                       ┌───────────────┐               │        │
│  │  │ Checkout │── Card Data ────────▶│  Stripe.js    │               │        │
│  │  │   Form   │                       │ (Tokenization)│               │        │
│  │  └──────────┘                       └───────┬───────┘               │        │
│  │                                             │ (pm_xxx token)        │        │
│  │       ┌─────────────────────────────────────┘                       │        │
│  │       ▼                                                              │        │
│  │  ┌────────────┐                                                     │        │
│  │  │ Merchant   │── Token only (no card data) ────────────────────▶  │        │
│  │  │  Server    │                                                     │        │
│  │  └────────────┘                                                     │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  STRIPE INFRASTRUCTURE                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                                                                      │        │
│  │  ┌─────────────────────────────────────────────────────────────┐    │        │
│  │  │                      API GATEWAY                             │    │        │
│  │  │   Auth → Rate Limit → Idempotency → Route                   │    │        │
│  │  └────────────────────────────┬────────────────────────────────┘    │        │
│  │                               │                                      │        │
│  │     ┌─────────────────────────┼──────────────────────────────┐      │        │
│  │     ▼                         ▼                              ▼      │        │
│  │  ┌────────┐            ┌────────────┐               ┌────────────┐  │        │
│  │  │Payment │            │   Fraud    │               │   Ledger   │  │        │
│  │  │Service │◀──────────▶│  Service   │               │  Service   │  │        │
│  │  └───┬────┘            └────────────┘               └──────┬─────┘  │        │
│  │      │                                                      │        │        │
│  │      │                   CARDHOLDER DATA ENV (PCI)          │        │        │
│  │      │    ┌──────────────────────────────────────────┐     │        │        │
│  │      │    │                                          │     │        │        │
│  │      └───▶│  ┌──────────┐         ┌──────────┐      │     │        │        │
│  │           │  │   Token  │────────▶│   Card   │      │     │        │        │
│  │           │  │  Service │         │   Vault  │      │     │        │        │
│  │           │  └────┬─────┘         │   (HSM)  │      │     │        │        │
│  │           │       │               └──────────┘      │     │        │        │
│  │           │       ▼                                  │     │        │        │
│  │           │  ┌──────────────┐                       │     │        │        │
│  │           │  │ Card Network │                       │     │        │        │
│  │           │  │ Integration  │                       │     │        │        │
│  │           │  │(Visa/MC/Amex)│                       │     │        │        │
│  │           │  └──────────────┘                       │     │        │        │
│  │           └──────────────────────────────────────────┘     │        │        │
│  │                                                            │        │        │
│  │  ┌────────────────────────────────────────────────────────┴──┐     │        │
│  │  │                     LEDGER DATABASE                        │     │        │
│  │  │  Double-entry bookkeeping for all money movements         │     │        │
│  │  │  ┌─────────────────────────────────────────────────────┐  │     │        │
│  │  │  │ Every payment:                                       │  │     │        │
│  │  │  │   DEBIT  stripe_balance    $100                     │  │     │        │
│  │  │  │   CREDIT customer_payable  $100                     │  │     │        │
│  │  │  └─────────────────────────────────────────────────────┘  │     │        │
│  │  └────────────────────────────────────────────────────────────┘     │        │
│  │                                                                      │        │
│  └──────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  FRAUD DETECTION                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  Real-time scoring on every payment:                                │        │
│  │  - Velocity checks (too many payments from same card)              │        │
│  │  - Location anomalies (card used in different country)             │        │
│  │  - Amount patterns (unusual purchase amount)                       │        │
│  │  - Device fingerprinting                                           │        │
│  │  - ML models trained on chargeback data                            │        │
│  │                                                                      │        │
│  │  Actions: Block, 3DS challenge, flag for review                    │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'Client-side tokenization: Card data never touches merchant server',
          'PCI-isolated vault: Card numbers stored in HSM-backed vault',
          'Idempotency layer: Prevents duplicate charges on retry',
          'Double-entry ledger: Self-auditing financial records',
          'Real-time fraud scoring: ML models on every transaction',
          'Multi-network integration: Visa, Mastercard, Amex, etc.'
        ]
      },

      paymentFlow: {
        title: 'Payment Flow',
        steps: [
          'Customer enters card details in Stripe.js form',
          'Stripe.js tokenizes card, returns payment method ID (pm_xxx)',
          'Merchant server creates PaymentIntent with token',
          'Stripe checks idempotency key - return cached if duplicate',
          'Fraud service scores transaction in real-time',
          'If high risk: Trigger 3D Secure challenge',
          'Token service retrieves card from vault',
          'Send authorization request to card network',
          'Card network returns approval/decline',
          'Create ledger entries for successful payment',
          'Return result to merchant, send webhook',
          'Capture later or auto-capture based on settings'
        ]
      },

      refundFlow: {
        title: 'Refund Flow',
        steps: [
          'Merchant initiates refund via API',
          'Validate: Amount <= original payment, payment is captured',
          'Create refund record with idempotency check',
          'For card payments: Send reversal to card network',
          'Card network processes, returns result',
          'Create ledger entries (reverse original entries)',
          'Update payment status to REFUNDED',
          'Send webhook notification to merchant',
          'Customer receives funds in 5-10 business days'
        ]
      },

      discussionPoints: [
        {
          topic: 'Authorization vs Capture',
          points: [
            'Authorize: Bank reserves funds, no actual charge',
            'Capture: Actually transfers money',
            'Use case: E-commerce captures at ship time',
            'Auth holds expire (typically 7 days)',
            'Auth + capture in one call for simple cases'
          ]
        },
        {
          topic: 'Handling Disputes/Chargebacks',
          points: [
            'Customer disputes charge with their bank',
            'Bank reverses charge, notifies merchant',
            'Merchant has 7-14 days to provide evidence',
            'Evidence: Receipt, delivery proof, communication',
            'Win rate: ~20-30% with good evidence'
          ]
        },
        {
          topic: 'Multi-Currency Support',
          points: [
            'Store amounts in smallest unit (cents)',
            'FX conversion at payment time vs settlement time',
            'Currency conversion fees: 1-2%',
            'Local acquiring: Route to local bank in customers country',
            'Presentment currency: Show price in customers currency'
          ]
        },
        {
          topic: 'Reconciliation',
          points: [
            'Match internal ledger with bank statements',
            'Daily automated reconciliation',
            'Flag discrepancies for manual review',
            'Handle timing differences (T+1, T+2)',
            'Settlement batching with card networks'
          ]
        }
      ],

      requirements: ['Process payments', 'Handle refunds', 'Fraud detection', 'Multi-currency', 'Recurring billing', 'Compliance (PCI-DSS)'],
      components: ['Payment gateway', 'Ledger service', 'Fraud detection', 'Notification service', 'Reconciliation', 'Compliance service'],
      keyDecisions: [
        'Double-entry ledger: Every transaction has debit and credit entries',
        'Idempotency keys: Prevent duplicate charges',
        'Saga pattern: Handle distributed transaction failures',
        'PCI-DSS: Tokenize card data, isolate cardholder data environment',
        'Real-time fraud scoring with ML models'
      ]
    },
    {
      id: 'search-engine',
      title: 'Web Search Engine',
      subtitle: 'Google Search',
      icon: 'search',
      color: '#4285f4',
      difficulty: 'Hard',
      description: 'Design a web search engine with crawling, indexing, and ranking.',
      requirements: ['Web crawling', 'Index billions of pages', 'Fast search (<200ms)', 'Spell correction', 'Autocomplete', 'Personalization'],
      components: ['Web crawler', 'Indexer', 'Ranker (PageRank)', 'Query processor', 'Spell checker', 'Cache'],
      keyDecisions: [
        'Inverted index: Map words → document IDs + positions',
        'PageRank: Graph-based importance scoring',
        'Sharding: Partition index by document or term',
        'Tiered index: Hot/warm/cold based on query frequency',
        'Query understanding: Parse intent, expand synonyms'
      ],
      estimations: {
        pages: '100B+ web pages indexed',
        queries: '8.5B searches/day = 100K queries/sec',
        index: '100+ petabytes',
        crawl: '20B pages crawled/day'
      },
      apiDesign: [
        'GET /search?q=&page=&lang= → { results[], suggestions[], spelling? }',
        'GET /autocomplete?prefix= → { suggestions[] }'
      ]
    },
    {
      id: 'notification-system',
      title: 'Notification System',
      subtitle: 'Push Notifications',
      icon: 'bell',
      color: '#f59e0b',
      difficulty: 'Medium',
      description: 'Design a scalable notification system supporting push, SMS, and email.',
      requirements: ['Push notifications', 'Email', 'SMS', 'In-app notifications', 'Batching', 'User preferences', 'Rate limiting'],
      components: ['Notification service', 'Template service', 'Priority queue', 'Delivery workers', 'Analytics'],
      keyDecisions: [
        'Priority queues: Urgent (OTP) vs batch (marketing)',
        'Template rendering with user context',
        'Delivery retry with exponential backoff',
        'User preference service for opt-outs',
        'Vendor abstraction: Switch between Twilio/SendGrid/FCM'
      ],
      estimations: {
        notifications: '10B notifications/day',
        channels: '60% push, 30% email, 10% SMS',
        latency: 'Urgent: <1s, Normal: <5s, Batch: hourly'
      },
      apiDesign: [
        'POST /api/notify { userId, template, channel, priority, data }',
        'PUT /api/preferences/{userId} { channels, quiet_hours }'
      ]
    },
    {
      id: 'rate-limiter',
      title: 'Rate Limiter',
      subtitle: 'API Gateway Component',
      icon: 'shield',
      color: '#dc2626',
      difficulty: 'Easy',
      description: 'Design a distributed rate limiting service for API protection.',
      requirements: ['Limit requests per user/IP', 'Multiple rate limit tiers', 'Distributed across servers', 'Low latency overhead', 'Graceful degradation'],
      components: ['Rate limiter service', 'Redis cluster', 'Config service'],
      keyDecisions: [
        'Algorithm: Token bucket (allows bursts) vs Sliding window (precise)',
        'Redis for distributed state with Lua scripts for atomicity',
        'Local cache for hot keys to reduce Redis calls',
        'Return remaining quota and retry-after in headers'
      ],
      estimations: {
        checks: '1M rate limit checks/sec',
        latency: '<1ms per check (cached), <5ms (Redis)',
        rules: '10K+ rate limit rules'
      },
      apiDesign: [
        'GET /limit?key=userId:123&cost=1 → { allowed: bool, remaining, resetAt }',
        'Response headers: X-RateLimit-Remaining, Retry-After'
      ]
    },
    {
      id: 'ticketmaster',
      title: 'Ticketmaster',
      subtitle: 'Event Booking',
      icon: 'ticket',
      color: '#026cdf',
      difficulty: 'Hard',
      description: 'Design a ticket booking system handling high-traffic events with seat selection.',

      introduction: `Ticketmaster is the world's largest ticket marketplace, selling over 500 million tickets annually. The system must handle extreme traffic spikes (14M users trying to buy Taylor Swift tickets), prevent overselling, and provide fair access during high-demand sales.

The key challenges include managing seat inventory with strong consistency, handling millions of concurrent users during on-sales, and implementing fair queuing mechanisms.`,

      functionalRequirements: [
        'Browse events by category, venue, artist',
        'View venue seat map with availability',
        'Select and hold seats temporarily',
        'Complete purchase with payment',
        'Digital ticket delivery',
        'Ticket transfer and resale',
        'Waitlist for sold-out events',
        'Pre-sale access for fan clubs'
      ],

      nonFunctionalRequirements: [
        'Never oversell (strong consistency for bookings)',
        'Handle 14M+ concurrent users during major on-sales',
        'Seat hold expires in 10-15 minutes',
        'Fair access: No bots, proper queuing',
        '99.99% availability during events',
        'Sub-second seat map updates'
      ],

      dataModel: {
        description: 'Events, venues, seats, and bookings',
        schema: `events {
  id: uuid PK
  venueId: uuid FK
  artistId: uuid FK
  name: varchar(200)
  dateTime: timestamp
  onsaleDate: timestamp
  presaleDates: jsonb
  status: enum(UPCOMING, ONSALE, SOLDOUT, CANCELLED)
}

venues {
  id: uuid PK
  name: varchar(200)
  address: jsonb
  sections: jsonb -- section layout
  totalCapacity: int
}

seats {
  id: uuid PK
  eventId: uuid FK
  section: varchar(20)
  row: varchar(10)
  number: int
  status: enum(AVAILABLE, HELD, SOLD, BLOCKED)
  price: decimal(10,2)
  holdExpiry: timestamp nullable
  holdUserId: bigint nullable
  version: int -- optimistic locking
}

bookings {
  id: uuid PK
  userId: bigint FK
  eventId: uuid FK
  seatIds: uuid[]
  totalAmount: decimal(10,2)
  paymentId: varchar FK
  status: enum(CONFIRMED, CANCELLED, REFUNDED)
  barcode: varchar unique
  createdAt: timestamp
}

queue_positions {
  eventId: uuid PK
  userId: bigint PK
  position: bigint
  joinedAt: timestamp
  status: enum(WAITING, SHOPPING, EXPIRED)
}`
      },

      apiDesign: {
        description: 'APIs with hold-based checkout flow',
        endpoints: [
          {
            method: 'GET',
            path: '/api/events/{id}/seats',
            params: '?section=',
            response: '{ seats: [{id, row, number, status, price}] }'
          },
          {
            method: 'POST',
            path: '/api/events/{id}/hold',
            params: '{ seatIds[] }',
            response: '{ holdId, expiresAt, total } or { error: ALREADY_HELD }'
          },
          {
            method: 'POST',
            path: '/api/checkout',
            params: '{ holdId, paymentMethod }',
            response: '{ bookingId, tickets[], barcodes[] }'
          },
          {
            method: 'DELETE',
            path: '/api/holds/{holdId}',
            params: '',
            response: '{ released: true }'
          },
          {
            method: 'GET',
            path: '/api/queue/{eventId}',
            params: '',
            response: '{ position, estimatedWait, status }'
          },
          {
            method: 'POST',
            path: '/api/queue/{eventId}/join',
            params: '{}',
            response: '{ queueToken, position }'
          }
        ]
      },

      keyQuestions: [
        {
          question: 'How do we prevent overselling?',
          answer: `Multiple layers of protection:

1. Pessimistic locking on seat selection:
   - Redis SETNX with userId and TTL
   - Only holder can proceed to checkout
   - Auto-release after 10-15 minutes

2. Database-level consistency:
   - Optimistic locking with version number
   - UPDATE seats SET status='SOLD', version=version+1
     WHERE id=X AND status='HELD' AND version=Y
   - Rollback if row count != expected

3. Idempotent operations:
   - holdId required for checkout
   - Same holdId always returns same result

4. Inventory buffer:
   - Hold back 1-2% of seats
   - Release gradually to handle failed payments`
        },
        {
          question: 'How does the virtual waiting room work?',
          answer: `When traffic exceeds capacity:

1. Queue Join:
   - User gets queue token with random position
   - (Random prevents gaming by early refresh)
   - Show estimated wait time

2. Processing:
   - Let N users/minute into shopping experience
   - Control N based on checkout capacity
   - Shopping timer starts when admitted

3. Fairness measures:
   - CAPTCHA to filter bots
   - One queue position per verified account
   - Device fingerprinting
   - Rate limiting on queue joins

4. Communication:
   - WebSocket for real-time position updates
   - SMS/email notification when its your turn
   - Grace period if you miss your turn`
        },
        {
          question: 'How do we handle 14M concurrent users?',
          answer: `Architecture for extreme scale:

1. CDN for static content:
   - Event pages, images, seat maps (read-only)
   - 99% of requests never hit origin

2. Queue absorbs traffic:
   - Only 10K shopping at a time
   - Rest waiting in queue (cheap to scale)
   - Queue state in Redis Cluster

3. Sharding by event:
   - Each event handled by dedicated shard
   - No cross-event transactions
   - Hot events get more resources

4. Pre-computed seat maps:
   - Generate snapshots every 500ms
   - Push updates via WebSocket
   - Reduce database reads`
        }
      ],

      basicImplementation: {
        title: 'Basic Architecture',
        description: 'Simple booking without queue or advanced locking',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────┐
│                         TICKETMASTER BASIC                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────┐          │
│  │  Client  │─────▶│ Load Balancer│─────▶│   App Server     │          │
│  └──────────┘      └──────────────┘      └────────┬─────────┘          │
│                                                    │                    │
│  BOOKING FLOW:                            ┌────────▼─────────┐          │
│  1. View seats (no lock)                  │    PostgreSQL    │          │
│  2. Click "Buy"                           │   - Events       │          │
│  3. Payment form                          │   - Seats        │          │
│  4. Submit payment                        │   - Bookings     │          │
│  5. Update seat status                    └──────────────────┘          │
│                                                                         │
│  PROBLEM: Two users can buy same seat                                  │
│           Both see "available", both submit payment                    │
│           Last write wins OR duplicate booking                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`,
        problems: [
          'Race condition: Multiple users can select same seat',
          'No protection during checkout process',
          'System crashes under high load',
          'Bots can grab all tickets',
          'No fair access during on-sales'
        ]
      },

      advancedImplementation: {
        title: 'Production Architecture',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           TICKETMASTER PRODUCTION                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  TRAFFIC MANAGEMENT                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  ┌──────────┐                                                        │        │
│  │  │ 14M Users│                                                        │        │
│  │  └────┬─────┘                                                        │        │
│  │       │                                                              │        │
│  │       ▼                                                              │        │
│  │  ┌──────────────────────────────────────────────────────────┐       │        │
│  │  │               VIRTUAL WAITING ROOM                        │       │        │
│  │  │                                                           │       │        │
│  │  │   ┌─────────┐  ┌─────────┐  ┌─────────┐                 │       │        │
│  │  │   │Position │  │Position │  │Position │  ... 14M        │       │        │
│  │  │   │   1     │  │   2     │  │   3     │                 │       │        │
│  │  │   └────┬────┘  └────┬────┘  └────┬────┘                 │       │        │
│  │  │        │            │            │                       │       │        │
│  │  │        └────────────┼────────────┘                       │       │        │
│  │  │                     ▼                                     │       │        │
│  │  │   Let through: 100 users/second (controlled rate)        │       │        │
│  │  └───────────────────────────────────────────────────────────┘       │        │
│  │                        │                                              │        │
│  │                        ▼                                              │        │
│  │  ┌───────────────────────────────────────────────────────────┐       │        │
│  │  │                SHOPPING EXPERIENCE                         │       │        │
│  │  │            (10K concurrent shoppers max)                   │       │        │
│  │  └───────────────────────────────────────────────────────────┘       │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  SEAT SELECTION & BOOKING                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                                                                      │        │
│  │    ┌──────────┐         ┌──────────────┐        ┌──────────────┐   │        │
│  │    │ Seat Map │────────▶│ Seat Service │───────▶│    Redis     │   │        │
│  │    │(Cached)  │         │              │        │  (Seat Locks) │   │        │
│  │    └──────────┘         └──────┬───────┘        │              │   │        │
│  │                                │                │  SETNX       │   │        │
│  │                                │                │  seat:123 →  │   │        │
│  │                                │                │  userId:456  │   │        │
│  │                                │                │  TTL: 15min  │   │        │
│  │                                │                └──────────────┘   │        │
│  │                                ▼                                    │        │
│  │                      ┌──────────────────┐                          │        │
│  │                      │    PostgreSQL    │                          │        │
│  │                      │                  │                          │        │
│  │                      │ UPDATE seats     │                          │        │
│  │                      │ SET status=SOLD  │                          │        │
│  │                      │ WHERE id=123     │                          │        │
│  │                      │ AND status=HELD  │                          │        │
│  │                      │ AND version=X    │                          │        │
│  │                      └──────────────────┘                          │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  HOLD & CHECKOUT FLOW                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                                                                      │        │
│  │   SELECT SEATS ──▶ HOLD (10min) ──▶ PAYMENT ──▶ CONFIRM            │        │
│  │        │               │              │             │                │        │
│  │        │          Redis lock     Payment API    Update DB          │        │
│  │        │          with TTL       (Stripe)       Release lock       │        │
│  │        │               │              │             │                │        │
│  │        │          Auto-release    Idempotent    Create ticket      │        │
│  │        │          on timeout      with holdId   with barcode       │        │
│  │        │                                                            │        │
│  │   RELEASE ◀─────────── (if timeout or cancel) ◀────────────────    │        │
│  │                                                                      │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
│  REAL-TIME UPDATES                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │  Seat status changes ──▶ Redis Pub/Sub ──▶ WebSocket ──▶ Clients  │        │
│  │                                                                      │        │
│  │  - Seat sold/released: Update map in <500ms                        │        │
│  │  - Queue position: Update every 10 seconds                         │        │
│  │  - Hold expiry countdown: Client-side timer                        │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'Virtual waiting room: Queue absorbs traffic spikes',
          'Controlled admission: Only N users shopping at once',
          'Redis locks with TTL: Seat holds auto-release',
          'Optimistic locking: Prevent race conditions at DB level',
          'WebSocket updates: Real-time seat availability',
          'Idempotent checkout: Safe retries with holdId'
        ]
      },

      bookingFlow: {
        title: 'Ticket Booking Flow',
        steps: [
          'User arrives at event page during on-sale',
          'If over capacity: Join virtual waiting room',
          'Wait for your position to be called (WebSocket updates)',
          'When admitted: Start shopping timer (15 minutes)',
          'View seat map (CDN-cached with WebSocket updates)',
          'Select seats → Redis SETNX to acquire hold',
          'If already held: Show error, suggest alternatives',
          'Hold acquired: Proceed to checkout with holdId',
          'Enter payment details, submit',
          'Backend validates hold, processes payment',
          'On success: Update seat status to SOLD, create booking',
          'Generate digital ticket with unique barcode',
          'Send confirmation email with tickets'
        ]
      },

      releaseFlow: {
        title: 'Seat Release Flow',
        steps: [
          'User abandons checkout or timer expires',
          'Redis key TTL expires, lock released automatically',
          'Background job checks for expired holds',
          'Update seat status back to AVAILABLE in DB',
          'Publish release event to Redis Pub/Sub',
          'WebSocket pushes update to all connected clients',
          'Seat map updates in real-time',
          'Released seats become available for others'
        ]
      },

      discussionPoints: [
        {
          topic: 'Bot Prevention',
          points: [
            'CAPTCHA at queue join and checkout',
            'Device fingerprinting to detect automation',
            'Behavioral analysis: Click patterns, timing',
            'Verified fan programs: Real identity required',
            'Purchase limits per account'
          ]
        },
        {
          topic: 'Fair Access Programs',
          points: [
            'Verified Fan: Pre-register, lottery for access',
            'Presales: Staggered access by fan tier',
            'Dynamic pricing: Market-based pricing reduces scalping',
            'Transfer restrictions: Non-transferable tickets',
            'Mobile-only entry: Harder to resell'
          ]
        },
        {
          topic: 'High-Demand Event Strategies',
          points: [
            'Scale infrastructure in advance',
            'Pre-cache all static content',
            'Dedicated shard for the event',
            'War room monitoring during on-sale',
            'Graceful degradation: Disable non-essential features'
          ]
        },
        {
          topic: 'Inventory Management',
          points: [
            'Hold back 1-2% as buffer',
            'Dynamic release of held inventory',
            'ADA compliance: Accessible seating rules',
            'Group seating: Keep parties together',
            'Best available algorithm'
          ]
        }
      ],

      requirements: ['Browse events', 'Seat selection', 'Inventory management', 'Waitlist', 'Prevent overselling', 'Handle flash sales'],
      components: ['Event service', 'Inventory service', 'Booking service', 'Payment service', 'Queue service', 'Notification'],
      keyDecisions: [
        'Pessimistic locking: Lock seats during checkout window',
        'Virtual waiting room: Queue users during high demand',
        'Seat hold with TTL: Release unpurchased seats after timeout',
        'Distributed locks: Redis SETNX for seat reservation',
        'Eventual consistency for sold counts, strong consistency for bookings'
      ]
    },
    {
      id: 'typeahead',
      title: 'Typeahead / Autocomplete',
      subtitle: 'Search Suggestions',
      icon: 'search',
      color: '#22c55e',
      difficulty: 'Medium',
      description: 'Design a typeahead suggestion system for search boxes.',
      requirements: ['Real-time suggestions', '<100ms latency', 'Personalization', 'Trending queries', 'Spell correction'],
      components: ['Trie service', 'Ranking service', 'Analytics pipeline', 'Cache'],
      keyDecisions: [
        'Trie data structure for prefix matching',
        'Pre-compute top suggestions per prefix',
        'Rank by: frequency, recency, personalization',
        'Edge caching for common prefixes',
        'Update suggestions from search analytics pipeline'
      ],
      estimations: {
        prefixes: '100M unique prefixes',
        queries: '100K typeahead requests/sec',
        latency: 'p99 < 50ms'
      },
      apiDesign: [
        'GET /suggest?prefix=&limit=10 → { suggestions[] }',
        'Each suggestion: { text, type, score }'
      ]
    },
    {
      id: 'chat-system',
      title: 'Slack / Discord',
      subtitle: 'Team Chat Application',
      icon: 'messageSquare',
      color: '#611f69',
      difficulty: 'Hard',
      description: 'Design a team communication platform with channels, threads, and integrations.',
      requirements: ['Workspaces/servers', 'Channels (public/private)', 'Direct messages', 'Threads', 'File sharing', 'Search', 'Integrations/bots'],
      components: ['Message service', 'Channel service', 'User service', 'Search (Elasticsearch)', 'File storage', 'WebSocket gateway', 'Bot platform'],
      keyDecisions: [
        'WebSocket for real-time messaging with HTTP fallback',
        'Partition messages by channel for locality',
        'Search: Index messages in Elasticsearch with channel ACL',
        'Threads: Parent-child message relationship',
        'Read position tracking per user per channel'
      ],
      estimations: {
        users: '20M DAU, 500K concurrent connections',
        messages: '1B messages/day',
        channels: '50M channels, avg 20 users/channel',
        search: '10M search queries/day'
      },
      apiDesign: [
        'POST /api/messages { channelId, content, threadId? }',
        'GET /api/channels/{id}/messages?before=&limit=',
        'WS /ws/realtime → MESSAGE, TYPING, PRESENCE events'
      ]
    },
    {
      id: 'yelp',
      title: 'Yelp',
      subtitle: 'Location-Based Reviews',
      icon: 'mapPin',
      color: '#d32323',
      difficulty: 'Medium',
      description: 'Design a local business discovery and review platform.',
      requirements: ['Search nearby businesses', 'Ratings/reviews', 'Photos', 'Business profiles', 'Reservations', 'Check-ins'],
      components: ['Business service', 'Search service', 'Review service', 'Geospatial index', 'CDN', 'Recommendation engine'],
      keyDecisions: [
        'Geohash or QuadTree for proximity search',
        'Elasticsearch for full-text + geospatial queries',
        'Pre-compute aggregate ratings (avoid counting on read)',
        'CDN for business photos',
        'Fraud detection for fake reviews'
      ],
      estimations: {
        businesses: '200M businesses',
        reviews: '200M reviews, 50K new/day',
        searches: '100M searches/day',
        photos: '500M photos'
      },
      apiDesign: [
        'GET /api/search?q=&lat=&lng=&radius=&category=',
        'POST /api/reviews { businessId, rating, text, photos[] }',
        'GET /api/business/{id} → { details, reviews, photos }'
      ]
    },
    {
      id: 'tinder',
      title: 'Tinder',
      subtitle: 'Dating App',
      icon: 'heart',
      color: '#fe3c72',
      difficulty: 'Medium',
      description: 'Design a location-based dating app with swipe matching.',
      requirements: ['User profiles', 'Photo uploads', 'Nearby users', 'Swipe (like/pass)', 'Matching', 'Chat after match'],
      components: ['User service', 'Matching service', 'Geospatial service', 'Chat service', 'Recommendation engine', 'CDN'],
      keyDecisions: [
        'Geohash for efficient nearby user lookup',
        'Pre-compute recommendation stacks per user',
        'Store swipe decisions for bidirectional match detection',
        'Elo-like scoring for recommendation ranking',
        'CDN with image resizing for photos'
      ],
      estimations: {
        users: '75M MAU, 10M DAU',
        swipes: '2B swipes/day',
        matches: '30M matches/day',
        messages: '500M messages/day'
      },
      apiDesign: [
        'GET /api/recommendations → { users[] }',
        'POST /api/swipe { targetUserId, action: like|pass|superlike }',
        'Match detection happens async, triggers push notification'
      ]
    },
    {
      id: 'spotify',
      title: 'Spotify',
      subtitle: 'Music Streaming',
      icon: 'music',
      color: '#1db954',
      difficulty: 'Hard',
      description: 'Design a music streaming service with playlists and recommendations.',
      requirements: ['Stream music', 'Playlists', 'Search', 'Recommendations', 'Offline downloads', 'Social features', 'Artist pages'],
      components: ['Streaming service', 'Catalog service', 'Playlist service', 'Search', 'Recommendation engine', 'CDN', 'Analytics'],
      keyDecisions: [
        'Adaptive bitrate streaming (Ogg Vorbis)',
        'CDN with edge caching for popular tracks',
        'Collaborative filtering + content-based recommendations',
        'Pre-load next tracks for gapless playback',
        'Offline: Encrypted local cache with license management'
      ],
      estimations: {
        users: '500M users, 200M subscribers',
        tracks: '100M tracks',
        streams: '30B streams/month = 11K streams/sec',
        playlists: '4B playlists'
      },
      apiDesign: [
        'GET /api/track/{id}/stream → audio stream',
        'GET /api/recommendations/daily-mix → { playlists[] }',
        'POST /api/playlists { name, trackIds[] }'
      ]
    },
    {
      id: 'airbnb',
      title: 'Airbnb',
      subtitle: 'Property Rental',
      icon: 'home',
      color: '#ff5a5f',
      difficulty: 'Hard',
      description: 'Design a property rental marketplace with search, booking, and reviews.',
      requirements: ['List properties', 'Search by location/dates', 'Booking', 'Calendar management', 'Reviews', 'Messaging', 'Payments'],
      components: ['Listing service', 'Search service', 'Booking service', 'Calendar service', 'Payment service', 'Messaging', 'Review service'],
      keyDecisions: [
        'Search: Elasticsearch with geo filters + availability filters',
        'Calendar: Store availability as date ranges, not individual dates',
        'Double-booking prevention: Optimistic locking on booking',
        'Dynamic pricing based on demand, events, seasonality',
        'Trust & safety: Photo verification, reviews, identity verification'
      ],
      estimations: {
        listings: '7M active listings',
        searches: '100M searches/day',
        bookings: '1M bookings/day',
        users: '150M users'
      },
      apiDesign: [
        'GET /api/search?location=&checkin=&checkout=&guests=',
        'POST /api/bookings { listingId, dates, guests, payment }',
        'GET /api/listings/{id}/calendar → { availability[] }'
      ]
    },
    {
      id: 'doordash',
      title: 'DoorDash / UberEats',
      subtitle: 'Food Delivery',
      icon: 'truck',
      color: '#ff3008',
      difficulty: 'Hard',
      description: 'Design a food delivery platform connecting restaurants, customers, and drivers.',
      requirements: ['Browse restaurants', 'Menu/ordering', 'Real-time tracking', 'Driver matching', 'Payments', 'Ratings'],
      components: ['Restaurant service', 'Order service', 'Dispatch service', 'Tracking service', 'Payment service', 'Rating service'],
      keyDecisions: [
        'Dispatch: Optimize for delivery time, driver utilization, batching',
        'Real-time tracking: WebSocket + frequent location updates',
        'ETA prediction: ML model with traffic, order prep time, driver location',
        'Kitchen display system integration for order status',
        'Surge pricing during peak demand'
      ],
      estimations: {
        orders: '2M orders/day',
        restaurants: '500K restaurants',
        drivers: '1M active dashers',
        concurrent: '100K concurrent deliveries at peak'
      },
      apiDesign: [
        'GET /api/restaurants?lat=&lng= → { restaurants[] }',
        'POST /api/orders { restaurantId, items[], address }',
        'GET /api/orders/{id}/track → { status, driverLocation, eta }'
      ]
    },
    {
      id: 'twitter-trends',
      title: 'Twitter Trending Topics',
      subtitle: 'Real-time Analytics',
      icon: 'trendingUp',
      color: '#1da1f2',
      difficulty: 'Medium',
      description: 'Design a system to detect and display trending topics in real-time.',
      requirements: ['Detect trending hashtags/topics', 'Real-time updates', 'Location-based trends', 'Time-decay ranking', 'Spam filtering'],
      components: ['Stream processor (Kafka/Flink)', 'Count-min sketch', 'Ranking service', 'Cache', 'API servers'],
      keyDecisions: [
        'Stream processing: Apache Kafka + Flink for real-time counting',
        'Count-min sketch: Probabilistic counting with low memory',
        'Time-decay: Exponential decay to favor recent activity',
        'Anomaly detection: Compare current rate vs baseline',
        'Spam filtering: Rate limit per user, detect coordinated campaigns'
      ],
      estimations: {
        tweets: '500M tweets/day = 6K tweets/sec',
        hashtags: '100K unique hashtags/hour',
        updates: 'Trends refresh every 5 minutes',
        regions: '100+ trend regions worldwide'
      },
      apiDesign: [
        'GET /api/trends?location=&count=10 → { trends[] }',
        'Internal: Stream processor → count aggregates → ranking → cache'
      ]
    },
    {
      id: 'pastebin',
      title: 'Pastebin',
      subtitle: 'Text Sharing',
      icon: 'clipboard',
      color: '#02a4d3',
      difficulty: 'Easy',
      description: 'Design a simple text/code sharing service with expiration.',
      requirements: ['Create pastes', 'View pastes', 'Expiration', 'Syntax highlighting', 'Private pastes', 'Analytics'],
      components: ['API servers', 'Object storage (S3)', 'Metadata DB', 'Cache', 'CDN'],
      keyDecisions: [
        'Generate unique keys: Base62 encoding of auto-increment or random',
        'Store content in object storage (S3), metadata in DB',
        'TTL-based expiration with background cleanup job',
        'Rate limiting to prevent abuse',
        'Private pastes: Add password/auth requirement'
      ],
      estimations: {
        writes: '100K pastes/day',
        reads: '1M reads/day (10:1 ratio)',
        storage: '100K × 10KB = 1GB/day raw'
      },
      apiDesign: [
        'POST /api/paste { content, expiry?, private? } → { key, url }',
        'GET /api/paste/{key} → { content, createdAt, expiresAt }'
      ]
    },
    {
      id: 'web-crawler',
      title: 'Web Crawler',
      subtitle: 'Distributed Crawling',
      icon: 'globe',
      color: '#4285f4',
      difficulty: 'Hard',
      description: 'Design a distributed web crawler for search engine indexing.',
      requirements: ['Crawl billions of pages', 'Respect robots.txt', 'Politeness (rate limiting per domain)', 'Duplicate detection', 'Link extraction', 'Scheduling'],
      components: ['URL frontier', 'Fetcher workers', 'Content parser', 'URL filter', 'Duplicate detector', 'Storage'],
      keyDecisions: [
        'URL Frontier: Priority queue with politeness constraints per domain',
        'Distributed fetching: Partition by domain hash',
        'Duplicate detection: Simhash or MinHash for near-duplicate content',
        'robots.txt: Cache and respect crawl-delay directives',
        'Checkpointing: Resume crawl from last known state'
      ],
      estimations: {
        pages: 'Crawl 1B pages/day',
        fetchers: '10K fetcher workers',
        storage: '1B × 100KB = 100TB/day raw HTML',
        bandwidth: '1B × 100KB / 86400s = 1.2TB/s aggregate'
      },
      apiDesign: [
        'Internal: Frontier → Fetcher → Parser → Indexer pipeline',
        'Seed URLs → expand via extracted links'
      ]
    },
    {
      id: 'facebook-newsfeed',
      title: 'Facebook News Feed',
      subtitle: 'Social Media Feed',
      icon: 'home',
      color: '#1877f2',
      difficulty: 'Hard',
      description: 'Design a personalized news feed showing posts from friends and followed pages.',
      requirements: ['Personalized feed', 'Posts/photos/videos', 'Likes/comments', 'Stories', 'Real-time updates', 'Ranking'],
      components: ['Post service', 'Feed service', 'Ranking service', 'Graph service (friends)', 'Cache', 'CDN'],
      keyDecisions: [
        'Hybrid fan-out: Push for close friends, pull for acquaintances',
        'ML ranking: Predict engagement probability',
        'Edge caching: CDN for media, Redis for feed',
        'Real-time: Long polling or WebSocket for new posts',
        'Cold start: Use interest signals for new users'
      ],
      estimations: {
        users: '2B DAU',
        posts: '1B posts/day',
        reads: '100B feed impressions/day',
        ranking: 'Score 1000+ candidate posts per feed request'
      },
      apiDesign: [
        'GET /api/feed?cursor= → { posts[], nextCursor }',
        'POST /api/posts { content, media[], audience }',
        'Ranking service scores posts in real-time'
      ]
    },
    {
      id: 'key-value-store',
      title: 'Distributed Key-Value Store',
      subtitle: 'Redis / DynamoDB',
      icon: 'database',
      color: '#dc382d',
      difficulty: 'Hard',
      description: 'Design a distributed key-value store with high availability.',
      requirements: ['Put/Get/Delete operations', 'High availability', 'Horizontal scaling', 'Replication', 'Consistency options', 'TTL support'],
      components: ['Coordinator', 'Storage nodes', 'Replication manager', 'Failure detector', 'Consistent hashing ring'],
      keyDecisions: [
        'Partitioning: Consistent hashing with virtual nodes',
        'Replication: N replicas, W write quorum, R read quorum',
        'Consistency: Tunable (strong vs eventual)',
        'Conflict resolution: Last-write-wins or vector clocks',
        'Failure detection: Gossip protocol'
      ],
      estimations: {
        operations: '1M ops/sec',
        latency: 'p99 < 10ms',
        storage: '100TB across cluster',
        nodes: '1000+ storage nodes'
      },
      apiDesign: [
        'PUT /api/kv/{key} { value, ttl? }',
        'GET /api/kv/{key} → { value, version }',
        'DELETE /api/kv/{key}'
      ]
    },
    {
      id: 'unique-id-generator',
      title: 'Unique ID Generator',
      subtitle: 'Twitter Snowflake',
      icon: 'hash',
      color: '#17bf63',
      difficulty: 'Easy',
      description: 'Design a distributed unique ID generation service.',
      requirements: ['Globally unique IDs', 'Sortable by time', 'High throughput', 'Low latency', 'No coordination'],
      components: ['ID generator service', 'Time sync (NTP)', 'Machine ID registry'],
      keyDecisions: [
        'Snowflake: 64-bit ID = timestamp + machine ID + sequence',
        '41 bits timestamp (69 years), 10 bits machine ID (1024 machines), 12 bits sequence (4096/ms)',
        'No coordination needed: Each machine generates independently',
        'Clock skew: Reject requests if clock goes backwards',
        'UUID alternative: 128-bit, no coordination, not sortable'
      ],
      estimations: {
        throughput: '4096 IDs/ms per machine = 4M IDs/sec per machine',
        latency: '<1ms per ID generation',
        uniqueness: 'Guaranteed unique across 1024 machines for 69 years'
      },
      apiDesign: [
        'GET /api/id → { id: 1234567890123456789 }',
        'GET /api/ids?count=100 → { ids[] }'
      ]
    },
    {
      id: 'news-aggregator',
      title: 'Google News',
      subtitle: 'News Aggregator',
      icon: 'newspaper',
      color: '#4285f4',
      difficulty: 'Medium',
      description: 'Design a news aggregation service that collects and ranks news from multiple sources.',
      requirements: ['Aggregate from 50K+ sources', 'Deduplicate similar articles', 'Categorization', 'Personalization', 'Real-time updates', 'Trending stories'],
      components: ['Crawler/RSS ingestion', 'NLP pipeline', 'Deduplication service', 'Ranking service', 'Personalization', 'Cache'],
      keyDecisions: [
        'RSS/Atom feeds + web scraping for article ingestion',
        'NLP: Entity extraction, categorization, sentiment',
        'Clustering: Group similar articles about same story',
        'Ranking: Freshness, source authority, engagement',
        'Personalization: User interests + collaborative filtering'
      ],
      estimations: {
        sources: '50K news sources',
        articles: '5M articles/day',
        users: '100M MAU',
        reads: '1B article views/day'
      },
      apiDesign: [
        'GET /api/news?category=&country= → { stories[] }',
        'GET /api/news/personalized → { stories[] }',
        'Each story has headline, sources[], cluster'
      ]
    },
    {
      id: 'leaderboard',
      title: 'Gaming Leaderboard',
      subtitle: 'Real-time Rankings',
      icon: 'award',
      color: '#f59e0b',
      difficulty: 'Medium',
      description: 'Design a real-time leaderboard for millions of players.',
      requirements: ['Update scores in real-time', 'Get top N players', 'Get player rank', 'Support multiple leaderboards', 'Time-based reset'],
      components: ['Score service', 'Redis sorted sets', 'Sharding layer', 'Backup storage'],
      keyDecisions: [
        'Redis sorted sets: O(log N) insert, O(log N) rank lookup',
        'Sharding: By leaderboard ID for different games/levels',
        'Large leaderboards: Approximate ranking for players outside top 1000',
        'Periodic snapshots to persistent storage',
        'Batch updates for very high write volume'
      ],
      estimations: {
        players: '100M players',
        writes: '10K score updates/sec',
        reads: '100K rank lookups/sec',
        leaderboards: '1000 different leaderboards'
      },
      apiDesign: [
        'POST /api/score { playerId, score, leaderboardId }',
        'GET /api/leaderboard/{id}/top?limit=100 → { rankings[] }',
        'GET /api/leaderboard/{id}/rank/{playerId} → { rank, score }'
      ]
    },
    {
      id: 'hotel-booking',
      title: 'Booking.com',
      subtitle: 'Hotel Reservation',
      icon: 'building',
      color: '#003580',
      difficulty: 'Medium',
      description: 'Design a hotel booking system with search, availability, and reservations.',
      requirements: ['Search hotels', 'Room availability', 'Booking', 'Cancellation', 'Reviews', 'Dynamic pricing'],
      components: ['Hotel service', 'Inventory service', 'Search (Elasticsearch)', 'Booking service', 'Payment service', 'Pricing service'],
      keyDecisions: [
        'Search: Geo-filtered search with availability join',
        'Inventory: Store room availability by date, not individual nights',
        'Overbooking prevention: Pessimistic locking during checkout',
        'Caching: Cache hotel details, compute availability on-demand',
        'Rate parity: Ensure consistent pricing across channels'
      ],
      estimations: {
        hotels: '2M hotels, 30M rooms',
        searches: '500M searches/day',
        bookings: '2M bookings/day',
        availability: '30M rooms × 365 days = 10B room-nights'
      },
      apiDesign: [
        'GET /api/hotels?location=&checkin=&checkout=&guests=',
        'GET /api/hotels/{id}/availability?dates= → { rooms[] }',
        'POST /api/bookings { hotelId, roomId, dates, guest }'
      ]
    },
    {
      id: 'google-maps',
      title: 'Google Maps',
      subtitle: 'Navigation System',
      icon: 'map',
      color: '#4285f4',
      difficulty: 'Hard',
      description: 'Design a mapping and navigation system with real-time traffic.',
      requirements: ['Map rendering', 'Search places', 'Directions', 'Real-time traffic', 'ETA', 'Street View', 'Offline maps'],
      components: ['Map tile service', 'Geocoding service', 'Routing engine', 'Traffic service', 'Place service', 'CDN'],
      keyDecisions: [
        'Map tiles: Pre-rendered at multiple zoom levels, served from CDN',
        'Routing: Dijkstra/A* on road graph, segment-based for updates',
        'Traffic: Aggregate anonymized location data, update edge weights',
        'ETA: Historical patterns + real-time traffic',
        'Offline: Download bounded region tiles + graph'
      ],
      estimations: {
        users: '1B MAU',
        queries: '1B directions/day',
        tiles: '10B tile requests/day',
        roads: '1B road segments globally'
      },
      apiDesign: [
        'GET /tiles/{z}/{x}/{y}.png → tile image',
        'GET /api/directions?origin=&dest=&mode= → { routes[] }',
        'GET /api/places/search?q=&location= → { places[] }'
      ]
    },
    {
      id: 'zoom',
      title: 'Zoom',
      subtitle: 'Video Conferencing',
      icon: 'video',
      color: '#2d8cff',
      difficulty: 'Hard',
      description: 'Design a video conferencing platform for real-time communication.',
      requirements: ['Video/audio calls', 'Screen sharing', 'Chat', 'Recording', 'Virtual backgrounds', 'Up to 1000 participants'],
      components: ['Signaling server', 'Media server (SFU)', 'TURN servers', 'Recording service', 'Chat service'],
      keyDecisions: [
        'SFU (Selective Forwarding Unit): Server relays streams, doesn\'t mix',
        'WebRTC for peer connections, fallback to TURN for NAT traversal',
        'Adaptive bitrate: Adjust quality based on bandwidth',
        'Large meetings: Tile-based view, only render visible participants',
        'Recording: Server-side capture and transcoding'
      ],
      estimations: {
        meetings: '300M meeting participants/day',
        concurrent: '10M concurrent participants at peak',
        bandwidth: '3 Mbps per participant video',
        latency: '<150ms end-to-end target'
      },
      apiDesign: [
        'POST /api/meetings → { meetingId, joinUrl }',
        'WS /signaling/{meetingId} → offer/answer/ice-candidate exchange',
        'WebRTC streams for media'
      ]
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      subtitle: 'Professional Network',
      icon: 'briefcase',
      color: '#0a66c2',
      difficulty: 'Hard',
      description: 'Design a professional networking platform with connections and job search.',
      requirements: ['User profiles', 'Connections (1st/2nd/3rd degree)', 'Feed', 'Jobs', 'Messaging', 'Search', 'Recommendations'],
      components: ['Profile service', 'Graph service', 'Feed service', 'Job service', 'Search (Elasticsearch)', 'Messaging', 'Recommendation engine'],
      keyDecisions: [
        'Social graph: Store connections, compute degrees on-demand',
        'Feed: Mix of connection activity + sponsored + recommendations',
        'Job matching: ML model on skills, experience, preferences',
        'Search: People + jobs + companies + content',
        '"Who viewed your profile": Async processing of view events'
      ],
      estimations: {
        users: '900M members',
        connections: '100B connections (edges in graph)',
        jobs: '20M job postings',
        messages: '100M messages/day'
      },
      apiDesign: [
        'GET /api/network/connections?degrees=1,2 → { connections[] }',
        'GET /api/jobs/recommended → { jobs[] }',
        'GET /api/feed?cursor= → { posts[] }'
      ]
    },
  ];

  // Behavioral Topics
  const behavioralTopics = [
    {
      id: 'tell-me-about-yourself',
      title: 'Tell Me About Yourself',
      icon: 'user',
      color: '#10b981',
      questions: 5,
      description: 'Your 60-90 second elevator pitch.',
      starExample: {
        situation: 'Currently a senior engineer at [Company] working on [domain]',
        task: 'Led development of [key project/feature]',
        action: 'Designed architecture, mentored team, delivered on time',
        result: 'Improved performance by X%, reduced costs by Y%'
      },
      tips: [
        'Keep it to 60-90 seconds',
        'Focus on relevant experience for the role',
        'End with why you\'re excited about this opportunity',
        'Practice but don\'t memorize word-for-word'
      ]
    },
    {
      id: 'leadership',
      title: 'Leadership',
      icon: 'users',
      color: '#3b82f6',
      questions: 12,
      description: 'Demonstrate leading without authority, mentoring, and driving results.',
      sampleQuestions: [
        'Tell me about a time you led a project',
        'How do you motivate team members?',
        'Describe a time you had to make an unpopular decision'
      ],
      tips: [
        'Leadership isn\'t just for managers',
        'Focus on influence, not authority',
        'Show how you enabled others\' success'
      ]
    },
    {
      id: 'conflict-resolution',
      title: 'Conflict Resolution',
      icon: 'messageSquare',
      color: '#f59e0b',
      questions: 8,
      description: 'How you handle disagreements and difficult conversations.',
      sampleQuestions: [
        'Tell me about a disagreement with a coworker',
        'How do you handle conflicting priorities?',
        'Describe a time you had to push back on a decision'
      ],
      tips: [
        'Show empathy and active listening',
        'Focus on the problem, not the person',
        'Demonstrate finding win-win solutions',
        'Never badmouth previous colleagues'
      ]
    },
    {
      id: 'failure-mistakes',
      title: 'Failures & Mistakes',
      icon: 'alertTriangle',
      color: '#f43f5e',
      questions: 7,
      description: 'Show self-awareness and ability to learn from setbacks.',
      sampleQuestions: [
        'Tell me about a time you failed',
        'Describe a mistake and how you handled it',
        'What\'s your biggest professional regret?'
      ],
      tips: [
        'Choose a real failure, not a humble brag',
        'Take ownership, don\'t blame others',
        'Focus heavily on what you learned',
        'Show how you\'ve applied that lesson since'
      ]
    },
    {
      id: 'achievements',
      title: 'Achievements',
      icon: 'star',
      color: '#22c55e',
      questions: 9,
      description: 'Highlight your biggest wins and impact.',
      sampleQuestions: [
        'What\'s your proudest accomplishment?',
        'Describe your biggest technical achievement',
        'Tell me about a time you exceeded expectations'
      ],
      tips: [
        'Quantify impact: revenue, performance, users affected',
        'Explain WHY it was challenging',
        'Show your specific contribution vs team effort',
        'Connect to skills relevant for the role'
      ]
    },
    {
      id: 'problem-solving',
      title: 'Problem Solving',
      icon: 'lightbulb',
      color: '#ef4444',
      questions: 15,
      description: 'Demonstrate analytical thinking and creative solutions.',
      sampleQuestions: [
        'Describe a complex problem you solved',
        'How do you approach ambiguous problems?',
        'Tell me about a time you had to make a decision with incomplete information'
      ],
      tips: [
        'Walk through your thought process step by step',
        'Show how you gathered information',
        'Explain tradeoffs you considered',
        'Highlight collaboration when appropriate'
      ]
    },
  ];

  // Company-Specific Prep
  const companyPrep = [
    {
      id: 'amazon-lp',
      title: 'Amazon Leadership Principles',
      subtitle: '16 principles with examples',
      icon: 'briefcase',
      color: '#f59e0b',
      count: 16,
      principles: ['Customer Obsession', 'Ownership', 'Invent and Simplify', 'Are Right, A Lot', 'Learn and Be Curious', 'Hire and Develop the Best', 'Insist on the Highest Standards', 'Think Big']
    },
    {
      id: 'google-behavioral',
      title: 'Google Behavioral',
      subtitle: 'Googliness & Leadership',
      icon: 'code',
      color: '#4285f4',
      count: 12,
      principles: ['Googliness', 'General Cognitive Ability', 'Leadership', 'Role-Related Knowledge']
    },
    {
      id: 'meta-behavioral',
      title: 'Meta Behavioral',
      subtitle: 'Core values alignment',
      icon: 'users',
      color: '#1877f2',
      count: 10,
      principles: ['Move Fast', 'Be Bold', 'Focus on Impact', 'Be Open', 'Build Social Value']
    },
    {
      id: 'microsoft-behavioral',
      title: 'Microsoft Behavioral',
      subtitle: 'Growth mindset focus',
      icon: 'layers',
      color: '#00a4ef',
      count: 8,
      principles: ['Growth Mindset', 'Customer Obsessed', 'Diverse and Inclusive', 'One Microsoft', 'Making a Difference']
    },
  ];

  // Filter and sort topics based on active page
  const getFilteredTopics = () => {
    let topics = [];
    if (activePage === 'coding') topics = codingTopics;
    else if (activePage === 'system-design') topics = systemDesignTopics;
    else if (activePage === 'behavioral') topics = behavioralTopics;
    else return [];

    return topics
      .filter(topic => topic.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortOrder === 'a-z') return a.title.localeCompare(b.title);
        if (sortOrder === 'z-a') return b.title.localeCompare(a.title);
        if (sortOrder === 'most') return b.questions - a.questions;
        if (sortOrder === 'least') return a.questions - b.questions;
        return 0;
      });
  };

  const filteredTopics = getFilteredTopics();

  // Get page title and color
  const getPageConfig = () => {
    switch (activePage) {
      case 'coding': return { title: 'Data Structures & Algorithms', color: '#10b981' };
      case 'system-design': return { title: 'System Design', color: '#3b82f6' };
      case 'behavioral': return { title: 'Behavioral Interviews', color: '#a855f7' };
      default: return { title: 'Documentation', color: '#10b981' };
    }
  };

  const pageConfig = getPageConfig();

  // Find selected topic details
  const getSelectedTopicDetails = () => {
    if (!selectedTopic) return null;
    if (activePage === 'coding') return codingTopics.find(t => t.id === selectedTopic);
    if (activePage === 'system-design') {
      return systemDesignTopics.find(t => t.id === selectedTopic) ||
             systemDesigns.find(t => t.id === selectedTopic);
    }
    if (activePage === 'behavioral') {
      return behavioralTopics.find(t => t.id === selectedTopic) ||
             companyPrep.find(t => t.id === selectedTopic);
    }
    return null;
  };

  const topicDetails = getSelectedTopicDetails();

  // Render topic detail view
  const renderTopicDetail = () => {
    if (!topicDetails) return null;

    return (
      <div className="animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => setSelectedTopic(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <Icon name="chevronLeft" size={18} />
          <span>Back to {pageConfig.title}</span>
        </button>

        {/* Topic Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${topicDetails.color}20` }}>
            <Icon name={topicDetails.icon} size={28} style={{ color: topicDetails.color }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{topicDetails.title}</h1>
            <p className="text-gray-400 text-lg">{topicDetails.description}</p>
          </div>
        </div>

        {/* DSA Topic Detail */}
        {activePage === 'coding' && topicDetails.keyPatterns && (
          <div className="space-y-8">
            {/* Complexity */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div className="text-green-400 text-sm font-medium mb-1">Time Complexity</div>
                <div className="text-white font-mono">{topicDetails.timeComplexity}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div className="text-blue-400 text-sm font-medium mb-1">Space Complexity</div>
                <div className="text-white font-mono">{topicDetails.spaceComplexity}</div>
              </div>
            </div>

            {/* Key Patterns */}
            <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Icon name="puzzle" size={18} style={{ color: topicDetails.color }} />
                Key Patterns
              </h3>
              <div className="flex flex-wrap gap-2">
                {topicDetails.keyPatterns.map((pattern, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: `${topicDetails.color}15`, color: topicDetails.color }}>
                    {pattern}
                  </span>
                ))}
              </div>
            </div>

            {/* Common Problems */}
            <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Icon name="star" size={18} className="text-yellow-400" />
                Common Problems
              </h3>
              <div className="space-y-2">
                {topicDetails.commonProblems.map((problem, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono" style={{ background: 'rgba(255,255,255,0.1)' }}>{i + 1}</span>
                    <span className="text-gray-300">{problem}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Icon name="lightbulb" size={18} className="text-amber-400" />
                Tips & Tricks
              </h3>
              <ul className="space-y-3">
                {topicDetails.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">•</span>
                    <span className="text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Example */}
            {topicDetails.codeExample && (
              <div className="p-6 rounded-xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Icon name="code" size={18} className="text-green-400" />
                  Code Example
                </h3>
                <pre className="text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
                  {topicDetails.codeExample}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* System Design Topic Detail */}
        {activePage === 'system-design' && (topicDetails.concepts || topicDetails.requirements) && (
          <div className="space-y-8">
            {/* Core Concept Topics */}
            {topicDetails.concepts && (
              <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Icon name="puzzle" size={18} style={{ color: topicDetails.color }} />
                  Key Concepts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topicDetails.concepts.map((concept, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: `${topicDetails.color}15`, color: topicDetails.color }}>
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehensive System Design Problems */}
            {topicDetails.requirements && (
              <>
                {/* Difficulty Badge */}
                {topicDetails.difficulty && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      topicDetails.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      topicDetails.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {topicDetails.difficulty}
                    </span>
                    {topicDetails.subtitle && (
                      <span className="text-gray-500">{topicDetails.subtitle}</span>
                    )}
                  </div>
                )}

                {/* Introduction (Comprehensive) */}
                {topicDetails.introduction && (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-xl font-bold text-white mb-4">Introduction</h2>
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">{topicDetails.introduction}</p>
                  </div>
                )}

                {/* Requirements - Functional & Non-Functional */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Functional Requirements */}
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Icon name="check" size={18} className="text-green-400" />
                      Functional Requirements
                    </h3>
                    <ul className="space-y-2">
                      {(topicDetails.functionalRequirements || topicDetails.requirements).map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-300">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Non-Functional Requirements */}
                  {topicDetails.nonFunctionalRequirements && (
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Icon name="zap" size={18} className="text-blue-400" />
                        Non-Functional Requirements
                      </h3>
                      <ul className="space-y-2">
                        {topicDetails.nonFunctionalRequirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Data Model */}
                {topicDetails.dataModel && (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Icon name="database" size={20} className="text-yellow-400" />
                      Data Model
                    </h2>
                    {topicDetails.dataModel.description && (
                      <p className="text-gray-400 mb-4">{topicDetails.dataModel.description}</p>
                    )}
                    <pre className="font-mono text-sm text-yellow-400 bg-black/50 p-4 rounded-lg overflow-x-auto whitespace-pre">
                      {topicDetails.dataModel.schema}
                    </pre>
                  </div>
                )}

                {/* API Design (Comprehensive) */}
                {topicDetails.apiDesign && topicDetails.apiDesign.endpoints && (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Icon name="code" size={20} className="text-green-400" />
                      API Design
                    </h2>
                    {topicDetails.apiDesign.description && (
                      <p className="text-gray-400 mb-4">{topicDetails.apiDesign.description}</p>
                    )}
                    <div className="space-y-4">
                      {topicDetails.apiDesign.endpoints.map((endpoint, i) => (
                        <div key={i} className="p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                              endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                              endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-green-400 font-mono">{endpoint.path}</code>
                          </div>
                          {endpoint.params && (
                            <p className="text-gray-400 text-sm mb-1">Params: {endpoint.params}</p>
                          )}
                          <p className="text-gray-400 text-sm mb-1">Response: {endpoint.response}</p>
                          {endpoint.notes && (
                            <p className="text-gray-500 text-sm italic">{endpoint.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Questions */}
                {topicDetails.keyQuestions && (
                  <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.02))', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Icon name="messageSquare" size={20} className="text-purple-400" />
                      Key Questions to Consider
                    </h2>
                    <div className="space-y-6">
                      {topicDetails.keyQuestions.map((q, i) => (
                        <div key={i}>
                          <h4 className="text-purple-400 font-semibold mb-2">{q.question}</h4>
                          <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-black/30 p-4 rounded-lg font-mono">
                            {q.answer}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Implementation */}
                {topicDetails.basicImplementation && (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Icon name="layers" size={20} className="text-orange-400" />
                      {topicDetails.basicImplementation.title}
                    </h2>
                    <p className="text-gray-300 mb-4">{topicDetails.basicImplementation.description}</p>
                    {topicDetails.basicImplementation.architecture && (
                      <pre className="font-mono text-xs text-green-400 bg-black/50 p-4 rounded-lg overflow-x-auto mb-4 whitespace-pre">
                        {topicDetails.basicImplementation.architecture}
                      </pre>
                    )}
                    {topicDetails.basicImplementation.problems && (
                      <div className="mt-4">
                        <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                          <Icon name="alertTriangle" size={16} />
                          Problems with this approach:
                        </h4>
                        <ul className="space-y-2">
                          {topicDetails.basicImplementation.problems.map((problem, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-300">
                              <span className="text-red-400 mt-1">✗</span>
                              <span>{problem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Advanced Implementation */}
                {topicDetails.advancedImplementation && (
                  <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Icon name="zap" size={20} className="text-green-400" />
                      {topicDetails.advancedImplementation.title}
                    </h2>
                    <p className="text-gray-300 mb-4">{topicDetails.advancedImplementation.description}</p>
                    {topicDetails.advancedImplementation.architecture && (
                      <pre className="font-mono text-xs text-green-400 bg-black/50 p-4 rounded-lg overflow-x-auto mb-4 whitespace-pre">
                        {topicDetails.advancedImplementation.architecture}
                      </pre>
                    )}
                    {topicDetails.advancedImplementation.keyPoints && (
                      <div className="mt-4">
                        <h4 className="text-green-400 font-semibold mb-2">Key Points:</h4>
                        <ul className="space-y-2">
                          {topicDetails.advancedImplementation.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-300">
                              <span className="text-green-400 mt-1">✓</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(topicDetails.advancedImplementation.databaseChoice || topicDetails.advancedImplementation.caching) && (
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        {topicDetails.advancedImplementation.databaseChoice && (
                          <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                            <span className="text-yellow-400 text-sm font-semibold">Database: </span>
                            <span className="text-gray-300 text-sm">{topicDetails.advancedImplementation.databaseChoice}</span>
                          </div>
                        )}
                        {topicDetails.advancedImplementation.caching && (
                          <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                            <span className="text-blue-400 text-sm font-semibold">Caching: </span>
                            <span className="text-gray-300 text-sm">{topicDetails.advancedImplementation.caching}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Create Flow */}
                {topicDetails.createFlow && (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Icon name="arrowRight" size={20} className="text-blue-400" />
                      {topicDetails.createFlow.title}
                    </h2>
                    <ol className="space-y-3">
                      {topicDetails.createFlow.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                            {i + 1}
                          </span>
                          <span className="text-gray-300 pt-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Redirect Flow */}
                {topicDetails.redirectFlow && (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Icon name="arrowLeft" size={20} className="text-purple-400" />
                      {topicDetails.redirectFlow.title}
                    </h2>
                    <ol className="space-y-3">
                      {topicDetails.redirectFlow.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
                            {i + 1}
                          </span>
                          <span className="text-gray-300 pt-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Discussion Points */}
                {topicDetails.discussionPoints && (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Icon name="messageCircle" size={20} className="text-cyan-400" />
                      Additional Discussion Points
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topicDetails.discussionPoints.map((point, i) => (
                        <div key={i} className="p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <h4 className="text-cyan-400 font-semibold mb-2">{point.topic}</h4>
                          <ul className="space-y-1">
                            {point.points.map((p, j) => (
                              <li key={j} className="flex items-start gap-2 text-gray-400 text-sm">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback: Simple Components Display */}
                {!topicDetails.introduction && topicDetails.components && (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Icon name="layers" size={18} className="text-purple-400" />
                      System Components
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {topicDetails.components.map((comp, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-purple-500/15 text-purple-400">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Design Decisions */}
                {topicDetails.keyDecisions && (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Icon name="lightbulb" size={18} className="text-amber-400" />
                      Key Design Decisions
                    </h3>
                    <ul className="space-y-3">
                      {topicDetails.keyDecisions.map((decision, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono flex-shrink-0" style={{ background: `${topicDetails.color}20`, color: topicDetails.color }}>{i + 1}</span>
                          <span className="text-gray-300">{decision}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {topicDetails.tips && (
              <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Icon name="star" size={18} className="text-yellow-400" />
                  Tips
                </h3>
                <ul className="space-y-3">
                  {topicDetails.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Behavioral Topic Detail */}
        {activePage === 'behavioral' && (topicDetails.sampleQuestions || topicDetails.starExample) && (
          <div className="space-y-8">
            {topicDetails.starExample && (
              <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.02))', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <h3 className="text-white font-semibold mb-4">STAR Framework Example</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(topicDetails.starExample).map(([key, value]) => (
                    <div key={key} className="p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <div className="text-purple-400 text-sm font-semibold mb-1 uppercase">{key}</div>
                      <div className="text-gray-300">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topicDetails.sampleQuestions && (
              <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-semibold mb-4">Sample Questions</h3>
                <ul className="space-y-3">
                  {topicDetails.sampleQuestions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3 py-2">
                      <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono flex-shrink-0" style={{ background: `${topicDetails.color}20`, color: topicDetails.color }}>{i + 1}</span>
                      <span className="text-gray-300">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {topicDetails.tips && (
              <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-semibold mb-4">Tips for Success</h3>
                <ul className="space-y-3">
                  {topicDetails.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {topicDetails.principles && (
              <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-semibold mb-4">Key Principles</h3>
                <div className="flex flex-wrap gap-2">
                  {topicDetails.principles.map((principle, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: `${topicDetails.color}15`, color: topicDetails.color }}>
                      {principle}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#09090b', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col" style={{ background: '#0a0a0f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div className="p-5">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Icon name="ascend" size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Ascend</span>
          </a>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setSelectedTopic(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon name={item.icon} size={18} className={isActive ? 'text-green-400' : ''} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5"
            style={{ color: '#f59e0b' }}
          >
            <Icon name="zap" size={18} />
            <span className="font-medium">Try Ascend</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div />
          <div className="flex items-center gap-4">
            <a href="/" className="px-4 py-2 rounded-lg text-sm font-medium text-green-400 hover:bg-green-400/10 transition-colors" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              Try Ascend Free
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8 max-w-6xl">
          {/* Show topic detail or list */}
          {selectedTopic ? renderTopicDetail() : (
            <>
              {/* Page Title */}
              <h1 className="text-3xl font-bold text-white mb-8">{pageConfig.title}</h1>

              {/* Search and Sort */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search topics"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 w-64 focus:outline-none focus:ring-1"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2.5 rounded-lg text-sm text-gray-400 focus:outline-none cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="a-z">A - Z</option>
                  <option value="z-a">Z - A</option>
                  <option value="most">Most Questions</option>
                  <option value="least">Least Questions</option>
                </select>
              </div>

              {/* DSA Content */}
              {activePage === 'coding' && (
                <>
                  {/* Topic Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {filteredTopics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className="group p-5 rounded-xl transition-all hover:scale-[1.02] hover:bg-white/5 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${topic.color}15` }}>
                              <Icon name={topic.icon} size={20} style={{ color: topic.color }} />
                            </div>
                            <span className="text-white font-semibold">{topic.title}</span>
                          </div>
                          <Icon name="chevronRight" size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                        </div>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{topic.description}</p>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Icon name="star" size={14} />
                          <span>{topic.questions} Questions</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Reference */}
                  <h2 className="text-xl font-bold text-white mb-6">Quick Reference</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Icon name="clock" size={18} className="text-green-400" />
                        Time Complexity Cheat Sheet
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">O(1)</span><span className="text-green-400">Constant - Best</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">O(log n)</span><span className="text-green-400">Logarithmic - Great</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">O(n)</span><span className="text-yellow-400">Linear - Good</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">O(n log n)</span><span className="text-yellow-400">Linearithmic - Fair</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">O(n²)</span><span className="text-orange-400">Quadratic - Slow</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">O(2ⁿ)</span><span className="text-red-400">Exponential - Avoid</span></div>
                      </div>
                    </div>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Icon name="database" size={18} className="text-blue-400" />
                        When to Use What
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Fast lookup</span><span className="text-white">Hash Map</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Sorted data</span><span className="text-white">Binary Search Tree</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">FIFO operations</span><span className="text-white">Queue</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">LIFO operations</span><span className="text-white">Stack</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Priority access</span><span className="text-white">Heap</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Prefix matching</span><span className="text-white">Trie</span></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* System Design Content */}
              {activePage === 'system-design' && (
                <>
                  {/* Core Concepts */}
                  <h2 className="text-xl font-bold text-white mb-4">Core Concepts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    {filteredTopics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className="group p-5 rounded-xl transition-all hover:scale-[1.02] hover:bg-white/5 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${topic.color}15` }}>
                              <Icon name={topic.icon} size={20} style={{ color: topic.color }} />
                            </div>
                            <span className="text-white font-semibold">{topic.title}</span>
                          </div>
                          <Icon name="chevronRight" size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                        </div>
                        <p className="text-gray-400 text-sm">{topic.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Common Designs */}
                  <h2 className="text-xl font-bold text-white mb-4">Common System Designs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    {systemDesigns.map((design) => (
                      <div
                        key={design.id}
                        onClick={() => setSelectedTopic(design.id)}
                        className="group p-5 rounded-xl transition-all hover:scale-[1.01] hover:bg-white/5 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${design.color}15` }}>
                            <Icon name={design.icon} size={24} style={{ color: design.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-white font-semibold">{design.title}</h3>
                              <Icon name="chevronRight" size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{design.subtitle}</p>
                            <span className="px-2 py-1 rounded text-xs" style={{ background: `${design.color}20`, color: design.color }}>
                              {design.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interview Framework */}
                  <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.02))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Icon name="target" size={20} className="text-blue-400" />
                      System Design Interview Framework (45 min)
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      {[
                        { time: '5 min', step: 'Requirements', desc: 'Clarify functional & non-functional requirements, scale' },
                        { time: '5 min', step: 'Estimations', desc: 'Back-of-envelope: QPS, storage, bandwidth' },
                        { time: '20 min', step: 'High-Level Design', desc: 'Components, data flow, API design' },
                        { time: '15 min', step: 'Deep Dive', desc: 'Database schema, scaling, trade-offs' },
                      ].map((phase, i) => (
                        <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <div className="text-blue-400 text-sm font-bold mb-1">{phase.time}</div>
                          <div className="text-white font-semibold mb-2">{phase.step}</div>
                          <div className="text-gray-400 text-sm">{phase.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Behavioral Content */}
              {activePage === 'behavioral' && (
                <>
                  {/* STAR Method */}
                  <div className="p-6 rounded-xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.02))', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Icon name="star" size={20} className="text-purple-400" />
                      The STAR Method
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      {[
                        { letter: 'S', title: 'Situation', desc: 'Set the scene and give context', color: '#ef4444' },
                        { letter: 'T', title: 'Task', desc: 'Describe your responsibility', color: '#f59e0b' },
                        { letter: 'A', title: 'Action', desc: 'Explain what you did', color: '#22c55e' },
                        { letter: 'R', title: 'Result', desc: 'Share the outcomes', color: '#3b82f6' },
                      ].map((step, i) => (
                        <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-xl font-bold" style={{ background: `${step.color}20`, color: step.color }}>
                            {step.letter}
                          </div>
                          <div className="text-white font-semibold mb-2">{step.title}</div>
                          <div className="text-gray-400 text-sm">{step.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Question Categories */}
                  <h2 className="text-xl font-bold text-white mb-4">Question Categories</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {filteredTopics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className="group p-5 rounded-xl transition-all hover:scale-[1.02] hover:bg-white/5 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${topic.color}15` }}>
                              <Icon name={topic.icon} size={20} style={{ color: topic.color }} />
                            </div>
                            <span className="text-white font-semibold">{topic.title}</span>
                          </div>
                          <Icon name="chevronRight" size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                        </div>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{topic.description}</p>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Icon name="star" size={14} />
                          <span>{topic.questions} Questions</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Company-Specific */}
                  <h2 className="text-xl font-bold text-white mb-4">Company-Specific Prep</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyPrep.map((company) => (
                      <div
                        key={company.id}
                        onClick={() => setSelectedTopic(company.id)}
                        className="group p-5 rounded-xl transition-all hover:scale-[1.01] hover:bg-white/5 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${company.color}15` }}>
                            <Icon name={company.icon} size={24} style={{ color: company.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-white font-semibold">{company.title}</h3>
                              <Icon name="chevronRight" size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{company.subtitle}</p>
                            <span className="px-2 py-1 rounded text-xs" style={{ background: `${company.color}20`, color: company.color }}>
                              {company.count} Topics
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
