const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 const errs=[];
 p.on('pageerror',e=>errs.push(e.message));
 await p.setViewport({width:1440,height:900});
 await p.goto('https://songling715.dpdns.org/',{waitUntil:'networkidle2',timeout:60000});
 const t1=await p.evaluate(()=>document.querySelector('.banner-title-inner')?.textContent.length||0);
 await new Promise(r=>setTimeout(r,2500));
 const t2=await p.evaluate(()=>document.querySelector('.banner-title-inner')?.textContent.length||0);
 const arrow=await p.evaluate(()=>!!document.getElementById('banner_scroll_down'));
 // pjax 到关于
 await p.evaluate(()=>{const a=[...document.querySelectorAll('#navbar_global .nav-link')].find(x=>x.textContent.includes('关于'));a&&a.click();});
 await new Promise(r=>setTimeout(r,2200));
 const about=await p.evaluate(()=>({isHome:document.body.classList.contains('is-home'),h:Math.round(document.getElementById('banner').getBoundingClientRect().height)}));
 // 回首页
 await p.evaluate(()=>{const a=[...document.querySelectorAll('#navbar_global .nav-link')].find(x=>x.textContent.includes('首页'));a&&a.click();});
 await new Promise(r=>setTimeout(r,2200));
 const home=await p.evaluate(()=>({isHome:document.body.classList.contains('is-home'),h:Math.round(document.getElementById('banner').getBoundingClientRect().height)}));
 console.log(JSON.stringify({typing:[t1,t2],arrow,about,home,errs},null,1));
 await b.close();
})();
