const puppeteer=require('puppeteer-core');
const path=require('path');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:900});
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight-1600));
 await new Promise(r=>setTimeout(r,9000));
 const info=await p.evaluate(()=>{
   const f=document.querySelector('iframe.giscus-frame');
   return {iframe:f?{h:f.clientHeight,w:f.clientWidth}:null, loading:!!document.querySelector('.giscus-loading'), fallback:!!document.querySelector('.giscus-fallback')};
 });
 console.log(JSON.stringify(info));
 await p.screenshot({path:path.join(process.env.TEMP,'shots','giscus-live.png')});
 await b.close();
})();
