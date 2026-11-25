const puppeteer=require('puppeteer-core');
const path=require('path');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 const errs=[];
 p.on('pageerror',e=>errs.push(e.message));
 p.on('console',m=>{ if(m.type()==='error') errs.push('console:'+m.text().slice(0,120)); });
 await p.setViewport({width:1440,height:1000});
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await p.evaluate(()=>document.getElementById('post_comment')?.scrollIntoView({block:'start'}));
 await new Promise(r=>setTimeout(r,7000));
 const info=await p.evaluate(()=>{
   const t=document.getElementById('twikoo');
   return {exists:!!t, htmlLen:t?t.innerHTML.length:0,
     hasForm: !!document.querySelector('#twikoo .tk-submit, #twikoo .tk-input, #twikoo textarea'),
     firstChild: t&&t.firstElementChild?t.firstElementChild.className:null,
     height: t?Math.round(t.getBoundingClientRect().height):0};
 });
 console.log(JSON.stringify({info,errs:errs.slice(0,5)},null,1));
 const el=await p.$('#post_comment');
 if(el) await el.screenshot({path:path.join(process.env.TEMP,'shots','tk-comment.png')});
 await b.close();
})();
