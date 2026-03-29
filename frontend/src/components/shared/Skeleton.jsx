export default function Skeleton({ variant = 'text', lines = 3, className = '' }) {
  const shimmer = 'animate-shimmer bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%]';

  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded ${shimmer}`}
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'code') {
    return (
      <div className={`space-y-2 p-4 bg-gray-50 rounded-xl ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded ${shimmer}`}
            style={{ width: `${40 + ((i * 17) % 50)}%`, marginLeft: i % 3 === 0 ? 0 : '1.5rem' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 bg-gray-50 rounded-xl border border-gray-200/30 ${className}`}>
        <div className={`h-6 w-1/3 rounded mb-4 ${shimmer}`} />
        <div className="space-y-3">
          <div className={`h-4 rounded ${shimmer}`} />
          <div className={`h-4 w-4/5 rounded ${shimmer}`} />
          <div className={`h-4 w-3/5 rounded ${shimmer}`} />
        </div>
      </div>
    );
  }

  return <div className={`h-4 rounded ${shimmer} ${className}`} />;
}
