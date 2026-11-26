const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 p.on('pageerror',e=>console.log('PAGEERR:', e.message));
 p.on('console',m=>{ if(m.type()==='error') console.log('CONSOLE-ERR:', m.text().slice(0,300)); });
 await p.goto('http://127.0.0.1:4102/',{waitUntil:'networkidle2'});
 await new Promise(r=>setTimeout(r,1500));
 console.log('检查:', await p.evaluate(()=>({
   hasScript: !!document.getElementById('site-scripts'),
   hasSearch: !!document.getElementById('navbar_search_container'),
   hasArrow: !!document.getElementById('banner_scroll_down'),
   boot: typeof window.__siteBoot,
   twikoo: typeof window.twikoo
 })));
 await b.close();
})();
