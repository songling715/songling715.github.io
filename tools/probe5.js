const puppeteer=require('puppeteer-core');
const path=require('path');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:900});
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await p.evaluate(()=>document.getElementById('post_comment').scrollIntoView({block:'center'}));
 await new Promise(r=>setTimeout(r,8000));
 const el=await p.$('#post_comment');
 await el.screenshot({path:path.join(process.env.TEMP,'shots','comment-live.png')});
 console.log('ok');
 await b.close();
})();
