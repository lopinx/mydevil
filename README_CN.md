<div align="right">
   <strong>中文</strong> | <a href="README.md">English</a>
</div>

<div align="center">

<h1>🔄 Serv00/CT8 免费主机自动续签</h1>

<p>自动续签 Serv00 / CT8 免费主机账号的 GitHub Actions 工具</p>

[![License](https://img.shields.io/badge/license-WTFPL-blue)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green)](https://nodejs.org/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-✓-orange)](https://github.com/features/actions)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-v25-brightgreen)](https://pptr.dev/)

</div>

<hr/>

<div align="center">

🔗 **相关链接** &nbsp;|&nbsp;
[Serv00 登录](https://www.serv00.com/sign-in/) &nbsp;|&nbsp;
[Serv00 文档](https://docs.serv00.com/) &nbsp;|&nbsp;
[Serv00 社区](https://forum.serv00.com/) &nbsp;|&nbsp;
[CT8 登录](https://panel.ct8.pl/) &nbsp;|&nbsp;
[CT8 文档](https://pomoc.mydevil.net/) &nbsp;|&nbsp;
[CT8 社区](https://forum.ct8.pl/)

</div>

<hr/>

## ✨ 功能特点

| 特性 | 说明 |
|------|------|
| 🤖 **自动化登录** | 使用 Puppeteer 模拟浏览器自动登录面板 |
| 📅 **定时任务** | GitHub Actions 每月 1 号自动执行 |
| 🔔 **消息通知** | 支持 Telegram Bot 和企业微信推送登录结果 |
| 🔒 **安全存储** | 账号信息以 Secret 形式保存在 GitHub |
| 🌐 **多面板支持** | 兼容 panel1~panelN 所有 Serv00/CT8 面板 |

## 📋 使用方法

### 第一步：配置 GitHub Secrets

1. 进入 GitHub 仓库，点击右上角 **Settings** ⚙️
2. 左侧边栏找到 **Secrets and variables** → **Actions**
3. 点击 **New repository secret** 创建以下 Secret：

---

### 第二步：创建 `ACCOUNTS_JSON` Secret

```json
[
  { "username": "your_username", "password": "your_password", "panel": "panel3.serv00.com" },
  { "username": "your_username2", "password": "your_password2", "panel": "panel1.serv00.com" }
]
```

> 💡 **提示**：`panel` 参数为你的注册邮件中的面板地址，如 `panel3.serv00.com`

---

### 第三步（可选）：配置通知

如需登录结果推送，创建以下两个 Secret：

| Secret 名称 | 说明 | 示例 |
|-------------|------|------|
| `NOTIFY_TOKEN` | Telegram Bot Token（含 `:`），或企业微信群机器人 Key（不含 `:`） | `123456:ABC-DEF...` 或 `a1b2c3d4e5f6...` |
| `NOTIFY_ID` | Chat ID（Telegram），或成员手机号（企业微信 @提醒） | `123456789` 或 `13800138000` |

> 💡 系统自动识别通道类型：`NOTIFY_TOKEN` 含 `:` 则发送 Telegram；否则发送企业微信。

## 🛠️ 技术栈

- **运行时**: Node.js 20+
- **浏览器自动化**: [Puppeteer](https://pptr.dev/)
- **HTTP 请求**: [Axios](https://axios-http.com/)
- **调度引擎**: [GitHub Actions](https://github.com/features/actions)

## 📁 项目结构

```
mydevil/
├── src/
│   └── main.js          # 主程序入口
├── .github/
│   └── workflows/
│       └── login.yml    # GitHub Actions 配置
├── README.md
└── README_CN.md
```

## ⚠️ 注意事项

> **⚠️ 容量限制提醒**
>
> Serv00 虽有 10 年使用期，但日志文件无法清除。在存储空间有限的情况下，**不建议**运行产生大量日志的高流量服务或高频任务。

## 🔗 相关链接

- [Serv00 PHP 配置](https://docs.serv00.com/PHP/#php-version)
- [Memcached 配置](https://docs.serv00.com/Memcached/) — 启动命令：`memcached -s /usr/home/lopins/domains/buchmistrz.pl/memcached.sock -m 32 -d`
- [Redis 配置](https://docs.serv00.com/Memcached/)

---


<div align="center">

 Made with ❤️ by [lopinx](https://github.com/lopinx)

</div>
