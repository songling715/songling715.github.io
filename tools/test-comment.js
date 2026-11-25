const puppeteer=require('puppeteer-core');
const path=require('path');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 const api=[];
 p.on('response',async r=>{ if(r.url().includes('twikoo-vercel')) api.push(r.status()+' '+r.url().slice(0,60)); });
 await p.setViewport({width:1440,height:1000});
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await new Promise(r=>setTimeout(r,4000));
 const inputs=await p.$$('#twikoo .tk-input__inner');
 if(inputs.length>=2){
   await inputs[0].type('测试访客',{delay:20});
   await inputs[1].type('test@example.com',{delay:20});
 }
 const ta=await p.$('#twikoo .tk-textarea__inner');
 if(ta) await ta.type('这是一条样式测试评论，稍后会在后台删除。',{delay:15});
 await new Promise(r=>setTimeout(r,400));
 const btnState=await p.evaluate(()=>{const b=document.querySelector('#twikoo .tk-send'); return b?{cls:b.className,disabled:b.disabled}:null;});
 if(btnState && !btnState.disabled){ const btn=await p.$('#twikoo .tk-send'); await btn.click(); }
 await new Promise(r=>setTimeout(r,5000));
 const res=await p.evaluate(()=>({
   comments: document.querySelectorAll('#twikoo .tk-comment').length,
   texts: [...document.querySelectorAll('#twikoo .tk-content')].map(e=>e.textContent.trim().slice(0,40)),
   err: document.querySelector('#twikoo .tk-error')?.textContent || null
 }));
 console.log(JSON.stringify({btnState,res,api:api.slice(0,6)},null,1));
 const el=await p.$('#post_comment');
 if(el) await el.screenshot({path:path.join(process.env.TEMP,'shots','tk-test.png')});
 await b.close();
})();
