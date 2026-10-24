"use strict";
// ==================== SPAWN MARKER / DISSOLVE / WAVE SYSTEM ====================
function drawSpawnMarker(m){
  const t=1-m.timer/m.maxTimer;
  const isBossMarker=!!m.isBoss;const isSpecial=!!m.specialType||isBossMarker;
  const color=isBossMarker?'#ff6600':(isSpecial?'#ffd700':'#ff3333');
  const pulse=22+4*Math.sin(tickMs/80)+(isBossMarker?15:0);const outerR=26+(isBossMarker?15:0);
  ctx.globalAlpha=0.3+0.4*Math.sin(tickMs/100);ctx.strokeStyle=color;ctx.lineWidth=isBossMarker?5:3;
  ctx.beginPath();ctx.arc(m.x,m.y,pulse,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha=0.4;ctx.fillStyle=color;ctx.beginPath();ctx.arc(m.x,m.y,pulse*t,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=0.6;ctx.beginPath();ctx.arc(m.x,m.y,outerR,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font=isBossMarker?'bold 20px monospace':'bold 14px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  const icon=isBossMarker?'☠':(isSpecial?'★':'!');ctx.fillText(icon,m.x,m.y);
  ctx.textBaseline='alphabetic';ctx.textAlign='left';
}

function dissolveEnemy(e){
  if(e.removed)return;
  for(const p of players){if(!p.alive)continue;let base=e.specialType?(12+Math.floor(wave*1.5)):(e.type==='tank'?(6+wave):(3+Math.floor(wave/2)));if(e.isMinion)base=Math.max(1,Math.floor(base*0.4));p.coins+=base;
    if(p.hook&&p.hook.type==='kyuubiCloak')p.hookValue=Math.min(8,p.hookValue+1);
    if(p.charId==='tenten'){p.tentenAmmo[p.tentenAmmoType||0]=Math.min(20,(p.tentenAmmo[p.tentenAmmoType||0]||0)+3);}
  }
  for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,sp=rand(1,3);emitParticle(e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp,32,'#888',rand(2,4));}
  spawnShockwave(e.x,e.y,e.r*3,'#666');
  removeEnemy(e);
}

function clearMap(){
chibakuBalls.length=0;
  for(const p of particles)_particlePool.push(p);
  for(const d of damageNumbers)_damageNumberPool.push(d);
  enemies.length=0;projectiles.length=0;enemyProjectiles.length=0;
  particles.length=0;clones.length=0;zones.length=0;pets.length=0;
  beams.length=0;mines.length=0;tornadoes.length=0;
  bosses.length=0;telegraphs.length=0;cocoons.length=0;swarms.length=0;
  tentenSeals.length=0;tentenSwords.length=0;
  whiteFangSwords.length=0;
  damageNumbers.length=0;shockwaves.length=0;trails.length=0;
  beamWarnings.length=0;spawnMarkers.length=0;
  pendingActions.length=0;
  screenFlash=0;screenShake=0;hitStop=0;killFlash=0;waveBannerTimer=0;allDeadTimer=0;
}
function startRun(m,c1,c2){
  mode=m;wave=0;paused=false;
  enemyTier=0;enemyTierBannerTimer=0;
  phase='normal';defenseWave=0;defenseFailCount=0;defenseOutcome=null;
  applyPhaseArena();
  clearMap();autoChoiceState=null;waveClearTimer=0;allDeadTimer=0;anbuSquads=[];
  const cx=W/2,cy=H/2;
  if(mode===1){players=[new Player(cx,cy,c1,{up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD'},0,false)];}
  else{players=[new Player(cx-80,cy,c1,{up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD'},0,false),new Player(cx+80,cy,c2,{up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'},1,false)];}
  if(mode===2){players[0].dashKeys=['ShiftLeft'];players[1].dashKeys=['ShiftRight'];}
  nextWave();state='playing';
  if (isHost && socket && typeof socket.emit === 'function') {
    socket.emit('startGame', { p1Char: c1, p2Char: c2 });
  }
}
function getSpawnIntervalFrames(w){const s=Math.max(0.4,2.0-w*0.10);return Math.floor(s*60);}
function scheduleEnemySpawn(){
  const pos=edgeSpawn();
  let type=pickEnemyType(),specialType=null;
  if(wave>=3&&Math.random()<0.10+wave*0.012){specialType=SPECIAL_KEYS[Math.floor(Math.random()*SPECIAL_KEYS.length)];type='grunt';}
  spawnMarkers.push({x:pos.x,y:pos.y,timer:40,maxTimer:40,type,specialType,wave});
}
function spawnDefenseRound(){
  clearMap();
  respawnAkamaru();
  respawnWhiteFangSwords();
  waveTimer=0;spawnTimer=0;waveEnded=false;
  bossWaveActive=false;

  for(const p of players){
    if(!p.alive)continue;
    p.invuln=Math.max(p.invuln,60);
  }

  const isFinalDef = defenseWave >= DEFENSE_TOTAL_WAVES;
  const count      = Math.min(isFinalDef ? (10 + wave*2) : (6 + wave*2), 80);
  const spawnDelay = isFinalDef ? 18 : 25;
  const spawnStep  = isFinalDef ? 6  : 8;
  const forcedSpecials = isFinalDef ? 3 : 0;
  const baseChance = isFinalDef ? 0.20 : 0.08;
  let specialsSpawned = 0;

  for(let i=0;i<count;i++){
    const pos=edgeSpawn();
    let type=pickEnemyType(),specialType=null;
    const rollSpecial = (specialsSpawned < forcedSpecials) || (wave>=3 && Math.random()<baseChance+wave*0.01);
    if(rollSpecial){
      specialType=SPECIAL_KEYS[Math.floor(Math.random()*SPECIAL_KEYS.length)];
      type='grunt';
      specialsSpawned++;
    }
    spawnMarkers.push({x:pos.x,y:pos.y,timer:spawnDelay+i*spawnStep,maxTimer:spawnDelay+i*spawnStep,type,specialType,wave});
  }

  waveBannerSpecial=true;
  waveBannerTimer = isFinalDef ? 180 : 100;
  waveBannerMax   = waveBannerTimer;
  waveClearTimer=0;
  sfxWave();
  if(isFinalDef){
    sfx(180,0.5,0.15,'sawtooth',0.4);
    screenFlash=Math.max(screenFlash,20);
    screenShake=Math.max(screenShake,15);
  }
}
function respawnAkamaru(){
  for(const p of players){
    if(p.charId!=='kiba')continue;
    if(p.akamaruDeadCd>0)continue;
    const has=pets.some(pt=>pt.type==='akamaru'&&pt.owner===p&&pt.hp>0);
    if(!has){
      const pet=new Pet(p.x+30,p.y+30,p,'akamaru');
      pet.hp=pet.maxHp;
      pets.push(pet);
    }
  }
}
function respawnWhiteFangSwords(){
  for(const p of players){
    if(!p.alive)continue;
    const count=p.getArtifactStack('whiteFangTanto');
    for(let i=0;i<count;i++){
      const ang=Math.random()*Math.PI*2;
      const r=Math.min(ARENA.w,ARENA.h)*0.3;
      const sx=clamp(ARENA.x+ARENA.w/2+Math.cos(ang)*r,ARENA.x+80,ARENA.x+ARENA.w-80);
      const sy=clamp(ARENA.y+ARENA.h/2+Math.sin(ang)*r,ARENA.y+80,ARENA.y+ARENA.h-80);
      whiteFangSwords.push({x:sx,y:sy,owner:p});
    }
  }
}
function nextWave(){
  wave++;
  DEFENSE_FAIL_MAX = 10 + Math.floor(wave / 4) * 2;
  sasukeChoiceNeeded = players.some(p=>p.charId==='sasuke');
  updateEnemyTier();
  const info=getPhaseInfo(wave);
  phase=info.phase;
  defenseWave=info.defenseWave;
  applyPhaseArena();
  for(const p of players){
    if(!p.alive)continue;
    p.x=clamp(p.x,ARENA.x+p.r,ARENA.x+ARENA.w-p.r);
    p.y=clamp(p.y,ARENA.y+p.r,ARENA.y+ARENA.h-p.r);
  }
  for(const squad of anbuSquads){
    for(const a of squad.members){
      if(!a.alive)continue;
      a.x=clamp(a.x,ARENA.x+a.r,ARENA.x+ARENA.w-a.r);
      a.y=clamp(a.y,ARENA.y+a.r,ARENA.y+ARENA.h-a.r);
    }
  }
  clearMap();
  waveTimer=0;spawnTimer=0;waveEnded=false;

  if(wave>1){const bonus=30+wave*8;for(const p of players){if(p.alive)p.coins+=bonus;}}
  if(wave%BOSS_EVERY===BOSS_EVERY-1){
    for(const p of players){if(p.alive){p.coins+=150;spawnDamageNumber(p.x,p.y-60,'+150💰 ПЕРЕД БОССОМ','#ffd700',true);}}
  }

  for(const p of players)p.resetWaveState();
  respawnAkamaru();
  respawnWhiteFangSwords();
  for(const p of players){if(!p.alive){p.alive=true;p.hp=Math.max(1,p.maxHp*0.4);p.invuln=120;}else p.invuln=Math.max(p.invuln,90);}
  for(const squad of anbuSquads){for(const a of squad.members){if(a.alive)a.hp=a.maxHp;}}

  if(phase==='boss'){
    bossWaveActive=true;
    const cycle=Math.floor((wave-1)/BOSS_EVERY);
    const idx=cycle%BOSS_KEYS.length;
    const bossKey=BOSS_KEYS[idx];
    const pos=edgeSpawn();
    spawnMarkers.push({x:pos.x,y:pos.y,timer:90,maxTimer:90,isBoss:true,bossKey,wave});
    waveBannerSpecial=true;waveBannerTimer=200;waveBannerMax=200;waveClearTimer=0;
    sfxWave();
    return;
  }

  if(phase==='defense'){
    defenseWave=1;
    defenseFailCount=0;
    spawnDefenseRound();
    return;
  }
  
  respawnWhiteFangSwords();
  bossWaveActive=false;
  const initial=5+Math.min(7,Math.floor(wave/2));
  for(let i=0;i<initial;i++)scheduleEnemySpawn();
  spawnTimer=getSpawnIntervalFrames(wave);
  waveBannerSpecial=false;waveBannerTimer=100;waveBannerMax=100;waveClearTimer=0;
  sfxWave();
}
function pickEnemyType(){
  const r=Math.random();
  if(wave>=6&&r<0.05)return 'summoner';
  if(wave>=4&&r<0.13)return 'charger';
  if(wave>=3&&r<0.22)return 'ranger';
  if(wave>=2&&r<0.30)return 'kamikaze';
  if(wave>=5&&r<0.35)return 'healer2';
  if(wave>=3&&r<0.48)return 'tank';
  if(wave>=2&&r<0.65)return 'fast';
  return 'grunt';
}
function edgeSpawn(){
  if(phase==='defense'){
    return {x:ARENA.x+30, y:rand(ARENA.y+40, ARENA.y+ARENA.h-40)};
  }
  const s=Math.floor(Math.random()*4);
  if(s===0)return{x:rand(ARENA.x+30,ARENA.x+ARENA.w-30),y:ARENA.y+20};
  if(s===1)return{x:rand(ARENA.x+30,ARENA.x+ARENA.w-30),y:ARENA.y+ARENA.h-20};
  if(s===2)return{x:ARENA.x+20,y:rand(ARENA.y+30,ARENA.y+ARENA.h-30)};
  return{x:ARENA.x+ARENA.w-20,y:rand(ARENA.y+30,ARENA.y+ARENA.h-30)};
}

function updateParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vx*=0.9;p.vy*=0.9;p.life--;if(p.life<=0){_particlePool.push(p);particles.splice(i,1);}}}
function drawParticles(){for(const p of particles){ctx.globalAlpha=p.life/p.maxLife;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
function updateDamageNumbers(){for(let i=damageNumbers.length-1;i>=0;i--){const d=damageNumbers[i];d.y+=d.vy;d.vy*=0.94;d.life--;if(d.life<=0){_damageNumberPool.push(d);damageNumbers.splice(i,1);}}}
function drawDamageNumbers(){for(const d of damageNumbers){const a=d.life/d.maxLife;ctx.globalAlpha=a;const size=d.isCrit?26:18;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText(d.amount,d.x+d.offset,d.y);ctx.fillStyle=d.color;ctx.fillText(d.amount,d.x+d.offset,d.y);}ctx.globalAlpha=1;ctx.textAlign='left';}
function updateShockwaves(){for(let i=shockwaves.length-1;i>=0;i--){const s=shockwaves[i];s.r+=(s.maxR-s.r)*0.25;s.life--;if(s.life<=0)shockwaves.splice(i,1);}}
function drawShockwaves(){for(const s of shockwaves){const a=s.life/s.maxLife;ctx.globalAlpha=a*0.7;ctx.strokeStyle=s.color;ctx.lineWidth=3*a+1;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;}
function updateTrails(){for(let i=trails.length-1;i>=0;i--){trails[i].life--;if(trails[i].life<=0)trails.splice(i,1);}}
function drawTrails(){for(const t of trails){ctx.globalAlpha=(t.life/t.maxLife)*0.5;ctx.fillStyle=t.color;ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

function updatePlaying(){
if(sasukeChoiceNeeded){ state='sasukeMode'; return; }
  if(mouse.clicked&&isPauseHover()){paused=true;return;}
  if(!players.some(p=>p.alive)){allDeadTimer++;if(allDeadTimer>=60){allDeadTimer=0;state='dead';return;}}else{allDeadTimer=0;}
  const frozen=hitStop>0;if(frozen)hitStop--;
  if(!frozen){
    if(!bossWaveActive&&!waveEnded&&phase==='normal'){
      waveTimer++;spawnTimer--;
      if(spawnTimer<=0){
        if(enemies.length+bosses.length<50)scheduleEnemySpawn();
        spawnTimer=getSpawnIntervalFrames(wave);
      }
      if(waveTimer>=WAVE_DURATION){
        waveEnded=true;
        for(let i=spawnMarkers.length-1;i>=0;i--){const m=spawnMarkers[i];if(!m.isBoss&&!m.specialType)spawnMarkers.splice(i,1);}
        const regularCount=enemies.filter(e=>!e.specialType&&!e.removed).length;
        for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(!e.specialType)dissolveEnemy(e);}
        if(regularCount>0){screenFlash=25;screenShake=Math.max(screenShake,10);spawnShockwave(W/2,H/2,600,'#ffd700');spawnDamageNumber(W/2,H/2-120,'ВОЛНА ЗАВЕРШЕНА','#ffd700',true);}
      }
    }
    for(let i=spawnMarkers.length-1;i>=0;i--){
      const m=spawnMarkers[i];m.timer--;
      if(m.timer<=0){
        if(m.isBoss){bosses.push(new Boss(m.x,m.y,m.bossKey,m.wave));spawnShockwave(m.x,m.y,200,'#ff3030');spawnParticles(m.x,m.y,'#ff3030',60);screenFlash=30;screenShake=20;}
        else{const e=new Enemy(m.x,m.y,m.type,m.wave,m.specialType);enemies.push(e);spawnShockwave(m.x,m.y,60,m.specialType?'#ffd700':'#ff3333');spawnParticles(m.x,m.y,m.specialType?'#ffd700':'#ff3333',15);}
        spawnMarkers.splice(i,1);
      }
    }
    for(const p of players)p.update();
    forEachEnemySnapshot(e=>e.update());
    for(const squad of anbuSquads){for(const a of squad.members)a.update();}
    for(let i=projectiles.length-1;i>=0;i--){projectiles[i].update();if(projectiles[i].dead)projectiles.splice(i,1);}
    for(let i=enemyProjectiles.length-1;i>=0;i--){enemyProjectiles[i].update();if(enemyProjectiles[i].dead)enemyProjectiles.splice(i,1);}
    for(let i=clones.length-1;i>=0;i--)if(!clones[i].update())clones.splice(i,1);
    for(let i=pets.length-1;i>=0;i--)if(!pets[i].update())pets.splice(i,1);
    for(let i=zones.length-1;i>=0;i--)if(!zones[i].update())zones.splice(i,1);
    for(let i=chibakuBalls.length-1;i>=0;i--){if(!chibakuBalls[i].update())chibakuBalls.splice(i,1);}
    for(let i=mines.length-1;i>=0;i--){mines[i].update();if(mines[i].dead)mines.splice(i,1);}
    for(let i=tornadoes.length-1;i>=0;i--){tornadoes[i].update();if(tornadoes[i].dead)tornadoes.splice(i,1);}
    for(let i=tentenSeals.length-1;i>=0;i--){if(!tentenSeals[i].update())tentenSeals.splice(i,1);}
    for(let i=tentenSwords.length-1;i>=0;i--){if(!tentenSwords[i].update())tentenSwords.splice(i,1);}
    for(let i=cocoons.length-1;i>=0;i--){if(!cocoons[i].update())cocoons.splice(i,1);}
    for(let i=swarms.length-1;i>=0;i--){if(!swarms[i].update())swarms.splice(i,1);}
    for(let i=beams.length-1;i>=0;i--){beams[i].update();if(beams[i].dead)beams.splice(i,1);}
    for(let i=beamWarnings.length-1;i>=0;i--){beamWarnings[i].update();if(beamWarnings[i].dead)beamWarnings.splice(i,1);}
    for(let i=bosses.length-1;i>=0;i--)bosses[i].update();
    for(let i=telegraphs.length-1;i>=0;i--){telegraphs[i].update();if(telegraphs[i].dead)telegraphs.splice(i,1);}
    updatePendingActions();
    updateParticles();updateDamageNumbers();updateShockwaves();updateTrails();
  }
  if(screenFlash>0)screenFlash--;
  if(screenShake>0)screenShake--;
  if(killFlash>0)killFlash--;
  if(waveBannerTimer>0)waveBannerTimer--;
  if(enemyTierBannerTimer>0)enemyTierBannerTimer--;
  _tacticsCache = getPlayerTactics();
  const noEnemies=enemies.length===0&&bosses.length===0&&spawnMarkers.length===0;
  if(phase==='defense'){
    if(noEnemies){
      waveClearTimer++;
      if(waveClearTimer>=30){
        waveClearTimer=0;
        if(defenseWave>=DEFENSE_TOTAL_WAVES){ state='upgrade'; }
        else { defenseWave++; spawnDefenseRound(); }
      }
    } else waveClearTimer=0;
  } else if(bossWaveActive){
    if(bosses.length===0&&spawnMarkers.length===0){waveClearTimer++;if(waveClearTimer>=30){waveClearTimer=0;state='upgrade';}}
    else waveClearTimer=0;
  } else if(waveEnded&&noEnemies){
    waveClearTimer++;if(waveClearTimer>=30){waveClearTimer=0;state='upgrade';}
  } else waveClearTimer=0;
}

function getAutoChoicesForPlayer(p){
  const isMelee=!!p.character.meleeAuto;
  const isTenten=p.charId==='tenten';
  const meleeBlacklist=['ricochet','pierce'];
  const circularActive=p.autoUpgrades.circular>0;
  const projectileActive=p.autoUpgrades.ricochet>0||p.autoUpgrades.explosive>0||p.autoUpgrades.knockback>0||p.autoUpgrades.slow>0||p.autoUpgrades.pierce>0;
  const avail=[];
  for(const key of AUTO_KEYS){
    if(p.autoUpgrades[key]>=3)continue;
    if(isMelee&&meleeBlacklist.includes(key))continue;
    if(isTenten&&key==='circular')continue;
    if(circularActive&&key!=='circular'&&key!=='cdOnKill'&&key!=='mines')continue;
    if(projectileActive&&key==='circular')continue;
    avail.push(key);
  }
  if(avail.length===0)return[];
  fisherYates(avail);
  return avail.slice(0,Math.min(3,avail.length));
}

function beginAutoUpgradeSelection(){
  if(autoChoiceState!==null)return;
  
  let choiceForP0 = null, choiceForP1 = null;
  let autoAppliedForP0 = false, autoAppliedForP1 = false;
  
  const p0 = players[0];
  if(p0.currentAutoKey && p0.autoUpgrades[p0.currentAutoKey] < 3) {
    p0.autoUpgrades[p0.currentAutoKey]++;
    autoAppliedForP0 = true;
  } else {
    p0.currentAutoKey = null;
    if(AUTO_KEYS.filter(k=>p0.autoUpgrades[k]<3).length>0) choiceForP0 = getAutoChoicesForPlayer(p0);
  }
  
  if (players.length >= 2) {
    const p1 = players[1];
    if(p1.currentAutoKey && p1.autoUpgrades[p1.currentAutoKey] < 3) {
      p1.autoUpgrades[p1.currentAutoKey]++;
      autoAppliedForP1 = true;
    } else {
      p1.currentAutoKey = null;
      if(AUTO_KEYS.filter(k=>p1.autoUpgrades[k]<3).length>0) choiceForP1 = getAutoChoicesForPlayer(p1);
    }
  }
  
  if (!choiceForP0 && !choiceForP1) {
    nextWave(); state = 'playing'; return;
  }
  
  autoChoiceState = {
    choiceForP0, choiceForP1,
    autoAppliedForP0, autoAppliedForP1,
    hostPicked: false, clientPicked: false,
    hostKey: null, clientKey: null
  };
  state = 'autoUpgrade';
}

function drawAutoUpgradeScreen(){
  ctx.fillStyle='#0f0f18';ctx.fillRect(0,0,W,H);ctx.textAlign='center';
  
  if (typeof isClient !== 'undefined' && isClient) {
    const data = networkState && networkState.autoChoiceData;
    if (!data) return;
    ctx.fillStyle='#c084fc';ctx.font='bold 44px monospace';ctx.fillText(`ВОЛНА ${wave}: АВТО-АПГРЕЙД`,W/2,60);
    if (data.autoAppliedForP1) { ctx.fillStyle='#4caf50';ctx.font='bold 26px monospace';ctx.fillText('★ АВТО-ПРИМЕНЕНО',W/2,H/2); ctx.textAlign='left'; return; }
    if (!data.choiceForP1) { ctx.fillStyle='#888';ctx.font='bold 24px monospace';ctx.fillText('Все авто-атаки МАКС',W/2,H/2); ctx.textAlign='left'; return; }
    if (data.clientPicked) { ctx.fillStyle='#ffd700';ctx.font='bold 26px monospace';ctx.fillText('ОЖИДАНИЕ ХОСТА...',W/2,H/2); ctx.textAlign='left'; return; }
    
    const activeP = players[0];
    const choices = data.choiceForP1;
    const cardW=320,cardH=400,gap=40;const totalW=cardW*3+gap*2;const startX=(W-totalW)/2,cardY=180;
    for(let i=0;i<3;i++){
      const key=choices[i],up=AUTO_UPGRADES[key];const x=startX+i*(cardW+gap);
      const lvl=activeP.autoUpgrades[key];const isMaxed=lvl>=3;const hov=isHover(x,cardY,cardW,cardH);
      ctx.fillStyle=hov&&!isMaxed?'#2a2a4a':'#1a1a2e';ctx.fillRect(x,cardY,cardW,cardH);
      ctx.strokeStyle=isMaxed?'#444':up.color;ctx.lineWidth=hov?4:2;ctx.strokeRect(x,cardY,cardW,cardH);
      ctx.fillStyle=up.color;ctx.font='bold 64px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(up.icon,x+cardW/2,cardY+80);ctx.textBaseline='alphabetic';
      ctx.fillStyle='#eee';ctx.font='bold 24px monospace';ctx.fillText(up.name,x+cardW/2,cardY+160);
      ctx.fillStyle='#bbb';ctx.font='14px monospace';ctx.fillText(up.desc,x+cardW/2,cardY+200);
      ctx.fillStyle=up.color;ctx.font='bold 22px monospace';ctx.fillText(`Уровень: ${lvl}/3`,x+cardW/2,cardY+260);
    }
    ctx.textAlign='left';
    return;
  }
  
  if(!autoChoiceState)return;
  ctx.fillStyle='#c084fc';ctx.font='bold 44px monospace';ctx.fillText(`ВОЛНА ${wave}: АВТО-АПГРЕЙД`,W/2,60);
  if (!autoChoiceState.choiceForP0) { ctx.fillStyle='#4caf50';ctx.font='bold 26px monospace';ctx.fillText('★ АВТО-ПРИМЕНЕНО (ждем клиента)',W/2,H/2); ctx.textAlign='left'; return; }
  if (autoChoiceState.hostPicked) { ctx.fillStyle='#ffd700';ctx.font='bold 26px monospace';ctx.fillText('ОЖИДАНИЕ КЛИЕНТА...',W/2,H/2); ctx.textAlign='left'; return; }
  
  const choices = autoChoiceState.choiceForP0;
  const activeP = players[0];
  const cardW=320,cardH=400,gap=40;const totalW=cardW*3+gap*2;const startX=(W-totalW)/2,cardY=180;
  for(let i=0;i<3;i++){
    const key=choices[i],up=AUTO_UPGRADES[key];const x=startX+i*(cardW+gap);
    const lvl=activeP.autoUpgrades[key];const isMaxed=lvl>=3;const hov=isHover(x,cardY,cardW,cardH);
    ctx.fillStyle=hov&&!isMaxed?'#2a2a4a':'#1a1a2e';ctx.fillRect(x,cardY,cardW,cardH);
    ctx.strokeStyle=isMaxed?'#444':up.color;ctx.lineWidth=hov?4:2;ctx.strokeRect(x,cardY,cardW,cardH);
    ctx.fillStyle=up.color;ctx.font='bold 64px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(up.icon,x+cardW/2,cardY+80);ctx.textBaseline='alphabetic';
    ctx.fillStyle='#eee';ctx.font='bold 24px monospace';ctx.fillText(up.name,x+cardW/2,cardY+160);
    ctx.fillStyle='#bbb';ctx.font='14px monospace';ctx.fillText(up.desc,x+cardW/2,cardY+200);
    ctx.fillStyle=up.color;ctx.font='bold 22px monospace';ctx.fillText(`Уровень: ${lvl}/3`,x+cardW/2,cardY+260);
  }
  ctx.textAlign='left';
}

function updateAutoUpgradeScreen(){
  if(!mouse.clicked)return;
  
  if (typeof isClient !== 'undefined' && isClient) {
    const data = networkState && networkState.autoChoiceData;
    if (!data || !data.choiceForP1 || data.clientPicked) return;
    const cardW=320,cardH=400,gap=40;const totalW=cardW*3+gap*2;const startX=(W-totalW)/2,cardY=180;
    for(let i=0;i<3;i++){
      const x=startX+i*(cardW+gap);
      if(isHover(x,cardY,cardW,cardH)){
        socket.emit('clientAutoChoose', { key: data.choiceForP1[i] });
        return;
      }
    }
    return;
  }
  
  if (!autoChoiceState || !autoChoiceState.choiceForP0 || autoChoiceState.hostPicked) return;
  const cardW=320,cardH=400,gap=40;const totalW=cardW*3+gap*2;const startX=(W-totalW)/2,cardY=180;
  for(let i=0;i<3;i++){
    const x=startX+i*(cardW+gap);
    if(isHover(x,cardY,cardW,cardH)){
      autoChoiceState.hostKey = autoChoiceState.choiceForP0[i];
      autoChoiceState.hostPicked = true;
      tryAdvanceAutoUpgrade();
      return;
    }
  }
}

const PAUSE_BTN={x:W-150,y:8,w:140,h:32};
const isHover=(x,y,w,h)=>mouse.x>=x&&mouse.x<=x+w&&mouse.y>=y&&mouse.y<=y+h;
const isPauseHover=()=>isHover(PAUSE_BTN.x,PAUSE_BTN.y,PAUSE_BTN.w,PAUSE_BTN.h);
function drawButton(x,y,w,h,text,color,hover){ctx.fillStyle=hover?'#2a2a4a':'#1e1e36';ctx.fillRect(x,y,w,h);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);ctx.fillStyle='#eee';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x+w/2,y+h/2);ctx.textBaseline='alphabetic';ctx.textAlign='left';}
function wrapText(text,x,y,maxW,lineH){const words=text.split(' ');let line='',ly=y;for(const w of words){const test=line+w+' ';if(ctx.measureText(test).width>maxW){ctx.fillText(line,x,ly);line=w+' ';ly+=lineH;}else line=test;}ctx.fillText(line,x,ly);}
function wrapTextAt(text,x,y,maxW,lineH){const words=text.split(' ');let line='',ly=y;for(const w of words){const test=line+w+' ';if(ctx.measureText(test).width>maxW){ctx.fillText(line,x,ly);line=w+' ';ly+=lineH;}else line=test;}ctx.fillText(line,x,ly);return ly;}

function drawAbilityBar(p){
  if(!p.alive)return;
  const boxW=62,boxH=62,gap=6;const totalW=boxW*4+gap*3;const y=H-boxH-8;
  const startX=(p.id===0)?10:W-10-totalW;
  for(let i=0;i<4;i++){
        const ab=p.abilities[i];const x=startX+i*(boxW+gap);
    const cd=p.cooldowns[i];const up=p.abilityUpgrades[i];
    const cdMax=Math.ceil(ab.cd*(1-up.cooldown*0.2)*CD_MULTIPLIER)||1;
    const isUlt=ab.ult;const noRes=!p.hookCanCast(i);
    ctx.fillStyle='#1a1a2e';ctx.fillRect(x,y,boxW,boxH);
    ctx.strokeStyle=isUlt?'#ffd700':(noRes?'#f55':p.color);
    ctx.lineWidth=2;ctx.strokeRect(x,y,boxW,boxH);
    if(p.charId==='lee'&&i===3&&p.leeGateCount===7){
      const pulse=0.5+0.5*Math.sin(tickMs/150);
      ctx.strokeStyle=`rgba(255,0,0,${pulse})`;ctx.lineWidth=4;
      ctx.strokeRect(x-2,y-2,boxW+4,boxH+4);
      ctx.fillStyle=`rgba(255,50,50,${0.7+pulse*0.3})`;ctx.font='bold 9px monospace';
      ctx.textAlign='center';ctx.fillText('⚠ СМЕРТЬ',x+boxW/2,y-4);ctx.textAlign='left';
    }
    if(cd>0){
      const ratio=clamp(cd/cdMax,0,1);ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(x,y,boxW,boxH*ratio);
      ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(Math.ceil(cd/60),x+boxW/2,y+boxH/2);ctx.textBaseline='alphabetic';ctx.textAlign='left';
    } else {
      ctx.fillStyle=isUlt?'#ffd700':(noRes?'#888':'#eee');ctx.font='bold 20px monospace';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(p.abilityLabels[i],x+boxW/2,y+22);
      ctx.fillStyle=noRes?'#f55':'#aaa';ctx.font='9px monospace';
      ctx.fillText(ab.name.slice(0,11),x+boxW/2,y+45);
      ctx.textBaseline='alphabetic';ctx.textAlign='left';
    }
  }
  ctx.fillStyle='#ffd700';ctx.font='bold 16px monospace';
  const coinX=(p.id===0)?10:W-10-totalW;
  ctx.fillText(`💰 ${p.coins}`,coinX,H-boxH-18);
  ctx.fillStyle=p.comboPoints>=COMBO_COST?'#ffd700':'#888';
  const comboLabel=p.comboPoints>=COMBO_COST?`⚡ ${p.comboPoints}/${COMBO_COST} [${p.comboUltLabel}]`:`⚡ ${p.comboPoints}/${COMBO_COST} (${((60-p.comboStreakTimer)/60).toFixed(1)}с)`;
  ctx.fillText(comboLabel,coinX+100,H-boxH-18);
  ctx.fillStyle='#4ade80';ctx.font='bold 11px monospace';
  ctx.fillText(`💗 ${Math.round(p.hp)}/${p.maxHp}  ⚕ ${p.regenPerSec.toFixed(1)}/с`,coinX,H-boxH-32);
  if(p.hook){
    const hx=coinX,hy=H-boxH-56;ctx.font='bold 12px monospace';ctx.fillStyle=p.hook.color;
    ctx.fillText(p.hook.name,hx,hy);
    const t=p.hook.type;
    if(t==='kyuubiCloak'){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText(`${p.hookValue}/8`,hx,hy+14);}
    else if(t==='punchCharge'){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText(`${Math.floor(p.hookValue)}/3`,hx,hy+14);}
    else if(t==='byakugoSeal'){
      const bw=100,bh=10,bx=hx,by=hy+2;
      ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);
      const ratio=clamp((p.hookValue||0)/12,0,1);
      const grad=ctx.createLinearGradient(bx,0,bx+bw,0);
      grad.addColorStop(0,'#f472b6');grad.addColorStop(1,'#fbcfe8');
      ctx.fillStyle=grad;ctx.fillRect(bx,by,bw*ratio,bh);
      for(let i=1;i<4;i++){ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(bx+bw*i/4-1,by,2,bh);}
      ctx.fillStyle='#fff';ctx.font='bold 12px monospace';
      ctx.fillText(`Печать: ${Math.floor(p.hookValue||0)}/12`,bx,by+24);
      ctx.fillStyle='#fbcfe8';ctx.font='bold 10px monospace';
      if((p.hookValue||0)>=12)ctx.fillText('★ Q/R ×3.4 | SP → 12/12',bx,by+38);
else if((p.hookValue||0)>0)ctx.fillText('Q/R тратят | SP → 12/12',bx,by+38);
      else ctx.fillText('СТОЙ=×3 | ХОД=×1 | SP=12',bx,by+38);
    }
    else if(t==='stances'){
      const names=['КУНАИ','ВЗРЫВ','СЮРИКЕНЫ','МЕЧИ'];
      const cols=['#cbd5e1','#f97316','#a5f3fc','#e2e8f0'];
      const idx=p.tentenStanceIndex||0;
      ctx.fillStyle=cols[idx];ctx.font='bold 13px monospace';
      ctx.fillText(`⚔ ${names[idx]}`,hx,hy+14);
      ctx.fillStyle='#fff';ctx.font='bold 11px monospace';
      ctx.fillText('[F] — сменить стойку',hx,hy+28);
    }
    else if(t==='calories'){
      const bw=100,bh=8,bx=hx,by=hy+2;
      ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);
      ctx.fillStyle='#fbbf24';ctx.fillRect(bx,by,bw*clamp(p.calories/p.maxCalories,0,1),bh);
      ctx.fillStyle='#fff';ctx.font='bold 11px monospace';
      ctx.fillText(`${Math.floor(p.calories)}/${p.maxCalories} кал`,bx,by+22);
    }
    else if(t==='sand'){
      const bw=100,bh=8,bx=hx,by=hy+2;
      ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);
      ctx.fillStyle=p.hook.color;ctx.fillRect(bx,by,bw*clamp(p.hookValue/p.hookMax,0,1),bh);
      ctx.fillStyle='#fff';ctx.font='bold 11px monospace';
      const absorb=clamp(p.timeSinceHit/60*0.05,0,0.75);
      ctx.fillText(`Блок: ${Math.round(absorb*100)}%`,bx,by+22);
      if(p.sandWaveTimer>0){ctx.fillStyle='#fbbf24';ctx.font='bold 11px monospace';ctx.fillText(`Волна: ${Math.ceil(p.sandWaveTimer/60)}с`,bx,by+36);}
    }
    else if(t==='gust'){
      const openSec=Math.ceil((600-(p.fanOpenTimer||0))/60);
      ctx.fillStyle='#fff';ctx.font='bold 12px monospace';
      ctx.fillText(`Веер: ${p.fanLevel||1}/3 (${openSec}с)`,hx,hy+14);
    }
	    else if(t==='wolfMark'){
      ctx.fillStyle='#fff';ctx.font='bold 12px monospace';
      if(p.wolfMarkTarget&&!p.wolfMarkTarget.removed&&p.wolfMarkTarget.wolfMarkTimer>0){
        const secs=Math.ceil(p.wolfMarkTarget.wolfMarkTimer/60);
        ctx.fillText(`🎯 Метка: ${secs}с`,hx,hy+14);
        ctx.fillStyle='#d4b483';ctx.font='bold 10px monospace';
        ctx.fillText('Крит ×3!',hx,hy+28);
      } else {
        ctx.fillStyle='#a88';
        ctx.fillText(`Смена: ${Math.ceil(p.wolfMarkSwitchTimer/60)}с`,hx,hy+14);
      }
    }
    else if(t==='comboCounter'){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText(`${p.hookValue}/20`,hx,hy+14);}
    else if(t==='seals'){
      const bw=100,bh=8,bx=hx,by=hy+2;
      ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);
      ctx.fillStyle=p.hook.color;ctx.fillRect(bx,by,bw*clamp(p.hakkeCount/8,0,1),bh);
      ctx.fillStyle='#fff';ctx.font='bold 11px monospace';
      ctx.fillText(`Печати: ${p.hakkeCount}/8`,bx,by+22);
    }
    else if(t==='dashBurst'){
      ctx.fillStyle='#a78bfa';ctx.font='bold 13px monospace';
      ctx.fillText(`⚡ Импульс: ${p.dashCharges}/${p.maxDashCharges}`,hx,hy+14);
      ctx.fillStyle='#fff';ctx.font='bold 10px monospace';
      ctx.fillText('Рывок → AoE + снос снарядов',hx,hy+28);
    }
  }
}

function drawArena(){
  const bg=ctx.createRadialGradient(W/2,H/2,100,W/2,H/2,W*0.8);
  bg.addColorStop(0,'#1e1e3a');bg.addColorStop(1,'#0a0a1a');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(90,90,160,0.12)';ctx.lineWidth=1;
  for(let x=ARENA.x;x<=ARENA.x+ARENA.w;x+=50){ctx.beginPath();ctx.moveTo(x,ARENA.y);ctx.lineTo(x,ARENA.y+ARENA.h);ctx.stroke();}
  for(let y=ARENA.y;y<=ARENA.y+ARENA.h;y+=50){ctx.beginPath();ctx.moveTo(ARENA.x,y);ctx.lineTo(ARENA.x+ARENA.w,y);ctx.stroke();}
  const v=ctx.createRadialGradient(ARENA.x+ARENA.w/2,ARENA.y+ARENA.h/2,ARENA.h*0.3,ARENA.x+ARENA.w/2,ARENA.y+ARENA.h/2,ARENA.h*0.85);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle=v;ctx.fillRect(ARENA.x,ARENA.y,ARENA.w,ARENA.h);
  ctx.shadowColor='#6670ff';ctx.shadowBlur=15;
  ctx.strokeStyle='#5a5ac0';ctx.lineWidth=3;
  ctx.strokeRect(ARENA.x,ARENA.y,ARENA.w,ARENA.h);
  ctx.shadowBlur=0;
  if(phase==='defense'){
    const edgeX=ARENA.x+ARENA.w;
    const grad=ctx.createLinearGradient(edgeX-140,0,edgeX,0);
    grad.addColorStop(0,'rgba(255,30,30,0)');
    grad.addColorStop(1,'rgba(255,30,30,0.30)');
    ctx.fillStyle=grad;
    ctx.fillRect(edgeX-140,ARENA.y,140,ARENA.h);
    ctx.strokeStyle='#ff3030';ctx.lineWidth=4;
    ctx.setLineDash([15,10]);ctx.lineDashOffset=-tickMs/50;
    ctx.beginPath();ctx.moveTo(edgeX,ARENA.y);ctx.lineTo(edgeX,ARENA.y+ARENA.h);ctx.stroke();
    ctx.setLineDash([]);ctx.lineDashOffset=0;
    ctx.fillStyle='#ff3030';ctx.font='bold 15px monospace';ctx.textAlign='center';
    ctx.save();ctx.translate(edgeX-55,ARENA.y+ARENA.h/2);ctx.rotate(Math.PI/2);
    ctx.fillText('⚠ ЛИНИЯ ПРОРЫВА ⚠',0,0);ctx.restore();ctx.textAlign='left';
  }
}
function drawDashIndicator(p,x,y,align){
  const dotR=7,dotGap=6;
  const dotW=dotR*2+dotGap;
  const label='РЫВОК ';
  ctx.font='bold 12px monospace';
  const labelW=ctx.measureText(label).width;
  const totalW=labelW+p.maxDashCharges*dotW;
  const startX=(align==='right')?x-totalW:x;
  const dotsStartX=startX+labelW;
  ctx.textAlign='left';
  ctx.fillStyle='#a5f3fc';
  ctx.fillText(label,startX,y+4);
  for(let i=0;i<p.maxDashCharges;i++){
    const cx=dotsStartX+i*dotW+dotR;
    const cy=y;
    if(i<p.dashCharges){
      ctx.fillStyle='#67e8f9';
      ctx.beginPath();ctx.arc(cx,cy,dotR,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();
    } else {
      ctx.strokeStyle='#555';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(cx,cy,dotR,0,Math.PI*2);ctx.stroke();
    }
  }
  if(p.dashCharges<p.maxDashCharges){
    const prog=p.dashRechargeTimer/(15*60);
    const cx=dotsStartX+p.dashCharges*dotW+dotR;
    ctx.strokeStyle='#67e8f9';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(cx,y,dotR-1,-Math.PI/2,-Math.PI/2+Math.PI*2*prog);ctx.stroke();
  }
}
function drawHUD(){
  ctx.fillStyle='#eee';ctx.font='bold 22px monospace';ctx.textAlign='left';
  if(phase==='defense'){
    const isFinal = defenseWave>=DEFENSE_TOTAL_WAVES;
    ctx.fillStyle=isFinal?'#ff3030':'#eee';
    ctx.fillText(`🛡 РАУНД ${defenseWave}/${DEFENSE_TOTAL_WAVES}`,10,25);
    ctx.fillStyle='#eee';
    ctx.fillText(`Врагов: ${enemies.length}`,340,25);
    ctx.textAlign='center';ctx.font='bold 26px monospace';
    ctx.fillStyle=defenseFailCount>=7?'#ff3030':(defenseFailCount>=4?'#ffa500':'#ffd700');
    ctx.fillText(`⚠ ПРОВАЛ: ${defenseFailCount}/${DEFENSE_FAIL_MAX}`,W/2,32);
    const pipTotal=DEFENSE_TOTAL_WAVES;const pipGap=26;const pipStartX=W/2-(pipTotal-1)*pipGap/2;const pipY=70;
    for(let i=0;i<pipTotal;i++){
      const filled = i < defenseWave;const isLastPip = i===pipTotal-1;const r = isLastPip ? 10 : 8;
      ctx.beginPath();ctx.arc(pipStartX+i*pipGap, pipY, r, 0, Math.PI*2);
      ctx.fillStyle = filled ? (isLastPip?'#ff3030':'#ff9060') : 'rgba(40,40,60,0.8)';
      ctx.fill();ctx.strokeStyle = filled ? '#fff' : '#555';ctx.lineWidth = 2;ctx.stroke();
    }
    ctx.textAlign='left';
  } else if(phase==='boss'){
    ctx.fillStyle='#ff3030';ctx.fillText(`⚔ БОСС (волна ${wave}) ⚔`,10,25);
    ctx.fillStyle='#eee';ctx.fillText(`Врагов: ${enemies.length+bosses.length}`,340,25);
  } else {
    ctx.fillText(`ВОЛНА ${wave}`,10,25);
    ctx.fillText(`Врагов: ${enemies.length+bosses.length}`,180,25);
  }
  const wavesToBoss=(wave%BOSS_EVERY===0)?0:BOSS_EVERY-(wave%BOSS_EVERY);
  ctx.textAlign='right';ctx.font='bold 13px monospace';ctx.fillStyle='#c084fc';
  if(wavesToBoss===0)ctx.fillText('★ СЕЙЧАС БОСС ★',W-170,25);
  else ctx.fillText(`до босса: ${wavesToBoss}`,W-170,25);
  if(enemyTier>0){
    ctx.fillStyle=TIER_INFO[enemyTier].color;
    ctx.fillText(`🧠 ${TIER_INFO[enemyTier].name} [T${enemyTier}]`,W-170,45);
  }
  ctx.textAlign='left';

  const nonAI=players.filter(p=>!p.isAI);
  if(nonAI.length>=1)drawDashIndicator(nonAI[0],10,110,'left');

  if(phase==='normal'&&!waveEnded){
    const remainSec=Math.max(0,Math.ceil((WAVE_DURATION-waveTimer)/60));
    ctx.textAlign='center';ctx.font='bold 32px monospace';
    ctx.fillStyle=remainSec<=10?'#e33':'#ffd700';
    ctx.fillText(`${remainSec}с`,W/2,32);
    const barW=300,barH=6,barX=W/2-barW/2,barY=40;
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(barX-1,barY-1,barW+2,barH+2);
    ctx.fillStyle='#ffd700';const ratio=1-waveTimer/WAVE_DURATION;ctx.fillRect(barX,barY,barW*ratio,barH);
    ctx.textAlign='left';
  } else if(phase==='boss'){
    ctx.textAlign='center';ctx.fillStyle='#e33';ctx.font='bold 26px monospace';
    ctx.fillText('⚔ БОСС ⚔',W/2,32);ctx.textAlign='left';
  }
  for(const p of players)if(!p.isAI)drawAbilityBar(p);
  drawPauseButton();
}
function drawBossHPBar(){
  if(bosses.length===0)return;
  const boss=bosses.find(b=>!b.removed)||bosses[0];const barW=W-200,barH=40;const barX=100,barY=60;const pct=boss.hp/boss.maxHp;
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(barX-3,barY-3,barW+6,barH+6);
  const grad=ctx.createLinearGradient(barX,0,barX+barW,0);grad.addColorStop(0,boss.color);grad.addColorStop(1,'#dc2626');
  ctx.fillStyle=grad;ctx.fillRect(barX,barY,barW*pct,barH);
  ctx.strokeStyle='#ffd700';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(barX+barW*0.66,barY-5);ctx.lineTo(barX+barW*0.66,barY+barH+5);ctx.stroke();
  ctx.beginPath();ctx.moveTo(barX+barW*0.33,barY-5);ctx.lineTo(barX+barW*0.33,barY+barH+5);ctx.stroke();
  ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(barX,barY,barW,barH);
  ctx.fillStyle='#fff';ctx.font='bold 22px monospace';ctx.textAlign='center';
  const phaseName=['I','II','III'][boss.phase];
  ctx.fillText(`${boss.name} — Фаза ${phaseName}`,W/2,barY-10);
  ctx.font='bold 16px monospace';ctx.fillText(`${Math.ceil(boss.hp)} / ${boss.maxHp}`,W/2,barY+barH-12);
  ctx.textAlign='left';
}
function drawPauseButton(){const{x,y,w,h}=PAUSE_BTN;const hov=isPauseHover();ctx.fillStyle=hov?'#2a2a4a':'#1e1e36';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#888';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);ctx.fillStyle='#eee';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ПАУЗА [ESC]',x+w/2,y+h/2+1);ctx.textBaseline='alphabetic';ctx.textAlign='left';}
function drawControlsHint(){
  ctx.textAlign='center';ctx.font='bold 12px monospace';
  if(mode===2){ctx.fillStyle='#3498db';ctx.fillText('И1: WASD | Q E R SPACE + F',W/2-290,H-4);ctx.fillStyle='#2ecc71';ctx.fillText('И2: Стрелки | U I O P + L',W/2+290,H-4);}
  else{ctx.fillStyle='#3498db';ctx.fillText('WASD движ | Shift рывок | Q E R SPACE | F ульта | M звук',W/2,H-4);}
  ctx.textAlign='left';
}