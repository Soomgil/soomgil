const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage();
await page.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({sub:'me',exp:Date.now()/1000+3600}))+'.test'));
await page.route('**/api/v1/**',r=>{
 const p=new URL(r.request().url()).pathname; let body={items:[],page:{page:0,size:20,totalElements:0,totalPages:0}};
 if(p.endsWith('/me'))body={id:'me',status:'ACTIVE',profile:{displayName:'나'},settings:{displayLanguage:'ko'}};
 if(p==='/api/v1/trips/qa')body={id:'qa',title:'제주 여행',displayDestination:'제주',status:'ACTIVE',myRole:'OWNER',ownerUserId:'me',regions:[],members:Array.from({length:9},(_,i)=>({id:String(i),user:{id:i?'member-'+i:'me',displayName:i?'여행 친구 '+i:'나'},status:'ACTIVE',role:i?'MEMBER':'OWNER'}))};
 if(p.endsWith('/itinerary'))body={tripId:'qa',itineraryVersion:0,days:[],routes:[],mapDrawings:[]};
 if(p.endsWith('/current'))body={hasSession:false,nextScreen:'OWNER_SETUP',session:null,myParticipation:null};
 if(p.endsWith('/checklists')||p.endsWith('/invites'))body=[];
 if(p.endsWith('/invites') && r.request().method()==='POST')body={inviteCode:'qa-link',inviteUrl:null,status:'PENDING'};
 if(p.endsWith('/notes'))body={content:''};
 if(p.endsWith('/preference-places'))body=[{provider:'KTO',externalPlaceId:'1',name:'함덕 해수욕장',address:'제주시',lat:33.54,lng:126.67,category:'해변',userId:'me',displayName:'나',reaction:'LIKE'}, {provider:'KTO',externalPlaceId:'1',name:'함덕 해수욕장',address:'제주시',lat:33.54,lng:126.67,category:'해변',userId:'friend',displayName:'동료',reaction:'SUPER_LIKE'}];
 return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
});
for(const width of [1440,390]) {
 await page.setViewportSize({width,height:900}); await page.goto('http://localhost:5173/trips/qa/route');
 await page.getByTestId('taste-toggle').click(); await page.locator('.taste-count').waitFor();
 await page.screenshot({path:path.join(__dirname,`map-taste-${width}.png`)});
 const box=await page.locator('.taste-panel').boundingBox(); if(box.x<0||box.x+box.width>width+1||box.y+box.height>901)throw Error('Panel outside viewport');
 await page.getByTestId('taste-colleagues').click(); await page.getByTestId('taste-together').click();
 if(await page.getByTestId('taste-place').count()!==0)throw Error('Place list should be removed');
 if(!(await page.locator('.taste-count').textContent()).includes('1'))throw Error('Shared filtering failed');
 await page.getByTestId('taste-toggle').click(); await page.locator('.map-theme-button').click();
 if(await page.locator('.map-theme-popover input').first().getAttribute('value')!=='standard')throw Error('Default theme order'); await page.locator('.map-theme-button').click();
 await page.locator('.trip-settings-button').click();
 await page.getByTestId('trip-period-card').click();
 await page.locator('.range-dialog').waitFor();
 await page.locator('.range-grid button:not(.outside)').nth(9).click();
 await page.locator('.range-grid button:not(.outside)').nth(11).click();
 await page.screenshot({path:path.join(__dirname,`date-range-${width}.png`)});
 const range=await page.locator('.range-dialog').boundingBox(); if(range.x<0||range.x+range.width>width+1)throw Error('Calendar overflow');
 await page.getByTestId('range-apply').click();
 if(!(await page.getByTestId('trip-period-card').textContent()).includes('→'))throw Error('Date range not applied');
 await page.locator('.modal-tab-btn').filter({hasText:'멤버 관리'}).click();
 await page.waitForFunction(()=>document.querySelector('.invite-link-box input')?.value?.includes('qa-link'));
 await page.screenshot({path:path.join(__dirname,`member-cards-${width}.png`)});
 if(await page.locator('.member-item').count()!==9)throw Error('Missing member cards');
}
console.log('Desktop/mobile preference panel passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
