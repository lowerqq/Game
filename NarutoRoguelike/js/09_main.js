"use strict";
function drawWorld(){
  drawArena();
  if(!window._fogParticles){
    window._fogParticles=[];
    for(let i=0;i<20;i++)window._fogParticles.push({
      x:ARENA.x+Math.random()*ARENA.w,
      y:ARENA.y+Math.random()*ARENA.h,
      r:60+Math.random()*120,
      vx:(Math.random()-0.5)*0.3,
      vy:(Math.random()-0.5)*0.3,
      alpha:0.03+Math.random()*0.05
    });
  }
  for(const f of window._fogParticles){
    f.x+=f.vx;f.y+=f.vy;
    if(f.x<ARENA.x-100)f.x=ARENA.x+ARENA.w+100;
    if(f.x>ARENA.x+ARENA.w+100)f.x=ARENA.x-100;
    if(f.y<ARENA.y-100)f.y=ARENA.y+ARENA.h+100;
    if(f.y>ARENA.y+ARENA.h+100)f.y=ARENA.y-100;
    ctx.globalAlpha=f.alpha;
    const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);
    g.addColorStop(0,'#8888ff');g.addColorStop(1,'rgba(80,80,200,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  // ═══ Клинки Белого Клыка ═══
  for(const sw of whiteFangSwords){
    const pulse=0.7+0.3*Math.sin(tickMs/150+sw.x*0.1);
    ctx.globalAlpha=0.25*pulse;
    ctx.fillStyle=sw.owner?sw.owner.color:'#e2e8f0';
    ctx.beginPath();ctx.arc(sw.x,sw.y,60,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=0.9;
    ctx.strokeStyle=sw.owner?sw.owner.color:'#e2e8f0';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(sw.x,sw.y,150,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;
    // Клинок
    ctx.save();ctx.translate(sw.x,sw.y);
    ctx.shadowColor='#e2e8f0';ctx.shadowBlur=10;
    ctx.strokeStyle='#e2e8f0';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(0,12);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-9,12);ctx.lineTo(9,12);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(-5,-13);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(5,-13);ctx.stroke();
    ctx.fillStyle='#a16207';
    ctx.beginPath();ctx.arc(0,-22,4,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    ctx.restore();
  }
  drawTrails();
  for(const m of spawnMarkers)drawSpawnMarker(m);
  for(const t of telegraphs)t.draw();
  for(const z of zones)z.draw();
  for(const m of mines)m.draw();
  for(const t of tornadoes)t.draw();
  for(const s of tentenSeals)s.draw();
  for(const sw of tentenSwords)sw.draw();
  for(const c of cocoons)c.draw();
  for(const sw of swarms)sw.draw();
  for(const cb of chibakuBalls)cb.draw();
  drawParticles();
  for(const b of beamWarnings)b.draw();
  for(const b of beams)b.draw();
  for(const e of enemies)e.draw();
  for(const b of bosses)b.draw();
  for(const c of clones)c.draw();
  for(const pt of pets)pt.draw();
  for(const squad of anbuSquads){for(const a of squad.members)a.draw();}
  for(const p of projectiles)p.draw();
  for(const p of enemyProjectiles)p.draw();
  drawShockwaves();
  for(const p of players)p.draw();
  drawDamageNumbers();
}
function drawOverlays(){
  drawHUD();drawBossHPBar();drawControlsHint();
  if(waveBannerTimer>0){
    const fadeIn=Math.min(1,(waveBannerMax-waveBannerTimer)/12);
    const fadeOut=Math.min(1,waveBannerTimer/25);
    const alpha=clamp(fadeIn*fadeOut,0,1);
    ctx.globalAlpha=alpha;ctx.fillStyle='#fff';ctx.font='bold 72px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    let bannerText='';
    if(phase==='defense')bannerText=`🛡 РАУНД ${defenseWave}/${DEFENSE_TOTAL_WAVES}`;
    else if(phase==='boss')bannerText=`⚔ БОСС — ВОЛНА ${wave} ⚔`;
    else bannerText=`ВОЛНА ${wave}`;
    ctx.fillText(bannerText,W/2,H/2-20);
    if(waveBannerSpecial){
      const isFinalDef = phase==='defense' && defenseWave>=DEFENSE_TOTAL_WAVES;
      ctx.fillStyle=isFinalDef?'#ff3030':'#ffd700';
      ctx.font='bold 32px monospace';
      let specialText;
      if(phase==='boss')specialText='⚠ БОСС ⚠';
      else if(isFinalDef)specialText='⚠ РАУНД 4/4 — СЛОЖНЕЕ ⚠';
      else if(phase==='defense')specialText='⚠ ПРОРЫВ = ПРОВАЛ ⚠';
      else specialText='⚠ ОСОБЫЕ ВРАГИ ⚠';
      ctx.fillText(specialText,W/2,H/2+40);
    }
    ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.globalAlpha=1;
  }
  if(enemyTierBannerTimer>0){
    const fadeIn=Math.min(1,(180-enemyTierBannerTimer)/20);
    const fadeOut=Math.min(1,enemyTierBannerTimer/40);
    ctx.globalAlpha=fadeIn*fadeOut;
    ctx.fillStyle=TIER_INFO[enemyTier].color;
    ctx.font='bold 46px monospace';
    ctx.textAlign='center';
    ctx.fillText(enemyTierBannerText,W/2,H/2-100);
    ctx.fillStyle='#fff';
    ctx.font='bold 20px monospace';
    ctx.fillText(enemyTierBannerSub,W/2,H/2-60);
    ctx.textAlign='left';
    ctx.globalAlpha=1;
  }
  if(screenFlash>0){ctx.fillStyle=`rgba(255,255,255,${screenFlash/60})`;ctx.fillRect(0,0,W,H);}
}
function update(){
  if(paused){
    updatePauseMenu();
    if(screenShake>0)screenShake--;   // ← даём тряске затухнуть
    if(screenFlash>0)screenFlash--;
  }
  else if(state==='menu')updateMenu();
  else if(state==='charselect')updateCharSelect();
  else if(state==='playing')updatePlaying();
  else if(state==='upgrade')updateUpgradeScreen();
  else if(state==='artifact')updateArtifactScreen();
  else if(state==='autoUpgrade')updateAutoUpgradeScreen();
  else if(state==='shop')updateShop();
  else if(state==='dead')updateDead();
  else if(state==='sasukeMode')updateSasukeMode();
  mouse.clicked=false;
}
function draw(){
  ctx.clearRect(0,0,W,H);
  if(state==='playing'){
    const shake=screenShake>0;
    if(shake){const sx=rand(-screenShake,screenShake)*0.5;const sy=rand(-screenShake,screenShake)*0.5;ctx.save();ctx.translate(sx,sy);}
    drawWorld();
    if(shake)ctx.restore();
    drawOverlays();
  }
  else if(state==='menu')drawMenu();
  else if(state==='charselect')drawCharSelect();
  else if(state==='upgrade')drawUpgradeScreen();
  else if(state==='artifact')drawArtifactScreen();
  else if(state==='autoUpgrade')drawAutoUpgradeScreen();
  else if(state==='shop')drawShop();
  else if(state==='dead')drawDead();
  else if(state==='sasukeMode')drawSasukeMode();
  if(paused)drawPauseMenu();
}

const FIXED_STEP=1000/60;
const MAX_STEPS_PER_FRAME=5;
let _accumulator=0,_lastTime=0;
function loop(now){
  if(!_lastTime)_lastTime=now;
  let elapsed=now-_lastTime;
  _lastTime=now;
  if(elapsed>200)elapsed=200;
  _accumulator+=elapsed;
  let steps=0;
const _frameStart=performance.now();
while(_accumulator>=FIXED_STEP&&steps<MAX_STEPS_PER_FRAME){
  try{ update(); }
  catch(e){ console.error('UPDATE ERROR:', e); }
  _accumulator-=FIXED_STEP;steps++;
  if(performance.now()-_frameStart>120){ // больше 120мс за кадр — прерываем
    console.warn('SLOW FRAME: skipping remaining substeps');
    _accumulator=0;
    break;
  }
}
  if(steps>=MAX_STEPS_PER_FRAME)_accumulator=0;
  tickMs=now;
  try{ draw(); }
  catch(e){ console.error('DRAW ERROR:', e); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);