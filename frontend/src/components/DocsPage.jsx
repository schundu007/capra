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
      requirements: ['Post tweets (280 chars)', 'Follow/unfollow users', 'Home timeline', 'Search tweets', 'Notifications', 'Trending topics'],
      components: ['Tweet service', 'Timeline service', 'Fan-out service', 'Search (Elasticsearch)', 'Cache (Redis)', 'Notification service'],
      keyDecisions: [
        'Fan-out on write: Pre-compute timelines for users with <10K followers',
        'Fan-out on read: For celebrities (>10K followers), fetch at read time',
        'Hybrid approach: Mix both based on follower count threshold',
        'Redis sorted sets for timeline caching by timestamp',
        'Separate read replicas for timeline reads'
      ],
      estimations: {
        qps: '500M DAU, avg 50 reads/day = 290K reads/sec, 5K writes/sec',
        storage: 'Tweet: 500M × 280 bytes = 140GB/day for tweets alone',
        fanout: 'Avg 200 followers × 5K tweets/sec = 1M timeline updates/sec'
      },
      apiDesign: [
        'POST /api/tweets { content, mediaIds? } → { tweetId }',
        'GET /api/timeline?cursor= → { tweets[], nextCursor }',
        'POST /api/follow/{userId}',
        'GET /api/search?q=&type=tweets|users'
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
      requirements: ['Match riders with drivers', 'Real-time location tracking', 'ETA calculation', 'Payments', 'Ratings', 'Surge pricing'],
      components: ['Location service', 'Matching service', 'Maps/routing', 'Payment service', 'Notification service', 'Pricing service'],
      keyDecisions: [
        'Geospatial indexing: QuadTree or Geohash for efficient nearby lookup',
        'WebSockets for real-time location updates',
        'Cell-based matching: divide city into cells for parallel matching',
        'Kafka for location event streaming',
        'Separate write path (location updates) from read path (matching)'
      ],
      estimations: {
        qps: '1M drivers sending location every 3 sec = 333K updates/sec',
        matching: '100K rides/hour = 28 matches/sec per city',
        storage: 'Location: 1M × 20 bytes × 20 updates/min = 400MB/min'
      },
      apiDesign: [
        'POST /api/ride/request { pickup, dropoff } → { rideId, estimatedETA, price }',
        'PUT /api/driver/location { lat, lng, heading, speed }',
        'GET /api/ride/{id}/status → { status, driverLocation, eta }'
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
      requirements: ['Upload videos', 'Stream videos globally', 'Search', 'Recommendations', 'Comments', 'Live streaming'],
      components: ['Upload service', 'Transcoding pipeline', 'CDN', 'Metadata DB', 'Search service', 'Recommendation engine'],
      keyDecisions: [
        'Async transcoding: Upload triggers job queue → multiple resolutions',
        'CDN for global delivery: Cache popular videos at edge',
        'Adaptive bitrate (HLS/DASH): Client switches quality based on bandwidth',
        'Chunked upload for large files with resume capability',
        'Separate hot/cold storage: S3 Glacier for old videos'
      ],
      estimations: {
        uploads: '500 hours video/min = 720K hours/day',
        views: '1B views/day = 11.5K views/sec',
        storage: '720K hours × 1GB/hour = 720TB raw/day, 3.6PB transcoded',
        bandwidth: 'Peak: 50Tbps globally'
      },
      apiDesign: [
        'POST /api/upload/init { title, description } → { uploadId, uploadUrl }',
        'PUT /api/upload/{id}/chunk { chunk, offset }',
        'GET /api/video/{id}/stream?quality= → HLS manifest'
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
      requirements: ['1-1 messaging', 'Group chat (256 members)', 'Media sharing', 'Read receipts', 'Online status', 'End-to-end encryption'],
      components: ['Chat servers', 'Message queue', 'User service', 'Media service', 'Push notification', 'Presence service'],
      keyDecisions: [
        'WebSocket for real-time bidirectional communication',
        'Message queue for offline message delivery',
        'Last-write-wins for message ordering within conversation',
        'End-to-end encryption: Signal protocol',
        'Store messages temporarily, delete after delivery confirmation'
      ],
      estimations: {
        users: '2B users, 500M DAU',
        messages: '100B messages/day = 1.2M messages/sec',
        connections: '500M concurrent WebSocket connections',
        storage: 'Messages: 100B × 100 bytes = 10TB/day (temporary)'
      },
      apiDesign: [
        'WS /connect { authToken } → bidirectional channel',
        'SEND { to, type, content, mediaUrl? }',
        'ACK { messageId, status: delivered|read }'
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
      requirements: ['Upload photos/videos', 'Apply filters', 'News feed', 'Stories (24h)', 'Follow users', 'Likes/comments', 'Direct messages'],
      components: ['Media service', 'Feed service', 'User service', 'CDN', 'Search', 'Notification service'],
      keyDecisions: [
        'Pre-generate feed for active users (push model)',
        'CDN for image/video delivery worldwide',
        'Stories: TTL-based storage with Redis',
        'Image processing pipeline: resize, compress, filter',
        'Shard user data by userId for locality'
      ],
      estimations: {
        dau: '500M DAU, 95M posts/day',
        reads: '500M × 100 feed views = 50B impressions/day',
        storage: '95M × 2MB = 190TB images/day',
        cdn: '10M requests/sec to CDN'
      },
      apiDesign: [
        'POST /api/media/upload → { mediaId, uploadUrl }',
        'POST /api/post { mediaIds[], caption, tags[] }',
        'GET /api/feed?cursor= → { posts[], nextCursor }'
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
      requirements: ['Upload/download files', 'Sync across devices', 'File versioning', 'Sharing', 'Real-time collaboration', 'Offline access'],
      components: ['Block server', 'Metadata service', 'Sync service', 'Notification service', 'CDN'],
      keyDecisions: [
        'Block-level sync: Split files into 4MB blocks, only sync changed blocks',
        'Content-addressable storage: Hash blocks for deduplication',
        'Operational Transform or CRDT for real-time collaboration',
        'Long polling or WebSocket for sync notifications',
        'Client-side encryption option for enterprise'
      ],
      estimations: {
        users: '500M users, 100M DAU',
        storage: '15PB total storage',
        sync: '1B file changes/day = 12K changes/sec',
        upload: '100TB uploaded/day'
      },
      apiDesign: [
        'GET /api/files/{id}/metadata → { size, hash, blocks[] }',
        'PUT /api/blocks/{hash} { blockData }',
        'POST /api/files { path, blockHashes[] } → { fileId }'
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
      requirements: ['Stream movies/shows', 'Multiple profiles', 'Personalized recommendations', 'Continue watching', 'Download for offline', 'Multiple devices'],
      components: ['Video delivery', 'Content management', 'User service', 'Recommendation engine', 'CDN (Open Connect)', 'Playback service'],
      keyDecisions: [
        'Open Connect CDN: Custom hardware at ISPs',
        'Adaptive streaming: Multiple bitrates per video',
        'Pre-position popular content at edge',
        'ML-based recommendations: Collaborative + content-based filtering',
        'A/B testing infrastructure for UI experiments'
      ],
      estimations: {
        users: '230M subscribers',
        concurrent: '8M concurrent streams at peak',
        bandwidth: '400+ Gbps during peak hours',
        library: '15K titles, 100K hours of content'
      },
      apiDesign: [
        'GET /api/content/{id}/playback → { streamUrls, subtitles, progress }',
        'POST /api/watch/{contentId} { position, completed }',
        'GET /api/recommendations → { rows: { title, items[] }[] }'
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
      requirements: ['Product catalog', 'Search', 'Cart', 'Checkout', 'Payments', 'Order tracking', 'Reviews', 'Recommendations'],
      components: ['Product service', 'Search (Elasticsearch)', 'Cart service', 'Order service', 'Payment service', 'Inventory service', 'Recommendation'],
      keyDecisions: [
        'Microservices architecture: Each domain owns its data',
        'Event-driven: Order events trigger inventory, notification, shipping',
        'Distributed transactions: Saga pattern for checkout flow',
        'Search: Elasticsearch with product embeddings',
        'Inventory: Pessimistic locking for popular items during flash sales'
      ],
      estimations: {
        products: '350M products',
        orders: '66K orders/sec during Prime Day',
        searches: '200M searches/day',
        users: '300M active customers'
      },
      apiDesign: [
        'GET /api/products?q=&category=&page= → { products[], facets }',
        'POST /api/cart { productId, quantity }',
        'POST /api/checkout { cartId, address, payment } → { orderId }'
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
      requirements: ['Real-time editing', 'Multiple cursors', 'Comments', 'Version history', 'Offline support', 'Sharing permissions'],
      components: ['Document service', 'Collaboration service', 'Storage service', 'WebSocket servers', 'Version control'],
      keyDecisions: [
        'Operational Transformation (OT): Transform concurrent operations',
        'Or CRDT: Conflict-free replicated data types for eventual consistency',
        'WebSocket for real-time sync',
        'Presence system: Show active cursors/selections',
        'Periodic snapshots + operation log for version history'
      ],
      estimations: {
        documents: '5B documents',
        concurrent: '100 editors per document max, avg 3',
        operations: '1M operations/sec across platform',
        latency: '<100ms for operation propagation'
      },
      apiDesign: [
        'WS /doc/{id}/collaborate → bidirectional edits',
        'OPERATION { type, position, content, revision }',
        'GET /api/doc/{id}/history → { revisions[] }'
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
      requirements: ['Process payments', 'Handle refunds', 'Fraud detection', 'Multi-currency', 'Recurring billing', 'Compliance (PCI-DSS)'],
      components: ['Payment gateway', 'Ledger service', 'Fraud detection', 'Notification service', 'Reconciliation', 'Compliance service'],
      keyDecisions: [
        'Double-entry ledger: Every transaction has debit and credit entries',
        'Idempotency keys: Prevent duplicate charges',
        'Saga pattern: Handle distributed transaction failures',
        'PCI-DSS: Tokenize card data, isolate cardholder data environment',
        'Real-time fraud scoring with ML models'
      ],
      estimations: {
        transactions: '10K transactions/sec',
        volume: '$1T annual payment volume',
        latency: '<500ms end-to-end for authorization',
        availability: '99.999% (5.26 min downtime/year)'
      },
      apiDesign: [
        'POST /api/payments { amount, currency, source, idempotencyKey }',
        'POST /api/refunds { paymentId, amount }',
        'GET /api/balance → { available, pending }'
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
      requirements: ['Browse events', 'Seat selection', 'Inventory management', 'Waitlist', 'Prevent overselling', 'Handle flash sales'],
      components: ['Event service', 'Inventory service', 'Booking service', 'Payment service', 'Queue service', 'Notification'],
      keyDecisions: [
        'Pessimistic locking: Lock seats during checkout window',
        'Virtual waiting room: Queue users during high demand',
        'Seat hold with TTL: Release unpurchased seats after timeout',
        'Distributed locks: Redis SETNX for seat reservation',
        'Eventual consistency for sold counts, strong consistency for bookings'
      ],
      estimations: {
        events: '100K events/year',
        seats: '100M tickets/year',
        peak: 'Taylor Swift: 14M users in queue, 1M tickets'
      },
      apiDesign: [
        'GET /api/events/{id}/seats?section= → { seats[], held[] }',
        'POST /api/hold { eventId, seatIds[] } → { holdId, expiresAt }',
        'POST /api/book { holdId, payment } → { ticketIds[] }'
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
