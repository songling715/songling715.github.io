const puppeteer=require('puppeteer-core');
const path=require('path');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:900});
 await p.goto('http://127.0.0.1:4102/',{waitUntil:'networkidle2'});
 await new Promise(r=>setTimeout(r,2500));
 await p.screenshot({path:path.join(process.env.TEMP,'shots','arrow-home.png')});
 await p.screenshot({path:path.join(process.env.TEMP,'shots','arrow-crop.png'), clip:{x:560,y:700,width:320,height:200}});
 console.log('ok');
 await b.close();
})();
