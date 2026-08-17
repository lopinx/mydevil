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
    const data = {
        chat_id: chatId,
        text: message
    };
    try {
        await axios.post(url, data);
        console.log('Telegram 通知发送成功');
    } catch (error) {
        console.error('Telegram 消息发送失败:', error.message);
    }
}

async function sendWecomMessage(webhookUrl, message) {
    const url = `${webhookUrl}`;
    const data = {
        msgtype: 'text',
        text: {
            content: message
        }
    };
    try {
        await axios.post(url, data);
        console.log('企业微信通知发送成功');
    } catch (error) {
        console.error('企业微信消息发送失败:', error.message);
    }
}

async function sendNotification(type, token, chatId, webhookUrl, message) {
    if (type === 'telegram' && token && chatId) {
        await sendTelegramMessage(token, chatId, message);
    } else if (type === 'wecom' && webhookUrl) {
        await sendWecomMessage(webhookUrl, message);
    }
}

(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, '../accounts.json'), 'utf-8'));
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const wecomWebhookUrl = process.env.WECOM_WEBHOOK_URL;

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
                const nowBeijing = formatToISO(new Date(new Date().getTime() + 8 * 60 * 60 * 1000)); // 北京时间东8区
                const successMessage = `账号 ${username} 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）登录成功！`;
                await sendNotification('telegram', telegramToken, telegramChatId, wecomWebhookUrl, successMessage);
                await sendNotification('wecom', null, null, wecomWebhookUrl, successMessage);
            } else {
                const failMessage = `账号 ${username} 登录失败，请检查账号和密码是否正确。`;
                await sendNotification('telegram', telegramToken, telegramChatId, wecomWebhookUrl, failMessage);
                await sendNotification('wecom', null, null, wecomWebhookUrl, failMessage);
            }
        } catch (error) {
            const errorMessage = `账号 ${username} 登录时出现错误: ${error.message}`;
            await sendNotification('telegram', telegramToken, telegramChatId, wecomWebhookUrl, errorMessage);
            await sendNotification('wecom', null, null, wecomWebhookUrl, errorMessage);
        } finally {
            await page.close();
            await browser.close();
            const delay = Math.floor(Math.random() * 5000) + 1000; // 随机延时1秒到5秒之间
            await delayTime(delay);
        }
    }
})();