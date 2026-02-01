import { ipcMain } from 'electron';
import { configStore } from '../store/config-store.js';

/**
 * Set up IPC handlers for settings management
 */
export function setupSettingsHandlers() {
  // Get all settings
  ipcMain.handle('get-settings', async () => {
    return {
      hasCompletedSetup: configStore.get('hasCompletedSetup', false),
      preferences: configStore.get('preferences', {}),
      windowBounds: configStore.get('windowBounds', {}),
    };
  });

  // Update settings
  ipcMain.handle('set-settings', async (event, settings) => {
    if (settings.preferences !== undefined) {
      configStore.set('preferences', settings.preferences);
    }
    if (settings.windowBounds !== undefined) {
      configStore.set('windowBounds', settings.windowBounds);
    }
    return configStore.store;
  });

  // Mark setup as complete
  ipcMain.handle('complete-setup', async () => {
    configStore.set('hasCompletedSetup', true);
    return true;
  });

  // Get a specific preference
  ipcMain.handle('get-preference', async (event, key) => {
    const preferences = configStore.get('preferences', {});
    return preferences[key];
  });

  // Set a specific preference
  ipcMain.handle('set-preference', async (event, key, value) => {
    const preferences = configStore.get('preferences', {});
    preferences[key] = value;
    configStore.set('preferences', preferences);
    return preferences;
  });
}
