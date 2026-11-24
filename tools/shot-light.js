const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(process.env.TEMP, 'shots');
const url = process.argv[2], name = process.argv[3], ys = (process.argv[4] || '0').split(',').map(Number);
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.evaluateOnNewDocument(() => sessionStorage.setItem('Argon_Enable_Dark_Mode', 'false'));
  await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 900));
  for (const y of ys) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await new Promise((r) => setTimeout(r, 500));
    await p.screenshot({ path: path.join(OUT, `${name}-${y}.png`) });
  }
  console.log('ok');
  await b.close();
})();
