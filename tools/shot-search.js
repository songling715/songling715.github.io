// 搜索交互截图：node tools/shot-search.js
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(process.env.TEMP, 'shots');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=2'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:4100/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT, 'nav-closed.png'), clip: { x: 900, y: 0, width: 540, height: 90 } });
  await page.click('#navbar_search_container');
  await new Promise((r) => setTimeout(r, 500));
  await page.type('#navbar_search_input', '博客', { delay: 80 });
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: path.join(OUT, 'nav-open.png'), clip: { x: 640, y: 0, width: 800, height: 420 } });
  const info = await page.evaluate(() => {
    const b = document.querySelector('#navbar_search_input_container .input-group').getBoundingClientRect();
    return { box: { w: Math.round(b.width), h: Math.round(b.height) }, results: document.querySelectorAll('.nsr-item').length };
  });
  console.log(info);
  await browser.close();
})();
