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
      clipboard.writeText(text);
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

});

// Expose a flag to detect Electron environment
contextBridge.exposeInMainWorld('isElectron', true);
