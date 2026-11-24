const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto('http://127.0.0.1:4100/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await p.click('#navbar_search_container');
  await p.type('#navbar_search_input', '博客', { delay: 40 });
  await new Promise(r => setTimeout(r, 600));
  const results = await p.$$eval('.nsr-item', els => els.map(e => e.getAttribute('href')));
  await p.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 1500));
  const urlAfter = p.url();
  // pjax 到归档页，检查菜单图标是否还在
  await p.goto('http://127.0.0.1:4100/', { waitUntil: 'networkidle2' });
  await p.evaluate(() => { const a = [...document.querySelectorAll('#navbar_global .nav-link')].find(x => x.textContent.includes('文章')); a && a.click(); });
  await new Promise(r => setTimeout(r, 1800));
  const afterPjax = await p.evaluate(() => ({
    url: location.href,
    icons: document.querySelectorAll('#navbar_global .nav-link-inner--text i.fa').length,
    cal: !!document.querySelector('#cal_grid .cal-d'),
    progress: document.getElementById('yp_pct') ? document.getElementById('yp_pct').textContent : null,
    search: !!document.getElementById('navbar_search_container')
  }));
  console.log(JSON.stringify({ results, urlAfter, afterPjax, errs }, null, 1));
  await b.close();
})();
