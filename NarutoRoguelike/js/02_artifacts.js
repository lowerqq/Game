"use strict";
// ==================== ARTIFACTS ====================
const ARTIFACTS={
  kunai:{name:'Кунай выпускника',desc:'+Дальность атаки',icon:'✧',color:'#cbd5e1',maxStack:5,stackLabel:l=>`+${50*l} дальность`},
  shuriken:{name:'Фума-сюрикен',desc:'+1 авто-сюрикен (2с перезарядка)',icon:'✩',color:'#a5f3fc',maxStack:3,stackLabel:l=>`${l} сюрикен${l>1?'а':''} / 2с`},
  explosiveTag:{name:'Взрывная печать',desc:'Шанс авто-атаки с малым AoE',icon:'✸',color:'#f97316',maxStack:10,stackLabel:l=>`${5*l}% шанс AoE`},
  smokeBomb:{name:'Дымовая шашка',desc:'Шанс что авто-атака оглушит',icon:'☁',color:'#94a3b8',maxStack:10,stackLabel:l=>`${5*l}% шанс оглушения`},
  substitution:{name:'Свиток Замены',desc:'Шанс при уроне — 3с неуязвимости',icon:'⚘',color:'#fbbf24',maxStack:10,stackLabel:l=>`${5*l}% шанс замены`},
  kakashiBells:{name:'Колокольчики Какаши',desc:'+скорость атаки всем рядом',icon:'♪',color:'#fbbf24',maxStack:5,stackLabel:l=>`+${3*l} скор.атаки (аура 250)`},
  anbuMask:{name:'Маска АНБУ',desc:'+5% скорости атаки',icon:'◭',color:'#2a2a2a',maxStack:10,stackLabel:l=>`+${5*l}% скор.атаки`},
  kusanagi:{name:'Кусанаги',desc:'Летающий меч рядом',icon:'⚔',color:'#e2e8f0',maxStack:3,stackLabel:l=>`${l} меч${l>1?'а':''} на орбите`},
  redPill:{name:'Красная пилюля',desc:'+5% урона авто-атак',icon:'⬤',color:'#dc2626',maxStack:10,stackLabel:l=>`+${5*l}% урон авто-атак`},
  greenPill:{name:'Зеленая пилюля',desc:'+5% к здоровью',icon:'⬤',color:'#22c55e',maxStack:10,stackLabel:l=>`+${5*l}% HP`},
  raikageArmor:{name:'Броня Райкаге',desc:'+5% скорости перемещения, +2 брони',icon:'⚡',color:'#38bdf8',maxStack:3,stackLabel:l=>`+${5*l}% скор, +${2*l} брони`},
  threeToothKunai:{name:'Трёхзубый кунай',desc:'+10 к урону автоатак, −5% скорости автоатаки',icon:'⚔',color:'#a78bfa',maxStack:3,stackLabel:l=>`+${10*l} урон, −${5*l}% скор.атаки`},
  soldierPill:{name:'Солдатская пилюля',desc:'−25 HP, +25 к урону автоатак',icon:'💊',color:'#f43f5e',maxStack:3,stackLabel:l=>`−${25*l} HP, +${25*l} урон`},
  bloodPill:{name:'Кровавая пилюля',desc:'+25 HP, −3 брони',icon:'🩸',color:'#dc2626',maxStack:3,stackLabel:l=>`+${25*l} HP, −${3*l} брони`},
  akatsukiRing:{name:'Кольцо Акацуки',desc:'+10% скорости автоатаки, −5% скорости перемещения',icon:'💍',color:'#7f1d1d',maxStack:3,stackLabel:l=>`+${10*l}% скор.атаки, −${5*l}% скор.перемещ.`},
  akatsukiCloak:{name:'Плащ Акацуки',desc:'+10 к урону автоатак, −5% скорости перемещения',icon:'🧥',color:'#1e1e1e',maxStack:3,stackLabel:l=>`+${10*l} урон, −${5*l}% скор.перемещ.`},
  kageHat:{name:'Шляпа Хокаге',desc:'+1 заряд рывка',icon:'🎩',color:'#dc2626',maxStack:3,stackLabel:l=>`+${l} заряд${l>1?'а':''} рывка`},
  kageCloak:{name:'Плащ Хокаге',desc:'−10% перезарядки рывка',icon:'🧥',color:'#f43f5e',maxStack:5,stackLabel:l=>`−${10*l}% перезарядки рывка`},
  whiteFangTanto:{name:'Танто Белого Клыка',desc:'На карте появляется клинок. Рядом с ним +20% урона',icon:'🗡️',color:'#e2e8f0',maxStack:3,stackLabel:l=>`${l} клин${l>1?'ка':''}, +${20*l}% урона рядом`},
  konanShuriken:{name:'Бумажные сюрикены Конан',desc:'Авто-сюрикен, +1 HP при попадании. −5% скорости атаки',icon:'📄',color:'#f5f5f5',maxStack:3,stackLabel:l=>`${l} сюрикен${l>1?'а':''}, −${5*l}% скор.атаки`},
  sasoriPuppet:{name:'Марионетка Сасори',desc:'Летает рядом, уничтожает снаряды. 5с перезарядка',icon:'🎭',color:'#7c2d12',maxStack:3,stackLabel:l=>`${l} марионет${l>1?'ки':'ка'} вкруг`},
  kabutoGlasses:{name:'Очки Кабуто',desc:'+5% шанс крита',icon:'👓',color:'#0ea5e9',maxStack:5,stackLabel:l=>`+${5*l}% крит`}
};
const ARTIFACT_KEYS=Object.keys(ARTIFACTS);
const ARTIFACT_BASE_PRICES={kunai:40,shuriken:60,explosiveTag:50,smokeBomb:50,substitution:70,kakashiBells:60,anbuMask:40,kusanagi:100,redPill:40,greenPill:40,raikageArmor:80,threeToothKunai:60,soldierPill:50,bloodPill:50,akatsukiRing:70,akatsukiCloak:70,kageHat:100,kageCloak:80,whiteFangTanto:90,konanShuriken:60,sasoriPuppet:90,kabutoGlasses:50};
function getArtifactPriceFor(player,key){
  const stack=player.getArtifactStack(key);
  if(stack>=ARTIFACTS[key].maxStack)return Infinity;
  return Math.floor((ARTIFACT_BASE_PRICES[key]||60)*Math.pow(1.5,stack));
}

let shopState=null;

function beginShop(){
  const humans=players.filter(p=>!p.isAI);
  const offers=humans.map(p=>{
    const pool=ARTIFACT_KEYS.filter(k=>p.getArtifactStack(k)<ARTIFACTS[k].maxStack);
    fisherYates(pool);
    return pool.slice(0,3);
  });
  shopState={offers,bought:offers.map(arr=>arr.map(()=>false))};
  state='shop';
}

// ═══ ТЕПЕРЬ ВСЕГДА 3 КАРТОЧКИ ДЛЯ ЛОКАЛЬНОГО ИГРОКА ═══
function getShopLayout(){
  const cardW=360,cardH=280,gapX=25;
  const totalW=cardW*3+gapX*2;
  const startX=(W-totalW)/2;
  const positions=[];
  const baseY=170;
  for(let i=0;i<3;i++){
    positions.push({pi:0,ai:i,x:startX+i*(cardW+gapX),y:baseY,w:cardW,h:cardH});
  }
  return positions;
}

function drawShopCard(player,key,pos,bought){
  const art=ARTIFACTS[key];const stack=player.getArtifactStack(key);const max=art.maxStack;
  const isMax=stack>=max;const price=getArtifactPriceFor(player,key);
  const canAfford=player.coins>=price&&!bought&&!isMax;
  const hov=isHover(pos.x,pos.y,pos.w,pos.h)&&!bought&&!isMax;
  ctx.fillStyle=hov?'#2a2a4a':'#1a1a2e';ctx.fillRect(pos.x,pos.y,pos.w,pos.h);
  ctx.strokeStyle=isMax||bought?'#444':art.color;ctx.lineWidth=hov?4:2;ctx.strokeRect(pos.x,pos.y,pos.w,pos.h);
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=isMax?'#555':art.color;ctx.font='bold 52px monospace';ctx.fillText(art.icon,pos.x+pos.w/2,pos.y+52);
  ctx.textBaseline='alphabetic';ctx.fillStyle=isMax?'#666':'#eee';ctx.font='bold 17px monospace';ctx.fillText(art.name,pos.x+pos.w/2,pos.y+110);
  ctx.fillStyle='#bbb';ctx.font='12px monospace';ctx.fillText(art.desc,pos.x+pos.w/2,pos.y+135);
  ctx.fillStyle=art.color;ctx.font='bold 13px monospace';ctx.fillText(`У вас: ×${stack}/${max}`,pos.x+pos.w/2,pos.y+162);
  ctx.fillStyle=art.color;ctx.font='bold 11px monospace';ctx.fillText(art.stackLabel(stack+1),pos.x+pos.w/2,pos.y+180);
  if(isMax){ctx.fillStyle='#4caf50';ctx.font='bold 16px monospace';ctx.fillText('★ МАКСИМУМ',pos.x+pos.w/2,pos.y+228);}
  else if(bought){ctx.fillStyle='#4caf50';ctx.font='bold 16px monospace';ctx.fillText('✓ КУПЛЕНО',pos.x+pos.w/2,pos.y+228);}
  else{
    const btnW=pos.w-50,btnH=46,bX=pos.x+25,bY=pos.y+205;
    ctx.fillStyle=canAfford?(hov?'#2a4a5f':'#1e3a5f'):'#1e1e36';ctx.fillRect(bX,bY,btnW,btnH);
    ctx.strokeStyle=canAfford?'#ffd700':'#555';ctx.lineWidth=2;ctx.strokeRect(bX,bY,btnW,btnH);
    ctx.fillStyle=canAfford?'#ffd700':'#888';ctx.font='bold 17px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`💰 ${price}  КУПИТЬ`,bX+btnW/2,bY+btnH/2+1);
    ctx.textBaseline='alphabetic';ctx.textAlign='left';
  }
  ctx.textAlign='left';
}

function drawShop(){
  ctx.fillStyle='#0f0f18';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.fillStyle='#ffd700';ctx.font='bold 44px monospace';
  ctx.fillText('🛒 МАГАЗИН АРТЕФАКТОВ',W/2,60);
  ctx.fillStyle='#aaa';ctx.font='bold 14px monospace';
  ctx.fillText('Цена растёт ×1.5 за каждую копию, что у вас уже есть',W/2,88);

  const humans=players.filter(p=>!p.isAI);
  const wavesToBoss=(wave%BOSS_EVERY===0)?0:BOSS_EVERY-(wave%BOSS_EVERY);
  ctx.fillStyle='#c084fc';ctx.font='bold 13px monospace';
  ctx.fillText(wavesToBoss===0?'★ СЕЙЧАС БОСС ★':`до босса: ${wavesToBoss}`,W/2,112);

  if(!shopState){ctx.textAlign='left';return;}
  const layout=getShopLayout();

  const player = humans[0];
  ctx.fillStyle=player.color;ctx.font='bold 20px monospace';ctx.textAlign='center';
  ctx.fillText(`ВЫ: ${player.character.name}  💰${player.coins}`,W/2,140);

  for(const pos of layout){
    const key=shopState.offers[0][pos.ai];
    if(!key)continue;
    drawShopCard(player,key,pos,shopState.bought[0][pos.ai]);
  }

  const bw=360,bh=55,bx=W/2-bw/2,by=H-bh-20;
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
      drawButton(bx,by,bw,bh,'ДАЛЬШЕ →','#4caf50',isHover(bx,by,bw,bh));
    }
  }
  ctx.textAlign='left';
}

function updateShop(){
  if(!mouse.clicked||!shopState)return;
  const bw=360,bh=55,bx=W/2-bw/2,by=H-bh-20;
  
  // ═══ КЛИЕНТ ═══
  if (isClient) {
    if (networkState && networkState.state !== 'shop') { state='playing'; clientReady = false; return; }
    if (!clientReady && isHover(bx,by,bw,bh)) { clientReady = true; socket.emit('clientReady'); return; }
    if (clientReady) return;
    const layout = getShopLayout();
    for(const pos of layout){
      if(!isHover(pos.x,pos.y,pos.w,pos.h))continue;
      if(shopState.bought[0][pos.ai])continue;
      if(!shopState.offers[0][pos.ai])continue;
      socket.emit('clientBuyArtifact', { ai: pos.ai });
      return;
    }
    return;
  }

  // ═══ ХОСТ ═══
  if (!hostReady && isHover(bx,by,bw,bh)) { hostReady = true; tryAdvancePhase(); return; }
  if (hostReady) return;
  
  const humans = players.filter(p=>!p.isAI);
  const layout=getShopLayout();
  for(const pos of layout){
    if(!isHover(pos.x,pos.y,pos.w,pos.h))continue;
    if(shopState.bought[0][pos.ai])continue;
    const player=humans[0];
    const key=shopState.offers[0][pos.ai];
    if(!key)continue;
    const stack=player.getArtifactStack(key);
    if(stack>=ARTIFACTS[key].maxStack)continue;
    const price=getArtifactPriceFor(player,key);
    if(player.coins>=price){
      player.coins-=price;
      player.equipArtifact(key);
      shopState.bought[0][pos.ai]=true;
      sfxCoin();
    }
    return;
  }
}
// ==================== END ARTIFACTS ====================