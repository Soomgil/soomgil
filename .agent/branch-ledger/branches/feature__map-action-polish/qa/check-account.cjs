const { chromium } = require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
(async()=>{
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage();
  await page.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:Date.now()/1000+3600}))+'.test'));
  await page.route('**/api/v1/**',route=>{
   const url=new URL(route.request().url()).pathname;
   let body={items:[],page:{page:0,size:20,totalElements:0,totalPages:0}};
   if(url.endsWith('/me'))body={id:'qa',status:'ACTIVE',email:'traveler@example.com',profile:{displayName:'여행자',bio:'새로운 풍경을 찾아 떠나는 여행'},settings:{displayLanguage:'KO',timezone:'Asia/Seoul'}};
   if(url.endsWith('/settings'))body={displayLanguage:'ko',tripInviteEmailOptIn:true};
   if(url.endsWith('/preferences'))body={topCategories:[],preferredTags:[],travelStyle:''};
   if(url.endsWith('/unread-count'))body={count:0};
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   await page.goto('http://localhost:5173/mypage');
   await page.locator('.profile-display-name').waitFor();
   await page.evaluate(()=>window.qaHeader=document.querySelector('header.topbar'));
   await page.screenshot({path:path.join(__dirname,`account-mypage-${width}.png`),fullPage:true});
   await page.locator('.account-page-link').click();
   await page.locator('.settings-select').waitFor();
   if(!await page.evaluate(()=>window.qaHeader===document.querySelector('header.topbar')))throw Error('Header remounted');
   if(await page.locator('header.topbar').count()!==1)throw Error('Duplicate headers');
   await page.screenshot({path:path.join(__dirname,`account-settings-${width}.png`),fullPage:true});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   if(overflow)throw Error('Horizontal overflow at '+width);
  }
  console.log('Persistent header and account layouts verified at 1440px / 390px');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
