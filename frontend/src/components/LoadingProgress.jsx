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
  testing: [
    { name: 'Running code', percent: 30 },
    { name: 'Checking output', percent: 60 },
    { name: 'Validating results', percent: 90 },
  ],
  fixing: [
    { name: 'Analyzing error', percent: 25 },
    { name: 'Generating fix', percent: 60 },
    { name: 'Applying changes', percent: 90 },
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
    <div className="rounded p-4 animate-fade-in" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
      {/* Stage indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
          </div>
          <span className="text-sm font-medium" style={{ color: '#333333' }}>{currentStage?.name}</span>
        </div>
        <span className="text-sm font-mono font-semibold" style={{ color: '#10b981' }}>{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#d1fae5' }}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: '#10b981',
          }}
        />
      </div>

      {/* Stage dots */}
      <div className="flex justify-between mt-3 px-1">
        {stages.map((stage, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: idx <= stageIndex ? '#10b981' : '#d1fae5'
              }}
            />
            <span
              className="text-xs"
              style={{ color: idx === stageIndex ? '#333333' : '#999999' }}
            >
              {idx + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
