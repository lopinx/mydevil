import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { fileURLToPath } from 'url';

async function sendTelegramMessage(token, chatId, message) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, { chat_id: chatId, text: message });
}

async function sendWecomMessage(token, id, message) {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${token}`;
    await axios.post(url, {
        msgtype: 'text',
        text: { content: id ? `@${id} ${message}` : message }
    });
}

async function sendNotifications(token, id, message) {
    if (!token) return;
    const isWecom = !token.includes(':');
    if (!isWecom && !id) return;
    const fn = isWecom ? sendWecomMessage : sendTelegramMessage;
    await fn(token, id, message);
}

function buildMessage(accounts, results, isWecom) {
    const success = results.filter(r => r.includes('Success')).length;
    const fail = results.length - success;
    const sep = '━'.repeat(10);
    const details = accounts.map((a, i) => {
        const icon = results[i].includes('Success') ? '✅' : results[i].includes('Failed') ? '❌' : '⚠️';
        return `${icon} ${a.username} · ${a.panel}`;
    });
    const date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
    return isWecom
        ? [
              `🔄 Serv00/CT8 自动续签报告`,
              `📊 共 ${results.length} 账号 · ✅ 成功 ${success} · ❌ 失败 ${fail}`,
              sep,
              ...details,
              sep,
              `⏰ ${date}`,
          ].join('\n')
        : [
              `🔄 Serv00/CT8 Auto Renewal Report`,
              `📊 ${results.length} accounts · ✅ ${success} ok · ❌ ${fail} fail`,
              sep,
              ...details,
              sep,
              `⏰ ${date}`,
          ].join('\n');
}

(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, '../accounts.json'), 'utf-8'));
    const notifyToken = process.env.NOTIFY_TOKEN;
    const notifyId = process.env.NOTIFY_ID;

    const browser = await puppeteer.launch({
        headless: true,
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

    const cdp = await browser.newPage();
    const client = await cdp.createCDPSession();
    client.on('Page.javascriptDialogOpening', async () => {
        await client.send('Page.handleJavaScriptDialog', { accept: false });
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
            if (!loginButton) throw new Error('Login button not found');
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
    const message = buildMessage(accounts, results, isWecom);
    await sendNotifications(notifyToken, notifyId, message);
})();
