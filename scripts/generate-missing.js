#!/usr/bin/env node
/**
 * Generate descriptions for missing coding problems from knowledge base
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'frontend', 'src', 'data', 'problems-full.json');

const PROBLEMS = {
  'pascal': {
    description: `Given an integer numRows, return the first numRows of Pascal's triangle.

In Pascal's triangle, each number is the sum of the two numbers directly above it.

Example 1:
Input: numRows = 5
Output: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]

Example 2:
Input: numRows = 1
Output: [[1]]

Constraints:
- 1 <= numRows <= 30`,
    difficulty: 'Easy', tags: ['Array', 'Dynamic Programming']
  },
  'two-sum-ii': {
    description: `Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.

Return the indices of the two numbers (1-indexed) as an integer array [index1, index2].

You may not use the same element twice. There is exactly one solution.

Example 1:
Input: numbers = [2,7,11,15], target = 9
Output: [1,2]
Explanation: 2 + 7 = 9, so index1 = 1, index2 = 2.

Example 2:
Input: numbers = [2,3,4], target = 6
Output: [1,3]

Constraints:
- 2 <= numbers.length <= 3 * 10^4
- -1000 <= numbers[i] <= 1000
- numbers is sorted in non-decreasing order
- Exactly one solution exists`,
    difficulty: 'Medium', tags: ['Array', 'Two Pointers', 'Binary Search']
  },
  'maximum-consecutive-ones-iii': {
    description: `Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k 0's.

Example 1:
Input: nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2
Output: 6
Explanation: Flip nums[5] and nums[10]. The longest subarray of 1's is [1,1,1,0,0,1,1,1,1,1,1] with length 6.

Example 2:
Input: nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3
Output: 10

Constraints:
- 1 <= nums.length <= 10^5
- nums[i] is either 0 or 1
- 0 <= k <= nums.length`,
    difficulty: 'Medium', tags: ['Array', 'Sliding Window']
  },
  'merge-accounts': {
    description: `Given a list of accounts where each element accounts[i] is a list of strings, where the first element accounts[i][0] is a name, and the rest of the elements are emails representing emails of the account.

Merge accounts that belong to the same person. Two accounts belong to the same person if there is some common email.

Return the accounts in any order after merging. Each account's emails must be sorted.

Example 1:
Input: accounts = [["John","john@mail.com","john_newyork@mail.com"],["John","john@mail.com","john00@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]
Output: [["John","john00@mail.com","john@mail.com","john_newyork@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]

Constraints:
- 1 <= accounts.length <= 1000
- 2 <= accounts[i].length <= 10
- 1 <= accounts[i][j].length <= 30`,
    difficulty: 'Medium', tags: ['Union Find', 'DFS', 'BFS']
  },
  'insert-delete-getrandom-o-1': {
    description: `Implement the RandomizedSet class:
- RandomizedSet() Initializes the RandomizedSet object.
- bool insert(int val) Inserts an item val into the set if not present. Returns true if the item was not present, false otherwise.
- bool remove(int val) Removes an item val from the set if present. Returns true if the item was present, false otherwise.
- int getRandom() Returns a random element from the current set of elements. Each element must have the same probability of being returned.

You must implement the functions of the class such that each function works in average O(1) time complexity.

Example 1:
Input: ["RandomizedSet","insert","remove","insert","getRandom","remove","insert","getRandom"]
       [[],[1],[2],[2],[],[1],[2],[]]
Output: [null,true,false,true,2,true,false,2]

Constraints:
- -2^31 <= val <= 2^31 - 1
- At most 2 * 10^5 calls will be made to insert, remove, and getRandom`,
    difficulty: 'Medium', tags: ['Array', 'Hash Table', 'Design']
  },
  'sqrt-x': {
    description: `Given a non-negative integer x, return the square root of x rounded down to the nearest integer. The returned integer should be non-negative as well.

You must not use any built-in exponent function or operator (e.g., pow(x, 0.5) or x ** 0.5).

Example 1:
Input: x = 4
Output: 2

Example 2:
Input: x = 8
Output: 2
Explanation: The square root of 8 is 2.82842..., and since we round it down to the nearest integer, 2 is returned.

Constraints:
- 0 <= x <= 2^31 - 1`,
    difficulty: 'Easy', tags: ['Math', 'Binary Search']
  },
  'find-first-and-last-position-of-element': {
    description: `Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value. If target is not found, return [-1, -1].

You must write an algorithm with O(log n) runtime complexity.

Example 1:
Input: nums = [5,7,7,8,8,10], target = 8
Output: [3,4]

Example 2:
Input: nums = [5,7,7,8,8,10], target = 6
Output: [-1,-1]

Constraints:
- 0 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9
- nums is a non-decreasing array`,
    difficulty: 'Medium', tags: ['Array', 'Binary Search']
  },
  'book-allocation-problem': {
    description: `Given an array arr[] of N integers where arr[i] represents the number of pages in the i-th book, and M students, allocate books such that:
- Each student gets at least one book
- Each book is allocated to only one student
- Allocation is in contiguous order (a student can only get consecutive books)

Find the minimum possible value of the maximum number of pages allocated to a student.

Example 1:
Input: arr = [12, 34, 67, 90], M = 2
Output: 113
Explanation: Allocation: [12, 34, 67] and [90]. Maximum = 113.

Example 2:
Input: arr = [10, 20, 30, 40], M = 2
Output: 60
Explanation: Allocation: [10, 20, 30] and [40]. Maximum = 60.

Constraints:
- 1 <= N <= 10^5
- 1 <= arr[i] <= 10^6
- 1 <= M <= N`,
    difficulty: 'Hard', tags: ['Binary Search', 'Greedy']
  },
  'painters-partition-problem': {
    description: `Given an array of board lengths and k painters, where each painter takes 1 unit of time to paint 1 unit of board length, find the minimum time to paint all boards.

Each painter can only paint contiguous sections of boards.

Example 1:
Input: boards = [10, 20, 30, 40], k = 2
Output: 60
Explanation: Painter 1 paints [10, 20, 30] (60 time), Painter 2 paints [40] (40 time). Minimum of max = 60.

Constraints:
- 1 <= k <= boards.length <= 10^5
- 1 <= boards[i] <= 10^6`,
    difficulty: 'Hard', tags: ['Binary Search', 'Greedy']
  },
  'minimize-max-distance-to-gas-station': {
    description: `You are given n gas stations along a road at positions stations[0], stations[1], ..., stations[n-1]. You need to add k more gas stations. Find the minimum possible value of the maximum distance between adjacent gas stations after adding k stations.

Example 1:
Input: stations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k = 9
Output: 0.5

Constraints:
- 2 <= stations.length <= 10^5
- 0 <= stations[i] <= 10^8
- stations is sorted in strictly increasing order
- 1 <= k <= 10^6`,
    difficulty: 'Hard', tags: ['Binary Search', 'Greedy']
  },
  'three-sum': {
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.

Example 1:
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]

Example 2:
Input: nums = [0,1,1]
Output: []

Constraints:
- 3 <= nums.length <= 3000
- -10^5 <= nums[i] <= 10^5`,
    difficulty: 'Medium', tags: ['Array', 'Two Pointers', 'Sorting']
  },
  'three-sum-closest': {
    description: `Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target. Return the sum of the three integers.

You may assume that each input would have exactly one solution.

Example 1:
Input: nums = [-1,2,1,-4], target = 1
Output: 2
Explanation: The sum that is closest to the target is 2. (-1 + 2 + 1 = 2).

Constraints:
- 3 <= nums.length <= 500
- -1000 <= nums[i] <= 1000
- -10^4 <= target <= 10^4`,
    difficulty: 'Medium', tags: ['Array', 'Two Pointers', 'Sorting']
  },
  'four-sum': {
    description: `Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that a, b, c, d are distinct indices and nums[a] + nums[b] + nums[c] + nums[d] == target.

Example 1:
Input: nums = [1,0,-1,0,-2,2], target = 0
Output: [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]

Constraints:
- 1 <= nums.length <= 200
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9`,
    difficulty: 'Medium', tags: ['Array', 'Two Pointers', 'Sorting']
  },
  'sort-colors-dutch-national-flag': {
    description: `Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red (0), white (1), and blue (2).

You must solve this problem without using the library's sort function. Can you solve it in one pass using constant extra space?

Example 1:
Input: nums = [2,0,2,1,1,0]
Output: [0,0,1,1,2,2]

Example 2:
Input: nums = [2,0,1]
Output: [0,1,2]

Constraints:
- n == nums.length
- 1 <= n <= 300
- nums[i] is either 0, 1, or 2`,
    difficulty: 'Medium', tags: ['Array', 'Two Pointers', 'Sorting']
  },
  'pair-with-target-sum': {
    description: `Given a sorted array of integers and a target sum, find a pair in the array whose sum is equal to the given target. Return the indices of the two numbers.

Example 1:
Input: arr = [1, 2, 3, 4, 6], target = 6
Output: [1, 3]
Explanation: arr[1] + arr[3] = 2 + 4 = 6

Example 2:
Input: arr = [2, 5, 9, 11], target = 11
Output: [0, 2]

Constraints:
- Array is sorted in ascending order
- Exactly one solution exists`,
    difficulty: 'Easy', tags: ['Array', 'Two Pointers']
  },
  'triplet-sum-to-zero': {
    description: `Given an array of unsorted numbers, find all unique triplets in it that add up to zero.

Example 1:
Input: [-3, 0, 1, 2, -1, 1, -2]
Output: [[-3, 1, 2], [-2, 0, 2], [-2, 1, 1], [-1, 0, 1]]

Example 2:
Input: [-5, 2, -1, -2, 3]
Output: [[-5, 2, 3], [-2, -1, 3]]

Constraints:
- 3 <= arr.length <= 3000`,
    difficulty: 'Medium', tags: ['Array', 'Two Pointers']
  },
  'triplet-sum-close-to-target': {
    description: `Given an array of unsorted numbers and a target number, find a triplet in the array whose sum is as close to the target number as possible. Return the sum of the triplet.

Example 1:
Input: [-2, 0, 1, 2], target = 2
Output: 1
Explanation: The triplet [-2, 1, 2] has the closest sum to the target.

Example 2:
Input: [-3, -1, 1, 2], target = 1
Output: 0
Explanation: The triplet [-3, 1, 2] has the closest sum.

Constraints:
- 3 <= arr.length <= 500`,
    difficulty: 'Medium', tags: ['Array', 'Two Pointers']
  },
  'triplets-with-smaller-sum': {
    description: `Given an array arr of unsorted numbers and a target sum, count all triplets in it such that arr[i] + arr[j] + arr[k] < target where i, j, and k are three different indices.

Example 1:
Input: [-1, 0, 2, 3], target = 3
Output: 2
Explanation: [-1, 0, 3] and [-1, 0, 2] have sum less than 3.

Example 2:
Input: [-1, 4, 2, 1, 3], target = 5
Output: 4

Constraints:
- 3 <= arr.length <= 1000`,
    difficulty: 'Medium', tags: ['Array', 'Two Pointers']
  },
  'subarrays-with-product-less-than-k': {
    description: `Given an array of positive integers nums and an integer k, return the number of contiguous subarrays where the product of all the elements in the subarray is strictly less than k.

Example 1:
Input: nums = [10, 5, 2, 6], k = 100
Output: 8
Explanation: The 8 subarrays with product less than 100 are: [10], [5], [2], [6], [10,5], [5,2], [2,6], [5,2,6].

Example 2:
Input: nums = [1, 2, 3], k = 0
Output: 0

Constraints:
- 1 <= nums.length <= 3 * 10^4
- 1 <= nums[i] <= 1000
- 0 <= k <= 10^6`,
    difficulty: 'Medium', tags: ['Array', 'Sliding Window']
  },
  'comparing-strings-containing-backspaces': {
    description: `Given two strings s and t, return true if they are equal when both are typed into empty text editors. '#' means a backspace character.

Example 1:
Input: s = "ab#c", t = "ad#c"
Output: true
Explanation: Both s and t become "ac".

Example 2:
Input: s = "ab##", t = "c#d#"
Output: true
Explanation: Both s and t become "".

Example 3:
Input: s = "a#c", t = "b"
Output: false

Constraints:
- 1 <= s.length, t.length <= 200
- s and t only contain lowercase letters and '#' characters`,
    difficulty: 'Easy', tags: ['Two Pointers', 'String', 'Stack']
  },
  'minimum-window-sort': {
    description: `Given an array, find the length of the smallest subarray in it which when sorted will sort the whole array.

Example 1:
Input: [1, 2, 5, 3, 7, 10, 9, 12]
Output: 5
Explanation: Sorting the subarray [5, 3, 7, 10, 9] makes the whole array sorted.

Example 2:
Input: [1, 3, 2, 0, -1, 7, 10]
Output: 5
Explanation: Sorting [1, 3, 2, 0, -1] makes the whole array sorted.

Constraints:
- 1 <= arr.length <= 10^4`,
    difficulty: 'Medium', tags: ['Array', 'Two Pointers', 'Sorting']
  },
  'maximum-points-from-cards': {
    description: `Given an array of integers cardPoints and an integer k, you can take exactly k cards from the beginning or end of the row. Your score is the sum of the points of the cards you have taken. Return the maximum score you can obtain.

Example 1:
Input: cardPoints = [1,2,3,4,5,6,1], k = 3
Output: 12
Explanation: Take the three cards on the right, getting 5 + 6 + 1 = 12.

Example 2:
Input: cardPoints = [9,7,7,9,7,7,9], k = 7
Output: 55

Constraints:
- 1 <= cardPoints.length <= 10^5
- 1 <= cardPoints[i] <= 10^4
- 1 <= k <= cardPoints.length`,
    difficulty: 'Medium', tags: ['Array', 'Sliding Window']
  },
  'maximum-number-of-vowels-in-a-substring': {
    description: `Given a string s and an integer k, return the maximum number of vowel letters in any substring of s with length k.

Vowel letters are 'a', 'e', 'i', 'o', and 'u'.

Example 1:
Input: s = "abciiidef", k = 3
Output: 3
Explanation: The substring "iii" contains 3 vowel letters.

Example 2:
Input: s = "aeiou", k = 2
Output: 2

Constraints:
- 1 <= s.length <= 10^5
- s consists of lowercase English letters
- 1 <= k <= s.length`,
    difficulty: 'Medium', tags: ['String', 'Sliding Window']
  },
  'longest-substring-with-at-most-k-distinct-characters': {
    description: `Given a string s and an integer k, return the length of the longest substring that contains at most k distinct characters.

Example 1:
Input: s = "araaci", k = 2
Output: 4
Explanation: The longest substring with at most 2 distinct characters is "araa".

Example 2:
Input: s = "araaci", k = 1
Output: 2
Explanation: The longest substring with at most 1 distinct character is "aa".

Constraints:
- 1 <= s.length <= 5 * 10^4
- 0 <= k <= 50`,
    difficulty: 'Medium', tags: ['String', 'Sliding Window', 'Hash Table']
  },
  'longest-substring-with-at-most-two-distinct-characters': {
    description: `Given a string s, return the length of the longest substring that contains at most two distinct characters.

Example 1:
Input: s = "eceba"
Output: 3
Explanation: The substring "ece" has 2 distinct characters and length 3.

Example 2:
Input: s = "ccaabbb"
Output: 5
Explanation: The substring "aabbb" has 2 distinct characters and length 5.

Constraints:
- 1 <= s.length <= 10^5
- s consists of English letters`,
    difficulty: 'Medium', tags: ['String', 'Sliding Window', 'Hash Table']
  },
  'minimum-window-subsequence': {
    description: `Given strings s1 and s2, return the minimum contiguous substring of s1 such that s2 is a subsequence of the part. If there is no such window, return "".

Example 1:
Input: s1 = "abcdebdde", s2 = "bde"
Output: "bcde"
Explanation: "bcde" is the shortest substring of s1 where "bde" is a subsequence.

Constraints:
- 1 <= s1.length <= 2 * 10^4
- 1 <= s2.length <= 100
- s1 and s2 consist of lowercase English letters`,
    difficulty: 'Hard', tags: ['String', 'Dynamic Programming', 'Sliding Window']
  },
  'reverse-polish-notation': {
    description: `Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, and /. Each operand may be an integer or another expression.

Division between two integers should truncate toward zero.

Example 1:
Input: tokens = ["2","1","+","3","*"]
Output: 9
Explanation: ((2 + 1) * 3) = 9

Example 2:
Input: tokens = ["4","13","5","/","+"]
Output: 6
Explanation: (4 + (13 / 5)) = 6

Constraints:
- 1 <= tokens.length <= 10^4
- tokens[i] is an operator or an integer in range [-200, 200]`,
    difficulty: 'Medium', tags: ['Array', 'Stack', 'Math']
  },
  'all-o': {
    description: `Design a data structure that supports all following operations in average O(1) time:
- insert(val): Inserts an item val to the collection
- remove(val): Removes an item val from the collection if present
- getRandom: Returns a random element from the current collection. Each element should have equal probability.

Example 1:
Input: ["RandomizedCollection","insert","insert","insert","getRandom","remove","getRandom"]
       [[],[1],[1],[2],[],[1],[]]
Output: [null,true,false,true,2,true,1]

Constraints:
- -2^31 <= val <= 2^31 - 1
- At most 2 * 10^5 total calls`,
    difficulty: 'Hard', tags: ['Array', 'Hash Table', 'Design']
  },
  'lowest-common-ancestor-of-a-bst': {
    description: `Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST. The lowest common ancestor is defined as the lowest node in T that has both p and q as descendants (a node can be a descendant of itself).

Example 1:
Input: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
Output: 6
Explanation: The LCA of nodes 2 and 8 is 6.

Example 2:
Input: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4
Output: 2

Constraints:
- All Node.val are unique
- p != q
- p and q will exist in the BST`,
    difficulty: 'Medium', tags: ['Tree', 'BST', 'DFS']
  },
  'construct-binary-tree-from-preorder-and-inorder': {
    description: `Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.

Example 1:
Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
Output: [3,9,20,null,null,15,7]

Example 2:
Input: preorder = [-1], inorder = [-1]
Output: [-1]

Constraints:
- 1 <= preorder.length <= 3000
- inorder.length == preorder.length
- preorder and inorder consist of unique values`,
    difficulty: 'Medium', tags: ['Array', 'Tree', 'Divide and Conquer']
  },
  'construct-binary-tree-from-inorder-and-postorder': {
    description: `Given two integer arrays inorder and postorder where inorder is the inorder traversal of a binary tree and postorder is the postorder traversal of the same tree, construct and return the binary tree.

Example 1:
Input: inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]
Output: [3,9,20,null,null,15,7]

Constraints:
- 1 <= inorder.length <= 3000
- postorder.length == inorder.length
- Values are unique`,
    difficulty: 'Medium', tags: ['Array', 'Tree', 'Divide and Conquer']
  },
  'construct-binary-search-tree-from-preorder': {
    description: `Given an array of integers preorder, which represents the preorder traversal of a BST, construct the tree and return its root.

Example 1:
Input: preorder = [8,5,1,7,10,12]
Output: [8,5,10,1,7,null,12]

Constraints:
- 1 <= preorder.length <= 100
- 1 <= preorder[i] <= 10^8
- All values are unique`,
    difficulty: 'Medium', tags: ['Array', 'Tree', 'BST']
  },
  'count-nodes-equal-to-sum-of-descendants': {
    description: `Given the root of a binary tree, return the number of nodes where the value of the node is equal to the sum of the values of its descendants. A node's descendants include all nodes in the subtree rooted at that node, excluding the node itself.

Example 1:
Input: root = [10,3,4,2,1]
Output: 2
Explanation: Node 10 (3+4+2+1=10) and Node 3 (2+1=3) satisfy the condition.

Constraints:
- Number of nodes in range [1, 10^5]
- 0 <= Node.val <= 10^5`,
    difficulty: 'Medium', tags: ['Tree', 'DFS']
  },
  'walls-and-gates': {
    description: `You are given an m x n grid rooms initialized with these three possible values:
- -1: A wall or an obstacle
- 0: A gate
- INF (2147483647): An empty room

Fill each empty room with the distance to its nearest gate. If it is impossible to reach a gate, leave INF.

Example 1:
Input: rooms = [[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]]
Output: [[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]

Constraints:
- m == rooms.length
- n == rooms[i].length
- 1 <= m, n <= 250`,
    difficulty: 'Medium', tags: ['Array', 'BFS', 'Matrix']
  },
  'parallel-courses': {
    description: `You are given an integer n and an array relations where relations[i] = [prevCoursei, nextCoursei], meaning course prevCoursei must be taken before course nextCoursei. Courses are numbered 1 to n.

Return the minimum number of semesters needed to take all courses. If it is impossible, return -1.

Example 1:
Input: n = 3, relations = [[1,3],[2,3]]
Output: 2
Explanation: In semester 1, take courses 1 and 2. In semester 2, take course 3.

Constraints:
- 1 <= n <= 5000
- 1 <= relations.length <= 5000`,
    difficulty: 'Medium', tags: ['Graph', 'Topological Sort', 'BFS']
  },
  'sequence-reconstruction': {
    description: `Given an original sequence org and a list of sequences, determine whether org is the only sequence that can be reconstructed from sequences. Reconstruction means building a shortest common supersequence of the sequences.

Example 1:
Input: org = [1,2,3], sequences = [[1,2],[1,3]]
Output: false
Explanation: [1,3,2] is also a valid sequence.

Example 2:
Input: org = [1,2,3], sequences = [[1,2],[1,3],[2,3]]
Output: true

Constraints:
- 1 <= org.length <= 10^4`,
    difficulty: 'Medium', tags: ['Graph', 'Topological Sort']
  },
  'number-of-connected-components': {
    description: `You have a graph of n nodes. You are given an integer n and an array edges where edges[i] = [ai, bi] indicates that there is an edge between ai and bi in the graph. Return the number of connected components in the graph.

Example 1:
Input: n = 5, edges = [[0,1],[1,2],[3,4]]
Output: 2

Example 2:
Input: n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]
Output: 1

Constraints:
- 1 <= n <= 2000
- 0 <= edges.length <= 5000`,
    difficulty: 'Medium', tags: ['Graph', 'Union Find', 'DFS']
  },
  'find-the-city-with-the-smallest-number-of-neighbors': {
    description: `There are n cities numbered from 0 to n-1. Given edges where edges[i] = [fromi, toi, weighti] represents a bidirectional weighted edge, and an integer distanceThreshold.

Return the city with the smallest number of cities that are reachable through some path and whose distance is at most distanceThreshold. If there are multiple such cities, return the city with the greatest number.

Example 1:
Input: n = 4, edges = [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold = 4
Output: 3

Constraints:
- 2 <= n <= 100
- 1 <= edges.length <= n * (n - 1) / 2`,
    difficulty: 'Medium', tags: ['Graph', 'Shortest Path']
  },
  'reorder-routes-to-make-all-paths-lead-to-city-zero': {
    description: `There are n cities numbered from 0 to n - 1 and n - 1 roads such that there is only one way to travel between two different cities. Roads are represented as connections[i] = [ai, bi] (one-way from ai to bi).

Return the minimum number of edges to change direction so that each city can reach city 0.

Example 1:
Input: n = 6, connections = [[0,1],[1,3],[2,3],[4,0],[4,5]]
Output: 3

Constraints:
- 2 <= n <= 5 * 10^4
- connections.length == n - 1`,
    difficulty: 'Medium', tags: ['Graph', 'DFS', 'BFS']
  },
  'the-maze': {
    description: `There is a ball in a maze with empty spaces (0) and walls (1). The ball can go through empty spaces by rolling up, down, left or right, but it won't stop rolling until hitting a wall. Given the maze, the ball's start position and the destination, determine whether the ball can stop at the destination.

Example 1:
Input: maze = [[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]], start = [0,4], destination = [4,4]
Output: true

Constraints:
- m == maze.length
- n == maze[i].length
- 1 <= m, n <= 100`,
    difficulty: 'Medium', tags: ['Graph', 'BFS', 'DFS']
  },
  'the-maze-iii': {
    description: `There is a ball in a maze with empty spaces (0), walls (1), and a hole. The ball rolls until hitting a wall. When the ball passes through the hole, it falls in. Find the shortest path for the ball to reach the hole. If multiple paths have the same distance, return the lexicographically smallest instructions.

Return the instructions string ("u", "d", "l", "r"). If impossible, return "impossible".

Example 1:
Input: maze = [[0,0,0,0,0],[1,1,0,0,1],[0,0,0,0,0],[0,1,0,0,1],[0,1,0,0,0]], ball = [4,3], hole = [0,1]
Output: "lul"

Constraints:
- 1 <= m, n <= 100`,
    difficulty: 'Hard', tags: ['Graph', 'BFS', 'Shortest Path']
  },
  'tribonacci-number': {
    description: `The Tribonacci sequence Tn is defined as: T0 = 0, T1 = 1, T2 = 1, and Tn+3 = Tn + Tn+1 + Tn+2 for n >= 0.

Given n, return the value of Tn.

Example 1:
Input: n = 4
Output: 4
Explanation: T3 = 0 + 1 + 1 = 2, T4 = 1 + 1 + 2 = 4.

Example 2:
Input: n = 25
Output: 1389537

Constraints:
- 0 <= n <= 37
- The answer fits in a 32-bit integer`,
    difficulty: 'Easy', tags: ['Dynamic Programming', 'Math']
  },
  'coin-change-2': {
    description: `Given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money, return the number of combinations that make up that amount. If that amount cannot be made up, return 0.

You may assume that you have an infinite number of each kind of coin.

Example 1:
Input: amount = 5, coins = [1, 2, 5]
Output: 4
Explanation: Four ways: 5, 2+2+1, 2+1+1+1, 1+1+1+1+1.

Example 2:
Input: amount = 3, coins = [2]
Output: 0

Constraints:
- 1 <= coins.length <= 300
- 1 <= coins[i] <= 5000
- 0 <= amount <= 5000`,
    difficulty: 'Medium', tags: ['Array', 'Dynamic Programming']
  },
  'minimum-insertions-to-make-string-palindrome': {
    description: `Given a string s. In one step you can insert any character at any position of the string. Return the minimum number of steps to make s a palindrome.

Example 1:
Input: s = "zzazz"
Output: 0

Example 2:
Input: s = "mbadm"
Output: 2
Explanation: "mbdadbm" or "mdbabdm".

Example 3:
Input: s = "leetcode"
Output: 5

Constraints:
- 1 <= s.length <= 500
- s consists of lowercase English letters`,
    difficulty: 'Hard', tags: ['String', 'Dynamic Programming']
  },
  'paint-house': {
    description: `There is a row of n houses, where each house can be painted one of three colors: red, blue, or green. The cost of painting each house is given by a n x 3 cost matrix costs. No two adjacent houses can have the same color.

Return the minimum cost to paint all houses.

Example 1:
Input: costs = [[17,2,17],[16,16,5],[14,3,19]]
Output: 10
Explanation: Paint house 0 blue, house 1 green, house 2 blue. Cost = 2 + 5 + 3 = 10.

Constraints:
- costs.length == n
- costs[i].length == 3
- 1 <= n <= 100
- 1 <= costs[i][j] <= 20`,
    difficulty: 'Medium', tags: ['Array', 'Dynamic Programming']
  },
  'paint-house-ii': {
    description: `There are n houses and k colors. The cost of painting each house is given by an n x k cost matrix. No two adjacent houses have the same color.

Return the minimum cost to paint all houses.

Follow up: Can you solve it in O(nk) time?

Example 1:
Input: costs = [[1,5,3],[2,9,4]]
Output: 5
Explanation: Paint house 0 color 0, house 1 color 2. Cost = 1 + 4 = 5.

Constraints:
- costs.length == n
- costs[i].length == k
- 1 <= n <= 100
- 2 <= k <= 20`,
    difficulty: 'Hard', tags: ['Array', 'Dynamic Programming']
  },
  'paint-fence': {
    description: `You are painting a fence of n posts with k different colors. You must paint the posts such that no more than two adjacent posts have the same color.

Return the total number of ways you can paint the fence.

Example 1:
Input: n = 3, k = 2
Output: 6
Explanation: All valid combinations of colors for 3 posts with 2 colors.

Example 2:
Input: n = 1, k = 1
Output: 1

Constraints:
- 1 <= n <= 50
- 1 <= k <= 10^5`,
    difficulty: 'Medium', tags: ['Dynamic Programming']
  },
  'number-of-ways-to-rearrange-sticks': {
    description: `There are n uniquely-sized sticks (lengths 1 to n). You want to arrange them such that exactly k sticks are visible from the left. A stick is visible if there are no longer sticks to its left.

Return the number of such arrangements modulo 10^9 + 7.

Example 1:
Input: n = 3, k = 2
Output: 3
Explanation: [1,3,2], [2,3,1], [2,1,3] — exactly 2 sticks visible from left in each.

Constraints:
- 1 <= n <= 1000
- 1 <= k <= n`,
    difficulty: 'Hard', tags: ['Math', 'Dynamic Programming']
  },
  'minimum-cost-to-connect-sticks': {
    description: `You have some number of sticks with positive integer lengths given in an array sticks. You can connect any two sticks by paying a cost of x + y where x and y are the lengths of the two sticks. You perform this until there is one stick remaining.

Return the minimum cost of connecting all sticks.

Example 1:
Input: sticks = [2, 4, 3]
Output: 14
Explanation: Connect 2+3=5 (cost 5), then 5+4=9 (cost 9). Total = 14.

Example 2:
Input: sticks = [1, 8, 3, 5]
Output: 30

Constraints:
- 1 <= sticks.length <= 10^4
- 1 <= sticks[i] <= 10^4`,
    difficulty: 'Medium', tags: ['Array', 'Greedy', 'Heap']
  },
  'letter-combinations-of-phone-number': {
    description: `Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Mapping is the same as telephone buttons.

Example 1:
Input: digits = "23"
Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]

Example 2:
Input: digits = ""
Output: []

Constraints:
- 0 <= digits.length <= 4
- digits[i] is a digit in the range ['2', '9']`,
    difficulty: 'Medium', tags: ['String', 'Backtracking']
  },
  'robot-room-cleaner': {
    description: `You are given a robot cleaner in a room modeled as an m x n grid. The robot can move forward, turn left, turn right, or clean. Design an algorithm to clean the entire room using only the robot API.

The robot's API:
- move(): Returns true if the cell in front is open and the robot moves into it.
- turnLeft(): Robot turns 90 degrees left.
- turnRight(): Robot turns 90 degrees right.
- clean(): Cleans the current cell.

The robot starts at an unknown position facing up. All accessible cells are connected.

Constraints:
- m, n <= 100
- All cells are accessible`,
    difficulty: 'Hard', tags: ['Backtracking', 'DFS']
  },
  'word-squares': {
    description: `Given an array of unique strings words, return all the word squares you can build from words. A word square is a set of words written out in a square grid form such that reading the kth row and the kth column give the same string.

Example 1:
Input: words = ["area","lead","wall","lady","ball"]
Output: [["wall","area","lead","lady"],["ball","area","lead","lady"]]

Constraints:
- 1 <= words.length <= 1000
- 1 <= words[i].length <= 4
- All words[i] have the same length
- words[i] consists of only lowercase English letters`,
    difficulty: 'Hard', tags: ['Array', 'Backtracking', 'Trie']
  },
  'index-pairs-of-a-string': {
    description: `Given a string text and an array of strings words, return an array of all index pairs [i, j] so that the substring text[i...j] is in words. Return the pairs sorted by i, then by j.

Example 1:
Input: text = "thestoryofleetcodeandme", words = ["story","fleet","leetcode"]
Output: [[3,7],[9,13],[10,17]]

Constraints:
- 1 <= text.length <= 100
- 1 <= words.length <= 20`,
    difficulty: 'Easy', tags: ['Array', 'String', 'Trie']
  },
  'design-search-autocomplete-system': {
    description: `Design a search autocomplete system. Users may input a sentence (contains lowercase letters and '#'). For each character input, return the top 3 historical hot sentences that have the prefix the same as the part of the sentence already typed.

AutocompleteSystem(String[] sentences, int[] times): Initialize with historical data.
List<String> input(char c): Input a character and return top 3 suggestions. '#' means end of input.

Example 1:
Input: sentences = ["i love you","island","iroman","i love leetcode"], times = [5,3,2,2]
input('i') -> ["i love you","island","i love leetcode"]
input(' ') -> ["i love you","i love leetcode"]

Constraints:
- 1 <= sentences.length <= 100
- 1 <= sentences[i].length <= 100`,
    difficulty: 'Hard', tags: ['Design', 'Trie', 'String']
  },
  'subsets-using-bits': {
    description: `Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the subsets in any order.

Use bit manipulation approach: for an array of n elements, there are 2^n subsets. Each number from 0 to 2^n-1 represents a subset using its binary representation.

Example 1:
Input: nums = [1,2,3]
Output: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]

Example 2:
Input: nums = [0]
Output: [[],[0]]

Constraints:
- 1 <= nums.length <= 10
- -10 <= nums[i] <= 10
- All elements are unique`,
    difficulty: 'Medium', tags: ['Array', 'Bit Manipulation', 'Backtracking']
  },
  'pow-x-n': {
    description: `Implement pow(x, n), which calculates x raised to the power n (x^n).

Example 1:
Input: x = 2.00000, n = 10
Output: 1024.00000

Example 2:
Input: x = 2.10000, n = 3
Output: 9.26100

Example 3:
Input: x = 2.00000, n = -2
Output: 0.25000

Constraints:
- -100.0 < x < 100.0
- -2^31 <= n <= 2^31-1
- n is an integer
- x is not zero when n < 0`,
    difficulty: 'Medium', tags: ['Math', 'Recursion']
  },
  'add-two-numbers-linked-list': {
    description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order. Add the two numbers and return the sum as a linked list.

Example 1:
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.

Example 2:
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]

Constraints:
- Number of nodes in each list is in range [1, 100]
- 0 <= Node.val <= 9
- No leading zeros except number 0 itself`,
    difficulty: 'Medium', tags: ['Linked List', 'Math', 'Recursion']
  },
  'range-sum-query-2d-mutable': {
    description: `Given a 2D matrix, handle multiple queries: update the value of a cell and calculate the sum of elements inside a rectangle defined by its upper left corner (row1, col1) and lower right corner (row2, col2).

Implement the NumMatrix class:
- NumMatrix(int[][] matrix) Initializes the object
- void update(int row, int col, int val) Updates the value
- int sumRegion(int row1, int col1, int row2, int col2) Returns the sum

Example 1:
Input: matrix = [[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]
sumRegion(2,1,4,3) -> 8
update(3,2,2)
sumRegion(2,1,4,3) -> 10

Constraints:
- m == matrix.length, n == matrix[i].length
- 1 <= m, n <= 200`,
    difficulty: 'Hard', tags: ['Array', 'Binary Indexed Tree', 'Matrix']
  },
  'candy-crush': {
    description: `Given an m x n integer array board representing the grid of candy where board[i][j] represents the type of candy. Implement the candy crush game:

1. Find all groups of 3+ identical candies horizontally or vertically, mark them.
2. Remove all marked candies simultaneously.
3. Drop remaining candies due to gravity.
4. Repeat until no more candies can be crushed.

Return the final state of the board.

Constraints:
- m == board.length, n == board[i].length
- 3 <= m, n <= 50
- 1 <= board[i][j] <= 2000`,
    difficulty: 'Medium', tags: ['Array', 'Matrix', 'Simulation']
  },
  'shortest-distance-from-all-buildings': {
    description: `Given an m x n grid with values: 0 (empty land), 1 (building), 2 (obstacle). Find the empty land with the smallest sum of distances to all buildings. Return the smallest distance sum, or -1 if not possible.

Example 1:
Input: grid = [[1,0,2,0,1],[0,0,0,0,0],[0,0,1,0,0]]
Output: 7
Explanation: The point (1,2) has distance 3+3+1=7.

Constraints:
- m == grid.length, n == grid[i].length
- 1 <= m, n <= 50`,
    difficulty: 'Hard', tags: ['Array', 'BFS', 'Matrix']
  },
  'sort-list-merge-sort': {
    description: `Given the head of a linked list, return the list after sorting it in ascending order.

Can you sort it in O(n log n) time and O(1) memory (i.e., constant space)?

Example 1:
Input: head = [4,2,1,3]
Output: [1,2,3,4]

Example 2:
Input: head = [-1,5,3,4,0]
Output: [-1,0,3,4,5]

Constraints:
- Number of nodes in range [0, 5 * 10^4]
- -10^5 <= Node.val <= 10^5`,
    difficulty: 'Medium', tags: ['Linked List', 'Sorting', 'Merge Sort']
  },
  'lowest-common-ancestor-of-binary-tree': {
    description: `Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree. The LCA is defined as the lowest node that has both p and q as descendants (a node can be a descendant of itself).

Example 1:
Input: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
Output: 3

Example 2:
Input: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4
Output: 5

Constraints:
- Number of nodes in range [2, 10^5]
- All Node.val are unique
- p != q`,
    difficulty: 'Medium', tags: ['Tree', 'DFS']
  },
  'strobogrammatic-number-iii': {
    description: `A strobogrammatic number is a number that looks the same when rotated 180 degrees (0, 1, 6, 8, 9 and pairs 0-0, 1-1, 6-9, 8-8, 9-6).

Given two strings low and high that represent two integers, return the count of strobogrammatic numbers in the range [low, high].

Example 1:
Input: low = "50", high = "100"
Output: 3 (69, 88, 96)

Constraints:
- 1 <= low.length, high.length <= 15
- low and high consist of only digits
- low <= high`,
    difficulty: 'Hard', tags: ['Math', 'Recursion']
  },
  'range-addition': {
    description: `You are given an integer length and an array updates where updates[i] = [startIdxi, endIdxi, inci]. You have an array arr of length initialized to 0. For each update, increment arr[startIdx..endIdx] by inc.

Return the array after all updates. Use a difference array technique for O(n + k) time.

Example 1:
Input: length = 5, updates = [[1,3,2],[2,4,3],[0,2,-2]]
Output: [-2,0,3,5,3]

Constraints:
- 1 <= length <= 10^5
- 0 <= updates.length <= 10^4`,
    difficulty: 'Medium', tags: ['Array', 'Prefix Sum']
  },
  'missing-ranges': {
    description: `Given a sorted unique integer array nums and two integers lower and upper, return the smallest sorted list of ranges that cover every missing number in the inclusive range [lower, upper].

Example 1:
Input: nums = [0,1,3,50,75], lower = 0, upper = 99
Output: [[2,2],[4,49],[51,74],[76,99]]

Example 2:
Input: nums = [-1], lower = -1, upper = -1
Output: []

Constraints:
- -10^9 <= lower <= upper <= 10^9
- 0 <= nums.length <= 100`,
    difficulty: 'Easy', tags: ['Array']
  },
  'add-bold-tag-in-string': {
    description: `You are given a string s and an array of string words. Return s with bold tags around all substrings that are present in words. If two such substrings overlap, merge them into one pair of bold tags. A bold tag pair is <b> and </b>.

Example 1:
Input: s = "abcxyz123", words = ["abc","123"]
Output: "<b>abc</b>xyz<b>123</b>"

Example 2:
Input: s = "aaabbb", words = ["aa","b"]
Output: "<b>aaabbb</b>"

Constraints:
- 1 <= s.length <= 1000
- 0 <= words.length <= 100`,
    difficulty: 'Medium', tags: ['Array', 'String', 'Trie']
  },
  'employee-free-time': {
    description: `Given a list of schedules for each employee (list of non-overlapping intervals sorted by start time), return a list of finite intervals representing common free time for all employees.

Example 1:
Input: schedule = [[[1,2],[5,6]],[[1,3]],[[4,10]]]
Output: [[3,4]]
Explanation: All three employees are free during [3,4].

Example 2:
Input: schedule = [[[1,3],[6,7]],[[2,4]],[[2,5],[9,12]]]
Output: [[5,6],[7,9]]

Constraints:
- 1 <= schedule.length <= 50
- 1 <= schedule[i].length <= 50`,
    difficulty: 'Hard', tags: ['Array', 'Sorting', 'Heap']
  },
  'find-first-and-last-position': {
    description: `Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value. If target is not found, return [-1, -1]. You must write an algorithm with O(log n) runtime.

Example 1:
Input: nums = [5,7,7,8,8,10], target = 8
Output: [3,4]

Example 2:
Input: nums = [], target = 0
Output: [-1,-1]

Constraints:
- 0 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9`,
    difficulty: 'Medium', tags: ['Array', 'Binary Search']
  },
  'search-in-rotated-array': {
    description: `Given a rotated sorted array nums and a target value, return the index of target if it is in the array, or -1 if not. You must write an algorithm with O(log n) runtime.

The array was originally sorted in ascending order and then rotated at an unknown pivot.

Example 1:
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4

Example 2:
Input: nums = [4,5,6,7,0,1,2], target = 3
Output: -1

Constraints:
- 1 <= nums.length <= 5000
- -10^4 <= nums[i] <= 10^4
- All values are unique`,
    difficulty: 'Medium', tags: ['Array', 'Binary Search']
  },
  'find-minimum-in-rotated-array': {
    description: `Given a sorted rotated array of unique elements, return the minimum element. You must write an algorithm that runs in O(log n) time.

Example 1:
Input: nums = [3,4,5,1,2]
Output: 1

Example 2:
Input: nums = [4,5,6,7,0,1,2]
Output: 0

Example 3:
Input: nums = [11,13,15,17]
Output: 11

Constraints:
- n == nums.length
- 1 <= n <= 5000
- All integers are unique`,
    difficulty: 'Medium', tags: ['Array', 'Binary Search']
  },
  'capacity-to-ship-packages': {
    description: `A conveyor belt has packages that must be shipped from one port to another within days days. The i-th package has a weight of weights[i]. Packages must be shipped in order. Return the least weight capacity of the ship that will result in all packages being shipped within days days.

Example 1:
Input: weights = [1,2,3,4,5,6,7,8,9,10], days = 5
Output: 15
Explanation: Ship with capacity 15: [1,2,3,4,5], [6,7], [8], [9], [10].

Example 2:
Input: weights = [3,2,2,4,1,4], days = 3
Output: 6

Constraints:
- 1 <= days <= weights.length <= 5 * 10^4
- 1 <= weights[i] <= 500`,
    difficulty: 'Medium', tags: ['Array', 'Binary Search', 'Greedy']
  },
};

// Load existing data and merge
const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
let added = 0;

for (const [slug, data] of Object.entries(PROBLEMS)) {
  if (!existing[slug]) {
    existing[slug] = {
      slug,
      topic: (data.tags?.[0] || 'arrays').toLowerCase(),
      description: data.description,
      meta: data.description.substring(0, 200),
      testCases: [],
      paramTypes: {},
      solutions: {},
      boilerplate: {},
      difficulty: data.difficulty,
      tags: data.tags,
      source: 'generated',
    };
    added++;
    console.log(`Added: ${slug}`);
  }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existing, null, 2));
console.log(`\nAdded ${added} problems. Total: ${Object.keys(existing).length}`);
