// 多位置截图：node tools/shot-at.js url name y1,y2,... [height]
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(process.env.TEMP, 'shots');

const url = process.argv[2];
const name = process.argv[3];
const ys = (process.argv[4] || '0').split(',').map(Number);
const h = parseInt(process.argv[5] || '900', 10);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: h });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 800));
  for (const y of ys) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT, `${name}-${y}.png`) });
  }
  console.log('ok', ys, await page.evaluate(() => document.body.scrollHeight));
  await browser.close();
})();
