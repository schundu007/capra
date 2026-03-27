export default function EmptyState({ icon, title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700/50 flex items-center justify-center mb-6 text-neutral-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-neutral-300 mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6">{description}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 rounded-lg text-sm font-medium transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}
