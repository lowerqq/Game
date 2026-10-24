"use strict";
// ==================== CORE ====================
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height;
const ARENA={x:40,y:40,w:W-80,h:H-80};
let _nextNetId = 1; // ═══ НОВОЕ: ID для сетевых объектов ═══

// ==================== PHASE SYSTEM ====================
let phase='normal';
let defenseWave=0;
let defenseFailCount=0;
let defenseOutcome=null;
const BOSS_EVERY=12;
const DEFENSE_TOTAL_WAVES=4;
let DEFENSE_FAIL_MAX=10;

function getPhaseInfo(w){
  if(w%BOSS_EVERY===0) return {phase:'boss', defenseWave:0};
  return (w%2===1) ? {phase:'normal',defenseWave:0} : {phase:'defense',defenseWave:1};
}
function applyPhaseArena(){
  if(phase==='defense'){
    ARENA.x=80;  ARENA.y=180;
    ARENA.w=W-160; ARENA.h=H-380;
  } else {
    ARENA.x=40;  ARENA.y=40;
    ARENA.w=W-80; ARENA.h=H-80;
  }
}
// ==================== END PHASE ====================

const WAVE_DURATION=40*60;
const CD_MULTIPLIER=2;
let tickMs=0,pendingActions=[],waveClearTimer=0,allDeadTimer=0;
let state='menu',paused=false,mode=1;
let wave=0,waveTimer=0,spawnTimer=0,bossWaveActive=false,waveEnded=false;
let screenFlash=0,screenShake=0,hitStop=0,killFlash=0;
let waveBannerTimer=0,waveBannerMax=0,waveBannerSpecial=false;
let chibakuBalls=[];
let sasukeChoiceNeeded=false;
let damageNumbers=[],shockwaves=[],trails=[],telegraphs=[],beamWarnings=[],spawnMarkers=[];
let bosses=[],players=[],enemies=[],projectiles=[],enemyProjectiles=[],particles=[];
let clones=[],zones=[],pets=[],beams=[],mines=[],anbuSquads=[],tornadoes=[],cocoons=[],swarms=[],tentenSeals=[],tentenSwords=[],whiteFangSwords=[];
let p1Char='naruto',p2Char='sasuke',charSelectTurn=0,autoChoiceState=null;

const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&state==='playing')paused=!paused;if(e.code==='KeyM')audioMuted=!audioMuted;initAudio();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});

// ==================== ЗВУК (WebAudio синтез) ====================
let AC=null,audioMuted=false;
function initAudio(){if(!AC&&window.AudioContext){try{AC=new AudioContext();}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();}
function sfx(freq=440,dur=0.1,vol=0.12,waveType='sine',sweep=0){
  if(!AC||audioMuted)return;
  try{
    const o=AC.createOscillator(),g=AC.createGain();
    o.type=waveType;o.frequency.setValueAtTime(freq,AC.currentTime);
    if(sweep!==0)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*sweep),AC.currentTime+dur);
    g.gain.setValueAtTime(vol,AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+dur);
    o.connect(g);g.connect(AC.destination);
    o.start();o.stop(AC.currentTime+dur);
  }catch(e){}
}
function sfxHit(){sfx(800,0.04,0.06,'square',0.5);}
function sfxBoom(){sfx(120,0.22,0.15,'sawtooth',0.4);}
function sfxCast(){sfx(400,0.12,0.10,'triangle',1.5);}
function sfxUlt(){sfx(600,0.4,0.18,'triangle',0.3);}
function sfxHurt(){sfx(200,0.1,0.10,'sawtooth',0.5);}
function sfxWave(){sfx(500,0.25,0.12,'sine',1.2);}
function sfxCoin(){sfx(1200,0.05,0.06,'sine',1.5);}
// ==================== END SOUND ====================

const mouse={x:0,y:0,clicked:false};
let canvasRect=canvas.getBoundingClientRect();
addEventListener('resize',()=>{canvasRect=canvas.getBoundingClientRect();});
canvas.addEventListener('mousemove',e=>{mouse.x=(e.clientX-canvasRect.left)*(W/canvasRect.width);mouse.y=(e.clientY-canvasRect.top)*(H/canvasRect.height);});
canvas.addEventListener('mousedown',()=>{mouse.clicked=true;initAudio();});
canvas.addEventListener('touchstart',e=>{const t=e.touches[0];const r=canvas.getBoundingClientRect();mouse.x=(t.clientX-r.left)*(W/r.width);mouse.y=(t.clientY-r.top)*(H/r.height);mouse.clicked=true;initAudio();e.preventDefault();},{passive:false});
canvas.addEventListener('touchmove',e=>{const t=e.touches[0];const r=canvas.getBoundingClientRect();mouse.x=(t.clientX-r.left)*(W/r.width);mouse.y=(t.clientY-r.top)*(H/r.height);e.preventDefault();},{passive:false});
canvas.addEventListener('touchend',e=>e.preventDefault(),{passive:false});

window.DEBUG={godmode:false,setWave:(n)=>{if(state!=='playing')return;wave=n-1;nextWave();},killAll:()=>{for(const e of[...enemies])e.die(null);for(const b of[...bosses])b.die(null);}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);
const dist2=(a,b)=>{const dx=a.x-b.x,dy=a.y-b.y;return dx*dx+dy*dy;};
function pointSegmentDist(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1;const l2=dx*dx+dy*dy;if(l2===0)return Math.hypot(px-x1,py-y1);let t=((px-x1)*dx+(py-y1)*dy)/l2;t=clamp(t,0,1);return Math.hypot(px-(x1+t*dx),py-(y1+t*dy));}
function angleDiff(a,b){let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}
function fisherYates(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=arr[i];arr[i]=arr[j];arr[j]=t;}return arr;}
function findNearestTarget(from,maxDist=Infinity){let best=null,bd=maxDist===Infinity?Infinity:maxDist*maxDist;for(const e of enemies){if(e.removed)continue;const d=dist2(from,e);if(d<bd){bd=d;best=e;}}for(const b of bosses){if(b.removed)continue;const d=dist2(from,b);if(d<bd){bd=d;best=b;}}return best;}
function findNearestUnlinkedTarget(from,maxDist,owner){
  const maxR2=maxDist===Infinity?Infinity:maxDist*maxDist;
  let best=null,bd=maxR2;
  for(const e of enemies){if(e.removed)continue;if(owner&&e.shadowWebTimer>0&&e.shadowWebOwner===owner)continue;const d=dist2(from,e);if(d<bd){bd=d;best=e;}}
  for(const b of bosses){if(b.removed)continue;if(owner&&b.shadowWebTimer>0&&b.shadowWebOwner===owner)continue;const d=dist2(from,b);if(d<bd){bd=d;best=b;}}
  return best;
}
function findNearestPlayer(from,maxDist=Infinity){
  let best=null,bd=maxDist===Infinity?Infinity:maxDist*maxDist;
  for(const p of players){if(!p.alive||p.vanishedTimer>0||p.sakuraJumpActive)continue;const d=dist2(from,p);if(d<bd){bd=d;best=p;}}
  return best;
}
function getTargetsInRadius(from,radius){const r2=radius*radius;const list=[];for(const e of enemies){if(e.removed)continue;if(dist2(from,e)<r2)list.push(e);}for(const b of bosses){if(b.removed)continue;if(dist2(from,b)<r2)list.push(b);}return list;}
function findTargetInCone(from,aim,range,halfCone=Math.PI/2.5){const rangeSq=range===Infinity?Infinity:range*range;let best=null,bestScore=-Infinity;const check=(e)=>{if(e.removed)return;const dx=e.x-from.x,dy=e.y-from.y;const d2=dx*dx+dy*dy;if(d2>rangeSq)return;const d=Math.sqrt(d2)||1;const ang=Math.atan2(dy,dx);const diff=Math.abs(angleDiff(ang,aim));if(diff>halfCone)return;const score=(1-diff/halfCone)*10-d/Math.max(range===Infinity?1000:range,1);if(score>bestScore){bestScore=score;best=e;}};for(const e of enemies)check(e);for(const b of bosses)check(b);return best;}
function getAllTargetsInCone(from,aim,range,halfCone=Math.PI/2.5){const rangeSq=range===Infinity?Infinity:range*range;const list=[];const check=(e)=>{if(e.removed)return;const dx=e.x-from.x,dy=e.y-from.y;const d2=dx*dx+dy*dy;if(d2>rangeSq)return;const ang=Math.atan2(dy,dx);if(Math.abs(angleDiff(ang,aim))>halfCone)return;list.push({e,d2});};for(const e of enemies)check(e);for(const b of bosses)check(b);list.sort((a,b)=>a.d2-b.d2);return list.map(x=>x.e);}

const _particlePool=[],_damageNumberPool=[];
function emitParticle(x,y,vx,vy,life,color,r){
  if(particles.length>600)return;
  let p=_particlePool.pop();if(!p)p={x:0,y:0,vx:0,vy:0,life:0,maxLife:0,color:'#fff',r:1};p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.life=life;p.maxLife=life;p.color=color;p.r=r;particles.push(p);
}
function emitDamageNumber(x,y,vy,life,amount,color,isCrit,offset){
  if(damageNumbers.length>150)return;
  let d=_damageNumberPool.pop();if(!d)d={x:0,y:0,vy:0,life:0,maxLife:0,amount:0,color:'#fff',isCrit:false,offset:0};d.x=x;d.y=y;d.vy=vy;d.life=life;d.maxLife=life;d.amount=amount;d.color=color;d.isCrit=isCrit;d.offset=offset;damageNumbers.push(d);
}

const _enemySnapStack=[];let _enemySnapDepth=0;
function snapshotEnemies(){const depth=_enemySnapDepth++;let buf=_enemySnapStack[depth];if(!buf){buf=[];_enemySnapStack[depth]=buf;}else buf.length=0;for(let i=0;i<enemies.length;i++)buf.push(enemies[i]);for(let i=0;i<bosses.length;i++)buf.push(bosses[i]);return buf;}
function releaseEnemiesSnapshot(){_enemySnapDepth--;}
function forEachEnemySnapshot(fn){
  if(_enemySnapDepth>=8){console.warn('forEachEnemySnapshot depth limit');return;}
  const buf=snapshotEnemies();
  try{
    for(let i=0;i<buf.length;i++){
      const e=buf[i];
      if(e.removed)continue;
      if(fn(e)===false)break;
    }
  } finally {
    releaseEnemiesSnapshot();
  }
}
function removeEnemy(e){if(e.removed)return;e.removed=true;const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1);}
function scheduleAction(owner,delayFrames,action){
  if(pendingActions.length>80)return;
  pendingActions.push({owner,framesLeft:delayFrames,action});
}
function updatePendingActions(){
  const snapshot=pendingActions.slice();
  pendingActions.length=0;
  for(const pa of snapshot){
    pa.framesLeft--;
    if(pa.framesLeft<=0){
      const o=pa.owner;
      const ownerAlive=!o||(o.alive!==false&&!o.removed);
      if(state==='playing'&&ownerAlive){
        try{ pa.action(); }catch(err){ console.error(err); }
      }
    } else {
      pendingActions.push(pa);
    }
  }
}
function spawnDamageNumber(x,y,amount,color,isCrit){emitDamageNumber(x,y,-2-Math.random(),45,typeof amount==='string'?amount:Math.round(amount),color||'#fff',isCrit||false,(Math.random()-0.5)*20);}
function spawnShockwave(x,y,maxR,color){
  if(shockwaves.length>120)shockwaves.splice(0,shockwaves.length-120);
  shockwaves.push({x,y,r:5,maxR,life:20,maxLife:20,color});
}
function addTrail(x,y,color,r){
  if(trails.length>400)trails.splice(0,trails.length-400);
  trails.push({x,y,color,r,life:8,maxLife:8});
}
function spawnParticles(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=rand(1,6);emitParticle(x,y,Math.cos(a)*sp,Math.sin(a)*sp,30,col,rand(2,5));}}

const ZONES_MAX=40;
function addZone(z){if(zones.length>=ZONES_MAX)zones.shift();zones.push(z);return z;}

const SYMBOLS={naruto:'Н',sasuke:'С',sakura:'Ц',kiba:'И',hinata:'Х',shino:'Ш',lee:'Л',neji:'Д',tenten:'Т',ino:'О',shikamaru:'М',choji:'Ч',gaara:'Г',kankuro:'Ю',temari:'Ф'};
const upgradeCost=(lvl)=>lvl>=3?Infinity:[50,90,150][lvl];
const COMBO_COST=12;
const STAT_UPGRADES={
  autoDamage:{name:'Автоурон',short:'УРН',max:5,cost:l=>[80,120,180,260,360][l]||Infinity,val:l=>`+${l*15}%`,color:'#ef4444'},
  attackSpeed:{name:'Автоскор',short:'СКР',max:5,cost:l=>[80,120,180,260,360][l]||Infinity,val:l=>`-${l*6}%`,color:'#f59e0b'},
  hp:{name:'Жизни',short:'HP',max:6,cost:l=>[60,100,160,240,340,460][l]||Infinity,val:l=>`+${l*25}`,color:'#e74c3c'},
  defense:{name:'Защита',short:'ЗЩТ',max:5,cost:l=>[100,160,240,340,460][l]||Infinity,val:l=>`+${l}`,color:'#3b82f6'},
  regen:{name:'Реген',short:'РЕГ',max:30,cost:l=>60,val:l=>`+${(l*0.5).toFixed(1)}/с`,color:'#22c55e'}
};
const AUTO_UPGRADES={
  ricochet:{name:'Рекошет',desc:'+1 отскок от врагов',icon:'↻',color:'#a5f3fc'},
  explosive:{name:'Взрыв',desc:'+30px радиус',icon:'💥',color:'#f97316'},
  knockback:{name:'Отброс',desc:'+5 отброса',icon:'↔',color:'#fbbf24'},
  cdOnKill:{name:'Откат',desc:'-5% КД',icon:'⏱',color:'#f39c12'},
  slow:{name:'Замедление',desc:'+2с',icon:'❄',color:'#a5f3fc'},
  circular:{name:'Круговая',desc:'+20px',icon:'◉',color:'#c084fc'},
  pierce:{name:'Прошив',desc:'+1',icon:'➤',color:'#ef4444'},
  mines:{name:'Мины',desc:'+2с',icon:'◈',color:'#84cc16'}
};
const AUTO_KEYS=Object.keys(AUTO_UPGRADES);