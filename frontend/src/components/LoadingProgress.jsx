import { useState, useEffect } from 'react';

const STAGES = {
  screenshot: [
    { name: 'Uploading image', percent: 10 },
    { name: 'Extracting text with AI', percent: 40 },
    { name: 'Processing content', percent: 70 },
    { name: 'Analyzing problem', percent: 90 },
  ],
  fetch: [
    { name: 'Connecting to source', percent: 10 },
    { name: 'Fetching page content', percent: 30 },
    { name: 'Extracting problem', percent: 60 },
    { name: 'Processing', percent: 90 },
  ],
  solve: [
    { name: 'Analyzing problem', percent: 20 },
    { name: 'Generating solution', percent: 50 },
    { name: 'Adding explanations', percent: 80 },
    { name: 'Finalizing output', percent: 95 },
  ],
};

export default function LoadingProgress({ type = 'solve', isActive }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const stages = STAGES[type] || STAGES.solve;

  useEffect(() => {
    if (!isActive) {
      setStageIndex(0);
      setProgress(0);
      return;
    }

    const stageInterval = setInterval(() => {
      setStageIndex(prev => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const targetPercent = stages[stageIndex]?.percent || 0;
        if (prev < targetPercent) {
          return Math.min(prev + 1, targetPercent);
        }
        return prev;
      });
    }, 50);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [isActive, stageIndex, stages]);

  if (!isActive) return null;

  const currentStage = stages[stageIndex];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 animate-fade-in shadow-sm">
      {/* Stage indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-red-600 rounded-full animate-ping opacity-50" />
          </div>
          <span className="text-base font-semibold text-gray-700">{currentStage?.name}</span>
        </div>
        <span className="text-base font-mono font-bold text-red-700">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #facc15, #dc2626)',
            boxShadow: '0 0 10px rgba(220, 38, 38, 0.4)',
          }}
        />
      </div>

      {/* Stage dots */}
      <div className="flex justify-between mt-3 px-1">
        {stages.map((stage, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx <= stageIndex
                ? 'bg-red-600 shadow-md shadow-yellow-300'
                : 'bg-gray-200'
            }`} />
            <span className={`text-xs font-medium transition-colors ${
              idx === stageIndex ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {idx + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
