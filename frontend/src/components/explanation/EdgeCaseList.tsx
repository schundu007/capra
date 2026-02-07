import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EdgeCase } from '../../types';

interface EdgeCaseListProps {
  edgeCases: EdgeCase[];
}

export function EdgeCaseList({ edgeCases }: EdgeCaseListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (edgeCases.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Edge Cases Handled
          </span>
          <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
            {edgeCases.length}
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
            <div className="p-3 space-y-2 bg-white dark:bg-gray-900">
              {edgeCases.map((edgeCase, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-4 h-4 flex items-center justify-center rounded-full ${
                        edgeCase.handled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {edgeCase.handled ? '✓' : '✗'}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {edgeCase.case}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                    {edgeCase.how}
                    {edgeCase.line_reference && (
                      <span className="ml-1 text-blue-600 dark:text-blue-400">
                        (line {edgeCase.line_reference})
                      </span>
                    )}
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
