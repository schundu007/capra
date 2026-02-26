# Coding Interview Assistant

The Coding Interview feature helps you solve algorithmic problems with AI-powered explanations, code generation, and complexity analysis.

---

## Table of Contents

1. [Overview](#overview)
2. [Input Methods](#input-methods)
3. [Solution Components](#solution-components)
4. [Follow-up Questions](#follow-up-questions)
5. [Code Execution](#code-execution)
6. [Supported Languages](#supported-languages)
7. [Best Practices](#best-practices)

---

## Overview

The Coding Interview assistant transforms any problem into a complete, working solution with:

- **Clean, optimized code** in your preferred language
- **Step-by-step explanation** of the approach
- **Time and space complexity** analysis
- **Interactive follow-up** for deeper understanding

![Coding Mode Overview](../images/coding-overview.png)
*Main coding interface with problem input and solution panel*

---

## Input Methods

### Method 1: Paste Problem Text

The simplest approach — copy any coding problem and paste directly:

```
Given an array of integers nums and an integer target, return
indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution,
and you may not use the same element twice.
```

> **Tip:** Include constraints and examples for better solutions.

### Method 2: Enter a URL

Paste a problem URL from supported platforms:

**Supported Platforms:**
- LeetCode (`leetcode.com/problems/...`)
- HackerRank (`hackerrank.com/challenges/...`)

```
https://leetcode.com/problems/two-sum/
```

Ascend will automatically extract:
- Problem description
- Examples
- Constraints
- Function signature

![URL Extraction](../images/url-extraction.png)
*Automatic problem extraction from LeetCode*

### Method 3: Screenshot Upload

For problems in images, PDFs, or non-standard formats:

1. Click the **Screenshot** button (or `Cmd+Shift+S` / `Ctrl+Shift+S`)
2. Select the area containing the problem
3. Ascend uses AI vision to extract the text

![Screenshot Mode](../images/screenshot-capture.png)
*Screenshot capture for image-based problems*

> **Desktop Only:** The screenshot feature works best in the desktop app with system permissions enabled.

---

## Solution Components

### Code Output

Every solution includes:

```python
def twoSum(self, nums: List[int], target: int) -> List[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

**Features:**
- Syntax highlighting for all languages
- One-click copy to clipboard
- Line numbers for reference

### Explanation Tab

Detailed breakdown of the solution approach:

1. **Intuition** — Why this approach works
2. **Algorithm Steps** — Line-by-line walkthrough
3. **Key Insights** — Important observations
4. **Edge Cases** — Boundary conditions handled

### Complexity Analysis

Time and space complexity with justification:

| Metric | Value | Explanation |
|--------|-------|-------------|
| **Time** | O(n) | Single pass through array |
| **Space** | O(n) | Hash map stores up to n elements |

---

## Follow-up Questions

After receiving a solution, ask follow-up questions for deeper understanding:

**Example follow-ups:**
```
"Why is a hash map better than nested loops here?"
"How would this change if the array was sorted?"
"Can you show me the brute force approach first?"
"What if there are multiple valid pairs?"
```

![Follow-up Q&A](../images/followup-qa.png)
*Follow-up conversation for deeper understanding*

The AI maintains context of the problem and previous solution, allowing natural conversation.

---

## Code Execution

Test your solutions directly in Ascend:

### Running Code

1. Click **Run Code** below the solution
2. Enter custom test cases (optional)
3. View output and execution time

```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Runtime: 0.02ms
```

### Custom Test Cases

```
# Add your own test cases
nums = [3,2,4]
target = 6
# Expected: [1,2]
```

> **Note:** Code execution uses a sandboxed environment. Not all libraries are available.

---

## Supported Languages

Ascend supports 20+ programming languages:

| Category | Languages |
|----------|-----------|
| **Popular** | Python, JavaScript, Java, C++, Go |
| **Scripting** | Ruby, PHP, Perl, Lua |
| **Systems** | Rust, C, Swift, Kotlin |
| **Functional** | Haskell, Scala, Elixir |
| **Other** | TypeScript, C#, R, MATLAB |

### Changing Default Language

1. Open **Settings** (`Cmd+,` / `Ctrl+,`)
2. Navigate to **Preferences**
3. Select your preferred **Default Language**

![Language Settings](../images/language-settings.png)
*Set your preferred programming language*

---

## Best Practices

### For Better Solutions

1. **Include constraints**
   ```
   1 <= nums.length <= 10^4
   -10^9 <= nums[i] <= 10^9
   ```
   Constraints help the AI choose optimal approaches.

2. **Provide examples**
   ```
   Input: nums = [2,7,11,15], target = 9
   Output: [0,1]
   ```
   Examples clarify expected behavior.

3. **Specify requirements**
   ```
   "Solve in O(n) time using constant extra space"
   ```
   Constraints guide the solution approach.

### Interview Simulation

Practice like a real interview:

1. Set a timer (aim for 15-20 minutes per problem)
2. Try solving before viewing the solution
3. Use follow-ups to understand, not just copy
4. Practice explaining solutions out loud

### Difficulty Progression

| Week | Focus | Difficulty |
|------|-------|------------|
| 1-2 | Arrays, Strings, Hash Maps | Easy |
| 3-4 | Two Pointers, Sliding Window | Easy-Medium |
| 5-6 | Trees, Graphs, BFS/DFS | Medium |
| 7-8 | Dynamic Programming | Medium-Hard |
| 9-10 | System Design prep | Hard |

---

## Next Steps

- [System Design Guide](./system-design.md) — Master architecture interviews
- [Company Prep Guide](./company-prep.md) — Prepare for specific companies
- [Keyboard Shortcuts](../reference/shortcuts.md) — Work faster
