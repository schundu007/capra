import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for detecting and interacting with Electron environment
 */
export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [appVersion, setAppVersion] = useState(null);

  useEffect(() => {
    // Check if running in Electron
    const electronAPI = window.electronAPI;
    if (electronAPI?.isElectron) {
      setIsElectron(true);

      // Get platform info
      electronAPI.getPlatformInfo?.().then(setPlatformInfo);
      electronAPI.getAppVersion?.().then(setAppVersion);
    }
  }, []);

  // Get the API URL based on environment
  const getApiUrl = useCallback(() => {
    if (isElectron && platformInfo?.backendPort) {
      return `http://localhost:${platformInfo.backendPort}`;
    }
    // Fallback to environment variable or empty for relative URLs
    return import.meta.env.VITE_API_URL || '';
  }, [isElectron, platformInfo]);

  return {
    isElectron,
    platformInfo,
    appVersion,
    getApiUrl,
    electronAPI: isElectron ? window.electronAPI : null,
  };
}

/**
 * Get the API URL for fetch requests
 * Works in both Electron and web environments
 */
export function getApiUrl() {
  if (window.electronAPI?.isElectron) {
    // In Electron, use localhost with the backend port
    return 'http://localhost:3009';
  }
  return import.meta.env.VITE_API_URL || '';
}

export default useElectron;
