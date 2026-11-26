// 检查真实资源加载、工具栏、切换人物、主题、隐藏与恢复；不提交评论。
const puppeteer = require('puppeteer-core');
const path = require('path');
const assert = require('node:assert/strict');
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
  try {
    const page = await browser.newPage();
    const errors = [], models = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.url().includes('/model/') && r.url().endsWith('index.json')) models.push({ url: r.url(), status: r.status() }); });
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(process.argv[2] || 'http://127.0.0.1:4110/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#waifu-tool-about', { timeout: 60000 });
    await page.waitForFunction(() => document.getElementById('waifu').getBoundingClientRect().bottom > 500);
    await page.waitForFunction(() => performance.getEntriesByType('resource').some(r => r.name.includes('/model/') && r.name.includes('.png')), { timeout: 60000 });
    const before = await page.evaluate(() => ({ count: document.querySelectorAll('#waifu').length, buttons: [...document.getElementById('waifu-tool').children].map(e => ({ id: e.id, label: e.getAttribute('aria-label'), icon: getComputedStyle(e, '::before').backgroundImage })), opacity: getComputedStyle(document.getElementById('waifu-tool')).opacity, model: localStorage.getItem('modelId'), dark: document.documentElement.classList.contains('darkmode') }));
    assert.equal(before.count, 1);
    assert.equal(before.buttons.length, 5);
    assert.ok(before.buttons.every(b => b.icon !== 'none' && b.label));
    await page.hover('#waifu');
    await page.waitForFunction(() => Number(getComputedStyle(document.getElementById('waifu-tool')).opacity) > .99);
    await page.screenshot({ path: path.join(process.env.TEMP, 'shots', 'l2d-hover.png'), clip: { x: 0, y: 500, width: 380, height: 400 } });
    await page.click('#waifu-tool-night');
    assert.notEqual(await page.evaluate(() => document.documentElement.classList.contains('darkmode')), before.dark);
    await page.click('#waifu-tool-switch-model');
    await page.waitForFunction(old => localStorage.getItem('modelId') !== old, {}, before.model);
    const changedModel = await page.evaluate(() => localStorage.getItem('modelId'));
    await page.click('#waifu-tool-quit');
    await page.waitForFunction(() => getComputedStyle(document.getElementById('waifu')).display === 'none', { timeout: 10000 });
    await page.evaluate(() => document.getElementById('waifu-toggle').click());
    await page.waitForFunction(() => getComputedStyle(document.getElementById('waifu')).display !== 'none');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#waifu-tool-about', { timeout: 60000 });
    assert.equal(await page.evaluate(() => localStorage.getItem('modelId')), changedModel);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ before, changedModel, models, themeToggle: true, hideRestore: true, persistsOnReload: true, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
