import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import type { DifficultyLevel } from '../../types';

export function SampleIOFields() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    sampleInput,
    setSampleInput,
    sampleOutput,
    setSampleOutput,
    difficulty,
    setDifficulty,
  } = useAppStore();

  return (
    <div className="space-y-3">
      {/* Collapse toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Sample I/O & Settings (Optional)
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-4"
          >
            {/* Sample Input */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Sample Input
              </label>
              <textarea
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                placeholder="[2, 7, 11, 15], target = 9"
                className="w-full h-20 p-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Sample Output */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Expected Output
              </label>
              <textarea
                value={sampleOutput}
                onChange={(e) => setSampleOutput(e.target.value)}
                placeholder="[0, 1]"
                className="w-full h-20 p-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(difficulty === level ? null : level)}
                    className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                      difficulty === level
                        ? level === 'easy'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                          : level === 'medium'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
