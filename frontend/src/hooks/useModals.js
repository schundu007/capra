import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for managing modal visibility state
 * Centralizes all modal state management and provides utility functions
 */
export function useModals() {
  const [showSettings, setShowSettings] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showPlatformAuth, setShowPlatformAuth] = useState(false);
  const [showAscendAssistant, setShowAscendAssistant] = useState(false);
  const [showPrepTab, setShowPrepTab] = useState(false);
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if any modal is open
  const isAnyModalOpen = useMemo(() => {
    return (
      showSettings ||
      showSetupWizard ||
      showPlatformAuth ||
      showPrepTab ||
      showAdminPanel ||
      showSavedDesigns
    );
  }, [showSettings, showSetupWizard, showPlatformAuth, showPrepTab, showAdminPanel, showSavedDesigns]);

  // Close all modals
  const closeAllModals = useCallback(() => {
    setShowSettings(false);
    setShowSetupWizard(false);
    setShowPlatformAuth(false);
    setShowAscendAssistant(false);
    setShowPrepTab(false);
    setShowSavedDesigns(false);
    setShowAdminPanel(false);
    setShowPricingPlans(false);
    setShowOnboarding(false);
  }, []);

  // Toggle functions
  const toggleSettings = useCallback(() => setShowSettings((prev) => !prev), []);
  const toggleSetupWizard = useCallback(() => setShowSetupWizard((prev) => !prev), []);
  const togglePlatformAuth = useCallback(() => setShowPlatformAuth((prev) => !prev), []);
  const toggleAscendAssistant = useCallback(() => setShowAscendAssistant((prev) => !prev), []);
  const togglePrepTab = useCallback(() => setShowPrepTab((prev) => !prev), []);
  const toggleSavedDesigns = useCallback(() => setShowSavedDesigns((prev) => !prev), []);
  const toggleAdminPanel = useCallback(() => setShowAdminPanel((prev) => !prev), []);
  const togglePricingPlans = useCallback(() => setShowPricingPlans((prev) => !prev), []);

  return {
    // State
    showSettings,
    showSetupWizard,
    showPlatformAuth,
    showAscendAssistant,
    showPrepTab,
    showSavedDesigns,
    showAdminPanel,
    showPricingPlans,
    showOnboarding,
    isAnyModalOpen,

    // Setters
    setShowSettings,
    setShowSetupWizard,
    setShowPlatformAuth,
    setShowAscendAssistant,
    setShowPrepTab,
    setShowSavedDesigns,
    setShowAdminPanel,
    setShowPricingPlans,
    setShowOnboarding,

    // Togglers
    toggleSettings,
    toggleSetupWizard,
    togglePlatformAuth,
    toggleAscendAssistant,
    togglePrepTab,
    toggleSavedDesigns,
    toggleAdminPanel,
    togglePricingPlans,

    // Utility
    closeAllModals,
  };
}

export default useModals;
