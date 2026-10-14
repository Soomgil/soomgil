const { chromium } = require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{ const browser=await chromium.launch({channel:'msedge',headless:true}); try {
const page=await browser.newPage({viewport:{width:1440,height:900}});
const photos=['/qa-blue.svg','/qa-green.svg'];
await page.route('**/qa-*.svg',r=>r.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${r.request().url().includes('blue')?'#77b9e5':'#80c5ad'}"/></svg>`}));
const posts=['바다 여행','숲 여행','섬 여행'].map((title,i)=>({id:String(i+1),title,summary:'여행 이야기',publishedAt:'2026-09-17T00:00:00Z',publishedBy:null,hashtags:[],likeCount:4,commentCount:0,coverMedia:{publicUrl:photos[0]}}));
await page.route('**/api/v1/**',r=>{const p=new URL(r.request().url()).pathname;let body={items:[],page:{totalPages:1,totalElements:0}};if(p.endsWith('/stories'))body={items:posts,page:{totalPages:1,totalElements:2}};if(/\/stories\/[123]$/.test(p))body={...posts[Number(p.at(-1))-1],snapshot:{days:[]},media:photos.map(publicUrl=>({publicUrl}))};return r.fulfill({contentType:'application/json',body:JSON.stringify(body)});});

for(const width of [1440,768,390]) {
 await page.setViewportSize({width,height:900}); await page.goto('http://localhost:5173/community'); await page.locator('.story-tile').first().waitFor();
 const header=await page.locator('.topbar').boundingBox(); const main=await page.locator('.community-paper').boundingBox();
 if(main.y<header.y+header.height-1)throw Error('Header overlaps content at '+width);
 await page.locator('[data-stories-list]').scrollIntoViewIfNeeded();
 await page.screenshot({path:__dirname+'/cards-grid-'+width+'.png'});
 const grid=await page.locator('.story-tile').first().boundingBox(); if(grid.width>350)throw Error('Oversized grid card');
 await page.getByRole('button',{name:'리스트 보기',exact:true}).click();
 await page.screenshot({path:__dirname+'/cards-list-'+width+'.png'});
 const list=await page.locator('.story-tile').first().boundingBox(); console.log(width,grid,list);
 if(list.height>190 || list.width>902)throw Error('Oversized list card');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
}
console.log('Card sizes and header flow passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
