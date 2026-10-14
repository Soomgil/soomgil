const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const photos=await(await fetch('http://localhost:8080/api/v1/award-photos?limit=8')).json();
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600}))+'.test'));
  const places=photos.slice(0,3).map((p,i)=>({provider:'KTO',externalPlaceId:String(i+1),name:p.placeName,address:p.regionName,thumbnailUrl:p.imageUrl,lat:33,lng:126,category:'관광지',sourceStatus:'AVAILABLE'}));
  let stage='setup';
  const candidates=Array.from({length:8},(_,i)=>({id:'c'+i,rank:i+1,name:photos[i%photos.length].placeName||'여행지 '+(i+1),thumbnailUrl:photos[i%photos.length].imageUrl,stickerCount:20-i*2,provider:'KTO',externalPlaceId:String(i),address:'대한민국',lat:36,lng:127,category:'관광지'}));
  const session={id:'s1',tripId:'qa',status:'COMPLETED',stickerAllowance:3,selectionCount:3,candidateCount:8,openedAt:null,completedAt:null,completionReason:'ALL_SUBMITTED',participantSummary:{total:5,submitted:5},candidates};
  const result={sessionId:'s1',tripId:'qa',status:'COMPLETED',completionReason:'ALL_SUBMITTED',completedAt:null,selectionCount:3,results:candidates.map((c,i)=>({...c,candidateId:c.id,selected:i<3,selectedRank:i<3?i+1:null,itineraryOutcome:i===0?'SKIPPED_DUPLICATE':i<3?'ADDED':null,itineraryItemId:null})),unscheduledDayId:null,itineraryVersion:0};
  await context.route('**/api/v1/**',async route=>{
   const url=new URL(route.request().url());let body={items:[],nextSeed:null};
   if(url.pathname.endsWith('/trips/qa')) body={id:'qa',title:'대전에서 보내는 여유로운 하루',displayDestination:'대전',status:'ACTIVE',myRole:'OWNER',ownerUserId:'qa',members:Array.from({length:5},(_,i)=>({id:String(i),role:i===0?'OWNER':'MEMBER',status:'ACTIVE',user:{id:i===0?'qa':String(i),displayName:'동행'+i,profileImageUrl:null}})),regions:[],itineraryVersion:0};
   else if(url.pathname.endsWith('/vote-sessions/current')) body=stage==='setup'?{hasSession:false,nextScreen:'MAP',session:null,myParticipation:null}:{hasSession:true,nextScreen:'MAP',session,myParticipation:{participantId:'qa',status:'SUBMITTED',stickerAllowance:3,usedStickerCount:3,remainingStickerCount:0,placements:[],submittedAt:null}};
   else if(url.pathname.endsWith('/result')) body=result;
   else if(url.pathname.endsWith('/checklists')) body=[];
   else if(url.pathname.endsWith('/itinerary')) body={tripId:'qa',itineraryVersion:0,days:[],routes:[]};
   else if(url.pathname.endsWith('/trips')) body={items:Array.from({length:12},(_,i)=>({id:String(i),title:'가을 풍경을 찾아 '+(i+1),displayDestination:'대한민국',status:'ACTIVE',myRole:'OWNER',coverImageUrl:photos[i%photos.length].imageUrl,createdAt:'2026-09-01',itineraryVersion:0})),page:{page:0,totalPages:1,totalElements:12}};
   else if(url.pathname.endsWith('/members')) body=Array.from({length:5},(_,i)=>({id:String(i),status:'ACTIVE',user:{id:String(i),displayName:'동행'+i,profileImageUrl:null}}));
   else if(url.pathname.endsWith('/me')) body={id:'qa',status:'ACTIVE',profile:{displayName:'여행자',profileImageUrl:null},settings:{displayLanguage:'KO',timezone:'Asia/Seoul'}};
   else if(url.pathname.endsWith('/award-photos')) body=photos;
   else if(url.pathname.endsWith('/search')) body={query:url.searchParams.get('q'),trips:[],places,posts:[],users:[{id:'qa-user',displayName:'제주를 걷는 여행자',profileImageUrl:null,followerCount:128},{id:'qa-long',displayName:'우리나라의 아름다운 풍경을 찾아 여행하는 사람',profileImageUrl:null,followerCount:12}]};
   else if(url.pathname.includes('/places/')) {const p=places[0];body={...p,placeName:p.name,description:'바다와 풍경을 천천히 둘러볼 수 있는 여행지입니다. 이 문장은 화면 검증용 데이터입니다.',photos:[p.thumbnailUrl]};}
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  const page=await context.newPage();
  const styleRequests=[];
  page.on('request',r=>{if(new URL(r.url()).pathname.match(/styles\/v1\/mapbox\/(light-v11|dark-v11|navigation-day-v1|navigation-night-v1|standard)$/)) styleRequests.push(new URL(r.url()).pathname)});
  await page.goto('http://localhost:5173/trips/qa/route');
  const darkReady=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/styles/v1/mapbox/dark-v11')&&r.status()===200);
  await page.locator('.map-theme-button').click();
  await darkReady;
  await page.waitForTimeout(1000);
  const before=styleRequests.length;
  await page.locator('.map-theme-popover label').filter({has:page.locator('input[value="dark"]')}).click();
  await page.waitForTimeout(1000);
  await page.locator('.map-theme-button').click();
  await page.locator('.map-theme-popover label').filter({has:page.locator('input[value="light"]')}).click();
  await page.locator('.map-theme-button').click();
  await page.locator('.map-theme-popover label').filter({has:page.locator('input[value="dark"]')}).click();
  await page.waitForTimeout(1000);
  if(styleRequests.length!==before) throw Error('Cached selection requested root style again: '+before+' -> '+styleRequests.length);
  console.log('Prefetched theme selections reused cached style JSON without new root style requests');
  for(const phase of ['setup','result']) {
    stage=phase;
    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:1000});
      await page.goto('http://localhost:5173/trips/qa/route?vote=1');
      await page.locator(phase==='setup'?'[data-testid="vote-setup"]':'[data-testid="result-list"]').waitFor();
      if(phase==='result') {
        if(await page.locator('[data-testid="result-row"]').count()!==5) throw Error('Overview count');
        await page.locator('.is-winner img').waitFor();
        await page.locator('.is-winner img').evaluate(img=>img.decode().catch(()=>{}));
      }
      await page.screenshot({path:path.join(__dirname,'vote-'+phase+'-'+width+'.png')});
      if(await page.locator('.vote-modal-card').evaluate(el=>el.scrollWidth>el.clientWidth+1)) throw Error('Modal overflow');
      if(phase==='result') {
        await page.locator('[data-testid="result-toggle-all"]').click();
        if(await page.locator('[data-testid="result-row"]').count()!==8) throw Error('Full count');
        await page.screenshot({path:path.join(__dirname,'vote-full-'+width+'.png')});
        await page.locator('[data-testid="result-toggle-all"]').click();
        if(await page.locator('[data-testid="result-row"]').count()!==5) throw Error('Return count');
      }
    }
  }
  console.log('Setup and result overview/full/return verified at desktop and mobile widths');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
