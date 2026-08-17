import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { fileURLToPath } from 'url';

function formatToISO(date) {
    return date.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}Z/, '');
}

async function delayTime(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendTelegramMessage(token, chatId, message) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const data = { chat_id: chatId, text: message };
    await axios.post(url, data);
    console.log('Telegram 通知发送成功');
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
    console.log('企业微信通知发送成功');
}

async function sendNotifications(token, id, message) {
    const tasks = [];
    if (token && id) {
        const isWecom = !token.includes(':');
        if (isWecom) {
            tasks.push(sendWecomMessage(token, id, message));
        } else {
            tasks.push(sendTelegramMessage(token, id, message));
        }
    }
    if (tasks.length > 0) {
        await Promise.all(tasks);
    }
}

(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, '../accounts.json'), 'utf-8'));
    const notifyToken = process.env.NOTIFY_TOKEN;
    const notifyId = process.env.NOTIFY_ID;

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

        let url = `https://${panel}/login/?next=/`;

        try {
            await page.goto(url);

            const usernameInput = await page.$('input[name="username"]');
            if (usernameInput) {
                await usernameInput.click({ clickCount: 3 });
                await usernameInput.press('Backspace');
            }
            await page.type('input[name="username"]', username);
            await page.type('input[name="password"]', password);

            const loginButton = await page.$('div.login-form__button button[type="submit"]');

            if (!loginButton) throw new Error('无法找到登录按钮');
            await loginButton.click();

            await page.waitForNavigation();

            const isLoggedIn = await page.evaluate(() => {
                const logoutButton = document.querySelector('a[href="/logout/"]');
                return logoutButton !== null;
            });

            if (isLoggedIn) {
                const nowUtc = formatToISO(new Date());
                const nowBeijing = formatToISO(new Date(new Date().getTime() + 8 * 60 * 60 * 1000));
                const successMessage = `账号 ${username} 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）登录成功！`;
                await sendNotifications(notifyToken, notifyId, successMessage);
            } else {
                const failMessage = `账号 ${username} 登录失败，请检查账号和密码是否正确。`;
                await sendNotifications(notifyToken, notifyId, failMessage);
            }
        } catch (error) {
            const errorMessage = `账号 ${username} 登录时出现错误: ${error.message}`;
            await sendNotifications(notifyToken, notifyId, errorMessage);
        } finally {
            await page.close();
            await browser.close();
            const delay = Math.floor(Math.random() * 5000) + 1000;
            await delayTime(delay);
        }
    }
})();
