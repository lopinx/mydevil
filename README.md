<div align="right">
   <a href="README_CN.md">中文</a> | <strong>English</strong>
</div>

<div align="center">

<h1>🔄 Serv00/CT8 Free Host Auto Renewal</h1>

<p>GitHub Actions tool for auto-renewing Serv00 / CT8 free hosting accounts</p>

[![License](https://img.shields.io/badge/license-WTFPL-blue)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green)](https://nodejs.org/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-✓-orange)](https://github.com/features/actions)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-v25-brightgreen)](https://pptr.dev/)

</div>

<hr/>

<div align="center">

🔗 **Links** &nbsp;|&nbsp;
[Serv00 Login](https://www.serv00.com/sign-in/) &nbsp;|&nbsp;
[Serv00 Docs](https://docs.serv00.com/) &nbsp;|&nbsp;
[Serv00 Forum](https://forum.serv00.com/) &nbsp;|&nbsp;
[CT8 Login](https://panel.ct8.pl/) &nbsp;|&nbsp;
[CT8 Docs](https://pomoc.mydevil.net/) &nbsp;|&nbsp;
[CT8 Forum](https://forum.ct8.pl/)

</div>

<hr/>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **Auto Login** | Uses Puppeteer to automate browser login to control panels |
| 📅 **Scheduled Tasks** | GitHub Actions runs automatically on the 1st of every month |
| 🔔 **Notifications** | Supports Telegram Bot and WeChat Work (Enterprise WeChat) to push login results |
| 🔒 **Secure Storage** | Account info stored as GitHub Secrets |
| 🌐 **Multi-Panel Support** | Compatible with all panel1~panelN Serv00/CT8 panels |

## 🛠️ Local Development

### Prerequisites

- Node.js 22+
- npm or pnpm

### Setup

```bash
git clone <repository-url>
cd mydevil
npm install
```

### Create accounts.json

Create a file `accounts.json` in the project root:

```json
[
  { "username": "your_username", "password": "your_password", "panel": "panel3.serv00.com" }
]
```

> ⚠️ `accounts.json` is in `.gitignore` and will not be committed.

### Run Locally

```bash
node src/main.js
```

Or with notification support:

```bash
# Telegram
NOTIFY_TOKEN="123456:ABC-DEF..." NOTIFY_ID="123456789" node src/main.js

# Enterprise WeChat
NOTIFY_TOKEN="a1b2c3d4e5f6..." NOTIFY_ID="13800138000" node src/main.js
```

> 💡 The browser opens visually by default (`headless: false`). For server/headless environments, set the `HEADLESS` env var (not yet supported — edit `src/main.js` to change `headless: false` → `true`).

## 📋 Usage

### Step 1: Configure GitHub Secrets

1. Go to your GitHub repository, click **Settings** ⚙️ in the top right corner
2. In the sidebar, find **Secrets and variables** → **Actions**
3. Click **New repository secret**

---

### Step 2: Create `ACCOUNTS_JSON` Secret

```json
[
  { "username": "your_username", "password": "your_password", "panel": "panel3.serv00.com" },
  { "username": "your_username2", "password": "your_password2", "panel": "panel1.serv00.com" }
]
```

> 💡 **Tip**: The `panel` parameter is the panel address from your registration email, e.g., `panel3.serv00.com`

---

### Step 3 (Optional): Configure Notification

To receive login result push notifications via Telegram or Enterprise WeChat, create the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `NOTIFY_TOKEN` | Telegram Bot Token (contains `:`), or WeChat Work Webhook Key (no `:`) | `123456:ABC-DEF...` or `a1b2c3d4e5f6...` |
| `NOTIFY_ID` | Chat ID (Telegram), or member mobile number (Enterprise WeChat @mention) | `123456789` or `13800138000` |

> 💡 The system auto-detects the channel: if `NOTIFY_TOKEN` contains `:`, it sends to Telegram; otherwise it sends to Enterprise WeChat.

## 🛠️ Tech Stack

- **Runtime**: Node.js 22+
- **Browser Automation**: [Puppeteer](https://pptr.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Scheduler**: [GitHub Actions](https://github.com/features/actions)

## 📁 Project Structure

```
mydevil/
├── src/
│   └── main.js          # Main entry point
├── .github/
│   └── workflows/
│       └── login.yml    # GitHub Actions config
├── README.md
└── README_CN.md
```

## ⚠️ Important Notes

> **⚠️ Storage Limit Reminder**
>
> Although Serv00 offers a 10-year usage period, log files cannot be cleared. Under storage constraints, **avoid** running high-traffic services or frequent tasks that generate large log files.

## 🔗 Related Links

- [Serv00 PHP Config](https://docs.serv00.com/PHP/#php-version)
- [Memcached Config](https://docs.serv00.com/Memcached/) — Start command: `memcached -s /usr/home/lopins/domains/buchmistrz.pl/memcached.sock -m 32 -d`
- [Redis Config](https://docs.serv00.com/Memcached/)

---

<div align="center">

Made with ❤️ by [lopinx](https://github.com/lopinx)

</div>
