const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600}))+'.test'));
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 let count=32;
 const notes=['TRIP_INVITE','VOTE_STARTED','VOTE_COMPLETED'].map((type,i)=>({id:'n'+i,tripId:'trip',type,title:['함께 부산 여행을 떠나요','여행 투표가 시작됐어요','투표 결과가 도착했어요'][i],body:['민지님이 부산 여행에 초대했어요.','부산 바다 여행 · 스티커로 가고 싶은 곳을 골라주세요.','부산 바다 여행 · 함께 고른 여행지를 확인해보세요.'][i],payload:{tripId:'trip',route:'/trips/trip/route?vote=1'},createdAt:new Date().toISOString(),readAt:i===2?new Date().toISOString():null,actor:null}));
 await page.route('**/api/v1/**',async route=>{const url=new URL(route.request().url());let data={};
 if(url.pathname.endsWith('/me'))data={id:'qa',status:'ACTIVE',profile:{displayName:'여행자'},settings:{displayLanguage:'KO',timezone:'Asia/Seoul'}};
 else if(url.pathname.endsWith('/notifications/read-all')){count=0;notes.forEach(n=>n.readAt=new Date().toISOString());data={updatedCount:32};}
 else if(url.pathname.endsWith('/notifications')) data={items:url.searchParams.get('unreadOnly')?notes.slice(0,1):notes,page:{page:0,size:20,totalElements:url.searchParams.get('unreadOnly')?count:3,totalPages:1,sort:[]}};
 else if(url.pathname.endsWith('/trips/nearest'))data={id:'trip',title:'부산 바다 여행',startDate:date};
 else if(url.pathname.endsWith('/itinerary'))data={days:[{id:'day',date,groupType:'DAY',dayNumber:2,sortOrder:1,items:['흰여울문화마을','송도해상케이블카','광안리해수욕장'].map((placeName,i)=>({id:'p'+i,placeName,address:['부산 영도구 절영로','부산 서구 송도해변로','부산 수영구 광안해변로'][i],sortOrder:i,thumbnailUrl:'/images/랜딩페이지/korea_hero.png'}))}]};
 else if(url.pathname.endsWith('/search'))data={query:'부산',places:[],trips:[],posts:[],users:[]};
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});});
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});await page.goto('http://localhost:5173/search?q=부산');await page.locator('#header-briefing-btn').click();await page.getByText('흰여울문화마을',{exact:true}).waitFor();const panel=page.locator('#header-briefing-panel');const box=await panel.boundingBox();if(box.x<0||box.x+box.width>width||box.y+box.height>900)throw Error('Briefing overflow '+width);await page.screenshot({animations:'disabled',path:path.join(__dirname,'briefing-'+width+'.png')});await page.keyboard.press('Escape');if(await panel.count())throw Error('Escape failed');await page.locator('#header-notif-btn').click();await page.getByText('투표 결과가 도착했어요',{exact:true}).waitFor();const b=await page.locator('#header-notif-panel').boundingBox();if(b.x<0||b.x+b.width>width)throw Error('Notification overflow');await page.screenshot({animations:'disabled',path:path.join(__dirname,'notifications-'+width+'.png')});await page.getByRole('button',{name:'알림 닫기',exact:true}).click();}
 await page.locator('#header-notif-btn').click();await page.getByRole('button',{name:'모두 읽음',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#header-notif-btn').getAttribute('aria-label').includes('0개'));
 if(errors.length)throw Error(errors.join('\n'));console.log('1440/390/320px briefing, notifications, Escape, read-all verified');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});

