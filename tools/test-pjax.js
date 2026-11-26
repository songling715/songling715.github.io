const puppeteer=require('puppeteer-core');
const path=require('path');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:900});
 await p.goto('http://127.0.0.1:4102/',{waitUntil:'networkidle2',timeout:60000});
 await new Promise(r=>setTimeout(r,600));

 // 1. 打字效果：测前 600ms 和后 3s 的文字长度
 const t1=await p.evaluate(()=>document.querySelector('.banner-title-inner')?.textContent.length||0);
 await new Promise(r=>setTimeout(r,400));
 const t2=await p.evaluate(()=>document.querySelector('.banner-title-inner')?.textContent.length||0);
 await new Promise(r=>setTimeout(r,3500));
 const t3=await p.evaluate(()=>document.querySelector('.banner-title-inner')?.textContent.length||0);

 // 2. 下箭头存在？
 const hasArrow=await p.evaluate(()=>!!document.getElementById('banner_scroll_down'));
 const bannerH=await p.evaluate(()=>Math.round(document.getElementById('banner').getBoundingClientRect().height));

 // 3. PJAX 去关于页
 await p.evaluate(()=>{ const a=[...document.querySelectorAll('#navbar_global .nav-link')].find(x=>x.textContent.includes('关于')); a&&a.click(); });
 await new Promise(r=>setTimeout(r,2000));
 const afterAbout=await p.evaluate(()=>({
   url: location.pathname, isHome: document.body.classList.contains('is-home'),
   bannerH: Math.round(document.getElementById('banner').getBoundingClientRect().height),
   arrowVisible: (()=>{const e=document.getElementById('banner_scroll_down'); return e?getComputedStyle(e).display!=='none':false;})()
 }));

 // 4. 再 PJAX 回首页
 await p.evaluate(()=>{ const a=[...document.querySelectorAll('#navbar_global .nav-link')].find(x=>x.textContent.includes('首页')); a&&a.click(); });
 await new Promise(r=>setTimeout(r,2500));
 const backHome=await p.evaluate(()=>({
   url: location.pathname, isHome: document.body.classList.contains('is-home'),
   bannerH: Math.round(document.getElementById('banner').getBoundingClientRect().height),
   typed: document.querySelector('.banner-title-inner')?.textContent||'',
   arrowVisible: (()=>{const e=document.getElementById('banner_scroll_down'); return e?getComputedStyle(e).display!=='none':false;})()
 }));

 // 5. 搜索白条
 await p.click('#navbar_search_container');
 await new Promise(r=>setTimeout(r,700));
 const searchBox=await p.evaluate(()=>{const e=document.getElementById('navbar_search_result'); const r=e.getBoundingClientRect(); const c=getComputedStyle(e); return {display:c.display, h:Math.round(r.height), empty:e.innerHTML.trim().length===0};});

 console.log(JSON.stringify({typing:{t1,t2,t3},hasArrow,bannerH,afterAbout,backHome,searchBox},null,1));
 await p.screenshot({path:path.join(process.env.TEMP,'shots','home-arrow.png')});
 await b.close();
})();
