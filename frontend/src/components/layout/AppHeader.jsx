import ChunduLogo from '../ChunduLogo';
import ProviderToggle from '../ProviderToggle';
import AscendModeSelector from '../AscendModeSelector';
import PlatformStatus from '../PlatformStatus';
import { isElectron } from '../../constants';

/**
 * App header component with logo, mode selector, and provider toggle
 */
export default function AppHeader({
  // Mode props
  ascendMode,
  onModeChange,
  designDetailLevel,
  onDesignDetailLevelChange,
  codingDetailLevel,
  onCodingDetailLevelChange,
  codingLanguage,
  onCodingLanguageChange,

  // Provider props
  provider,
  model,
  autoSwitch,
  onProviderChange,
  onModelChange,
  onAutoSwitchChange,

  // Platform props
  platformStatus,
  onPlatformLogin,
  showPlatformDropdown,
  onTogglePlatformDropdown,

  // Actions
  onSettingsClick,
  onPrepTabClick,
  onSavedDesignsClick,
  onAdminClick,
  onLogout,

  // Auth
  isAuthenticated,
  user,
  isAdmin,
}) {
  return (
    <header className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700">
      {/* Left section: Logo and Mode Selector */}
      <div className="flex items-center gap-4">
        <ChunduLogo className="h-8" />

        <AscendModeSelector
          mode={ascendMode}
          onModeChange={onModeChange}
          designDetailLevel={designDetailLevel}
          onDesignDetailLevelChange={onDesignDetailLevelChange}
          codingDetailLevel={codingDetailLevel}
          onCodingDetailLevelChange={onCodingDetailLevelChange}
          codingLanguage={codingLanguage}
          onCodingLanguageChange={onCodingLanguageChange}
        />
      </div>

      {/* Center section: Platform status (Electron only) */}
      {isElectron && (
        <div className="flex items-center gap-2">
          <PlatformStatus
            status={platformStatus}
            onLogin={onPlatformLogin}
            showDropdown={showPlatformDropdown}
            onToggleDropdown={onTogglePlatformDropdown}
          />
        </div>
      )}

      {/* Right section: Provider toggle and actions */}
      <div className="flex items-center gap-3">
        <ProviderToggle
          provider={provider}
          model={model}
          autoSwitch={autoSwitch}
          onProviderChange={onProviderChange}
          onModelChange={onModelChange}
          onAutoSwitchChange={onAutoSwitchChange}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrepTabClick}
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors"
            title="Interview Prep"
          >
            Prep
          </button>

          {ascendMode === 'system-design' && (
            <button
              onClick={onSavedDesignsClick}
              className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors"
              title="Saved Designs"
            >
              Saved
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onAdminClick}
              className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
              title="Admin Panel"
            >
              Admin
            </button>
          )}

          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {!isElectron && isAuthenticated && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
