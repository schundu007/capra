import { isElectron } from './constants';
import AppRouter from './router';
import MainApp from './pages/MainApp';
// ============================================================================
// Storage Migration (runs once on load)
// ============================================================================
function migrateStorageKeys() {
  // Migrate FROM chundu_* TO ascend_* (old → new)
  const migrations = [
    ['chundu_token', 'ascend_token'],
    ['chundu_provider', 'ascend_provider'],
    ['chundu_model', 'ascend_model'],
    ['chundu_auto_switch', 'ascend_auto_switch'],
    ['chundu_coding_history', 'ascend_coding_history'],
    ['chundu_system_design_sessions', 'ascend_system_design_sessions'],
    ['chundu_sidebar_collapsed', 'ascend_sidebar_collapsed'],
  ];

  for (const [oldKey, newKey] of migrations) {
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldValue);
      localStorage.removeItem(oldKey);
    }
  }
}
migrateStorageKeys();

// ============================================================================
// Main App Component
// ============================================================================
export default function App() {
  // Electron renders MainApp directly (no React Router needed)
  if (isElectron) {
    return <MainApp />;
  }

  // Webapp uses React Router
  return <AppRouter />;
}
