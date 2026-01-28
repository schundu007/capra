export default function ProviderToggle({ provider, onChange }) {
  return (
    <div className="flex bg-slate-800 rounded p-0.5">
      <button
        onClick={() => onChange('claude')}
        className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
          provider === 'claude'
            ? 'bg-orange-500/20 text-orange-400'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        Claude
      </button>
      <button
        onClick={() => onChange('openai')}
        className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
          provider === 'openai'
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        GPT-4
      </button>
    </div>
  );
}
