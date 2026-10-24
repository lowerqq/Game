  "use strict";
  const STYPES={
  soundNinja:{hp:80,speed:1.3,damage:14,r:16,color:'#ef4444',shape:'hexagon',name:'Ниндзя Звука'},
  
  shunshinNinja:{hp:55,speed:1.6,damage:14,r:14,color:'#8b5cf6',shape:'diamond',name:'Шуншин-ниндзя'},
  medicNinja:{hp:65,speed:1.0,damage:8,r:18,color:'#22c55e',shape:'circle',name:'Медик-ниндзя'},
  barrierNinja:{hp:140,speed:1.0,damage:14,r:18,color:'#3b82f6',shape:'square',name:'Ниндзя-Барьер'},
  cloneMaster:{hp:90,speed:0.9,damage:10,r:20,color:'#a855f7',shape:'hexagon',name:'Мастер Клонов'},
  shadowClone:{hp:55,speed:1.3,damage:12,r:17,color:'#f97316',shape:'triangle',name:'Теневой Клон'},
  mirrorNinja:{hp:70,speed:1.3,damage:13,r:16,color:'#06b6d4',shape:'diamond',name:'Ниндзя-Отражение'},
  bloodNinja:{hp:70,speed:1.5,damage:16,r:15,color:'#dc2626',shape:'circle',name:'Кровавый Ниндзя'},
  gravityNinja:{hp:90,speed:0.7,damage:8,r:22,color:'#6366f1',shape:'circle',name:'Ниндзя Гравитации'},
  poisonNinja:{hp:50,speed:1.6,damage:12,r:12,color:'#84cc16',shape:'triangle',name:'Ниндзя-Отравитель'},
  curseNinja:{hp:65,speed:1.2,damage:10,r:16,color:'#eab308',shape:'pentagon',name:'Ниндзя-Проклинатель'},
  waterClone:{hp:80,speed:1.2,damage:12,r:17,color:'#0ea5e9',shape:'circle',name:'Водяной Клон'},
  kunaiMaster:{hp:45,speed:1.0,damage:10,r:16,color:'#f43f5e',shape:'pentagon',name:'Мастер Кунаев'},
  soundArcher:{hp:35,speed:1.1,damage:12,r:15,color:'#a16207',shape:'triangle',name:'Лучник Звука'},
  ghostNinja:{hp:70,speed:1.8,damage:14,r:15,color:'#94a3b8',shape:'circle',name:'Ниндзя-Призрак'},
    samurai:{hp:180,speed:0.7,damage:22,r:20,color:'#6b7280',shape:'square',name:'Самурай-отступник'},
  puppetMaster:{hp:110,speed:0.8,damage:12,r:18,color:'#a16207',shape:'pentagon',name:'Кукловод'},
  shadowAssassin:{hp:70,speed:2.2,damage:20,r:14,color:'#1e1b4b',shape:'diamond',name:'Теневой убийца'},
  fakeJinchuuriki:{hp:150,speed:1.2,damage:18,r:22,color:'#ff4400',shape:'hexagon',name:'Лже-Джинчуурики'},
  bloodySasori:{hp:90,speed:0.9,damage:14,r:17,color:'#7c2d12',shape:'circle',name:'Кровавый Сасори'}
};
const SPECIAL_KEYS=Object.keys(STYPES);

// ==================== FIX #6/7: BOSS ATTACKS (damage ×0.4) ====================
const BOSS_ATTACKS={
  fan(boss,p,o){o=o||{};const n=o.n||7,spread=o.spread||0.2,dmg=o.dmg||15,spd=o.spd||4;
    const baseAim=p?Math.atan2(p.y-boss.y,p.x-boss.x):rand(0,Math.PI*2);
    for(let i=-(n-1)/2;i<=(n-1)/2;i++)enemyProjectiles.push(new EnemyProjectile(boss.x,boss.y,baseAim+i*spread,dmg,8,spd,false,boss));
    spawnShockwave(boss.x,boss.y,60,boss.color);},
  radial(boss,p,o){o=o||{};const n=o.n||16,dmg=o.dmg||15,spd=o.spd||3.5;
    for(let i=0;i<n;i++)enemyProjectiles.push(new EnemyProjectile(boss.x,boss.y,i*Math.PI*2/n,dmg,8,spd,false,boss));},
  spiral(boss,p,o){o=o||{};const waves=o.waves||5,n=o.n||6,delay=o.delay||8,dmg=o.dmg||12,spd=o.spd||3;
    for(let k=0;k<waves;k++){scheduleAction(boss,k*delay,()=>{if(boss.removed)return;
      const baseA=k*Math.PI/4+tickMs/400;
      for(let i=0;i<n;i++)enemyProjectiles.push(new EnemyProjectile(boss.x,boss.y,baseA+i*Math.PI*2/n,dmg,7,spd,false,boss));});}},
  homing(boss,p,o){o=o||{};const n=o.n||6,dmg=o.dmg||20,spd=o.spd||2.5;
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2;const proj=new EnemyProjectile(boss.x,boss.y,a,dmg,10,spd,true,boss);proj.life=350;enemyProjectiles.push(proj);}},
  wall(boss,p,o){o=o||{};const n=o.n||10,spd=o.spd||4,dmg=o.dmg||18;
    const side=Math.floor(Math.random()*4);
    for(let i=0;i<n;i++){let x,y,ang;
      if(side===0){x=ARENA.x+20;y=ARENA.y+60+i*(ARENA.h-120)/(n-1);ang=0;}
      else if(side===1){x=ARENA.x+ARENA.w-20;y=ARENA.y+60+i*(ARENA.h-120)/(n-1);ang=Math.PI;}
      else if(side===2){x=ARENA.x+60+i*(ARENA.w-120)/(n-1);y=ARENA.y+20;ang=Math.PI/2;}
      else{x=ARENA.x+60+i*(ARENA.w-120)/(n-1);y=ARENA.y+ARENA.h-20;ang=-Math.PI/2;}
      enemyProjectiles.push(new EnemyProjectile(x,y,ang,dmg,9,spd,false,boss));}
    screenShake=Math.max(screenShake,6);},
  dash(boss,p,o){if(!p)return;o=o||{};const ang=Math.atan2(p.y-boss.y,p.x-boss.x);
    boss.dashVX=Math.cos(ang)*(o.spd||9);boss.dashVY=Math.sin(ang)*(o.spd||9);
    boss.dashTimer=o.dur||35;screenShake=Math.max(screenShake,8);},
  telegraph(boss,p,o){o=o||{};const n=o.n||4,dmg=o.dmg||40,r=o.r||80;
    for(let i=0;i<n;i++){const tx=clamp((p?.x||boss.x)+rand(-200,200),ARENA.x+40,ARENA.x+ARENA.w-40);
      const ty=clamp((p?.y||boss.y)+rand(-200,200),ARENA.y+40,ARENA.y+ARENA.h-40);
      telegraphs.push(new Telegraph(tx,ty,r,60+i*12,dmg,boss.color,boss));}},
  rain(boss,p,o){o=o||{};const n=o.n||15,dmg=o.dmg||15,spd=o.spd||5;
    for(let i=0;i<n;i++){const x=rand(ARENA.x+40,ARENA.x+ARENA.w-40);
      enemyProjectiles.push(new EnemyProjectile(x,ARENA.y+10,Math.PI/2,dmg,7,spd,false,boss));}},
  beam(boss,p,o){if(!p)return;o=o||{};
    const ang=Math.atan2(p.y-boss.y,p.x-boss.x);
    beamWarnings.push(new BeamWarning(boss.x,boss.y,ang,900,o.w||25,o.dmg||40,boss.color,boss,40));},
  beams(boss,p,o){o=o||{};const n=o.n||8,dmg=o.dmg||30;
    const baseRot=Math.random()*Math.PI*2;
    for(let i=0;i<n;i++){const a=baseRot+i*Math.PI*2/n;
      beamWarnings.push(new BeamWarning(boss.x,boss.y,a,600,o.w||18,dmg,boss.color,boss,40));}}
};

// ==================== FIX #6: BOSSES (contactDamage ×0.35, attack dmg ×0.4) ====================
const BOSSES={
  shukaku:{name:'ШУКАКУ',tails:1,color:'#c2a14a',r:55,speed:0.8,contactDamage:70,attacks:[{fn:'fan',opts:{n:9,spread:0.18,dmg:55,spd:4.5},cd:140},{fn:'telegraph',opts:{n:3,dmg:130,r:80},cd:200},{fn:'wall',opts:{n:10,dmg:45,spd:4},cd:220},{fn:'rain',opts:{n:12,dmg:45,spd:5},cd:240}]},
  matatabi:{name:'МАТАТАБИ',tails:2,color:'#3b82f6',r:50,speed:0.9,contactDamage:70,attacks:[{fn:'fan',opts:{n:7,spread:0.22,dmg:65,spd:4.5},cd:120},{fn:'homing',opts:{n:5,dmg:70,spd:2.5},cd:190},{fn:'dash',opts:{spd:10,dur:35},cd:220},{fn:'radial',opts:{n:16,dmg:48,spd:3.5},cd:170}]},
  isobu:{name:'ИСОБУ',tails:3,color:'#0891b2',r:58,speed:1,contactDamage:85,attacks:[{fn:'fan',opts:{n:11,spread:0.15,dmg:48,spd:4},cd:130},{fn:'spiral',opts:{waves:5,n:6,dmg:40,spd:3},cd:220},{fn:'wall',opts:{n:11,dmg:55},cd:200},{fn:'radial',opts:{n:20,dmg:44},cd:180}]},
  songoku:{name:'СОН ГОКУ',tails:4,color:'#dc2626',r:60,speed:1,contactDamage:90,attacks:[{fn:'fan',opts:{n:9,spread:0.2,dmg:70,spd:5},cd:130},{fn:'telegraph',opts:{n:4,dmg:160,r:100},cd:190},{fn:'radial',opts:{n:18,dmg:55},cd:170},{fn:'dash',opts:{spd:11,dur:40},cd:230}]},
  kokuo:{name:'КОКУО',tails:5,color:'#94a3b8',r:56,speed:1,contactDamage:85,attacks:[{fn:'radial',opts:{n:18,dmg:52,spd:4},cd:140},{fn:'spiral',opts:{waves:6,n:5,dmg:44,delay:6},cd:210},{fn:'dash',opts:{spd:12,dur:35},cd:220},{fn:'beams',opts:{n:5,dmg:80,w:20},cd:250}]},
  saiken:{name:'САЙКЕН',tails:6,color:'#84cc16',r:54,speed:1,contactDamage:80,attacks:[{fn:'homing',opts:{n:6,dmg:65,spd:2.2},cd:170},{fn:'fan',opts:{n:11,spread:0.16,dmg:55},cd:140},{fn:'rain',opts:{n:18,dmg:40,spd:5},cd:230},{fn:'spiral',opts:{waves:5,n:6,dmg:40,spd:2.8},cd:220}]},
  chomei:{name:'ЧЁМЕИ',tails:7,color:'#22c55e',r:52,speed:1.8,contactDamage:80,attacks:[{fn:'spiral',opts:{waves:7,n:5,dmg:48,delay:5},cd:190},{fn:'beam',opts:{dmg:110,w:25},cd:220},{fn:'fan',opts:{n:11,spread:0.18,dmg:55},cd:140},{fn:'radial',opts:{n:22,dmg:44},cd:180}]},
  gyuki:{name:'ГЬЮКИ',tails:8,color:'#a855f7',r:62,speed:1,contactDamage:90,attacks:[{fn:'beams',opts:{n:6,dmg:80,w:18},cd:220},{fn:'radial',opts:{n:20,dmg:55},cd:170},{fn:'wall',opts:{n:12,dmg:60,spd:5},cd:210},{fn:'spiral',opts:{n:6,waves:6,dmg:48,delay:6},cd:230}]},
  kurama:{name:'КУРАМА',tails:9,color:'#ff6600',r:65,speed:1,contactDamage:110,attacks:[{fn:'beams',opts:{n:7,dmg:88,w:20},cd:200},{fn:'spiral',opts:{waves:8,n:5,dmg:52,delay:4},cd:220},{fn:'radial',opts:{n:24,dmg:56,spd:4},cd:190},{fn:'telegraph',opts:{n:4,dmg:180,r:100},cd:230},{fn:'dash',opts:{spd:13,dur:45},cd:250}]}
};
const BOSS_KEYS=Object.keys(BOSSES);
const TIER_INFO = [
  {name:'ПРИМИТИВНЫЕ', color:'#888',    desc:'Не адаптируются'},
  {name:'ОБУЧЕННЫЕ',   color:'#4ade80', desc:'Предсказывают твои выстрелы'},
  {name:'ТАКТИЧЕСКИЕ', color:'#fbbf24', desc:'Управляют дистанцией, фланкируют'},
  {name:'ЭЛИТНЫЕ',     color:'#f97316', desc:'Отступают при HP<25%, фокусируют'},
  {name:'АДАПТИВНЫЕ',  color:'#dc2626', desc:'Контрят твою любимую способность'}
];
let enemyTier = 0;
let enemyTierBannerTimer = 0;
let enemyTierBannerText = '';
let enemyTierBannerSub = '';
let _tacticsCache = null;

function getEnemyTier(){ return Math.min(4, Math.floor((wave-1)/4)); }
function updateEnemyTier(){
  const nt = getEnemyTier();
  if(nt!==enemyTier){
    enemyTier = nt;
    const info = TIER_INFO[nt];
    enemyTierBannerText = `⚠ ВРАГИ: ${info.name}`;
    enemyTierBannerSub  = info.desc;
    enemyTierBannerTimer = 180;
    sfx(200,0.5,0.15,'sawtooth',0.5);
  }
}
function getPlayerTactics(){
  const t = {avgAggression:0.5,avgRange:200,topAbility:-1,isKiter:false,isBrawler:false,isCamper:false,campCorner:-1,sampleCount:0};
  if(!players.length)return t;
  let aggSum=0,rangeSum=0,rangeN=0;
  const abil=[0,0,0,0,0], corner=[0,0,0,0];
  let kiter=0,brawler=0,camper=0,valid=0;
  for(const p of players){
    if(!p.alive||!p.aiProfile)continue;
    const pr=p.aiProfile;
    if(pr.distSamples<30)continue;
    valid++;
    const tot=pr.aggressiveFrames+pr.retreatFrames;
    if(tot>0)aggSum+=pr.aggressiveFrames/tot;
    if(pr.distSamples>0){rangeSum+=pr.avgEnemyDist;rangeN++;}
    for(let i=0;i<5;i++)abil[i]+=pr.abilityUses[i];
    for(let i=0;i<4;i++)corner[i]+=pr.cornerCount[i];
    if(pr.retreatFrames>pr.totalFrames*0.25)kiter++;
    if(pr.aggressiveFrames>pr.totalFrames*0.4)brawler++;
    if(pr.stillFrames>pr.totalFrames*0.35)camper++;
  }
  if(valid===0)return t;
  t.sampleCount=valid;
  t.avgAggression=aggSum/valid;
  t.avgRange=rangeN>0?rangeSum/rangeN:200;
  t.isKiter=kiter>valid/2;
  t.isBrawler=brawler>valid/2;
  t.isCamper=camper>valid/2;
  let maxUse=0;
  for(let i=0;i<5;i++)if(abil[i]>maxUse){maxUse=abil[i];t.topAbility=i;}
  const cTot=corner.reduce((a,b)=>a+b,0);
  if(cTot>100){
    let mx=0,idx=-1;
    for(let i=0;i<4;i++)if(corner[i]>mx){mx=corner[i];idx=i;}
    if(mx/cTot>0.4)t.campCorner=idx;
  }
  return t;
}
function getEnemyAIParams(enemy,tgt,tactics){
  const tier=enemyTier;
  const isRanged = enemy.type==='ranger' || (enemy.specialType&&['soundArcher','kunaiMaster','puppetMaster'].includes(enemy.specialType));
  const ai = {tier,predict:0,prefDist:null,retreat:false,strafe:0,focusWeak:false,isRanged};
  if(tier===0)return ai;
  ai.predict = [0,6,12,18,24][tier];
  // ═══ В обороне — только предсказание стрельбы, БЕЗ управления дистанцией ═══
  if(phase==='defense'){
    ai.prefDist=null; ai.retreat=false; ai.strafe=0;
    return ai;
  }
  if(tier>=2 && tactics && tactics.sampleCount>0){
    if(isRanged){
      if(tactics.isBrawler)ai.prefDist=340;
      else if(tactics.isKiter)ai.prefDist=220;
      else ai.prefDist=280;
    }
    // Милишники prefDist НЕ используют — они всегда должны дойти до контакта.
    // Иначе они превращаются в "неподвижные турели" на 110-170px и не бьют.
  }
  if(tier>=3 && enemy.hp/enemy.maxHp<0.25 && !enemy.isBoss)ai.retreat=true;
  if(tier>=3 && !isRanged)ai.strafe=0.35;
  if(tier>=3 && isRanged)ai.focusWeak=true;
if(tier>=4 && tactics && tactics.topAbility>=0 && isRanged){
    if(tactics.topAbility===0)ai.prefDist=Math.max(ai.prefDist||0,180);
    else if(tactics.topAbility===2)ai.prefDist=Math.max(ai.prefDist||0,250);
    else if(tactics.topAbility===3)ai.retreat=true;
	else if(tactics.topAbility===1)ai.prefDist=Math.max(ai.prefDist||0,220);
  }
  return ai;
}
// ==================== END EVOLUTION ====================