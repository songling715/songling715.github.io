const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 p.on('pageerror',e=>console.log('PAGEERR:', e.message));
 p.on('console',m=>{ if(m.type()==='error') console.log('CONSOLE:', m.text().slice(0,300)); });
 await p.goto('http://127.0.0.1:4101/404.html',{waitUntil:'domcontentloaded'});
 const r=await p.evaluate(async ()=>{
   const s=document.createElement('script');
   s.src='/vendor/twikoo/twikoo.min.js';
   const done=new Promise(res=>{s.onload=()=>res('load');s.onerror=(e)=>res('error');});
   document.head.appendChild(s);
   await done; await new Promise(r=>setTimeout(r,200));
   return {tw: typeof window.twikoo, keys: window.twikoo?Object.keys(window.twikoo).slice(0,5):null};
 });
 console.log(JSON.stringify(r));
 await b.close();
})();
