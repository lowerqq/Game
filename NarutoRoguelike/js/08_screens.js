"use strict";
// ==================== ARTIFACT SCREEN ====================
let currentArtifact=null;

function beginArtifactDrop(){
  currentArtifact=ARTIFACT_KEYS[Math.floor(Math.random()*ARTIFACT_KEYS.length)];
  state='artifact';
}

function getArtifactButtonRects(){
  const bw=260,bh=70,gap=30;const by=H-bh-60;
  const totalW=bw*2+gap;const sx=(W-totalW)/2;
  return[
    {x:sx,y:by,w:bw,h:bh,action:'equip',playerIndex:0},
    {x:sx+bw+gap,y:by,w:bw,h:bh,action:'destroy'}
  ];
}

function completeArtifactChoice(targetIndex,destroy){
  const coinReward=25+wave*2;
  if(destroy){
    for(const p of players){
      if(!p.alive)continue;
      p.coins+=coinReward;
      spawnDamageNumber(p.x,p.y-60,`+${coinReward}💰`,'#ffd700',true);
    }
    sfx(1000,0.15,0.1,'sine',1.5);
  } else if(targetIndex>=0&&players[targetIndex]){
    players[targetIndex].equipArtifact(currentArtifact);
  }
currentArtifact=null;
beginShop();
}

function drawArtifactScreen(){
  ctx.fillStyle='#0f0f18';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.textBaseline='alphabetic';
  if(!currentArtifact){ctx.textAlign='left';return;}
  const art=ARTIFACTS[currentArtifact];
  ctx.fillStyle='#c084fc';ctx.font='bold 44px monospace';
  ctx.fillText('★ НОВЫЙ АРТЕФАКТ ★',W/2,70);
  ctx.fillStyle='#aaa';ctx.font='bold 16px monospace';
  ctx.fillText(`Волна ${wave}`,W/2,100);
  const cardW=520,cardH=380;
  const cardX=(W-cardW)/2,cardY=140;
  ctx.fillStyle='#1a1a2e';ctx.fillRect(cardX,cardY,cardW,cardH);
  ctx.strokeStyle=art.color;ctx.lineWidth=4;ctx.strokeRect(cardX,cardY,cardW,cardH);
  ctx.font='bold 110px monospace';ctx.textBaseline='middle';
  ctx.fillStyle=art.color;ctx.fillText(art.icon,W/2,cardY+110);
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='#eee';ctx.font='bold 28px monospace';ctx.fillText(art.name,W/2,cardY+210);
  ctx.fillStyle='#bbb';ctx.font='16px monospace';ctx.fillText(art.desc,W/2,cardY+245);
  ctx.fillStyle=art.color;ctx.font='bold 20px monospace';ctx.fillText(art.stackLabel(1),W/2,cardY+285);
  
  const curr=players[0].getArtifactStack(currentArtifact);
  const max=art.maxStack;
  if(curr>=max){ctx.fillStyle='#ffa500';ctx.font='bold 16px monospace';ctx.fillText(`У вас МАКСИМУМ (${max}/${max})`,W/2,cardY+325);}
  else{ctx.fillStyle='#8af';ctx.font='bold 16px monospace';ctx.fillText(`У вас: ×${curr}/${max} → ×${curr+1}/${max}`,W/2,cardY+325);}
  
  const rects=getArtifactButtonRects();
  for(const r of rects){
    let label='',color='#4caf50',disabled=false;
    if(r.action==='equip'){
      const p=players[r.playerIndex];
      const curr=p.getArtifactStack(currentArtifact);
      const max=art.maxStack;
      if(curr>=max){label='МАКСИМУМ';color='#555';disabled=true;}
      else{label='ЭКИПИРОВАТЬ';color='#4caf50';}
    } else {
      label=`РАЗРУШИТЬ (+${25+wave*2}💰)`;color='#a33';
    }
    const hov=!disabled&&isHover(r.x,r.y,r.w,r.h);
    ctx.fillStyle=hov?'#2a2a4a':'#1e1e36';ctx.fillRect(r.x,r.y,r.w,r.h);
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(r.x,r.y,r.w,r.h);
    ctx.fillStyle=disabled?'#666':'#eee';ctx.font='bold 16px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(label,r.x+r.w/2,r.y+r.h/2);
  }
  ctx.textBaseline='alphabetic';ctx.textAlign='left';
}

function updateArtifactScreen(){
  if(!mouse.clicked||!currentArtifact)return;
  const rects=getArtifactButtonRects();
  for(const r of rects){
    if(!isHover(r.x,r.y,r.w,r.h))continue;
    if(r.action==='equip'){
      const p=players[r.playerIndex];
      if(p.getArtifactStack(currentArtifact)>=ARTIFACTS[currentArtifact].maxStack)return;
      completeArtifactChoice(r.playerIndex,false);
    } else {
      completeArtifactChoice(-1,true);
    }
    return;
  }
}
// ==================== END ARTIFACT SCREEN ====================

// ==================== MENU ====================
function drawSasukeModeCard(x,y,w,h,color,title,subtitle,abilities,isSelected){
  const hov=isHover(x,y,w,h);
  ctx.fillStyle=isSelected?'#2a2a4a':(hov?'#22223a':'#1a1a2e');
  ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=isSelected?color:(hov?color:'#444');
  ctx.lineWidth=isSelected?5:(hov?3:2);
  ctx.strokeRect(x,y,w,h);
  ctx.textAlign='center';
  ctx.fillStyle=color;ctx.font='bold 44px monospace';
  ctx.fillText(title,x+w/2,y+70);
  ctx.fillStyle='#ddd';ctx.font='bold 15px monospace';
  ctx.fillText(subtitle,x+w/2,y+100);
  ctx.fillStyle='#eee';ctx.font='bold 17px monospace';
  for(let i=0;i<abilities.length;i++)ctx.fillText(abilities[i],x+w/2,y+165+i*42);
  if(isSelected){
    ctx.fillStyle=color;ctx.font='bold 15px monospace';
    ctx.fillText('★ ТЕКУЩИЙ ВЫБОР',x+w/2,y+h-28);
  }
  ctx.textAlign='left';
}

function drawSasukeMode(){
  ctx.fillStyle='#0f0f18';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#5a6ee8';ctx.font='bold 44px monospace';
  ctx.fillText('САСКЕ: ВЫБОР ДОДЗЮЦУ',W/2,70);
  ctx.fillStyle='#aaa';ctx.font='bold 16px monospace';
  ctx.fillText(`Волна ${wave}`,W/2,102);
  const sp=players.find(p=>p.charId==='sasuke');
  const cur=sp?sp.sasukeMode:'sharingan';
  const cardW=620,cardH=460,gap=60;
  const startX=(W-(cardW*2+gap))/2;
  const cardY=150;
  drawSasukeModeCard(startX,cardY,cardW,cardH,'#e74c3c',
    'ШАРИНГАН','Классические техники Учиха',
    ['E: Аматерасу — чёрное пламя',
     'R: Огненный Шар — мощный снаряд',
     'SP: Сусаноо — аура + щит'],
    cur==='sharingan');
  drawSasukeModeCard(startX+cardW+gap,cardY,cardW,cardH,'#a855f7',
    'РИННЕГАН','Пространственные техники',
    ['E: Аменотеджикара — обмен с врагом',
     'R: Шинра Тенсей — волна отбрасывания',
     'SP: Чибаку Тенсей — чёрная дыра'],
    cur==='rinnegan');
  ctx.textAlign='left';
}

function updateSasukeMode(){
  if(!mouse.clicked)return;
  const cardW=620,cardH=460,gap=60;
  const startX=(W-(cardW*2+gap))/2;
  const cardY=150;
  const sasukes=players.filter(p=>p.charId==='sasuke');
  if(sasukes.length===0){sasukeChoiceNeeded=false;state='playing';return;}
  if(isHover(startX,cardY,cardW,cardH)){
    sasukes.forEach(p=>p.setSasukeMode('sharingan'));
    sasukeChoiceNeeded=false;state='playing';return;
  }
  if(isHover(startX+cardW+gap,cardY,cardW,cardH)){
    sasukes.forEach(p=>p.setSasukeMode('rinnegan'));
    sasukeChoiceNeeded=false;state='playing';return;
  }
}
function drawMenu(){
  const t=tickMs/3000;
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,`hsl(${230+Math.sin(t)*10},60%,8%)`);
  g.addColorStop(0.5,`hsl(${260+Math.cos(t)*10},70%,12%)`);
  g.addColorStop(1,`hsl(${200+Math.sin(t*1.3)*15},60%,8%)`);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(!window._menuStars){
    window._menuStars=[];
    for(let i=0;i<60;i++)window._menuStars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2+0.5,s:Math.random()*0.3+0.1,phase:Math.random()*Math.PI*2});
  }
  for(const s of window._menuStars){
    s.y+=s.s;if(s.y>H)s.y=0;
    const a=0.3+0.5*Math.sin(tickMs/500+s.phase);
    ctx.globalAlpha=a;ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.textAlign='center';
  ctx.shadowColor='#ff9900';ctx.shadowBlur=30;
  ctx.fillStyle='#eee';ctx.font='bold 64px monospace';ctx.fillText('РОГАЛИК',W/2,180);
  ctx.shadowBlur=0;
  ctx.fillStyle='#f90';ctx.font='bold 28px monospace';ctx.fillText('⚡ НАРУТО v1.0 ⚡',W/2,230);
  ctx.fillStyle='#aaa';ctx.font='14px monospace';
  ctx.fillText('',W/2,270);
  ctx.fillText('',W/2,290);
  ctx.fillText('',W/2,310);
  ctx.fillStyle='#666';ctx.font='bold 11px monospace';
  ctx.fillText('M — звук | Touch | Бой → 🛡 ОБОРОНА (4 раунда подряд) → Бой → ... | 12-я — ⚔ БОСС',W/2,340);
  const bw=400,bh=70,bx=W/2-bw/2;
  drawButton(bx,380,bw,bh,'СОЛО','#3498db',isHover(bx,380,bw,bh));
  drawButton(bx,470,bw,bh,'КООП (2 игрока)','#2ecc71',isHover(bx,470,bw,bh));
  ctx.textAlign='left';
}
function updateMenu(){const bw=400,bh=70,bx=W/2-bw/2;if(!mouse.clicked)return;if(isHover(bx,380,bw,bh)){mode=1;state='charselect';charSelectTurn=0;p1Char='naruto';}else if(isHover(bx,470,bw,bh)){mode=2;state='charselect';charSelectTurn=0;p1Char='naruto';p2Char='sasuke';}}

// ==================== CHAR SELECT ====================
function drawCharacterCard(x,y,w,h,charId,highlightColor,isSelected){
  const c=CHARACTERS[charId];
  ctx.fillStyle=isSelected?'#2a2a4a':'#1a1a2e';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=isSelected?highlightColor:c.color;ctx.lineWidth=isSelected?4:2;ctx.strokeRect(x,y,w,h);
  const cx=x+w/2;
  ctx.fillStyle=c.color;ctx.beginPath();ctx.arc(cx,y+32,18,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(SYMBOLS[charId],cx,y+32);ctx.textBaseline='alphabetic';
  ctx.fillStyle='#eee';ctx.font='bold 11px monospace';ctx.fillText(c.name,cx,y+62);
  if(c.hook){ctx.fillStyle=c.hook.color;ctx.font='bold 9px monospace';ctx.fillText('★ '+c.hook.name,cx,y+76);}
  ctx.font='8px monospace';
  for(let i=0;i<4;i++){const ab=c.abilities[i];const name=ab.name.length>11?ab.name.slice(0,10)+'…':ab.name;ctx.fillStyle=ab.ult?'#ffd700':'#ccc';ctx.fillText(`${ab.keyLabel}.${name}`,cx,y+90+i*10);}
  if(isSelected){ctx.fillStyle=highlightColor;ctx.font='bold 12px monospace';ctx.fillText('✓',cx,y+h-20);}
  ctx.textAlign='left';
}
function getCharSelectLayout(){
  const cardW=130,cardH=170,gapX=6,gapY=12;
  const topRow=CHAR_ORDER.slice(0,8);const bottomRow=CHAR_ORDER.slice(8);
  const topTotalW=topRow.length*cardW+(topRow.length-1)*gapX;
  const bottomTotalW=bottomRow.length*cardW+Math.max(0,bottomRow.length-1)*gapX;
  const topStartX=(W-topTotalW)/2;const bottomStartX=(W-bottomTotalW)/2;
  const y1=120,y2=y1+cardH+gapY;const cards=[];
  topRow.forEach((id,i)=>cards.push({id,x:topStartX+i*(cardW+gapX),y:y1,w:cardW,h:cardH}));
  bottomRow.forEach((id,i)=>cards.push({id,x:bottomStartX+i*(cardW+gapX),y:y2,w:cardW,h:cardH}));
  return cards;
}
function drawCharSelect(){
  ctx.fillStyle='#0f0f18';ctx.fillRect(0,0,W,H);ctx.textAlign='center';
  ctx.fillStyle='#eee';ctx.font='bold 28px monospace';ctx.fillText('ВЫБОР ПЕРСОНАЖА',W/2,40);
  ctx.fillStyle='#aaa';ctx.font='bold 13px monospace';ctx.fillText('★ хуком = уникальная механика | наведи на карточку',W/2,65);
  if(mode===1){ctx.fillStyle='#3498db';ctx.font='bold 18px monospace';ctx.fillText('Выберите персонажа',W/2,90);}
  else if(charSelectTurn===0){ctx.fillStyle='#3498db';ctx.font='bold 20px monospace';ctx.fillText('▶ ИГРОК 1',W/2,90);}
  else{ctx.fillStyle='#2ecc71';ctx.font='bold 20px monospace';ctx.fillText('▶ ИГРОК 2',W/2,90);}
  const cards=getCharSelectLayout();let hovered=null;
  for(const card of cards){
    let sel=false,hl='#fff';
    if(mode===1){sel=p1Char===card.id;hl='#3498db';}
    else{if(p1Char===card.id){sel=true;hl='#3498db';}if(p2Char===card.id){sel=true;hl='#2ecc71';}if(charSelectTurn===1&&card.id===p1Char)hl='#3498db';}
    drawCharacterCard(card.x,card.y,card.w,card.h,card.id,hl,sel);
    if(isHover(card.x,card.y,card.w,card.h))hovered=card.id;
  }
  if(hovered){
    const c=CHARACTERS[hovered];const tipW=420,tipH=140;
    const tx=clamp(mouse.x-tipW/2,10,W-tipW-10);const ty=clamp(mouse.y-tipH-15,10,H-tipH-10);
    ctx.fillStyle='rgba(0,0,0,0.92)';ctx.fillRect(tx,ty,tipW,tipH);
    ctx.strokeStyle=c.color;ctx.lineWidth=2;ctx.strokeRect(tx,ty,tipW,tipH);
    if(hovered==='sasuke'){
      ctx.fillStyle='#a855f7';ctx.font='bold 14px monospace';ctx.textAlign='left';
      ctx.fillText('★ ДОДЗЮЦУ: ШАРИНГАН / РИННЕГАН',tx+12,ty+22);
      ctx.fillStyle='#ddd';ctx.font='12px monospace';
      wrapText('В начале каждой волны выбираешь додзюцу. Шаринган — классические техники, Риннеган — пространственные.',tx+12,ty+44,tipW-24,16);
    } else {
      ctx.fillStyle=c.hook?c.hook.color:'#888';ctx.font='bold 14px monospace';ctx.textAlign='left';
      ctx.fillText(`★ ${c.hook?c.hook.name:'—'}`,tx+12,ty+22);
      ctx.fillStyle='#ddd';ctx.font='12px monospace';
      const hookDesc=(c.hook&&HOOK_DESCRIPTIONS[c.hook.type])||'Уникальная механика';
      wrapText(hookDesc,tx+12,ty+44,tipW-24,16);
    }
  }
  drawButton(20,H-70,160,55,'← НАЗАД','#888',isHover(20,H-70,160,55));
  ctx.textAlign='left';
}
function updateCharSelect(){
  if(!mouse.clicked)return;
  if(isHover(20,H-70,160,55)){if(mode===2&&charSelectTurn===1){charSelectTurn=0;return;}state='menu';return;}
  const cards=getCharSelectLayout();let clicked=null;
  for(const c of cards)if(isHover(c.x,c.y,c.w,c.h))clicked=c;
  if(!clicked)return;
  if(mode===1){p1Char=clicked.id;startRun(1,p1Char,null);}
  else{if(charSelectTurn===0){p1Char=clicked.id;charSelectTurn=1;if(p2Char===clicked.id)p2Char=CHAR_ORDER.find(c=>c!==clicked.id);}else{if(clicked.id===p1Char)return;p2Char=clicked.id;startRun(2,p1Char,p2Char);}}
}

// ==================== UPGRADE SCREEN ====================
// ═══ ВСЕГДА ПОКАЗЫВАЕМ ТОЛЬКО ЛОКАЛЬНОГО ИГРОКА (players[0]) ═══
function getPanelLayout(){
  return {panelW:900, gap:0, totalW:900, startX:(W-900)/2, panelH:680, panelY:60, humans:[players[0]]};
}
function getUpgradeButtonRects(L){L=L||getPanelLayout();const rects=[];for(let pi=0;pi<L.humans.length;pi++){const px=L.startX+pi*(L.panelW+L.gap);const rowStart=L.panelY+70;const rowH=70;for(let ai=0;ai<4;ai++){const ay=rowStart+ai*rowH;const btnW=(L.panelW-60)/2;const btnH=rowH-24;const btnY=ay+22;for(let t=0;t<2;t++){rects.push({playerIndex:pi,abilityIndex:ai,track:['damage','cooldown'][t],x:px+15+t*btnW,y:btnY,w:btnW-10,h:btnH});}}}return rects;}
function getStatButtonRects(L){L=L||getPanelLayout();const rects=[];const statKeys=['autoDamage','attackSpeed','hp','defense','regen'];for(let pi=0;pi<L.humans.length;pi++){const px=L.startX+pi*(L.panelW+L.gap);const statRowY=L.panelY+70+4*70+10;const btnW=(L.panelW-50)/5;for(let i=0;i<statKeys.length;i++){rects.push({playerIndex:pi,statKey:statKeys[i],x:px+10+i*btnW,y:statRowY,w:btnW-6,h:60});}}return rects;}
function applyStatUpgrade(player,key){
  if(key==='hp'){player.maxHp+=25;player.hp+=25;}
  else if(key==='defense'){player.defense+=1;}
  else if(key==='regen'){player.regenPerSec=Math.min(15,player.regenPerSec+0.5);}
}
function spawnAnbuForPlayer(p){
  const positions=[{x:p.x+30,y:p.y-30},{x:p.x+30,y:p.y+30},{x:p.x-30,y:p.y-30},{x:p.x-30,y:p.y+30}];
  const members=[];
  for(const pos of positions){const a=new ANBU(clamp(pos.x,ARENA.x+20,ARENA.x+ARENA.w-20),clamp(pos.y,ARENA.y+20,ARENA.y+ARENA.h-20),p);members.push(a);}
  if(p.anbuSquad){const idx=anbuSquads.indexOf(p.anbuSquad);if(idx>=0)anbuSquads.splice(idx,1);}
  const squad={owner:p,members};p.anbuSquad=squad;anbuSquads.push(squad);
  for(const a of members){spawnShockwave(a.x,a.y,50,'#a78bfa');spawnParticles(a.x,a.y,'#a78bfa',15);}
  screenFlash=15;
}
function drawStatButton(x,y,w,h,statKey,player){
  const stat=STAT_UPGRADES[statKey];const lvl=player.statUpgrades[statKey];const max=lvl>=stat.max;
  const cost=max?Infinity:stat.cost(lvl);const canBuy=!max&&player.coins>=cost;const hov=isHover(x,y,w,h);
  ctx.fillStyle=max?'#0f2e1a':(canBuy&&hov?'#2a4a5f':(canBuy?'#1e3a5f':'#1e1e36'));ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=max?'#4caf50':stat.color;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
  ctx.textAlign='center';ctx.fillStyle='#eee';ctx.font='bold 11px monospace';ctx.fillText(stat.short,x+w/2,y+16);
  ctx.fillStyle=stat.color;ctx.font='bold 11px monospace';ctx.fillText(stat.val(lvl),x+w/2,y+32);
  ctx.fillStyle='#8af';ctx.font='10px monospace';ctx.fillText(`${lvl}/${stat.max}`,x+w/2,y+45);
  if(max){ctx.fillStyle='#4caf50';ctx.font='bold 10px monospace';ctx.fillText('MAX',x+w/2,y+57);}
  else{ctx.fillStyle=canBuy?'#ffd700':'#a55';ctx.font='bold 11px monospace';ctx.fillText(`💰${cost}`,x+w/2,y+57);}
  ctx.textAlign='left';
}
function drawUpgradeButton(x,y,w,h,track,up,player,ability){
  const noCd=ability.noCd||ability.cd===0;if(track==='cooldown'&&noCd)return;
  if(track==='damage'&&ability.noDamage)return;
  const lvl=up[track];const max=lvl>=3;const cost=upgradeCost(lvl);const canBuy=!max&&player.coins>=cost;
  const color=track==='damage'?'#e74c3c':'#f39c12';
  const label=track==='damage'?'УРОН +40%':'КД −20%';const hov=isHover(x,y,w,h);
  ctx.fillStyle=max?'#0f2e1a':(canBuy&&hov?'#2a4a5f':(canBuy?'#1e3a5f':'#1e1e36'));ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=max?'#4caf50':color;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
  ctx.textAlign='center';ctx.fillStyle='#eee';ctx.font='bold 11px monospace';ctx.fillText(label,x+w/2,y+15);
  ctx.fillStyle='#8af';ctx.font='10px monospace';ctx.fillText(`Ур ${lvl}/3`,x+w/2,y+28);
  if(max){ctx.fillStyle='#4caf50';ctx.font='bold 11px monospace';ctx.fillText('MAX',x+w/2,y+h-5);}
  else{ctx.fillStyle=canBuy?'#ffd700':'#a55';ctx.font='bold 12px monospace';ctx.fillText(`💰${cost}`,x+w/2,y+h-5);}
  ctx.textAlign='left';
}
function drawUpgradePanel(x,y,w,h,player,rects,statRects){
  ctx.fillStyle='#1a1a2e';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=player.color;ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);
  ctx.fillStyle=player.color;ctx.font='bold 18px monospace';ctx.textAlign='left';
  ctx.fillText(`ИГРОК ${player.id+1}: ${player.character.name}`,x+20,y+24);
  if(player.charId==='sasuke'){
    const modeName=player.sasukeMode==='rinnegan'?'РИННЕГАН':'ШАРИНГАН';
    const modeColor=player.sasukeMode==='rinnegan'?'#a855f7':'#e74c3c';
    ctx.fillStyle=modeColor;ctx.font='bold 11px monospace';
    ctx.fillText(`★ ДОДЗЮЦУ: ${modeName}`,x+20,y+42);
  } else if(player.hook){
    ctx.fillStyle=player.hook.color;ctx.font='bold 11px monospace';
    ctx.fillText(`★ ${player.hook.name}`,x+20,y+42);
  }
  const hpBw=150,hpBh=12,hpX=x+w-340,hpY=y+12;
  ctx.fillStyle='#000';ctx.fillRect(hpX-1,hpY-1,hpBw+2,hpBh+2);
  ctx.fillStyle='#e33';ctx.fillRect(hpX,hpY,hpBw,hpBh);
  ctx.fillStyle='#3e6';ctx.fillRect(hpX,hpY,hpBw*(player.hp/player.maxHp),hpBh);
  ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(`${Math.round(player.hp)}/${player.maxHp}`,hpX+hpBw/2,hpY+10);
  ctx.fillStyle='#ffd700';ctx.font='bold 20px monospace';ctx.textAlign='right';ctx.fillText(`💰 ${player.coins}`,x+w-20,y+58);
  ctx.textAlign='left';
  const rowStart=y+70;const rowH=70;
    for(let ai=0;ai<4;ai++){const ay=rowStart+ai*rowH;const ab=player.abilities[ai];ctx.fillStyle=ab.ult?'#ffd700':'#eee';ctx.font='bold 13px monospace';ctx.fillText(`[${player.abilityLabels[ai]}] ${ab.name}`,x+20,ay+18);}
  for(const r of rects){if(r.playerIndex!==player.id)continue;drawUpgradeButton(r.x,r.y,r.w,r.h,r.track,player.abilityUpgrades[r.abilityIndex],player,player.abilities[r.abilityIndex]);}
  const statHeaderY=y+70+4*70;
  ctx.fillStyle='#c084fc';ctx.font='bold 13px monospace';ctx.fillText('★ СТАТ-АПГРЕЙДЫ:',x+20,statHeaderY+3);
  for(const r of statRects){if(r.playerIndex!==player.id)continue;drawStatButton(r.x,r.y,r.w,r.h,r.statKey,player);}
  const bottomY=y+h-60;
  const healBw=200,healBh=45;const healX=x+20,healY=bottomY;
  const healCost=30+player.healCount*20;const isFull=player.hp>=player.maxHp;const canHeal=!isFull&&player.coins>=healCost;
  const hovH=isHover(healX,healY,healBw,healBh);
  let fc='#1e1e1e',bc='#555',tc='#888';
  if(isFull){fc='#1e3a2a';bc='#4caf50';tc='#4caf50';}
  else if(canHeal){fc=hovH?'#1e5e3a':'#1a4a2e';bc='#4ade80';tc='#4ade80';}
  ctx.fillStyle=fc;ctx.fillRect(healX,healY,healBw,healBh);
  ctx.strokeStyle=bc;ctx.lineWidth=2;ctx.strokeRect(healX,healY,healBw,healBh);
  ctx.fillStyle=tc;ctx.font='bold 14px monospace';ctx.textAlign='center';
  if(isFull)ctx.fillText('💗 HP полное',healX+healBw/2,healY+healBh/2+1);
  else ctx.fillText(`💗 ЛЕЧЕНИЕ 💰${healCost}`,healX+healBw/2,healY+healBh/2+1);
  const anbuBw=200,anbuBh=45;const anbuX=x+w-anbuBw-20,anbuY=bottomY;
  const anbuCost=200;const canBuyAnbu=player.coins>=anbuCost;const hovA=isHover(anbuX,anbuY,anbuBw,anbuBh);
  const hasSquad=player.anbuSquad&&player.anbuSquad.members.length>0;
  const label=hasSquad?'🥷 ВОССТАНОВИТЬ АНБУ':'🥷 ПРИЗВАТЬ АНБУ';
  let afc='#1e1e36',abc='#666',atc='#888';
  if(canBuyAnbu){afc=hovA?'#3a2a4a':'#2a1a3a';abc='#a78bfa';atc='#c4b5fd';}
  ctx.fillStyle=afc;ctx.fillRect(anbuX,anbuY,anbuBw,anbuBh);
  ctx.strokeStyle=abc;ctx.lineWidth=2;ctx.strokeRect(anbuX,anbuY,anbuBw,anbuBh);
  ctx.fillStyle=atc;ctx.font='bold 12px monospace';ctx.fillText(`${label} 💰${anbuCost}`,anbuX+anbuBw/2,anbuY+anbuBh/2+1);
  ctx.textAlign='left';
}
function drawUpgradeScreen(){
  ctx.fillStyle='#0f0f18';ctx.fillRect(0,0,W,H);ctx.textAlign='center';
  let headLabel='',headColor='#ffd700';
  if(phase==='defense'){
    const isFinal = defenseWave>=DEFENSE_TOTAL_WAVES;
    headLabel=`🛡 РАУНД ${defenseWave}/${DEFENSE_TOTAL_WAVES} ${isFinal?'ОТБИТ!':'ПРОЙДЕН'}`;
    headColor=isFinal?'#4caf50':'#e67e22';
  }
  else if(phase==='boss'){headLabel=`⚔ БОСС ПОВЕРЖЕН! (волна ${wave})`;headColor='#ff3030';}
  else{headLabel=`ВОЛНА ${wave} ПРОЙДЕНА!`;headColor='#ffd700';}
  ctx.fillStyle=headColor;ctx.font='bold 36px monospace';ctx.fillText(headLabel,W/2,38);
  ctx.fillStyle='#aaa';ctx.font='bold 12px monospace';ctx.fillText('Улучшения способностей + статы + лечение + АНБУ',W/2,58);
  const L=getPanelLayout();const rects=getUpgradeButtonRects(L);const statRects=getStatButtonRects(L);
  drawUpgradePanel(L.startX,L.panelY,L.panelW,L.panelH,L.humans[0],rects,statRects);
  
  const bw=360,bh=55,bx=W/2-bw/2,by=H-bh-12;
  
  if (isClient) {
    if (clientReady) {
      const label = hostReady ? '⏳ СИНХРОНИЗАЦИЯ...' : '⏳ ХОСТ ЕЩЁ ВЫБИРАЕТ';
      drawButton(bx,by,bw,bh,label,'#888',false);
    } else {
      drawButton(bx,by,bw,bh,'✅ Я ГОТОВ','#4caf50',isHover(bx,by,bw,bh));
    }
  } else {
    if (hostReady) {
      const label = clientReady ? '⏳ СИНХРОНИЗАЦИЯ...' : '⏳ ЖДЕМ КЛИЕНТА...';
      drawButton(bx,by,bw,bh,label,'#888',false);
    } else {
      let btnText,btnColor;
      const nextInfo=getPhaseInfo(wave+1);
      if(wave%5===0){btnText='★ АРТЕФАКТ + МАГАЗИН →';btnColor='#ffd700';}
      else if(nextInfo.phase==='boss'){btnText=`⚔ БОСС — ВОЛНА ${wave+1} →`;btnColor='#ff3030';}
      else if(nextInfo.phase==='defense'){
        const isFinalDef = nextInfo.defenseWave >= DEFENSE_TOTAL_WAVES;
        btnText=`${isFinalDef?'⚠':'🛡'} РАУНД ${nextInfo.defenseWave}/${DEFENSE_TOTAL_WAVES}${isFinalDef?' (СЛОЖНЕЕ)':''} →`;
        btnColor=isFinalDef?'#ff3030':'#e74c3c';
      }
      else{btnText=`ВОЛНА ${wave+1} →`;btnColor='#4caf50';}
      drawButton(bx,by,bw,bh,btnText,btnColor,isHover(bx,by,bw,bh));
    }
  }
  ctx.textAlign='left';
}

function updateUpgradeScreen(){
  if (!mouse.clicked) return;
  const L = getPanelLayout();
  const p = L.humans[0];
  const px = L.startX;
  const bottomY = L.panelY + L.panelH - 60;
  const bw=360,bh=55,bx=W/2-bw/2,by=H-bh-12;
  
  // ═══ КЛИЕНТ ═══
  if (typeof isClient !== 'undefined' && isClient) {
    if (networkState && networkState.state !== 'upgrade') { state = 'playing'; clientReady = false; return; }
    if (!clientReady && isHover(bx,by,bw,bh)) {
      clientReady = true;
      socket.emit('clientReady');
      return;
    }
    if (clientReady) return;
    
    const healBw=200, healBh=45, healX=px+20, healY=bottomY;
    if (isHover(healX, healY, healBw, healBh)) { socket.emit('clientBuyUpgrade', { type: 'heal' }); return; }
    const anbuBw=200, anbuBh=45, anbuX=px+L.panelW-anbuBw-20, anbuY=bottomY;
    if (isHover(anbuX, anbuY, anbuBw, anbuBh)) { socket.emit('clientBuyUpgrade', { type: 'anbu' }); return; }
    for (const r of getUpgradeButtonRects(L)) {
      if (r.playerIndex !== 0) continue;
      if (mouse.x >= r.x && mouse.x <= r.x+r.w && mouse.y >= r.y && mouse.y <= r.y+r.h) {
        socket.emit('clientBuyUpgrade', { type: 'ability', index: r.abilityIndex, track: r.track });
        return;
      }
    }
    for (const r of getStatButtonRects(L)) {
      if (r.playerIndex !== 0) continue;
      if (mouse.x >= r.x && mouse.x <= r.x+r.w && mouse.y >= r.y && mouse.y <= r.y+r.h) {
        socket.emit('clientBuyUpgrade', { type: 'stat', statKey: r.statKey });
        return;
      }
    }
    return;
  }

  // ═══ ХОСТ ═══
  if (!hostReady && isHover(bx,by,bw,bh)) {
    hostReady = true;
    tryAdvancePhase();
    return;
  }
  if (hostReady) return;
  
  const healCost=30+p.healCount*20;
  const healBw=200, healBh=45, healX=px+20, healY=bottomY;
  if (isHover(healX, healY, healBw, healBh)) { if (p.hp<p.maxHp && p.coins>=healCost) { p.coins-=healCost; p.hp=p.maxHp; p.healCount++; sfxCoin(); } return; }
  const anbuBw=200, anbuBh=45, anbuX=px+L.panelW-anbuBw-20, anbuY=bottomY;
  if (isHover(anbuX, anbuY, anbuBw, anbuBh)) { if (p.coins>=200) { p.coins-=200; spawnAnbuForPlayer(p); sfxCoin(); } return; }
  for (const r of getUpgradeButtonRects(L)) {
    if (r.playerIndex !== 0) continue;
    if (mouse.x >= r.x && mouse.x <= r.x+r.w && mouse.y >= r.y && mouse.y <= r.y+r.h) {
      const ability = p.abilities[r.abilityIndex];
      if (r.track==='cooldown' && (ability.noCd||ability.cd===0)) break;
      if (r.track==='damage' && ability.noDamage) break;
      const up = p.abilityUpgrades[r.abilityIndex]; const lvl = up[r.track]; if (lvl>=3) break;
      const cost = upgradeCost(lvl); if (p.coins>=cost) { p.coins-=cost; up[r.track]++; sfxCoin(); }
      break;
    }
  }
  for (const r of getStatButtonRects(L)) {
    if (r.playerIndex !== 0) continue;
    if (mouse.x >= r.x && mouse.x <= r.x+r.w && mouse.y >= r.y && mouse.y <= r.y+r.h) {
      const stat = STAT_UPGRADES[r.statKey]; const lvl = p.statUpgrades[r.statKey];
      if (lvl >= stat.max) break;
      const cost = stat.cost(lvl);
      if (p.coins >= cost) { p.coins -= cost; p.statUpgrades[r.statKey]++; applyStatUpgrade(p, r.statKey); sfxCoin(); }
      break;
    }
  }
}

function drawPlayerCard(x,y,w,h,player){
  const c=player.character;
  ctx.fillStyle='#1a1a2e';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=c.color;ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);
  ctx.fillStyle=c.color;ctx.font='bold 15px monospace';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText(`ИГРОК ${player.id+1}: ${c.name}`,x+20,y+24);
  ctx.fillStyle='#ffd700';ctx.textAlign='right';ctx.fillText(`💰 ${player.coins}`,x+w-20,y+24);ctx.textAlign='left';
  let cursorY=y+42;
  const hookBoxH=52;
  ctx.fillStyle='rgba(255,215,0,0.06)';ctx.fillRect(x+12,cursorY,w-24,hookBoxH);
  ctx.strokeStyle=c.hook?c.hook.color:'#444';ctx.lineWidth=2;ctx.strokeRect(x+12,cursorY,w-24,hookBoxH);
  if(player.charId==='sasuke'){
    const modeName=player.sasukeMode==='rinnegan'?'РИННЕГАН':'ШАРИНГАН';
    const modeColor=player.sasukeMode==='rinnegan'?'#a855f7':'#e74c3c';
    ctx.fillStyle=modeColor;ctx.font='bold 12px monospace';
    ctx.fillText(`★ ДОДЗЮЦУ: ${modeName}`,x+20,cursorY+16);
    ctx.fillStyle='#ddd';ctx.font='10px monospace';
    wrapTextAt('Выбор режима в начале каждой волны.',x+20,cursorY+30,w-40,13);
  } else {
    ctx.fillStyle=c.hook?c.hook.color:'#888';ctx.font='bold 12px monospace';
    ctx.fillText(`★ ${c.hook?c.hook.name:'—'}`,x+20,cursorY+16);
    ctx.fillStyle='#ddd';ctx.font='10px monospace';
    const hookMech=(c.hook&&HOOK_MECHANICS[c.hook.type])||'Уникальная механика.';
    wrapTextAt(hookMech,x+20,cursorY+30,w-40,13);
  }
  cursorY+=hookBoxH+6;
  const rowH=52;
  for(let i=0;i<4;i++){
    const ab=player.abilities[i];const ay=cursorY+i*rowH;
    ctx.fillStyle=ab.ult?'#ffd700':c.color;ctx.fillRect(x+20,ay,30,30);
    ctx.fillStyle='#000';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(player.abilityLabels[i],x+35,ay+15);ctx.textBaseline='alphabetic';ctx.textAlign='left';
    ctx.fillStyle=ab.ult?'#ffd700':'#eee';ctx.font='bold 12px monospace';
    const noCdMark=(ab.noCd||ab.cd===0)?' [без КД]':'';
    ctx.fillText(`${ab.name}${noCdMark}`,x+58,ay+12);
    ctx.fillStyle='#bbb';ctx.font='10px monospace';ctx.fillText(ab.desc||'',x+58,ay+26);
  }
  cursorY+=4*rowH+6;
  const ultBoxH=64;
  ctx.fillStyle='rgba(255,215,0,0.08)';ctx.fillRect(x+12,cursorY,w-24,ultBoxH);
  ctx.strokeStyle='#ffd700';ctx.lineWidth=2;ctx.strokeRect(x+12,cursorY,w-24,ultBoxH);
  ctx.fillStyle='#ffd700';ctx.fillRect(x+20,cursorY+12,30,30);
  ctx.fillStyle='#000';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(player.comboUltLabel||'F',x+35,cursorY+27);ctx.textBaseline='alphabetic';ctx.textAlign='left';
  ctx.fillStyle='#ffd700';ctx.font='bold 13px monospace';ctx.fillText(`◆ ${c.comboUlt.name} (${COMBO_COST} комбо)`,x+58,cursorY+22);
  ctx.fillStyle='#e0d0a0';ctx.font='10px monospace';
  const ultDesc=COMBO_DESCRIPTIONS[c.id]||'Мощная ульта.';
  wrapTextAt(ultDesc,x+58,cursorY+38,w-76,12);
  cursorY+=ultBoxH+8;
  const artKeys=Object.keys(player.artifacts||{}).filter(k=>player.artifacts[k]>0);
  if(artKeys.length>0){
    ctx.fillStyle='rgba(192,132,252,0.08)';ctx.fillRect(x+12,cursorY,w-24,56);
    ctx.strokeStyle='#c084fc';ctx.lineWidth=2;ctx.strokeRect(x+12,cursorY,w-24,56);
    ctx.fillStyle='#c084fc';ctx.font='bold 12px monospace';ctx.textAlign='left';
    ctx.fillText('★ АРТЕФАКТЫ:',x+20,cursorY+16);
    let ax=x+20,ay=cursorY+36;
    for(const key of artKeys){
      const a=ARTIFACTS[key],count=player.artifacts[key];
      ctx.font='bold 15px monospace';ctx.fillStyle=a.color;
      const txt=a.icon+(count>1?`×${count}`:'');
      const tw=ctx.measureText(txt).width;
      if(ax+tw>x+w-20){ax=x+20;ay+=20;}
      ctx.fillText(txt,ax,ay);ax+=tw+10;
    }
  }
}
function drawPauseMenu(){
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#fff';ctx.font='bold 48px monospace';ctx.fillText('ПАУЗА',W/2,45);
    const n=players.length;const cardW=n===1?700:500;const cardH=680,gap=30;
  const totalW=cardW*n+gap*(n-1);const startX=(W-totalW)/2,cardY=55;
  for(let i=0;i<n;i++)drawPlayerCard(startX+i*(cardW+gap),cardY,cardW,cardH,players[i]);
  const bw=240,bh=55,bY=H-bh-12;
  drawButton(W/2-bw-10,bY,bw,bh,'ПРОДОЛЖИТЬ','#4caf50',isHover(W/2-bw-10,bY,bw,bh));
  drawButton(W/2+10,bY,bw,bh,'В МЕНЮ','#a33',isHover(W/2+10,bY,bw,bh));
  ctx.textAlign='left';
}
function updatePauseMenu(){
  if(!mouse.clicked)return;
  const bw=240,bh=55,bY=H-bh-12;
  if(isHover(W/2-bw-10,bY,bw,bh))paused=false;
  else if(isHover(W/2+10,bY,bw,bh)){paused=false;state='menu';pendingActions=[];}
}

function drawDead(){
  ctx.fillStyle='#0f0f18';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.textBaseline='alphabetic';
  if(defenseOutcome==='lose'){
    const failDeath=defenseFailCount>=DEFENSE_FAIL_MAX;
    ctx.fillStyle='#e74c3c';ctx.font='bold 60px monospace';
    ctx.fillText(failDeath?'ЗАЩИТА ПРОРВАНА':'ВЫ ПОГИБЛИ',W/2,240);
    ctx.fillStyle='#eee';ctx.font='bold 28px monospace';
    ctx.fillText(`Достигнута волна: ${wave}`,W/2,320);
    let phaseLabel='';
    if(phase==='defense')phaseLabel=`🛡 Раунд ${defenseWave}/${DEFENSE_TOTAL_WAVES} (${defenseFailCount}/${DEFENSE_FAIL_MAX} провалов)`;
    else if(phase==='boss')phaseLabel='⚔ Босс';
    else phaseLabel='Обычная волна';
    ctx.fillText(`Фаза: ${phaseLabel}`,W/2,360);
    const bw=260,bh=75,gap=40;const totalW=bw*2+gap;const startX=(W-totalW)/2,bY=480;
    drawButton(startX,bY,bw,bh,'ПОВТОРИТЬ','#4caf50',isHover(startX,bY,bw,bh));
    drawButton(startX+bw+gap,bY,bw,bh,'В МЕНЮ','#888',isHover(startX+bw+gap,bY,bw,bh));
    ctx.textAlign='left';return;
  }
  const gateDeath=players.some(p=>p.charId==='lee'&&!p.alive&&p.leeGateCount>=8);
  if(gateDeath){
    ctx.fillStyle='#ff1744';ctx.font='bold 72px monospace';ctx.fillText('ХАТИМОН КАЙ',W/2,240);
    ctx.fillStyle='#22c55e';ctx.font='bold 28px monospace';ctx.fillText('«Восемь Врат — цена последнего боя»',W/2,300);
    ctx.fillStyle='#aaa';ctx.font='italic 20px monospace';
    ctx.fillText('— Майто Гай, Легендарный Синий Зверь Конохи',W/2,340);
    ctx.fillStyle='#eee';ctx.font='bold 24px monospace';ctx.fillText(`Достигнута волна: ${wave}`,W/2,400);
  } else {
    ctx.fillStyle='#e74c3c';ctx.font='bold 60px monospace';ctx.fillText('ВЫ ПОГИБЛИ',W/2,280);
    ctx.fillStyle='#eee';ctx.font='bold 32px monospace';ctx.fillText(`Достигнута волна: ${wave}`,W/2,360);
  }
  const bw=260,bh=75,gap=40;const totalW=bw*2+gap;const startX=(W-totalW)/2,bY=480;
  drawButton(startX,bY,bw,bh,'ПОВТОРИТЬ','#4caf50',isHover(startX,bY,bw,bh));
  drawButton(startX+bw+gap,bY,bw,bh,'В МЕНЮ','#888',isHover(startX+bw+gap,bY,bw,bh));
  ctx.textAlign='left';
}
function updateDead(){
  if(!mouse.clicked)return;
  const bw=260,bh=75,gap=40;const totalW=bw*2+gap;const startX=(W-totalW)/2,bY=480;
  if(isHover(startX,bY,bw,bh))startRun(mode,p1Char,p2Char);
  else if(isHover(startX+bw+gap,bY,bw,bh)){state='menu';pendingActions=[];}
}