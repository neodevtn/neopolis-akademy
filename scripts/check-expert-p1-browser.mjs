import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root=process.cwd();
const base=process.env.EXPERT_QA_URL || 'http://127.0.0.1:3000';
const useProgressFixture=process.env.EXPERT_QA_PROGRESS_FIXTURE==='1';
const out=path.join(root,'pedagogical-audit',useProgressFixture?'expert-p1-browser-fixture':'expert-p1-browser');
fs.mkdirSync(out,{recursive:true});
const index=JSON.parse(fs.readFileSync('client/src/data/trainingIndex.json','utf8'));
const metadata=new Map(index.courses.map(x=>[x.id,x]));
const definitions=[
 ['developing_ai_systems_with_the_openai_api__01','dc_ch02_act15'],
 ['intermediate_workflow_automation_with_n8n__01','dc_ch02_act07'],
 ['innovating_with_google_cloud_ai__01','dc_ch01_act02'],
 ['automatisation_comptable_ia__01','novasavo_u03_screen_03'],
 ['vibe_coding_with_replit__01','dc_ch01_act04'],
 ['software_development_with_github_copilot__01','dc_ch01_act01'],
];
const samples=definitions.map(([courseId,chapterId])=>{
 const d=JSON.parse(fs.readFileSync(`client/public/data/courses/${courseId}.json`,'utf8'));
 let found;
 d.lessons.forEach((l,li)=>l.chapters.forEach((ch,ci)=>{if(ch.id===chapterId)found={courseId,chapterId,li,ci,ch};}));
 if(!found){
  d.lessons.forEach((l,li)=>l.chapters.forEach((ch,ci)=>{if(!found&&ch.blocks?.some(b=>b.type==='single_choice_exercise'))found={courseId,chapterId:ch.id,li,ci,ch};}));
 }
 if(!found)throw new Error(`Sample not found: ${courseId}/${chapterId}`);
 return found;
});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const results=[];
let userRole='unknown';
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const ctx=await browser.newContext({viewport,extraHTTPHeaders:{'x-neopolis-qa-probe':'1'}});
  const login=await ctx.request.post(`${base}/api/auth/login`,{data:{email:process.env.QA_EMAIL,password:process.env.QA_PASSWORD}});
  if(!login.ok())throw new Error(`QA login ${login.status()}`);
  const cookie=login.headers()['set-cookie']?.match(/app_session_id=([^;]+)/)?.[1];
  if(cookie)await ctx.addCookies([{name:'app_session_id',value:cookie,url:base,httpOnly:true,sameSite:'Lax'}]);
  if(useProgressFixture){
   await ctx.route('**/api/trpc/**',async route=>{
    const endpoint=new URL(route.request().url()).pathname.split('/api/trpc/')[1]||'';
    const names=endpoint.split(',');
    // Never persist the simulated reading position or lesson completions.
    if(names.some(name=>['training.saveChapterProgress','training.markLessonComplete'].includes(name))){
     const responses=names.map(()=>({result:{data:{json:{success:true}}}}));
     return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(new URL(route.request().url()).searchParams.get('batch')==='1'?responses:responses[0])});
    }
    if(!names.some(name=>['training.getProgress','training.getChapterProgress'].includes(name)))return route.continue();
    const response=await route.fetch();const data=await response.json();const entries=Array.isArray(data)?data:[data];
    entries.forEach((entry,i)=>{
     if(!entry.result?.data)return;
     if(names[i]==='training.getProgress')entry.result.data.json=samples.flatMap(s=>Array.from({length:s.li},(_,lessonIndex)=>({courseId:s.courseId,lessonIndex})));
     if(names[i]==='training.getChapterProgress')entry.result.data.json=samples.map(s=>({courseId:s.courseId,lessonIndex:s.li,chapterIndex:s.ci,totalChapters:JSON.parse(fs.readFileSync(`client/public/data/courses/${s.courseId}.json`,'utf8')).lessons[s.li].chapters.length}));
     delete entry.result.data.meta;
    });
    await route.fulfill({response,body:JSON.stringify(Array.isArray(data)?entries:entries[0])});
   });
  }
  const page=await ctx.newPage();
  for(const s of samples){
   const meta=metadata.get(s.courseId);const certId=meta.certId;
   const url=`${base}/training/${certId}/${s.courseId}?lesson=${s.li}&chapter=${s.ci}`;
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.body.innerText.length>300 && !/Chargement\.\.\.|Loading\.\.\./.test(document.body.innerText),{timeout:25000}).catch(()=>{});
   await page.waitForTimeout(1500);
   const accept=page.getByRole('button',{name:'Accepter',exact:true});if(await accept.count())await accept.click().catch(()=>{});
   const text=await page.locator('body').innerText();
   const locked=/(?:cours|unité|leçon) verrouillé/i.test(text);
   const presenceBlocked=/Vérification de présence requise|Presence verification required/i.test(text);
   const measurement=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,video:document.querySelectorAll('video').length,iframe:document.querySelectorAll('iframe[src*="youtube"]').length}));
   const question=s.ch.blocks.find(b=>b.type==='single_choice_exercise');
   let submission=null;
   if(viewport.width===1440&&question&&!locked&&!presenceBlocked){
    const expectedText=question.question.fr || question.question.en;
    const displayed=await page.getByText(expectedText,{exact:true}).count();
    if(displayed){
     const explanation=question.explanation?.fr || question.explanation?.en || '';
     const hiddenBefore=explanation ? !(await page.getByText(explanation,{exact:true}).count()) : true;
     const option=question.options.find(o=>o.id===question.correctAnswer);
     const optionText=option.text.fr||option.text.en||option.text;
     const container=page.getByText(expectedText,{exact:true}).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
     await container.getByRole('button',{name:new RegExp(optionText.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click();
     const request=page.waitForResponse(r=>r.url().includes('training.validateServerChoice'),{timeout:15000});
     await container.getByRole('button',{name:'Vérifier la réponse',exact:true}).click();
     const response=await request;
     await page.waitForTimeout(300);
     const correctShown=(await container.getByText('Correct !',{exact:true}).count())>0;
     const explanationAfter=explanation ? (await container.getByText(explanation,{exact:true}).count())>0 : false;
     submission={quiz:question.id,http_status:response.status(),hiddenBefore,correctShown,explanationAfter};
    }else submission={quiz:question.id,not_displayed:true};
   }
   const screenshot=path.join(out,`${viewport.width}-${s.courseId}-${s.chapterId}.png`);
   await page.screenshot({path:screenshot,fullPage:false});
   results.push({courseId:s.courseId,chapterId:s.chapterId,viewport:viewport.width,url,locked,verification:presenceBlocked?'blocked_by_integrity_presence':locked?'blocked_by_sequential_progression':'rendered',render_verified:!presenceBlocked&&!locked,body_excerpt:text.slice(0,350),errors,overflow:measurement.scroll>measurement.width+2,videoPlayers:measurement.video+measurement.iframe,submission,screenshot});
   page.removeAllListeners('pageerror');
  }
  await ctx.close();
 }
}finally{await browser.close();}
const report={generated_at:new Date().toISOString(),progress_fixture:useProgressFixture,scope:useProgressFixture?'Six écrans desktop/mobile, compte QA de rôle apprenant, progression prérequise injectée en mémoire. Le rendu et la correction API sont réels ; aucun acquis simulé sauvegardé. Ce test ne remplace pas un parcours intégral.':'Six écrans représentatifs desktop/mobile, compte QA, progression réelle, navigateur réel. Pas un parcours complet des 180 cours.',results};
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(results.some(r=>useProgressFixture&&!r.render_verified||r.overflow||r.errors.length||r.videoPlayers>1||r.submission&&(!r.submission.correctShown||!r.submission.hiddenBefore||!r.submission.explanationAfter)))process.exitCode=1;
