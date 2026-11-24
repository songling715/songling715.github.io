const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:900});
 await p.goto(process.argv[2],{waitUntil:'networkidle2'});
 await p.evaluate(()=>window.scrollTo(0,500));
 await new Promise(r=>setTimeout(r,800));
 const r=await p.evaluate(()=>{const n=document.querySelector('#navbar-main');const c=getComputedStyle(n);const t=document.querySelector('#toolbar');return {cls:t.className, bg:c.backgroundColor, bgi:c.backgroundImage.slice(0,60), op:c.opacity, filter:c.backdropFilter};});
 console.log(JSON.stringify(r,null,1));
 await b.close();
})();
