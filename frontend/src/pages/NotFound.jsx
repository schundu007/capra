export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center bg-neutral-900">
      <div className="text-center p-8 rounded-xl bg-neutral-800 border border-neutral-700">
        <h1 className="text-4xl font-bold text-neutral-200 mb-2">404</h1>
        <p className="text-neutral-400 mb-6">Page not found</p>
        <a
          href="/"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-colors inline-block"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
