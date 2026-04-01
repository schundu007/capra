# Troubleshooting

Solutions to common issues with Ascend.

---

## Quick Diagnostics

Before diving into specific issues, try these quick fixes:

1. **Refresh the page** (Web) or **Restart the app** (Desktop)
2. **Check your internet connection**
3. **Clear browser cache** (Web) or **Reinstall** (Desktop)
4. **Check service status** at [status.cariara.com](https://status.cariara.com)

---

## Account & Authentication

<details>
<summary><strong>Can't sign in with OAuth (Google/GitHub)</strong></summary>

**Symptoms:** OAuth popup closes without signing in, or shows error

**Solutions:**
1. Clear browser cookies for `cariara.com` and OAuth provider
2. Disable browser extensions (especially ad blockers)
3. Try a different browser
4. Try incognito/private mode
5. Check if OAuth provider (Google/GitHub) is accessible

**If using desktop app:**
1. Check internet connection
2. Restart the application
3. Clear app data: Delete `~/Library/Application Support/Ascend` (Mac) or `%APPDATA%/Ascend` (Windows)

</details>

<details>
<summary><strong>Session keeps expiring</strong></summary>

**Symptoms:** Logged out frequently, need to re-authenticate

**Solutions:**
1. Check that cookies are enabled
2. Don't use private/incognito mode (sessions don't persist)
3. Check for browser extensions blocking cookies
4. Update your browser to the latest version

</details>

<details>
<summary><strong>Email verification not received</strong></summary>

**Symptoms:** No verification email after signup

**Solutions:**
1. Check spam/junk folder
2. Check promotions tab (Gmail)
3. Wait 5-10 minutes (email servers can be slow)
4. Try requesting a new verification email
5. Contact support if still not received after 30 minutes

</details>

---

## Web Application

<details>
<summary><strong>Solutions loading slowly</strong></summary>

**Symptoms:** Long wait times for AI responses

**Solutions:**
1. Check your internet speed (recommend 5+ Mbps)
2. Try switching AI provider (Claude ↔ GPT)
3. Enable "Fast mode" in Settings
4. Reduce problem complexity (shorter descriptions)
5. Clear browser cache and refresh

**Note:** Complex system designs take longer than simple coding problems.

</details>

<details>
<summary><strong>Solutions not generating</strong></summary>

**Symptoms:** Clicking "Solve" does nothing, or shows error

**Solutions:**
1. Check if you've exceeded free trial limits
2. Verify subscription is active
3. Check browser console for errors (`F12` → Console)
4. Try a different browser
5. Disable browser extensions

**If error message shown:**
- "Rate limited" → Wait a few minutes
- "Invalid request" → Refresh and try again
- "Service unavailable" → Check status page

</details>

<details>
<summary><strong>Code not displaying correctly</strong></summary>

**Symptoms:** Code appears garbled, no syntax highlighting

**Solutions:**
1. Refresh the page
2. Try a different browser
3. Zoom to 100% (`Cmd/Ctrl + 0`)
4. Clear browser cache

</details>

<details>
<summary><strong>URL extraction not working</strong></summary>

**Symptoms:** Pasting LeetCode/HackerRank URL doesn't load problem

**Solutions:**
1. Ensure URL is a valid problem page (not list or contest)
2. Check if the problem is accessible (not premium-only)
3. Try copying the problem text instead
4. Report the specific URL to support

**Supported URL formats:**
```
✅ https://leetcode.com/problems/two-sum/
✅ https://www.hackerrank.com/challenges/solve-me-first
❌ https://leetcode.com/problemset/
❌ https://leetcode.com/contest/weekly-contest-123
```

</details>

---

## Desktop Application

<details>
<summary><strong>App won't start</strong></summary>

**Symptoms:** Application crashes on launch or shows blank window

**macOS Solutions:**
1. Check macOS version (11+ required)
2. Grant all required permissions in System Preferences
3. Try launching from Terminal: `open /Applications/Ascend.app`
4. Check Console.app for error logs
5. Delete app preferences: `rm -rf ~/Library/Application\ Support/Ascend`
6. Reinstall the application

**Windows Solutions:**
1. Run as Administrator
2. Check Windows version (10+ required)
3. Install Visual C++ Redistributable
4. Check Windows Event Viewer for errors
5. Delete app data: `%APPDATA%/Ascend`
6. Reinstall the application

</details>

<details>
<summary><strong>API keys not working</strong></summary>

**Symptoms:** "Invalid API key" error in desktop app

**Solutions:**
1. Verify API key is correct (no extra spaces)
2. Ensure key has required permissions
3. Check if key has been revoked/rotated
4. Re-enter the key in Settings
5. For Claude: Visit console.anthropic.com to verify
6. For OpenAI: Visit platform.openai.com to verify

</details>

<details>
<summary><strong>Screenshot capture not working</strong></summary>

**Symptoms:** Screenshot button does nothing, or shows permission error

**macOS Solutions:**
1. Grant Screen Recording permission:
   - System Preferences → Security & Privacy → Privacy
   - Select "Screen Recording" → Enable Ascend
2. Restart the application after granting permission
3. Try using `Cmd+Shift+S` shortcut instead

**Windows Solutions:**
1. Run as Administrator
2. Check if screen capture is blocked by antivirus
3. Try using `Ctrl+Shift+S` shortcut

</details>

<details>
<summary><strong>Device license issues</strong></summary>

**Symptoms:** "Device limit reached" or "Another device active"

**Solutions:**
1. Go to web app → Settings → Devices
2. Deactivate the other device
3. Return to desktop app and sign in again
4. Contact support if you can't access the web app

**If device was lost/stolen:**
- Email support@cariara.com immediately
- We'll remotely deactivate the device

</details>

---

## Interview Assistant

<details>
<summary><strong>No transcription appearing</strong></summary>

**Symptoms:** Interview Assistant running but no text appears

**Solutions:**
1. Check microphone is working (test in System Preferences/Settings)
2. Verify correct input device selected in Ascend
3. Check microphone permission is granted
4. Increase microphone input level
5. Try a different microphone

**Test your setup:**
1. Click "Test Recording" in Interview Assistant
2. Speak clearly for 5-10 seconds
3. Check if text appears

</details>

<details>
<summary><strong>Poor transcription accuracy</strong></summary>

**Symptoms:** Text appears but is incorrect

**Solutions:**
1. Move microphone closer (6-12 inches from mouth)
2. Reduce background noise
3. Speak more slowly and clearly
4. Use a dedicated microphone (not laptop mic)
5. Check for audio interference (fans, AC)

</details>

<details>
<summary><strong>Stealth mode not working</strong></summary>

**Symptoms:** Window doesn't become transparent

**Solutions:**
1. Use keyboard shortcut `Cmd/Ctrl+Shift+H`
2. Check if window is focused
3. Restart the application
4. Verify Elite subscription is active

</details>

---

## Performance Issues

<details>
<summary><strong>High CPU/memory usage</strong></summary>

**Symptoms:** Computer running slow when Ascend is open

**Solutions:**
1. Close other resource-heavy applications
2. Restart Ascend
3. Clear application cache
4. Reduce number of open tabs/windows
5. Update to latest version

**For desktop app:**
- Check Activity Monitor (Mac) or Task Manager (Windows)
- If Ascend using >500MB RAM, restart the app

</details>

<details>
<summary><strong>Slow response times</strong></summary>

**Symptoms:** Everything feels sluggish

**Solutions:**
1. Check internet speed at speedtest.net
2. Try a different AI provider
3. Enable "Fast mode" for quicker (less detailed) responses
4. Clear browser/app cache
5. Restart your router

</details>

---

## Billing & Subscription

<details>
<summary><strong>Payment failed</strong></summary>

**Symptoms:** Subscription not activating after payment

**Solutions:**
1. Check card has sufficient funds
2. Verify card isn't expired
3. Check for fraud prevention blocks (contact your bank)
4. Try a different payment method
5. Contact support with transaction ID

</details>

<details>
<summary><strong>Subscription not showing as active</strong></summary>

**Symptoms:** Paid but still seeing "Free" or limits

**Solutions:**
1. Log out and log back in
2. Wait 5 minutes for processing
3. Check Settings → Billing for subscription status
4. Check email for payment confirmation
5. Contact support with payment receipt

</details>

<details>
<summary><strong>Credits not updating</strong></summary>

**Symptoms:** Used a feature but credit balance unchanged

**Solutions:**
1. Refresh the page
2. Check transaction history in Settings
3. Some actions don't use credits (see pricing page)
4. Contact support if credits were incorrectly deducted

</details>

---

## Still Need Help?

If none of these solutions work:

1. **Check status page:** [status.cariara.com](https://status.cariara.com)
2. **Search existing issues:** [GitHub Issues](https://github.com/schundu007/capra/issues)
3. **Email support:** support@cariara.com
4. **Join Discord:** Community help

When contacting support, include:
- Your account email
- What you were trying to do
- What happened instead
- Screenshots if applicable
- Browser/OS version
- Any error messages
