import { useState, useEffect } from 'react';

const STAGES = {
  screenshot: [
    { name: 'Uploading', percent: 10 },
    { name: 'Extracting text', percent: 40 },
    { name: 'Processing', percent: 70 },
    { name: 'Analyzing', percent: 90 },
  ],
  fetch: [
    { name: 'Connecting', percent: 10 },
    { name: 'Fetching page', percent: 30 },
    { name: 'Extracting problem', percent: 60 },
    { name: 'Processing', percent: 90 },
  ],
  solve: [
    { name: 'Analyzing problem', percent: 20 },
    { name: 'Generating code', percent: 50 },
    { name: 'Adding explanations', percent: 80 },
    { name: 'Finalizing', percent: 95 },
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

    // Animate through stages
    const stageInterval = setInterval(() => {
      setStageIndex(prev => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    // Smooth progress animation
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
    <div className="bg-neutral-800 rounded-md p-3 border border-neutral-700">
      {/* Stage indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs font-medium text-neutral-300">{currentStage?.name}</span>
        </div>
        <span className="text-xs text-neutral-500">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage dots */}
      <div className="flex justify-between mt-2">
        {stages.map((stage, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
              idx <= stageIndex ? 'bg-white' : 'bg-neutral-600'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
}
