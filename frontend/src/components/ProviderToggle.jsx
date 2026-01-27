export default function ProviderToggle({ provider, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded p-0.5">
      <button
        onClick={() => onChange('claude')}
        className={
          'px-2 py-1 rounded text-xs font-medium transition-colors ' +
          (provider === 'claude' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200')
        }
      >
        Claude
      </button>
      <button
        onClick={() => onChange('openai')}
        className={
          'px-2 py-1 rounded text-xs font-medium transition-colors ' +
          (provider === 'openai' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-slate-200')
        }
      >
        GPT-4
      </button>
    </div>
  );
}
