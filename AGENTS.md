# AGENTS.md — Serv00/CT8 免费主机自动续签工具

## 项目概述

这是一个用于自动登录 Serv00/CT8 免费主机面板的工具，通过 Puppeteer 模拟浏览器登录并执行续期操作。项目使用 Node.js 编写，支持 GitHub Actions 定时任务调度。

## 目录结构

```
persistent/home/lopins/Documents/Codes/mydevil/
├── src\
│   └── main.js          # 主程序：Puppeteer 登录逻辑
├── .github\
│   └── workflows\
│       └── login.yml    # GitHub Actions 工作流配置
├── package.json         # 依赖配置
└── accounts.json        # 账号配置（已 .gitignore，不提交）
```

## 运行方式

### 本地运行
```bash
npm install
node src/main.js
```

### GitHub Actions（推荐）
- 触发方式：每月1号 13:14 UTC 自动运行，或手动触发
- 运行环境：ubuntu-latest，Node.js 20.x
- 需要配置 Secrets：`ACCOUNTS_JSON`、`NOTIFY_TOKEN`（可选）、`NOTIFY_ID`（可选）

## 账号配置格式

`accounts.json` 文件位于项目根目录，格式如下：
```json
[
  { "username": "xxx", "password": "xxx", "panel": "panel3.serv00.com" },
  { "username": "yyy", "password": "yyy", "panel": "panel1.serv00.com" }
]
```

> **注意**：`accounts.json` 已被 `.gitignore` 忽略，不可提交到仓库。

## 核心逻辑（src/main.js）

1. 读取 `accounts.json` 中的账号列表
2. 遍历每个账号，使用 Puppeteer 启动无头浏览器
3. 访问对应面板登录页，自动填充用户名/密码并提交
4. 检查登录状态，发送通知（Telegram 或企业微信，如配置了）
5. 每个账号登录后随机延迟 1-5 秒后继续下一个

## Puppeteer 配置

启动参数：
- `headless: false`（测试时可改为 true）
- 禁用沙箱、信息栏、自动化特征检测
- 忽略 HTTPS 错误
- 自定义视口（null）

## 技术栈

- **运行环境**：Node.js 20+
- **核心依赖**：
  - `puppeteer` — 浏览器自动化
  - `axios` — HTTP 请求（Telegram API）

## 已知限制

1. 项目为单文件脚本，无模块化结构
2. 无测试套件（package.json 中 test 脚本为空）
3. 账号凭据以明文存储在 accounts.json，需妥善保管
4. GitHub Actions 环境使用 xvfb 运行无图形界面浏览器

## 编码规范

- 使用 ES Module（`"type": "module"`）
- 文件路径使用 `path` 和 `fileURLToPath` 处理
- 时间输出同时提供 UTC 和北京时间（+8）
- 错误时发送通知（Telegram 或企业微信），包含错误信息

## 相关文档

- README_CN.md — 中文说明
