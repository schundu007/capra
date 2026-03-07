const { contextBridge, ipcRenderer, desktopCapturer, clipboard } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // API Key management
  getApiKeys: () => ipcRenderer.invoke('get-api-keys'),
  setApiKeys: (keys) => ipcRenderer.invoke('set-api-keys', keys),
  validateApiKey: (provider, key) => ipcRenderer.invoke('validate-api-key', provider, key),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings) => ipcRenderer.invoke('set-settings', settings),

  // First run setup
  completeSetup: () => ipcRenderer.invoke('complete-setup'),

  // Events from main process
  onFirstRun: (callback) => {
    ipcRenderer.on('first-run', callback);
    return () => ipcRenderer.removeListener('first-run', callback);
  },
  onOpenSettings: (callback) => {
    ipcRenderer.on('open-settings', callback);
    return () => ipcRenderer.removeListener('open-settings', callback);
  },
  onNewProblem: (callback) => {
    ipcRenderer.on('new-problem', callback);
    return () => ipcRenderer.removeListener('new-problem', callback);
  },

  // Check if running in Electron
  isElectron: true,

  // Clipboard support
  copyToClipboard: (text) => {
    try {
      // Trim and clean up text before copying
      const cleanText = (text || '').trim().replace(/\n{3,}/g, '\n\n');
      clipboard.writeText(cleanText);
      return true;
    } catch (err) {
      console.error('Clipboard write failed:', err);
      return false;
    }
  },

  // Platform authentication
  platformLogin: (platform) => ipcRenderer.invoke('platform-login', platform),
  platformLogout: (platform) => ipcRenderer.invoke('platform-logout', platform),
  getPlatformStatus: () => ipcRenderer.invoke('platform-status'),
  getPlatformCookies: (platform) => ipcRenderer.invoke('get-platform-cookies', platform),

  // Open Interview Prep in dedicated window
  openInterviewPrep: () => ipcRenderer.invoke('open-interview-prep'),

  // Open document viewer with HTML documents
  openDocumentViewer: (documents) => ipcRenderer.invoke('open-document-viewer', documents),

  // Stealth mode
  getStealthMode: () => ipcRenderer.invoke('get-stealth-mode'),
  setStealthMode: (enabled) => ipcRenderer.invoke('set-stealth-mode', enabled),
  toggleWindowVisibility: () => ipcRenderer.invoke('toggle-window-visibility'),
  onStealthModeChanged: (callback) => {
    ipcRenderer.on('stealth-mode-changed', (event, enabled) => callback(enabled));
    return () => ipcRenderer.removeListener('stealth-mode-changed', callback);
  },

  // Audio capture for Interview Assistant (Electron-specific, works on macOS)
  getDesktopAudioSources: async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        fetchWindowIcons: false,
      });
      return sources.map(source => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail?.toDataURL(),
      }));
    } catch (err) {
      console.error('Failed to get desktop sources:', err);
      return [];
    }
  },

  // Get system audio stream constraint for Electron
  getSystemAudioConstraint: (sourceId) => {
    return {
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 1,
          maxWidth: 1,
          minHeight: 1,
          maxHeight: 1,
        },
      },
    };
  },

  // System Design Sessions - stored in app data folder
  getSystemDesigns: () => ipcRenderer.invoke('get-system-designs'),
  saveSystemDesign: (sessionId, sessionData) => ipcRenderer.invoke('save-system-design', sessionId, sessionData),
  updateSystemDesign: (sessionId, updates) => ipcRenderer.invoke('update-system-design', sessionId, updates),
  deleteSystemDesign: (sessionId) => ipcRenderer.invoke('delete-system-design', sessionId),
  clearAllSystemDesigns: () => ipcRenderer.invoke('clear-all-system-designs'),

  // Device License Management
  getDeviceInfo: () => ipcRenderer.invoke('get-device-info'),
  verifyDeviceLicense: (token) => ipcRenderer.invoke('verify-device-license', token),
  getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),
  clearLicenseCache: () => ipcRenderer.invoke('clear-license-cache'),
  onLicenseStatusChanged: (callback) => {
    ipcRenderer.on('license-status-changed', (event, status) => callback(status));
    return () => ipcRenderer.removeListener('license-status-changed', callback);
  },

  // Cloud Sync Auth Token (for syncing Interview Prep data)
  getAuthToken: () => ipcRenderer.invoke('get-auth-token'),
  setAuthToken: (token) => ipcRenderer.invoke('set-auth-token', token),
  getUserId: () => ipcRenderer.invoke('get-user-id'),

  // Account Auth (OAuth login for cloud sync)
  accountLogin: (provider) => ipcRenderer.invoke('account-login', provider || 'google'),
  accountStatus: () => ipcRenderer.invoke('account-status'),
  accountLogout: () => ipcRenderer.invoke('account-logout'),

});

// Expose a flag to detect Electron environment
contextBridge.exposeInMainWorld('isElectron', true);
