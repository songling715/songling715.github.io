const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:900});
 await p.goto('http://127.0.0.1:4100/',{waitUntil:'networkidle2'});
 const r=await p.evaluate(()=>{
  const g=(s)=>{const e=document.querySelector(s); if(!e) return null; const c=getComputedStyle(e); return {bg:c.background.slice(0,120),op:c.opacity,color:c.color};};
  return {footer:g('#footer'), banner:g('.leftbar-banner'), card:g('#leftbar_part2'), dark:document.documentElement.className};
 });
 console.log(JSON.stringify(r,null,1));
 await b.close();
})();
