import { motion } from 'framer-motion';
import type { LineExplanation as LineExplanationType } from '../../types';
import { useAppStore } from '../../store/appStore';

interface LineExplanationProps {
  line: LineExplanationType;
  onHover: (lineNumber: number | null) => void;
}

export function LineExplanationCard({ line, onHover }: LineExplanationProps) {
  const { highlightedLine } = useAppStore();
  const isHighlighted = highlightedLine === line.line_number;

  return (
    <motion.div
      data-line={line.line_number}
      onMouseEnter={() => onHover(line.line_number)}
      onMouseLeave={() => onHover(null)}
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isHighlighted
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        {/* Line number badge */}
        <span
          className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium ${
            isHighlighted
              ? 'bg-blue-600 text-white'
              : line.is_key_line
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          {line.line_number}
        </span>

        <div className="flex-1 min-w-0">
          {/* Code snippet */}
          <code className="block text-xs text-gray-500 dark:text-gray-400 font-mono mb-1 truncate">
            {line.code}
          </code>

          {/* Explanation */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {line.explanation}
          </p>

          {/* Complexity note */}
          {line.complexity_note && (
            <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
              {line.complexity_note}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
