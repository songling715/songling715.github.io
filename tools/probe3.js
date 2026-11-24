const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:900});
 await p.goto(process.argv[2],{waitUntil:'networkidle2'});
 const r=await p.evaluate(()=>{
  const box=s=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); const c=getComputedStyle(e); return {top:Math.round(b.top),h:Math.round(b.height),mt:c.marginTop,pt:c.paddingTop,disp:c.display};};
  return {body:document.body.className, banner:box('#banner'), content:box('#content'), info:box('.page-information-card'), main:box('#primary'), firstCard:box('#primary .card')};
 });
 console.log(JSON.stringify(r,null,1));
 await b.close();
})();
