/**
 * Problem Data - Comprehensive problem definitions with descriptions and multi-language solutions
 * Following LeetCode/TechPrep style with problem details and solutions
 */

// Difficulty colors
export const DIFFICULTY_COLORS = {
  Easy: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  Medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Hard: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

// Generate slug from problem name
export function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// All problems with full details
export const PROBLEMS = {
  'two-sum': {
    id: 1,
    name: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    tags: ['Array', 'Hash Map'],
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    solutions: {
      python: {
        code: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Hash map to store value -> index
        seen = {}

        for i, num in enumerate(nums):
            complement = target - num

            # Check if complement exists in hash map
            if complement in seen:
                return [seen[complement], i]

            # Store current number with its index
            seen[num] = i

        return []  # No solution found`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Hash map to store value -> index
    const seen = new Map();

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];

        // Check if complement exists in hash map
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }

        // Store current number with its index
        seen.set(nums[i], i);
    }

    return []; // No solution found
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      java: {
        code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Hash map to store value -> index
        Map<Integer, Integer> seen = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];

            // Check if complement exists in hash map
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }

            // Store current number with its index
            seen.put(nums[i], i);
        }

        return new int[] {}; // No solution found
    }
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      cpp: {
        code: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Hash map to store value -> index
        unordered_map<int, int> seen;

        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];

            // Check if complement exists in hash map
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }

            // Store current number with its index
            seen[nums[i]] = i;
        }

        return {}; // No solution found
    }
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      go: {
        code: `func twoSum(nums []int, target int) []int {
    // Hash map to store value -> index
    seen := make(map[int]int)

    for i, num := range nums {
        complement := target - num

        // Check if complement exists in hash map
        if j, ok := seen[complement]; ok {
            return []int{j, i}
        }

        // Store current number with its index
        seen[num] = i
    }

    return []int{} // No solution found
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    },
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
      'Try to use the fact that the complement of the current number to make up the target can be looked up in O(1) time.',
      'Use a hash map to store numbers you\'ve seen with their indices.',
    ],
    approach: `**Optimal Approach: Hash Map**

1. Create a hash map to store each number and its index as we iterate
2. For each number, calculate the complement (target - current number)
3. Check if the complement exists in the hash map
4. If found, return both indices; otherwise, store the current number

**Why this works:**
- We need O(1) lookup to find if a complement exists
- Hash map provides exactly that capability
- Single pass through the array is sufficient`,
  },

  'contains-duplicate': {
    id: 217,
    name: 'Contains Duplicate',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    tags: ['Array', 'Hash Set'],
    leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
    examples: [
      {
        input: 'nums = [1,2,3,1]',
        output: 'true',
        explanation: 'The element 1 appears twice.',
      },
      {
        input: 'nums = [1,2,3,4]',
        output: 'false',
        explanation: 'All elements are distinct.',
      },
      {
        input: 'nums = [1,1,1,3,3,4,3,2,4,2]',
        output: 'true',
        explanation: 'Multiple elements appear more than once.',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
    ],
    solutions: {
      python: {
        code: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        # Use a set to track seen numbers
        seen = set()

        for num in nums:
            if num in seen:
                return True
            seen.add(num)

        return False`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
    // Use a Set to track seen numbers
    const seen = new Set();

    for (const num of nums) {
        if (seen.has(num)) {
            return true;
        }
        seen.add(num);
    }

    return false;
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      java: {
        code: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Use a HashSet to track seen numbers
        Set<Integer> seen = new HashSet<>();

        for (int num : nums) {
            if (seen.contains(num)) {
                return true;
            }
            seen.add(num);
        }

        return false;
    }
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      cpp: {
        code: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        // Use an unordered_set to track seen numbers
        unordered_set<int> seen;

        for (int num : nums) {
            if (seen.count(num)) {
                return true;
            }
            seen.insert(num);
        }

        return false;
    }
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      go: {
        code: `func containsDuplicate(nums []int) bool {
    // Use a map as a set to track seen numbers
    seen := make(map[int]bool)

    for _, num := range nums {
        if seen[num] {
            return true
        }
        seen[num] = true
    }

    return false
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    },
    hints: [
      'Think about what data structure allows O(1) lookup for existence checks.',
      'A Set automatically handles duplicates.',
    ],
    approach: `**Optimal Approach: Hash Set**

1. Create a hash set to track numbers we've seen
2. Iterate through the array
3. For each number, check if it's already in the set
4. If found, return true; otherwise, add to set
5. If we complete the loop, return false`,
  },

  'valid-anagram': {
    id: 242,
    name: 'Valid Anagram',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    tags: ['Hash Map', 'String', 'Sorting'],
    leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: 'true',
        explanation: 'Both strings contain the same characters with same frequencies.',
      },
      {
        input: 's = "rat", t = "car"',
        output: 'false',
        explanation: 'The strings have different characters.',
      },
    ],
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.',
    ],
    solutions: {
      python: {
        code: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        # Quick length check
        if len(s) != len(t):
            return False

        # Count character frequencies
        count = {}

        for c in s:
            count[c] = count.get(c, 0) + 1

        for c in t:
            if c not in count:
                return False
            count[c] -= 1
            if count[c] < 0:
                return False

        return True`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1) - only 26 lowercase letters',
      },
      javascript: {
        code: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {
    // Quick length check
    if (s.length !== t.length) {
        return false;
    }

    // Count character frequencies
    const count = {};

    for (const c of s) {
        count[c] = (count[c] || 0) + 1;
    }

    for (const c of t) {
        if (!count[c]) {
            return false;
        }
        count[c]--;
    }

    return true;
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      java: {
        code: `class Solution {
    public boolean isAnagram(String s, String t) {
        // Quick length check
        if (s.length() != t.length()) {
            return false;
        }

        // Count character frequencies using array
        int[] count = new int[26];

        for (char c : s.toCharArray()) {
            count[c - 'a']++;
        }

        for (char c : t.toCharArray()) {
            count[c - 'a']--;
            if (count[c - 'a'] < 0) {
                return false;
            }
        }

        return true;
    }
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      cpp: {
        code: `class Solution {
public:
    bool isAnagram(string s, string t) {
        // Quick length check
        if (s.length() != t.length()) {
            return false;
        }

        // Count character frequencies using array
        int count[26] = {0};

        for (char c : s) {
            count[c - 'a']++;
        }

        for (char c : t) {
            count[c - 'a']--;
            if (count[c - 'a'] < 0) {
                return false;
            }
        }

        return true;
    }
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      go: {
        code: `func isAnagram(s string, t string) bool {
    // Quick length check
    if len(s) != len(t) {
        return false
    }

    // Count character frequencies
    count := make(map[rune]int)

    for _, c := range s {
        count[c]++
    }

    for _, c := range t {
        count[c]--
        if count[c] < 0 {
            return false
        }
    }

    return true
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    },
    hints: [
      'What if the strings have different lengths?',
      'Count the frequency of each character in both strings.',
    ],
    approach: `**Optimal Approach: Character Counting**

1. If lengths differ, return false immediately
2. Count frequency of each character in first string
3. Decrement counts while iterating second string
4. If any count goes negative or character not found, return false`,
  },

  'group-anagrams': {
    id: 49,
    name: 'Group Anagrams',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    tags: ['Array', 'Hash Map', 'String', 'Sorting'],
    leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/',
    description: `Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in **any order**.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
        explanation: 'Words with same letters are grouped together.',
      },
      {
        input: 'strs = [""]',
        output: '[[""]]',
        explanation: 'Empty string forms its own group.',
      },
      {
        input: 'strs = ["a"]',
        output: '[["a"]]',
        explanation: 'Single character forms its own group.',
      },
    ],
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters.',
    ],
    solutions: {
      python: {
        code: `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        # Map sorted string -> list of anagrams
        anagram_map = defaultdict(list)

        for s in strs:
            # Sort characters to create key
            key = ''.join(sorted(s))
            anagram_map[key].append(s)

        return list(anagram_map.values())`,
        timeComplexity: 'O(n * k log k) where k is max string length',
        spaceComplexity: 'O(n * k)',
      },
      javascript: {
        code: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function(strs) {
    // Map sorted string -> list of anagrams
    const anagramMap = new Map();

    for (const s of strs) {
        // Sort characters to create key
        const key = s.split('').sort().join('');

        if (!anagramMap.has(key)) {
            anagramMap.set(key, []);
        }
        anagramMap.get(key).push(s);
    }

    return Array.from(anagramMap.values());
};`,
        timeComplexity: 'O(n * k log k)',
        spaceComplexity: 'O(n * k)',
      },
      java: {
        code: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Map sorted string -> list of anagrams
        Map<String, List<String>> anagramMap = new HashMap<>();

        for (String s : strs) {
            // Sort characters to create key
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);

            anagramMap.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        return new ArrayList<>(anagramMap.values());
    }
}`,
        timeComplexity: 'O(n * k log k)',
        spaceComplexity: 'O(n * k)',
      },
      cpp: {
        code: `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        // Map sorted string -> list of anagrams
        unordered_map<string, vector<string>> anagramMap;

        for (const string& s : strs) {
            // Sort characters to create key
            string key = s;
            sort(key.begin(), key.end());
            anagramMap[key].push_back(s);
        }

        vector<vector<string>> result;
        for (auto& [key, group] : anagramMap) {
            result.push_back(group);
        }

        return result;
    }
};`,
        timeComplexity: 'O(n * k log k)',
        spaceComplexity: 'O(n * k)',
      },
      go: {
        code: `func groupAnagrams(strs []string) [][]string {
    // Map sorted string -> list of anagrams
    anagramMap := make(map[string][]string)

    for _, s := range strs {
        // Sort characters to create key
        chars := []byte(s)
        sort.Slice(chars, func(i, j int) bool {
            return chars[i] < chars[j]
        })
        key := string(chars)

        anagramMap[key] = append(anagramMap[key], s)
    }

    result := make([][]string, 0, len(anagramMap))
    for _, group := range anagramMap {
        result = append(result, group)
    }

    return result
}`,
        timeComplexity: 'O(n * k log k)',
        spaceComplexity: 'O(n * k)',
      },
    },
    hints: [
      'Anagrams have the same characters, just in different order.',
      'Sorting the characters of an anagram gives the same result.',
      'Use sorted string as a key to group anagrams together.',
    ],
    approach: `**Optimal Approach: Sorted String as Key**

1. Create a hash map where key is the sorted version of string
2. For each string, sort its characters to get the key
3. Add the original string to the list for that key
4. Return all the lists from the hash map`,
  },

  'binary-search': {
    id: 704,
    name: 'Binary Search',
    difficulty: 'Easy',
    category: 'Binary Search',
    tags: ['Array', 'Binary Search'],
    leetcodeUrl: 'https://leetcode.com/problems/binary-search/',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      {
        input: 'nums = [-1,0,3,5,9,12], target = 9',
        output: '4',
        explanation: '9 exists in nums and its index is 4.',
      },
      {
        input: 'nums = [-1,0,3,5,9,12], target = 2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.',
    ],
    solutions: {
      python: {
        code: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = left + (right - left) // 2

            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1

        return -1`,
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);

        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
};`,
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
      },
      java: {
        code: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return -1;
    }
}`,
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
      },
      cpp: {
        code: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0;
        int right = nums.size() - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return -1;
    }
};`,
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
      },
      go: {
        code: `func search(nums []int, target int) int {
    left, right := 0, len(nums)-1

    for left <= right {
        mid := left + (right-left)/2

        if nums[mid] == target {
            return mid
        } else if nums[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }

    return -1
}`,
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
      },
    },
    hints: [
      'The array is sorted, so you can eliminate half of the search space each iteration.',
      'Use left + (right - left) / 2 to avoid integer overflow.',
    ],
    approach: `**Standard Binary Search**

1. Initialize left and right pointers to the start and end of array
2. While left <= right:
   - Calculate mid point
   - If mid element equals target, return mid
   - If mid element < target, search right half
   - Otherwise, search left half
3. Return -1 if not found`,
  },

  'reverse-linked-list': {
    id: 206,
    name: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    tags: ['Linked List', 'Recursion'],
    leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
        explanation: 'The list is reversed.',
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]',
        explanation: 'The list is reversed.',
      },
      {
        input: 'head = []',
        output: '[]',
        explanation: 'Empty list stays empty.',
      },
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    solutions: {
      python: {
        code: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head

        while curr:
            # Save next node
            next_node = curr.next
            # Reverse the link
            curr.next = prev
            # Move pointers forward
            prev = curr
            curr = next_node

        return prev`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      javascript: {
        code: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    let prev = null;
    let curr = head;

    while (curr !== null) {
        // Save next node
        const nextNode = curr.next;
        // Reverse the link
        curr.next = prev;
        // Move pointers forward
        prev = curr;
        curr = nextNode;
    }

    return prev;
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      java: {
        code: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;

        while (curr != null) {
            // Save next node
            ListNode nextNode = curr.next;
            // Reverse the link
            curr.next = prev;
            // Move pointers forward
            prev = curr;
            curr = nextNode;
        }

        return prev;
    }
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      cpp: {
        code: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;

        while (curr != nullptr) {
            // Save next node
            ListNode* nextNode = curr->next;
            // Reverse the link
            curr->next = prev;
            // Move pointers forward
            prev = curr;
            curr = nextNode;
        }

        return prev;
    }
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      go: {
        code: `/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func reverseList(head *ListNode) *ListNode {
    var prev *ListNode = nil
    curr := head

    for curr != nil {
        // Save next node
        nextNode := curr.Next
        // Reverse the link
        curr.Next = prev
        // Move pointers forward
        prev = curr
        curr = nextNode
    }

    return prev
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    },
    hints: [
      'You need to change the next pointer of each node to point to its previous node.',
      'Keep track of three pointers: prev, curr, and next.',
    ],
    approach: `**Iterative Approach**

1. Initialize prev as null and curr as head
2. While curr is not null:
   - Save curr.next before modifying it
   - Reverse the link: curr.next = prev
   - Move prev and curr forward
3. Return prev (new head)`,
  },

  'maximum-subarray': {
    id: 53,
    name: 'Maximum Subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.',
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
        explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    solutions: {
      python: {
        code: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Kadane's Algorithm
        max_sum = nums[0]
        current_sum = nums[0]

        for i in range(1, len(nums)):
            # Either extend current subarray or start new one
            current_sum = max(nums[i], current_sum + nums[i])
            max_sum = max(max_sum, current_sum)

        return max_sum`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    // Kadane's Algorithm
    let maxSum = nums[0];
    let currentSum = nums[0];

    for (let i = 1; i < nums.length; i++) {
        // Either extend current subarray or start new one
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }

    return maxSum;
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      java: {
        code: `class Solution {
    public int maxSubArray(int[] nums) {
        // Kadane's Algorithm
        int maxSum = nums[0];
        int currentSum = nums[0];

        for (int i = 1; i < nums.length; i++) {
            // Either extend current subarray or start new one
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }

        return maxSum;
    }
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      cpp: {
        code: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Kadane's Algorithm
        int maxSum = nums[0];
        int currentSum = nums[0];

        for (int i = 1; i < nums.size(); i++) {
            // Either extend current subarray or start new one
            currentSum = max(nums[i], currentSum + nums[i]);
            maxSum = max(maxSum, currentSum);
        }

        return maxSum;
    }
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      go: {
        code: `func maxSubArray(nums []int) int {
    // Kadane's Algorithm
    maxSum := nums[0]
    currentSum := nums[0]

    for i := 1; i < len(nums); i++ {
        // Either extend current subarray or start new one
        if nums[i] > currentSum+nums[i] {
            currentSum = nums[i]
        } else {
            currentSum = currentSum + nums[i]
        }

        if currentSum > maxSum {
            maxSum = currentSum
        }
    }

    return maxSum
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    },
    hints: [
      'Think about when to start a new subarray vs extending the current one.',
      'If the current sum becomes negative, starting fresh might be better.',
      'This is a classic problem solved by Kadane\'s algorithm.',
    ],
    approach: `**Kadane's Algorithm**

1. Initialize maxSum and currentSum to first element
2. For each element starting from index 1:
   - Decide: extend current subarray OR start new one
   - currentSum = max(nums[i], currentSum + nums[i])
   - Update maxSum if currentSum is larger
3. Return maxSum

**Key Insight:** If adding current element makes sum smaller than element alone, start fresh.`,
  },

  'valid-parentheses': {
    id: 20,
    name: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    tags: ['String', 'Stack'],
    leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'Simple valid pair.',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'Multiple valid pairs.',
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Mismatched brackets.',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    solutions: {
      python: {
        code: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}

        for char in s:
            if char in mapping:
                # Closing bracket
                if not stack or stack[-1] != mapping[char]:
                    return False
                stack.pop()
            else:
                # Opening bracket
                stack.append(char)

        return len(stack) == 0`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      javascript: {
        code: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    const stack = [];
    const mapping = { ')': '(', '}': '{', ']': '[' };

    for (const char of s) {
        if (mapping[char]) {
            // Closing bracket
            if (stack.length === 0 || stack[stack.length - 1] !== mapping[char]) {
                return false;
            }
            stack.pop();
        } else {
            // Opening bracket
            stack.push(char);
        }
    }

    return stack.length === 0;
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      java: {
        code: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> mapping = new HashMap<>();
        mapping.put(')', '(');
        mapping.put('}', '{');
        mapping.put(']', '[');

        for (char c : s.toCharArray()) {
            if (mapping.containsKey(c)) {
                // Closing bracket
                if (stack.isEmpty() || stack.peek() != mapping.get(c)) {
                    return false;
                }
                stack.pop();
            } else {
                // Opening bracket
                stack.push(c);
            }
        }

        return stack.isEmpty();
    }
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      cpp: {
        code: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> mapping = {
            {')', '('}, {'}', '{'}, {']', '['}
        };

        for (char c : s) {
            if (mapping.count(c)) {
                // Closing bracket
                if (st.empty() || st.top() != mapping[c]) {
                    return false;
                }
                st.pop();
            } else {
                // Opening bracket
                st.push(c);
            }
        }

        return st.empty();
    }
};`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      go: {
        code: `func isValid(s string) bool {
    stack := []rune{}
    mapping := map[rune]rune{
        ')': '(',
        '}': '{',
        ']': '[',
    }

    for _, char := range s {
        if open, exists := mapping[char]; exists {
            // Closing bracket
            if len(stack) == 0 || stack[len(stack)-1] != open {
                return false
            }
            stack = stack[:len(stack)-1]
        } else {
            // Opening bracket
            stack = append(stack, char)
        }
    }

    return len(stack) == 0
}`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    },
    hints: [
      'Use a stack to keep track of opening brackets.',
      'When you see a closing bracket, check if it matches the most recent opening bracket.',
    ],
    approach: `**Stack Approach**

1. Create mapping of closing to opening brackets
2. For each character:
   - If closing bracket: check if stack top matches
   - If opening bracket: push to stack
3. Return true if stack is empty at the end`,
  },

  'merge-two-sorted-lists': {
    id: 21,
    name: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked List',
    tags: ['Linked List', 'Recursion'],
    leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    examples: [
      {
        input: 'list1 = [1,2,4], list2 = [1,3,4]',
        output: '[1,1,2,3,4,4]',
        explanation: 'Merged in sorted order.',
      },
      {
        input: 'list1 = [], list2 = []',
        output: '[]',
        explanation: 'Both lists are empty.',
      },
      {
        input: 'list1 = [], list2 = [0]',
        output: '[0]',
        explanation: 'One list is empty.',
      },
    ],
    constraints: [
      'The number of nodes in both lists is in the range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.',
    ],
    solutions: {
      python: {
        code: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        # Dummy node to simplify edge cases
        dummy = ListNode(0)
        current = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                current.next = list1
                list1 = list1.next
            else:
                current.next = list2
                list2 = list2.next
            current = current.next

        # Attach remaining nodes
        current.next = list1 if list1 else list2

        return dummy.next`,
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(1)',
      },
      javascript: {
        code: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    // Dummy node to simplify edge cases
    const dummy = new ListNode(0);
    let current = dummy;

    while (list1 !== null && list2 !== null) {
        if (list1.val <= list2.val) {
            current.next = list1;
            list1 = list1.next;
        } else {
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }

    // Attach remaining nodes
    current.next = list1 !== null ? list1 : list2;

    return dummy.next;
};`,
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(1)',
      },
      java: {
        code: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Dummy node to simplify edge cases
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;

        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                current.next = list1;
                list1 = list1.next;
            } else {
                current.next = list2;
                list2 = list2.next;
            }
            current = current.next;
        }

        // Attach remaining nodes
        current.next = list1 != null ? list1 : list2;

        return dummy.next;
    }
}`,
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(1)',
      },
      cpp: {
        code: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        // Dummy node to simplify edge cases
        ListNode dummy(0);
        ListNode* current = &dummy;

        while (list1 != nullptr && list2 != nullptr) {
            if (list1->val <= list2->val) {
                current->next = list1;
                list1 = list1->next;
            } else {
                current->next = list2;
                list2 = list2->next;
            }
            current = current->next;
        }

        // Attach remaining nodes
        current->next = list1 != nullptr ? list1 : list2;

        return dummy.next;
    }
};`,
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(1)',
      },
      go: {
        code: `/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
    // Dummy node to simplify edge cases
    dummy := &ListNode{}
    current := dummy

    for list1 != nil && list2 != nil {
        if list1.Val <= list2.Val {
            current.Next = list1
            list1 = list1.Next
        } else {
            current.Next = list2
            list2 = list2.Next
        }
        current = current.Next
    }

    // Attach remaining nodes
    if list1 != nil {
        current.Next = list1
    } else {
        current.Next = list2
    }

    return dummy.Next
}`,
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(1)',
      },
    },
    hints: [
      'Use a dummy head to simplify handling edge cases.',
      'Compare values and link the smaller one to the result.',
    ],
    approach: `**Two Pointer Merge**

1. Create a dummy node to simplify edge cases
2. While both lists have nodes:
   - Compare current values
   - Link smaller node to result
   - Advance that list pointer
3. Attach any remaining nodes
4. Return dummy.next`,
  },
};

// Get problem by slug
export function getProblemBySlug(slug) {
  return PROBLEMS[slug] || null;
}

// Get all problems as array
export function getAllProblems() {
  return Object.entries(PROBLEMS).map(([slug, problem]) => ({
    slug,
    ...problem,
  }));
}

// Get problems by category
export function getProblemsByCategory(category) {
  return getAllProblems().filter(p => p.category === category);
}

// Get problems by difficulty
export function getProblemsByDifficulty(difficulty) {
  return getAllProblems().filter(p => p.difficulty === difficulty);
}

// Search problems
export function searchProblems(query) {
  const lowerQuery = query.toLowerCase();
  return getAllProblems().filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export default PROBLEMS;
