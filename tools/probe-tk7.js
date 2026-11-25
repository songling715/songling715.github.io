const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 p.on('pageerror',e=>console.log('PAGEERR:', e.message.slice(0,200)));
 p.on('console',m=>{ const t=m.text(); if(t.includes('twikoo')||t.includes('Twikoo')) console.log(m.type().toUpperCase()+':', t.slice(0,250)); });
 await p.goto(process.argv[2],{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,4000));
 const r=await p.evaluate(async ()=>{
   // 手动再加载一次，看能否成功
   const before = {tw: typeof window.twikoo, keys: window.twikoo?Object.keys(window.twikoo).slice(0,6):null};
   delete window.twikoo;
   const s=document.createElement('script');
   s.src='/vendor/twikoo/twikoo.min.js';
   const done=new Promise(res=>{s.onload=()=>res('load');s.onerror=()=>res('error');});
   document.head.appendChild(s);
   await done; await new Promise(r=>setTimeout(r,200));
   return {before, after: {tw: typeof window.twikoo, keys: window.twikoo?Object.keys(window.twikoo).slice(0,6):null}};
 });
 console.log(JSON.stringify(r,null,1));
 await b.close();
})();
