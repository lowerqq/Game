"use strict";
// ==================== PLAYER ====================
class Player{
  constructor(x,y,charId,controls,id,isAI=false){
    this.id=id;this.x=x;this.y=y;this.baseR=15;this.r=this.baseR;
    this.charId=charId;this.character=CHARACTERS[charId];
    if(charId==='sasuke'){
      this.sasukeMode='sharingan';
      this.abilities=this.character.sharinganAbilities;
    }else{
      this.abilities=this.character.abilities;
	  this.remoteInput = null;
    }
    this.color=this.character.color;
    this.controls=controls;this.isAI=isAI;this.alive=true;
    this.coins=0;this.killStreak=0;this.streakTimer=0;
    this.comboPoints=0;this.comboStreakTimer=0;this.comboUltCooldown=0;this.shootTimer=0;
    this.hurtFlash=0;this.invuln=0;this.shield=0;this.shieldTimer=0;
    this.berserkTimer=0;this.byakuganTimer=0;this.absByakuganTimer=0;
    this.byakuganExtraTargets=0;this.kaitenTimer=0;this.wolfTimer=0;this.wolfRegen=0;
    this.kyuubiComboTimer=0;this.reflectTimer=0;this.reflectDamage=0;
    this.drunkenTimer=0;this.dodgeChance=0;this.eightGatesTimer=0;
    this.eightGatesDrain=0.02;this.eightGatesCombo=false;
    this.butterflyTimer=0;this.giantTimer=0;this.giantCombo=false;
    this.comboCount=0;this.comboTimer=0;
    this.meleeSwipeTimer=0;this.meleeSwipeAim=0;this.castRingTimer=0;this.castRingColor='#fff';
    this.mineSpawnTimer=0;this.kankuroPetTimer=0;this.sakuraRegenTimer=0;
    this.shikamaruBuff=0;this.rollingTimer=0;this.rollingAim=0;this.rollingHitSet=new Set();
    this.currentAutoKey=null;this.healCount=0;
    this.facing=-Math.PI/2;this.cooldowns=[0,0,0,0];
    this.abilityKeys=(id===0)?['KeyQ','KeyE','KeyR','Space']:['KeyU','KeyI','KeyO','KeyP'];
    this.abilityLabels=(id===0)?['Q','E','R','SP']:['U','I','O','P'];
    this.comboUltKey=(id===0)?'KeyF':'KeyL';
    this.comboUltLabel=(id===0)?'F':'L';
    this.abilityUpgrades=[{damage:0,cooldown:0},{damage:0,cooldown:0},{damage:0,cooldown:0},{damage:0,cooldown:0}];
    this.autoUpgrades={ricochet:0,explosive:0,knockback:0,cdOnKill:0,slow:0,circular:0,pierce:0,mines:0};
    this.statUpgrades={autoDamage:0,attackSpeed:0,hp:0,defense:0,regen:0};
    this.regenPerSec=0;this.boomerangActive=[false,false,false,false];
    this.anbuSquad=null;this.akamaruDeadCd=0;
    this.sageTimer=0;this.susanooTimer=0;this.byakugoTimer=0;this.byakugoHealTimer=0;
    this.twoHeadedTimer=0;this.fusionTimer=0;this.insectCloneTimer=0;
    this.leeGateCount=0;this.heavenlyTimer=0;this.tentenAmmoType=0;
    this.tentenAmmo=[12,12,12,12];this.shukakuTimer=0;
    this.sandShieldCount=0;this.sandShieldRegen=0;
    this.fanLevel=1;this.fanTimer=0;this.fanOpenTimer=0;this.fanKill=false;
    this.speedBuffTimer=0;this.currentAbilityIndex=-1;this.abilityIndexResetTimer=0;
    this.aiDecisionTimer=0;this._inTakeDamage=false;
    this.calories=70;this.maxCalories=100;this.eatTimer=0;
    this.timeSinceHit=0;
    this.sandVortexTimer=0;this.sandVortexAim=0;this.sandVortexTick=0;
    this.invisibleTimer=0;
    this.gentleFistTimer=0;this.gentleFistWaveTimer=0;
    this.hakkeCount=0;
    this.petalTimer=0;
    this.hook=this.character.hook;this.hookValue=0;
    this.hookMax=(this.hook&&this.hook.max)||100;this.hookTimer=0;
    this.stanceIndex=0;this.stayingTimer=0;
    this.sandWaveTimer=0;this.sandWaveX=0;this.sandWaveY=0;this.sandWaveAim=0;this.sandWaveAuraR=160;
        this.vanishedTimer=0;
    // Shino flying bug state
    this.flyingBugActive=false;
    this.flyingBugTimer=0;
    this.flyingBugRiding=false;
    this.flyingBugOwner=null;
    this.bugAuraTick=0;
	    // Sakura state
	    // Sakura state
    this.sakuraHealingActive=false;
    this.sakuraHealingTarget=null;
    this.sakuraJumpActive=false;
    this.sakuraJumpTimer=0;
    this.shootBlockedTimer=0;
    this.byakugoNoInTimer=0;
    this._prevEKey=false;
    this._prevSPJumpKey=false;
    this.tentenStanceIndex=0;
    this.shukakuTailAngle=0;
this.wolfMarkTarget=null;
this.wolfMarkSwitchTimer=300;
this.piercingFangTimer=0;
this.shadowChokeTimer=0;
this.shadowNeedleTimer=0;
    this.sasoriOrbitAngle=0;
    this.sasoriCooldown=0;
this.piercingFangAim=0;
this.piercingFangHitSet=new Set();
    this.prevX=x;this.prevY=y;
    this.maxDashCharges=3;
    this.dashCharges=3;
    this.dashRechargeTimer=0;
    this.dashTimer=0;
    this.dashVX=0;
    this.dashVY=0;
    this.dashKeys=(id===0)?['ShiftLeft','ShiftRight']:['ShiftRight'];
    this._prevDashKeyState=false;
    // ARTIFACTS
    this.artifacts={};
    this.kusanagiSwords=[];
    this.shurikenTimer=0;
    this.aiProfile={
      lastX:x,lastY:y,vx:0,vy:0,
      abilityUses:[0,0,0,0,0],
      totalFrames:0,stillFrames:0,
      avgEnemyDist:0,distSamples:0,
      aggressiveFrames:0,retreatFrames:0,
      cornerCount:[0,0,0,0],
      dashCount:0,damageTaken:0
    };
    this.applyBaseStats();
  }
  setSasukeMode(mode){
  if(this.charId!=='sasuke')return;
  this.sasukeMode=mode;
  this.abilities=mode==='rinnegan'?this.character.rinneganAbilities:this.character.sharinganAbilities;
}
  applyBaseStats(){const b=this.character.base;this.speed=b.speed;this.maxHp=b.hp;this.hp=b.hp;this.attackDamage=b.damage;this.attackSpeed=b.atkSpeed;this.defense=b.defense;}
  resetWaveState(){
    this.comboPoints=0;this.comboStreakTimer=0;this.comboUltCooldown=0;this.shield=0;this.shieldTimer=0;
    this.berserkTimer=0;this.byakuganTimer=0;this.absByakuganTimer=0;this.kaitenTimer=0;
    this.wolfTimer=0;this.wolfRegen=0;this.kyuubiComboTimer=0;this.reflectTimer=0;
    this.reflectDamage=0;this.drunkenTimer=0;this.dodgeChance=0;this.eightGatesTimer=0;
    this.eightGatesCombo=false;this.butterflyTimer=0;this.giantTimer=0;this.giantCombo=false;
    this.comboCount=0;this.comboTimer=0;this.mineSpawnTimer=0;this.kankuroPetTimer=0;
    this.sakuraRegenTimer=0;this.shikamaruBuff=0;this.rollingTimer=0;
    this.hurtFlash=0;this.meleeSwipeTimer=0;this.castRingTimer=0;
    this.killStreak=0;this.streakTimer=0;this.currentAbilityIndex=-1;
    this.abilityIndexResetTimer=0;this.hookTimer=0;this.boomerangActive=[false,false,false,false];
    this.sageTimer=0;this.susanooTimer=0;this.byakugoTimer=0;this.byakugoHealTimer=0;
    this.twoHeadedTimer=0;this.fusionTimer=0;this.insectCloneTimer=0;this.heavenlyTimer=0;
    this.shukakuTimer=0;this.shukakuTailAngle=0;this.sandShieldCount=0;this.sandShieldRegen=0;
    this.fanTimer=0;this.speedBuffTimer=0;this.fanLevel=1;this.fanOpenTimer=0;
    this.leeGateCount=0;this.tentenAmmo=[12,12,12,12];this.tentenAmmoType=0;
    this.invuln=Math.max(this.invuln,90);
    this.sandVortexTimer=0;this.invisibleTimer=0;this.gentleFistTimer=0;
    this.gentleFistWaveTimer=0;this.hakkeCount=0;this.eatTimer=0;
    this.timeSinceHit=0;
    this.sandWaveTimer=0;
    this.vanishedTimer=0;
    this.flyingBugActive=false;this.flyingBugTimer=0;
    this.flyingBugRiding=false;this.flyingBugOwner=null;this.bugAuraTick=0;
	    this.sakuraHealingActive=false;this.sakuraHealingTarget=null;
    this.sakuraJumpActive=false;this.sakuraJumpTimer=0;
    this.shootBlockedTimer=0;
    this.byakugoNoInTimer=0;
    this._prevEKey=false;
    this._prevSPJumpKey=false;
    this.tentenStanceIndex=0;
	    if(this.wolfMarkTarget && !this.wolfMarkTarget.removed)this.wolfMarkTarget.wolfMarkTimer=0;
    this.wolfMarkTarget=null;
    this.wolfMarkSwitchTimer=300;
    this.piercingFangTimer=0;
    this.piercingFangAim=0;
    this.piercingFangHitSet=new Set();
    this.shadowChokeTimer=0;
    this.shadowNeedleTimer=0;
    if(this.hook&&this.hook.type==='kyuubiCloak')this.hookValue=0;
    else if(this.hook&&this.hook.type==='calories')this.calories=70;
    else if(this.hook&&this.hook.type==='sand')this.hookValue=5;
    else if(this.hook&&this.hook.type==='gust')this.hookValue=1;
    else if(this.hook&&this.hook.type==='seals')this.hakkeCount=0;
    else this.hookValue=0;
  }
  updateProfile(){
    const pr=this.aiProfile;if(!pr)return;
    pr.totalFrames++;
    const dx=this.x-pr.lastX, dy=this.y-pr.lastY;
    pr.vx=dx;pr.vy=dy;
    pr.lastX=this.x;pr.lastY=this.y;
    const moved=Math.hypot(dx,dy);
    if(moved<0.5)pr.stillFrames++;
    let nearest=null,nd=Infinity;
    for(const e of enemies){if(e.removed)continue;const d=dist2(this,e);if(d<nd){nd=d;nearest=e;}}
    for(const b of bosses){if(b.removed)continue;const d=dist2(this,b);if(d<nd){nd=d;nearest=b;}}
    if(nearest){
      const d=Math.sqrt(nd);
      pr.avgEnemyDist=(pr.avgEnemyDist*pr.distSamples+d)/(pr.distSamples+1);
      pr.distSamples++;
      if(moved>0.5){
        const dot=dx*(nearest.x-this.x)+dy*(nearest.y-this.y);
        if(dot>0)pr.aggressiveFrames++; else pr.retreatFrames++;
      }
    }
    const cx=this.x-ARENA.x, cy=this.y-ARENA.y, m=250;
    if(cx<m&&cy<m)pr.cornerCount[0]++;
    else if(cx>ARENA.w-m&&cy<m)pr.cornerCount[1]++;
    else if(cx<m&&cy>ARENA.h-m)pr.cornerCount[2]++;
    else if(cx>ARENA.w-m&&cy>ARENA.h-m)pr.cornerCount[3]++;
  }
  getStreakBonus(){return 1+Math.min(0.2,this.killStreak*0.01);}
  getSpeedBonus(){
    let mult=1;
    if(this.hook&&this.hook.type==='packHunt'){for(const pet of pets){if(pet.type==='akamaru'&&pet.owner===this&&Math.hypot(pet.x-this.x,pet.y-this.y)<150)mult*=1.2;}}
    if(this.speedBuffTimer>0)mult*=1.5;
    return mult;
  }
  getEffectiveSpeed(){
    let spd=this.speed*this.getSpeedBonus();
    // ═══ Артефакты: скорость перемещения ═══
    spd*=1+this.getArtifactStack('raikageArmor')*0.05;
    spd*=Math.max(0.3,1-this.getArtifactStack('akatsukiRing')*0.05-this.getArtifactStack('akatsukiCloak')*0.05);
    if(this.kyuubiComboTimer>0)spd*=1.5;
    if(this.wolfTimer>0)spd*=1.5;
    if(this.eightGatesTimer>0)spd*=this.eightGatesCombo?2:1.5;
    if(this.butterflyTimer>0)spd*=1.4;
    if(this.giantTimer>0)spd*=0.7;
    if(this.rollingTimer>0)spd*=1.8;
    if(this.fusionTimer>0)spd*=1.4;
    if(this.sageTimer>0)spd*=1.25;
    if(this.heavenlyTimer>0)spd=0;
    if(this.eatTimer>0)spd=0;
        if(this.sandWaveTimer>0)spd=0;
    if(this.shadowChokeTimer>0)spd=0;
    if(this.charId==='lee'&&this.leeGateCount>0)spd*=1+(this.leeGateCount*0.1);
    if(this.byakugoNoInTimer>0)spd*=1.4;   // F: +40% скорости
    if(this.sakuraHealingActive)spd=0;      // E: не может двигаться
    if(this.sakuraJumpActive)spd*=3.5;      // SP: быстрый полёт (×3.5)
    if(this.flyingBugActive)spd*=1.5;       // Shino: жук ускоряет
    return spd;
  }
  getDamage(){
    let dmg=this.attackDamage;
    // ═══ УБРАНО: плоские бонусы (threeToothKunai, soldierPill, akatsukiCloak) ═══
    // ═══ Танто Белого Клыка остаётся — у него "+урон", не "+автоатака" ═══
    for(const sw of whiteFangSwords){
      if(sw.owner===this && Math.hypot(this.x-sw.x,this.y-sw.y)<150){
        dmg*=1+this.getArtifactStack('whiteFangTanto')*0.2;
        break;
      }
    }
    if(this.kyuubiComboTimer>0)dmg*=1.5;
    if(this.berserkTimer>0)dmg*=1.5;
    if(this.wolfTimer>0)dmg*=1.5;
    if(this.byakuganTimer>0)dmg*=1.4;
    if(this.eightGatesTimer>0)dmg*=this.eightGatesCombo?3:2;
    if(this.butterflyTimer>0)dmg*=2.5;
    if(this.giantTimer>0)dmg*=this.giantCombo?3:2.5;
    if(this.susanooTimer>0)dmg*=1.5;
    if(this.byakugoTimer>0)dmg*=2;
    if(this.twoHeadedTimer>0)dmg*=1.8;
    if(this.fusionTimer>0)dmg*=1.5;
    if(this.sageTimer>0)dmg*=1.3;
    if(this.shukakuTimer>0)dmg*=1.5;
    dmg*=1+this.comboCount*0.05;
    if(this.shikamaruBuff>0)dmg*=2;
    if(this.hook&&this.hook.type==='packHunt'){for(const pet of pets){if(pet.type==='akamaru'&&pet.owner===this&&Math.hypot(pet.x-this.x,pet.y-this.y)<150){dmg*=1.3;break;}}}
    if(this.hook&&this.hook.type==='livingPuppet'){let count=0;for(const c of clones)if(c.isLivingPuppet&&c.hp>0)count++;for(const pt of pets)if(pt.type==='puppet_beast')count++;dmg*=1+count*0.05;}
    if(this.hook&&this.hook.type==='puppets'){let count=0;for(const e of enemies)if(e.mindControlTimer>0&&e.mindControlOwner===this)count++;dmg*=1+count*0.15;}
    if(this.hook&&this.hook.type==='punchCharge'&&this.currentAbilityIndex>=0&&this.hookValue>=3){dmg*=2;}
    if(this.hook&&this.hook.type==='sand'&&this.hookValue>0){dmg*=1+this.hookValue*0.02;}
    if(this.hook&&this.hook.type==='comboCounter'&&this.hookValue>0){dmg*=1+this.hookValue*0.08;}
	    if(this.byakugoNoInTimer>0)dmg*=1.25; // F: +25% урона
    dmg*=this.getStreakBonus();
    if(this.currentAbilityIndex>=0&&this.currentAbilityIndex<4){
      const uLvl=this.abilityUpgrades[this.currentAbilityIndex].damage;
      dmg*=1+uLvl*0.4;
    }
    return dmg;
  }
  getAim(){return this.facing;}
  getAutoAim(){const t=findNearestTarget(this);if(t)return Math.atan2(t.y-this.y,t.x-this.x);return this.facing;}
  getAttackDelay(){
    let delay=this.attackSpeed*(1-this.statUpgrades.attackSpeed*0.06);
    delay*=1-this.getArtifactStack('anbuMask')*0.05;
	    delay*=1-this.getArtifactStack('akatsukiRing')*0.10;   // +10% скор.атаки = −10% задержки
    delay*=1+this.getArtifactStack('threeToothKunai')*0.05; // −5% скор.атаки = +5% задержки
	    delay*=1+this.getArtifactStack('konanShuriken')*0.05;
    for(const other of players){
      if(!other.alive)continue;
      const bells=other.getArtifactStack('kakashiBells');
      if(bells===0)continue;
      if(Math.hypot(other.x-this.x,other.y-this.y)<250)delay-=bells*3;
    }
    if(this.charId==='temari'){
      for(const z of zones){
        if(z.isWindCircle&&z.owner===this&&z.life>0){
          const d=Math.hypot(this.x-z.x,this.y-z.y);
          if(d<z.r){delay*=0.75;break;}
        }
      }
    }
    delay=Math.max(4,delay);
    return Math.round(delay*2);
  }
  updateSizeAndSpeed(){
    let s=1;
    if(this.butterflyTimer>0)s=0.7;
    if(this.giantTimer>0)s=2.0;
    if(this.fusionTimer>0)s=1.5;
    if(this.shukakuTimer>0)s=2.0;
    this.r=this.baseR*s;
  }
  // FIX #16: Универсальные таймеры — всегда тикают
  _tickUniversal(){
    this.updateProfile();
    if(this.shootTimer>0)this.shootTimer--;
    if(this.hurtFlash>0)this.hurtFlash--;
    if(this.invuln>0)this.invuln--;
    if(this.invisibleTimer>0)this.invisibleTimer--;
    if(this.abilityIndexResetTimer>0){this.abilityIndexResetTimer--;if(this.abilityIndexResetTimer===0)this.currentAbilityIndex=-1;}
    for(let i=0;i<4;i++)if(this.cooldowns[i]>0)this.cooldowns[i]--;
    if(this.shieldTimer>0){this.shieldTimer--;if(this.shieldTimer===0)this.shield=0;}
    if(this.regenPerSec>0)this.hp=Math.min(this.maxHp,this.hp+this.regenPerSec/60);
    if(this.speedBuffTimer>0)this.speedBuffTimer--;
	    if(this.shootBlockedTimer>0)this.shootBlockedTimer--;
		if(this.piercingFangTimer>0){
  this.piercingFangTimer--;
  if(this.piercingFangTimer===0){
    this.piercingFangHitSet.clear();
    spawnShockwave(this.x,this.y,150,'#d4b483');
  }
}
    if(this.byakugoNoInTimer>0){
      this.byakugoNoInTimer--;
      this.hp=Math.min(this.maxHp,this.hp+15/60); // реген 15/сек
    }
    if(this.comboTimer>0){this.comboTimer--;if(this.comboTimer===0)this.comboCount=0;}
	    // ═══ Комбо: +1 за каждую секунду без урона ═══
    if(this.comboPoints<COMBO_COST){
      this.comboStreakTimer++;
      if(this.comboStreakTimer>=60){
        this.comboStreakTimer=0;
        this.comboPoints=Math.min(COMBO_COST,this.comboPoints+1);
      }
    }
    if(this.dashCharges<this.maxDashCharges){
      this.dashRechargeTimer++;
      let rechargeFrames=Math.max(15*60*0.3,Math.floor(15*60*(1-this.getArtifactStack('kageCloak')*0.10)));
      if(this.hook&&this.hook.type==='dashBurst')rechargeFrames=Math.floor(rechargeFrames*0.4);
      if(this.dashRechargeTimer>=rechargeFrames){this.dashRechargeTimer=0;this.dashCharges++;}
    }
    if(this.autoUpgrades.mines>0){this.mineSpawnTimer++;if(this.mineSpawnTimer>=60){this.mineSpawnTimer=0;const life=180+this.autoUpgrades.mines*120;const savedIdx=this.currentAbilityIndex;this.currentAbilityIndex=-1;const mineDmg=this.getDamage()*2.5;this.currentAbilityIndex=savedIdx;mines.push(new Mine(this.x,this.y,mineDmg,this,life));}}
    if(this.comboUltCooldown>0)this.comboUltCooldown--;
    if(this.akamaruDeadCd>0){this.akamaruDeadCd--;if(this.akamaruDeadCd===0&&this.charId==='kiba'){const pet=new Pet(this.x+30,this.y,this,'akamaru');pet.hp=pet.maxHp;pets.push(pet);spawnShockwave(this.x,this.y,100,'#d4b483');spawnDamageNumber(this.x,this.y-50,'АКАМАРУ ВЕРНУЛСЯ!','#d4b483',true);}}
      // ═══ Марионетка Сасори: перехват снарядов ═══
    if(this.sasoriCooldown>0)this.sasoriCooldown--;
    const sasoriStacks=this.getArtifactStack('sasoriPuppet');
    if(sasoriStacks>0){
      this.sasoriOrbitAngle=(this.sasoriOrbitAngle||0)+0.06;
      if(this.sasoriCooldown===0){
        for(const ep of enemyProjectiles){
          if(ep.dead)continue;
          for(let i=0;i<sasoriStacks;i++){
            const ang=this.sasoriOrbitAngle+i*Math.PI*2/sasoriStacks;
            const px=this.x+Math.cos(ang)*60;
            const py=this.y+Math.sin(ang)*60;
            if(Math.hypot(ep.x-px,ep.y-py)<25){
              ep.dead=true;
              this.sasoriCooldown=300; // 5 секунд
              spawnShockwave(px,py,40,'#7c2d12');
              spawnParticles(px,py,'#7c2d12',12);
              spawnDamageNumber(px,py-20,'БЛОК!','#a16207',true);
              break;
            }
          }
          if(this.sasoriCooldown>0)break;
        }
      }
    }
} 
  updateHook(){
    if(!this.hook)return;
    const t=this.hook.type;
    const moved=Math.hypot(this.x-this.prevX,this.y-this.prevY);
    if(t==='kyuubiCloak'){
      if(this.hookValue>=8&&this.kyuubiComboTimer<=0){
        this.hookValue=0;this.kyuubiComboTimer=240;
        this.hp=Math.min(this.maxHp,this.hp+40);
        spawnShockwave(this.x,this.y,300,'#ff6600');spawnParticles(this.x,this.y,'#ff6600',80);
        screenFlash=25;screenShake=15;
        spawnDamageNumber(this.x,this.y-50,'РЕЖИМ КЬЮБИ!','#ff6600',true);sfxUlt();
      }
    } else if(t==='punchCharge'){
      if(moved<0.5){this.stayingTimer++;this.hookValue=Math.min(3,this.hookValue+(2/90));}
      else this.stayingTimer=0;
} else if(t==='byakugoSeal'){
      if(this.eatTimer<=0&&this.heavenlyTimer<=0&&this.sandWaveTimer<=0){
        const prev=this.hookValue||0;
        // Стоя: 3/сек. В движении: 1/сек. (не обнуляется при движении!)
        const rate = moved<0.5 ? 3/60 : 1/60;
        this.hookValue=Math.min(12,prev+rate);
        if(Math.floor(this.hookValue)>Math.floor(prev)){
          spawnParticles(this.x,this.y,'#f472b6',4);
          addTrail(this.x,this.y,'#fbcfe8',this.r*0.8);
        }
      }
} else if(t==='calories'){
      if(this.eatTimer<=0){
        // Стоя: 4/сек. В движении: 1.5/сек. (не обнуляется при движении!)
        const rate = moved<0.5 ? 4/60 : 1.5/60;
        this.calories=Math.min(this.maxCalories,this.calories+rate);
      }
    } else if(t==='sand'){
      if(this.timeSinceHit>60)this.hookValue=Math.min(this.hookMax,this.hookValue+1/60);
    } else if(t==='wolfMark'){
      this.wolfMarkSwitchTimer--;
      // Сброс мёртвой цели
      if(this.wolfMarkTarget && this.wolfMarkTarget.removed){
        this.wolfMarkTarget=null;
      }
      if(this.wolfMarkSwitchTimer<=0 || !this.wolfMarkTarget){
        // Снять метку с прошлой цели
        if(this.wolfMarkTarget && !this.wolfMarkTarget.removed)this.wolfMarkTarget.wolfMarkTimer=0;
        // Выбрать нового случайного врага
        const allT=[...enemies,...bosses].filter(e=>!e.removed);
        if(allT.length>0){
          this.wolfMarkTarget=allT[Math.floor(Math.random()*allT.length)];
          this.wolfMarkTarget.wolfMarkTimer=240;
          spawnParticles(this.wolfMarkTarget.x,this.wolfMarkTarget.y,'#d4b483',25);
          spawnShockwave(this.wolfMarkTarget.x,this.wolfMarkTarget.y,70,'#d4b483');
          spawnDamageNumber(this.wolfMarkTarget.x,this.wolfMarkTarget.y-(this.wolfMarkTarget.r||15)-15,'МЕТКА!','#d4b483',true);
        }
        this.wolfMarkSwitchTimer=300;
      }
    } else if(t==='bugAura'){
      this.bugAuraTick=(this.bugAuraTick||0)+1;
      if(this.bugAuraTick>=30){
        this.bugAuraTick=0;
        const range=90;
        const dmg=this.getDamage()*0.7;
        forEachEnemySnapshot(e=>{
          if(e.removed)return;
          if(Math.hypot(e.x-this.x,e.y-this.y)<range+e.r){
            e.takeDamage(dmg,this.x,this.y,false,this);
          }
        });
       }
    } else if(t==='shadowWeb'){
      // Стоя на месте → авто-стрела тени каждые 45 кадров
      if(moved<0.5 && this.shootBlockedTimer<=0 && !this.sakuraHealingActive && !this.sakuraJumpActive){
        this.shadowNeedleTimer=(this.shadowNeedleTimer||0)+1;
        if(this.shadowNeedleTimer>=45){
          this.shadowNeedleTimer=0;
          let best=null,bd=Infinity;
          for(const e of enemies){
            if(e.removed)continue;
            if(e.shadowWebTimer>0 && e.shadowWebOwner===this)continue;
            const d=dist2(this,e);if(d<bd){bd=d;best=e;}
          }
          for(const b of bosses){
            if(b.removed)continue;
            if(b.shadowWebTimer>0 && b.shadowWebOwner===this)continue;
            const d=dist2(this,b);if(d<bd){bd=d;best=b;}
          }
          if(best){
            const ang=Math.atan2(best.y-this.y,best.x-this.x);
const needle=new Projectile(this.x,this.y,ang,this.getDamage()*0.8,'#a5b4fc',6,12);
needle.attacker=this;
needle.homing=true;needle.homingRange=700;
needle.isShikamaruNeedle=true;
needle.homingTarget=best;   // ← ЗАПОМИНАЕМ именно несвязанного
projectiles.push(needle);
            sfx(600,0.06,0.05,'sine',1.3);
          }
        }
      } else {
        this.shadowNeedleTimer=0;
      }
    } else if(t==='gust'){
      this.fanOpenTimer=(this.fanOpenTimer||0)+1;
      if(this.fanOpenTimer>=600){
        this.fanOpenTimer=0;
        if(this.fanLevel<3){
          this.fanLevel++;
          const names=['','Один круг','Два круга','ТРИ КРУГА'];
          spawnDamageNumber(this.x,this.y-50,names[this.fanLevel]+'!','#a5f3fc',true);
          spawnShockwave(this.x,this.y,150,'#67e8f9');
          screenFlash=20;sfxCoin();
        }
      }
    }
    this.prevX=this.x;this.prevY=this.y;
  }
    getArtifactStack(key){return this.artifacts[key]||0;}
  equipArtifact(key){
    if(!ARTIFACTS[key])return;
    const prev=this.getArtifactStack(key);
    if(prev>=ARTIFACTS[key].maxStack){
      spawnDamageNumber(this.x,this.y-50,'МАКСИМУМ','#f55',false);
      return;
    }
    this.artifacts[key]=prev+1;
    if(key==='kusanagi'){
      const offset=this.kusanagiSwords.length*(Math.PI*2/3);
      this.kusanagiSwords.push(new KusanagiSword(this,offset));
    }
    if(key==='greenPill'){
      const delta=Math.floor(this.maxHp*0.05);
      this.maxHp+=delta;this.hp+=delta;
    }
    if(key==='soldierPill'){
      this.maxHp=Math.max(10,this.maxHp-25);
      this.hp=Math.min(this.hp,this.maxHp);
    }
    if(key==='bloodPill'){
      this.maxHp+=25;this.hp+=25;
    }
	    // ═══ Шляпа Хокаге: +1 заряд рывка ═══
    if(key==='kageHat'){
      this.maxDashCharges+=1;
      this.dashCharges=Math.min(this.dashCharges+1,this.maxDashCharges);
    }
    // ═══ Танто Белого Клыка: спавн клинка ═══
    if(key==='whiteFangTanto'){
      const ang=Math.random()*Math.PI*2;
      const r=Math.min(ARENA.w,ARENA.h)*0.3;
      const sx=clamp(ARENA.x+ARENA.w/2+Math.cos(ang)*r,ARENA.x+80,ARENA.x+ARENA.w-80);
      const sy=clamp(ARENA.y+ARENA.h/2+Math.sin(ang)*r,ARENA.y+80,ARENA.y+ARENA.h-80);
      whiteFangSwords.push({x:sx,y:sy,owner:this});
    }
    spawnShockwave(this.x,this.y,90,'#ffd700');
    spawnParticles(this.x,this.y,'#ffd700',25);
    spawnDamageNumber(this.x,this.y-60,`★ ${ARTIFACTS[key].name}`,'#ffd700',true);
    sfx(1200,0.2,0.1,'sine',1.5);
  }
  getAutoDamage(){
  let dmg=this.getDamage();
  // ═══ Плоские бонусы — ТОЛЬКО для автоатак ═══
  dmg+=this.getArtifactStack('threeToothKunai')*10;
  dmg+=this.getArtifactStack('soldierPill')*25;
  dmg+=this.getArtifactStack('akatsukiCloak')*10;
  // ═══ Стат «Автоурон» ═══
  dmg*=1+this.statUpgrades.autoDamage*0.15;
  // ═══ Красная пилюля ═══
  dmg*=1+this.getArtifactStack('redPill')*0.05;
  return dmg;
}
  fireFumaShurikens(){
    const stacks=this.getArtifactStack('shuriken');
    if(stacks===0)return;
    if(enemies.length+bosses.length===0)return;
    const aim=this.getAutoAim();
    const dmg=this.getAutoDamage()*0.8;
    const au=this.autoUpgrades;
    for(let i=0;i<stacks;i++){
      const offset=(i-(stacks-1)/2)*0.25;
      const proj=new Projectile(this.x,this.y,aim+offset,dmg,'#a5f3fc',8,11);
      proj.attacker=this;proj.fromAutoAttack=true;proj.isFumaShuriken=true;
      if(au.ricochet>0)proj.bounces=au.ricochet;
      if(au.pierce>0)proj.pierceCount=au.pierce+1;
      if(au.knockback>0)proj.pushes=au.knockback*5;
      if(au.explosive>0)proj.explodeRadius=30+au.explosive*30;
      if(au.slow>0)proj.appliesSlow=au.slow*120;
      {const sp=Math.hypot(proj.vx,proj.vy);if(sp>0)proj.life=Math.floor(500/sp);}
      projectiles.push(proj);
    }
  }
  // FIX #1: triggerSeal — работает многократно
  triggerSeal(e){
    if(!e||e.removed||e.sealStacks<8)return;
    e.sealStacks=0;
    if(e.isBoss){e.takeDamage(e.maxHp*0.05,this.x,this.y,false,this,true);if(!e.removed){e.stunTimer=Math.max(e.stunTimer,60);e.silenceTimer=Math.max(e.silenceTimer,180);}}
    else{e.takeDamage(e.maxHp*0.2,this.x,this.y,false,this,true);if(!e.removed)e.stunTimer=Math.max(e.stunTimer,120);}
    spawnShockwave(e.x,e.y,100,'#a78bfa');
    spawnDamageNumber(e.x,e.y-30,'ХАККЕ!','#a78bfa',true);sfxBoom();
  }
  hookCanCast(i){
    if(!this.hook)return true;
    if(this.hook.type==='calories'){
      const ab=this.abilities[i];
      if(ab.noCd){
        const costs=[20,35,40,100][i]||0;
        return this.calories>=costs;
      }
      return true;
    }
    return true;
  }
castAbility(i){
  if(!this.hookCanCast(i)){spawnDamageNumber(this.x,this.y-40,'НЕТ КАЛОРИЙ','#f55',false);return;}
  const ab=this.abilities[i];
  const up=this.abilityUpgrades[i];
  const cdMult=1-up.cooldown*0.2;
  this.currentAbilityIndex=i;
  this.abilityIndexResetTimer=25;
  const success=ab.cast(this,this.getAim());
  if(success===false){
    // «вхолостую» — не тратим КД и не рисуем эффекты
    this.currentAbilityIndex=-1;
    this.abilityIndexResetTimer=0;
    return;
  }
  if(this.aiProfile)this.aiProfile.abilityUses[i]++;
  this.castRingTimer=12;
  this.castRingColor=ab.ult?'#ffd700':this.character.color;
  spawnShockwave(this.x,this.y,ab.ult?100:50,ab.ult?'#ffd700':this.character.color);
  spawnParticles(this.x,this.y,ab.ult?'#ffd700':this.character.color,ab.ult?40:20);
  if(ab.noCd){this.cooldowns[i]=0;}
  else {this.cooldowns[i]=Math.ceil(ab.cd*cdMult*CD_MULTIPLIER);}
  if(ab.ult){hitStop=Math.max(hitStop,6);screenShake=Math.max(screenShake,12);}
}
  castComboUlt(){
    if(this.comboUltCooldown>0)return;
    if(this.charId==='tenten'){
      this.comboUltCooldown=45;
      this.character.comboUlt.cast(this);
      return;
    }
    if(this.comboPoints<COMBO_COST)return;
    if(this.charId==='kiba'){
      let hasAkamaru=false;
      for(const pet of pets)if(pet.type==='akamaru'&&pet.owner===this&&pet.hp>0)hasAkamaru=true;
      if(!hasAkamaru){spawnDamageNumber(this.x,this.y-40,'НЕТ АКАМАРУ!','#f55',true);return;}
    }
    this.comboPoints=Math.max(0,this.comboPoints-COMBO_COST);
    this.comboStreakTimer=0;
    this.comboUltCooldown=30;
    if(this.aiProfile)this.aiProfile.abilityUses[4]++;
    const ult=this.character.comboUlt;ult.cast(this);
    spawnDamageNumber(this.x,this.y-50,ult.name,'#ffd700',true);
    screenShake=Math.max(screenShake,15);hitStop=Math.max(hitStop,8);
  }
  aiUpdate(){
    if(this.comboPoints>=COMBO_COST&&(enemies.length+bosses.length)>=3)this.castComboUlt();
    let nearest=null,nd=Infinity;
    for(const e of enemies){const d=Math.hypot(e.x-this.x,e.y-this.y);if(d<nd){nd=d;nearest=e;}}
    for(const b of bosses){const d=Math.hypot(b.x-this.x,b.y-this.y);if(d<nd){nd=d;nearest=b;}}
    let mx=0,my=0;
    if(nearest){
      if(nd<170){mx=this.x-nearest.x;my=this.y-nearest.y;}
      else if(nd>280){mx=nearest.x-this.x;my=nearest.y-this.y;}
      else{mx=-(nearest.y-this.y);my=(nearest.x-this.x);}
      this.facing=Math.atan2(nearest.y-this.y,nearest.x-this.x);
    }
    const em=100;
    if(this.x<ARENA.x+em)mx+=2;if(this.x>ARENA.x+ARENA.w-em)mx-=2;
    if(this.y<ARENA.y+em)my+=2;if(this.y>ARENA.y+ARENA.h-em)my-=2;
    if(this.susanooTimer<=0&&this.heavenlyTimer<=0&&this.eatTimer<=0&&this.sandWaveTimer<=0){
      const l=Math.hypot(mx,my);
      if(l>0.1){const spd=this.getEffectiveSpeed();this.x+=mx/l*spd;this.y+=my/l*spd;}
    }
    this.aiDecisionTimer--;
    if(this.aiDecisionTimer<=0){
      this.aiDecisionTimer=10;
      const hpR=this.hp/this.maxHp;
      const allT=[...enemies,...bosses];
      for(let i=0;i<4;i++){
        if(this.cooldowns[i]>0)continue;
        if(!this.hookCanCast(i))continue;
        const ab=this.abilities[i];
        let cast=false;
        if(ab.ult){if(allT.length>=5||hpR<0.4||bosses.length>0)cast=true;}
        else{for(const e of allT)if(Math.hypot(e.x-this.x,e.y-this.y)<280){cast=true;break;}}
        if(cast){this.castAbility(i);break;}
      }
    }
  }
  update(){
    if(!this.alive)return;
       this._tickUniversal(); // FIX #16: универсальные таймеры
    // ═══ Shino: полёт на жуке ═══
    if(this.flyingBugActive && !this.flyingBugRiding){
      this.flyingBugTimer--;
      if(this.flyingBugTimer<=0)this.endFlyingBug();
    }
    if(this.flyingBugRiding&&this.flyingBugOwner){
      this.x=this.flyingBugOwner.x-25;
      this.y=this.flyingBugOwner.y-15;
    }
	    // ═══ Sakura: тик канала E ═══ // FIX #16: универсальные таймеры
	    // ═══ Sakura: тик канала E ═══
    if(this.sakuraHealingActive){
      const target=this.sakuraHealingTarget;
      const stop=!target||!target.alive||(target.hp>=target.maxHp)||(Math.hypot(target.x-this.x,target.y-this.y)>450);
      if(stop){
        this.sakuraHealingActive=false;this.sakuraHealingTarget=null;
        const cdMult=1-this.abilityUpgrades[1].cooldown*0.2;
        this.cooldowns[1]=Math.ceil(350*cdMult*CD_MULTIPLIER);
      } else {
        const healPerSec=10*(1+this.abilityUpgrades[1].damage*0.4);
        target.hp=Math.min(target.maxHp,target.hp+healPerSec/60);
        if(tickMs%15<17){
          addTrail(target.x,target.y,'#4ade80',10);
          if(Math.random()<0.4)emitParticle(target.x+rand(-8,8),target.y+rand(-8,8),0,-1,25,'#4ade80',3);
        }
      }
    }
    // ═══ Sakura: тик прыжка SP ═══
    if(this.sakuraJumpActive){
      this.sakuraJumpTimer--;
      if(this.sakuraJumpTimer<=0){
        this.sakuraJumpActive=false;
        const tx=this.x,ty=this.y;
const isBoosted=this.byakugoNoInTimer>0;
const dmg=this.getDamage()*(isBoosted?9:6);
const radius=isBoosted?280:200;
        forEachEnemySnapshot(e=>{
          if(Math.hypot(e.x-tx,e.y-ty)<radius+e.r){
            e.takeDamage(dmg,tx,ty,false,this);
            if(!e.removed&&!e.isBoss){
              const dx=e.x-tx,dy=e.y-ty,dd=Math.hypot(dx,dy)||1;
              e.kx+=dx/dd*45;e.ky+=dy/dd*45;
              e.stunTimer=Math.max(e.stunTimer,90);
            }
          }
        });
        addZone(new Zone(tx,ty,150,240,0,'#f472b6',this,'crater'));
        spawnShockwave(tx,ty,radius,'#f472b6');
        spawnShockwave(tx,ty,radius*0.6,'#fbcfe8');
        spawnParticles(tx,ty,'#f472b6',80);
        screenShake=25;screenFlash=30;hitStop=10;sfxBoom();
      }
    }
    if(this.vanishedTimer>0){
      this.vanishedTimer--;
      if(this.vanishedTimer%4===0){
        addTrail(this.x+rand(-20,20),this.y+rand(-20,20),'#cbd5e1',8);
        if(Math.random()<0.4)emitParticle(this.x+rand(-25,25),this.y+rand(-25,25),rand(-1,1),rand(-2,-0.5),40,'#e2e8f0',rand(3,6));
      }
      if(this.vanishedTimer===0){
        spawnShockwave(this.x,this.y,180,'#cbd5e1');
        spawnShockwave(this.x,this.y,120,'#fff');
        spawnParticles(this.x,this.y,'#e2e8f0',50);
        spawnDamageNumber(this.x,this.y-60,'Я ВЕРНУЛАСЬ!','#e2e8f0',true);
        screenFlash=Math.max(screenFlash,20);
        screenShake=Math.max(screenShake,10);sfxCast();
      }
      // FIX #16: minor timers that don't run in _tickUniversal:
      if(this.eatTimer>0){this.eatTimer--;this.calories=Math.min(this.maxCalories,this.calories+100/180);}
      if(this.sakuraRegenTimer>0){this.sakuraRegenTimer--;if(this.sakuraRegenTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+8);}
      if(this.byakugoTimer>0){this.byakugoTimer--;this.byakugoHealTimer++;if(this.byakugoHealTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+10);}
      return;
    }
    const _oldPX=this.x,_oldPY=this.y;
    this.updateSizeAndSpeed();
    this.timeSinceHit++;
    // ═══ Шикамару: канал Удушения ═══
    if(this.shadowChokeTimer>0){
      this.shadowChokeTimer--;
      if(this.shadowChokeTimer%20===0){
        forEachEnemySnapshot(e=>{
          if(e.removed)return;
          if(e.shadowWebOwner!==this||e.shadowWebTimer<=0)return;
          e.takeDamage(this.getDamage()*1.5,e.x,e.y,false,this);
          if(!e.removed){
            e.slowTimer=Math.max(e.slowTimer,60);
            e.shadowWebTimer=Math.max(e.shadowWebTimer,120);
            addTrail(e.x,e.y,'#8b5cf6',e.r*0.7);
          }
        });
        spawnShockwave(this.x,this.y,180,'#8b5cf6');
      }
      if(this.shadowChokeTimer===0)spawnDamageNumber(this.x,this.y-50,'УДУШЕНИЕ ЗАВЕРШЕНО','#a5b4fc',true);
      // Минорные таймеры
      if(this.eatTimer>0){this.eatTimer--;this.calories=Math.min(this.maxCalories,this.calories+100/180);}
      if(this.sakuraRegenTimer>0){this.sakuraRegenTimer--;if(this.sakuraRegenTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+8);}
      if(this.byakugoTimer>0){this.byakugoTimer--;this.byakugoHealTimer++;if(this.byakugoHealTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+10);}
      this.updateHook();
      this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
      this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
      return;
    }
    if(this.sandWaveTimer>0){
      this.sandWaveTimer--;
      if(!this.isAI){
        const c=this.controls;let dx=0,dy=0;
        if(keys[c.up])dy--;if(keys[c.down])dy++;
        if(keys[c.left])dx--;if(keys[c.right])dx++;
        if(dx||dy){const l=Math.hypot(dx,dy);this.sandWaveX+=dx/l*6.5;this.sandWaveY+=dy/l*6.5;this.sandWaveAim=Math.atan2(dy,dx);}
      } else {
        const tgt=findNearestTarget(this,800);
        if(tgt){const a=Math.atan2(tgt.y-this.sandWaveY,tgt.x-this.sandWaveX);this.sandWaveX+=Math.cos(a)*5.5;this.sandWaveY+=Math.sin(a)*5.5;}
      }
      this.sandWaveX=clamp(this.sandWaveX,ARENA.x+80,ARENA.x+ARENA.w-80);
      this.sandWaveY=clamp(this.sandWaveY,ARENA.y+80,ARENA.y+ARENA.h-80);
      if(this.sandWaveTimer>0&&this.sandWaveTimer%18===0){
        const wR=this.sandWaveAuraR;
        forEachEnemySnapshot(e=>{
          if(e.removed)return;
          const dx=e.x-this.sandWaveX,dy=e.y-this.sandWaveY;
          if(dx*dx+dy*dy<(wR+e.r)*(wR+e.r)){
            e.takeDamage(this.getDamage()*2.5,this.sandWaveX,this.sandWaveY,false,this);
            if(!e.removed&&!e.isBoss){const dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*30;e.ky+=dy/dd*30;e.stunTimer=Math.max(e.stunTimer,30);}
          }
        });
        spawnShockwave(this.sandWaveX,this.sandWaveY,wR,'#b45309');
      }
      addTrail(this.sandWaveX,this.sandWaveY,'#b45309',55);
      addTrail(this.sandWaveX+rand(-50,50),this.sandWaveY+rand(-50,50),'#d97706',25);
      if(tickMs%3<17)spawnParticles(this.sandWaveX+rand(-60,60),this.sandWaveY+rand(-60,60),'#d97706',2);
      if(this.sandWaveTimer===0){
        spawnShockwave(this.sandWaveX,this.sandWaveY,320,'#b45309');
        spawnParticles(this.sandWaveX,this.sandWaveY,'#b45309',120);
        forEachEnemySnapshot(e=>{
          if(e.removed)return;
          const dx=e.x-this.sandWaveX,dy=e.y-this.sandWaveY;
          if(dx*dx+dy*dy<(200+e.r)*(200+e.r)){
            e.takeDamage(this.getDamage()*4,this.sandWaveX,this.sandWaveY,false,this);
            if(!e.removed&&!e.isBoss){const dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*50;e.ky+=dy/dd*50;e.stunTimer=Math.max(e.stunTimer,90);}
          }
        });
        screenShake=25;screenFlash=25;sfxBoom();
      }
      // FIX #16: minor timers during sand wave
      if(this.eatTimer>0){this.eatTimer--;this.calories=Math.min(this.maxCalories,this.calories+100/180);}
      if(this.sakuraRegenTimer>0){this.sakuraRegenTimer--;if(this.sakuraRegenTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+8);}
      if(this.byakugoTimer>0){this.byakugoTimer--;this.byakugoHealTimer++;if(this.byakugoHealTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+10);}
      this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
      this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
      this.updateHook();
      return;
    }
    if(this.flyingBugRiding){
      // Едем на жуке — позиция задаётся из flyingBugOwner
    } else if(this.isAI)this.aiUpdate();
    else{
      const c=this.controls;let dx=0,dy=0;
      if(this.remoteInput){
        if(this.remoteInput.up)dy--;
        if(this.remoteInput.down)dy++;
        if(this.remoteInput.left)dx--;
        if(this.remoteInput.right)dx++;
      } else {
        if(keys[c.up])dy--;if(keys[c.down])dy++;
        if(keys[c.left])dx--;if(keys[c.right])dx++;
      }
      const dashKeyDown=this.dashKeys.some(k=>keys[k]);
      if(dashKeyDown&&!this._prevDashKeyState)this.tryDash(dx,dy);
      this._prevDashKeyState=dashKeyDown;
      if(this.dashTimer>0){
        this.dashTimer--;
        this.x+=this.dashVX;this.y+=this.dashVY;
        addTrail(this.x,this.y,'#67e8f9',this.r*0.6);
        // ═══ Нэдзи: во время рывка сносит снаряды вокруг ═══
        if(this.hook&&this.hook.type==='dashBurst'){
          const dashR=75;
          for(let i=enemyProjectiles.length-1;i>=0;i--){
            const ep=enemyProjectiles[i];
            if(Math.hypot(ep.x-this.x,ep.y-this.y)<dashR+ep.r){
              spawnParticles(ep.x,ep.y,'#a78bfa',3);
              enemyProjectiles.splice(i,1);
            }
          }
        }
      } else if(this.piercingFangTimer>0){
        // ═══ Пронзительный клык — вращение-сверло ═══
        if(dx||dy)this.piercingFangAim=Math.atan2(dy,dx);
        const spinSpd=this.getEffectiveSpeed()*2.8;
        this.x+=Math.cos(this.piercingFangAim)*spinSpd;
        this.y+=Math.sin(this.piercingFangAim)*spinSpd;
        this.facing=this.piercingFangAim;
        addTrail(this.x,this.y,'#d4b483',this.r*0.9);
        if(tickMs%2<17)addTrail(this.x+rand(-15,15),this.y+rand(-15,15),'#fbbf24',this.r*0.5);
      } else if(this.susanooTimer>0||this.heavenlyTimer>0||this.eatTimer>0||this.sakuraHealingActive){
        if(dx||dy)this.facing=Math.atan2(dy,dx);
      } else {
        const spd=this.getEffectiveSpeed();
        if(dx||dy){const l=Math.hypot(dx,dy);this.x+=dx/l*spd;this.y+=dy/l*spd;this.facing=Math.atan2(dy,dx);}
      }
    }
    this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
    this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
    const _mx=this.x-_oldPX,_my=this.y-_oldPY;
    if(_mx*_mx+_my*_my>2.25)addTrail(_oldPX,_oldPY,this.color,this.r*0.4);
    if(this.shurikenTimer>0)this.shurikenTimer--;
    if(this.shurikenTimer<=0&&(enemies.length+bosses.length)>0&&this.getArtifactStack('shuriken')>0){
      this.fireFumaShurikens();
      this.shurikenTimer=120;
    }
    for(const sw of this.kusanagiSwords)sw.update();
    if(this.eatTimer>0){
      this.eatTimer--;
      this.calories=Math.min(this.maxCalories,this.calories+100/180);
      if(this.eatTimer===0){spawnDamageNumber(this.x,this.y-50,'+100 КАЛОРИЙ','#fbbf24',true);}
    }
    if(this.sandVortexTimer>0){
      this.sandVortexTimer--;
      this.sandVortexTick++;
      const angleOffset=this.sandVortexTick*0.15;
      const radius=100;
      if(this.sandVortexTick<125){
        const sx=this.x+Math.cos(angleOffset)*radius;
        const sy=this.y+Math.sin(angleOffset)*radius;
        forEachEnemySnapshot(e=>{
          if(Math.hypot(e.x-sx,e.y-sy)<60){e.takeDamage(this.getDamage()*0.8,this.x,this.y,false,this);}
        });
        if(this.sandVortexTick%6===0)spawnParticles(sx,sy,'#b45309',3);
      } else {
        const proj=new Projectile(this.x,this.y,this.sandVortexAim,this.getDamage()*3,'#b45309',20,8);
        proj.attacker=this;proj.pierce=true;proj.pushes=20;
        projectiles.push(proj);
        spawnShockwave(this.x,this.y,150,'#b45309');
        this.sandVortexTimer=0;
      }
    }
    if(this.gentleFistTimer>0){
      this.gentleFistTimer--;
      this.gentleFistWaveTimer++;
      if(this.gentleFistWaveTimer>=20){
        this.gentleFistWaveTimer=0;
        const aim=this.getAutoAim();
        const proj=new Projectile(this.x,this.y,aim,this.getDamage()*2.5,'#c084fc',14,10);
        proj.attacker=this;proj.pierce=true;
        projectiles.push(proj);
      }
    }
    if(this.rollingTimer>0){
      this.rollingTimer--;
      const rollSpd=this.getEffectiveSpeed()*1.5;
      this.x+=Math.cos(this.rollingAim)*rollSpd;this.y+=Math.sin(this.rollingAim)*rollSpd;
      this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
      forEachEnemySnapshot(e=>{
        if(this.rollingHitSet.has(e))return;
        if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r+6){
          e.takeDamage(this.getDamage()*1.8,this.x,this.y,false,this);
          if(!e.removed&&!e.isBoss){const dx=e.x-this.x,dy=e.y-this.y,d=Math.hypot(dx,dy)||1;e.kx+=dx/d*18;e.ky+=dy/d*18;}
          this.rollingHitSet.add(e);
        }
      });
      addTrail(this.x,this.y,'#dc2626',12);
      if(this.rollingTimer===0)this.rollingHitSet.clear();
    }
    if(this.kyuubiComboTimer>0){this.kyuubiComboTimer--;if(this.kyuubiComboTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+3);}
    if(this.absByakuganTimer>0)this.absByakuganTimer--;
    if(this.berserkTimer>0){this.berserkTimer--;if(this.berserkTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+3);}
    if(this.byakuganTimer>0)this.byakuganTimer--;
    if(this.kaitenTimer>0)this.kaitenTimer--;
    if(this.wolfTimer>0){this.wolfTimer--;if(this.wolfRegen>0)this.hp=Math.min(this.maxHp,this.hp+this.wolfRegen/60);}
    if(this.reflectTimer>0)this.reflectTimer--;
    if(this.meleeSwipeTimer>0)this.meleeSwipeTimer--;
    if(this.drunkenTimer>0){this.drunkenTimer--;if(this.drunkenTimer===0)this.dodgeChance=0;}
    if(this.castRingTimer>0)this.castRingTimer--;
    if(this.shikamaruBuff>0)this.shikamaruBuff--;
    if(this.sakuraRegenTimer>0){this.sakuraRegenTimer--;if(this.sakuraRegenTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+8);}
    if(this.byakugoTimer>0){
      this.byakugoTimer--;
      this.byakugoHealTimer++;
      if(this.byakugoHealTimer%60===0)this.hp=Math.min(this.maxHp,this.hp+10);
    }
    // FIX #4: Врата Ли — проценты
    if(this.charId==='lee'&&this.leeGateCount>0){
      const drainsPct=[0,0.005,0.01,0.02,0.04,0.08,0.15,0.25,0.45];
      const drainPct=drainsPct[this.leeGateCount]||0;
      const drainActual=this.maxHp*drainPct;
      this.hp-=drainActual/60;
      if(tickMs%500<16)spawnDamageNumber(this.x+rand(-10,10),this.y-this.r-8,drainActual.toFixed(1),'#dc2626',false);
      if(this.hp<=0){this.hp=0;this.alive=false;spawnShockwave(this.x,this.y,150,'#dc2626');spawnParticles(this.x,this.y,'#dc2626',60);screenFlash=40;screenShake=20;spawnDamageNumber(this.x,this.y-60,'СМЕРТЬ ОТ ВРАТ','#f55',true);}
    }
    if(this.eightGatesTimer>0){
      this.eightGatesTimer--;
      if(this.eightGatesDrain>0&&this.eightGatesTimer%60===0){this.hp-=this.maxHp*this.eightGatesDrain;if(this.hp<=0){this.hp=0;this.alive=false;}}
      if(this.eightGatesTimer===0)this.eightGatesCombo=false;
    }
    if(this.butterflyTimer>0){this.butterflyTimer--;if(this.butterflyTimer%60===0){this.hp-=this.maxHp*0.01;if(this.hp<=0){this.hp=0;this.alive=false;}}}
    if(this.giantTimer>0){this.giantTimer--;if(this.giantTimer%30===0)this.hp=Math.min(this.maxHp,this.hp+8);if(this.giantTimer===0)this.giantCombo=false;}
    if(this.sageTimer>0)this.sageTimer--;
    if(this.susanooTimer>0){
      this.susanooTimer--;
      if(this.susanooTimer%30===0){
        const tgt=findNearestTarget(this,600);
        let ang=this.facing;
        if(tgt){const ta=Math.atan2(tgt.y-this.y,tgt.x-this.x);ang=ta;}
        const arrow=new Projectile(this.x,this.y,ang,this.getDamage()*2.5,'#a855f7',10,14);
        arrow.attacker=this;arrow.pierce=true;arrow.dragsEnemies=true;
        arrow.life=90;arrow.isSusanooArrow=true;
        projectiles.push(arrow);
      }
      if(this.susanooTimer%20===0){
        const targets=getAllTargetsInCone(this,this.facing,200,Math.PI/3);
        for(const e of targets)e.takeDamage(this.getDamage()*1.5,this.x,this.y,false,this);
      }
    }
    if(this.twoHeadedTimer>0)this.twoHeadedTimer--;
    if(this.fusionTimer>0){
      this.fusionTimer--;
      if(this.fusionTimer%25===0){
        forEachEnemySnapshot(e=>{
          if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r+30){
            e.takeDamage(this.getDamage()*1.2,this.x,this.y,false,this);
            if(!e.removed&&!e.isBoss){const dx=e.x-this.x,dy=e.y-this.y,d=Math.hypot(dx,dy)||1;e.kx+=dx/d*25;e.ky+=dy/d*25;}
          }
        });
      }
    }
    if(this.insectCloneTimer>0){
      this.insectCloneTimer--;
      if(this.insectCloneTimer===0){
        forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<150){e.takeDamage(this.getDamage()*4,this.x,this.y,false,this);e.parasiteStacks=Math.min(5,(e.parasiteStacks||0)+2);e.parasiteTimer=300;e.parasiteDamage=this.getDamage()*0.8;}});
        spawnShockwave(this.x,this.y,150,'#84cc16');screenShake=15;
      }
    }
    if(this.heavenlyTimer>0){
      this.heavenlyTimer--;
      for(const ep of enemyProjectiles){
        if(!ep.dead&&Math.hypot(ep.x-this.x,ep.y-this.y)<200){
          const ang=Math.atan2(ep.y-this.y,ep.x-this.x)+Math.PI;
          const proj=new Projectile(this.x,this.y,ang,ep.damage*2,'#a78bfa',ep.r,10);
          proj.attacker=this;projectiles.push(proj);
          ep.dead=true;
        }
      }
      if(this.heavenlyTimer%15===0){
        forEachEnemySnapshot(e=>{
          const dx=e.x-this.x,dy=e.y-this.y,d=Math.hypot(dx,dy)||1;
          if(d<200){
            e.takeDamage(this.getDamage()*1.5,this.x,this.y,false,this);
            if(!e.removed&&!e.isBoss){e.kx+=dx/d*20;e.ky+=dy/d*20;}
          }
        });
      }
    }
    if(this.shukakuTimer>0){
      this.shukakuTimer--;
      const stormR=220;
      forEachEnemySnapshot(e=>{
        if(e.removed)return;
        const dx=e.x-this.x,dy=e.y-this.y;
        if(dx*dx+dy*dy<(stormR+e.r)*(stormR+e.r)){
          e.slowTimer=Math.max(e.slowTimer,30);
          if(tickMs%20<17)addTrail(e.x,e.y,'#d97706',e.r*0.6);
        }
      });
      this.shukakuTailAngle=(this.shukakuTailAngle||0)+0.11;
      const tailR=this.r+60;
      const tx=this.x+Math.cos(this.shukakuTailAngle)*tailR;
      const ty=this.y+Math.sin(this.shukakuTailAngle)*tailR;
      const tailHitR=28;
      forEachEnemySnapshot(e=>{
        if(e.removed)return;
        if(e._shukakuTailTimer&&e._shukakuTailTimer>tickMs)return;
        if(Math.hypot(e.x-tx,e.y-ty)<tailHitR+e.r){
          e._shukakuTailTimer=tickMs+300;
          e.takeDamage(this.getDamage()*2,tx,ty,false,this);
          if(!e.removed&&!e.isBoss){
            const dx=e.x-tx,dy=e.y-ty,d=Math.hypot(dx,dy)||1;
            e.kx+=dx/d*35;e.ky+=dy/d*35;
          }
          spawnShockwave(tx,ty,45,'#fbbf24');
          spawnParticles(tx,ty,'#d97706',10);
        }
      });
      addTrail(tx,ty,'#b45309',18);
      addTrail(tx+rand(-6,6),ty+rand(-6,6),'#fbbf24',10);
    }
    if(this.hookTimer>0){this.hookTimer--;if(this.hookTimer===0&&this.hook&&this.hook.type==='comboCounter'){this.hookValue=0;}}
    this.updateHook();
    if(this.kaitenTimer>0){forEachEnemySnapshot(e=>{const dx2=e.x-this.x,dy2=e.y-this.y,d2=Math.hypot(dx2,dy2)||1;if(d2<this.r+e.r+30){e.kx+=dx2/d2*8;e.ky+=dy2/d2*8;}});}
	    // ═══ Пронзительный клык: урон врагам ═══
    if(this.piercingFangTimer>0){
      forEachEnemySnapshot(e=>{
        if(this.piercingFangHitSet.has(e))return;
        if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r+15){
          e.takeDamage(this.getDamage()*2,this.x,this.y,false,this);
          this.piercingFangHitSet.add(e);
          if(!e.removed&&!e.isBoss){
            const dx2=e.x-this.x,dy2=e.y-this.y,d2=Math.hypot(dx2,dy2)||1;
            e.kx+=dx2/d2*30;e.ky+=dy2/d2*30;
            e.stunTimer=Math.max(e.stunTimer,20);
          }
        }
      });
    }
    if(this.shootTimer===0&&!this.sakuraHealingActive&&this.shootBlockedTimer<=0&&!this.sakuraJumpActive&&(enemies.length+bosses.length)>0){
      this.fireAutoAttack(this.getAutoAim());
      this.shootTimer=this.getAttackDelay();
    }
    if(!this.isAI && !this.flyingBugRiding){
      // ─── Sakura: ручной стоп E и приземление SP по повторному нажатию ───
      if(this.charId==='sakura'){
        const eKey=this.abilityKeys[1];
        const ePressed=keys[eKey];
        const eJustPressed=ePressed&&!this._prevEKey;
        this._prevEKey=ePressed;
        if(this.sakuraHealingActive&&eJustPressed){
          this.sakuraHealingActive=false;this.sakuraHealingTarget=null;
          const cdMult=1-this.abilityUpgrades[1].cooldown*0.2;
          this.cooldowns[1]=Math.ceil(350*cdMult*CD_MULTIPLIER);
          spawnShockwave(this.x,this.y,80,'#4ade80');sfxCast();
        }
        const spKey=this.abilityKeys[3];
        const spPressed=keys[spKey];
        const spJustPressed=spPressed&&!this._prevSPJumpKey;
        this._prevSPJumpKey=spPressed;
        if(this.sakuraJumpActive&&spJustPressed){
          this.sakuraJumpTimer=Math.min(this.sakuraJumpTimer,1);
        }
      }
      // ─── Обычный цикл каста ───
      for(let i=0;i<4;i++){
        if(this.charId==='sakura'&&i===1&&this.sakuraHealingActive)continue;
        if(this.charId==='sakura'&&i===3&&this.sakuraJumpActive)continue;
        if(keys[this.abilityKeys[i]]&&this.cooldowns[i]<=0)this.castAbility(i);
      }
      if(keys[this.comboUltKey]){
        if(this.charId==='tenten'){if(this.comboUltCooldown===0)this.castComboUlt();}
        else if(this.comboPoints>=COMBO_COST&&this.comboUltCooldown===0)this.castComboUlt();
      }
    }
  }
  fireAutoAttack(aim){
    const au=this.autoUpgrades;
    let maxRange=380+this.getArtifactStack('kunai')*50;
    if(this.character.meleeAuto) maxRange=Math.round(140*(this.r/this.baseR))+30+this.getArtifactStack('kunai')*50;
    else if(this.charId==='tenten'&&(this.tentenStanceIndex||0)===3) maxRange=170;
    else if(this.sageTimer>0) maxRange=Math.round(380*0.75);
    else if(au.circular>0) maxRange=Math.max(maxRange,60+au.circular*20+20);
    let hasTarget=false;
    for(const e of enemies){if(!e.removed&&Math.hypot(e.x-this.x,e.y-this.y)<maxRange+e.r){hasTarget=true;break;}}
    if(!hasTarget)for(const b of bosses){if(!b.removed&&Math.hypot(b.x-this.x,b.y-this.y)<maxRange+b.r){hasTarget=true;break;}}
    if(!hasTarget)return;
    // ═══ Бумажные сюрикены Конан ═══
    const konanStacks=this.getArtifactStack('konanShuriken');
    if(konanStacks>0){
      for(let i=0;i<konanStacks;i++){
        const offset=(i-(konanStacks-1)/2)*0.15;
        const proj=new Projectile(this.x,this.y,aim+offset,this.getAutoDamage()*0.7,'#f5f5f5',6,11);
        proj.attacker=this;proj.fromAutoAttack=true;proj.isKonanPaper=true;
        projectiles.push(proj);
      }
    }
    if(this.charId==='tenten'){
      const stance=this.tentenStanceIndex||0;
      const spawnTenten=(ang,dmg,rad,spd,custom={})=>{
        const proj=new Projectile(this.x,this.y,ang,dmg,this.color,rad,spd);
        proj.attacker=this;proj.fromAutoAttack=true;
        Object.assign(proj,custom);
        if(au.ricochet>0)proj.bounces=au.ricochet;
        if(au.pierce>0)proj.pierceCount=(proj.pierceCount||0)+au.pierce+1;
        if(au.knockback>0)proj.pushes=(proj.pushes||0)+au.knockback*5;
        if(au.explosive>0)proj.explodeRadius=Math.max(proj.explodeRadius||0,30+au.explosive*30);
        if(au.slow>0)proj.appliesSlow=Math.max(proj.appliesSlow||0,au.slow*120);
        {const sp=Math.hypot(proj.vx,proj.vy);if(sp>0)proj.life=Math.floor(500/sp);}
        projectiles.push(proj);
      };
      if(stance===0){spawnTenten(aim-0.1,this.getAutoDamage()*0.9,5,11);spawnTenten(aim+0.1,this.getAutoDamage()*0.9,5,11);}
      else if(stance===1){spawnTenten(aim,this.getAutoDamage()*1.4,8,9,{explodeRadius:100});}
      else if(stance===2){spawnTenten(aim,this.getAutoDamage()*0.95,5,16,{pierce:true});spawnTenten(aim-0.18,this.getAutoDamage()*0.65,4,16,{pierce:true});spawnTenten(aim+0.18,this.getAutoDamage()*0.65,4,16,{pierce:true});}
      else {
        const range=140,halfAngle=Math.PI/2.3;
        let hitCount=0;
        forEachEnemySnapshot(e=>{
          const dx=e.x-this.x,dy=e.y-this.y,d=Math.hypot(dx,dy);
          if(d<range+e.r&&d>0){
            const ang=Math.atan2(dy,dx);
            if(Math.abs(angleDiff(ang,aim))<halfAngle){
              e.takeDamage(this.getAutoDamage()*2.2,this.x,this.y,false,this);
              if(!e.removed&&!e.isBoss){const dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*15;e.ky+=dy/dd*15;}
              hitCount++;
            }
          }
        });
        this.meleeSwipeTimer=10;this.meleeSwipeAim=aim;
        if(hitCount>0){spawnShockwave(this.x,this.y,range,'#e2e8f0');screenShake=Math.max(screenShake,5);}
      }
      return;
    }
    if(this.sageTimer>0){
      const radius=250;
      forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<radius+e.r)this.dealAutoDamage(e);});
      spawnShockwave(this.x,this.y,radius,this.color);
      return;
    }
    if(au.circular>0){
      const radius=60+au.circular*20;
      forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<radius+e.r)this.dealAutoDamage(e);});
      spawnShockwave(this.x,this.y,radius+10,this.color);
    }
if(this.character.meleeAuto){
      const range=140*(this.r/this.baseR),halfAngle=Math.PI/2.1;
      let hitCount=0;
      forEachEnemySnapshot(e=>{
        const dx=e.x-this.x,dy=e.y-this.y,d=Math.hypot(dx,dy);
        if(d<range+e.r&&d>0){const ang=Math.atan2(dy,dx);if(Math.abs(angleDiff(ang,aim))<halfAngle){this.dealAutoDamage(e);hitCount++;}}
      });
      if(hitCount>0){
        this.comboCount=Math.min(20,this.comboCount+hitCount);
        this.comboTimer=300;
      }
      if(this.hook&&this.hook.type==='comboCounter'&&hitCount>0){this.hookValue=Math.min(this.hook.max,this.hookValue+hitCount);this.hookTimer=300;}
      this.meleeSwipeTimer=8;this.meleeSwipeAim=aim;
      return;
    }
    if(this.twoHeadedTimer>0){
      for(const off of [-0.5,0.5]){
        const proj=new Projectile(this.x,this.y,aim+off,this.getAutoDamage(),this.color);
        proj.attacker=this;
        {const spd=Math.hypot(proj.vx,proj.vy);if(spd>0)proj.life=Math.floor(500/spd);}
        projectiles.push(proj);
      }
      return;
    }
    let _shR=4,_shSpd=8,_shDmg=1,_shLife=500;
    if(this.shukakuTimer>0){_shR=22;_shSpd=7;_shDmg=1.8;_shLife=700;}
    const proj=new Projectile(this.x,this.y,aim,this.getAutoDamage()*_shDmg,this.color,_shR,_shSpd);
    {const spd=Math.hypot(proj.vx,proj.vy);if(spd>0)proj.life=Math.floor(_shLife/spd);}
    if(this.shukakuTimer>0)proj.explodeRadius=Math.max(proj.explodeRadius||0,90);
    proj.attacker=this;
    if(au.ricochet>0)proj.bounces=au.ricochet;
    if(au.pierce>0)proj.pierceCount=au.pierce+1;
    if(au.knockback>0)proj.pushes=au.knockback*5;
    if(au.explosive>0)proj.explodeRadius=30+au.explosive*30;
    if(au.slow>0)proj.appliesSlow=au.slow*120;
    if(Math.random()<this.getArtifactStack('explosiveTag')*0.05)proj.explodeRadius=Math.max(proj.explodeRadius||0,30);
    if(Math.random()<this.getArtifactStack('smokeBomb')*0.05)proj.stunOnHit=60;
    proj.fromAutoAttack=true;
    projectiles.push(proj);
    if(this.byakuganTimer>0||this.absByakuganTimer>0){
      const extra=this.absByakuganTimer>0?(this.byakuganExtraTargets||3):(this.byakuganExtraTargets||2);
      const targetsInCone=getAllTargetsInCone(this,aim,500,Math.PI/3);
      let count=0;
      for(const e of targetsInCone){
        if(count>=extra)break;
        const eAng=Math.atan2(e.y-this.y,e.x-this.x);
        if(Math.abs(angleDiff(eAng,aim))>0.15){
          const p2=new Projectile(this.x,this.y,eAng,this.getAutoDamage(),this.color);
          p2.attacker=this;p2.fromAutoAttack=true;
          if(au.explosive>0)p2.explodeRadius=30+au.explosive*30;
          {const spd=Math.hypot(p2.vx,p2.vy);if(spd>0)p2.life=Math.floor(500/spd);}
          projectiles.push(p2);count++;
        }
      }
    }
  }
  applyWeakPointBonus(e,dmg){
    if(e&&e.weakPointTimer>0)dmg*=1.6;
    return dmg;
  }
  dealAutoDamage(e){
    if(e.removed)return;
    let dmg=this.getAutoDamage();
    dmg=this.applyWeakPointBonus(e,dmg);
    if(this.character.meleeAuto){
      const au=this.autoUpgrades;
      if(au.explosive>0){
        const r=30+au.explosive*30;const aoeDmg=dmg*0.4;
        forEachEnemySnapshot(o=>{if(o!==e&&!o.removed&&Math.hypot(o.x-e.x,o.y-e.y)<r)o.takeDamage(aoeDmg,this.x,this.y,false,this);});
        spawnShockwave(e.x,e.y,r,'#f97316');
      }
      if(au.knockback>0&&!e.isBoss){const dx=e.x-this.x,dy=e.y-this.y;const d=Math.hypot(dx,dy)||1;e.kx+=dx/d*au.knockback*3;e.ky+=dy/d*au.knockback*3;}
      if(au.slow>0)e.slowTimer=Math.max(e.slowTimer,90);
    }
    e.takeDamage(dmg,this.x,this.y,false,this);
    if(this.hook&&this.hook.type==='punchCharge'){this.hookValue=Math.min(3,this.hookValue+0.5);}
  }
  // FIX #2: tryDash сбрасывает таймер
    tryDash(dx,dy){
    if(this.dashCharges<=0||this.dashTimer>0)return;
    if(this.heavenlyTimer>0||this.eatTimer>0||this.sandWaveTimer>0||this.rollingTimer>0||this.sakuraHealingActive)return;
    if(this.susanooTimer>0)return;
    let ang;
    if(dx||dy)ang=Math.atan2(dy,dx);
    else ang=this.facing;
    this.dashCharges--;
    this.dashRechargeTimer=0;
    const isDashBurst=this.hook&&this.hook.type==='dashBurst';
    this.dashTimer=isDashBurst?12:10;
    const dashSpeed=this.getEffectiveSpeed()*(isDashBurst?5.5:4);
    this.dashVX=Math.cos(ang)*dashSpeed;
    this.dashVY=Math.sin(ang)*dashSpeed;
    this.facing=ang;
    this.invuln=Math.max(this.invuln,8);
    // ═══ Нэдзи: Импульс Хакке — AoE-взрыв + снос снарядов ═══
    if(isDashBurst){
      const burstR=100;
      const burstDmg=this.getDamage()*3;
      forEachEnemySnapshot(e=>{
        if(e.removed)return;
        if(Math.hypot(e.x-this.x,e.y-this.y)<burstR+e.r){
          e.takeDamage(burstDmg,this.x,this.y,false,this);
          if(!e.removed&&!e.isBoss){
            const dx2=e.x-this.x,dy2=e.y-this.y,d2=Math.hypot(dx2,dy2)||1;
            e.kx+=dx2/d2*30;e.ky+=dy2/d2*30;
            e.stunTimer=Math.max(e.stunTimer,30);
          }
        }
      });
      for(let i=enemyProjectiles.length-1;i>=0;i--){
        const ep=enemyProjectiles[i];
        if(Math.hypot(ep.x-this.x,ep.y-this.y)<burstR+ep.r){
          spawnParticles(ep.x,ep.y,'#a78bfa',4);
          enemyProjectiles.splice(i,1);
        }
      }
      spawnShockwave(this.x,this.y,burstR,'#a78bfa');
      spawnShockwave(this.x,this.y,burstR*1.3,'#c4b5fd');
      spawnParticles(this.x,this.y,'#a78bfa',30);
      sfx(600,0.15,0.10,'triangle',1.8);
    }
    spawnShockwave(this.x,this.y,45,'#a5f3fc');
    spawnParticles(this.x,this.y,'#a5f3fc',14);
    addTrail(this.x,this.y,'#67e8f9',this.r*0.8);
    screenShake=Math.max(screenShake,4);sfx(800,0.05,0.06,'sine',2);
    // ═══ Хината: −2с к КД умений после рывка (кроме SP и F) ═══
    if(this.hook&&this.hook.type==='dashCdReduce'){
      let reduced=0;
      for(let i=0;i<3;i++){
        if(this.cooldowns[i]>0){
          this.cooldowns[i]=Math.max(0,this.cooldowns[i]-120);
          reduced++;
        }
      }
      if(reduced>0){
        spawnDamageNumber(this.x,this.y-50,'−2с КД','#b8a0d4',true);
        spawnShockwave(this.x,this.y,60,'#b8a0d4');
      }
    }
  }
  endFlyingBug(){
    if(this.flyingBugRiding){
      this.flyingBugActive=false;
      this.flyingBugRiding=false;
      this.flyingBugOwner=null;
      return;
    }
    this.flyingBugActive=false;
    this.flyingBugTimer=0;
    for(const ally of players){
      if(ally!==this && ally.flyingBugRiding && ally.flyingBugOwner===this){
        ally.flyingBugActive=false;
        ally.flyingBugRiding=false;
        ally.flyingBugOwner=null;
      }
    }
    spawnShockwave(this.x,this.y,180,'#84cc16');
    spawnParticles(this.x,this.y,'#84cc16',50);
    sfxCast();
  }
  takeDamage(d, source=null){
    if(!this.alive)return;
    // ═══ Shino: защита жука от не-боссов ═══
    if(this.flyingBugActive){
      const src=source;
      const isBossSrc=src&&(src.isBoss||(src.owner&&src.owner.isBoss));
      if(!isBossSrc)return;
    }
    if(this.invuln>0)return;
    if(this._inTakeDamage)return;
    this._inTakeDamage=true;
    try{
      if(window.DEBUG.godmode)return;
      if(this.dodgeChance>0&&Math.random()<this.dodgeChance){this.invuln=8;spawnDamageNumber(this.x,this.y-25,'MISS','#86efac',false);return;}
      if(this.getArtifactStack('substitution')>0&&Math.random()<this.getArtifactStack('substitution')*0.05){
        this.invuln=Math.max(this.invuln,180);
        spawnShockwave(this.x,this.y,120,'#fbbf24');
        spawnParticles(this.x,this.y,'#fbbf24',30);
        spawnDamageNumber(this.x,this.y-50,'ЗАМЕНА!','#fbbf24',true);
        sfx(900,0.15,0.08,'sine',1.5);
        return;
      }
      if(this.reflectTimer>0&&source&&source!==this&&typeof source.takeDamage==='function'&&!source.removed){
        source.takeDamage(this.reflectDamage,this.x,this.y,false,this);
        spawnDamageNumber(source.x,source.y-(source.r||15)-15,'REFLECT','#84cc16',true);
      }
            const totalDef=this.defense+this.getArtifactStack('raikageArmor')*2-this.getArtifactStack('bloodPill')*3;
      let rd=Math.max(1,d-Math.max(0,totalDef)*2);
if(this.hook&&this.hook.type==='sand'){
        const absorb=clamp(this.timeSinceHit/60*0.05,0,0.55);
        rd*=1-absorb;
        if(absorb>0.05)spawnDamageNumber(this.x,this.y-25,`-${Math.round(absorb*100)}%`,'#d97706',false);
      }
      this.timeSinceHit=0;
      if(this.shield>0){const ab=Math.min(this.shield,rd);this.shield-=ab;rd-=ab;}
      this.hp-=rd;
      this.hurtFlash=8;this.invuln=15;
      this.killStreak=0;
      this.comboPoints=0;
      this.comboStreakTimer=0;
      if(this.hook&&this.hook.type==='comboCounter')this.hookValue=0;
      if(this.hook&&this.hook.type==='kyuubiCloak')this.hookValue=0;
      if(this.charId==='ino'){spawnPetalZone(this.x,this.y,100,120,this.getDamage()*1.2,this);}
      if(rd>0)spawnDamageNumber(this.x,this.y-25,rd,'#ff6666',false);
      else spawnDamageNumber(this.x,this.y-25,'BLOCK','#4ade80',false);
      screenShake=Math.max(screenShake,9);
      screenFlash=Math.max(screenFlash,4);
      sfxHurt();
      for(let _i=0;_i<5;_i++){const _a=Math.random()*Math.PI*2,_s=rand(2,5);emitParticle(this.x,this.y,Math.cos(_a)*_s,Math.sin(_a)*_s,20,'#ff4444',3);}
      if(this.hp<=0){
        this.hp=0;this.alive=false;this.dashTimer=0;
        spawnShockwave(this.x,this.y,180,this.color);
        spawnParticles(this.x,this.y,this.color,60);
        screenFlash=Math.max(screenFlash,20);
        if(this.flyingBugActive)this.endFlyingBug();
      }
    } finally { this._inTakeDamage=false; }
  }
  draw(){
    if(!this.alive)return;
    // ═══ Shino: аура жуков ═══
    if(this.hook&&this.hook.type==='bugAura'){
      const t=tickMs/150;
      for(let i=0;i<4;i++){
        const a=t+i*Math.PI/2;
        const r=40+Math.sin(t*2+i)*6;
        const bx=this.x+Math.cos(a)*r;
        const by=this.y+Math.sin(a)*r;
        ctx.fillStyle='#84cc16';
        ctx.beginPath();ctx.arc(bx,by,3,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#a3e635';ctx.lineWidth=1;ctx.stroke();
      }
      ctx.globalAlpha=0.15+0.05*Math.sin(t*3);
      ctx.strokeStyle='#84cc16';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(this.x,this.y,90,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
    }
    // ═══ Shino: гигантский жук под игроком ═══
        if(this.flyingBugActive && !this.flyingBugRiding){
      const t=tickMs/100;
      const bx=this.x,by=this.y+20;
      ctx.strokeStyle='#4a5a3a';ctx.lineWidth=3;
      for(let i=0;i<6;i++){
        const side=i<3?-1:1;
        const idx=i%3;
        const a=(idx-1)*0.4+side*0.8;
        const lx=bx+Math.cos(a)*30;
        const ly=by+Math.sin(a)*12+15;
        ctx.beginPath();ctx.moveTo(bx,by+8);ctx.lineTo(lx,ly);ctx.stroke();
      }
      ctx.fillStyle='#4a5a3a';
      ctx.beginPath();ctx.ellipse(bx,by+5,30,18,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#84cc16';ctx.lineWidth=2;ctx.stroke();
      ctx.globalAlpha=0.4;
      const wingA=Math.sin(t)*0.3;
      ctx.fillStyle='#a3e635';
      ctx.beginPath();ctx.ellipse(bx-30,by-5,22,10,wingA,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(bx+30,by-5,22,10,-wingA,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
      ctx.fillStyle='#ffd700';
      ctx.beginPath();ctx.arc(bx,by+5,4,0,Math.PI*2);ctx.fill();
    }
	    if(this.sakuraJumpActive){
      const r=200;
      ctx.globalAlpha=0.3+0.15*Math.sin(tickMs/80);
      ctx.fillStyle='#f472b6';ctx.beginPath();ctx.arc(this.x,this.y,r,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=0.85;
      ctx.strokeStyle='#f472b6';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(this.x,this.y,r,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(this.x-r*0.3,this.y);ctx.lineTo(this.x+r*0.3,this.y);ctx.stroke();
      ctx.beginPath();ctx.moveTo(this.x,this.y-r*0.3);ctx.lineTo(this.x,this.y+r*0.3);ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.textAlign='center';
      ctx.fillText(`${Math.ceil(this.sakuraJumpTimer/60)}с`,this.x,this.y-r-10);
      ctx.textAlign='left';ctx.globalAlpha=1;
    }
    if(this.vanishedTimer>0){
      const secLeft=Math.ceil(this.vanishedTimer/60);
      ctx.globalAlpha=0.25+0.1*Math.sin(tickMs/150);
      ctx.strokeStyle='#cbd5e1';ctx.lineWidth=3;ctx.setLineDash([8,6]);
      ctx.beginPath();ctx.arc(this.x,this.y,this.baseR+10,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha=0.6;
      ctx.fillStyle='#cbd5e1';ctx.font='bold 14px monospace';ctx.textAlign='center';
      ctx.fillText(`${secLeft}с`,this.x,this.y-this.baseR-20);
      ctx.textAlign='left';
      ctx.globalAlpha=1;
      return;
    }
    if(this.sandWaveTimer>0){
      const wR=this.sandWaveAuraR;
      ctx.globalAlpha=0.4+0.2*Math.sin(tickMs/80);
      ctx.fillStyle='#7c2d12';
      ctx.beginPath();ctx.arc(this.sandWaveX,this.sandWaveY,wR*1.25,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=0.85;
      ctx.fillStyle='#b45309';
      ctx.beginPath();ctx.arc(this.sandWaveX,this.sandWaveY,wR,0,Math.PI*2);ctx.fill();
      const rot=tickMs/200;
      for(let i=0;i<8;i++){
        const a=rot+i*Math.PI/4;
        const rr=wR*(0.55+0.35*Math.sin(tickMs/100+i));
        ctx.globalAlpha=0.75;ctx.fillStyle='#fbbf24';
        ctx.beginPath();ctx.arc(this.sandWaveX+Math.cos(a)*rr,this.sandWaveY+Math.sin(a)*rr,11,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=0.9;ctx.strokeStyle='#fbbf24';ctx.lineWidth=5;
      ctx.beginPath();ctx.arc(this.sandWaveX,this.sandWaveY,wR,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=0.4;ctx.strokeStyle='#b45309';ctx.lineWidth=2;ctx.setLineDash([10,5]);
      ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(this.sandWaveX,this.sandWaveY);ctx.stroke();
      ctx.setLineDash([]);ctx.globalAlpha=1;
      ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.textAlign='center';
      ctx.fillText(`${Math.ceil(this.sandWaveTimer/60)}с`,this.sandWaveX,this.sandWaveY-wR-15);
      ctx.textAlign='left';
    }
    const drawR=this.r;
    ctx.globalAlpha=0.35;ctx.fillStyle='#000';
    ctx.beginPath();ctx.ellipse(this.x,this.y+drawR*0.8,drawR*1.1,drawR*0.35,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    const pulse=1+0.12*Math.sin(tickMs/200);
    const ringR=(drawR+14)*pulse;
    ctx.globalAlpha=0.55;ctx.strokeStyle=this.color;ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(this.x,this.y,ringR,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=0.85;ctx.strokeStyle='#ffd700';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(this.x,this.y,ringR+4,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=0.25;
    const gg=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,ringR+4);
    gg.addColorStop(0,this.color);gg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gg;ctx.beginPath();ctx.arc(this.x,this.y,ringR+4,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
	    if(this.charId==='shikamaru'){
      const _t=tickMs/200;
      // Гравитационная тень под ногами
      ctx.globalAlpha=0.35+0.1*Math.sin(_t*1.5);
      ctx.fillStyle='#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(this.x,this.y+drawR*0.6,drawR*1.6,drawR*0.5,0,0,Math.PI*2);
      ctx.fill();
      // Тёмный градиент-ореол
      ctx.globalAlpha=0.55;
      const _grad=ctx.createRadialGradient(this.x,this.y,drawR*0.5,this.x,this.y,drawR+22);
      _grad.addColorStop(0,'rgba(139,92,246,0.45)');
      _grad.addColorStop(0.6,'rgba(30,27,75,0.25)');
      _grad.addColorStop(1,'rgba(30,27,75,0)');
      ctx.fillStyle=_grad;
      ctx.beginPath();ctx.arc(this.x,this.y,drawR+22,0,Math.PI*2);ctx.fill();
      // 4 теневых «лепестка» вокруг
      ctx.globalAlpha=0.7;
      for(let _k=0;_k<4;_k++){
        const _a=_t*0.7+_k*Math.PI/2;
        const _r=drawR+12+Math.sin(_t*3+_k)*5;
        const _px=this.x+Math.cos(_a)*_r;
        const _py=this.y+Math.sin(_a)*_r;
        ctx.fillStyle='#4c1d95';
        ctx.beginPath();
        ctx.ellipse(_px,_py,8,3,_a+Math.PI/2,0,Math.PI*2);
        ctx.fill();
      }
      // Если стоит на месте — пульсация
      if(Math.abs(this.x-this.prevX)<0.5 && Math.abs(this.y-this.prevY)<0.5){
        for(let _k=0;_k<3;_k++){
          const _prog=((_t*0.5)+_k/3)%1;
          const _r2=drawR+_prog*35;
          ctx.globalAlpha=(1-_prog)*0.5;
          ctx.strokeStyle='#8b5cf6';ctx.lineWidth=2;
          ctx.beginPath();ctx.arc(this.x,this.y,_r2,0,Math.PI*2);ctx.stroke();
        }
      }
      ctx.globalAlpha=1;
    }
    if(this.charId==='sakura'&&this.hookValue>0){
      const cr=this.hookValue/12;
      ctx.globalAlpha=0.3+0.35*Math.sin(tickMs/150)*cr;
      ctx.strokeStyle='#f472b6';ctx.lineWidth=2+cr*4;
      ctx.beginPath();ctx.arc(this.x,this.y,drawR+8+cr*12,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=0.5*cr;
      for(let _i=0;_i<Math.floor(cr*6);_i++){const _a=tickMs/400+_i*Math.PI*2/Math.max(1,Math.floor(cr*6));const _r=drawR+10+cr*15;ctx.fillStyle='#fbcfe8';ctx.beginPath();ctx.arc(this.x+Math.cos(_a)*_r,this.y+Math.sin(_a)*_r,3,0,Math.PI*2);ctx.fill();}
      const _isStanding=(Math.abs(this.x-this.prevX)<0.5&&Math.abs(this.y-this.prevY)<0.5);
      if(_isStanding&&this.hookValue<12){
        const _t=(tickMs%600)/600;
        ctx.globalAlpha=(1-_t)*0.55;
        ctx.strokeStyle='#fbcfe8';ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(this.x,this.y,drawR+12+_t*30,0,Math.PI*2);ctx.stroke();
      }
      if(this.hookValue>=12){
        ctx.globalAlpha=0.5+0.4*Math.sin(tickMs/120);
        ctx.strokeStyle='#ffd700';ctx.lineWidth=4;
        ctx.beginPath();ctx.arc(this.x,this.y,drawR+20,0,Math.PI*2);ctx.stroke();
      }
      ctx.globalAlpha=1;
    }
    if(this.charId==='tenten'){
      const cols=['#cbd5e1','#f97316','#a5f3fc','#e2e8f0'];
      const col=cols[this.tentenStanceIndex||0];
      ctx.globalAlpha=0.35+0.15*Math.sin(tickMs/200);
      ctx.strokeStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(this.x,this.y,drawR+6,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
    }
    if(this.invisibleTimer>0){ctx.globalAlpha=0.25;}
    if(this.meleeSwipeTimer>0){
      const alpha=this.meleeSwipeTimer/8;
      ctx.globalAlpha=alpha*0.7;ctx.fillStyle=this.color;
      ctx.beginPath();ctx.moveTo(this.x,this.y);
      ctx.arc(this.x,this.y,100*(drawR/this.baseR),this.meleeSwipeAim-Math.PI/2.1,this.meleeSwipeAim+Math.PI/2.1);
      ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    }
	    if(this.piercingFangTimer>0){
      const t=tickMs/30;
      ctx.globalAlpha=0.75;
      ctx.strokeStyle='#d4b483';ctx.lineWidth=4;
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(t);
      for(let i=0;i<3;i++){
        const a=i*Math.PI*2/3;
        ctx.beginPath();ctx.arc(0,0,drawR+10,a,a+Math.PI/2);ctx.stroke();
      }
      ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(0,0,drawR+18,0,Math.PI*2);ctx.stroke();
      ctx.restore();
      ctx.globalAlpha=1;
    }
    if(this.castRingTimer>0){const t=1-this.castRingTimer/12;ctx.globalAlpha=Math.max(0,1-t);ctx.strokeStyle=this.castRingColor;ctx.lineWidth=6;ctx.beginPath();ctx.arc(this.x,this.y,20+t*100,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.kyuubiComboTimer>0){ctx.globalAlpha=0.4+0.3*Math.sin(tickMs/60);ctx.fillStyle='#ff6600';ctx.beginPath();ctx.arc(this.x,this.y,drawR+28,0,Math.PI*2);ctx.fill();ctx.globalAlpha=0.7;ctx.strokeStyle='#ffcc00';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,drawR+28,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.sageTimer>0){ctx.globalAlpha=0.4+0.3*Math.sin(tickMs/50);ctx.fillStyle='#ff9900';ctx.beginPath();ctx.arc(this.x,this.y,drawR+22,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    if(this.susanooTimer>0){ctx.globalAlpha=0.5+0.2*Math.sin(tickMs/60);ctx.fillStyle='#a855f7';ctx.beginPath();ctx.arc(this.x,this.y,drawR+30,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    if(this.byakugoTimer>0){ctx.globalAlpha=0.5+0.3*Math.sin(tickMs/60);ctx.strokeStyle='#f472b6';ctx.lineWidth=5;ctx.beginPath();ctx.arc(this.x,this.y,drawR+18,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.twoHeadedTimer>0){ctx.globalAlpha=0.4+0.2*Math.sin(tickMs/50);ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(this.x,this.y,drawR+25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    if(this.fusionTimer>0){ctx.globalAlpha=0.5+0.2*Math.sin(tickMs/50);ctx.fillStyle='#d4b483';ctx.beginPath();ctx.arc(this.x,this.y,drawR+16,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    if(this.heavenlyTimer>0){
      const t=tickMs/30;
      ctx.globalAlpha=0.6;ctx.strokeStyle='#ddd6fe';ctx.lineWidth=5;
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(t);
      for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(0,0,drawR+18,i*Math.PI/2,i*Math.PI/2+Math.PI/3);ctx.stroke();}
      ctx.restore();ctx.globalAlpha=1;
    }
    if(this.shukakuTimer>0){
      const stormR=220;
      const stormGrad=ctx.createRadialGradient(this.x,this.y,drawR,this.x,this.y,stormR);
      stormGrad.addColorStop(0,'rgba(180,83,9,0.28)');
      stormGrad.addColorStop(0.55,'rgba(217,119,6,0.16)');
      stormGrad.addColorStop(1,'rgba(180,83,9,0)');
      ctx.globalAlpha=0.85+0.15*Math.sin(tickMs/120);
      ctx.fillStyle=stormGrad;
      ctx.beginPath();ctx.arc(this.x,this.y,stormR,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=0.5;
      ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;ctx.setLineDash([14,10]);
      ctx.lineDashOffset=tickMs/30;
      ctx.beginPath();ctx.arc(this.x,this.y,stormR*0.85,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([]);ctx.lineDashOffset=0;
      for(let i=0;i<10;i++){
        const a=tickMs/400+i*Math.PI*2/10;
        const rr=stormR*(0.3+0.6*Math.abs(Math.sin(tickMs/500+i)));
        ctx.globalAlpha=0.55;
        ctx.fillStyle=i%2?'#fbbf24':'#d97706';
        ctx.beginPath();ctx.arc(this.x+Math.cos(a)*rr,this.y+Math.sin(a)*rr,4,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
      const tailR=drawR+60;
      const tailAngle=this.shukakuTailAngle||0;
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(tailAngle);
      ctx.fillStyle='#c2a14a';
      ctx.beginPath();ctx.ellipse(tailR,0,44,14,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fbbf24';ctx.lineWidth=3;ctx.stroke();
      ctx.beginPath();ctx.moveTo(tailR+40,0);ctx.lineTo(tailR+62,-9);ctx.lineTo(tailR+62,9);ctx.closePath();
      ctx.fillStyle='#7c2d12';ctx.fill();
      ctx.strokeStyle='#fbbf24';ctx.stroke();
      ctx.restore();
      ctx.globalAlpha=0.4+0.2*Math.sin(tickMs/50);
      ctx.fillStyle='#c2a14a';
      ctx.beginPath();ctx.arc(this.x,this.y,drawR+18,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    }
	    if(this.shadowChokeTimer>0){
      ctx.globalAlpha=0.5+0.2*Math.sin(tickMs/80);
      ctx.strokeStyle='#8b5cf6';ctx.lineWidth=4;
      for(const e of enemies){
        if(e.removed||e.shadowWebOwner!==this||e.shadowWebTimer<=0)continue;
        ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(e.x,e.y);ctx.stroke();
      }
      for(const b of bosses){
        if(b.removed||b.shadowWebOwner!==this||b.shadowWebTimer<=0)continue;
        ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      ctx.globalAlpha=0.4+0.2*Math.sin(tickMs/80);
      ctx.fillStyle='#8b5cf6';
      ctx.beginPath();ctx.arc(this.x,this.y,this.r+25,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=0.9;
      ctx.fillStyle='#a5b4fc';ctx.font='bold 13px monospace';ctx.textAlign='center';
      ctx.fillText(`УДУШЕНИЕ`,this.x,this.y-this.r-30);
      ctx.textAlign='left';
      ctx.globalAlpha=1;
    }
    if(this.kaitenTimer>0){const angle=tickMs/25;ctx.save();ctx.translate(this.x,this.y);ctx.rotate(angle);ctx.globalAlpha=0.6;ctx.strokeStyle='#c084fc';ctx.lineWidth=4;for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(0,0,50,i*Math.PI/3,i*Math.PI/3+Math.PI/4);ctx.stroke();}ctx.globalAlpha=1;ctx.restore();}
    if(this.byakuganTimer>0){ctx.globalAlpha=0.5+0.2*Math.sin(tickMs/100);ctx.strokeStyle='#c084fc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x,this.y,drawR+8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.wolfTimer>0){ctx.globalAlpha=0.4+0.2*Math.sin(tickMs/80);ctx.fillStyle='#8b6f47';ctx.beginPath();ctx.arc(this.x,this.y,drawR+14,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    if(this.eightGatesTimer>0){
      ctx.globalAlpha=0.5+0.3*Math.sin(tickMs/40);ctx.fillStyle='#22c55e';ctx.beginPath();ctx.arc(this.x,this.y,drawR+26,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=0.8;for(let i=0;i<8;i++){const a=tickMs/200+i*Math.PI*2/8;ctx.fillStyle='#86efac';ctx.beginPath();ctx.arc(this.x+Math.cos(a)*(drawR+30),this.y+Math.sin(a)*(drawR+30),3,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;
    }
    // FIX #4: Lee gates UI — % от maxHP
    if(this.charId==='lee'&&this.leeGateCount>0&&this.eightGatesTimer===0){
      const gateColors=['#86efac','#4ade80','#22c55e','#eab308','#f97316','#dc2626','#a855f7','#ff1744'];
      const col=gateColors[this.leeGateCount-1]||'#22c55e';
      ctx.globalAlpha=0.3+0.15*Math.sin(tickMs/60);ctx.fillStyle=col;
      ctx.beginPath();ctx.arc(this.x,this.y,drawR+this.leeGateCount*3,0,Math.PI*2);ctx.fill();
      const drainsPct=[0,0.003,0.006,0.012,0.025,0.05,0.10,0.20,0.40];
      ctx.globalAlpha=0.85;ctx.fillStyle='#f55';ctx.font='bold 12px monospace';ctx.textAlign='center';
      ctx.fillText(`−${Math.round(drainsPct[this.leeGateCount]*100)}%/с`,this.x,this.y-this.r-20);
      ctx.textAlign='left';ctx.globalAlpha=1;
    }
    if(this.rollingTimer>0){ctx.globalAlpha=0.6+0.3*Math.sin(tickMs/40);ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(this.x,this.y,drawR+10,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    if(this.giantTimer>0){ctx.globalAlpha=0.35+0.15*Math.sin(tickMs/70);ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(this.x,this.y,drawR+14,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    if(this.butterflyTimer>0){
      ctx.globalAlpha=0.4+0.2*Math.sin(tickMs/50);ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(this.x,this.y,drawR+16,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=0.7;ctx.fillStyle='#fbbf24';
      ctx.beginPath();ctx.ellipse(this.x-drawR-8,this.y,drawR*0.8,drawR*0.4,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(this.x+drawR+8,this.y,drawR*0.8,drawR*0.4,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    }
    if(this.eatTimer>0){ctx.globalAlpha=0.5+0.2*Math.sin(tickMs/60);ctx.strokeStyle='#fbbf24';ctx.lineWidth=4;ctx.beginPath();ctx.arc(this.x,this.y,drawR+20,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.charId==='gaara'&&this.sandShieldCount>0){
      for(let i=0;i<this.sandShieldCount;i++){
        const a=tickMs/500+i*Math.PI*2/3;
        ctx.fillStyle='#fbbf24';ctx.globalAlpha=0.8;
        ctx.beginPath();ctx.arc(this.x+Math.cos(a)*(drawR+14),this.y+Math.sin(a)*(drawR+14),5,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    if(this.charId==='temari'){
      const lvl=this.fanLevel||1;
      for(let i=0;i<lvl;i++){
        const a=tickMs/300+i*Math.PI*2/3;
        ctx.strokeStyle='#a5f3fc';ctx.globalAlpha=0.5+lvl*0.15;ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(this.x+Math.cos(a)*(drawR+12),this.y+Math.sin(a)*(drawR+12),3+i,0,Math.PI*2);ctx.stroke();
      }
      ctx.globalAlpha=1;
    }
    if(this.shield>0){ctx.globalAlpha=0.55;ctx.strokeStyle='#4ade80';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,drawR+9,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.comboPoints>=COMBO_COST){ctx.globalAlpha=0.4+0.3*Math.sin(tickMs/80);ctx.strokeStyle='#ffd700';ctx.lineWidth=5;ctx.beginPath();ctx.arc(this.x,this.y,drawR+18,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    const bodyColor=this.twoHeadedTimer>0?'#dc2626':(this.hurtFlash>0?'#fff':this.color);
        ctx.globalAlpha=this.invisibleTimer>0?0.3:(this.sakuraJumpActive?0.45:1);
    ctx.strokeStyle='#000';ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(this.x,this.y,drawR+1,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=bodyColor;
    ctx.beginPath();ctx.arc(this.x,this.y,drawR,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font=`bold ${Math.floor(14*(drawR/this.baseR))}px monospace`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(SYMBOLS[this.charId],this.x,this.y);
    ctx.textBaseline='alphabetic';ctx.textAlign='left';
    ctx.globalAlpha=1;
    const labelY=this.y-drawR-30;
    ctx.globalAlpha=0.9;
    ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    const labelText=this.character.name+(this.isAI?' [AI]':'');
    const tw=ctx.measureText(labelText).width;
    ctx.fillStyle='rgba(0,0,0,0.7)';
    ctx.fillRect(this.x-tw/2-8,labelY-9,tw+16,18);
    ctx.strokeStyle=this.color;ctx.lineWidth=1.5;
    ctx.strokeRect(this.x-tw/2-8,labelY-9,tw+16,18);
    ctx.fillStyle=this.color;
    ctx.fillText(labelText,this.x,labelY);
    ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.globalAlpha=1;
    const bw=44,bh=5,bx=this.x-bw/2,by=this.y-drawR-12;
    ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);
    ctx.fillStyle='#e33';ctx.fillRect(bx,by,bw,bh);
    ctx.fillStyle='#3e6';ctx.fillRect(bx,by,bw*(this.hp/this.maxHp),bh);
    if(this.hook){
      const hbW=44,hbH=3;const hbX=this.x-hbW/2,hbY=by-6;
      ctx.fillStyle='#000';ctx.fillRect(hbX-1,hbY-1,hbW+2,hbH+2);
      let ratio=0;
      if(this.hook.type==='kyuubiCloak')ratio=this.hookValue/8;
      else if(this.hook.type==='punchCharge')ratio=this.hookValue/3;
      else if(this.hook.type==='byakugoSeal')ratio=(this.hookValue||0)/12;
      else if(this.hook.type==='sand')ratio=this.hookValue/this.hookMax;
      else if(this.hook.type==='gust')ratio=(this.fanLevel||1)/3;
      else if(this.hook.type==='comboCounter')ratio=this.hookValue/this.hook.max;
      else if(this.hook.type==='calories')ratio=this.calories/this.maxCalories;
      else if(this.hook.type==='seals')ratio=this.hakkeCount/8;
      else if(this.hook.type==='stances')ratio=(this.tentenStanceIndex+1)/4;
      if(ratio>0){
        let hcol=this.hook.color;
        if(this.hook.type==='stances'){const _c=['#cbd5e1','#f97316','#a5f3fc','#e2e8f0'];_c[this.tentenStanceIndex]&&(hcol=_c[this.tentenStanceIndex]);}
        ctx.fillStyle=hcol;ctx.fillRect(hbX,hbY,hbW*clamp(ratio,0,1),hbH);
      }
    }
    const arrowBase=drawR+9;
    const ax=this.x+Math.cos(this.facing)*arrowBase;
    const ay=this.y+Math.sin(this.facing)*arrowBase;
    ctx.save();ctx.translate(ax,ay);ctx.rotate(this.facing);
    ctx.fillStyle=this.isAI?'rgba(139,92,246,0.9)':'rgba(255,255,255,0.95)';
    ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(-4,-6);ctx.lineTo(-4,6);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.6)';ctx.lineWidth=1;ctx.stroke();
    ctx.restore();
    ctx.globalAlpha=1;
	    if(this.sakuraHealingActive&&this.sakuraHealingTarget){
      const tgt=this.sakuraHealingTarget;
      ctx.globalAlpha=0.7+0.2*Math.sin(tickMs/80);
      ctx.strokeStyle='#4ade80';ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(tgt.x,tgt.y);ctx.stroke();
      ctx.globalAlpha=0.5;ctx.lineWidth=2;ctx.strokeStyle='#bbf7d0';
      ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(tgt.x,tgt.y);ctx.stroke();
      ctx.globalAlpha=1;
    }
	    if(this.shootBlockedTimer>0&&this.charId==='sakura'&&!this.sakuraHealingActive){
      ctx.globalAlpha=0.4+0.3*Math.sin(tickMs/50);
      ctx.strokeStyle='#f472b6';ctx.lineWidth=4;
      const rr=this.r+15+((45-this.shootBlockedTimer)/45)*30;
      ctx.beginPath();ctx.arc(this.x,this.y,rr,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
    }
    for(const sw of this.kusanagiSwords)sw.draw();
    // ═══ Марионетки Сасори ═══
    const _sasoriStacks=this.getArtifactStack('sasoriPuppet');
    if(_sasoriStacks>0 && this.alive){
      const angBase=this.sasoriOrbitAngle||0;
      const cdActive=this.sasoriCooldown>0;
      for(let i=0;i<_sasoriStacks;i++){
        const a=angBase+i*Math.PI*2/_sasoriStacks;
        const px=this.x+Math.cos(a)*60;
        const py=this.y+Math.sin(a)*60;
        ctx.globalAlpha=cdActive?0.3:0.9;
        // Тень
        ctx.fillStyle='rgba(0,0,0,0.3)';
        ctx.beginPath();ctx.ellipse(px,py+10,10,4,0,0,Math.PI*2);ctx.fill();
        // Тело
        ctx.fillStyle='#7c2d12';
        ctx.beginPath();ctx.arc(px,py,12,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#a16207';ctx.lineWidth=2;ctx.stroke();
        // Глаз
        ctx.fillStyle=cdActive?'#666':'#fbbf24';
        ctx.beginPath();ctx.arc(px,py,3.5,0,Math.PI*2);ctx.fill();
        // Нити
        ctx.strokeStyle='rgba(162,160,130,0.4)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(px,py);ctx.stroke();
      }
      ctx.globalAlpha=1;
      if(cdActive){
        ctx.fillStyle='#f55';ctx.font='bold 10px monospace';ctx.textAlign='center';
        ctx.fillText(`${Math.ceil(this.sasoriCooldown/60)}с`,this.x,this.y+this.r+30);
        ctx.textAlign='left';
      }
    }
  }
}

