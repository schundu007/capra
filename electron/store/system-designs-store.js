import Store from 'electron-store';

// System design sessions storage
// Uses electron-store which stores data in the app's userData directory
export const systemDesignsStore = new Store({
  name: 'system-designs',
  defaults: {
    sessions: {},
  },
});

console.log('[SystemDesignsStore] Initialized, path:', systemDesignsStore.path);

export function getAllSessions() {
  return systemDesignsStore.get('sessions', {});
}

export function saveSession(sessionId, sessionData) {
  const sessions = getAllSessions();
  sessions[sessionId] = sessionData;
  systemDesignsStore.set('sessions', sessions);
  return sessionId;
}

export function getSession(sessionId) {
  const sessions = getAllSessions();
  return sessions[sessionId] || null;
}

export function updateSession(sessionId, updates) {
  const sessions = getAllSessions();
  if (sessions[sessionId]) {
    sessions[sessionId] = { ...sessions[sessionId], ...updates, lastUpdated: Date.now() };
    systemDesignsStore.set('sessions', sessions);
    return true;
  }
  return false;
}

export function deleteSession(sessionId) {
  const sessions = getAllSessions();
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    systemDesignsStore.set('sessions', sessions);
    return true;
  }
  return false;
}

export function clearAllSessions() {
  systemDesignsStore.set('sessions', {});
  return true;
}

export default systemDesignsStore;
