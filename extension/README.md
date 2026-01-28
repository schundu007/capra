# Capra Browser Extension

This Chrome extension captures authentication from coding platforms (Glider, Lark, HackerRank) so Capra can fetch problems that require login.

## Installation

### Chrome / Edge / Brave

1. Open `chrome://extensions` in your browser
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension` folder from this project

### Firefox

Firefox requires a different manifest format. For now, use a Chromium-based browser.

## Usage

1. **Install the extension** (see above)
2. **Login to platforms** - Go to Glider, Lark, or HackerRank and login normally
3. **Click the extension icon** - You'll see which platforms you're connected to
4. **Click "Sync All"** - This sends your session cookies to the Capra backend
5. **Fetch problems** - Now you can paste URLs from authenticated platforms

## Supported Platforms

| Platform | Status |
|----------|--------|
| Glider | Supported |
| Lark / Larksuite / Feishu | Supported |
| HackerRank | Supported |
| LeetCode | Public problems only (no auth needed) |
| CodeSignal | Coming soon |
| Codility | Coming soon |

## How It Works

1. The extension captures session cookies when you're logged into supported platforms
2. When you click "Sync", these cookies are sent to your local Capra backend
3. The backend stores them temporarily (4 hours)
4. When you fetch a problem URL, the backend uses these cookies to authenticate

## Security Notes

- Cookies are stored **only in your local backend** - never sent to external servers
- Cookies expire after 4 hours for security
- You can clear all stored auth anytime via the extension or backend API
- The extension only requests access to specific coding platform domains

## Troubleshooting

### "Not logged in" even though I'm logged in
- Try refreshing the platform page
- Click "Refresh" in the extension popup
- Make sure you completed the login (not stuck on 2FA)

### "Session may have expired"
- Login to the platform again in your browser
- Click "Sync All" in the extension

### Backend not receiving cookies
- Check that the Backend URL in the extension matches your server (default: `https://capra-backend-production.up.railway.app`)
- Make sure the backend is running

## API Endpoints

The extension communicates with these backend endpoints:

- `POST /api/auth/platform` - Store cookies for a platform
- `GET /api/auth/status` - Get connection status for all platforms
- `DELETE /api/auth/platform/:platform` - Clear auth for a platform
- `DELETE /api/auth/all` - Clear all stored auth
