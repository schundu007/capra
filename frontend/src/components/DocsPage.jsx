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
      requirements: ['Shorten long URLs', '301 redirect', 'Analytics', 'Custom aliases'],
      components: ['API servers', 'Database (SQL/NoSQL)', 'Cache (Redis)', 'Load balancer'],
      keyDecisions: [
        'Hash function: MD5/SHA vs Base62 encoding',
        'Storage: NoSQL for scale (Cassandra/DynamoDB)',
        'Caching hot URLs reduces DB load significantly'
      ]
    },
    {
      id: 'twitter',
      title: 'Twitter / X',
      subtitle: 'Social Media Feed',
      icon: 'messageSquare',
      color: '#3b82f6',
      difficulty: 'Hard',
      requirements: ['Post tweets', 'Follow users', 'Timeline feed', 'Search', 'Notifications'],
      components: ['Tweet service', 'Timeline service', 'Fan-out service', 'Search (Elasticsearch)', 'Cache'],
      keyDecisions: [
        'Fan-out on write vs fan-out on read (hybrid for celebrities)',
        'Redis for timeline caching',
        'Separate read and write paths for scalability'
      ]
    },
    {
      id: 'uber',
      title: 'Uber / Lyft',
      subtitle: 'Ride-Sharing Service',
      icon: 'mapPin',
      color: '#8b5cf6',
      difficulty: 'Hard',
      requirements: ['Match riders with drivers', 'Real-time location', 'ETA calculation', 'Payments'],
      components: ['Location service', 'Matching service', 'Maps/routing', 'Payment service', 'Notification'],
      keyDecisions: [
        'Geospatial indexing: QuadTree or Geohash',
        'WebSockets for real-time updates',
        'Cell-based matching for efficient driver lookup'
      ]
    },
    {
      id: 'youtube',
      title: 'YouTube',
      subtitle: 'Video Streaming',
      icon: 'video',
      color: '#ef4444',
      difficulty: 'Hard',
      requirements: ['Upload videos', 'Stream videos', 'Search', 'Recommendations', 'Comments'],
      components: ['Upload service', 'Transcoding pipeline', 'CDN', 'Metadata DB', 'Search service'],
      keyDecisions: [
        'Async transcoding to multiple resolutions',
        'CDN for global video delivery',
        'Adaptive bitrate streaming (HLS/DASH)'
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
            {topicDetails.concepts && (
              <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-semibold mb-4">Key Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {topicDetails.concepts.map((concept, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: `${topicDetails.color}15`, color: topicDetails.color }}>
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {topicDetails.requirements && (
              <>
                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-semibold mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {topicDetails.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300">
                        <Icon name="check" size={16} className="text-green-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-semibold mb-4">Components</h3>
                  <div className="flex flex-wrap gap-2">
                    {topicDetails.components.map((comp, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-blue-500/15 text-blue-400">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-white font-semibold mb-4">Key Design Decisions</h3>
                  <ul className="space-y-3">
                    {topicDetails.keyDecisions.map((decision, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-blue-400 mt-1">→</span>
                        <span className="text-gray-300">{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {topicDetails.tips && (
              <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-white font-semibold mb-4">Tips</h3>
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
