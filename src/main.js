import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { fileURLToPath } from 'url';

async function sendTelegramMessage(token, chatId, message) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const data = { chat_id: chatId, text: message };
    await axios.post(url, data);
}

async function sendWecomMessage(token, id, message) {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${token}`;
    const data = {
        msgtype: 'text',
        text: {
            content: id ? `@${id} ${message}` : message
        }
    };
    await axios.post(url, data);
}

async function sendNotifications(token, id, message) {
    if (!token) return;
    const isWecom = !token.includes(':');
    if (!isWecom && !id) return;
    const sendFn = isWecom ? sendWecomMessage : sendTelegramMessage;
    await sendFn(token, id, message);
}

(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, '../accounts.json'), 'utf-8'));
    const notifyToken = process.env.NOTIFY_TOKEN;
    const notifyId = process.env.NOTIFY_ID;

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-infobars',
            '--disable-blink-features=AutomationControlled',
            '--disable-popup-blocking',
            '--disable-notifications',
        ],
        defaultViewport: null,
        ignoreHTTPSErrors: true
    });

    const results = [];

    for (const account of accounts) {
        const { username, password, panel } = account;
        const page = await browser.newPage();
        const url = `https://${panel}/login/?next=/`;

        try {
            await page.goto(url);
            await page.type('input[name="username"]', username);
            await page.type('input[name="password"]', password);

            const loginButton = await page.$('div.login-form__button button[type="submit"]');
            if (!loginButton) throw new Error('无法找到登录按钮');
            await loginButton.click();
            await page.waitForNavigation();

            const isLoggedIn = await page.evaluate(() =>
                document.querySelector('a[href="/logout/"]') !== null
            );

            results.push(`${username}: ${isLoggedIn ? 'Success' : 'Failed'}`);
        } catch (error) {
            results.push(`${username}: Error - ${error.message}`);
        } finally {
            await page.close();
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        }
    }

    await browser.close();

    const isWecom = !notifyToken.includes(':');
    const success = results.filter(r => r.includes('Success')).length;
    const fail = results.length - success;
    const sep = '━'.repeat(32);
    const lines = isWecom
        ? [
              `🔄 Serv00/CT8 自动续签报告`,
              `📊 共 ${results.length} 个账号 · ✅ 成功 ${success} · ❌ 失败 ${fail}`,
              sep,
              ...accounts.map((a, i) => {
                  const r = results[i];
                  const icon = r.includes('成功') ? '✅' : r.includes('失败') ? '❌' : '⚠️';
                  return `${icon} ${a.username}@${a.panel}`;
              }),
              sep,
              `⏰ ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`,
          ].join('\n')
        : [
              `🔄 Serv00/CT8 Auto Renewal Report`,
              `📊 Total: ${results.length} · ✅ Success: ${success} · ❌ Failed: ${fail}`,
              sep,
              ...accounts.map((a, i) => {
                  const r = results[i];
                  const icon = r.includes('Success') ? '✅' : r.includes('Failed') ? '❌' : '⚠️';
                  return `${icon} ${a.username}@${a.panel}`;
              }),
              sep,
              `⏰ ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })}`,
          ].join('\n');
    await sendNotifications(notifyToken, notifyId, lines);
})();
