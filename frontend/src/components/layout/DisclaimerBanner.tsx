export function DisclaimerBanner() {
  return (
    <div className="bg-amber-600 dark:bg-amber-700 text-white text-center py-1.5 px-4 text-sm font-medium">
      <span className="inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        For practice and learning only — not for use during live interviews or assessments
      </span>
    </div>
  );
}
