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
    if (!token || !id) return;
    const isWecom = !token.includes(':');
    const sendFn = isWecom ? sendWecomMessage : sendTelegramMessage;
    await sendFn(token, id, message);
}

(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, '../accounts.json'), 'utf-8'));
    const notifyToken = process.env.NOTIFY_TOKEN;
    const notifyId = process.env.NOTIFY_ID;

    const results = [];

    for (const account of accounts) {
        const { username, password, panel } = account;

        const browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-infobars',
                '--disable-blink-features=AutomationControlled'
            ],
            defaultViewport: null,
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();

        const url = `https://${panel}/login/?next=/`;

        try {
            await page.goto(url);

            const usernameInput = await page.$('input[name="username"]');
            if (usernameInput) {
                await usernameInput.click({ clickCount: 3 });
                await page.keyboard.press('Backspace');
            }
            await page.type('input[name="username"]', username);
            await page.type('input[name="password"]', password);

            const loginButton = await page.$('div.login-form__button button[type="submit"]');
            if (!loginButton) throw new Error('无法找到登录按钮');
            await loginButton.click();
            await page.waitForNavigation();

            const isLoggedIn = await page.evaluate(() =>
                document.querySelector('a[href="/logout/"]') !== null
            );

            results.push(`${username}: ${isLoggedIn ? '登录成功' : '登录失败'}`);
        } catch (error) {
            results.push(`${username}: 错误 - ${error.message}`);
        } finally {
            await page.close();
            await browser.close();
            await new Promise(resolve => setTimeout(resolve, Math.random() * 4000 + 1000));
        }
    }

    const message = `共 ${results.length} 个账号\n${results.join('\n')}`;
    await sendNotifications(notifyToken, notifyId, message);
})();
