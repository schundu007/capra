// Extra DSA pattern topics (AlgoMaster patterns not yet in core codingTopics)

export const extraCodingCategoryMap = {
  'prefix-sum': 'two-pointers',
  'kadanes-algorithm': 'two-pointers',
  'monotonic-stack': 'stacks-queues',
  'monotonic-queue': 'stacks-queues',
  'linked-list-reversal': 'linked-lists',
  'fast-slow-pointers': 'linked-lists',
  'divide-and-conquer': 'searching',
  'merge-sort': 'searching',
  'quicksort-quickselect': 'searching',
  'bucket-sort': 'searching',
  'tree-traversal': 'trees',
  'bst': 'trees',
  'two-heaps': 'trees',
  'top-k-elements': 'trees',
  'k-way-merge': 'trees',
  'data-structure-design': 'advanced',
  'union-find': 'trees',
  'topological-sort': 'trees',
  'shortest-path': 'trees',
  'knapsack-dp': 'dp',
  'string-dp': 'dp',
  'grid-dp': 'dp',
  'segment-tree': 'advanced',
};

export const extraCodingTopics = [
  // ─── 1. Prefix Sum ───────────────────────────────────────────────
  {
    id: 'prefix-sum',
    title: 'Prefix Sum',
    icon: 'hash',
    color: '#f59e0b',
    questions: 5,
    description: 'Precompute cumulative sums for O(1) range queries and subarray sum problems.',

    introduction: `Prefix Sum is a preprocessing technique that transforms an array into a cumulative sum array, enabling any range sum query to be answered in constant time. The core idea is simple: if you know the sum from index 0 to j and from 0 to i-1, then the sum from i to j is just prefix[j+1] - prefix[i].

**Why This Matters:**
This pattern appears in a surprising number of interview problems disguised as subarray sum questions. Problems involving "subarray sum equals K," divisibility conditions on subarrays, or counting subarrays with certain properties almost always benefit from prefix sums combined with hash maps.

**Key Insight:** When you pair prefix sums with a hash map that counts how many times each prefix sum value has occurred, you can solve subarray sum problems in O(n) that would otherwise require O(n^2) brute force enumeration of all subarrays.`,

    whenToUse: [
      'Need to answer multiple range sum queries on a static array',
      'Finding subarrays whose sum equals a target value',
      'Checking divisibility conditions on contiguous subarray sums',
      'Counting subarrays that satisfy a cumulative property',
      'Balancing problems where you track running differences (e.g., equal count of 0s and 1s)',
      'Any problem where brute-force requires summing all O(n^2) subarrays'
    ],

    keyPatterns: [
      'Basic prefix array: prefix[i] = prefix[i-1] + nums[i-1]',
      'Range sum via difference: sum(i,j) = prefix[j+1] - prefix[i]',
      'Hash map + prefix sum for subarray sum equals K',
      'Modular prefix sums for divisibility-based subarray queries',
      'Running difference arrays to reduce binary problems to sum problems'
    ],

    timeComplexity: 'O(n) build, O(1) per query',
    spaceComplexity: 'O(n) for prefix array',

    approach: [
      'Build the prefix sum array: prefix[0] = 0, prefix[i] = prefix[i-1] + nums[i-1]',
      'For range sum queries, return prefix[right+1] - prefix[left]',
      'For "subarray sum equals K," iterate while maintaining a hash map of prefix sums seen so far; at each index check if (currentPrefix - K) exists in the map',
      'For divisibility problems, store prefix sums modulo the divisor and count matching remainders',
      'Handle edge cases: empty array, single element, prefix sum overflow with large values'
    ],

    commonProblems: [
      { name: 'Range Sum Query - Immutable', difficulty: 'Easy' },
      { name: 'Subarray Sum Equals K', difficulty: 'Medium' },
      { name: 'Subarray Sums Divisible by K', difficulty: 'Medium' },
      { name: 'Continuous Subarray Sum', difficulty: 'Medium' },
      { name: 'Contiguous Array', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Off-by-one errors when building the prefix array (forgetting prefix[0] = 0)',
      'Not initializing the hash map with {0: 1} for subarray sum equals K problems',
      'Handling negative prefix sums incorrectly when using modular arithmetic',
      'Confusing the prefix array index with the original array index',
      'Forgetting that Python modulo handles negatives differently than C++/Java'
    ],

    tips: [
      'Always start your prefix array with 0 at index 0 so range queries work cleanly',
      'For subarray sum = K, the hash map stores prefix_sum -> count, initialized with {0: 1}',
      'Modular prefix sums let you find subarrays divisible by K in O(n)',
      'For 2D prefix sums, use inclusion-exclusion: sum = P[r2][c2] - P[r1-1][c2] - P[r2][c1-1] + P[r1-1][c1-1]',
      'When values can be negative, prefix sums are non-monotonic so binary search does not apply'
    ],

    interviewTips: [
      'When you see "subarray sum," immediately think prefix sums + hash map',
      'Explain why prefix sums reduce range queries from O(n) to O(1) per query',
      'Clarify whether the array is static (prefix sum) or mutable (need segment tree or BIT)',
      'For divisibility problems, walk through the modular arithmetic step by step',
      'Mention that prefix sums generalize to 2D for matrix range queries'
    ],
  },

  // ─── 2. Kadane's Algorithm ───────────────────────────────────────
  {
    id: 'kadanes-algorithm',
    title: "Kadane's Algorithm",
    icon: 'trendingUp',
    color: '#f59e0b',
    questions: 4,
    description: 'Find maximum subarray sums in linear time using a greedy running-sum technique.',

    introduction: `Kadane's Algorithm is an elegant O(n) approach to the Maximum Subarray problem. The idea is to maintain a running sum as you scan left to right: at each position, you decide whether to extend the current subarray or start fresh from the current element. The answer is the largest running sum encountered during the scan.

**Why This Matters:**
The Maximum Subarray problem is one of the most frequently asked interview questions and forms the basis for a family of problems involving contiguous subarray optimization. Variants include circular arrays, maximum product subarrays, and best sightseeing pairs.

**Key Insight:** The decision at each index is local: if the running sum so far is negative, it can only hurt any future subarray, so you discard it and start over. This greedy choice leads to a globally optimal answer, which is provable via dynamic programming: dp[i] = max(nums[i], dp[i-1] + nums[i]).`,

    whenToUse: [
      'Finding the maximum (or minimum) sum contiguous subarray',
      'Problems involving maximum product of a contiguous subarray',
      'Circular array variants where the subarray can wrap around',
      'Optimizing a metric over all contiguous subarrays in linear time',
      'Problems that reduce to "best subarray ending at each index"',
      'Any scenario where you need to decide between extending or restarting a running computation'
    ],

    keyPatterns: [
      'Standard Kadane: currentMax = max(nums[i], currentMax + nums[i])',
      'Circular variant: max(standardKadane, totalSum - minSubarraySum)',
      'Maximum product: track both maxProduct and minProduct at each step',
      'Minimum subarray variant: flip the comparison to find the minimum sum subarray'
    ],

    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',

    approach: [
      'Initialize currentMax and globalMax to the first element of the array',
      'Iterate from the second element: set currentMax = max(nums[i], currentMax + nums[i])',
      'Update globalMax = max(globalMax, currentMax) at each step',
      'For circular arrays, also compute the minimum subarray sum and use totalSum - minSum as a candidate answer',
      'For product variants, track both the running max and running min because a negative times a negative can become the new maximum'
    ],

    commonProblems: [
      { name: 'Maximum Subarray', difficulty: 'Medium' },
      { name: 'Maximum Sum Circular Subarray', difficulty: 'Medium' },
      { name: 'Maximum Product Subarray', difficulty: 'Medium' },
      { name: 'Best Sightseeing Pair', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Initializing currentMax to 0 instead of nums[0], which fails for all-negative arrays',
      'Forgetting the edge case in circular variant where all elements are negative (minSubarray = totalSum)',
      'In maximum product, not tracking the minimum product which can flip to maximum after multiplying by a negative',
      'Assuming Kadane works on non-contiguous subsequences (it only works for contiguous subarrays)',
      'Not handling arrays of length 1 correctly'
    ],

    tips: [
      'Kadane is essentially DP with O(1) space: dp[i] = max(nums[i], dp[i-1] + nums[i])',
      'For the circular variant, the answer is max(standardKadane, totalSum - minKadane), unless all elements are negative',
      'Maximum product requires tracking both max and min at each step due to sign flips',
      'To recover the actual subarray (not just the sum), track start and end indices during the scan',
      'Kadane can be adapted for 2D maximum sum rectangle using column compression'
    ],

    interviewTips: [
      'Start by stating the brute force O(n^2) approach, then show how Kadane optimizes to O(n)',
      'Explain the intuition: "A negative running sum can only hurt future subarrays, so we reset"',
      'For the circular variant, explain why totalSum - minSubarray gives the max wrapping subarray',
      'If asked for the subarray itself, mention you can track indices with two extra variables',
      'Connect Kadane to dynamic programming: it is a space-optimized 1D DP'
    ],
  },

  // ─── 3. Monotonic Stack ─────────────────────────────────────────
  {
    id: 'monotonic-stack',
    title: 'Monotonic Stack',
    icon: 'layers',
    color: '#22c55e',
    questions: 6,
    description: 'Use a stack that maintains sorted order to efficiently find next greater/smaller elements.',

    introduction: `A Monotonic Stack is a stack where elements are maintained in either strictly increasing or strictly decreasing order. When a new element violates the ordering, elements are popped until the invariant is restored. This technique is the go-to approach for "next greater element" and "next smaller element" problems.

**Why This Matters:**
Without a monotonic stack, finding the next greater element for every position requires O(n^2) brute force. The monotonic stack solves this in a single O(n) pass because each element is pushed and popped at most once. This pattern appears frequently in problems involving temperature spans, stock prices, histogram areas, and visibility.

**Key Insight:** The stack at any point contains elements that are "waiting" for their answer. When a new element arrives that is greater (or smaller) than the stack's top, we have found the answer for that waiting element, so we pop it and record the result.`,

    whenToUse: [
      'Finding the next greater or next smaller element for each position in an array',
      'Computing spans (how many consecutive days stock price was lower, etc.)',
      'Histogram problems like largest rectangle in histogram',
      'Pattern matching problems like 132 Pattern',
      'Visibility problems where you need to determine what elements can "see" each other',
      'Any problem that asks "for each element, find the nearest element satisfying a comparison"'
    ],

    keyPatterns: [
      'Decreasing monotonic stack for next greater element',
      'Increasing monotonic stack for next smaller element',
      'Stack stores indices (not values) to compute distances and widths',
      'Process from right to left for "previous greater" variants',
      'Two-pass or circular processing for wrap-around problems',
      'Combine with width calculation for area-based problems (histogram)'
    ],

    timeComplexity: 'O(n) amortized - each element pushed and popped at most once',
    spaceComplexity: 'O(n) for the stack',

    approach: [
      'Decide whether you need an increasing or decreasing stack based on whether you seek the next greater or next smaller element',
      'Iterate through the array; for each element, pop from the stack while the current element violates the monotonic property',
      'For each popped element, the current element is its answer (next greater/smaller)',
      'Push the current element (or its index) onto the stack',
      'After processing all elements, anything remaining on the stack has no answer (use -1 or default)'
    ],

    commonProblems: [
      { name: 'Next Greater Element I', difficulty: 'Easy' },
      { name: 'Daily Temperatures', difficulty: 'Medium' },
      { name: 'Online Stock Span', difficulty: 'Medium' },
      { name: '132 Pattern', difficulty: 'Medium' },
      { name: 'Number of Visible People in a Queue', difficulty: 'Hard' },
      { name: 'Largest Rectangle in Histogram', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Confusing when to use increasing vs decreasing stack (increasing finds next smaller, decreasing finds next greater)',
      'Storing values instead of indices when you need to compute distances or widths',
      'Forgetting to handle elements remaining on the stack after the loop (they have no next greater/smaller)',
      'Off-by-one errors when computing widths in histogram-style problems',
      'Not considering that the stack comparison should be strict (< vs <=) depending on duplicate handling'
    ],

    tips: [
      'Always store indices on the stack, not values - you can always look up values from indices',
      'For "next greater," use a decreasing stack; for "next smaller," use an increasing stack',
      'The largest rectangle in histogram is the classic monotonic stack problem - master it thoroughly',
      'For circular arrays, iterate through the array twice (2n iterations) to handle wrap-around',
      'Monotonic stacks can be combined with other techniques like prefix sums for advanced problems'
    ],

    interviewTips: [
      'Explain the invariant: "The stack always maintains decreasing order, so the first element we encounter that is larger becomes the next greater element for everything it pops"',
      'Walk through a small example to build intuition before coding',
      'Mention the amortized O(n) analysis: each element enters and leaves the stack at most once',
      'For histogram problems, explain how width is calculated using the index difference',
      'If stuck, start with the brute force O(n^2) solution, then observe that the stack eliminates redundant comparisons'
    ],
  },

  // ─── 4. Monotonic Queue ─────────────────────────────────────────
  {
    id: 'monotonic-queue',
    title: 'Monotonic Queue',
    icon: 'layers',
    color: '#22c55e',
    questions: 4,
    description: 'Maintain a deque with monotonic ordering to answer sliding window min/max queries in O(1).',

    introduction: `A Monotonic Queue (typically implemented as a deque) maintains elements in sorted order and supports efficient insertion and deletion from both ends. It is the definitive technique for sliding window maximum and minimum problems, reducing what would be an O(n*k) brute force to O(n).

**Why This Matters:**
Sliding Window Maximum is a classic hard problem that tests whether you understand how to maintain auxiliary data structures alongside a sliding window. The monotonic deque ensures that the front always holds the current window's maximum (or minimum), and stale elements are removed from the front when they leave the window.

**Key Insight:** When a new element enters the window that is larger than elements at the back of the deque, those back elements can never be the maximum for any future window position, so they are discarded. This pruning keeps the deque sorted and ensures amortized O(1) per operation.`,

    whenToUse: [
      'Finding the maximum or minimum in every sliding window of size k',
      'Dynamic programming optimizations where transitions depend on a sliding range of previous states',
      'Jump game variants where you pick the best value within a reachable range',
      'Problems requiring the best value within a sliding range combined with other constraints',
      'Any scenario where a naive approach computes max/min over overlapping windows repeatedly'
    ],

    keyPatterns: [
      'Decreasing deque for sliding window maximum (front = current max)',
      'Increasing deque for sliding window minimum (front = current min)',
      'Store indices in the deque for easy window boundary checks',
      'Pop from back when new element violates monotonic order; pop from front when element exits window',
      'DP optimization: dp[i] = max/min(dp[j] for j in [i-k, i-1]) + cost[i]'
    ],

    timeComplexity: 'O(n) amortized',
    spaceComplexity: 'O(k) where k is the window size',

    approach: [
      'Use a deque that stores indices of elements in decreasing (for max) or increasing (for min) order of their values',
      'For each new element: remove indices from the back of the deque while the new element is better (larger for max, smaller for min)',
      'Add the new index to the back of the deque',
      'Remove indices from the front that are outside the current window boundary',
      'The front of the deque always holds the index of the optimal element for the current window'
    ],

    commonProblems: [
      { name: 'Jump Game VI', difficulty: 'Medium' },
      { name: 'Longest Continuous Subarray With Absolute Diff', difficulty: 'Medium' },
      { name: 'Sliding Window Maximum', difficulty: 'Hard' },
      { name: 'Max Value of Equation', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Forgetting to remove elements from the front of the deque when they fall outside the window',
      'Using a regular queue instead of a deque, which prevents efficient back-removal',
      'Storing values instead of indices, making it impossible to check window boundaries',
      'Confusing increasing vs decreasing deque for max vs min queries',
      'Not recognizing when a DP recurrence can be optimized with a monotonic queue'
    ],

    tips: [
      'Always store indices in the deque, not values, so you can check if an element is still within the window',
      'For sliding window max, maintain a decreasing deque; for min, maintain an increasing deque',
      'The deque size never exceeds the window size k, giving O(k) space',
      'This technique is a powerful DP optimization: any recurrence of the form dp[i] = min/max(dp[j]) + f(i) over a range of j values',
      'Practice Sliding Window Maximum first - it is the foundational problem for this pattern'
    ],

    interviewTips: [
      'Start by explaining the brute force O(nk) approach, then introduce the deque optimization',
      'Clearly describe the two removal conditions: back (monotonic violation) and front (window expiry)',
      'Trace through a small example showing how the deque evolves with each step',
      'Mention that this is sometimes called a "sliding window deque" or "monotonic deque"',
      'For DP optimization problems, first write the naive DP, then show how the monotonic queue speeds it up'
    ],
  },

  // ─── 5. LinkedList In-place Reversal ────────────────────────────
  {
    id: 'linked-list-reversal',
    title: 'LinkedList In-place Reversal',
    icon: 'link',
    color: '#14b8a6',
    questions: 4,
    description: 'Reverse linked lists or sublists in-place by manipulating node pointers without extra space.',

    introduction: `In-place linked list reversal is one of the most fundamental pointer manipulation techniques. The core operation involves iterating through nodes and reversing the direction of each "next" pointer so that the list (or a portion of it) runs in the opposite direction. This is done using three pointers: previous, current, and next.

**Why This Matters:**
Linked list reversal appears directly in interviews and also serves as a building block for more advanced problems like reversing nodes in k-groups, checking palindromes, and reordering lists. Mastering this pattern demonstrates fluency with pointer manipulation and in-place algorithms.

**Key Insight:** The reversal works by visiting each node exactly once and flipping its next pointer to point backward. You need three pointers to avoid losing the reference to the rest of the list: prev (already reversed), curr (being processed), and next_node (saved before flipping).`,

    whenToUse: [
      'Reversing an entire linked list',
      'Reversing a sublist between positions m and n',
      'Checking if a linked list is a palindrome (reverse second half, then compare)',
      'Reversing nodes in groups of k',
      'Interleaving or reordering list nodes (often requires partial reversal)',
      'Any linked list problem that requires O(1) extra space transformation'
    ],

    keyPatterns: [
      'Three-pointer iterative reversal: prev, curr, next_node',
      'Recursive reversal: reverse rest, then fix pointers',
      'Sublist reversal: save nodes before and after the reversed segment for reconnection',
      'Reverse in k-groups: combine reversal with counting and group boundary management',
      'Palindrome check: find middle with slow/fast, reverse second half, compare'
    ],

    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) iterative, O(n) recursive due to call stack',

    approach: [
      'For full reversal: initialize prev = null, curr = head; iterate: save next_node = curr.next, set curr.next = prev, advance prev = curr, curr = next_node; return prev as new head',
      'For sublist reversal (positions m to n): traverse to node m-1 (the node before the reversal starts), save it as the connection point, reverse from m to n, then reconnect',
      'For k-group reversal: count k nodes, reverse that group, recursively or iteratively handle the next group, reconnect groups',
      'Use a dummy/sentinel node before head to simplify edge cases where the head itself is part of the reversal',
      'Always draw the pointer changes on paper before coding to avoid losing references'
    ],

    commonProblems: [
      { name: 'Palindrome Linked List', difficulty: 'Easy' },
      { name: 'Reverse Linked List', difficulty: 'Easy' },
      { name: 'Reverse Linked List II', difficulty: 'Medium' },
      { name: 'Reverse Nodes in k-Group', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Losing the reference to the rest of the list by not saving curr.next before flipping the pointer',
      'Forgetting to reconnect the reversed segment to the nodes before and after it in sublist reversal',
      'Off-by-one errors when counting positions for sublist reversal (1-indexed vs 0-indexed)',
      'Not using a dummy node, leading to special-case handling when the head is part of the reversal',
      'Returning the wrong node as the new head after reversal'
    ],

    tips: [
      'Always use a dummy/sentinel node to avoid special-casing head modifications',
      'Draw the linked list and trace pointer changes for at least one example before coding',
      'For palindrome checks, reverse only the second half and restore it afterward if required',
      'The iterative approach is preferred in interviews because it uses O(1) space',
      'Practice the three-pointer pattern until it becomes second nature: save next, flip pointer, advance'
    ],

    interviewTips: [
      'State clearly: "I will use three pointers: prev, curr, and next_node to reverse in-place"',
      'For sublist reversal, explain the reconnection step carefully - this is where most bugs occur',
      'Mention the dummy node technique proactively to show you handle edge cases',
      'If asked for recursive reversal, explain the call stack space cost O(n) vs iterative O(1)',
      'Walk through a 3-4 node example step by step to demonstrate correctness'
    ],
  },

  // ─── 6. Fast & Slow Pointers ────────────────────────────────────
  {
    id: 'fast-slow-pointers',
    title: 'Fast & Slow Pointers',
    icon: 'zap',
    color: '#14b8a6',
    questions: 3,
    description: 'Detect cycles, find midpoints, and solve linked list problems using two pointers moving at different speeds.',

    introduction: `The Fast & Slow Pointers technique (also called Floyd's Tortoise and Hare) uses two pointers that traverse a sequence at different speeds. The slow pointer moves one step at a time while the fast pointer moves two steps. This simple idea solves cycle detection, middle-finding, and several other structural problems elegantly.

**Why This Matters:**
Cycle detection in linked lists is a classic interview question, but the pattern extends beyond linked lists. It applies to any problem with a cyclic structure: detecting cycles in sequences (Happy Number), finding duplicate numbers, and identifying the start of a cycle. The O(1) space usage is what makes this technique special compared to hash set approaches.

**Key Insight:** If a cycle exists, the fast pointer will eventually "lap" the slow pointer and they will meet inside the cycle. To find where the cycle begins, reset one pointer to the start and move both at the same speed - they meet at the cycle entrance. This works because of a mathematical relationship between the distances traveled.`,

    whenToUse: [
      'Detecting if a linked list has a cycle',
      'Finding the node where a cycle begins in a linked list',
      'Finding the middle node of a linked list in one pass',
      'Detecting cycles in number sequences (e.g., Happy Number)',
      'Finding duplicate elements in arrays where values represent "next" pointers (Floyd\'s algorithm on arrays)'
    ],

    keyPatterns: [
      'Cycle detection: slow moves 1 step, fast moves 2 steps; they meet if cycle exists',
      'Cycle start: after meeting, reset one pointer to head, move both 1 step until they meet again',
      'Middle finding: when fast reaches end, slow is at the middle',
      'Palindrome preparation: use slow/fast to split the list at the midpoint'
    ],

    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',

    approach: [
      'Initialize slow = head, fast = head (or fast = head.next depending on the variant)',
      'Move slow one step and fast two steps in each iteration',
      'For cycle detection: if fast and slow meet, a cycle exists; if fast reaches null, no cycle',
      'For cycle start: after detection, reset slow to head, then move both one step at a time until they meet at the cycle entrance',
      'For middle finding: when fast reaches the end (fast == null or fast.next == null), slow is at the middle'
    ],

    commonProblems: [
      { name: 'Middle of the Linked List', difficulty: 'Easy' },
      { name: 'Happy Number', difficulty: 'Easy' },
      { name: 'Linked List Cycle II', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Using fast = head.next for cycle detection but forgetting this changes the meeting point math for cycle start',
      'Not checking fast != null AND fast.next != null before advancing fast two steps (causes null pointer exception)',
      'Confusing "detect cycle" with "find cycle start" - they require different follow-up steps',
      'Applying this pattern when a hash set would be simpler and equally efficient for the given constraints',
      'Forgetting that for middle finding, the definition of "middle" differs for even-length lists depending on initialization'
    ],

    tips: [
      'For cycle start detection, the math proof relies on: distance from head to cycle start equals distance from meeting point to cycle start (going around the cycle)',
      'To find the middle of a list, stop when fast == null (gives upper middle for even length) or fast.next == null',
      'This pattern uses O(1) space compared to O(n) for a hash set approach',
      'The Happy Number problem is a disguised cycle detection problem on a number sequence',
      'Practice both the "detect cycle" and "find cycle start" variants until you can code them from memory'
    ],

    interviewTips: [
      'Explain why two speeds guarantee a meeting inside the cycle (the gap closes by 1 each step)',
      'Be ready to prove the cycle start algorithm: explain the distance relationship mathematically or with a diagram',
      'Mention Floyd\'s Tortoise and Hare by name to show familiarity with the algorithm',
      'For middle finding, clarify which middle you return for even-length lists before coding',
      'If the interviewer asks about the hash set alternative, explain the space trade-off: O(n) vs O(1)'
    ],
  },

  // ─── 7. Divide and Conquer ──────────────────────────────────────
  {
    id: 'divide-and-conquer',
    title: 'Divide and Conquer',
    icon: 'scissors',
    color: '#eab308',
    questions: 3,
    description: 'Break problems into independent subproblems, solve recursively, and combine results.',

    introduction: `Divide and Conquer is a fundamental algorithmic paradigm that solves a problem by breaking it into smaller subproblems of the same type, solving each subproblem recursively, and then combining the results. Classic examples include merge sort, quicksort, and binary search, but the pattern extends to tree construction, geometric algorithms, and matrix multiplication.

**Why This Matters:**
Many efficient algorithms are based on divide and conquer. Understanding this paradigm helps you recognize when a problem has optimal substructure that allows recursive decomposition. Interview problems that involve building balanced structures (BSTs from sorted data), spatial decomposition (Quad Trees), or efficiently combining partial results often use this approach.

**Key Insight:** The efficiency gain comes from reducing work at each level. If you split a problem of size n into two subproblems of size n/2 and the combine step takes O(n), you get O(n log n) total work. The Master Theorem formalizes this: T(n) = aT(n/b) + O(n^d) determines the overall complexity based on a, b, and d.`,

    whenToUse: [
      'Problems that can be decomposed into independent subproblems of the same structure',
      'Building balanced trees or structures from sorted input',
      'Geometric decomposition (Quad Trees, k-d trees)',
      'When merging two sorted results is easier than solving the whole problem directly',
      'Problems where brute force is polynomial but divide and conquer yields a better recurrence',
      'Counting inversions, closest pair of points, and similar combinatorial problems'
    ],

    keyPatterns: [
      'Binary split: divide input in half, recurse on each half, combine',
      'Tree construction from sorted arrays/lists: root = mid, left subtree = left half, right subtree = right half',
      'Spatial decomposition: partition 2D space into quadrants recursively',
      'Merge-based counting: count cross-boundary contributions during the merge step'
    ],

    timeComplexity: 'Typically O(n log n) for balanced splits',
    spaceComplexity: 'O(log n) for recursion stack with balanced splits',

    approach: [
      'Identify the base case: what is the smallest subproblem you can solve directly?',
      'Define the divide step: how do you split the problem into smaller instances?',
      'Define the conquer step: recursively solve each subproblem',
      'Define the combine step: how do you merge subproblem solutions into the overall answer?',
      'Analyze the recurrence relation to determine the time complexity using the Master Theorem'
    ],

    commonProblems: [
      { name: 'Convert Sorted List to BST', difficulty: 'Medium' },
      { name: 'Construct Quad Tree', difficulty: 'Medium' },
      { name: 'Maximum Binary Tree', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Forgetting the base case, leading to infinite recursion',
      'Creating unbalanced splits that degrade to O(n^2) instead of O(n log n)',
      'Incorrectly combining results, especially when cross-boundary contributions matter',
      'Not recognizing overlapping subproblems, which means DP (memoization) would be more efficient than pure divide and conquer',
      'Stack overflow from deep recursion on large inputs - consider iterative conversion'
    ],

    tips: [
      'Always start by identifying the base case and the simplest version of the problem',
      'Balanced splits are crucial for O(n log n) performance - use the midpoint when possible',
      'For linked list problems, use slow/fast pointers to find the midpoint efficiently',
      'Draw the recursion tree to understand the work done at each level',
      'If subproblems overlap, switch to dynamic programming with memoization'
    ],

    interviewTips: [
      'Clearly articulate the three steps: divide, conquer, combine',
      'State the recurrence relation and use the Master Theorem to derive the time complexity',
      'For tree construction problems, explain why choosing the middle element ensures balance',
      'Mention that merge sort is the canonical divide and conquer algorithm',
      'Compare with dynamic programming when asked: D&C has independent subproblems, DP has overlapping ones'
    ],
  },

  // ─── 8. Merge Sort ──────────────────────────────────────────────
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    icon: 'gitMerge',
    color: '#eab308',
    questions: 2,
    description: 'A stable O(n log n) divide-and-conquer sort that also powers inversion counting and linked list sorting.',

    introduction: `Merge Sort is a divide-and-conquer sorting algorithm that splits the array in half, recursively sorts each half, and merges the two sorted halves. It guarantees O(n log n) time in all cases (best, average, worst) and is stable, preserving the relative order of equal elements.

**Why This Matters:**
Beyond sorting, the merge step is a powerful technique for counting inversions, reverse pairs, and other cross-boundary relationships. Merge sort is also the preferred algorithm for sorting linked lists because it does not require random access. Interview problems often test your ability to adapt the merge step to count something while sorting.

**Key Insight:** During the merge step, when an element from the right half is placed before elements remaining in the left half, you can count how many elements in the left half are "greater" - this is the basis for inversion counting and reverse pairs. The merge step gives you a structured way to count cross-boundary relationships.`,

    whenToUse: [
      'Sorting when worst-case O(n log n) is required (quicksort degrades to O(n^2))',
      'Sorting linked lists (no random access needed, and can be done in O(1) extra space for lists)',
      'Counting inversions in an array',
      'Counting reverse pairs or other order-based relationships',
      'When stability is required (maintaining relative order of equal elements)',
      'External sorting of data that does not fit in memory'
    ],

    keyPatterns: [
      'Standard merge sort: split, recurse, merge two sorted halves',
      'Modified merge for counting: count cross-boundary pairs during the merge step',
      'Bottom-up merge sort: iterative version that avoids recursion overhead',
      'Linked list merge sort: use slow/fast to split, merge two sorted lists'
    ],

    timeComplexity: 'O(n log n) in all cases',
    spaceComplexity: 'O(n) for arrays, O(log n) for linked lists',

    approach: [
      'Base case: arrays of size 0 or 1 are already sorted',
      'Split the array at the midpoint into two halves',
      'Recursively sort the left half and right half',
      'Merge the two sorted halves using a two-pointer technique into a temporary array',
      'For counting variants, add the counting logic during the merge step before or during the standard merge'
    ],

    commonProblems: [
      { name: 'Sort List', difficulty: 'Medium' },
      { name: 'Reverse Pairs', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Forgetting to copy the remaining elements from the non-exhausted half during merge',
      'Off-by-one errors in the split indices (mid = left + (right - left) // 2)',
      'Creating new arrays at every recursive call instead of using a pre-allocated buffer',
      'In counting problems, modifying the count incorrectly because the two halves are being sorted simultaneously',
      'Not handling the linked list split correctly (must set the end of the first half to null)'
    ],

    tips: [
      'Pre-allocate a temporary array of size n to avoid repeated allocation during merges',
      'For linked list merge sort, find the middle with slow/fast pointers and set slow.next = null to split',
      'Reverse pairs requires a separate counting pass before the merge because the condition differs from the sort order',
      'Bottom-up merge sort avoids recursion and can be more cache-friendly',
      'Merge sort is the basis for external sort algorithms used in databases'
    ],

    interviewTips: [
      'State the time complexity guarantee: O(n log n) worst case, unlike quicksort',
      'Explain why merge sort is preferred for linked lists: no random access needed and O(1) extra space',
      'For inversion counting, clearly explain how the merge step reveals inversions',
      'Mention stability as an advantage over quicksort and heapsort',
      'If asked about space, note the O(n) auxiliary space for arrays is the main drawback'
    ],
  },

  // ─── 9. QuickSort / QuickSelect ─────────────────────────────────
  {
    id: 'quicksort-quickselect',
    title: 'QuickSort / QuickSelect',
    icon: 'zap',
    color: '#eab308',
    questions: 2,
    description: 'Partition-based algorithms for efficient sorting and O(n) average-case k-th element selection.',

    introduction: `QuickSort uses a pivot element to partition the array into elements less than and greater than the pivot, then recursively sorts each partition. QuickSelect adapts this idea to find the k-th smallest (or largest) element in O(n) average time by only recursing into the partition that contains the target index.

**Why This Matters:**
QuickSort is the most commonly used sorting algorithm in practice due to its excellent average-case performance and cache efficiency. QuickSelect is the optimal solution for "k-th largest element" problems, providing O(n) average time compared to O(n log n) for sorting or O(n log k) for a heap. Both algorithms test your understanding of partitioning, which is a versatile technique.

**Key Insight:** The partition operation is the workhorse. After one partition, the pivot is in its final sorted position. For QuickSelect, you only need to recurse into the partition containing index k, halving the problem size on average, which yields O(n) average time by the geometric series argument.`,

    whenToUse: [
      'General-purpose sorting when average O(n log n) is sufficient and O(n^2) worst case is acceptable',
      'Finding the k-th smallest or k-th largest element in an array',
      'Problems like Sort Colors that require in-place partitioning (Dutch National Flag)',
      'When cache performance matters (quicksort has better locality than merge sort)',
      'Partial sorting: you only need the top-k elements in sorted order',
      'Three-way partitioning when there are many duplicate elements'
    ],

    keyPatterns: [
      'Lomuto partition: single pointer, pivot at end, simpler but slower on duplicates',
      'Hoare partition: two pointers from both ends, faster in practice',
      'Dutch National Flag (3-way partition): handles duplicates efficiently',
      'QuickSelect with random pivot: recurse only into the partition containing the target index',
      'Median-of-three pivot selection to avoid worst-case behavior'
    ],

    timeComplexity: 'QuickSort: O(n log n) average, O(n^2) worst. QuickSelect: O(n) average, O(n^2) worst.',
    spaceComplexity: 'O(log n) average for recursion stack',

    approach: [
      'Choose a pivot (random selection avoids worst-case on sorted input)',
      'Partition the array around the pivot: elements < pivot on left, > pivot on right',
      'For QuickSort: recursively sort both partitions',
      'For QuickSelect: only recurse into the partition containing the k-th index',
      'For Dutch National Flag: use three pointers (low, mid, high) to partition into three groups'
    ],

    commonProblems: [
      { name: 'Sort Colors', difficulty: 'Medium' },
      { name: 'Kth Largest Element in an Array', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Using a fixed pivot (e.g., always first or last element), which causes O(n^2) on sorted or nearly-sorted input',
      'Infinite recursion when the partition does not make progress (pivot equals all elements)',
      'Not handling duplicates properly, leading to unbalanced partitions',
      'Confusing k-th largest with k-th smallest (k-th largest = (n-k)-th smallest)',
      'Forgetting that QuickSelect modifies the array in-place, which may not be acceptable'
    ],

    tips: [
      'Always use random pivot selection to get O(n log n) expected time for QuickSort',
      'For Sort Colors, the Dutch National Flag three-way partition is the standard approach',
      'QuickSelect is the standard approach for "k-th largest" problems in interviews',
      'The Introselect algorithm combines QuickSelect with median-of-medians for guaranteed O(n) worst case',
      'Three-way partitioning is essential when the array has many duplicate values'
    ],

    interviewTips: [
      'Explain the partitioning step clearly - it is the core of both algorithms',
      'Mention random pivot selection proactively to address worst-case concerns',
      'For k-th largest, explain why QuickSelect is O(n) average: you halve the search space each time',
      'Compare with heap-based approach: QuickSelect O(n) vs heap O(n log k) - discuss trade-offs',
      'If asked about worst case, mention randomization or median-of-medians as mitigations'
    ],
  },

  // ─── 10. Bucket Sort ────────────────────────────────────────────
  {
    id: 'bucket-sort',
    title: 'Bucket Sort',
    icon: 'archive',
    color: '#eab308',
    questions: 3,
    description: 'Distribute elements into buckets for linear-time sorting when input has known range or distribution.',

    introduction: `Bucket Sort distributes elements into a fixed number of buckets based on some criterion (value range, frequency, etc.), processes each bucket independently, and concatenates the results. When elements are uniformly distributed, this achieves O(n) average time, beating comparison-based sorts' O(n log n) lower bound.

**Why This Matters:**
In interviews, bucket sort appears in problems involving frequency-based ordering (Top K Frequent, Sort by Frequency) and gap-based problems (Maximum Gap). The key insight is that when you can map elements to a bounded number of buckets, you bypass the comparison sort lower bound. Counting sort and radix sort are special cases of this paradigm.

**Key Insight:** The power of bucket sort lies in the bucketing function. By choosing the right mapping (value ranges, frequencies, digit values), you can solve problems that seem to require sorting in O(n) time. For Maximum Gap, the pigeonhole principle guarantees the answer spans at least one empty bucket, so you only need to check bucket boundaries.`,

    whenToUse: [
      'Sorting when the value range or number of distinct values is bounded',
      'Frequency-based sorting (most frequent, least frequent, sort by frequency)',
      'Finding the maximum gap between consecutive elements in sorted order',
      'When elements can be categorized into a manageable number of groups',
      'Problems where counting sort or radix sort principles apply',
      'Top-K problems where heap is overkill and bucket sort gives O(n)'
    ],

    keyPatterns: [
      'Frequency buckets: index = frequency, value = list of elements with that frequency',
      'Value-range buckets: divide the range [min, max] into equal-sized intervals',
      'Counting sort: one bucket per distinct value, count occurrences',
      'Radix sort: sort by each digit position using a stable sort (counting sort) as subroutine',
      'Gap analysis: create n+1 buckets, max gap must span an empty bucket'
    ],

    timeComplexity: 'O(n + k) where k is the number of buckets',
    spaceComplexity: 'O(n + k)',

    approach: [
      'Determine the bucketing criterion: frequency, value range, digit, or custom mapping',
      'Create the appropriate number of buckets (often n or range-based)',
      'Distribute each element into its designated bucket',
      'Process buckets: sort within each bucket if needed, or just collect',
      'Concatenate bucket contents in order to produce the final result'
    ],

    commonProblems: [
      { name: 'Sort Characters By Frequency', difficulty: 'Medium' },
      { name: 'Top K Frequent Words', difficulty: 'Medium' },
      { name: 'Maximum Gap', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Choosing too few buckets, causing large buckets that require expensive internal sorting',
      'Off-by-one errors in bucket index calculation, especially for value-range bucketing',
      'Forgetting to handle empty buckets correctly',
      'Not realizing that bucket sort is not a comparison sort and therefore can beat O(n log n)',
      'Using bucket sort when the range is extremely large relative to n, negating the benefit'
    ],

    tips: [
      'For Top K Frequent, use frequency as the bucket index: bucket[freq] = [elements with that frequency]',
      'For Maximum Gap, bucket size = ceil((max - min) / (n - 1)), and the answer is always across bucket boundaries',
      'Counting sort is the simplest bucket sort: one bucket per value, count occurrences',
      'Radix sort processes digits from least significant to most significant using a stable bucket sort',
      'When the number of distinct values is small, bucket sort gives true O(n) performance'
    ],

    interviewTips: [
      'Explain why bucket sort can achieve O(n): it is not comparison-based, so the O(n log n) lower bound does not apply',
      'For frequency problems, describe the frequency bucket technique clearly',
      'For Maximum Gap, explain the pigeonhole argument: n-1 gaps, n+1 buckets, so the max gap spans an empty bucket',
      'Mention that counting sort and radix sort are special cases of bucket sort',
      'Discuss when bucket sort is appropriate vs when comparison sorts are better (unknown distribution, large range)'
    ],
  },

  // ─── 11. Tree Traversals ────────────────────────────────────────
  {
    id: 'tree-traversal',
    title: 'Tree Traversals',
    icon: 'gitBranch',
    color: '#06b6d4',
    questions: 13,
    description: 'Master preorder, inorder, postorder, and level-order traversals to solve tree problems systematically.',

    introduction: `Tree traversals are the fundamental operations for visiting every node in a tree. The four main traversals are: preorder (root, left, right), inorder (left, root, right), postorder (left, right, root), and level-order (breadth-first, level by level). Each traversal reveals different structural properties of the tree.

**Why This Matters:**
Nearly every tree problem in interviews requires a traversal as its backbone. Inorder traversal of a BST produces sorted output. Preorder traversal reconstructs the tree. Postorder traversal computes bottom-up aggregates (heights, diameters). Level-order traversal processes nodes layer by layer. Choosing the right traversal is the first step to solving any tree problem.

**Key Insight:** The three DFS traversals (preorder, inorder, postorder) differ only in when you process the current node relative to the recursive calls. Once you internalize this, you can adapt any traversal to solve different problems by choosing when to do the "work" (before, between, or after visiting children).`,

    whenToUse: [
      'Processing all nodes in a tree or extracting information from the tree structure',
      'Level-order (BFS) for problems involving levels, depths, or layer-by-layer processing',
      'Inorder for BST problems requiring sorted order',
      'Preorder for serialization, copying, or building tree representations',
      'Postorder for bottom-up computations like height, diameter, or subtree aggregation',
      'Zigzag, right-side view, and other level-based views of the tree'
    ],

    keyPatterns: [
      'Recursive DFS: choose pre/in/post based on when to process the node',
      'Iterative DFS with explicit stack: simulates recursion without call stack overhead',
      'BFS with queue: level-order traversal, track level boundaries with queue size',
      'Morris traversal: O(1) space inorder traversal using threaded pointers',
      'Zigzag: BFS with alternating left-right / right-left collection per level',
      'Right side view: BFS taking the last node at each level, or DFS prioritizing right children'
    ],

    timeComplexity: 'O(n) for all traversals',
    spaceComplexity: 'O(h) for DFS (h = tree height), O(w) for BFS (w = max width)',

    approach: [
      'Determine which traversal order is needed based on the problem requirements',
      'For DFS: implement recursively first, then convert to iterative with a stack if needed',
      'For BFS: use a queue, process one level at a time by recording the queue size at the start of each level',
      'For each problem, identify what "work" needs to be done at each node and when (before, between, or after children)',
      'Handle edge cases: empty tree, single node, skewed tree (essentially a linked list)'
    ],

    commonProblems: [
      { name: 'Binary Tree Level Order Traversal', difficulty: 'Medium' },
      { name: 'Binary Tree Right Side View', difficulty: 'Medium' },
      { name: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium' },
      { name: 'Binary Tree Preorder Traversal', difficulty: 'Easy' },
      { name: 'Same Tree', difficulty: 'Easy' },
      { name: 'Symmetric Tree', difficulty: 'Easy' },
      { name: 'Binary Tree Inorder Traversal', difficulty: 'Easy' },
      { name: 'Validate Binary Search Tree', difficulty: 'Medium' },
      { name: 'Binary Tree Postorder Traversal', difficulty: 'Easy' },
      { name: 'Invert Binary Tree', difficulty: 'Easy' },
      { name: 'Diameter of Binary Tree', difficulty: 'Easy' },
      { name: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium' },
      { name: 'Binary Tree Maximum Path Sum', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Confusing which traversal to use: inorder for BST sorted order, preorder for top-down, postorder for bottom-up',
      'Forgetting the base case (null node) in recursive implementations',
      'In level-order, not capturing the queue size at the start of each level, leading to mixed-level processing',
      'For iterative inorder, pushing nodes incorrectly or not going left far enough before processing',
      'Assuming the tree is balanced when computing space complexity (worst case is O(n) for skewed trees)'
    ],

    tips: [
      'Recursive DFS is usually cleaner and faster to write in interviews; use iterative only if asked or for follow-up',
      'For BST validation, inorder traversal is the cleanest approach: check that each value is greater than the previous',
      'Level-order traversal is the go-to for any problem involving "levels" or "depth"',
      'Morris traversal achieves O(1) space by temporarily modifying the tree structure - impressive to mention but rarely required',
      'For diameter and max path sum, use postorder traversal to compute heights bottom-up and track the global maximum'
    ],

    interviewTips: [
      'State which traversal you are using and why: "I will use postorder because I need bottom-up information"',
      'For level-order problems, mention BFS immediately and describe the queue-based approach',
      'When validating a BST, explain why inorder traversal produces sorted output and how to check it',
      'For right side view, mention both BFS (last per level) and DFS (right-first) approaches',
      'Be prepared to convert a recursive DFS to iterative if the interviewer asks about stack overflow concerns'
    ],
  },

  // ─── 12. BST / Ordered Set ──────────────────────────────────────
  {
    id: 'bst',
    title: 'BST / Ordered Set',
    icon: 'gitBranch',
    color: '#06b6d4',
    questions: 4,
    description: 'Leverage BST properties for ordered data operations: search, insert, delete, and range queries in O(log n).',

    introduction: `A Binary Search Tree (BST) maintains the invariant that for every node, all values in its left subtree are smaller and all values in its right subtree are larger. This ordering enables O(log n) search, insertion, and deletion in balanced trees. Ordered sets (like Java's TreeSet or C++'s std::set) are self-balancing BSTs that guarantee these bounds.

**Why This Matters:**
BST problems test your understanding of tree invariants and how to exploit ordered structure. Interview problems range from basic BST operations (trim, validate) to using ordered sets as building blocks for scheduling, interval, and streaming problems. Languages with built-in ordered sets (Java TreeMap, C++ set/map) give you powerful tools for problems requiring sorted dynamic collections.

**Key Insight:** The BST property means an inorder traversal produces elements in sorted order. This is the foundation for range queries, finding predecessors/successors, and validating BST correctness. When you need a dynamic sorted collection with O(log n) operations, think BST or ordered set.`,

    whenToUse: [
      'Need a dynamic collection that supports sorted order operations',
      'Finding predecessors, successors, or nearest values efficiently',
      'Range queries: find all elements in [low, high]',
      'Calendar/scheduling problems where you check for overlapping intervals',
      'Streaming problems where you need to maintain sorted order as elements arrive',
      'Any problem where both insertion and sorted access are needed frequently'
    ],

    keyPatterns: [
      'BST search: compare with root, go left if smaller, right if larger',
      'BST insertion: find the correct leaf position following search path',
      'BST deletion: handle three cases (leaf, one child, two children via inorder successor)',
      'Trimming a BST: recursively prune nodes outside a given range',
      'Using TreeMap/ordered set for interval overlap detection',
      'Inorder traversal for sorted enumeration'
    ],

    timeComplexity: 'O(log n) for balanced BSTs, O(n) worst case for skewed',
    spaceComplexity: 'O(n) for tree storage',

    approach: [
      'For BST manipulation problems, think recursively: how does the operation apply to left subtree, root, and right subtree?',
      'For trimming: if root < low, the answer is in the right subtree; if root > high, the answer is in the left subtree; otherwise, trim both subtrees',
      'For calendar/overlap problems, use a TreeMap to store intervals and check floor/ceiling entries for conflicts',
      'For validation, use inorder traversal or pass min/max bounds recursively',
      'For problems requiring ordered set operations in Python (which lacks a built-in TreeSet), consider SortedList from sortedcontainers or bisect module'
    ],

    commonProblems: [
      { name: 'Trim a Binary Search Tree', difficulty: 'Medium' },
      { name: 'My Calendar I', difficulty: 'Medium' },
      { name: 'My Calendar II', difficulty: 'Medium' },
      { name: 'Stock Price Fluctuation', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Forgetting that BST operations are O(n) in the worst case for unbalanced trees',
      'Not handling the three deletion cases correctly (especially two-children case with inorder successor)',
      'In Python, using a list with bisect for ordered operations but forgetting insertion is still O(n)',
      'Confusing BST property (strictly less/greater) with allowing duplicates without a clear convention',
      'Not leveraging built-in ordered set/map data structures when they are available in the language'
    ],

    tips: [
      'In Java, use TreeMap/TreeSet; in C++, use std::set/std::map for self-balancing BST operations',
      'In Python, use sortedcontainers.SortedList for O(log n) sorted operations',
      'BST deletion with two children: replace with inorder successor (smallest in right subtree) or inorder predecessor',
      'For calendar problems, the key insight is using floor() and ceiling() operations from an ordered map',
      'Augmented BSTs (storing subtree sizes, sums) enable order-statistic queries and range sum queries'
    ],

    interviewTips: [
      'State the BST invariant explicitly: "All left descendants are strictly less, all right descendants are strictly greater"',
      'When using ordered sets, mention the self-balancing guarantee (Red-Black Tree or AVL tree internally)',
      'For Python interviews, mention the sortedcontainers library or explain your bisect-based approach',
      'If implementing BST operations from scratch, handle all edge cases including empty tree and single node',
      'Connect to other topics: "Inorder traversal of a BST gives sorted order, which I can use to validate or enumerate"'
    ],
  },

  // ─── 13. Two Heaps ──────────────────────────────────────────────
  {
    id: 'two-heaps',
    title: 'Two Heaps',
    icon: 'layers',
    color: '#06b6d4',
    questions: 3,
    description: 'Maintain a max-heap and min-heap together to efficiently track the median or balance two halves of data.',

    introduction: `The Two Heaps pattern uses a max-heap for the smaller half of elements and a min-heap for the larger half. By keeping these two heaps balanced (sizes differ by at most 1), the median is always available at the top of one or both heaps. This enables O(log n) insertions and O(1) median queries on a streaming dataset.

**Why This Matters:**
"Find Median from Data Stream" is one of the most popular hard interview questions and the Two Heaps pattern is its canonical solution. The same pattern appears in sliding window median problems and optimization problems like IPO where you need to efficiently access both the smallest and largest elements from two different perspectives.

**Key Insight:** The max-heap holds elements less than or equal to the median, and the min-heap holds elements greater than the median. The median is either the top of the max-heap (odd total count) or the average of both tops (even count). The balancing step after each insertion ensures the size difference never exceeds 1.`,

    whenToUse: [
      'Finding the median of a data stream (running median)',
      'Sliding window median problems',
      'Problems requiring quick access to both the maximum of a lower half and minimum of an upper half',
      'Optimization problems that greedily select from the smallest available and track profits (IPO pattern)',
      'Any scenario where you partition data into two groups and need efficient access to the boundary between them'
    ],

    keyPatterns: [
      'Max-heap for lower half, min-heap for upper half, balanced sizes',
      'Insert into appropriate heap, then rebalance if sizes differ by more than 1',
      'Median = max_heap top (odd count) or average of both tops (even count)',
      'Sliding window variant: lazy deletion with a hash map tracking removed elements',
      'IPO pattern: min-heap for costs, max-heap for profits of affordable items'
    ],

    timeComplexity: 'O(log n) per insertion, O(1) for median query',
    spaceComplexity: 'O(n)',

    approach: [
      'Create a max-heap (lower half) and a min-heap (upper half)',
      'For each new element: if it is less than or equal to the max-heap top, add to max-heap; otherwise add to min-heap',
      'After insertion, rebalance: if one heap has more than 1 extra element, move its top to the other heap',
      'The median is the top of the larger heap (odd count) or the average of both tops (even count)',
      'For sliding window: use lazy deletion - mark elements as deleted and only remove when they appear at the top'
    ],

    commonProblems: [
      { name: 'Find Median from Data Stream', difficulty: 'Hard' },
      { name: 'IPO', difficulty: 'Hard' },
      { name: 'Sliding Window Median', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'In Python, forgetting to negate values for the max-heap (heapq is min-heap only)',
      'Not rebalancing after every insertion, leading to incorrect median',
      'For sliding window median, not handling lazy deletion properly (stale elements at heap tops)',
      'Incorrect median calculation when one heap has one more element than the other',
      'Not handling the edge case of the first insertion when both heaps are empty'
    ],

    tips: [
      'In Python, simulate a max-heap by inserting negated values into heapq',
      'Always add to max-heap first, then move the top to min-heap, then rebalance - this simplifies the logic',
      'For sliding window, use a counter/dictionary to track elements that should be logically deleted and clean up lazily',
      'The IPO problem uses two heaps differently: one sorted by cost (min-heap) and one by profit (max-heap)',
      'Consider using a self-balancing BST (e.g., SortedList) as an alternative for sliding window median'
    ],

    interviewTips: [
      'Draw the two heaps and show how the median sits at the boundary between them',
      'Explain the balancing invariant: sizes differ by at most 1, and max_heap.top <= min_heap.top',
      'For Find Median from Data Stream, walk through adding 5 elements and show the heap states',
      'Mention the time complexities: O(log n) insert, O(1) median query',
      'For the sliding window variant, explain why lazy deletion is necessary and how it works'
    ],
  },

  // ─── 14. Top K Elements ─────────────────────────────────────────
  {
    id: 'top-k-elements',
    title: 'Top K Elements',
    icon: 'award',
    color: '#06b6d4',
    questions: 3,
    description: 'Efficiently find the k largest, smallest, or most frequent elements using heaps or partitioning.',

    introduction: `The Top K Elements pattern involves finding the k elements that rank highest (or lowest) according to some criterion. The three main approaches are: a min-heap of size k (O(n log k)), QuickSelect (O(n) average), and bucket sort (O(n) for frequency problems). The heap approach is the most versatile and commonly expected in interviews.

**Why This Matters:**
"Top K" is one of the most common interview question patterns. It appears as Top K Frequent Elements, K Closest Points, Kth Largest in a Stream, and many variants. The heap-based approach demonstrates understanding of priority queues, and choosing the right approach (heap vs QuickSelect vs bucket sort) shows algorithmic maturity.

**Key Insight:** To find the top k largest elements, use a min-heap of size k. Each new element is compared with the heap's minimum: if larger, it replaces the minimum. After processing all elements, the heap contains exactly the k largest. This is counterintuitive - you use a min-heap to find maximums - because you are maintaining a heap of "the best k so far" and the min-heap lets you efficiently evict the worst of the best.`,

    whenToUse: [
      'Finding the k largest or k smallest elements in a collection',
      'Finding the k most frequent elements',
      'Maintaining a running "top k" as elements stream in',
      'K closest points to a reference point',
      'Any problem asking for a partial ordering of the top or bottom k elements',
      'When full sorting is overkill and you only need the top k'
    ],

    keyPatterns: [
      'Min-heap of size k for top-k largest (evict minimum when heap is full)',
      'Max-heap of size k for top-k smallest (evict maximum when heap is full)',
      'Frequency count + heap: count frequencies first, then find top-k by frequency',
      'Bucket sort for frequency: O(n) alternative when frequencies are bounded by n',
      'QuickSelect for k-th element: O(n) average, modifies array in-place'
    ],

    timeComplexity: 'O(n log k) with heap, O(n) average with QuickSelect or bucket sort',
    spaceComplexity: 'O(k) for heap approach, O(n) for bucket sort',

    approach: [
      'Determine the ranking criterion: value, frequency, distance, or custom comparator',
      'For heap approach: initialize a min-heap (for top-k largest) and process each element, maintaining size k',
      'For frequency-based problems: first count frequencies with a hash map, then apply the heap to (frequency, element) pairs',
      'For bucket sort approach: create buckets indexed by frequency, iterate from highest frequency bucket',
      'For streaming problems (Kth Largest in a Stream): maintain a min-heap of size k; the top is always the k-th largest'
    ],

    commonProblems: [
      { name: 'Kth Largest Element in a Stream', difficulty: 'Easy' },
      { name: 'Top K Frequent Elements', difficulty: 'Medium' },
      { name: 'K Closest Points to Origin', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Using a max-heap of size n instead of a min-heap of size k, resulting in O(n log n) instead of O(n log k)',
      'Forgetting to count frequencies first before applying the heap for frequency-based problems',
      'Not handling ties correctly (e.g., when multiple elements have the same frequency)',
      'For K Closest Points, computing square root unnecessarily - squared distance is sufficient for comparison',
      'In streaming scenarios, not maintaining the heap size at exactly k'
    ],

    tips: [
      'Use a min-heap of size k for top-k largest: counterintuitive but correct and efficient',
      'For Top K Frequent Elements, bucket sort gives O(n) because max frequency is bounded by n',
      'In Python, use heapq.nlargest(k, ...) or heapq.nsmallest(k, ...) for concise code',
      'For K Closest Points, compare squared distances to avoid floating point issues',
      'The streaming variant (Kth Largest in a Stream) is a direct application of a size-k min-heap'
    ],

    interviewTips: [
      'Explain the counterintuitive choice: "I use a min-heap of size k to find the top-k largest because the min lets me efficiently remove the weakest candidate"',
      'Compare approaches: heap O(n log k) vs QuickSelect O(n) vs full sort O(n log n)',
      'For frequency problems, mention both the heap approach and the bucket sort O(n) optimization',
      'Be ready to discuss space-time trade-offs between the different approaches',
      'For streaming problems, explain that the heap naturally maintains the answer as new elements arrive'
    ],
  },

  // ─── 15. K-Way Merge ────────────────────────────────────────────
  {
    id: 'k-way-merge',
    title: 'K-Way Merge',
    icon: 'gitMerge',
    color: '#06b6d4',
    questions: 4,
    description: 'Merge k sorted lists or find k-th smallest across sorted collections using a min-heap.',

    introduction: `K-Way Merge is the technique for efficiently merging k sorted sequences or finding elements by rank across multiple sorted sources. The core idea is to use a min-heap that always contains the smallest unprocessed element from each of the k sources. By repeatedly extracting the minimum and replacing it with the next element from the same source, you merge all sources in O(n log k) time.

**Why This Matters:**
Merge K Sorted Lists is a frequently asked interview question and the pattern extends to problems like finding the k-th smallest element in a matrix, finding k pairs with smallest sums, and finding the smallest range that covers elements from all lists. The min-heap approach is elegant and generalizes the two-way merge from merge sort to k-way.

**Key Insight:** The min-heap acts as a "tournament" among the k sources. At any moment, the heap contains at most k elements (one frontier element from each source), and extracting the minimum takes O(log k). Since you process n total elements, the overall time is O(n log k), which is much better than repeatedly scanning all k lists.`,

    whenToUse: [
      'Merging k sorted linked lists or arrays into one sorted sequence',
      'Finding the k-th smallest element across multiple sorted sequences (e.g., sorted matrix)',
      'Finding k pairs with smallest sums from two sorted arrays',
      'Finding the smallest range that covers at least one element from each sorted list',
      'Any problem that generalizes two-way merge to k sources',
      'External merge sort when data is split across multiple sorted files'
    ],

    keyPatterns: [
      'Min-heap with (value, source_index, element_index) tuples',
      'Initialize heap with the first element from each of the k sources',
      'Extract min, output it, push the next element from the same source',
      'For k-th smallest: extract k times instead of merging everything',
      'For smallest range: track the current maximum alongside the heap minimum'
    ],

    timeComplexity: 'O(n log k) where n is total elements and k is number of sources',
    spaceComplexity: 'O(k) for the heap',

    approach: [
      'Initialize a min-heap with the first element from each of the k sorted sources, along with source and position metadata',
      'While the heap is not empty: extract the minimum element',
      'If the extracted element has a successor in its source, push the successor into the heap',
      'For merge: output extracted elements in order. For k-th smallest: count extractions and stop at k',
      'For smallest range: maintain a variable tracking the current maximum; the range is [heap_min, current_max]'
    ],

    commonProblems: [
      { name: 'Find K Pairs with Smallest Sums', difficulty: 'Medium' },
      { name: 'Kth Smallest Element in a Sorted Matrix', difficulty: 'Medium' },
      { name: 'Merge k Sorted Lists', difficulty: 'Hard' },
      { name: 'Smallest Range Covering Elements from K Lists', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Not tracking which source an element came from, making it impossible to fetch the next element',
      'Pushing duplicate elements into the heap when advancing pointers incorrectly',
      'For K Pairs with Smallest Sums, exploring too many pairs (need to prune the search space)',
      'Forgetting to handle empty sources (some of the k lists may be empty)',
      'For sorted matrix, not recognizing that rows and columns are independently sorted (two different approaches)'
    ],

    tips: [
      'In Python, use heapq with tuples: (value, list_index, element_index) for automatic comparison',
      'For linked lists, store (node.val, unique_id, node) to avoid comparison issues between nodes',
      'K-th smallest in a sorted matrix can also be solved with binary search on value range',
      'For Smallest Range, think of it as a sliding window on the merged sequence where each list contributes at least one element',
      'The heap size stays at most k, so each operation is O(log k), not O(log n)'
    ],

    interviewTips: [
      'Explain the heap as a "tournament": it always holds the best candidate from each source',
      'State the complexity clearly: O(n log k) time, O(k) space, where n is total elements',
      'For Merge K Sorted Lists, compare with the naive approach of merging pairs: O(nk) vs O(n log k)',
      'Mention that this pattern generalizes the merge step of merge sort from 2 to k sources',
      'For matrix problems, discuss both the heap approach and the binary search alternative'
    ],
  },

  // ─── 16. Data Structure Design ──────────────────────────────────
  {
    id: 'data-structure-design',
    title: 'Data Structure Design',
    icon: 'puzzle',
    color: '#8b5cf6',
    questions: 8,
    description: 'Design custom data structures that combine standard primitives to meet specific operational constraints.',

    introduction: `Data Structure Design problems ask you to build a custom class that supports a specific set of operations, each with a required time complexity. These problems test your ability to combine standard data structures (hash maps, linked lists, heaps, stacks, arrays) creatively to meet all constraints simultaneously.

**Why This Matters:**
These problems are favorites at top tech companies because they test both your data structure knowledge and your design skills. Problems like LRU Cache, Insert Delete GetRandom O(1), and Time Based Key-Value Store are among the most frequently asked interview questions. They require you to identify which combination of data structures satisfies all the operation constraints.

**Key Insight:** The secret is to identify the bottleneck operation and choose the data structure that makes it efficient, then add auxiliary structures to support the remaining operations. For example, LRU Cache needs O(1) access (hash map) and O(1) eviction of the least recently used (doubly linked list) - neither alone suffices, but together they do.`,

    whenToUse: [
      'When a problem asks you to design a class with multiple operations at specific time complexities',
      'LRU/LFU cache design requiring O(1) get, put, and eviction',
      'Random access with O(1) insert and delete (requires hash map + array swap trick)',
      'Time-based or versioned data retrieval (hash map + binary search)',
      'Stack-based designs with additional operations like getMax or getMin in O(1)',
      'When no single standard data structure satisfies all required operation complexities'
    ],

    keyPatterns: [
      'Hash map + doubly linked list: O(1) access + O(1) ordered eviction (LRU Cache)',
      'Hash map + array with swap-to-end deletion: O(1) insert, delete, and random access',
      'Hash map + sorted list/binary search: time-based or versioned lookups',
      'Stack of stacks or frequency-bucketed stacks (Maximum Frequency Stack)',
      'Snapshot with copy-on-write or binary search on versioned arrays',
      'Doubly linked list for browser history (back/forward navigation)'
    ],

    timeComplexity: 'Varies by design; goal is O(1) for primary operations',
    spaceComplexity: 'O(n) typically',

    approach: [
      'List all required operations and their target time complexities',
      'For each operation, identify which data structure natively supports that complexity',
      'Find the combination of data structures where each covers the others weakness',
      'Design the internal state: what data is stored, what maps to what, what maintains ordering',
      'Implement carefully, handling edge cases like empty state, duplicate keys, capacity limits'
    ],

    commonProblems: [
      { name: 'Design Browser History', difficulty: 'Medium' },
      { name: 'Time Based Key-Value Store', difficulty: 'Medium' },
      { name: 'Snapshot Array', difficulty: 'Medium' },
      { name: 'Design Twitter', difficulty: 'Medium' },
      { name: 'LRU Cache', difficulty: 'Medium' },
      { name: 'Insert Delete GetRandom O(1)', difficulty: 'Medium' },
      { name: 'Design a Food Rating System', difficulty: 'Medium' },
      { name: 'Maximum Frequency Stack', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Designing with a single data structure that cannot meet all operation requirements',
      'Forgetting to update all auxiliary structures when modifying data (e.g., updating both hash map and linked list in LRU)',
      'Not handling edge cases: empty cache, duplicate insertions, accessing non-existent keys',
      'Using OrderedDict and thinking the problem is trivially solved without understanding the underlying mechanism',
      'Incorrect random selection: using hash map iteration instead of array indexing for true O(1) random'
    ],

    tips: [
      'Start by listing operations and target complexities in a table before designing',
      'LRU Cache = HashMap<key, DoublyLinkedListNode> + DoublyLinkedList for recency order',
      'Insert Delete GetRandom O(1) = HashMap<val, index> + Array with swap-to-end delete trick',
      'Time Based Key-Value Store = HashMap<key, list of (timestamp, value)> + binary search on timestamps',
      'Maximum Frequency Stack = HashMap<val, freq> + HashMap<freq, stack> + maxFreq counter'
    ],

    interviewTips: [
      'Begin by asking clarifying questions: capacity limits? thread safety? duplicate handling?',
      'Draw the data structure relationships on a whiteboard before coding',
      'Explain why you need each component: "The hash map gives O(1) lookup, the linked list gives O(1) eviction order"',
      'Walk through a sequence of operations to demonstrate correctness',
      'Discuss alternative designs and trade-offs if time permits'
    ],
  },

  // ─── 17. Union Find ─────────────────────────────────────────────
  {
    id: 'union-find',
    title: 'Union Find',
    icon: 'share',
    color: '#06b6d4',
    questions: 5,
    description: 'Track connected components and merge sets efficiently with near-constant time union and find operations.',

    introduction: `Union Find (also called Disjoint Set Union or DSU) is a data structure that tracks a collection of disjoint sets and supports two operations: find (which set does an element belong to?) and union (merge two sets). With path compression and union by rank optimizations, both operations run in nearly O(1) amortized time - specifically O(alpha(n)) where alpha is the inverse Ackermann function.

**Why This Matters:**
Union Find is the go-to data structure for connectivity problems: determining if two nodes are connected, counting connected components, and detecting cycles in undirected graphs. It is simpler and more efficient than BFS/DFS for problems that only require connectivity information (not paths). It also appears in minimum spanning tree algorithms (Kruskal's) and network analysis.

**Key Insight:** Each set is represented as a tree rooted at a "representative" element. Find follows parent pointers to the root (with path compression flattening the tree along the way). Union links one root to the other (with rank-based merging to keep trees balanced). These two optimizations together make the amortized cost nearly constant.`,

    whenToUse: [
      'Determining if two elements are in the same connected component',
      'Counting the number of connected components in a graph',
      'Detecting cycles in an undirected graph (if union returns that both endpoints are already connected)',
      'Kruskal\'s minimum spanning tree algorithm (sort edges, union if endpoints are in different sets)',
      'Merging groups of accounts, regions, or equivalence classes',
      'Any problem where you process edges/relationships incrementally and need connectivity queries'
    ],

    keyPatterns: [
      'Path compression in find: point each visited node directly to the root',
      'Union by rank: attach the shorter tree under the taller tree to keep depth logarithmic',
      'Connected components count: start with n components, decrement by 1 on each successful union',
      'Weighted Union Find: track sizes or weights of components for problems like minimize malware spread',
      'Cycle detection: if find(u) == find(v) before union(u, v), adding edge (u, v) creates a cycle'
    ],

    timeComplexity: 'O(alpha(n)) per operation amortized, effectively O(1)',
    spaceComplexity: 'O(n)',

    approach: [
      'Initialize parent[i] = i and rank[i] = 0 for all elements',
      'Find: recursively (or iteratively) follow parent pointers to the root; apply path compression by setting parent of each visited node to the root',
      'Union: find the roots of both elements; if different, link the smaller-rank root to the larger-rank root; if equal rank, choose either and increment rank',
      'Track the number of components by starting at n and decrementing on each successful union',
      'For weighted problems, also maintain a size array and update it during union'
    ],

    commonProblems: [
      { name: 'Number of Provinces', difficulty: 'Medium' },
      { name: 'Redundant Connection', difficulty: 'Medium' },
      { name: 'Accounts Merge', difficulty: 'Medium' },
      { name: 'Minimize Malware Spread', difficulty: 'Hard' },
      { name: 'Min Cost to Connect All Points', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Forgetting path compression, leading to O(n) find operations in the worst case',
      'Not using union by rank, resulting in tall degenerate trees',
      'Initializing parent[i] = 0 for all elements instead of parent[i] = i',
      'For Accounts Merge, not mapping emails to a canonical owner before merging',
      'Counting components incorrectly: not decrementing on union or double-counting'
    ],

    tips: [
      'Always implement both path compression and union by rank for optimal performance',
      'Union Find is often simpler than BFS/DFS for pure connectivity problems',
      'For Kruskal\'s MST: sort edges by weight, iterate through edges, union endpoints if not already connected',
      'For Accounts Merge: use an email-to-id mapping, union all emails belonging to the same account, then group by root',
      'Union Find does not support efficient "disconnect" operations - if you need splits, consider other approaches'
    ],

    interviewTips: [
      'Implement Union Find as a class with find and union methods - it is clean and reusable',
      'Explain path compression: "Each find flattens the tree, so future finds are nearly O(1)"',
      'Mention the inverse Ackermann function: "With both optimizations, amortized cost is O(alpha(n)), practically constant"',
      'Compare with BFS/DFS: "Union Find is better for dynamic connectivity queries; BFS/DFS is better when you need paths"',
      'For graph problems, clearly state: "I will use Union Find because I only need connectivity, not shortest paths"'
    ],
  },

  // ─── 18. Topological Sort ───────────────────────────────────────
  {
    id: 'topological-sort',
    title: 'Topological Sort',
    icon: 'arrowRight',
    color: '#06b6d4',
    questions: 4,
    description: 'Order nodes in a directed acyclic graph so that every edge goes from earlier to later in the ordering.',

    introduction: `Topological Sort produces a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge (u, v), vertex u appears before vertex v. The two main algorithms are Kahn's Algorithm (BFS with in-degree tracking) and DFS-based ordering (post-order reversal).

**Why This Matters:**
Topological sort is essential for dependency resolution: course prerequisites, build systems, task scheduling, and compilation order. Interview problems often disguise dependency graphs as topological sort problems. Detecting whether a valid ordering exists is equivalent to checking if the graph is a DAG (no cycles).

**Key Insight:** Kahn's algorithm works by repeatedly removing nodes with no incoming edges (in-degree 0). If all nodes are eventually removed, the graph is a DAG and the removal order is a valid topological sort. If some nodes remain (their in-degree never reaches 0), the graph has a cycle and no valid ordering exists.`,

    whenToUse: [
      'Course scheduling with prerequisites (Course Schedule, Course Schedule II)',
      'Task dependency resolution: determining a valid execution order',
      'Build systems: compiling files in dependency order',
      'Detecting cycles in directed graphs (if topological sort fails, there is a cycle)',
      'Finding safe states in directed graphs (nodes that cannot reach a cycle)',
      'Any problem involving ordering items that have pairwise "must come before" constraints'
    ],

    keyPatterns: [
      'Kahn\'s algorithm (BFS): compute in-degrees, start with in-degree 0 nodes, process level by level',
      'DFS-based: run DFS, add to result in post-order, reverse the result',
      'Cycle detection: if Kahn\'s processes fewer than n nodes, or DFS encounters a node in the current path',
      'All topological orderings: backtracking over all valid choices at each step',
      'Minimum height trees: peel leaf nodes layer by layer (reverse topological sort)',
      'Group-respecting topological sort: topological sort within groups and between groups'
    ],

    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E) for adjacency list and in-degree array',

    approach: [
      'Build the adjacency list and compute in-degrees for all nodes',
      'Initialize a queue with all nodes having in-degree 0',
      'While the queue is not empty: dequeue a node, add it to the result, decrement in-degrees of all its neighbors',
      'If a neighbor\'s in-degree becomes 0, enqueue it',
      'After processing, if the result contains all nodes, it is a valid topological sort; otherwise, the graph has a cycle'
    ],

    commonProblems: [
      { name: 'Course Schedule II', difficulty: 'Medium' },
      { name: 'Find Eventual Safe States', difficulty: 'Medium' },
      { name: 'Minimum Height Trees', difficulty: 'Medium' },
      { name: 'Sort Items by Groups Respecting Dependencies', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Forgetting to check for cycles: if the result has fewer than n nodes, the graph has a cycle',
      'Using BFS without tracking in-degrees, which does not produce a valid topological order',
      'Confusing topological sort with general graph traversal (it only applies to directed graphs)',
      'Not building the graph correctly from the problem description (reversing edge directions)',
      'For DFS-based approach, adding nodes in pre-order instead of post-order'
    ],

    tips: [
      'Kahn\'s algorithm (BFS) is generally easier to implement and understand in interviews',
      'Cycle detection comes for free: if processed count < total nodes, there is a cycle',
      'For Minimum Height Trees, think of it as reverse topological sort: remove leaves layer by layer until 1-2 nodes remain',
      'For Find Eventual Safe States, nodes that are not part of any cycle are safe',
      'When the problem involves groups of tasks, you may need two levels of topological sort'
    ],

    interviewTips: [
      'State the algorithm choice: "I will use Kahn\'s algorithm with BFS because it naturally detects cycles"',
      'Explain the in-degree invariant: "A node with in-degree 0 has all prerequisites satisfied"',
      'Walk through a small example showing how in-degrees decrease and nodes enter the queue',
      'Mention that topological sort is only defined for DAGs; if a cycle exists, no valid ordering is possible',
      'For Course Schedule, frame it as: "Each course is a node, each prerequisite is a directed edge"'
    ],
  },

  // ─── 19. Shortest Path Algorithms ───────────────────────────────
  {
    id: 'shortest-path',
    title: 'Shortest Path Algorithms',
    icon: 'navigation',
    color: '#06b6d4',
    questions: 5,
    description: 'Find optimal paths in weighted graphs using Dijkstra, Bellman-Ford, and modified BFS techniques.',

    introduction: `Shortest path algorithms find the path with minimum total weight between nodes in a weighted graph. The three primary algorithms are: Dijkstra's (non-negative weights, O((V+E) log V) with a priority queue), Bellman-Ford (handles negative weights, O(VE)), and BFS (unweighted graphs, O(V+E)). Modified Dijkstra's is the most commonly tested in interviews.

**Why This Matters:**
Shortest path problems appear frequently in interviews, often disguised as network routing, minimum cost travel, or optimization on grids. The key skill is recognizing which algorithm to apply based on the edge weight characteristics (non-negative, possibly negative, unit weights) and constraints (limited stops, time-varying costs).

**Key Insight:** Dijkstra's algorithm works because it greedily processes the closest unvisited node. Once a node is finalized (dequeued from the priority queue), its shortest distance is guaranteed. This greedy property fails with negative edges (where a longer path through a negative edge might be shorter), which is when you need Bellman-Ford. For grid problems with varying "effort" costs, modified Dijkstra on the grid is the standard approach.`,

    whenToUse: [
      'Finding shortest/cheapest path in a graph with non-negative edge weights (Dijkstra)',
      'Finding shortest path with at most k intermediate stops (modified Bellman-Ford or BFS with pruning)',
      'Grid problems with varying movement costs (modified Dijkstra on grid)',
      'Finding paths that maximize probability or minimize maximum edge (modified Dijkstra with different relaxation)',
      'Problems with negative edge weights (Bellman-Ford)',
      'Unweighted shortest path (BFS)'
    ],

    keyPatterns: [
      'Dijkstra with priority queue: process nearest unvisited node, relax neighbors',
      'Bellman-Ford: relax all edges V-1 times, detect negative cycles on V-th pass',
      'Modified BFS/Dijkstra for grid problems: treat grid cells as graph nodes',
      'State-space expansion: Dijkstra with extra dimensions (node, stops_remaining, time)',
      'Binary search + BFS/DFS: binary search on the answer and verify with graph traversal',
      '0-1 BFS with deque: when edges have weight 0 or 1, use deque instead of priority queue'
    ],

    timeComplexity: 'Dijkstra: O((V+E) log V), Bellman-Ford: O(VE), BFS: O(V+E)',
    spaceComplexity: 'O(V + E) for adjacency list and distance array',

    approach: [
      'Identify the type of edge weights: non-negative (Dijkstra), possibly negative (Bellman-Ford), unit (BFS)',
      'Build the adjacency list with edge weights',
      'For Dijkstra: use a min-heap priority queue, initialize all distances to infinity except source, process nodes greedily',
      'For each dequeued node, relax all neighbors: if dist[u] + weight(u,v) < dist[v], update and enqueue',
      'For problems with constraints (k stops, maximum effort), expand the state space: (distance, node, constraint_state)'
    ],

    commonProblems: [
      { name: 'Network Delay Time', difficulty: 'Medium' },
      { name: 'Cheapest Flights Within K Stops', difficulty: 'Medium' },
      { name: 'Path with Maximum Probability', difficulty: 'Medium' },
      { name: 'Path With Minimum Effort', difficulty: 'Medium' },
      { name: 'Swim in Rising Water', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Using Dijkstra with negative edge weights (it produces incorrect results)',
      'Not using a visited set or distance check, leading to processing the same node multiple times unnecessarily',
      'Forgetting that Python\'s heapq is a min-heap: negate values for max-heap behavior',
      'For "maximum probability" or "minimum maximum edge" problems, not adapting the relaxation condition',
      'For k-stops problems, not expanding the state to include the number of stops used'
    ],

    tips: [
      'Dijkstra in Python: use heapq with (distance, node) tuples; skip nodes already finalized',
      'For "cheapest with k stops," use Bellman-Ford with k+1 relaxation rounds or BFS with state (node, stops)',
      'For "maximum probability," use Dijkstra with max-heap (negate log-probabilities or just use max comparison)',
      'For "minimum effort" grid problems, binary search on the effort + BFS verification is an alternative to Dijkstra',
      'Swim in Rising Water is Dijkstra where the "distance" is the maximum cell value on the path'
    ],

    interviewTips: [
      'Start by classifying the problem: "Edge weights are non-negative, so I will use Dijkstra\'s algorithm"',
      'Explain the greedy property: "Once a node is dequeued, its shortest distance is finalized"',
      'For problems with extra constraints, explain the state expansion: "I add the constraint to the state tuple"',
      'Mention Dijkstra\'s limitation: "It does not work with negative weights; I would use Bellman-Ford instead"',
      'Walk through a small example showing the priority queue evolution and distance updates'
    ],
  },

  // ─── 20. Knapsack DP ───────────────────────────────────────────
  {
    id: 'knapsack-dp',
    title: 'Knapsack DP',
    icon: 'grid',
    color: '#3b82f6',
    questions: 6,
    description: 'Solve optimization problems involving selecting items with constraints using 0/1 and unbounded knapsack patterns.',

    introduction: `The Knapsack pattern is one of the most important families of dynamic programming problems. In the classic formulation, you have items with weights and values, and a knapsack with limited capacity; the goal is to maximize value without exceeding the weight limit. The 0/1 variant means each item can be used at most once; the unbounded variant allows unlimited copies.

**Why This Matters:**
Knapsack DP appears in many disguises: partition problems (can you split an array into two equal-sum subsets?), coin change problems (minimum coins to make a target sum), target sum problems (how many ways to assign +/- signs to reach a target), and subset selection under constraints. Recognizing the knapsack structure is key to formulating the correct DP recurrence.

**Key Insight:** The 0/1 knapsack recurrence is dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i]). The first term represents not taking item i; the second represents taking it. For the unbounded knapsack (Coin Change), the recurrence uses dp[i][w-weight[i]] instead of dp[i-1][w-weight[i]] because the same item can be reused. Space optimization reduces 2D DP to 1D by iterating capacity in the right order.`,

    whenToUse: [
      'Selecting items subject to a capacity/weight/sum constraint to maximize or minimize a value',
      'Partition problems: can you split a set into subsets with equal or target sums?',
      'Counting the number of ways to reach a target sum using given denominations',
      'Finding the minimum number of items to reach a target (Coin Change)',
      'Target sum problems with +/- sign assignment',
      'Any problem where you make include/exclude decisions for each item with a running constraint'
    ],

    keyPatterns: [
      '0/1 Knapsack: each item used at most once; iterate capacity from high to low for 1D optimization',
      'Unbounded Knapsack: items can be reused; iterate capacity from low to high',
      'Subset Sum / Partition: knapsack with value = weight, capacity = sum/2',
      'Coin Change (minimum coins): unbounded knapsack minimizing count',
      'Coin Change II (count ways): unbounded knapsack counting combinations',
      'Target Sum: transform to subset sum by algebraic manipulation'
    ],

    timeComplexity: 'O(n * W) where n is items and W is capacity',
    spaceComplexity: 'O(W) with 1D space optimization',

    approach: [
      'Identify the items and the capacity (sum, weight limit, target value)',
      'Determine if items are reusable (unbounded) or not (0/1)',
      'Define dp[w] = optimal value achievable with capacity w',
      'For 0/1: iterate items in outer loop, capacity from W to weight[i] (right to left) in inner loop',
      'For unbounded: iterate items in outer loop, capacity from weight[i] to W (left to right) in inner loop'
    ],

    commonProblems: [
      { name: 'Partition Equal Subset Sum', difficulty: 'Medium' },
      { name: 'Target Sum', difficulty: 'Medium' },
      { name: 'Last Stone Weight II', difficulty: 'Medium' },
      { name: 'Coin Change', difficulty: 'Medium' },
      { name: 'Coin Change II', difficulty: 'Medium' },
      { name: 'Perfect Squares', difficulty: 'Medium' },
    ],

    commonMistakes: [
      'Iterating capacity in the wrong direction for 0/1 knapsack (must go right to left to avoid reusing items)',
      'Confusing 0/1 knapsack with unbounded knapsack and using the wrong iteration order',
      'For Target Sum, not recognizing the transformation: P - N = target, P + N = sum, so P = (sum + target) / 2',
      'Not handling the case where (sum + target) is odd or negative in Target Sum (no valid partition exists)',
      'Initializing dp[0] incorrectly: should be 0 for optimization problems, 1 for counting problems'
    ],

    tips: [
      'Master the 1D space optimization: for 0/1, iterate capacity right to left; for unbounded, left to right',
      'Partition Equal Subset Sum is 0/1 knapsack with target = sum/2; if sum is odd, return false immediately',
      'Coin Change II counts combinations (item loop outside) vs permutations (capacity loop outside)',
      'Last Stone Weight II reduces to: minimize |S1 - S2| = minimize |sum - 2*S2|, which is a subset sum problem',
      'For Perfect Squares, the "items" are 1, 4, 9, 16, ... and it is an unbounded knapsack'
    ],

    interviewTips: [
      'Frame the problem as knapsack: "Items are ..., capacity is ..., value is ..., and each item is used once/unlimited"',
      'Explain the recurrence clearly: "dp[w] = max/min of (not taking item i, taking item i)"',
      'Mention the 1D space optimization proactively and explain the iteration direction',
      'For Target Sum, walk through the algebraic transformation step by step',
      'Compare with greedy: "Greedy does not work here because choosing the locally best item may not give the global optimum"'
    ],
  },

  // ─── 21. String DP ──────────────────────────────────────────────
  {
    id: 'string-dp',
    title: 'String DP',
    icon: 'grid',
    color: '#3b82f6',
    questions: 7,
    description: 'Solve subsequence, edit distance, and string matching problems with 2D dynamic programming on character pairs.',

    introduction: `String DP problems involve two strings (or one string compared with itself) and use a 2D DP table where dp[i][j] represents the answer for the first i characters of string A and first j characters of string B. Classic problems include Longest Common Subsequence, Edit Distance, and Longest Palindromic Subsequence.

**Why This Matters:**
String DP is one of the most common DP subcategories in interviews. Problems like Edit Distance and Longest Common Subsequence are asked frequently and have clean, well-known recurrences. Understanding the 2D table structure and how transitions work between adjacent cells is essential for handling the many variants that appear.

**Key Insight:** Most string DP problems share a common structure: at each cell (i, j), you consider what happens when characters match vs when they do not. For LCS, a match extends the diagonal; a mismatch takes the better of (left, top). For Edit Distance, a match extends the diagonal for free; a mismatch takes the best of (insert, delete, replace) which correspond to (left+1, top+1, diagonal+1). Once you see this pattern, many string DP problems become variations of the same template.`,

    whenToUse: [
      'Finding the longest common subsequence between two strings',
      'Computing the minimum edit distance (insertions, deletions, substitutions) between two strings',
      'Finding the longest palindromic subsequence in a string',
      'Counting the number of distinct subsequences of one string in another',
      'String matching with wildcards or regular expressions',
      'Word break and string segmentation problems'
    ],

    keyPatterns: [
      'LCS pattern: dp[i][j] = dp[i-1][j-1] + 1 if match, else max(dp[i-1][j], dp[i][j-1])',
      'Edit Distance pattern: dp[i][j] = dp[i-1][j-1] if match, else 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])',
      'Palindromic subsequence: LCS of the string with its reverse, or dp on substring endpoints',
      'Distinct subsequences: dp[i][j] = dp[i-1][j-1] + dp[i-1][j] if match, else dp[i-1][j]',
      'Word Break: dp[i] = true if any dp[j] is true and s[j:i] is in the dictionary',
      'Wildcard matching: dp[i][j] considers character match, \'?\' match, and \'*\' matching zero or more characters'
    ],

    timeComplexity: 'O(m * n) for two strings of length m and n',
    spaceComplexity: 'O(m * n), reducible to O(min(m, n)) with rolling array',

    approach: [
      'Define dp[i][j] clearly: what subproblem does it represent? (Usually: answer for first i chars of A and first j chars of B)',
      'Determine the base cases: dp[0][j] and dp[i][0] (empty string cases)',
      'Write the recurrence: consider the case when A[i] == B[j] (match) and when they differ (mismatch)',
      'Fill the table row by row (or column by column), since each cell depends on the cell above, to the left, and diagonally above-left',
      'The final answer is typically dp[m][n] (bottom-right corner of the table)'
    ],

    commonProblems: [
      { name: 'Longest Common Subsequence', difficulty: 'Medium' },
      { name: 'Edit Distance', difficulty: 'Medium' },
      { name: 'Longest Palindromic Subsequence', difficulty: 'Medium' },
      { name: 'Decode Ways', difficulty: 'Medium' },
      { name: 'Word Break', difficulty: 'Medium' },
      { name: 'Wildcard Matching', difficulty: 'Hard' },
      { name: 'Distinct Subsequences', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Off-by-one indexing: dp is (m+1) x (n+1) with 0-indexed representing empty prefix, but strings are 0-indexed',
      'Incorrect base case initialization: Edit Distance dp[i][0] = i and dp[0][j] = j, not all zeros',
      'For palindromic subsequence, comparing the string with its reverse for LCS but not handling even/odd length',
      'In Word Break, checking substrings with wrong boundaries or not memoizing correctly',
      'For Wildcard Matching, not handling the \'*\' character correctly (it can match zero characters or extend)'
    ],

    tips: [
      'Draw the 2D table for a small example and fill it by hand to build intuition before coding',
      'Space optimization: since each row only depends on the current and previous row, use two 1D arrays',
      'Longest Palindromic Subsequence = LCS(s, reverse(s))',
      'Decode Ways is a 1D string DP: dp[i] depends on dp[i-1] and dp[i-2] based on valid one-digit and two-digit decodings',
      'For Word Break, using a set for the dictionary and iterating word lengths can be more efficient than checking all substrings'
    ],

    interviewTips: [
      'Define dp[i][j] explicitly before writing any code: "dp[i][j] is the min edit distance between A[0..i-1] and B[0..j-1]"',
      'Walk through the recurrence with a specific example cell to show understanding',
      'Mention space optimization proactively: "I can reduce space from O(mn) to O(min(m,n)) using a rolling array"',
      'For Edit Distance, name the three operations at each mismatch: insert (left), delete (top), replace (diagonal)',
      'If asked to reconstruct the actual LCS or edit sequence, explain backtracking through the DP table'
    ],
  },

  // ─── 22. Grid DP ────────────────────────────────────────────────
  {
    id: 'grid-dp',
    title: 'Grid DP',
    icon: 'grid',
    color: '#3b82f6',
    questions: 7,
    description: 'Solve path counting, minimum cost, and optimization problems on 2D grids using dynamic programming.',

    introduction: `Grid DP involves solving optimization or counting problems on a 2D grid where you move from one cell to adjacent cells (typically down and right). The DP state is usually dp[i][j] = the optimal value or count of paths to reach cell (i, j). This pattern naturally extends to problems with obstacles, varying costs, and more complex movement rules.

**Why This Matters:**
Grid DP problems are among the most common interview DP questions because they are visual and intuitive. Unique Paths, Minimum Path Sum, and Triangle are frequently asked and serve as excellent introductions to 2D DP. More advanced variants like Burst Balloons and Maximum Profit in Job Scheduling test deeper DP skills.

**Key Insight:** In a standard grid DP, cell (i, j) can only be reached from (i-1, j) or (i, j-1), giving the recurrence dp[i][j] = f(dp[i-1][j], dp[i][j-1]). The function f depends on the problem: addition for path counting, min for minimum cost, max for maximum value. The base case is typically the first row and first column, which can only be reached one way.`,

    whenToUse: [
      'Counting the number of paths from top-left to bottom-right of a grid',
      'Finding the minimum or maximum cost path through a grid',
      'Problems on triangular grids (Triangle problem)',
      'Grid problems with obstacles blocking certain cells',
      'Counting square submatrices with all ones',
      'Interval DP on grid-like structures (Burst Balloons)',
      'Any 2D optimization problem where movement is constrained to specific directions'
    ],

    keyPatterns: [
      'Path counting: dp[i][j] = dp[i-1][j] + dp[i][j-1], with obstacle cells set to 0',
      'Minimum path sum: dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])',
      'Triangle: dp[i][j] = triangle[i][j] + min(dp[i-1][j-1], dp[i-1][j])',
      'Count square submatrices: dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1 if cell is 1',
      'Interval DP: dp[i][j] = optimal value for the subproblem defined by interval [i, j]',
      'Longest increasing path: DFS with memoization on the grid (topological order by values)'
    ],

    timeComplexity: 'O(m * n) for grid of size m x n',
    spaceComplexity: 'O(m * n), reducible to O(n) with rolling array for standard cases',

    approach: [
      'Define dp[i][j]: what does it represent for cell (i, j)?',
      'Initialize the base cases: first row, first column, or boundary conditions',
      'Fill the table in order: typically top-to-bottom, left-to-right, so dependencies are satisfied',
      'Apply the recurrence at each cell, handling special cases (obstacles, boundaries)',
      'The answer is typically dp[m-1][n-1] or the aggregate over the last row/column'
    ],

    commonProblems: [
      { name: 'Unique Paths II', difficulty: 'Medium' },
      { name: 'Minimum Path Sum', difficulty: 'Medium' },
      { name: 'Triangle', difficulty: 'Medium' },
      { name: 'Count Square Submatrices with All Ones', difficulty: 'Medium' },
      { name: 'Burst Balloons', difficulty: 'Hard' },
      { name: 'Maximum Profit in Job Scheduling', difficulty: 'Hard' },
      { name: 'Longest Increasing Path in a Matrix', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Forgetting to handle obstacles: cells with obstacles should have dp value 0 (for counting) or infinity (for minimum)',
      'Incorrect boundary initialization: first row cells after an obstacle should also be 0 in path counting',
      'For Triangle, confusing top-down vs bottom-up direction (bottom-up is often cleaner)',
      'In Count Square Submatrices, not understanding why min(top, left, diagonal) + 1 works',
      'For Longest Increasing Path, not memoizing DFS results, leading to exponential time'
    ],

    tips: [
      'You can often modify the input grid in-place to use O(1) extra space (if allowed)',
      'For Triangle, bottom-up DP avoids boundary issues: dp[j] = triangle[i][j] + min(dp[j], dp[j+1])',
      'Count Square Submatrices: dp[i][j] counts the number of squares with (i,j) as the bottom-right corner',
      'Burst Balloons is interval DP: think of dp[i][j] as the max coins from bursting all balloons in range (i, j)',
      'Longest Increasing Path uses DFS + memoization because the natural ordering (by cell values) is the topological order'
    ],

    interviewTips: [
      'Start with the simplest variant (no obstacles, move right/down only) and add complexity as needed',
      'Draw the grid and fill in a few cells by hand to verify the recurrence',
      'Mention space optimization: "Since each row only depends on the previous row, I can use a 1D array"',
      'For interval DP (Burst Balloons), explain why you choose the last balloon to burst in a range rather than the first',
      'For Longest Increasing Path, explain why BFS/DFS with memoization works and what provides the topological ordering'
    ],
  },

  // ─── 23. Segment Tree & Advanced ────────────────────────────────
  {
    id: 'segment-tree',
    title: 'Segment Tree & Advanced',
    icon: 'puzzle',
    color: '#8b5cf6',
    questions: 4,
    description: 'Handle range queries with updates in O(log n) using segment trees, BITs, and advanced data structures.',

    introduction: `Segment Trees are tree-based data structures that enable efficient range queries (sum, min, max over a range) and point or range updates on an array, both in O(log n) time. Each node stores the aggregate for a segment of the array, and queries combine results from O(log n) segments. Binary Indexed Trees (Fenwick Trees) are a simpler alternative for prefix-sum-based range queries with point updates.

**Why This Matters:**
Segment trees appear in hard interview and competitive programming problems where you need to handle dynamic range queries - operations on a mutable array where both queries and updates happen frequently. Problems like Range Sum Query Mutable, Count of Smaller Numbers After Self, and The Skyline Problem require these advanced data structures. While they are less common in typical interviews, knowing them signals strong algorithmic depth.

**Key Insight:** A segment tree recursively divides the array into halves, forming a balanced binary tree of height O(log n). Each node stores the aggregate for its range. A range query decomposes into at most O(log n) disjoint segments. A point update propagates up O(log n) ancestors. Lazy propagation extends this to range updates in O(log n) by deferring updates to children.`,

    whenToUse: [
      'Range sum/min/max queries with point updates on a mutable array',
      'Range updates with range queries (lazy propagation)',
      'Counting elements in ranges (merge sort tree or wavelet tree for offline)',
      'Interval scheduling and overlap counting',
      'Problems involving dynamic order statistics or inversions',
      'Any problem requiring O(log n) both queries and updates on array ranges'
    ],

    keyPatterns: [
      'Build: recursively split array, each node stores aggregate of its range',
      'Point update: update leaf, propagate changes up to the root',
      'Range query: recursively combine results from segments covering the query range',
      'Lazy propagation: defer range updates to children until needed',
      'Binary Indexed Tree (BIT/Fenwick): simpler O(log n) prefix sum with point update',
      'Coordinate compression: map large value ranges to [0, n) before building the tree'
    ],

    timeComplexity: 'O(n) build, O(log n) per query and update',
    spaceComplexity: 'O(n) for the tree (typically 4n array)',

    approach: [
      'Build the segment tree: allocate an array of size 4n; recursively build by splitting ranges in half',
      'For queries: if the current node\'s range is fully within the query range, return its value; otherwise, recurse into children and combine',
      'For point updates: recurse to the leaf, update it, then propagate the change up by recomputing parent nodes',
      'For range updates with lazy propagation: store pending updates at each node and push them down to children when needed',
      'For problems requiring order statistics, combine segment tree with coordinate compression or merge sort tree'
    ],

    commonProblems: [
      { name: 'Range Sum Query - Mutable', difficulty: 'Medium' },
      { name: 'Count of Smaller Numbers After Self', difficulty: 'Hard' },
      { name: 'The Skyline Problem', difficulty: 'Hard' },
      { name: 'Minimum Interval to Include Each Query', difficulty: 'Hard' },
    ],

    commonMistakes: [
      'Allocating insufficient space for the tree array (need 4n, not 2n)',
      'Incorrect range splitting: mid = (left + right) / 2, left child covers [left, mid], right child covers [mid+1, right]',
      'Forgetting to push lazy propagation values down before querying children',
      'For Count of Smaller Numbers After Self, not using coordinate compression when values are large',
      'Confusing 1-indexed and 0-indexed implementations of BIT/Fenwick Tree'
    ],

    tips: [
      'BIT (Fenwick Tree) is simpler to implement and sufficient for prefix sum queries with point updates',
      'For Count of Smaller Numbers After Self, process the array from right to left and use a BIT indexed by value',
      'The Skyline Problem can be solved with a sweep line + max-heap or segment tree, but the heap approach is simpler',
      'Coordinate compression is essential when values are up to 10^9 but there are only n distinct values',
      'For most interviews, knowing when a segment tree is needed matters more than implementing one from scratch'
    ],

    interviewTips: [
      'Mention segment trees when the problem requires both range queries and updates - this shows you know the right tool',
      'If asked to implement, start with the simpler BIT/Fenwick Tree if it suffices',
      'Explain the time complexity: "Build is O(n), and each query or update is O(log n)"',
      'For hard problems, describe the high-level approach using segment tree as a black box before diving into implementation',
      'Compare with prefix sums: "Prefix sums give O(1) query but O(n) update; segment tree gives O(log n) for both"'
    ],
  },
];
