const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage();
await page.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({sub:'me',exp:Date.now()/1000+3600}))+'.test'));
await page.route('**/api/v1/**',r=>{
 const p=new URL(r.request().url()).pathname; let body={items:[],page:{page:0,size:20,totalElements:0,totalPages:0}};
 if(p.endsWith('/me'))body={id:'me',status:'ACTIVE',profile:{displayName:'나'},settings:{displayLanguage:'ko'}};
 if(p==='/api/v1/trips/qa')body={id:'qa',title:'제주 여행',displayDestination:'제주',status:'ACTIVE',myRole:'OWNER',ownerUserId:'me',regions:[],members:[{id:'1',user:{id:'me',displayName:'나'},status:'ACTIVE',role:'OWNER'}]};
 if(p.endsWith('/itinerary'))body={tripId:'qa',itineraryVersion:0,days:[],routes:[],mapDrawings:[]};
 if(p.endsWith('/current'))body={hasSession:false,nextScreen:'OWNER_SETUP',session:null,myParticipation:null};
 if(p.endsWith('/checklists')||p.endsWith('/invites'))body=[];
 if(p.endsWith('/notes'))body={content:''};
 if(p.endsWith('/preference-places'))body=[{provider:'KTO',externalPlaceId:'1',name:'함덕 해수욕장',address:'제주시',lat:33.54,lng:126.67,category:'해변',userId:'me',displayName:'나',reaction:'LIKE'}, {provider:'KTO',externalPlaceId:'1',name:'함덕 해수욕장',address:'제주시',lat:33.54,lng:126.67,category:'해변',userId:'friend',displayName:'동료',reaction:'SUPER_LIKE'}];
 return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
});
for(const width of [1440,390]) {
 await page.setViewportSize({width,height:900}); await page.goto('http://localhost:5173/trips/qa/route');
 await page.getByTestId('taste-toggle').click(); await page.getByTestId('taste-place').waitFor();
 await page.screenshot({path:path.join(__dirname,`map-taste-${width}.png`)});
 const box=await page.locator('.taste-panel').boundingBox(); if(box.x<0||box.x+box.width>width+1||box.y+box.height>901)throw Error('Panel outside viewport');
 await page.getByTestId('taste-colleagues').click(); await page.getByTestId('taste-together').click();
 if(await page.getByTestId('taste-place').count()!==1)throw Error('Shared filtering failed');
}
console.log('Desktop/mobile preference panel passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
