import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CommonMistake } from '../../types';

interface MistakesListProps {
  mistakes: CommonMistake[];
}

export function MistakesList({ mistakes }: MistakesListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (mistakes.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Common Mistakes to Avoid
          </span>
          <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
            {mistakes.length}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 bg-white dark:bg-gray-900">
              {mistakes.map((mistake, index) => (
                <div
                  key={index}
                  className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg"
                >
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                    ✗ {mistake.mistake}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span className="text-red-600 dark:text-red-400">Why it's wrong:</span>{' '}
                    {mistake.why_wrong}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-green-600 dark:text-green-400">How we avoid it:</span>{' '}
                    {mistake.how_avoided}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
