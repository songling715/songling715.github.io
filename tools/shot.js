// 本地截图（仅开发用）：node tools/shot.js [url] [name] [height]
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://127.0.0.1:4100/';
const name = process.argv[3] || 'shot';
const h = parseInt(process.argv[4] || '900', 10);
const OUT = path.join(process.env.TEMP, 'shots');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: h });
  const errors = [];
  page.on('pageerror', (e) => errors.push('JS: ' + e.message));
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT, name + '-top.png') });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: path.join(OUT, name + '-bottom.png') });
  console.log('saved', path.join(OUT, name), errors);
  await browser.close();
})();
