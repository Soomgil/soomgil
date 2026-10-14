const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:9999999999}))+'.test'));
 const photo=(w,h)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="seagreen"/></svg>`);
 await page.route('**/api/v1/**',route=>route.fulfill({json:route.request().url().includes('award-photos')?[{id:1,imageUrl:photo(940,600),title:'가로 풍경'},{id:2,imageUrl:photo(400,600),title:'세로 풍경'}]:{id:'qa',items:[]}}));
 await page.goto('http://localhost:5173/home');
 const bounds=async()=>{await page.waitForFunction(()=>document.querySelector('.home-backdrop img')?.complete && document.querySelector('.home-backdrop img')?.style.width);return page.locator('.home-artwork-footer').boundingBox()};
 const before=await bounds();
 await page.getByRole('button',{name:'다음 사진'}).click();
 await page.waitForFunction(()=>document.querySelector('.home-backdrop img')?.naturalWidth===400);
 const after=await bounds();
 if(Math.abs(before.x-after.x)>1 || Math.abs(before.width-after.width)>1) throw new Error('Footer shifted '+JSON.stringify({before,after}));
 console.log('Footer stable',before,after);
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
