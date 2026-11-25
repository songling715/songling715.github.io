const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.goto('about:blank');
 const r=await p.evaluate(async ()=>{
   const s=document.createElement('script');
   s.src='http://127.0.0.1:4101/vendor/twikoo/twikoo.min.js';
   const done=new Promise(res=>{s.onload=()=>res('load');s.onerror=()=>res('error');});
   document.head.appendChild(s);
   await done;
   await new Promise(r=>setTimeout(r,300));
   return {keys: window.twikoo?Object.keys(window.twikoo):null, init: typeof (window.twikoo&&window.twikoo.init), ver: window.twikoo&&window.twikoo.version};
 });
 console.log(JSON.stringify(r,null,1));
 await b.close();
})();
