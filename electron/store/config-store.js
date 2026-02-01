import Store from 'electron-store';

// Non-sensitive configuration storage
// Uses electron-store which stores data in the app's userData directory
export const configStore = new Store({
  name: 'config',
  defaults: {
    hasCompletedSetup: false,
    windowBounds: {
      width: 1400,
      height: 900,
    },
    preferences: {
      defaultProvider: 'claude',
      defaultLanguage: 'auto',
      theme: 'dark',
    },
  },
});

export default configStore;
