// Platform display order and icons
const PLATFORM_CONFIG = {
  glider: { icon: 'G', name: 'Glider' },
  lark: { icon: 'L', name: 'Lark' },
  hackerrank: { icon: 'H', name: 'HackerRank' },
  coderpad: { icon: 'C', name: 'CoderPad' },
  codesignal: { icon: 'S', name: 'CodeSignal' },
  codility: { icon: 'Y', name: 'Codility' },
  leetcode: { icon: 'LC', name: 'LeetCode' },
};

// Render platforms list
function renderPlatforms(status) {
  const container = document.getElementById('platforms');
  container.innerHTML = '';

  for (const [key, config] of Object.entries(PLATFORM_CONFIG)) {
    const platformStatus = status[key] || { authenticated: false };
    const isConnected = platformStatus.authenticated;

    const div = document.createElement('div');
    div.className = 'platform';
    div.innerHTML = `
      <div class="platform-info">
        <div class="platform-icon ${key}">${config.icon}</div>
        <span class="platform-name">${config.name}</span>
      </div>
      <div class="status">
        <span class="status-dot ${isConnected ? 'connected' : 'disconnected'}"></span>
        <span class="status-text ${isConnected ? 'connected' : 'disconnected'}">
          ${isConnected ? 'Connected' : 'Not logged in'}
        </span>
        ${isConnected ? `<button class="sync-btn" data-platform="${key}">Sync</button>` : ''}
      </div>
    `;
    container.appendChild(div);
  }

  // Add sync button handlers
  document.querySelectorAll('.sync-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const platform = e.target.dataset.platform;
      e.target.disabled = true;
      e.target.textContent = '...';

      const response = await chrome.runtime.sendMessage({
        action: 'syncPlatform',
        platform,
      });

      e.target.disabled = false;
      e.target.textContent = response.success ? 'Done!' : 'Failed';

      setTimeout(() => {
        e.target.textContent = 'Sync';
      }, 2000);
    });
  });
}

// Load current status
async function loadStatus() {
  const platformsEl = document.getElementById('platforms');
  platformsEl.classList.add('loading');

  const status = await chrome.runtime.sendMessage({ action: 'getStatus' });
  renderPlatforms(status);

  platformsEl.classList.remove('loading');
}

// Load API URL
async function loadApiUrl() {
  const response = await chrome.runtime.sendMessage({ action: 'getApiUrl' });
  document.getElementById('apiUrl').value = response.url;
}

// Save API URL
async function saveApiUrl() {
  const url = document.getElementById('apiUrl').value.trim();
  if (url) {
    await chrome.runtime.sendMessage({ action: 'setApiUrl', url });
  }
}

// Sync all platforms
async function syncAll() {
  const btn = document.getElementById('syncAll');
  btn.disabled = true;
  btn.textContent = 'Syncing...';

  const results = await chrome.runtime.sendMessage({ action: 'syncAll' });

  const successCount = Object.values(results).filter(Boolean).length;
  btn.textContent = `Synced ${successCount}!`;

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Sync All';
  }, 2000);

  // Refresh status
  await loadStatus();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadStatus();
  loadApiUrl();

  document.getElementById('syncAll').addEventListener('click', syncAll);
  document.getElementById('refresh').addEventListener('click', loadStatus);
  document.getElementById('apiUrl').addEventListener('change', saveApiUrl);
});
