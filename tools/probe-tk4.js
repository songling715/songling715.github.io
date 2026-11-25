const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await new Promise(r=>setTimeout(r,2500));
 const r=await p.evaluate(()=>({
   keys: window.twikoo ? Object.keys(window.twikoo) : null,
   kind: typeof window.twikoo,
   proto: window.twikoo ? Object.getOwnPropertyNames(window.twikoo) : null,
   hasInit: window.twikoo && typeof window.twikoo.init,
   syms: window.twikoo ? Object.getOwnPropertySymbols(window.twikoo).map(String) : null
 }));
 console.log(JSON.stringify(r,null,1));
 await b.close();
})();
