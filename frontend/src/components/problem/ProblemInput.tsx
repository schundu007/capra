import { useAppStore } from '../../store/appStore';

const MAX_LENGTH = 10000;

export function ProblemInput() {
  const { problemText, setProblemText } = useAppStore();
  const charCount = problemText.length;
  const isNearLimit = charCount > MAX_LENGTH * 0.9;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Problem Statement
      </label>
      <textarea
        value={problemText}
        onChange={(e) => setProblemText(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="Paste your coding problem here...

Example:
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order."
        className="w-full h-48 p-3 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
      />
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          Supports Markdown formatting
        </span>
        <span
          className={`${
            isNearLimit
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
