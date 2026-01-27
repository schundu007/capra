import type { Complexity } from '../../types';

interface ComplexityCardProps {
  complexity: Complexity;
}

export function ComplexityCard({ complexity }: ComplexityCardProps) {
  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Complexity Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Time Complexity */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs text-gray-500 dark:text-gray-400">Time</span>
          </div>
          <p className="text-lg font-mono font-semibold text-green-600 dark:text-green-400">
            {complexity.time.notation}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {complexity.time.explanation}
          </p>
        </div>

        {/* Space Complexity */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
            <span className="text-xs text-gray-500 dark:text-gray-400">Space</span>
          </div>
          <p className="text-lg font-mono font-semibold text-blue-600 dark:text-blue-400">
            {complexity.space.notation}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {complexity.space.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
