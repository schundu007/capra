# Getting Started with Ascend

This guide will help you get up and running with Ascend in minutes.

---

## Table of Contents

1. [Creating Your Account](#creating-your-account)
2. [Web App Quick Start](#web-app-quick-start)
3. [Desktop App Installation](#desktop-app-installation)
4. [Your First Problem](#your-first-problem)
5. [Understanding the Interface](#understanding-the-interface)

---

## Creating Your Account

### Step 1: Visit the Sign Up Page

Navigate to [capra.cariara.com](https://capra.cariara.com) and click **Sign Up**.

![Sign Up Page](../images/signup-page.png)
*The sign up page with OAuth options*

### Step 2: Choose Your Sign-In Method

You can sign up using:

- **Email & Password** — Traditional account creation
- **Google OAuth** — One-click sign in with your Google account
- **GitHub OAuth** — Sign in with your GitHub account

### Step 3: Verify Your Email

If you signed up with email, check your inbox for a verification link.

> **💡 Tip:** Check your spam folder if you don't see the email within a few minutes.

### Step 4: Complete Your Profile

After verification, you'll be directed to complete your profile:

- Display name
- Target companies (optional)
- Experience level

---

## Web App Quick Start

### Accessing the Dashboard

After signing in, you'll see the main dashboard:

![Dashboard Overview](../images/dashboard-overview.png)
*The main Ascend dashboard showing all features*

### Dashboard Sections

| Section | Purpose |
|---------|---------|
| **Problem Input** | Enter coding problems or URLs |
| **Mode Selector** | Switch between Coding, System Design, Behavioral |
| **Solution Panel** | View AI-generated solutions |
| **Settings** | Configure AI provider and preferences |

### Quick Actions

1. **Paste a Problem** — Copy any coding problem and paste it directly
2. **Enter a URL** — Paste LeetCode/HackerRank URLs for automatic extraction
3. **Upload Screenshot** — Take a screenshot of a problem for analysis

---

## Desktop App Installation

> **📋 Requirement:** Desktop app requires an **Elite** subscription.

### macOS Installation

1. **Download the Installer**
   - Log in to your account at [capra.cariara.com](https://capra.cariara.com)
   - Navigate to **Account → Downloads**
   - Click **Download for macOS**

2. **Install the Application**
   ```
   1. Open the downloaded .dmg file
   2. Drag Ascend to your Applications folder
   3. Open Ascend from Applications
   ```

3. **Grant Permissions**

   On first launch, macOS will ask for permissions:

   - **Accessibility** — Required for keyboard shortcuts
   - **Screen Recording** — Required for screenshot capture
   - **Microphone** — Required for Interview Assistant

   ![macOS Permissions](../images/macos-permissions.png)
   *Grant the required permissions for full functionality*

### Windows Installation

1. **Download the Installer**
   - Log in at [capra.cariara.com](https://capra.cariara.com)
   - Navigate to **Account → Downloads**
   - Click **Download for Windows**

2. **Run the Installer**
   ```
   1. Double-click the .exe installer
   2. Follow the installation wizard
   3. Launch Ascend from Start Menu
   ```

3. **Windows Defender**

   If Windows Defender blocks the installation:
   - Click "More info"
   - Click "Run anyway"

   > The app is signed, but may show warnings on first download.

### Device Licensing

Your Elite subscription allows **one device** at a time:

- First device is automatically registered on sign-in
- To switch devices, deactivate the current one from **Settings → Devices**
- Contact support if you need to reset your device license

![Device Management](../images/device-management.png)
*Manage your registered devices from Settings*

---

## Your First Problem

Let's solve your first coding problem with Ascend!

### Step 1: Select Coding Mode

Make sure **Coding** mode is selected in the mode switcher.

![Mode Selector](../images/mode-selector.png)
*Select Coding mode for algorithm problems*

### Step 2: Enter a Problem

You have three options:

#### Option A: Paste Problem Text
```
Copy the problem description and paste it into the input area.
```

#### Option B: Enter a URL
```
Paste a LeetCode or HackerRank URL:
https://leetcode.com/problems/two-sum/
```

#### Option C: Upload Screenshot
```
Click the screenshot button or use Cmd+Shift+S (Mac) / Ctrl+Shift+S (Windows)
```

### Step 3: Generate Solution

Click **Solve** or press `Enter` to generate a solution.

![Solving Animation](../images/solving-animation.png)
*AI analyzing and solving the problem*

### Step 4: Review the Solution

The solution panel will show:

- **Code** — Complete, working solution
- **Explanation** — Step-by-step breakdown
- **Complexity** — Time and space analysis
- **Follow-up** — Ask clarifying questions

![Solution Panel](../images/solution-panel.png)
*Complete solution with code, explanation, and complexity analysis*

### Step 5: Ask Follow-up Questions

Have questions about the solution? Use the follow-up input:

```
"Why did you use a hashmap instead of nested loops?"
"Can you optimize this for space complexity?"
"How would this change for a sorted array?"
```

---

## Understanding the Interface

### Main Window Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Mode: Coding ▼]  [Provider: Claude ▼]  [Settings ⚙️]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │                     │  │                             │  │
│  │   Problem Input     │  │    Solution Panel           │  │
│  │                     │  │                             │  │
│  │   - Text input      │  │    - Code display           │  │
│  │   - URL detection   │  │    - Syntax highlighting    │  │
│  │   - Screenshot      │  │    - Copy button            │  │
│  │                     │  │    - Explanation tabs       │  │
│  │                     │  │                             │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Follow-up: "Ask a question about the solution..."  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Solve problem |
| `Cmd/Ctrl + K` | Focus problem input |
| `Cmd/Ctrl + Shift + S` | Take screenshot |
| `Cmd/Ctrl + Shift + H` | Toggle stealth mode (Desktop) |
| `Cmd/Ctrl + ,` | Open settings |

### Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green dot | Connected, ready |
| 🟡 Yellow dot | Processing request |
| 🔴 Red dot | Error or disconnected |
| ⚡ Lightning | Fast mode enabled |

---

## Next Steps

Now that you're set up, explore these guides:

- [Coding Interview Guide](../features/coding-interview.md) — Master algorithm problems
- [System Design Guide](../features/system-design.md) — Ace architecture interviews
- [Company Prep Guide](../features/company-prep.md) — Prepare for specific companies
- [Interview Assistant](../features/interview-assistant.md) — Real-time interview help

---

## Troubleshooting

### Common Issues

<details>
<summary><strong>Can't sign in with OAuth</strong></summary>

1. Clear your browser cookies
2. Try a different browser
3. Disable browser extensions temporarily
4. Contact support if the issue persists

</details>

<details>
<summary><strong>Desktop app won't start</strong></summary>

1. Ensure you have an active Elite subscription
2. Check your internet connection
3. Try reinstalling the application
4. Check if your device license is active

</details>

<details>
<summary><strong>Solutions are loading slowly</strong></summary>

1. Check your internet connection
2. Try switching AI providers (Claude ↔ GPT)
3. Enable "Fast mode" in settings
4. Clear the application cache

</details>

[More Troubleshooting →](../reference/troubleshooting.md)
