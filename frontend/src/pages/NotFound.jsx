export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 rounded-xl bg-gray-50 border border-gray-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-600 mb-6">Page not found</p>
        <a
          href="/"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-gray-900 rounded-lg text-sm transition-colors inline-block"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
