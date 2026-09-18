const { chromium } = require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{ const browser=await chromium.launch({channel:'msedge',headless:true}); try {
const page=await browser.newPage({viewport:{width:1440,height:900}});
const photos=['/qa-blue.svg','/qa-green.svg'];
await page.route('**/qa-*.svg',r=>r.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${r.request().url().includes('blue')?'#77b9e5':'#80c5ad'}"/></svg>`}));

await page.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({sub:'me',exp:Date.now()/1000+3600}))+'.test'));
await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;let body={items:[],page:{totalPages:0,totalElements:0}};
if(p.endsWith('/me'))body={id:'me',profile:{displayName:'여행자'},settings:{displayLanguage:'ko'},status:'ACTIVE'};
if(p.endsWith('/saved-places'))body={items:Array.from({length:8},(_,i)=>({place:{provider:'KTO',externalPlaceId:String(i),name:['경복궁','함덕 해수욕장','북촌 한옥마을','서울숲'][i%4],address:'서울특별시 종로구',thumbnailUrl:photos[i%2]}}))};
if(p.endsWith('/preferences'))body={topCategories:[{category:'자연 속 산책',percentage:64,groupCode:'nature_scene'},{category:'역사와 문화',percentage:24,groupCode:'history_culture'},{category:'새로운 경험',percentage:12,groupCode:'activity'}],preferredTags:['바다','산책','여유'],travelStyle:'자연 속에서 천천히 걷는 여행을 좋아해요.'};
return r.fulfill({contentType:'application/json',body:JSON.stringify(body)});});
for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.goto('http://localhost:5173/mypage');await page.locator('.keepsake-note').first().waitFor();await page.locator('.keepsake-board').scrollIntoViewIfNeeded();await page.screenshot({path:__dirname+'/mypage-board-'+width+'.png'});await page.locator('.taste-signature').scrollIntoViewIfNeeded();await page.screenshot({path:__dirname+'/mypage-taste-'+width+'.png'});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');}
console.log('Board and preference desktop/mobile passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
