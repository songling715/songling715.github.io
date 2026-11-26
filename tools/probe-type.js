const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 p.on('console',m=>console.log('LOG:',m.text().slice(0,150)));
 await p.evaluateOnNewDocument(()=>{
   // 尽早观察
   document.addEventListener('DOMContentLoaded',()=>{
     const t=document.querySelector('.banner-title[data-text]');
     console.log('DOMContentLoaded: inner=', JSON.stringify(t?.querySelector('.banner-title-inner')?.textContent), 'fixed=', t?.getAttribute('data-typing-fixed'));
   },{once:true});
 });
 await p.setViewport({width:1440,height:900});
 await p.goto('http://127.0.0.1:4102/',{waitUntil:'domcontentloaded'});
 for(const ms of [100,300,600,1000,2000]){
   await new Promise(r=>setTimeout(r,ms===100?100:ms-100));
   const t=await p.evaluate(()=>document.querySelector('.banner-title-inner')?.textContent||'');
   console.log(ms+'ms:', JSON.stringify(t), 'len=', t.length);
 }
 await b.close();
})();
