"use strict";
const HOOK_DESCRIPTIONS={
  kyuubiCloak:'+1 стек чакры за убийство. 8 стеков → Режим Кьюби: +50% скорости, аура жжёт рядом.',
  curse:'Метки ставятся способностями (до 3 на враге). 3 метки = +50% урона. Не пропадают до смерти.',
  punchCharge:'Стой на месте — копится заряд (до 3). 3 заряда = ×2 урона способностей.',
  packHunt:'Рядом с Акамару: +20% скорости и +30% урона.',
  dashCdReduce:'После рывка все умения (кроме SP и F) получают −2с к перезарядке.',
  bugAura:'Вокруг Шино летают жуки. Враг, подошедший слишком близко, получает периодический урон.',
  comboCounter:'+1 за попадание милишкой (макс 20). +8% урона за очко. Сброс через 5с.',
  seals:'Печати на врагах (до 8). 8 = блок чакроканалов: враг теряет способность стрелять на 3с.',
  stances:'Стойка переключается клавишей F : КУНАИ / ВЗРЫВ / СЮРИКЕНЫ / МЕЧИ. Каждая радикально меняет автоатаку.',
  puppets:'Подчиняй врагов (до 3). Они сражаются за тебя.',
  shadowWeb:'Стоя на месте, каждые 0.75с пускаешь теневую иглу в ближайшего несвязанного врага. Игла наносит урон и накладывает Связь. Связанные враги делят 50% урона между собой.',
  calories:'Калории: стоя +3/сек. Умения тратят калории.',
  sand:'Песок копится стаками при бездействии. Чем больше — тем больше блок первого удара.',
  livingPuppet:'Турели-куклы: Карасу (стреляет), Куройари (щит), Сансё (ловушка).',
  gust:'Веер раскрывается каждые 10 секунд. Сброс при новой волне.',
  byakugoSeal:'Заряды (0–12) копятся ТОЛЬКО стоя на месте (+2/сек). Q и R тратят ВСЕ заряды: ×(1+0.2×N) урона. SP мгновенно даёт 12.',
  dashBurst:'Рывок: ×1.4 длиннее, ×2.5 КД короче. При рывке — круговая атака Хакке: урон 3× и отброс в радиусе 100px, уничтожает ВСЕ снаряды (включая снаряды боссов). Во время рывка также сносит снаряды в радиусе 75px.'
};
const HOOK_MECHANICS={
  kyuubiCloak:'+1 стек за убийство. На 8 → Режим Кьюби.',
  curse:'Способности ставят метку. 3 метки = +50% урона.',
  punchCharge:'На месте +2/сек. 3 заряда = ×2 урона.',
  packHunt:'Каждые 5с метит врага. Помеченный = крит ×3.',
  dashCdReduce:'Рывок = −2с к КД всех умений (кроме SP и F).',
  bugAura:'Аура жуков вокруг Шино: урон всему, что близко (R=90).',
  comboCounter:'+1 за удар. ×0.08 урона/очко.',
  seals:'Печати (до 8). 8 = блок на 3с.',
  stances:'F — смена стойки. Автоатака адаптируется.',
  puppets:'Подчинённые (до 3) сражаются за тебя.',
  shadowWeb:'Стой = игла каждые 0.75с. Связь: 50% урона переходит.',
  calories:'Калории копятся стоя. Умения тратят.',
  sand:'Стаки песка = блок первого удара.',
  livingPuppet:'Турели: Карасу/Куройари/Сансё.',
  gust:'Веер раскрывается каждые 10с.',
  byakugoSeal:'Стоя на месте +2 заряда/сек (до 12). Q/R тратят все: ×(1+0.2N).',
  dashBurst:'Рывок: длиннее + КД ×0.4. Бьёт по площади 100px, сносит снаряды.'
};
const COMBO_DESCRIPTIONS={
  naruto:'8 комбо. Отряд клонов-милишников.',
  sasuke:'8 комбо. Кирин: столб молнии, стан 3с.',
  sakura:'8 комбо. 4с: реген 15/с, +25% урона, +40% скорости. Q/R/SP усилены в 1.5× (SP — радиус до 280px).',
  kiba:'8 комбо. Двуглавая волчица.',
  hinata:'8 комбо. 128 Ладоней: молчание + стан.',
  shino:'8 комбо. Рой-шторм: 3 стака паразитов.',
  lee:'8 комбо. Хатимон Кай: 8 врат.',
  neji:'8 комбо. 128 Ладоней: 8 печатей.',
  tenten:'8 комбо. 3 волны по 16 снарядов.',
  ino:'8 комбо. Масс-подчинение 5 врагов.',
  shikamaru:'8 комбо. Теневые иглы (×4) сковывают несвязанных врагов.',
  choji:'8 комбо. Бабочка Чёджи: 10с полёт.',
  gaara:'8 комбо. Шукаку: 10с ×2 размер.',
  kankuro:'8 комбо. 6 кукол-турелей по кругу.',
  temari:'8 комбо. Все враги стягиваются в центр.'
};
// ==================== ПЕРСОНАЖИ v7.1 ====================
// (Полностью удалены пассивные эффекты, оставлены только уникальные хуки)
const CHARACTERS={
  naruto:{id:'naruto',name:'НАРУТО',color:'#ff9900',
    base:{hp:140,speed:3.6,damage:7,atkSpeed:18,defense:1},
    hook:{type:'kyuubiCloak',name:'РЕЖИМ КЬЮБИ',color:'#ff6600',max:8},
    comboUlt:{name:'Отряд Клонов',cast(p){
      for(let i=0;i<6;i++){
        const a=p.facing+(i-2.5)*0.35;
        const cx=clamp(p.x+Math.cos(a)*40,ARENA.x+20,ARENA.x+ARENA.w-20);
        const cy=clamp(p.y+Math.sin(a)*40,ARENA.y+20,ARENA.y+ARENA.h-20);
        const c=new Clone(cx,cy,p,'rasengan_rusher',a);c.life=420;c.maxLife=420;clones.push(c);
      }
      spawnShockwave(p.x,p.y,250,'#ff6600');spawnParticles(p.x,p.y,'#ff6600',80);screenFlash=30;screenShake=15;sfxUlt();
    }},
    abilities:[
      {name:'Расенган',keyLabel:'Q',cd:180,desc:'Рывок + AoE 120px',ult:false,
        cast(p,aim){
          const target=findTargetInCone(p,aim,300,Math.PI/2);
          let nx,ny;
          if(target){const ang=Math.atan2(target.y-p.y,target.x-p.x);const d=Math.min(180,Math.hypot(target.x-p.x,target.y-p.y)-p.r-target.r+30);nx=clamp(p.x+Math.cos(ang)*d,ARENA.x+p.r,ARENA.x+ARENA.w-p.r);ny=clamp(p.y+Math.sin(ang)*d,ARENA.y+p.r,ARENA.y+ARENA.h-p.r);}
          else{nx=clamp(p.x+Math.cos(aim)*160,ARENA.x+p.r,ARENA.x+ARENA.w-p.r);ny=clamp(p.y+Math.sin(aim)*160,ARENA.y+p.r,ARENA.y+ARENA.h-p.r);}
          const dmg=p.getDamage()*4;
          forEachEnemySnapshot(e=>{if(Math.hypot(e.x-nx,e.y-ny)<e.r+60){e.takeDamage(dmg,nx,ny,false,p);if(!e.removed){const dx=e.x-nx,dy=e.y-ny,dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*30;e.ky+=dy/dd*30;if(!e.isBoss)e.stunTimer=Math.max(e.stunTimer,40);}}});
          for(let i=0;i<=20;i++){const t=i/20;spawnParticles(p.x+(nx-p.x)*t,p.y+(ny-p.y)*t,'#4fc3f7',4);}
          spawnShockwave(nx,ny,120,'#4fc3f7');
          p.x=nx;p.y=ny;p.invuln=Math.max(p.invuln,20);
          screenShake=Math.max(screenShake,10);hitStop=Math.max(hitStop,3);sfxCast();
        }
      },
      {name:'Кагэ Буншин',keyLabel:'E',cd:280,desc:'3 клона (макс 6)',ult:false,
        cast(p,aim){
          const live=clones.filter(c=>c.owner===p&&c.mode==='ranged_clone'&&!c.removed).length;
          const toSpawn=Math.min(3,Math.max(0,6-live));
          for(let i=0;i<toSpawn;i++){
            const a=aim+(i-1)*0.9;
            const cx=clamp(p.x+Math.cos(a)*50,ARENA.x+20,ARENA.x+ARENA.w-20);
            const cy=clamp(p.y+Math.sin(a)*50,ARENA.y+20,ARENA.y+ARENA.h-20);
            const c=new Clone(cx,cy,p,'ranged_clone',a);c.life=480;c.maxLife=480;clones.push(c);
          }
          spawnShockwave(p.x,p.y,60,'#ff9900');spawnParticles(p.x,p.y,'#ff9900',20);sfxCast();
        }
      },
      {name:'Расенсюрикен',keyLabel:'R',cd:550,desc:'Прошив + вихрь',ult:false,
        cast(p,aim){
          const proj=new Projectile(p.x,p.y,aim,p.getDamage()*5,'#a5f3fc',20,8);
          proj.pierce=true;proj.attacker=p;proj.life=Math.floor(600/8);
          proj.isRasenshuriken=true;proj.spawnVortexOnEnd=true;
          projectiles.push(proj);
          spawnShockwave(p.x,p.y,90,'#a5f3fc');spawnParticles(p.x,p.y,'#a5f3fc',30);
          screenShake=Math.max(screenShake,10);sfxCast();
        }
      },
      {name:'Режим Мудреца',keyLabel:'␣',cd:1200,desc:'6с: автоатака бьёт всех в 250px',ult:true,noDamage:true,
        cast(p){p.sageTimer=360;spawnShockwave(p.x,p.y,250,'#ff9900');spawnParticles(p.x,p.y,'#ff6600',60);screenFlash=35;screenShake=20;sfxUlt();}
      }
    ]},

sasuke:{id:'sasuke',name:'САСКЕ',color:'#5a6ee8',
  base:{hp:100,speed:4.0,damage:8,atkSpeed:18,defense:0},
  hook:null,                               // ← проклятий больше нет
  comboUlt:{name:'Кирин',cast(p){
    const aim=p.facing,range=900;
    beams.push(new Beam(p.x,p.y,aim,range,80,p.getDamage()*14,'#aaddff',40));
    const ex=p.x+Math.cos(aim)*range,ey=p.y+Math.sin(aim)*range;
    forEachEnemySnapshot(e=>{
      if(pointSegmentDist(e.x,e.y,p.x,p.y,ex,ey)<e.r+50){
        e.takeDamage(e.isBoss?e.maxHp*0.1:e.maxHp*0.4,p.x,p.y,false,p,true);
        if(!e.removed)e.stunTimer=Math.max(e.stunTimer,180);
      }
    });
    screenFlash=60;screenShake=30;hitStop=12;sfxUlt();
  }},
  // ═══════════════ ШАРИНГАН ═══════════════
  sharinganAbilities:[
    {name:'Чидори Нагаси',keyLabel:'Q',cd:200,desc:'Цепь молний',ult:false,
      cast(p,aim){
        const first=findTargetInCone(p,aim,300,Math.PI/2.5);
        if(!first)return false;
        const chain=[first];first.takeDamage(p.getDamage()*3,p.x,p.y,false,p);
        let cur=first;
        for(let k=0;k<5;k++){
          let next=null,nd=Infinity;
          for(const e of enemies){if(e.removed||chain.includes(e))continue;const d=dist2(cur,e);if(d<250*250&&d<nd){nd=d;next=e;}}
          for(const b of bosses){if(b.removed||chain.includes(b))continue;const d=dist2(cur,b);if(d<250*250&&d<nd){nd=d;next=b;}}
          if(!next)break;
          beams.push(new Beam(cur.x,cur.y,Math.atan2(next.y-cur.y,next.x-cur.x),250,4,0,'#a5f3fc',12));
          next.takeDamage(p.getDamage()*2.5,cur.x,cur.y,false,p);
          chain.push(next);cur=next;
        }
        screenShake=Math.max(screenShake,10);sfxCast();
      }
    },
    {name:'Аматерасу',keyLabel:'E',cd:400,desc:'Зона чёрного пламени 7с',ult:false,
      cast(p,aim){
        const tx=clamp(p.x+Math.cos(aim)*180,ARENA.x+40,ARENA.x+ARENA.w-40);
        const ty=clamp(p.y+Math.sin(aim)*180,ARENA.y+40,ARENA.y+ARENA.h-40);
        addZone(new Zone(tx,ty,90,420,p.getDamage()*1.8,'#1a0a1a',p,'amaterasu'));
        spawnShockwave(tx,ty,90,'#7c3aed');spawnParticles(tx,ty,'#1a0a1a',40);sfxCast();
      }
    },
    {name:'Огненный Шар',keyLabel:'R',cd:450,desc:'Большой медленный шар',ult:false,
      cast(p,aim){
        const proj=new Projectile(p.x,p.y,aim,p.getDamage()*3.5,'#f97316',26,5);
        proj.attacker=p;proj.pierce=true;proj.explodeRadius=140;
        projectiles.push(proj);sfxCast();
      }
    },
    {name:'Сусаноо',keyLabel:'␣',cd:1200,desc:'6с аура + щит 100',ult:true,
      cast(p){
        p.susanooTimer=360;p.shield+=100;p.shieldTimer=Math.max(p.shieldTimer,360);
        spawnShockwave(p.x,p.y,200,'#a855f7');screenFlash=35;screenShake=20;sfxUlt();
      }
    }
  ],
  // ═══════════════ РИННЕГАН ═══════════════
  rinneganAbilities:[
    {name:'Чидори Нагаси',keyLabel:'Q',cd:200,desc:'Цепь молний',ult:false,
      cast(p,aim){
        const first=findTargetInCone(p,aim,300,Math.PI/2.5);
        if(!first)return false;
        const chain=[first];first.takeDamage(p.getDamage()*3,p.x,p.y,false,p);
        let cur=first;
        for(let k=0;k<5;k++){
          let next=null,nd=Infinity;
          for(const e of enemies){if(e.removed||chain.includes(e))continue;const d=dist2(cur,e);if(d<250*250&&d<nd){nd=d;next=e;}}
          for(const b of bosses){if(b.removed||chain.includes(b))continue;const d=dist2(cur,b);if(d<250*250&&d<nd){nd=d;next=b;}}
          if(!next)break;
          beams.push(new Beam(cur.x,cur.y,Math.atan2(next.y-cur.y,next.x-cur.x),250,4,0,'#a5f3fc',12));
          next.takeDamage(p.getDamage()*2.5,cur.x,cur.y,false,p);
          chain.push(next);cur=next;
        }
        screenShake=Math.max(screenShake,10);sfxCast();
      }
    },
    {name:'Аменотеджикара',keyLabel:'E',cd:400,desc:'Обмен с дальним врагом + урон',ult:false,
      cast(p,aim){
        let farthest=null,maxDist=0;
        for(const e of enemies){if(e.removed)continue;const d=dist2(p,e);if(d>maxDist){maxDist=d;farthest=e;}}
        for(const b of bosses){if(b.removed)continue;const d=dist2(p,b);if(d>maxDist){maxDist=d;farthest=b;}}
        if(!farthest){spawnDamageNumber(p.x,p.y-40,'НЕТ ЦЕЛИ','#f55',false);return false;}
        const px=p.x,py=p.y;
        p.x=clamp(farthest.x,ARENA.x+p.r,ARENA.x+ARENA.w-p.r);
        p.y=clamp(farthest.y,ARENA.y+p.r,ARENA.y+ARENA.h-p.r);
        farthest.x=clamp(px,ARENA.x+farthest.r,ARENA.x+ARENA.w-farthest.r);
        farthest.y=clamp(py,ARENA.y+farthest.r,ARENA.y+ARENA.h-farthest.r);
        farthest.takeDamage(p.getDamage()*5,p.x,p.y,false,p);
        spawnShockwave(px,py,150,'#a855f7');
        spawnShockwave(p.x,p.y,150,'#a855f7');
        spawnParticles(px,py,'#a855f7',40);
        spawnParticles(p.x,p.y,'#a855f7',40);
        p.invuln=Math.max(p.invuln,30);
        screenShake=20;hitStop=6;sfxCast();
      }
    },
    {name:'Шинра Тенсей',keyLabel:'R',cd:450,desc:'Волна: сносит снаряды, отбрасывает',ult:false,
      cast(p){
        for(const ep of enemyProjectiles){if(!ep.dead){ep.dead=true;spawnParticles(ep.x,ep.y,'#a855f7',4);}}
        for(const e of [...enemies]){
          if(e.removed)continue;
          const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;
          if(d<1500){
            const push=80*(1-d/1500);
            e.kx+=dx/d*push;e.ky+=dy/d*push;
            e.takeDamage(p.getDamage()*2,p.x,p.y,false,p);
          }
        }
        for(const b of [...bosses]){
          if(b.removed)continue;
          const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||1;
          if(d<1500){
            const push=25*(1-d/1500);
            b.kx+=dx/d*push;b.ky+=dy/d*push;
            b.takeDamage(p.getDamage()*2,p.x,p.y,false,p);
          }
        }
        spawnShockwave(p.x,p.y,1500,'#a855f7');
        spawnShockwave(p.x,p.y,900,'#ddd6fe');
        spawnShockwave(p.x,p.y,400,'#fff');
        screenFlash=40;screenShake=25;hitStop=8;sfxUlt();
      }
    },
    {name:'Чибаку Тенсей',keyLabel:'␣',cd:1200,desc:'Чёрная дыра: притягивает и бьёт',ult:true,
      cast(p,aim){
        const ball=new ChibakuBall(p.x,p.y,p);
        ball.vx=Math.cos(aim)*10;ball.vy=Math.sin(aim)*10;
        chibakuBalls.push(ball);
        spawnShockwave(p.x,p.y,150,'#a855f7');
        spawnParticles(p.x,p.y,'#1e1b4b',60);
        screenFlash=30;screenShake=20;sfxUlt();
      }
    }
  ]
},
  sakura:{id:'sakura',name:'САКУРА',color:'#f472b6',
    base:{hp:140,speed:3.5,damage:7,atkSpeed:18,defense:3},
    hook:{type:'byakugoSeal',name:'ПЕЧАТЬ БЬЯКУГО',color:'#f472b6',max:12},
    comboUlt:{name:'Бьякуго но Ин',cast(p){
      // F: временный супер-режим — реген + урон + скорость
      p.byakugoNoInTimer=240; // 4 секунды
      p.invuln=Math.max(p.invuln,30);
      spawnShockwave(p.x,p.y,260,'#f472b6');
      spawnShockwave(p.x,p.y,180,'#fbcfe8');
      spawnParticles(p.x,p.y,'#fbcfe8',80);
      spawnParticles(p.x,p.y,'#f472b6',60);
      spawnDamageNumber(p.x,p.y-70,'БЬЯКУГО НО ИН!','#f472b6',true);
      screenFlash=40;screenShake=20;hitStop=8;sfxUlt();
    }},
    abilities:[
      // ═══ Q: без изменений — Удар Окадзаки ═══
      {name:'Удар Окадзаки',keyLabel:'Q',cd:200,desc:'Конус 200px. Тратит ВСЕ заряды Печати (копятся стоя): ×(1+0.2N)',ult:false,
        cast(p,aim){
          const charges=p.hookValue||0;
          const chargeMult=1+charges*0.2;
          const range=200,halfAngle=Math.PI/3;
          let baseDmgMult=5*chargeMult;
if(p.byakugoNoInTimer>0)baseDmgMult*=1.5;
          forEachEnemySnapshot(e=>{
            const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
            if(d<range&&d>0){const ang=Math.atan2(dy,dx);
              if(Math.abs(angleDiff(ang,aim))<halfAngle){
                e.takeDamage(p.getDamage()*baseDmgMult,p.x,p.y,false,p);
                if(!e.removed&&!e.isBoss){const dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*(32+charges*4);e.ky+=dy/dd*(32+charges*4);e.stunTimer=Math.max(e.stunTimer,40+charges*5);}
              }
            }
          });
          if(charges>0){
            spawnDamageNumber(p.x,p.y-55,`ПЕЧАТЬ ×${chargeMult.toFixed(1)}`,'#f472b6',true);
            spawnShockwave(p.x,p.y,150+charges*15,'#f472b6');
            spawnParticles(p.x,p.y,'#f472b6',40+Math.floor(charges*5));
            screenFlash=Math.max(screenFlash,15);
            p.hookValue=0;
          }
          const cx=p.x+Math.cos(aim)*120,cy=p.y+Math.sin(aim)*120;
          addZone(new Zone(clamp(cx,ARENA.x+50,ARENA.x+ARENA.w-50),clamp(cy,ARENA.y+50,ARENA.y+ARENA.h-50),100,180,0,'#f472b6',p,'crater'));
          spawnShockwave(cx,cy,150,'#f9a8d4');screenShake=15;hitStop=6;sfxCast();
        }
      },
      // ═══ E: Ирьё Ниндзюцу (канал) ═══
      {name:'Ирьё Ниндзюцу',keyLabel:'E',cd:350,desc:'Канал: лечит союзника 10/сек (улучшается). Повторное нажатие — стоп + КД. Не может двигаться/стрелять.',ult:false,
        cast(p,aim){
          if(p.sakuraHealingActive||p.sakuraJumpActive)return;
          // Ищем раненого союзника рядом
          let target=null,bestRatio=1.01;
          for(const ally of players){
            if(ally===p||!ally.alive)continue;
            if(ally.hp>=ally.maxHp)continue;
            if(Math.hypot(ally.x-p.x,ally.y-p.y)>450)continue;
            const ratio=ally.hp/ally.maxHp;
            if(ratio<bestRatio){bestRatio=ratio;target=ally;}
          }
          if(!target&&p.hp<p.maxHp)target=p; // соло — лечим себя
          if(!target){spawnDamageNumber(p.x,p.y-40,'НЕКОГО ЛЕЧИТЬ','#f55',false);return false;}
          p.sakuraHealingActive=true;
          p.sakuraHealingTarget=target;
          spawnShockwave(p.x,p.y,80,'#4ade80');
          spawnParticles(p.x,p.y,'#4ade80',20);
          sfxCast();
        }
      },
      // ═══ R: Сокрушающий Удар (замах → AoE + кратер) ═══
      {name:'Сокрушающий Удар',keyLabel:'R',cd:500,desc:'Подготовка → удар по земле. AoE урон + кратер с замедлением.',ult:false,
        cast(p,aim){
          if(p.shootBlockedTimer>0||p.sakuraJumpActive)return false;	
          p.shootBlockedTimer=45; // ~0.75с замах, не стреляет
          spawnDamageNumber(p.x,p.y-50,'ПОДГОТОВКА...','#f472b6',false);
          spawnShockwave(p.x,p.y,50,'#f472b6');
          scheduleAction(p,45,()=>{
            if(!p.alive)return;
            const tx=clamp(p.x,ARENA.x+50,ARENA.x+ARENA.w-50);
            const ty=clamp(p.y,ARENA.y+50,ARENA.y+ARENA.h-50);
const isBoosted=p.byakugoNoInTimer>0;
const dmg=p.getDamage()*(isBoosted?9:6);
const radius=isBoosted?260:180;
            forEachEnemySnapshot(e=>{
              if(Math.hypot(e.x-tx,e.y-ty)<radius+e.r){
                e.takeDamage(dmg,tx,ty,false,p);
                if(!e.removed&&!e.isBoss){
                  const dx=e.x-tx,dy=e.y-ty,dd=Math.hypot(dx,dy)||1;
                  e.kx+=dx/dd*40;e.ky+=dy/dd*40;
                  e.stunTimer=Math.max(e.stunTimer,60);
                }
              }
            });
            addZone(new Zone(tx,ty,140,240,0,'#f472b6',p,'crater'));
            spawnShockwave(tx,ty,radius,'#f472b6');
            spawnShockwave(tx,ty,radius*0.6,'#fbcfe8');
            spawnParticles(tx,ty,'#f472b6',60);
            spawnParticles(tx,ty,'#fbcfe8',30);
            screenShake=25;screenFlash=25;hitStop=8;sfxBoom();
          });
        }
      },
      // ═══ SP: Небесный Прыжок (неуязвимость + приземление) ═══
      {name:'Небесный Прыжок',keyLabel:'␣',cd:900,desc:'Прыжок в небо 3с. Неуязвима, враги игнорируют. WASD — выбор места. Приземление: AoE + кратер.',ult:true,
        cast(p,aim){
          if(p.sakuraJumpActive)return false;
          p.sakuraJumpActive=true;
          p.sakuraJumpTimer=180; // 3 секунды
          p.invuln=Math.max(p.invuln,180);
          spawnShockwave(p.x,p.y,140,'#f472b6');
          spawnParticles(p.x,p.y,'#f472b6',40);
          spawnDamageNumber(p.x,p.y-60,'ПРЫЖОК В НЕБО!','#f472b6',true);
          screenFlash=25;screenShake=15;sfxUlt();
        }
      }
    ]},

  kiba:{id:'kiba',name:'КИБА',color:'#8b6f47',
    base:{hp:125,speed:4.1,damage:8,atkSpeed:18,defense:1},
    hook:{type:'wolfMark',name:'ВОЛЧЬЯ МЕТКА',color:'#d4b483'},
    comboUlt:{name:'Двуглавая Волчица',cast(p){
      let akamaru=null;
      for(const pet of pets)if(pet.type==='akamaru'&&pet.owner===p&&pet.hp>0)akamaru=pet;
      if(!akamaru)return;
      p.twoHeadedTimer=150;akamaru.rageMode=true;akamaru.rageTimer=150;akamaru.r=25;
      akamaru.jumpTarget=null;akamaru.hp=akamaru.maxHp;
      spawnShockwave(p.x,p.y,220,'#dc2626');spawnParticles(p.x,p.y,'#dc2626',70);screenFlash=30;
      spawnDamageNumber(p.x,p.y-60,'ЯРОСТЬ ВОЛКА!','#dc2626',true);sfxUlt();
    }},
    abilities:[
      {name:'Гацуга',keyLabel:'Q',cd:180,desc:'Рывок + кровотечение',ult:false,
        cast(p,aim){
          const d=280;const nx=clamp(p.x+Math.cos(aim)*d,ARENA.x+p.r,ARENA.x+ARENA.w-p.r);const ny=clamp(p.y+Math.sin(aim)*d,ARENA.y+p.r,ARENA.y+ARENA.h-p.r);
          forEachEnemySnapshot(e=>{if(pointSegmentDist(e.x,e.y,p.x,p.y,nx,ny)<e.r+35){e.takeDamage(p.getDamage()*3.5,p.x,p.y,false,p);if(!e.removed){e.bleedTimer=300;e.bleedDamage=p.getDamage()*1.5;}}});
          for(let i=0;i<=18;i++){const t=i/18;spawnParticles(p.x+(nx-p.x)*t,p.y+(ny-p.y)*t,'#8b6f47',4);}
          p.x=nx;p.y=ny;p.invuln=Math.max(p.invuln,25);screenShake=Math.max(screenShake,8);sfxCast();
        }
      },
      {name:'Человек-зверь: Клон',keyLabel:'E',cd:400,desc:'2 копии Акамару 8с',ult:false,
cast(p){
  if(p.akamaruDeadCd>0){spawnDamageNumber(p.x,p.y-40,'АКАМАРУ ПОГИБ!','#f55',false);return false;}
  for(let i=0;i<2;i++){
            const a=p.facing+(i-0.5)*1.2;
            const cx=clamp(p.x+Math.cos(a)*50,ARENA.x+20,ARENA.x+ARENA.w-20);
            const cy=clamp(p.y+Math.sin(a)*50,ARENA.y+20,ARENA.y+ARENA.h-20);
            const c=new Clone(cx,cy,p,'akamaru_clone',a);c.life=480;c.maxLife=480;c.melee=true;c.color='#d4b483';clones.push(c);
          }
          sfxCast();
        }
      },
{name:'Метка Мочой',keyLabel:'R',cd:450,desc:'Круговая метка 300px: замедление 5с + повышенный крит урон по помеченным',ult:false,
  cast(p){
    forEachEnemySnapshot(e=>{
      if(Math.hypot(e.x-p.x,e.y-p.y)<300){
        e.slowTimer=Math.max(e.slowTimer,300);
        e.wolfMarkTimer=Math.max(e.wolfMarkTimer||0,300);
      }
    });
    spawnShockwave(p.x,p.y,300,'#d4b483');
    spawnParticles(p.x,p.y,'#d4b483',40);
    screenShake=15;
    sfxCast();
  }
},
{name:'Пронзительный Клык',keyLabel:'␣',cd:1200,desc:'Вращение-сверло 1.5с: ×2.8 скорость, урон + отброс, куда смотришь',ult:true,noDamage:true,
  cast(p){
    p.piercingFangTimer=90;
    p.piercingFangAim=p.facing;
    p.piercingFangHitSet=new Set();
    p.invuln=Math.max(p.invuln,90);
    spawnShockwave(p.x,p.y,200,'#d4b483');
    spawnParticles(p.x,p.y,'#d4b483',50);
    screenFlash=30;screenShake=15;sfxUlt();
  }
}
    ]},

  hinata:{id:'hinata',name:'ХИНАТА',color:'#b8a0d4',
    base:{hp:105,speed:3.7,damage:5,atkSpeed:18,defense:2},
    hook:{type:'dashCdReduce',name:'ВОСЕМЬ ТРИГРАММ',color:'#ff1744'},
comboUlt:{name:'128 Ладоней',cast(p){
  forEachEnemySnapshot(e=>{
    if(Math.hypot(e.x-p.x,e.y-p.y)<320){
      if(e.isBoss)e.takeDamage(e.maxHp*0.08,p.x,p.y,false,p,true);
      else e.takeDamage(e.maxHp*0.3,p.x,p.y,false,p,true);
      if(e.removed)return;
      e.silenceTimer=300;e.stunTimer=Math.max(e.stunTimer,120);e.chakraBlockStacks=Math.min(10,(e.chakraBlockStacks||0)+3);
    }
  });
  spawnShockwave(p.x,p.y,320,'#ff1744');spawnShockwave(p.x,p.y,240,'#a78bfa');
  screenFlash=40;screenShake=25;hitStop=10;sfxUlt();
}},
abilities:[
      {name:'Сюго Хакке Рокуджуйон',keyLabel:'Q',cd:280,desc:'360° барьер: режет снаряды + урон',ult:false,
        cast(p){
          let reflected=0;
          for(const ep of enemyProjectiles){
            if(Math.hypot(ep.x-p.x,ep.y-p.y)<160){ep.dead=true;reflected++;}
          }
          forEachEnemySnapshot(e=>{
            const d=Math.hypot(e.x-p.x,e.y-p.y);
            if(d<180){
              e.takeDamage(p.getDamage()*3.5,p.x,p.y,false,p);
              if(!e.removed&&!e.isBoss){const dx=e.x-p.x,dy=e.y-p.y,dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*30;e.ky+=dy/dd*30;}
            }
          });
          spawnShockwave(p.x,p.y,180,'#c084fc');
          p.kaitenTimer=30;
          spawnParticles(p.x,p.y,'#c084fc',50);
          screenShake=15;hitStop=5;sfxCast();
          if(reflected>0)spawnDamageNumber(p.x,p.y-40,`×${reflected} СНАРЯДОВ`,'#c084fc',true);
        }
      },
      {name:'Бьякуган',keyLabel:'E',cd:400,desc:'8с: автоатака бьёт 3 цели',ult:false,
        cast(p){p.byakuganTimer=480;p.byakuganExtraTargets=2;spawnShockwave(p.x,p.y,100,'#c084fc');sfxCast();}
      },
      {name:'Кулак Двойного Льва',keyLabel:'R',cd:450,desc:'Рывок + AoE + стан',ult:false,
        cast(p,aim){
const target=findTargetInCone(p,aim,300,Math.PI/3);
if(!target){spawnParticles(p.x+Math.cos(aim)*60,p.y+Math.sin(aim)*60,'#c084fc',15);return false;}
          const ang=Math.atan2(target.y-p.y,target.x-p.x);
          const d=Math.hypot(target.x-p.x,target.y-p.y);
          const nx=clamp(p.x+Math.cos(ang)*Math.min(220,d-p.r-target.r+20),ARENA.x+p.r,ARENA.x+ARENA.w-p.r);
          const ny=clamp(p.y+Math.sin(ang)*Math.min(220,d-p.r-target.r+20),ARENA.y+p.r,ARENA.y+ARENA.h-p.r);
          p.x=nx;p.y=ny;p.invuln=Math.max(p.invuln,25);
          forEachEnemySnapshot(e=>{
            if(Math.hypot(e.x-nx,e.y-ny)<200){
              e.takeDamage(p.getDamage()*5,p.x,p.y,false,p);
              if(!e.removed&&!e.isBoss)e.stunTimer=Math.max(e.stunTimer,90);
            }
          });
          spawnShockwave(nx,ny,200,'#ff1744');spawnParticles(nx,ny,'#ff1744',30);
          screenShake=15;hitStop=6;sfxCast();
        }
      },
      {name:'Хакке Санджуни Шо',keyLabel:'␣',cd:1200,desc:'5с: автоатаки + волны 32 ладоней',ult:true,
        cast(p){
          p.gentleFistTimer=300;
          p.gentleFistWaveTimer=0;
          spawnShockwave(p.x,p.y,250,'#c084fc');screenFlash=35;screenShake=20;
          spawnDamageNumber(p.x,p.y-50,'МЯГКИЙ КУЛАК!','#c084fc',true);sfxUlt();
        }
      }
    ]},

  shino:{id:'shino',name:'ШИНО',color:'#4a5a3a',
    base:{hp:105,speed:3.5,damage:6,atkSpeed:18,defense:1},
    hook:{type:'bugAura',name:'ЖУКИ АБУРАМЭ',color:'#84cc16'},
    comboUlt:{name:'Жуки-Клоны',cast(p){
      for(let i=0;i<2;i++){
        const a=p.facing+(i-0.5)*0.8;
        const cx=clamp(p.x+Math.cos(a)*60,ARENA.x+20,ARENA.x+ARENA.w-20);
        const cy=clamp(p.y+Math.sin(a)*60,ARENA.y+20,ARENA.y+ARENA.h-20);
        const c=new Clone(cx,cy,p,'bug_clone',a);
        c.life=600;c.maxLife=600;c.hp=120;c.maxHp=120;
        clones.push(c);
      }
      spawnShockwave(p.x,p.y,200,'#84cc16');
      spawnParticles(p.x,p.y,'#84cc16',70);
      screenFlash=30;screenShake=15;sfxUlt();
    }},
    abilities:[
      // ═══ Q: 4 самонаводящихся жука + метка ═══
      {name:'Запустить Жуков',keyLabel:'Q',cd:220,desc:'4 самонаводящихся жука. При попадании — метка.',ult:false,
        cast(p,aim){
          const targets=getTargetsInRadius(p,600);
          for(let i=0;i<4;i++){
            let ang;
            if(targets.length>0){const tgt=targets[i%targets.length];ang=Math.atan2(tgt.y-p.y,tgt.x-p.x)+(Math.random()-0.5)*0.2;}
            else ang=aim+(i-1.5)*0.2;
            const proj=new Projectile(p.x,p.y,ang,p.getDamage()*1.8,'#84cc16',7,11);
            proj.attacker=p;
            proj.homing=true;proj.homingRange=420;
            proj.appliesShinoMark=true;
            projectiles.push(proj);
          }
          sfxCast();
        }
      },
      // ═══ E: урон по всем помеченным + кокон при смерти ═══
      {name:'Кормление Жуков',keyLabel:'E',cd:450,desc:'Все враги с меткой получают урон. Смерть = кокон.',ult:false,
        cast(p){
          const dmg=p.getDamage()*3.2;
          let count=0;
          forEachEnemySnapshot(e=>{
            if(e.removed)return;
            if(!(e.bugMarkTimer>0))return;
            const cx=e.x,cy=e.y;
            const wasAlive=e.hp>0;
            e.takeDamage(dmg,p.x,p.y,false,p);
            count++;
            if(e.removed&&wasAlive&&!e.isBoss){
              const cocoon=new Cocoon(cx,cy,p);
              cocoon.hp=80;cocoon.maxHp=80;cocoon.r=16;
              cocoons.push(cocoon);
              spawnShockwave(cx,cy,80,'#84cc16');
              spawnParticles(cx,cy,'#84cc16',20);
            }
          });
          if(count===0){spawnDamageNumber(p.x,p.y-40,'НЕТ МЕТОК','#f55',false);return false;}
          spawnShockwave(p.x,p.y,250,'#84cc16');
          screenShake=10;sfxCast();
        }
      },
      // ═══ R: Кокон (не привлекает врагов) ═══
      // ═══ R: Кокон (не привлекает врагов, можно ставить несколько) ═══
      {name:'Кокон',keyLabel:'R',cd:900,desc:'Кокон 180HP. Спавнит рой. НЕ привлекает врагов. Можно ставить несколько.',ult:false,noDamage:true,
        cast(p){
          const c=new Cocoon(p.x,p.y,p);
          cocoons.push(c);
          spawnShockwave(p.x,p.y,120,'#84cc16');
          spawnParticles(p.x,p.y,'#84cc16',40);
          spawnDamageNumber(p.x,p.y-40,'КОКОН!','#84cc16',true);
          screenFlash=25;sfxCast();
        }
      },
      // ═══ SP: Жук-скакун ═══
      {name:'Жук-Скакун',keyLabel:'␣',cd:1200,desc:'6с на гигантском жуке. Неуязвим для обычных врагов (босс достаёт). Союзник тоже садится.',ult:true,noDamage:true,
        cast(p){
          if(p.flyingBugActive)return false;
          p.flyingBugActive=true;
          p.flyingBugTimer=360;
          for(const ally of players){
            if(ally===p||!ally.alive)continue;
            ally.flyingBugActive=true;
            ally.flyingBugRiding=true;
            ally.flyingBugOwner=p;
            ally.x=p.x-25;ally.y=p.y-15;
          }
          spawnShockwave(p.x,p.y,220,'#84cc16');
          spawnShockwave(p.x,p.y,160,'#a3e635');
          spawnParticles(p.x,p.y,'#84cc16',100);
          spawnDamageNumber(p.x,p.y-70,'ЖУК-СКАКУН!','#84cc16',true);
          screenFlash=40;screenShake=20;sfxUlt();
        }
      }
    ]},

  neji:{id:'neji',name:'НЭДЗИ',color:'#a78bfa',
    base:{hp:105,speed:3.7,damage:7,atkSpeed:18,defense:2},
    hook:{type:'dashBurst',name:'ИМПУЛЬС ХАККЕ',color:'#a78bfa'},
    comboUlt:{name:'128 Ладоней',cast(p){
      forEachEnemySnapshot(e=>{
        if(Math.hypot(e.x-p.x,e.y-p.y)<320){
          if(e.isBoss)e.takeDamage(e.maxHp*0.08,p.x,p.y,false,p,true);
          else e.takeDamage(e.maxHp*0.3,p.x,p.y,false,p,true);
          if(e.removed)return;
          e.silenceTimer=300;e.sealStacks=8;p.triggerSeal(e);
        }
      });
      spawnShockwave(p.x,p.y,320,'#a78bfa');screenFlash=30;screenShake=25;sfxUlt();
    }},
    abilities:[
      {name:'Бьякуган',keyLabel:'Q',cd:400,desc:'8с: автоатака бьёт 3 цели',ult:false,
        cast(p){p.byakuganTimer=480;p.byakuganExtraTargets=2;spawnShockwave(p.x,p.y,100,'#c084fc');sfxCast();}
      },
      {name:'64 Ладони',keyLabel:'E',cd:400,desc:'Круговая атака 200px, отталкивает и блокирует чакру',ult:false,
        cast(p){
          forEachEnemySnapshot(e=>{
            const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;
            if(d<200){
              e.takeDamage(p.getDamage()*4,p.x,p.y,false,p);
              if(!e.removed){
                if(!e.isBoss){e.kx+=dx/d*40;e.ky+=dy/d*40;e.stunTimer=Math.max(e.stunTimer,60);}
                e.chakraBlockStacks=Math.min(10,(e.chakraBlockStacks||0)+2);
                e.silenceTimer=Math.max(e.silenceTimer,60);
              }
            }
          });
          spawnShockwave(p.x,p.y,200,'#a78bfa');screenShake=12;hitStop=5;sfxCast();
        }
      },
      {name:'Небесное Вращение',keyLabel:'R',cd:450,desc:'3с: обездвижен, отражает снаряды, бьёт',ult:false,
        cast(p){p.heavenlyTimer=180;p.invuln=Math.max(p.invuln,180);spawnShockwave(p.x,p.y,200,'#a78bfa');screenShake=15;sfxCast();}
      },
      {name:'Кайтен-Взрыв',keyLabel:'␣',cd:1200,desc:'Мгновенный AoE 250px + щит 50',ult:true,
        cast(p){
          forEachEnemySnapshot(e=>{
            const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;
            if(d<250){
              e.takeDamage(p.getDamage()*4,p.x,p.y,false,p);
              if(!e.removed&&!e.isBoss){e.kx+=dx/d*35;e.ky+=dy/d*35;}
            }
          });
          p.shield=Math.max(p.shield,50);p.shieldTimer=Math.max(p.shieldTimer,180);
          p.kaitenTimer=60;
          spawnShockwave(p.x,p.y,250,'#ddd6fe');screenFlash=25;screenShake=18;sfxUlt();
        }
      }
    ]},

  tenten:{id:'tenten',name:'ТЭН-ТЭН',color:'#f87171',
    base:{hp:100,speed:3.7,damage:7,atkSpeed:18,defense:1},
    hook:{type:'stances',name:'ОРУЖЕЙНЫЕ СВИТКИ',color:'#f87171',stances:['КУНАИ','ВЗРЫВ','СЮРИКЕНЫ','МЕЧИ']},
    comboUlt:{name:'Смена Стойки',cast(p){
      p.tentenStanceIndex=(p.tentenStanceIndex+1)%4;
      const names=['КУНАИ','ВЗРЫВ','СЮРИКЕНЫ','МЕЧИ'];
      const cols=['#cbd5e1','#f97316','#a5f3fc','#e2e8f0'];
      const idx=p.tentenStanceIndex;
      spawnDamageNumber(p.x,p.y-50,`СТОЙКА: ${names[idx]}`,cols[idx],true);
      spawnShockwave(p.x,p.y,120,cols[idx]);
      spawnParticles(p.x,p.y,cols[idx],30);sfxCoin();
    }},
    abilities:[
      {name:'Кунай Ранбу',keyLabel:'Q',cd:220,desc:'9 кунаев веером',ult:false,
        cast(p,aim){
          for(let i=-4;i<=4;i++){
            const proj=new Projectile(p.x,p.y,aim+i*0.12,p.getDamage()*1.8,'#cbd5e1',4,14);
            proj.attacker=p;projectiles.push(proj);
          }
          sfxCast();
        }
      },
      {name:'Печать-Ловушка',keyLabel:'E',cd:280,desc:'6 печатей вокруг. Живут до конца волны',ult:false,
        cast(p,aim){
          for(let i=0;i<6;i++){
            const a=i*Math.PI*2/6;
            const x=clamp(p.x+Math.cos(a)*90,ARENA.x+40,ARENA.x+ARENA.w-40);
            const y=clamp(p.y+Math.sin(a)*90,ARENA.y+40,ARENA.y+ARENA.h-40);
            tentenSeals.push(new TentenSeal(x,y,p.getDamage()*3,p));
          }
          spawnShockwave(p.x,p.y,110,'#f87171');
          spawnParticles(p.x,p.y,'#f87171',20);sfxCast();
        }
      },
      {name:'Стойка-Техника',keyLabel:'R',cd:450,desc:'Зависит от стойки (F — сменить)',ult:false,
        cast(p,aim){
          const stance=p.tentenStanceIndex||0;
          const dmg=p.getDamage();
          if(stance===1){
            const seals=tentenSeals.filter(s=>s.owner===p&&!s.dead);
            if(seals.length===0){spawnDamageNumber(p.x,p.y-40,'НЕТ ПЕЧАТЕЙ','#f55',false);return false;}
            let count=0;
            for(const s of seals){s.detonate(4);count++;}
            spawnDamageNumber(p.x,p.y-60,`ДЕТОНАЦИЯ ×${count}!`,'#f97316',true);
            screenFlash=Math.max(screenFlash,25);screenShake=Math.max(screenShake,20);hitStop=Math.max(hitStop,8);sfxBoom();
          } else if(stance===2){
            for(let i=-6;i<=6;i++){
              if(i===0)continue;
              const proj=new Projectile(p.x,p.y,aim+i*0.07,dmg*2.5,'#a5f3fc',6,14);
              proj.attacker=p;proj.isTentenBoomerang=true;proj.boomerang=60;
              projectiles.push(proj);
            }
            spawnDamageNumber(p.x,p.y-50,'БУМЕРАНГИ!','#a5f3fc',true);
            screenShake=Math.max(screenShake,10);sfxCast();
          } else if(stance===3){
            tentenSwords.push(new TentenOrbitingSword(p,0));
            tentenSwords.push(new TentenOrbitingSword(p,Math.PI));
            spawnShockwave(p.x,p.y,120,'#e2e8f0');
            spawnDamageNumber(p.x,p.y-50,'МЕЧИ!','#e2e8f0',true);sfxCast();
          } else {
            for(let i=-5;i<=5;i++){
              const proj=new Projectile(p.x,p.y,aim+i*0.1,dmg*1.8,'#cbd5e1',4,14);
              proj.attacker=p;projectiles.push(proj);
            }
            sfxCast();
          }
        }
      },
      {name:'Сумеречный Свиток',keyLabel:'␣',cd:1200,desc:'Исчезаешь + стойка-техника. +2с после — возврат',ult:true,
        cast(p){
          const stance=p.tentenStanceIndex||0;
          const dmg=p.getDamage();
          let vanishFrames=180;
          if(stance===2)vanishFrames=200;
          p.vanishedTimer=vanishFrames;
          p.invuln=Math.max(p.invuln,vanishFrames+30);
          spawnShockwave(p.x,p.y,150,'#cbd5e1');
          spawnParticles(p.x,p.y,'#cbd5e1',60);
          screenFlash=30;screenShake=15;
          spawnDamageNumber(p.x,p.y-60,'ИСЧЕЗНОВЕНИЕ!','#cbd5e1',true);sfxUlt();
          if(stance===1){
            for(let i=0;i<12;i++){
              const a=i*Math.PI*2/8;
              const x=clamp(p.x+Math.cos(a)*140,ARENA.x+40,ARENA.x+ARENA.w-40);
              const y=clamp(p.y+Math.sin(a)*140,ARENA.y+40,ARENA.y+ARENA.h-40);
              tentenSeals.push(new TentenSeal(x,y,dmg*2.5,p));
            }
            for(let wave=0; wave<4; wave++){
              scheduleAction(p, wave*12, ()=>{
                if(!p.alive)return;
                for(let i=0;i<12;i++){
                  const x=ARENA.x+80+Math.random()*(ARENA.w-160);
                  const y=ARENA.y+80+Math.random()*(ARENA.h-160);
                  tentenSeals.push(new TentenSeal(x,y,dmg*2.5,p));
                }
                spawnShockwave(p.x,p.y,180,'#f97316');
                screenShake=Math.max(screenShake,6);
              });
            }
            spawnDamageNumber(p.x,p.y-85,'💣 ×60','#f97316',true);
          } else if(stance===2){
            for(let wave=0; wave<5; wave++){
              scheduleAction(p, wave*15, ()=>{
                if(!p.alive)return;
                for(let i=0;i<18;i++){
                  const edge=Math.floor(Math.random()*4);let sx,sy;
                  if(edge===0){sx=ARENA.x+rand(30,ARENA.w-30);sy=ARENA.y+10;}
                  else if(edge===1){sx=ARENA.x+rand(30,ARENA.w-30);sy=ARENA.y+ARENA.h-10;}
                  else if(edge===2){sx=ARENA.x+10;sy=ARENA.y+rand(30,ARENA.h-30);}
                  else{sx=ARENA.x+ARENA.w-10;sy=ARENA.y+rand(30,ARENA.h-30);}
                  const tgt=findNearestTarget(p,1500);
                  const ang=tgt?Math.atan2(tgt.y-sy,tgt.x-sx):rand(0,Math.PI*2);
                  const proj=new Projectile(sx,sy,ang,dmg*2.5,'#cbd5e1',5,11);
                  proj.attacker=p;projectiles.push(proj);
                }
                screenShake=Math.max(screenShake,8);
              });
            }
            spawnDamageNumber(p.x,p.y-85,'✧ ×90','#a5f3fc',true);
          } else if(stance===3){
            for(let wave=0; wave<5; wave++){
              scheduleAction(p, wave*8, ()=>{
                if(!p.alive)return;
                for(let i=0;i<8;i++){
                  const tgt=findNearestTarget(p,1500);
                  if(!tgt)return;
                  const tx=tgt.x+rand(-40,40),ty=tgt.y+rand(-40,40);
                  const proj=new Projectile(tx,ARENA.y-20,Math.PI/2,dmg*3,'#e2e8f0',10,12);
                  proj.attacker=p;proj.isTentenSword=true;proj.mindControlOnHit=true;
                  projectiles.push(proj);
                }
                screenShake=Math.max(screenShake,6);
              });
            }
            spawnDamageNumber(p.x,p.y-85,'⚔ ×40','#e2e8f0',true);
          } else {
            for(let wave=0; wave<4; wave++){
              scheduleAction(p, wave*8, ()=>{
                if(!p.alive)return;
                for(let i=0;i<14;i++){
                  const x=ARENA.x+rand(40,ARENA.w-40);
                  const y=ARENA.y+rand(40,ARENA.h-40);
                  const proj=new Projectile(x,y,rand(0,Math.PI*2),dmg*2,'#cbd5e1',4,12);
                  proj.attacker=p;projectiles.push(proj);
                }
              });
            }
            spawnDamageNumber(p.x,p.y-85,'🗡 ×70','#cbd5e1',true);
          }
        }
      }
    ]},

  ino:{id:'ino',name:'ИНО',color:'#fbbf24',
    base:{hp:100,speed:3.6,damage:7,atkSpeed:18,defense:1},
    hook:{type:'puppets',name:'КУКЛОВОД',color:'#fbbf24',max:3},
    comboUlt:{name:'Масс-Контроль',cast(p){
      const targets=getAllTargetsInCone(p,p.facing,600,Math.PI/2).slice(0,5);
      for(const e of targets){
        if(e.isBoss||e.specialType){e.slowTimer=Math.max(e.slowTimer,300);continue;}
        e.mindControlTimer=500;e.mindControlOwner=p;e.mcDamageMult=2.5;
      }
      for(const b of bosses){if(b.removed)continue;b.takeDamage(b.maxHp*0.08,p.x,p.y,false,p,true);}
      screenFlash=30;screenShake=20;sfxUlt();
    }},
    abilities:[
      {name:'Миндо Бунсеки',keyLabel:'Q',cd:200,desc:'Стан 1.5с + урон + лепестки',ult:false,
        cast(p,aim){
          const target=findTargetInCone(p,aim,400,Math.PI/4);
          if(target){
            target.takeDamage(p.getDamage()*4,p.x,p.y,false,p);
            if(!target.removed&&!target.isBoss)target.stunTimer=Math.max(target.stunTimer,90);
            spawnPetalZone(target.x,target.y,90,120,p.getDamage()*1.5,p);
            spawnShockwave(target.x,target.y,80,'#fbbf24');
          }
          sfxCast();
        }
      },
      {name:'Синтэнсин',keyLabel:'E',cd:500,desc:'Подчинить врага ×3 урона',ult:false,
cast(p,aim){
  const target=findTargetInCone(p,aim,600,Math.PI/4);
  if(!target)return false;
          if(target.isBoss||target.specialType){
            target.takeDamage(p.getDamage()*6,p.x,p.y,false,p);
            target.stunTimer=Math.max(target.stunTimer,90);
            spawnDamageNumber(target.x,target.y-40,'НЕЛЬЗЯ','#f55',true);
            return;
          }
          if(target.mindControlTimer<=0){target.mindControlTimer=360;target.mindControlOwner=p;target.mcDamageMult=3;}
          sfxCast();
        }
      },
      {name:'Синринсин',keyLabel:'R',cd:450,desc:'AoE-стан + хил + лепестки',ult:false,
        cast(p){
          let hit=0;
          forEachEnemySnapshot(e=>{if(Math.hypot(e.x-p.x,e.y-p.y)<300){if(!e.isBoss)e.stunTimer=Math.max(e.stunTimer,120);e.takeDamage(p.getDamage()*2.3,p.x,p.y,false,p);hit++;}});
          if(hit>0)p.hp=Math.min(p.maxHp,p.hp+hit*12);
          for(const ally of players)if(ally.alive)ally.hp=Math.min(ally.maxHp,ally.hp+15);
          spawnPetalZone(p.x,p.y,300,180,p.getDamage()*2,p);
          spawnShockwave(p.x,p.y,300,'#fbbf24');sfxCast();
        }
      },
      {name:'Хана но Аращи',keyLabel:'␣',cd:1200,desc:'Буря лепестков 5с',ult:true,
        cast(p){
          for(let i=0;i<8;i++){
            const a=i*Math.PI*2/8;
            spawnPetalZone(clamp(p.x+Math.cos(a)*180,ARENA.x+40,ARENA.x+ARENA.w-40),
                           clamp(p.y+Math.sin(a)*180,ARENA.y+40,ARENA.y+ARENA.h-40),
                           120,300,p.getDamage()*2.5,p);
          }
          spawnShockwave(p.x,p.y,300,'#ec4899');screenFlash=30;screenShake=20;sfxUlt();
        }
      }
    ]},

shikamaru:{id:'shikamaru',name:'ШИКАМАРУ',color:'#8b5cf6',
    base:{hp:105,speed:3.6,damage:6,atkSpeed:18,defense:2},
    hook:{type:'shadowWeb',name:'ТЕНЕВАЯ СВЯЗЬ',color:'#a5b4fc'},
comboUlt:{name:'Теневые Иглы',cast(p){
      const unlinked=[];
      for(const e of enemies){if(!e.removed&&!(e.shadowWebTimer>0&&e.shadowWebOwner===p))unlinked.push(e);}
      for(const b of bosses){if(!b.removed&&!(b.shadowWebTimer>0&&b.shadowWebOwner===p))unlinked.push(b);}
      fisherYates(unlinked);
      const count=Math.min(4,unlinked.length);
for(let i=0;i<count;i++){
  const target=unlinked[i];
  const ang=Math.atan2(target.y-p.y,target.x-p.x);   // ← добавили
  const needle=new Projectile(p.x,p.y,ang,p.getDamage()*2.5,'#a5b4fc',7,10);
  needle.attacker=p;
  needle.homing=true;needle.homingRange=900;
  needle.isShikamaruNeedle=true;
  needle.homingTarget=target;
  projectiles.push(needle);
}
      spawnShockwave(p.x,p.y,220,'#8b5cf6');
      spawnParticles(p.x,p.y,'#8b5cf6',40);
      screenFlash=30;screenShake=18;hitStop=6;sfxUlt();
    }},
    abilities:[
{name:'Кагеманэ',keyLabel:'Q',cd:180,desc:'Линия тени: урон + Связь',ult:false,
        cast(p,aim){
          const range=350;const ex=p.x+Math.cos(aim)*range,ey=p.y+Math.sin(aim)*range;
          forEachEnemySnapshot(e=>{
            if(pointSegmentDist(e.x,e.y,p.x,p.y,ex,ey)<e.r+25){
              e.takeDamage(p.getDamage()*2.5,p.x,p.y,false,p);
              if(!e.removed){e.slowTimer=Math.max(e.slowTimer,180);e.shadowWebTimer=300;e.shadowWebOwner=p;}
            }
          });
          for(let i=0;i<=20;i++){const t=i/20;emitParticle(p.x+(ex-p.x)*t,p.y+(ey-p.y)*t,0,0,25,'#8b5cf6',4);}
          spawnShockwave(ex,ey,60,'#8b5cf6');sfxCast();
        }
      },
{name:'Притяжение',keyLabel:'E',cd:300,desc:'Притягивает ВСЕХ связанных к себе',ult:false,
        cast(p,aim){
          let count=0;
          forEachEnemySnapshot(e=>{
            if(e.removed)return;
            if(e.isBoss||e.shadowWebOwner!==p||e.shadowWebTimer<=0)return;
            const dx=p.x-e.x,dy=p.y-e.y,l=Math.hypot(dx,dy)||1;
            const pullDist=Math.min(240,l-25);
            e.x+=dx/l*pullDist;
            e.y+=dy/l*pullDist;
            e.x=clamp(e.x,ARENA.x+e.r,ARENA.x+ARENA.w-e.r);
            e.y=clamp(e.y,ARENA.y+e.r,ARENA.y+ARENA.h-e.r);
            e.takeDamage(p.getDamage()*1.5,e.x,e.y,false,p);
            if(!e.removed){e.stunTimer=Math.max(e.stunTimer,40);e.shadowWebTimer=Math.max(e.shadowWebTimer,300);}
            count++;
          });
          if(count===0){spawnDamageNumber(p.x,p.y-40,'НЕТ СВЯЗИ','#f55',false);return false;}
          spawnShockwave(p.x,p.y,180,'#8b5cf6');
          spawnDamageNumber(p.x,p.y-50,`×${count} СВЯЗЬ`,'#a5b4fc',true);
          sfxCast();
        }
      },
{name:'Удушение',keyLabel:'R',cd:450,desc:'Канал 2с. Обездвижен. DoT всем связанным (×1.5 каждый тик).',ult:false,noDamage:true,
        cast(p){
          let hasLink=false;
          forEachEnemySnapshot(e=>{if(!e.removed&&e.shadowWebOwner===p&&e.shadowWebTimer>0)hasLink=true;});
          if(!hasLink){spawnDamageNumber(p.x,p.y-40,'НЕТ СВЯЗИ','#f55',false);return false;}
          p.shadowChokeTimer=120;
          p.invuln=Math.max(p.invuln,120);
          spawnShockwave(p.x,p.y,180,'#8b5cf6');
          spawnDamageNumber(p.x,p.y-55,'УДУШЕНИЕ!','#a5b4fc',true);
          sfxCast();
        }
      },
{name:'Теневой Взрыв',keyLabel:'␣',cd:1200,desc:'AoE-взрыв 300px. Все задеты → Связь.',ult:true,
        cast(p){
          const radius=300;
          forEachEnemySnapshot(e=>{
            if(e.removed)return;
            if(Math.hypot(e.x-p.x,e.y-p.y)<radius+e.r){
              e.takeDamage(p.getDamage()*4,p.x,p.y,false,p);
              if(!e.removed){e.shadowWebTimer=500;e.shadowWebOwner=p;e.slowTimer=Math.max(e.slowTimer,180);}
            }
          });
          spawnShockwave(p.x,p.y,radius,'#8b5cf6');
          spawnShockwave(p.x,p.y,radius*0.6,'#a5b4fc');
          spawnParticles(p.x,p.y,'#8b5cf6',60);
          screenFlash=35;screenShake=22;hitStop=8;sfxUlt();
        }
      }
    ]},

  choji:{id:'choji',name:'ЧЁДЖИ',color:'#dc2626',
    base:{hp:160,speed:3.3,damage:8,atkSpeed:18,defense:4},
    hook:{type:'calories',name:'КАЛОРИИ',color:'#fbbf24',max:100},
    comboUlt:{name:'Бабочка Чёджи',cast(p){
      p.butterflyTimer=600;
      spawnShockwave(p.x,p.y,300,'#dc2626');screenFlash=30;screenShake=20;sfxUlt();
    }},
    abilities:[
{name:'Частичное Умножение',keyLabel:'Q',cd:0,noCd:true,desc:'Кулак-гигант 250px (20 кал)',ult:false,
        cast(p){
          if(p.calories<20){spawnDamageNumber(p.x,p.y-40,'НЕТ КАЛОРИЙ','#f55',false);return false;}
          p.calories-=20;
          forEachEnemySnapshot(e=>{
            const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;
            if(d<250){e.takeDamage(p.getDamage()*4,p.x,p.y,false,p);if(!e.removed&&!e.isBoss){e.kx+=dx/d*30;e.ky+=dy/d*30;e.stunTimer=Math.max(e.stunTimer,60);}}
          });
          spawnShockwave(p.x,p.y,250,'#dc2626');screenShake=15;hitStop=5;sfxCast();
        }
      },
      {name:'Байка',keyLabel:'E',cd:0,noCd:true,desc:'6с ×2 размер (35 кал)',ult:false,
        cast(p){
          if(p.calories<35){spawnDamageNumber(p.x,p.y-40,'НЕТ КАЛОРИЙ','#f55',false);return false;}
          p.calories-=35;
          p.giantTimer=360;
          spawnShockwave(p.x,p.y,150,'#dc2626');sfxCast();
        }
      },
      {name:'Человек-Ядро',keyLabel:'R',cd:0,noCd:true,desc:'2с катится (40 кал)',ult:false,
        cast(p,aim){
          if(p.calories<40){spawnDamageNumber(p.x,p.y-40,'НЕТ КАЛОРИЙ','#f55',false);return;}
          p.calories-=40;
          p.rollingTimer=120;p.rollingAim=aim;p.rollingHitSet=new Set();sfxCast();
        }
      },
      {name:'Обед',keyLabel:'␣',cd:1200,desc:'3с приём пищи: +100 калорий',ult:true,noDamage:true,
        cast(p){
          p.eatTimer=180;
          p.invuln=Math.max(p.invuln,180);
          spawnShockwave(p.x,p.y,100,'#fbbf24');
          spawnDamageNumber(p.x,p.y-50,'ОБЕД!','#fbbf24',true);sfxUlt();
        }
      }
    ]},

  gaara:{id:'gaara',name:'ГААРА',color:'#b45309',
    base:{hp:150,speed:3.3,damage:8,atkSpeed:18,defense:4},
    hook:{type:'sand',name:'СУНА',color:'#d97706',max:100},
    comboUlt:{name:'Шукаку',cast(p){
      p.shukakuTimer=600;
      p.shukakuTailAngle=0;
      p.invuln=Math.max(p.invuln,60);
      spawnShockwave(p.x,p.y,300,'#fbbf24');
      spawnShockwave(p.x,p.y,220,'#d97706');
      spawnParticles(p.x,p.y,'#b45309',100);
      spawnParticles(p.x,p.y,'#fbbf24',50);
      screenFlash=40;screenShake=25;hitStop=10;
      spawnDamageNumber(p.x,p.y-70,'ШУКАКУ!','#b45309',true);sfxUlt();
    }},
    abilities:[
      {name:'Песчаный Вихрь',keyLabel:'Q',cd:300,desc:'2 оборота песка вокруг, затем вперёд',ult:false,
        cast(p,aim){
          p.sandVortexTimer=180;
          p.sandVortexAim=aim;
          p.sandVortexTick=0;
          spawnShockwave(p.x,p.y,150,'#b45309');screenShake=12;
          spawnDamageNumber(p.x,p.y-40,'СУНА!','#b45309',true);sfxCast();
        }
      },
      {name:'Зыбучие Пески',keyLabel:'E',cd:500,desc:'6 зон песка по карте 4с. Враги почти стоят',ult:false,
        cast(p){
          for(let i=0;i<6;i++){
            let qx,qy,attempts=0;
            do{
              qx=ARENA.x+80+Math.random()*(ARENA.w-160);
              qy=ARENA.y+80+Math.random()*(ARENA.h-160);
              attempts++;
            } while(attempts<8&&Math.hypot(qx-p.x,qy-p.y)<180);
            addZone(new Zone(qx,qy,140,240,0,'#a16207',p,'quicksand'));
            spawnShockwave(qx,qy,140,'#a16207');
            spawnParticles(qx,qy,'#d97706',20);
          }
          spawnShockwave(p.x,p.y,300,'#b45309');
          screenFlash=25;screenShake=15;
          spawnDamageNumber(p.x,p.y-50,'ЗЫБУЧИЕ ПЕСКИ!','#b45309',true);sfxCast();
        }
      },
{name:'Песчаное Цунами',keyLabel:'R',cd:500,desc:'Конус-волна 340px + отброс',ult:false,
        cast(p,aim){
          const range=340,halfAngle=Math.PI/2.2;
          forEachEnemySnapshot(e=>{
            const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
            if(d<range&&d>0){
              const ang=Math.atan2(dy,dx);
              if(Math.abs(angleDiff(ang,aim))<halfAngle){
                e.takeDamage(p.getDamage()*4,p.x,p.y,false,p);
                if(!e.removed&&!e.isBoss){const dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*35;e.ky+=dy/dd*35;}
              }
            }
          });
          spawnShockwave(p.x,p.y,400,'#b45309');screenShake=18;hitStop=6;sfxCast();
        }
      },
      {name:'Песчаная Волна',keyLabel:'␣',cd:1200,desc:'4с управляешь волной песка. Гаара обездвижен и неуязвим',ult:true,
        cast(p){
          p.sandWaveTimer=240;
          p.sandWaveX=p.x;
          p.sandWaveY=p.y;
          p.sandWaveAim=p.facing;
          p.invuln=Math.max(p.invuln,240);
          spawnShockwave(p.x,p.y,220,'#b45309');
          spawnParticles(p.x,p.y,'#d97706',80);
          screenFlash=35;screenShake=20;
          spawnDamageNumber(p.x,p.y-60,'ПЕСЧАНАЯ ВОЛНА!','#b45309',true);sfxUlt();
        }
      }
    ]},

  kankuro:{id:'kankuro',name:'КАНКУРО',color:'#7c2d12',
    base:{hp:115,speed:3.6,damage:7,atkSpeed:18,defense:2},
    hook:{type:'livingPuppet',name:'КУГУЦУ',color:'#a16207',max:4},
    comboUlt:{name:'Саннин Тайдзи',cast(p){
      const cx=p.x,cy=p.y;
      for(let i=0;i<6;i++){
        const a=(Math.PI*2/6)*i;
        const c=new Clone(cx+Math.cos(a)*90,cy+Math.sin(a)*90,p,'turret',a);
        c.life=600;c.maxLife=600;c.hp=80;c.maxHp=80;c.isLivingPuppet=true;
        c.color=i%2===0?'#a16207':'#7c2d12';clones.push(c);
      }
      spawnShockwave(p.x,p.y,250,'#7c2d12');screenFlash=35;screenShake=18;sfxUlt();
    }},
    abilities:[
      {name:'Карасу',keyLabel:'Q',cd:280,desc:'Кукла-турель стреляет 5с',ult:false,
        cast(p,aim){
          const px=clamp(p.x+Math.cos(aim)*80,ARENA.x+20,ARENA.x+ARENA.w-20);
          const py=clamp(p.y+Math.sin(aim)*80,ARENA.y+20,ARENA.y+ARENA.h-20);
          const c=new Clone(px,py,p,'turret',aim);
          c.life=300;c.maxLife=300;c.hp=60;c.maxHp=60;c.isLivingPuppet=true;c.color='#a16207';clones.push(c);sfxCast();
        }
      },
      {name:'Отравленные Иглы',keyLabel:'E',cd:350,desc:'3 отравленные иглы',ult:false,
        cast(p,aim){
          for(let i=-1;i<=1;i++){
            const proj=new Projectile(p.x,p.y,aim+i*0.2,p.getDamage()*2,'#84cc16',5,14);
            proj.attacker=p;
            proj.appliesPoison=true;
            proj.poisonDmg=p.getDamage()*0.8;
            projectiles.push(proj);
          }
          sfxCast();
        }
      },
      {name:'Подмена Куклой',keyLabel:'R',cd:400,desc:'2с невидимости + кукла-ловушка',ult:false,
        cast(p,aim){
          const px=clamp(p.x+Math.cos(aim)*50,ARENA.x+20,ARENA.x+ARENA.w-20);
          const py=clamp(p.y+Math.sin(aim)*50,ARENA.y+20,ARENA.y+ARENA.h-20);
          const c=new Clone(px,py,p,'trap_puppet',aim);
          c.life=360;c.maxLife=360;c.hp=100;c.maxHp=100;c.isLivingPuppet=true;c.color='#7c2d12';clones.push(c);
          p.invisibleTimer=120;
          p.invuln=Math.max(p.invuln,120);
          spawnParticles(p.x,p.y,'#7c2d12',40);
          p.x=clamp(p.x-Math.cos(aim)*100,ARENA.x+p.r,ARENA.x+ARENA.w-p.r);
          p.y=clamp(p.y-Math.sin(aim)*100,ARENA.y+p.r,ARENA.y+ARENA.h-p.r);
          spawnShockwave(p.x,p.y,100,'#7c2d12');sfxCast();
        }
      },
      {name:'Кугуцу: Жертва',keyLabel:'␣',cd:1200,desc:'Куклы летят и взрываются ядом',ult:true,
        cast(p){
          const livePuppets=clones.filter(c=>c.isLivingPuppet&&!c.removed);
          if(livePuppets.length===0){spawnDamageNumber(p.x,p.y-40,'НЕТ КУКОЛ','#f55',false);return false;}
          const targets=[];
          for(const e of enemies){if(!e.removed)targets.push(e);}
          for(const b of bosses){if(!b.removed)targets.push(b);}
          if(targets.length===0){spawnDamageNumber(p.x,p.y-40,'НЕТ ЦЕЛЕЙ','#f55',false);return false;}
          fisherYates(targets);
          for(let i=0;i<livePuppets.length;i++){
            const puppet=livePuppets[i];
            const target=targets[i%targets.length];
            const ang=Math.atan2(target.y-puppet.y,target.x-puppet.x);
            const proj=new Projectile(puppet.x,puppet.y,ang,p.getDamage()*4,puppet.color||'#a16207',puppet.r,10);
            proj.attacker=p;proj.isPoisonKamikaze=true;proj.life=120;
            projectiles.push(proj);
            puppet.removed=true;
          }
          for(let i=clones.length-1;i>=0;i--)if(clones[i].removed)clones.splice(i,1);
          spawnShockwave(p.x,p.y,200,'#7c2d12');screenFlash=35;screenShake=20;hitStop=6;sfxUlt();
        }
      }
    ]},

  temari:{id:'temari',name:'ТЕМАРИ',color:'#0891b2',
    base:{hp:105,speed:3.8,damage:7,atkSpeed:18,defense:1},
    hook:{type:'gust',name:'ВЕЕР ТЭССЭН',color:'#a5f3fc',max:3},
    comboUlt:{name:'Фуудзин Тэнкай',cast(p){
      const cx=ARENA.x+ARENA.w/2,cy=ARENA.y+ARENA.h/2;
      const lvl=p.fanLevel||1;
      forEachEnemySnapshot(e=>{
        if(e.isBoss)return;
        const dx=cx-e.x,dy=cy-e.y,l=Math.hypot(dx,dy)||1;
        e.kx+=dx/l*80;e.ky+=dy/l*80;
        e.stunTimer=Math.max(e.stunTimer,120);
      });
      const dmgPerTick=p.getDamage()*(1+lvl*1.5)*0.75;
      addZone(new Zone(cx,cy,280,360,dmgPerTick,'#67e8f9',p,'windtrail'));
      spawnShockwave(cx,cy,280,'#0891b2');
      screenFlash=40;screenShake=25;hitStop=10;sfxUlt();
    }},
    abilities:[
      {name:'Камаитачи',keyLabel:'Q',cd:1800,desc:'Мощная конус-волна (КД 30с)',ult:false,
        cast(p,aim){
          const lvl=p.fanLevel||1;
          const mult=1+(lvl-1)*0.5;
          const range=200+lvl*80,halfAngle=Math.PI/3;
          forEachEnemySnapshot(e=>{
            const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
            if(d<range&&d>0){
              const ang=Math.atan2(dy,dx);
              if(Math.abs(angleDiff(ang,aim))<halfAngle){
                e.takeDamage(p.getDamage()*2.7*mult*0.75,p.x,p.y,false,p);
                if(!e.removed&&!e.isBoss){const dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*24*lvl;e.ky+=dy/dd*24*lvl;}
              }
            }
          });
          addZone(new Zone(p.x,p.y,120,420,0,'#67e8f9',p,'windCircle'));
          spawnShockwave(p.x,p.y,range,mult>1?'#67e8f9':'#a5f3fc');
          p.fanKill=true;sfxCast();
        }
      },
      {name:'Камай но Дзюцу',keyLabel:'E',cd:280,desc:'Снаряды по кругу веера',ult:false,
        cast(p,aim){
          const lvl=p.fanLevel||1;
          const mult=1+(lvl-1)*0.5;
          const count=lvl===1?3:lvl===2?6:12;
          if(lvl===3){
            const targets=getTargetsInRadius(p,500);
            for(let i=0;i<count;i++){
              const target=targets[i%Math.max(1,targets.length)];
              const ang=target?Math.atan2(target.y-p.y,target.x-p.x):aim+rand(-0.5,0.5);
              const proj=new Projectile(p.x,p.y,ang,p.getDamage()*2.5*mult*0.75,'#67e8f9',9,12);
              proj.pierce=true;proj.attacker=p;proj.pushes=15*lvl;
              projectiles.push(proj);
            }
          } else {
            for(let i=0;i<count;i++){
              const offset=(i-(count-1)/2)*0.12;
              const proj=new Projectile(p.x,p.y,aim+offset,p.getDamage()*2.5*mult*0.75,'#67e8f9',9,12);
              proj.pierce=true;proj.attacker=p;proj.pushes=15*lvl;
              projectiles.push(proj);
            }
          }
          sfxCast();
        }
      },
      {name:'Дайкамаитачи',keyLabel:'R',cd:450,desc:'Широкая волна 400px, отброс',ult:false,
        cast(p,aim){
          const lvl=p.fanLevel||1;
          const mult=1+(lvl-1)*0.5;
          const range=300+lvl*100,halfAngle=Math.PI/2.5;
          forEachEnemySnapshot(e=>{
            const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
            if(d<range&&d>0){
              const ang=Math.atan2(dy,dx);
              if(Math.abs(angleDiff(ang,aim))<halfAngle){
                e.takeDamage(p.getDamage()*4*mult*0.75,p.x,p.y,false,p);
                if(!e.removed&&!e.isBoss){const dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*40*lvl;e.ky+=dy/dd*40*lvl;}
              }
            }
          });
          const cx=p.x+Math.cos(aim)*200,cy=p.y+Math.sin(aim)*200;
          addZone(new Zone(clamp(cx,ARENA.x+50,ARENA.x+ARENA.w-50),clamp(cy,ARENA.y+50,ARENA.y+ARENA.h-50),160,240,p.getDamage()*2.5*0.75,'#67e8f9',p,'windtrail'));
          spawnShockwave(p.x,p.y,range,'#0891b2');screenShake=15;
          p.fanKill=true;sfxCast();
        }
      },
      {name:'Тацумаки',keyLabel:'␣',cd:1200,desc:'Торнадо по 1 на круг веера',ult:true,
        cast(p){
          const lvl=p.fanLevel||1;
          const mult=1+(lvl-1)*0.5;
          const dmgPerTick=p.getDamage()*1.2*mult*0.75;
          for(let i=0;i<lvl;i++){
            const a=(Math.PI*2/lvl)*i+rand(-0.3,0.3);
            const spawnX=clamp(p.x+Math.cos(a)*100,ARENA.x+120,ARENA.x+ARENA.w-120);
            const spawnY=clamp(p.y+Math.sin(a)*100,ARENA.y+120,ARENA.y+ARENA.h-120);
            tornadoes.push(new Tornado(spawnX,spawnY,dmgPerTick,p,180));
          }
          spawnShockwave(p.x,p.y,200,'#0891b2');screenFlash=25;screenShake=20;hitStop=8;
          p.fanKill=true;sfxUlt();
        }
      }
    ]}
};

// FIX #4: Ли — врата теперь в % от maxHP
CHARACTERS.lee={id:'lee',name:'РОК ЛИ',color:'#22c55e',
  base:{hp:130,speed:4.3,damage:9,atkSpeed:14,defense:1},
  meleeAuto:true,
  hook:{type:'comboCounter',name:'КОМБО',color:'#22c55e',max:20},
  comboUlt:{name:'Хатимон Кай',cast(p){
    p.eightGatesTimer=600;p.eightGatesDrain=0.005;p.eightGatesCombo=true;
    p.invuln=Math.max(p.invuln,90);
    for(let i=0;i<4;i++)p.cooldowns[i]=0;
    spawnShockwave(p.x,p.y,300,'#22c55e');spawnParticles(p.x,p.y,'#22c55e',100);
    screenFlash=60;screenShake=30;hitStop=20;sfxUlt();
  }},
  abilities:[
    {name:'Первичный Лотос',keyLabel:'Q',cd:180,desc:'Рывок + удар вверх + AoE',ult:false,
      cast(p,aim){
        const d=280;const nx=clamp(p.x+Math.cos(aim)*d,ARENA.x+p.r,ARENA.x+ARENA.w-p.r);const ny=clamp(p.y+Math.sin(aim)*d,ARENA.y+p.r,ARENA.y+ARENA.h-p.r);
        forEachEnemySnapshot(e=>{
          if(pointSegmentDist(e.x,e.y,p.x,p.y,nx,ny)<e.r+30){
            e.takeDamage(p.getDamage()*3,p.x,p.y,false,p);
            if(!e.removed&&!e.isBoss)e.stunTimer=Math.max(e.stunTimer,90);
          }
        });
        for(let i=0;i<=18;i++){const t=i/18;spawnParticles(p.x+(nx-p.x)*t,p.y+(ny-p.y)*t,'#86efac',4);}
        spawnShockwave(nx,ny,150,'#22c55e');
        p.x=nx;p.y=ny;p.invuln=Math.max(p.invuln,25);
        screenShake=12;hitStop=5;sfxCast();
      }
    },
    {name:'Обратный Лотос',keyLabel:'E',cd:400,desc:'3 удара + стан 2с (10 HP)',ult:false,
      cast(p,aim){
        if(p.hp<=10)return;
        p.hp-=10;
        const range=180,halfAngle=Math.PI/2.5;
        forEachEnemySnapshot(e=>{
          const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
          if(d<range&&d>0){
            const ang=Math.atan2(dy,dx);
            if(Math.abs(angleDiff(ang,aim))<halfAngle){
              e.takeDamage(p.getDamage()*2.5,p.x,p.y,false,p);
              if(!e.removed){e.stunTimer=Math.max(e.stunTimer,120);if(!e.isBoss){const dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*20;e.ky+=dy/dd*20;}}
            }
          }
        });
        spawnShockwave(p.x+Math.cos(aim)*80,p.y+Math.sin(aim)*80,180,'#22c55e');
        screenShake=15;hitStop=8;sfxCast();
      }
    },
    {name:'Пьяный Кулак',keyLabel:'R',cd:500,desc:'6с: 60% уклонение',ult:false,
      cast(p){p.drunkenTimer=360;p.dodgeChance=0.6;spawnParticles(p.x,p.y,'#86efac',40);sfxCast();}
    },
    {name:'Открытие Врат',keyLabel:'␣',cd:120,desc:'+1 врата (макс 8). Смертельно!',ult:true,noDamage:true,
      cast(p){
        if(p.leeGateCount>=8){spawnDamageNumber(p.x,p.y-40,'МАКС ВРАТ','#f55',false);return false;}
        p.leeGateCount=(p.leeGateCount||0)+1;
        const names=['Первая','Вторая','Третья','Четвёртая','Пятая','Шестая','Седьмая','Восьмая'];
        const drainsPct=[0,0.005,0.01,0.02,0.04,0.08,0.15,0.25,0.45];
        const colors=['#86efac','#4ade80','#22c55e','#eab308','#f97316','#dc2626','#a855f7','#ff1744'];
        spawnDamageNumber(p.x,p.y-50,`${names[p.leeGateCount-1]} Врата!`,'#22c55e',true);
        spawnDamageNumber(p.x,p.y-30,`−${Math.round(drainsPct[p.leeGateCount]*100)}% HP/с`,'#f55',false);
        spawnShockwave(p.x,p.y,180,colors[p.leeGateCount-1]);
        spawnParticles(p.x,p.y,colors[p.leeGateCount-1],30);
        screenFlash=Math.min(20,10+p.leeGateCount*3);
        screenShake=Math.max(screenShake,8+p.leeGateCount*2);sfxUlt();
      }
    }
  ]};

const CHAR_ORDER=['naruto','sasuke','sakura','kiba','hinata','shino','lee','neji','tenten','ino','shikamaru','choji','gaara','kankuro','temari'];
// Превью для экрана выбора персонажа (у Саске показываем Шаринган)
CHARACTERS.sasuke.abilities = CHARACTERS.sasuke.sharinganAbilities;
