const puppeteer = require('puppeteer-core');
const path = require('path');
const OUT = path.join(process.env.TEMP, 'shots');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(process.argv[2] || 'http://127.0.0.1:4100/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));
  await p.screenshot({ path: path.join(OUT, 'm-0.png') });
  await p.evaluate(() => window.scrollTo(0, 800));
  await new Promise((r) => setTimeout(r, 500));
  await p.screenshot({ path: path.join(OUT, 'm-800.png') });
  console.log('ok');
  await b.close();
})();
