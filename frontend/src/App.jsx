import { isElectron } from './constants';
import AppRouter from './router';
import MainApp from './pages/MainApp';
import { getAuthHeaders } from './utils/authHeaders.js';

// Re-export for backward compatibility
export { getAuthHeaders };

// ============================================================================
// Storage Migration (runs once on load)
// ============================================================================
function migrateStorageKeys() {
  const migrations = [
    ['ascend_token', 'chundu_token'],
    ['ascend_coding_history', 'chundu_coding_history'],
    ['ascend_system_design_sessions', 'chundu_system_design_sessions'],
    ['ascend_auto_switch', 'chundu_auto_switch'],
    ['ascend_sidebar_collapsed', 'chundu_sidebar_collapsed'],
  ];

  for (const [oldKey, newKey] of migrations) {
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldValue);
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
