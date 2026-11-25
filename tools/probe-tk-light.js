const puppeteer=require('puppeteer-core');
const path=require('path');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 await p.evaluateOnNewDocument(()=>sessionStorage.setItem('Argon_Enable_Dark_Mode','false'));
 await p.setViewport({width:1440,height:1000});
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await p.evaluate(()=>document.getElementById('post_comment')?.scrollIntoView({block:'start'}));
 await new Promise(r=>setTimeout(r,5000));
 const el=await p.$('#post_comment');
 if(el) await el.screenshot({path:path.join(process.env.TEMP,'shots','tk-light.png')});
 console.log('ok', await p.evaluate(()=>document.documentElement.className));
 await b.close();
})();
