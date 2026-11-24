// 本地视觉校验脚本（仅开发用，不参与构建）
const puppeteer = require('puppeteer-core');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.env.TEMP + '/shots/';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('pageerror', (e) => errors.push('JS: ' + e.message));
  page.on('requestfailed', (r) => errors.push('FAIL: ' + r.url().slice(0, 90)));

  await page.goto('http://localhost:4000/', { waitUntil: 'networkidle2', timeout: 60000 });

  const info = await page.evaluate(() => {
    const r = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), height: Math.round(b.height), width: Math.round(b.width) };
    };
    return {
      vh: window.innerHeight,
      banner: r('section.banner'),
      bannerTitle: r('.banner-title'),
      firstCard: r('#primary .card'),
      sidebar: r('#leftbar'),
      leftbarPart1: r('#leftbar_part1'),
      bodyFont: getComputedStyle(document.body).fontFamily,
      titleFont: getComputedStyle(document.querySelector('.banner-title')).fontFamily,
      postCardCount: document.querySelectorAll('#primary .card').length,
      yearCard: !!document.getElementById('year_progress_card'),
    };
  });

  console.log(JSON.stringify(info, null, 2));
  console.log('--- errors ---');
  console.log(errors.slice(0, 12).join('\n') || '(none)');

  await page.screenshot({ path: OUT + 'v-home.png' });
  await page.screenshot({ path: OUT + 'v-home-full.png', fullPage: true });

  await page.goto('http://localhost:4000/2026/11/24/how-this-blog-works/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: OUT + 'v-post.png' });
  await page.goto('http://localhost:4000/archives/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: OUT + 'v-archive.png' });

  // 夜间模式
  await page.goto('http://localhost:4000/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.setItem('Argon_Enable_Dark_Mode', 'true'));
  await page.reload({ waitUntil: 'networkidle2' });
  await page.evaluate(() => { if (window.setDarkmode) setDarkmode(true); });
  await page.screenshot({ path: OUT + 'v-dark.png' });

  // 移动端
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => localStorage.removeItem('Argon_Enable_Dark_Mode'));
  await page.goto('http://localhost:4000/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: OUT + 'v-mobile.png' });

  await browser.close();
})();
