const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:1000});
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await new Promise(r=>setTimeout(r,5000));
 const r=await p.evaluate(()=>{
   const btns=[...document.querySelectorAll('#twikoo button')].map(b=>({cls:b.className, txt:b.textContent.trim().slice(0,10), bg:getComputedStyle(b).backgroundColor}));
   const inputs=[...document.querySelectorAll('#twikoo input, #twikoo textarea')].slice(0,4).map(i=>({cls:i.className, ph:i.placeholder}));
   return {btns, inputs, twikooColor:getComputedStyle(document.documentElement).getPropertyValue('--themecolor')};
 });
 console.log(JSON.stringify(r,null,1));
 await b.close();
})();
