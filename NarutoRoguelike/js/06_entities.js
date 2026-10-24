"use strict";
// ==================== ENEMY PROJECTILE ====================
class ChibakuBall{
  constructor(x,y,owner){
    this.x=x;this.y=y;this.owner=owner;
    this.r=25;this.dead=false;
    this.phase='fly';this.flyTimer=25;this.pullTimer=120;this.explodeTimer=30;
    this.vx=0;this.vy=0;
    this.pullRadius=450;
    this.damage=owner.getDamage();
    this.exploded=false;
  }
  update(){
    if(this.dead)return false;
    if(this.phase==='fly'){
      this.x+=this.vx;this.y+=this.vy;
      this.vx*=0.93;this.vy*=0.93;
      this.x=clamp(this.x,ARENA.x+40,ARENA.x+ARENA.w-40);
      this.y=clamp(this.y,ARENA.y+40,ARENA.y+ARENA.h-40);
      this.flyTimer--;
      if(this.flyTimer<=0)this.phase='pull';
    } else if(this.phase==='pull'){
      this.pullTimer--;
      for(const e of enemies){
        if(e.removed)continue;
        const dx=this.x-e.x,dy=this.y-e.y,d=Math.hypot(dx,dy)||1;
        if(d<this.pullRadius){
          const pull=14*(1-d/this.pullRadius);
          e.x+=dx/d*pull;e.y+=dy/d*pull;
        }
      }
      for(const b of bosses){
        if(b.removed)continue;
        const dx=this.x-b.x,dy=this.y-b.y,d=Math.hypot(dx,dy)||1;
        if(d<this.pullRadius){
          const pull=7*(1-d/this.pullRadius);
          b.x+=dx/d*pull;b.y+=dy/d*pull;
        }
      }
      if(this.pullTimer<=0)this.phase='explode';
    } else if(this.phase==='explode'){
      this.explodeTimer--;
      if(!this.exploded&&this.explodeTimer===25){
        this.exploded=true;
        for(const e of [...enemies]){
          if(e.removed)continue;
          const d=Math.hypot(e.x-this.x,e.y-this.y);
          if(d<200){
            e.takeDamage(this.damage*5,this.x,this.y,false,this.owner);
            if(!e.removed&&!e.isBoss){
              const dx=e.x-this.x,dy=e.y-this.y,dd=Math.hypot(dx,dy)||1;
              e.kx+=dx/dd*30;e.ky+=dy/dd*30;e.stunTimer=Math.max(e.stunTimer,60);
            }
          }
        }
        for(const b of [...bosses]){
          if(b.removed)continue;
          if(Math.hypot(b.x-this.x,b.y-this.y)<220)b.takeDamage(this.damage*4,this.x,this.y,false,this.owner);
        }
        spawnShockwave(this.x,this.y,250,'#1e1b4b');
        spawnShockwave(this.x,this.y,180,'#a855f7');
        spawnShockwave(this.x,this.y,120,'#fff');
        spawnParticles(this.x,this.y,'#1e1b4b',80);
        spawnParticles(this.x,this.y,'#a855f7',40);
        screenFlash=30;screenShake=20;hitStop=8;
      }
      if(this.explodeTimer<=0){this.dead=true;return false;}
    }
    return true;
  }
  draw(){
    if(this.dead)return;
    const t=tickMs/200;
    if(this.phase==='pull'){
      ctx.globalAlpha=0.1+0.08*Math.sin(t*2);
      ctx.fillStyle='#7c3aed';
      ctx.beginPath();ctx.arc(this.x,this.y,this.pullRadius,0,Math.PI*2);ctx.fill();
      for(let i=0;i<12;i++){
        const a=t*1.5+i*Math.PI/6;
        const prog=((tickMs/30+i*90)%120)/120;
        const dist=this.pullRadius*(1-prog*0.8);
        ctx.globalAlpha=0.7*prog;
        ctx.fillStyle='#c4b5fd';
        ctx.beginPath();ctx.arc(this.x+Math.cos(a)*dist,this.y+Math.sin(a)*dist,3,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.globalAlpha=0.7;
    for(let i=0;i<3;i++){
      const r=this.r+i*12+Math.sin(t+i)*4;
      ctx.strokeStyle=i===0?'#a855f7':'#4c1d95';
      ctx.lineWidth=3-i;
      ctx.beginPath();ctx.arc(this.x,this.y,r,t+i*2,t+i*2+Math.PI*1.5);ctx.stroke();
    }
    ctx.globalAlpha=1;
    const grd=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r);
    grd.addColorStop(0,'#000');
    grd.addColorStop(0.7,'#1e1b4b');
    grd.addColorStop(1,'#7c3aed');
    ctx.fillStyle=grd;
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
  }
}
class EnemyProjectile{
    constructor(x,y,ang,dmg,r,speed,homing,owner=null){
    this.x=x;this.y=y;this.vx=Math.cos(ang)*speed;this.vy=Math.sin(ang)*speed;this.r=r;this.damage=dmg;this.homing=homing;this.life=200;this.dead=false;this.owner=owner;}
  update(){
    if(this.homing){let best=null,bd=Infinity;for(const p of players){if(!p.alive||p.sakuraJumpActive)continue;const d=dist2(this,p);if(d<bd){bd=d;best=p;}}if(best){const ta=Math.atan2(best.y-this.y,best.x-this.x);const ca=Math.atan2(this.vy,this.vx);const na=ca+clamp(angleDiff(ta,ca),-0.05,0.05);const spd=Math.hypot(this.vx,this.vy);this.vx=Math.cos(na)*spd;this.vy=Math.sin(na)*spd;}}
    this.x+=this.vx;this.y+=this.vy;this.life--;
    addTrail(this.x,this.y,this.homing?'#f43f5e':'#f59e0b',this.r*0.8);
    if(this.life<=0||this.x<ARENA.x-20||this.x>ARENA.x+ARENA.w+20||this.y<ARENA.y-20||this.y>ARENA.y+ARENA.h+20){this.dead=true;return;}
        for(const p of players){
          if(!p.alive||p.vanishedTimer>0||p.sakuraJumpActive)continue;
          if(p.flyingBugActive && !(this.owner && this.owner.isBoss)) continue;
          const dx=p.x-this.x,dy=p.y-this.y;
          if(dx*dx+dy*dy<(p.r+this.r)**2){p.takeDamage(this.damage,this.owner);this.dead=true;break;}
        }
    for(const squad of anbuSquads){for(const a of squad.members){if(!a.alive)continue;const dx=a.x-this.x,dy=a.y-this.y;if(dx*dx+dy*dy<(a.r+this.r)**2){a.takeDamage(this.damage);this.dead=true;break;}}}
  }
  draw(){
    if(this.damage===0){ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(this.x,this.y-8);ctx.lineTo(this.x,this.y+8);ctx.stroke();return;}
    if(this.homing){ctx.globalAlpha=0.4;ctx.fillStyle='#f43f5e';ctx.beginPath();ctx.arc(this.x,this.y,this.r*1.8,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    ctx.fillStyle=this.homing?'#f43f5e':'#f59e0b';
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
  }
}

// ==================== BEAM WARNING ====================
class BeamWarning{
  constructor(x,y,ang,length,width,damage,color,owner,delay){this.x=x;this.y=y;this.ang=ang;this.length=length;this.width=width;this.damage=damage;this.color=color;this.owner=owner;this.delay=delay;this.maxDelay=delay;this.dead=false;}
  update(){if(this.owner&&this.owner.removed){this.dead=true;return;}this.delay--;if(this.delay<=0){beams.push(new Beam(this.x,this.y,this.ang,this.length,this.width,this.damage,this.color,20,true,this.owner));screenShake=Math.max(screenShake,10);this.dead=true;}}
  draw(){const t=1-Math.max(0,this.delay)/this.maxDelay;const ex=this.x+Math.cos(this.ang)*this.length;const ey=this.y+Math.sin(this.ang)*this.length;ctx.globalAlpha=0.2+0.5*Math.max(0,t);ctx.strokeStyle=this.color;ctx.lineWidth=this.width*(0.3+0.7*Math.max(0,t));ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(ex,ey);ctx.stroke();ctx.globalAlpha=0.8;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(ex,ey);ctx.stroke();ctx.globalAlpha=1;}
}

// ==================== COCOON ====================
class Cocoon{
  constructor(x,y,owner){this.x=x;this.y=y;this.owner=owner;this.hp=180;this.maxHp=180;this.r=22;this.dead=false;this.decayTimer=0;this.summonTimer=0;this.hurtFlash=0;this.type='cocoon';}
  update(){if(this.dead)return false;if(this.hurtFlash>0)this.hurtFlash--;this.decayTimer++;if(this.decayTimer>=60){this.decayTimer=0;this.hp-=5;}if(this.hp<=0){this.destroy();return false;}this.summonTimer++;if(this.summonTimer>=300){this.summonTimer=0;swarms.push(new BugSwarm(this.x+rand(-30,30),this.y+rand(-30,30),this.owner));spawnShockwave(this.x,this.y,60,'#84cc16');spawnParticles(this.x,this.y,'#84cc16',20);}return true;}
  takeDamage(d){if(this.dead)return;this.hp-=d;this.hurtFlash=6;if(this.hp<=0)this.destroy();}
  destroy(){this.dead=true;spawnShockwave(this.x,this.y,120,'#84cc16');spawnParticles(this.x,this.y,'#84cc16',40);if(this.owner&&this.owner.charId==='shino')this.owner.cooldowns[2]=0;}
  draw(){if(this.dead)return;const pulse=1+0.1*Math.sin(tickMs/200);ctx.globalAlpha=0.6;ctx.fillStyle=this.hurtFlash>0?'#fff':'#84cc16';ctx.beginPath();ctx.arc(this.x,this.y,this.r*pulse,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#a3e635';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r*pulse,0,Math.PI*2);ctx.stroke();const bw=50,bh=5,bx=this.x-bw/2,by=this.y-this.r-12;ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);ctx.fillStyle='#e33';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle='#84cc16';ctx.fillRect(bx,by,bw*(this.hp/this.maxHp),bh);ctx.fillStyle='#fff';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(`🐛 ${Math.ceil(this.hp)}`,this.x,by-4);ctx.textAlign='left';}
}

// ==================== BUG SWARM ====================
class BugSwarm{
  constructor(x,y,owner){this.x=x;this.y=y;this.owner=owner;this.hp=50;this.maxHp=50;this.r=12;this.dead=false;this.life=600;this.attackCd=0;this.target=null;this.hurtFlash=0;this.type='bugswarm';}
  update(){
    if(this.dead)return false;this.life--;if(this.life<=0){this.dead=true;return false;}
    if(this.hurtFlash>0)this.hurtFlash--;
    if(!this.target||this.target.removed)this.target=findNearestTarget(this,800);
    if(this.target){const dx=this.target.x-this.x,dy=this.target.y-this.y;const d=Math.hypot(dx,dy)||1;if(d>this.r+this.target.r){this.x+=dx/d*2.8;this.y+=dy/d*2.8;addTrail(this.x,this.y,'#84cc16',3);}else if(this.attackCd<=0){this.attackCd=30;this.target.takeDamage(this.hp,this.x,this.y,false,this.owner);spawnParticles(this.x,this.y,'#84cc16',8);this.hp-=10;if(this.hp<=0){this.dead=true;return false;}}}
    if(this.attackCd>0)this.attackCd--;
    return true;
  }
  takeDamage(d){this.hp-=d;this.hurtFlash=6;if(this.hp<=0)this.dead=true;}
  draw(){if(this.dead)return;const t=tickMs/100;for(let i=0;i<3;i++){const a=t+i*Math.PI*2/3;ctx.fillStyle=this.hurtFlash>0?'#fff':'#84cc16';ctx.beginPath();ctx.arc(this.x+Math.cos(a)*6,this.y+Math.sin(a)*6,4,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#a3e635';ctx.lineWidth=1;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();if(this.hp<this.maxHp){const bw=24,bx=this.x-12,by=this.y-this.r-6;ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,4);ctx.fillStyle='#84cc16';ctx.fillRect(bx,by,bw*(this.hp/this.maxHp),2);}}
}

// ==================== ENEMY ====================
const ETYPES={
  grunt:{hp:30,speed:1.3,damage:12,r:13,color:'#e74c3c'},
  fast:{hp:18,speed:2.0,damage:8,r:10,color:'#f1c40f'},
  tank:{hp:90,speed:0.8,damage:20,r:20,color:'#8e44ad'},
  ranger:{hp:22,speed:1.1,damage:8,r:11,color:'#f59e0b'},
  kamikaze:{hp:14,speed:3.0,damage:25,r:9,color:'#ec4899'},
  charger:{hp:45,speed:1.0,damage:22,r:14,color:'#92400e'},
  summoner:{hp:55,speed:1.0,damage:10,r:16,color:'#7e22ce'},
  healer2:{hp:35,speed:1.2,damage:6,r:14,color:'#22c55e'}
};
function drawPolygon(x,y,r,sides,rot,fill){ctx.fillStyle=fill;ctx.beginPath();for(let i=0;i<sides;i++){const a=rot+i*Math.PI*2/sides;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();}
class Enemy{
  constructor(x,y,type,wv,specialType=null){
    this.x=x;this.y=y;this.removed=false;this._inTakeDamage=false;
    this.specialType=specialType;this.isMinion=false;
    if(specialType){
      const s=STYPES[specialType];
      const effWv=Math.min(wv,30);
      this.maxHp=Math.floor(s.hp*(1+effWv*0.15));this.hp=this.maxHp;
      this.speed=s.speed*(1+effWv*0.02);this.damage=s.damage+Math.floor(effWv*1.5);
      this.r=s.r;this.color=s.color;this.shape=s.shape;this.type='special';this.specialName=s.name;
      this.maxShield=(specialType==='barrierNinja')?(80+effWv*8):(specialType==='waterClone'?(30+effWv*5):0);
      this.shield=this.maxShield;this.cdCounter=0;this.minionList=[];
this.phaseTimer=240;this.isPhased=false;this.regenTimer=0;
this.substitutionCd=0;
this.poisonDropTimer=0;
this.bomberTouched=false;
// ═══ НОВЫЕ ═══
this._samuraiPhase='walk';this._samuraiTimer=0;this._samuraiBlocking=false;this._samuraiFacing=0;
this._puppetSpawnTimer=0;
this._shadowPhase='chase';this._shadowTimer=0;this._shadowDamageMult=1;
this._enraged=false;
this._trailTimer=0;
    } else {
      const t=ETYPES[type];
      const effWv=Math.min(wv,18);
      this.maxHp=Math.floor(t.hp*(1+effWv*0.15));this.hp=this.maxHp;
      this.speed=t.speed*(1+effWv*0.03);this.damage=t.damage+Math.floor(effWv*1.2);
      this.r=t.r;this.color=t.color;this.type=type;
      this.shield=0;this.maxShield=0;this.behaviorCd=0;this.chargeState=0;this.dashDir={x:0,y:0};this.summonedMinions=[];
    }
    this.touchCd=0;this.hurtFlash=0;this.kx=0;this.ky=0;
    this.burnTimer=0;this.burnDamage=0;this.slowTimer=0;this.hyperSlowTimer=0;
    this.bleedTimer=0;this.bleedDamage=0;this.markTimer=0;this.markStacks=0;
    this.curseMarks=0;this.curseTimer=0;
    this.parasiteTimer=0;this.parasiteDamage=0;this.parasiteSpreads=0;this.parasiteStacks=0;
    this.sealStacks=0;this.sealTriggered=false;
    this.weakPointTimer=0;this.shadowWebTimer=0;this.shadowWebOwner=null;
    this.vulnerableTimer=0;this.chakraBlockStacks=0;this.silenceTimer=0;
    this.stunTimer=0;this.weakenedTimer=0;
    this.mindControlTimer=0;this.mindControlOwner=null;this.mcDamageMult=1;
	this.wolfMarkTimer=0;
	this.bugMarkTimer=0;
  }
  getEffectiveDamage(){
    let d=this.damage;
    d*=1-Math.min(0.5,this.chakraBlockStacks*0.05);
    if(this.weakenedTimer>0)d*=0.5;
    if(this.parasiteStacks>0)d*=1-this.parasiteStacks*0.08;
    if(this.sealStacks>0)d*=1-this.sealStacks*0.05;
    if(this._shadowDamageMult && this._shadowDamageMult>1)d*=this._shadowDamageMult;
    return d;
  }
  // FIX #10: Минионы дают меньше монет
    reachDefenseEdge(){
    if(this.removed)return;
    defenseFailCount++;
    spawnShockwave(this.x,this.y,180,'#ff2020');
    spawnShockwave(this.x,this.y,100,'#ffffff');
    spawnParticles(this.x,this.y,'#ff2020',50);
    screenFlash=Math.max(screenFlash,25);
    screenShake=Math.max(screenShake,15);
    spawnDamageNumber(ARENA.x+ARENA.w-150,this.y,'ПРОРЫВ!','#ff2020',true);
    sfx(200,0.4,0.15,'sawtooth',0.4);
    removeEnemy(this);
    if(defenseFailCount>=DEFENSE_FAIL_MAX){
      defenseOutcome='lose';
      state='dead';
    }
  }
  giveCoins(attacker){
    let base=this.specialType?(12+Math.floor(wave*1.5)):(this.type==='tank'?(6+wave):(3+Math.floor(wave/2)));
    if(this.isMinion)base=Math.max(1,Math.floor(base*0.4));
    let awardPlayer=null;
    if(attacker){
      if(attacker.owner&&attacker.owner.coins!==undefined)awardPlayer=attacker.owner;
      else if(attacker.coins!==undefined)awardPlayer=attacker;
    }
    const award=(p)=>{
      if(!p||!p.alive)return;
      p.coins+=base;p.killStreak++;p.streakTimer=180;
      if(p.charId==='temari')p.fanKill=true;
      if(p.charId==='tenten'){p.tentenAmmo[p.tentenAmmoType||0]=Math.min(20,(p.tentenAmmo[p.tentenAmmoType||0]||0)+3);}
      if(p.hook&&p.hook.type==='kyuubiCloak')p.hookValue=Math.min(8,p.hookValue+1);
    };
    if(awardPlayer)award(awardPlayer);
    else for(const p of players)award(p);
  }
  updateSpecial(){
    const sil=this.silenceTimer>0;
    switch(this.specialType){
      case 'soundNinja':
        break;

      case 'shunshinNinja':
        if(sil)break;
        this.cdCounter++;
        if(this.cdCounter>=180){
          this.cdCounter=0;
          const alive=players.filter(p=>p.alive);
          if(alive.length>0){
            const tgt=alive[Math.floor(Math.random()*alive.length)];
            // Исчезновение с телеграфом
            spawnShockwave(this.x,this.y,60,'#8b5cf6');
            spawnParticles(this.x,this.y,'#8b5cf6',20);
            // Появление на расстоянии 100px от игрока (не вплотную)
            const a=Math.random()*Math.PI*2;
            this.x=clamp(tgt.x+Math.cos(a)*100,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
            this.y=clamp(tgt.y+Math.sin(a)*100,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
            spawnShockwave(this.x,this.y,80,'#8b5cf6');
            spawnParticles(this.x,this.y,'#8b5cf6',25);
            // Телеграф-удар: 0.5с на реакцию, радиус 70
            telegraphs.push(new Telegraph(this.x,this.y,70,30,this.getEffectiveDamage()*0.6,'#8b5cf6',this));
          }
        }
        break;

      case 'medicNinja':
        if(sil)break;
        this.cdCounter++;
        if(this.cdCounter>=60){
          this.cdCounter=0;
          const heal=5+Math.floor(wave*2);
          for(const e of enemies){
            if(e===this||e.removed)continue;
            if(Math.hypot(e.x-this.x,e.y-this.y)<250&&e.hp<e.maxHp){
              e.hp=Math.min(e.maxHp,e.hp+heal);
              spawnParticles(e.x,e.y,'#4ade80',3);
            }
          }
          addTrail(this.x,this.y,'#4ade80',30);
        }
        break;

      case 'barrierNinja':
        if(this.hurtFlash===0&&this.shield<this.maxShield){
          this.regenTimer++;
          if(this.regenTimer>=90){this.regenTimer=0;this.shield=Math.min(this.maxShield,this.shield+15+wave*4);}
        } else this.regenTimer=0;
        if(!sil){
          this.cdCounter++;
          if(this.cdCounter>=120){
            this.cdCounter=0;
            const shieldVal=15+Math.floor(wave*4);
            for(const e of enemies){
              if(e===this||e.removed)continue;
              if(Math.hypot(e.x-this.x,e.y-this.y)<200){
                e.shield=Math.max(e.shield||0,shieldVal);
                e.maxShield=Math.max(e.maxShield||0,shieldVal);
              }
            }
            spawnShockwave(this.x,this.y,200,'#3b82f6');
          }
        }
        break;

      case 'cloneMaster':
        if(sil)break;
        this.cdCounter++;
        if(this.cdCounter>=180){
          this.cdCounter=0;
          this.minionList=this.minionList.filter(m=>!m.removed);
          if(this.minionList.length<4){
            const m=new Enemy(this.x+rand(-30,30),this.y+rand(-30,30),'grunt',Math.max(1,Math.floor(wave*0.6)));
            m.isMinion=true;m.color='#a855f7';
            enemies.push(m);this.minionList.push(m);
            spawnShockwave(this.x,this.y,60,'#a855f7');
          }
        }
        break;

      case 'shadowClone':
        break;

      case 'mirrorNinja':
        break;

      case 'bloodNinja':
        break;

      case 'gravityNinja':
        if(sil)break;
        for(const p of players){
          if(!p.alive||p.sakuraJumpActive)continue;
          const dx=this.x-p.x,dy=this.y-p.y;
          const d=Math.hypot(dx,dy);
          if(d<350&&d>5){
            const force=0.5*(1-d/350);
            p.x+=dx/d*force;p.y+=dy/d*force;
            p.x=clamp(p.x,ARENA.x+p.r,ARENA.x+ARENA.w-p.r);
            p.y=clamp(p.y,ARENA.y+p.r,ARENA.y+ARENA.h-p.r);
          }
        }
        break;

      case 'poisonNinja':
        if(sil)break;
        this.poisonDropTimer++;
        if(this.poisonDropTimer>=45){
          this.poisonDropTimer=0;
          addZone(new Zone(this.x,this.y,45,180,this.getEffectiveDamage()*0.6,'#84cc16',this,'poisonGround'));
        }
        break;

      case 'curseNinja':
        if(sil)break;
        this.cdCounter++;
        if(this.cdCounter>=180){
          this.cdCounter=0;
          for(const e of enemies){
            if(e!==this&&!e.removed&&Math.hypot(e.x-this.x,e.y-this.y)<250)
              e.weakenedTimer=Math.max(e.weakenedTimer||0,180);
          }
          for(const p of players){
            if(p.alive&&!p.sakuraJumpActive&&Math.hypot(p.x-this.x,p.y-this.y)<250)
              p.takeDamage(this.getEffectiveDamage()*0.6,this);
          }
          spawnShockwave(this.x,this.y,250,'#eab308');
        }
        break;

      case 'waterClone':
        if(sil)break;
        this.cdCounter++;
        if(this.cdCounter>=250){
          this.cdCounter=0;
          this.shield=Math.max(this.shield,40+wave*3);
          this.maxShield=Math.max(this.maxShield,40+wave*3);
          const cands=enemies.filter(e=>e!==this&&!e.removed&&(e.shield||0)<10).sort((a,b)=>dist2(this,a)-dist2(this,b)).slice(0,2);
          for(const e of cands){e.shield=Math.max(e.shield||0,40+wave*3);e.maxShield=Math.max(e.maxShield||0,40+wave*3);}
          spawnShockwave(this.x,this.y,80,'#0ea5e9');
        }
        break;

case 'kunaiMaster':
  if(sil)break;
  this.cdCounter++;
  if(this.cdCounter>=120){
    this.cdCounter=0;
    const best=findNearestPlayer(this);   // ← ФИКС
    if(best){
      const ang=Math.atan2(best.y-this.y,best.x-this.x);
      enemyProjectiles.push(new EnemyProjectile(this.x,this.y,ang,this.getEffectiveDamage()*1.5,7,4,true,this));
    }
  }
  break;
case 'soundArcher':
  if(sil)break;
  this.cdCounter++;
  if(this.cdCounter>=80){
    this.cdCounter=0;
    const best=findNearestPlayer(this);   // ← ФИКС: целится в ИГРОКА
    if(best){
      const ang=Math.atan2(best.y-this.y,best.x-this.x);
      enemyProjectiles.push(new EnemyProjectile(this.x,this.y,ang,this.getEffectiveDamage()*1.8,5,12,false,this));
    }
  }
break;

      // ═══ САМУРАЙ-ОТСТУПНИК ═══
      case 'samurai':
        if(sil)break;
        this._samuraiTimer++;
        if(this._samuraiPhase==='walk'){
          this._samuraiBlocking=false;
          if(this._samuraiTimer>=120){
            this._samuraiPhase='telegraph';this._samuraiTimer=0;
            const tgt=findNearestPlayer(this,600);
            if(tgt)this._samuraiFacing=Math.atan2(tgt.y-this.y,tgt.x-this.x);
          }
        } else if(this._samuraiPhase==='telegraph'){
          this._samuraiBlocking=true;
          if(this._samuraiTimer>=45){
            const facing=this._samuraiFacing||0;
            const range=170,halfAngle=Math.PI/3;
            for(const p of players){
              if(!p.alive||p.invuln>0||p.sakuraJumpActive)continue;
              const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy);
              if(d<range&&d>0){
                const ang=Math.atan2(dy,dx);
                if(Math.abs(angleDiff(ang,facing))<halfAngle)p.takeDamage(this.getEffectiveDamage()*1.8,this);
              }
            }
            spawnShockwave(this.x+Math.cos(facing)*60,this.y+Math.sin(facing)*60,170,'#aaa');
            spawnParticles(this.x+Math.cos(facing)*80,this.y+Math.sin(facing)*80,'#aaa',30);
            screenShake=Math.max(screenShake,15);
            this._samuraiPhase='recover';this._samuraiTimer=0;
          }
        } else if(this._samuraiPhase==='recover'){
          this._samuraiBlocking=true;
          if(this._samuraiTimer>=60){this._samuraiPhase='walk';this._samuraiTimer=0;}
        }
        break;

      // ═══ КУКЛОВОД ═══
      case 'puppetMaster':
        if(sil)break;
        this.cdCounter++;
        if(this.cdCounter>=90){
          this.cdCounter=0;
          const tgt=findNearestPlayer(this,700);
          if(tgt){
            const ang=Math.atan2(tgt.y-this.y,tgt.x-this.x);
            enemyProjectiles.push(new EnemyProjectile(this.x,this.y,ang,this.getEffectiveDamage(),6,5.5,false,this));
          }
        }
        this._puppetSpawnTimer=(this._puppetSpawnTimer||0)+1;
        if(this._puppetSpawnTimer>=240){
          this._puppetSpawnTimer=0;
          this.minionList=this.minionList.filter(m=>!m.removed);
          if(this.minionList.length<2){
            const m=new Enemy(this.x+rand(-60,60),this.y+rand(-60,60),'grunt',Math.max(1,Math.floor(wave*0.8)));
            m.isMinion=true;m._isPuppet=true;m.color='#7c2d12';
            enemies.push(m);this.minionList.push(m);
            spawnShockwave(m.x,m.y,50,'#7c2d12');
          }
        }
        break;

      // ═══ ТЕНЕВОЙ УБИЙЦА ═══
      case 'shadowAssassin':
        if(sil)break;
        this._shadowTimer++;
        if(this._shadowPhase==='chase'){
          if(this._shadowTimer>=180){
            this._shadowPhase='ambush';this._shadowTimer=0;
            const tgt=findNearestPlayer(this);
            if(tgt){
              const a=tgt.facing+Math.PI+rand(-0.3,0.3);
              this.x=clamp(tgt.x+Math.cos(a)*40,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
              this.y=clamp(tgt.y+Math.sin(a)*40,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
              spawnShockwave(this.x,this.y,70,'#1e1b4b');
              spawnParticles(this.x,this.y,'#1e1b4b',20);
            }
          }
        } else if(this._shadowPhase==='ambush'){
          this.isPhased=true;   // неуязвим в стелсе
          if(this._shadowTimer>=60){
            this.isPhased=false;
            this._shadowPhase='strike';this._shadowTimer=0;
            this._shadowDamageMult=3;
            spawnShockwave(this.x,this.y,90,'#1e1b4b');
          }
        } else if(this._shadowPhase==='strike'){
          if(this._shadowTimer>=20){
            this._shadowPhase='chase';this._shadowTimer=0;
            this._shadowDamageMult=1;
          }
        }
        break;

      // ═══ ЛЖЕ-ДЖИНЧУУРИКИ ═══
      case 'fakeJinchuuriki':
        if(sil)break;
        // Жгучая аура
        for(const p of players){
          if(!p.alive||p.invuln>0||p.sakuraJumpActive)continue;
          if(Math.hypot(p.x-this.x,p.y-this.y)<this.r+30)
            p.takeDamage(this.getEffectiveDamage()*0.3,this);
        }
        this.cdCounter++;
        if(this.cdCounter>=180){
          this.cdCounter=0;
          const tgt=findNearestPlayer(this,500);
          if(tgt){
            const ang=Math.atan2(tgt.y-this.y,tgt.x-this.x);
            telegraphs.push(new Telegraph(tgt.x,tgt.y,100,40,this.getEffectiveDamage()*1.5,'#ff4400',this));
            scheduleAction(this,40,()=>{
              if(this.removed)return;
              this.x=clamp(this.x+Math.cos(ang)*300,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
              this.y=clamp(this.y+Math.sin(ang)*300,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
              spawnShockwave(this.x,this.y,120,'#ff4400');
              spawnParticles(this.x,this.y,'#ff4400',50);
              for(const p of players){
                if(!p.alive||p.invuln>0||p.sakuraJumpActive)continue;
                if(Math.hypot(p.x-this.x,p.y-this.y)<80)p.takeDamage(this.getEffectiveDamage()*2,this);
              }
            });
          }
        }
        if(this.hp<this.maxHp*0.5&&!this._enraged){
          this._enraged=true;
          this.speed*=1.5;
          this.damage=Math.floor(this.damage*1.3);
          spawnShockwave(this.x,this.y,150,'#ff3060');
          spawnDamageNumber(this.x,this.y-this.r-15,'ЯРОСТЬ!','#ff3060',true);
        }
        break;

      // ═══ КРОВАВЫЙ САСОРИ ═══
      case 'bloodySasori':
        if(sil)break;
        this._trailTimer=(this._trailTimer||0)+1;
        if(this._trailTimer>=45){
          this._trailTimer=0;
          addZone(new Zone(this.x,this.y,50,180,this.getEffectiveDamage()*0.5,'#7c2d12',this,'poisonGround'));
        }
        break;

      case 'ghostNinja':
        break;
    }
  }
  updateRegularBehavior(tgt){
    switch(this.type){
      case 'ranger':{
        this.behaviorCd++;
        if(this.behaviorCd>=90&&tgt&&this.silenceTimer===0){
          this.behaviorCd=0;
          const _ai=getEnemyAIParams(this,tgt,_tacticsCache);
          let aimX=tgt.x,aimY=tgt.y;
          if(_ai.predict>0&&tgt.aiProfile){aimX=tgt.x+tgt.aiProfile.vx*_ai.predict;aimY=tgt.y+tgt.aiProfile.vy*_ai.predict;}
          const ang=Math.atan2(aimY-this.y,aimX-this.x);
          enemyProjectiles.push(new EnemyProjectile(this.x,this.y,ang,this.getEffectiveDamage()*1.1,5,5.5,false,this));
        }
        break;
      } // FIX #9
      case 'charger':if(this.chargeState===0){this.behaviorCd++;if(this.behaviorCd>=100&&tgt){this.behaviorCd=0;this.chargeState=1;}}else if(this.chargeState===1){this.behaviorCd++;if(tgt)this.dashDir={x:tgt.x-this.x,y:tgt.y-this.y};if(this.behaviorCd>=40){this.behaviorCd=0;this.chargeState=2;const l=Math.hypot(this.dashDir.x,this.dashDir.y)||1;this.dashDir.x/=l;this.dashDir.y/=l;}}else if(this.chargeState===2){this.behaviorCd++;this.x+=this.dashDir.x*6;this.y+=this.dashDir.y*6;addTrail(this.x,this.y,'#fbbf24',8);if(this.behaviorCd>=25){this.behaviorCd=0;this.chargeState=0;}}break;
      case 'summoner':this.behaviorCd++;if(this.behaviorCd>=200){this.behaviorCd=0;this.summonedMinions=this.summonedMinions.filter(m=>!m.removed);if(this.summonedMinions.length<4){const mini=new Enemy(this.x+rand(-25,25),this.y+rand(-25,25),'grunt',Math.max(1,Math.floor(wave*0.4)));mini.isMinion=true;enemies.push(mini);this.summonedMinions.push(mini);}}break;
      case 'healer2':this.behaviorCd++;if(this.behaviorCd>=35){this.behaviorCd=0;for(const e of enemies){if(e===this)continue;if(Math.hypot(e.x-this.x,e.y-this.y)<220)e.hp=Math.min(e.maxHp,e.hp+6);}}break;
    }
  }
  update(){
    if(this.substitutionCd>0)this.substitutionCd--;
    if(this.hyperSlowTimer>0)this.hyperSlowTimer--;
    if(this.slowTimer>0)this.slowTimer--;
    if(this.markTimer>0){this.markTimer--;if(this.markTimer===0)this.markStacks=0;}
    if(this.vulnerableTimer>0)this.vulnerableTimer--;
    if(this.silenceTimer>0)this.silenceTimer--;
    if(this.weakenedTimer>0)this.weakenedTimer--;
    if(this.weakPointTimer>0)this.weakPointTimer--;
    if(this.shadowWebTimer>0)this.shadowWebTimer--;
    if(this.stunTimer>0)this.stunTimer--;
    if(this.mindControlTimer>0)this.mindControlTimer--;
		if(this.wolfMarkTimer>0)this.wolfMarkTimer--;
	if(this.bugMarkTimer>0)this.bugMarkTimer--;
    if(this.burnTimer>0){this.burnTimer--;if(this.burnTimer%15===0){this.takeDamage(this.burnDamage,this.x,this.y);if(this.removed)return;}}
    if(this.bleedTimer>0){this.bleedTimer--;if(this.bleedTimer%20===0){this.takeDamage(this.bleedDamage,this.x,this.y);if(this.removed)return;}}
    if(this.parasiteTimer>0){
      this.parasiteTimer--;
      if(this.parasiteTimer%20===0){const dmg=this.parasiteDamage*(1+(this.parasiteStacks||0)*0.3);this.takeDamage(dmg,this.x,this.y);for(const p of players)if(p.charId==='shino'&&p.alive)p.hp=Math.min(p.maxHp,p.hp+dmg*0.5);if(this.removed)return;}
      if(this.parasiteTimer===0)this.parasiteStacks=0;
    }
    if(this.stunTimer>0){if(this.kx||this.ky){this.x+=this.kx;this.y+=this.ky;this.kx*=0.85;this.ky*=0.85;}if(this.hurtFlash>0)this.hurtFlash--;return;}
	    // Призрак — фаза тикает всегда (не блокируется silence)
    if(this.specialType==='ghostNinja'){
      this.phaseTimer--;
      if(this.phaseTimer<=0){
        this.isPhased=!this.isPhased;
        this.phaseTimer=this.isPhased?60:180;
        if(!this.isPhased){
          let best=null,bd=Infinity;
          for(const p of players){if(!p.alive)continue;const d=dist2(this,p);if(d<bd){bd=d;best=p;}}
          if(best){
            const ang=Math.atan2(best.y-this.y,best.x-this.x);
            this.x+=Math.cos(ang)*70;
            this.y+=Math.sin(ang)*70;
            this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
            this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
          }
        }
        spawnShockwave(this.x,this.y,55,this.isPhased?'#94a3b8':'#f0f0f0');
      }
    }
    if(this.mindControlTimer<=0&&this.silenceTimer<=0){
      if(this.specialType)this.updateSpecial();
    }
if(this.mindControlTimer>0){
let tgt=null,bd=Infinity;
// Контролируемый враг атакует ДРУГИХ врагов, а не игроков
for(const e of enemies){
  if(e===this||e.removed)continue;
  if(e.mindControlTimer>0&&e.mindControlOwner===this.mindControlOwner)continue;
  const d=dist2(this,e);if(d<bd){bd=d;tgt=e;}
}
for(const b of bosses){
  if(b.removed)continue;
  const d=dist2(this,b);if(d<bd){bd=d;tgt=b;}
}
      if(tgt){const dx=tgt.x-this.x,dy=tgt.y-this.y;const l=Math.hypot(dx,dy)||1;this.x+=dx/l*this.speed;this.y+=dy/l*this.speed;
        if(l<this.r+tgt.r&&this.touchCd===0){tgt.takeDamage(this.getEffectiveDamage()*(this.mcDamageMult||1),this.x,this.y,false,this.mindControlOwner);this.touchCd=30;}}
      this.x+=this.kx;this.y+=this.ky;this.kx*=0.85;this.ky*=0.85;
      this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
      if(this.touchCd>0)this.touchCd--;
      if(this.hurtFlash>0)this.hurtFlash--;
      return;
    }
    let tgt=null,bd=Infinity,tgtType=null;
    if(phase==='defense'){
      // ОБОРОНА: цель — правый край, идём вправо
      tgtType='edge';
      tgt={x:ARENA.x+ARENA.w+200, y:this.y, r:10};
      bd=200*200;
      // ближайший игрок — только для ranged-стрельбы
      let combatTgt=null,cd2=Infinity;
      for(const p of players){
        if(!p.alive||p.vanishedTimer>0||p.sakuraJumpActive)continue;
        const d=dist2(this,p);if(d<cd2){cd2=d;combatTgt=p;}
      }
      this._defenseCombatTarget=combatTgt;
    } else {
      for(const sw of swarms){if(sw.dead)continue;const d=dist2(this,sw);if(d<bd){bd=d;tgt=sw;tgtType='swarm';}}
      for(const z of zones){if(!z.isDecoy||z.life<=0)continue;const d=dist2(this,z);if(d<bd){bd=d;tgt=z;tgtType='decoy';}}
      if(!tgt||bd>500*500){
        if(tgtType!=='swarm'&&tgtType!=='cocoon'){
          tgt=null;bd=Infinity;tgtType=null;
          for(const p of players){if(!p.alive||p.vanishedTimer>0||p.sakuraJumpActive)continue;const d=dist2(this,p);if(d<bd){bd=d;tgt=p;tgtType='player';}}
        }
      }
    }
    if(!this.specialType&&this.silenceTimer<=0){
      if(phase==='defense'){
        // Ranged/суммонер/хилер реагируют на игроков, но charger — нет (он бы кинулся к герою)
        if(this._defenseCombatTarget&&this.type!=='charger')this.updateRegularBehavior(this._defenseCombatTarget);
      } else if(tgtType==='player'){
        this.updateRegularBehavior(tgt);
      }
    }
    let spd=this.speed*(this.slowTimer>0?0.25:1);
    if(this.hyperSlowTimer>0)spd*=0.05;
    if(this.sealStacks>0)spd*=1-this.sealStacks*0.05;
    if(tgt&&this.chargeState!==2){
      const _ai = getEnemyAIParams(this,tgtType==='player'?tgt:null,_tacticsCache);
      // Предсказание позиции игрока
      let aimX=tgt.x, aimY=tgt.y;
      if(_ai.predict>0 && tgtType==='player' && tgt.aiProfile){
        aimX=tgt.x+tgt.aiProfile.vx*_ai.predict;
        aimY=tgt.y+tgt.aiProfile.vy*_ai.predict;
      }
      let approach=true;
      if(phase!=='defense'&&this.type==='ranger'){const l=Math.sqrt(bd);if(l<250)approach=false;}
      let forceHold=false, forceRetreat=false;
      if(_ai.prefDist!==null){
        const d=Math.hypot(aimX-this.x,aimY-this.y);
        if(d<_ai.prefDist-30){approach=false;forceRetreat=true;}
        else if(d>_ai.prefDist+30)approach=true;
        else{approach=false;forceHold=true;}
      }
      if(_ai.retreat)forceRetreat=true;
      if(forceRetreat){
        const dx=this.x-aimX,dy=this.y-aimY,l=Math.hypot(dx,dy)||1;
        this.x+=dx/l*spd;this.y+=dy/l*spd;
      } else if(forceHold){
        // держим позицию — не двигаемся
      } else if(_ai.strafe>0 && Math.random()<_ai.strafe){
        const dx=aimX-this.x,dy=aimY-this.y,l=Math.hypot(dx,dy)||1;
        const px=-dy/l,py=dx/l;
        const sign=Math.random()<0.5?-1:1;
        this.x+=px*spd*0.6*sign;this.y+=py*spd*0.6*sign;
      } else if(approach||this.type!=='ranger'){
        const dx=aimX-this.x,dy=aimY-this.y;const l=Math.hypot(dx,dy)||1;
        if(this.type==='ranger'&&l<250&&tgtType==='player'){this.x-=dx/l*spd*0.7;this.y-=dy/l*spd*0.7;}
        else{this.x+=dx/l*spd;this.y+=dy/l*spd;}
      }
      const l2=Math.hypot(tgt.x-this.x,tgt.y-this.y);
      const tgtR=tgt.r||55;
      if(l2<this.r+tgtR&&this.touchCd===0&&this.silenceTimer===0){
        if(tgtType==='decoy'){tgt.life-=40;this.touchCd=30;}
        else if(tgtType==='swarm'||tgtType==='cocoon'){tgt.takeDamage(this.getEffectiveDamage());this.touchCd=30;}
else{
  const dmg=this.getEffectiveDamage();
  tgt.takeDamage(dmg,this);
  if(this.type==='kamikaze')this.hp=0;
   if(this.specialType==='bloodNinja'&&this.silenceTimer<=0)this.hp=Math.min(this.maxHp,this.hp+dmg*0.3);
  // БОМБАРДИР: камикадзе-взрыв при касании игрока
  if(this.specialType==='soundNinja'){
    this.bomberTouched=true;
    const radius=130;
    const dmgAmt=30+wave*3;
    for(const pp of players)if(pp.alive&&Math.hypot(pp.x-this.x,pp.y-this.y)<radius)pp.takeDamage(dmgAmt,this);
    forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<radius)e.takeDamage(dmgAmt*0.3,this.x,this.y,false,this);});
    spawnShockwave(this.x,this.y,radius,'#ef4444');
    spawnParticles(this.x,this.y,'#ef4444',50);
    screenShake=Math.max(screenShake,15);
    this.hp=0;
  }
  this.touchCd=30;
}
      }
    }
    this.x+=this.kx;this.y+=this.ky;this.kx*=0.85;this.ky*=0.85;
    if(phase==='defense'){
      // Контакт с игроками по пути
      if(this.silenceTimer===0&&this.touchCd===0&&!this.removed){
        for(const p of players){
          if(!p.alive||p.vanishedTimer>0||p.sakuraJumpActive)continue;
          if(Math.hypot(p.x-this.x,p.y-this.y)<this.r+p.r){
            this.touchCd=30;
            const dmg=this.getEffectiveDamage();
            p.takeDamage(dmg,this);
            if(this.type==='kamikaze'){this.hp=0;break;}
             if(this.specialType==='bloodNinja')this.hp=Math.min(this.maxHp,this.hp+dmg*0.3);
            if(this.specialType==='soundNinja'&&!this.bomberTouched){
              this.bomberTouched=true;
              const radius=130,dmgAmt=30+wave*3;
              for(const pp of players)if(pp.alive&&Math.hypot(pp.x-this.x,pp.y-this.y)<radius)pp.takeDamage(dmgAmt,this);
              forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<radius)e.takeDamage(dmgAmt*0.3,this.x,this.y,false,this);});
              spawnShockwave(this.x,this.y,radius,'#ef4444');
              spawnParticles(this.x,this.y,'#ef4444',50);
              screenShake=Math.max(screenShake,15);
              this.hp=0;
            }
            break;
          }
        }
      }
      // Y клэмпим, X — нет (чтобы дойти до края)
      this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
      if(this.x<ARENA.x+this.r)this.x=ARENA.x+this.r;
      if(this.x+this.r>=ARENA.x+ARENA.w){
        this.reachDefenseEdge();
        return;
      }
    } else {
      this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
    }
    if(this.touchCd>0)this.touchCd--;
    if(this.hurtFlash>0)this.hurtFlash--;
    if(!this.removed&&this.speed>1.4&&tickMs%2<17)addTrail(this.x,this.y,this.color,this.r*0.5);
    if(this.hp<=0&&!this.removed)this.die(null);
  }
  die(attacker){
    if(this.removed)return;
    this.hp=0;
    this.giveCoins(attacker);
    if(attacker&&attacker.hook&&attacker.hook.type==='livingPuppet'){
      let count=0;for(const c of clones)if(c.isLivingPuppet&&c.hp>0)count++;
      if(count<4&&Math.random()<0.2){const cx=clamp(this.x+rand(-40,40),ARENA.x+20,ARENA.x+ARENA.w-20);const cy=clamp(this.y+rand(-40,40),ARENA.y+20,ARENA.y+ARENA.h-20);const c=new Clone(cx,cy,attacker,'turret',rand(0,Math.PI*2));c.life=600;c.maxLife=600;c.hp=60;c.maxHp=60;c.isLivingPuppet=true;c.color='#a16207';clones.push(c);}
    }
    if(attacker&&attacker.hook&&attacker.hook.type==='puppets'){
      let count=0;for(const e of enemies)if(e.mindControlTimer>0&&e.mindControlOwner===attacker)count++;
      if(count<3&&!this.isMinion&&Math.random()<0.3){const m=new Enemy(this.x,this.y,this.type,Math.max(1,Math.floor(wave*0.5)));m.mindControlTimer=720;m.mindControlOwner=attacker;m.mcDamageMult=2;m.color='#fbbf24';enemies.push(m);}
    }
    const _cdKiller=(attacker&&attacker.owner&&attacker.owner.coins!==undefined)?attacker.owner:attacker;
    if(_cdKiller&&_cdKiller.autoUpgrades&&_cdKiller.autoUpgrades.cdOnKill>0){
      const reduction=0.05*_cdKiller.autoUpgrades.cdOnKill;
      for(let i=0;i<4;i++)_cdKiller.cooldowns[i]=Math.max(0,_cdKiller.cooldowns[i]*(1-reduction));
    }
    // ═══ НОВОЕ: убрали частицы, оставили только 2 простых круга ═══
    spawnShockwave(this.x, this.y, this.r * 3, this.color);
    spawnShockwave(this.x, this.y, this.r * 1.5, '#fff');
    sfxBoom();
    const dx0=this.x,dy0=this.y;
    const spSpread=this.parasiteSpreads,spDamage=this.parasiteDamage,spStacks=this.parasiteStacks;
    const isKamikaze=this.type==='kamikaze';const isBomber=this.specialType==='soundNinja';const isSplitter=this.specialType==='shadowClone';
    const kamikazeRef=this;
    // ═══ КУКЛОВОД: убивает своих кукол ═══
if(this.specialType==='puppetMaster'){
  for(const m of this.minionList){
    if(!m.removed){spawnShockwave(m.x,m.y,60,'#7c2d12');m.hp=0;m.die(attacker);}
  }
}
// ═══ КРОВАВЫЙ САСОРИ: ядовитый взрыв ═══
if(this.specialType==='bloodySasori'){
  spawnShockwave(this.x,this.y,200,'#7c2d12');
  spawnParticles(this.x,this.y,'#7c2d12',60);
  for(const p of players){
    if(!p.alive||p.invuln>0||p.sakuraJumpActive)continue;
    if(Math.hypot(p.x-this.x,p.y-this.y)<200)p.takeDamage(this.getEffectiveDamage()*2,this);
  }
  addZone(new Zone(this.x,this.y,180,300,this.getEffectiveDamage()*1.5,'#7c2d12',this,'poisonGround'));
}
removeEnemy(this);
if(isKamikaze){
  const radius=90;
  const dmgAmt=30*(1+wave*0.08);
  for(const p of players)if(p.alive&&Math.hypot(p.x-dx0,p.y-dy0)<radius)p.takeDamage(dmgAmt,kamikazeRef);
  forEachEnemySnapshot(e=>{if(Math.hypot(e.x-dx0,e.y-dy0)<radius)e.takeDamage(dmgAmt*0.3,dx0,dy0,false,attacker);});
  spawnShockwave(dx0,dy0,radius,'#ec4899');screenShake=Math.max(screenShake,15);
}
if(isBomber&&!kamikazeRef.bomberTouched){
  // При смерти от урона — маленький взрыв ТОЛЬКО по врагам (помощь игроку)
  const radius=80;
  const aoeDmg=20+wave*2;
  forEachEnemySnapshot(e=>{if(Math.hypot(e.x-dx0,e.y-dy0)<radius)e.takeDamage(aoeDmg,dx0,dy0,false,attacker);});
  spawnShockwave(dx0,dy0,radius,'#ef4444');screenShake=Math.max(screenShake,8);
}
    if(isSplitter){
      for(let k=0;k<2;k++){const mini=new Enemy(dx0+rand(-20,20),dy0+rand(-20,20),'grunt',Math.max(1,Math.floor(wave*0.5)));mini.hp=mini.maxHp=Math.floor(mini.maxHp*1.5);mini.color='#f97316';mini.isMinion=true;enemies.push(mini);}
    }
    spawnShockwave(dx0,dy0,120,'#84cc16');
    if(spSpread>0){const others=enemies.filter(e=>!e.removed).sort((a,b)=>Math.hypot(a.x-dx0,a.y-dy0)-Math.hypot(b.x-dx0,b.y-dy0)).slice(0,spSpread);for(const o of others){o.parasiteTimer=300;o.parasiteDamage=spDamage;o.parasiteStacks=Math.min(5,(o.parasiteStacks||0)+1);}}
  }
  takeDamage(d,fx,fy,fromLink=false,attacker=null){
    if(this.removed)return;
    if(this.isPhased)return;
    if(this._inTakeDamage)return;
    this._inTakeDamage=true;
    try{
      // ═══ Ниндзя-Отражение: техника Замены (Каварими) ═══
      if(this.specialType==='mirrorNinja' && this.substitutionCd<=0 && Math.random()<0.4){
        this.substitutionCd=240;
        const a=Math.random()*Math.PI*2;
        this.x=clamp(this.x+Math.cos(a)*140,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
        this.y=clamp(this.y+Math.sin(a)*140,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
        spawnShockwave(this.x,this.y,100,'#06b6d4');
        spawnParticles(this.x,this.y,'#06b6d4',30);
        spawnDamageNumber(this.x,this.y-this.r-10,'ЗАМЕНА!','#06b6d4',true);
        sfx(700,0.15,0.08,'sine',1.5);
        return;
      }
      // ═══ САМУРАЙ: блок спереди ═══
      if(this.specialType==='samurai' && this._samuraiBlocking && fx!==undefined && fy!==undefined){
        const attackAng=Math.atan2(fy-this.y, fx-this.x);
        if(Math.abs(angleDiff(attackAng, this._samuraiFacing||0))<Math.PI/2){
          d*=0.3;
          spawnDamageNumber(this.x, this.y-this.r-10, 'БЛОК', '#aaa', false);
        }
      }
      // ═══ КУКЛОВОД: −50% урона, пока живы куклы ═══
      if(this.specialType==='puppetMaster'){
        this.minionList=this.minionList.filter(m=>!m.removed);
        if(this.minionList.length>0)d*=0.5;
      }
      if(this.shield>0){const ab=Math.min(this.shield,d);this.shield-=ab;d-=ab;if(d<=0)return;}
      let mult=1;
      if(this.markTimer>0)mult*=1.4;
      if(this.vulnerableTimer>0)mult*=1.3;
      if((this.curseMarks||0)>=3)mult*=1.5;
      if(fx!==undefined){for(const p of players){if(!p.alive)continue;if(p.charId==='shikamaru'&&this.stunTimer>0)mult*=1.3;if(p.charId==='ino'&&this.mindControlTimer>0)mult*=1.2;}}
      const isMarked=this.wolfMarkTimer>0;
      const critBonus=(attacker&&typeof attacker.getArtifactStack==='function')?attacker.getArtifactStack('kabutoGlasses')*0.05:0;
      let isCrit=Math.random()<(isMarked?0.5:0.15+critBonus);
      let rd=d*mult;
      if(isCrit)rd*=(isMarked?3:2);
      this.hp-=rd;this.hurtFlash=6;
      for(let _i=0;_i<4;_i++){const _a=Math.random()*Math.PI*2,_s=rand(3,7);emitParticle(this.x,this.y,Math.cos(_a)*_s,Math.sin(_a)*_s,18,_i%2?'#fff':'#ffd700',rand(2,4));}
      addTrail(this.x,this.y,'#fff',this.r*0.9);
      if(isCrit)spawnShockwave(this.x,this.y,this.r*2.2,'#ffd700');
      const dx=this.x-fx,dy=this.y-fy;const l=Math.hypot(dx,dy)||1;
      this.kx+=dx/l*2;this.ky+=dy/l*2;
      if(this.shadowWebOwner&&this.shadowWebTimer>0&&!fromLink){forEachEnemySnapshot(other=>{if(other!==this&&!other.removed&&other.shadowWebOwner===this.shadowWebOwner&&other.shadowWebTimer>0)other.takeDamage(rd*0.5,fx,fy,true,attacker);});}
      spawnDamageNumber(this.x+rand(-10,10),this.y-this.r-5,rd,isCrit?'#ffd700':'#fff',isCrit);
      if(isCrit){hitStop=Math.max(hitStop,4);sfxHit();}
      if(this.hp<=0)this.die(attacker);
    } finally { this._inTakeDamage=false; }
  }
  draw(){
    if(!this.isPhased){
      ctx.globalAlpha=0.3;
      ctx.fillStyle='#000';
      ctx.beginPath();ctx.ellipse(this.x,this.y+this.r*0.85,this.r*1.0,this.r*0.35,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    }
    const alpha=this.isPhased?0.3:1;ctx.globalAlpha=alpha;
    const fill=this.hurtFlash>0?'#fff':this.color;
    if(this.specialType&&this.shape){
      let sides=4,rot=0;
      if(this.shape==='triangle')sides=3;else if(this.shape==='square')sides=4;else if(this.shape==='pentagon')sides=5;else if(this.shape==='hexagon')sides=6;else if(this.shape==='diamond'){sides=4;rot=Math.PI/4;}
      if(this.shape==='circle'){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();}
      else drawPolygon(this.x,this.y,this.r,sides,rot-Math.PI/2,fill);
      ctx.strokeStyle='#fff';ctx.lineWidth=2;
      if(this.shape==='circle'){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();}
      else{ctx.beginPath();for(let i=0;i<sides;i++){const a=rot-Math.PI/2+i*Math.PI*2/sides;const px=this.x+Math.cos(a)*this.r,py=this.y+Math.sin(a)*this.r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.stroke();}
    } else {
      ctx.fillStyle=fill;
      if(this.type==='fast'){ctx.beginPath();ctx.moveTo(this.x,this.y-this.r);ctx.lineTo(this.x+this.r,this.y+this.r);ctx.lineTo(this.x-this.r,this.y+this.r);ctx.closePath();ctx.fill();}
      else if(this.type==='tank')drawPolygon(this.x,this.y,this.r,6,-Math.PI/6,fill);
      else if(this.type==='ranger')drawPolygon(this.x,this.y,this.r,4,Math.PI/4,fill);
      else if(this.type==='kamikaze'){ctx.beginPath();ctx.moveTo(this.x,this.y-this.r);ctx.lineTo(this.x+this.r,this.y+this.r*0.6);ctx.lineTo(this.x-this.r,this.y+this.r*0.6);ctx.closePath();ctx.fill();}
      else if(this.type==='charger'){const ang=Math.atan2(this.dashDir?.y||0,this.dashDir?.x||0);ctx.save();ctx.translate(this.x,this.y);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(this.r,0);ctx.lineTo(-this.r,this.r*0.8);ctx.lineTo(-this.r*0.5,0);ctx.lineTo(-this.r,-this.r*0.8);ctx.closePath();ctx.fill();ctx.restore();}
      else if(this.type==='summoner')drawPolygon(this.x,this.y,this.r,5,-Math.PI/2,fill);
      else if(this.type==='healer2'){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(this.x-2,this.y-6,4,12);ctx.fillRect(this.x-6,this.y-2,12,4);}
      else ctx.fillRect(this.x-this.r,this.y-this.r,this.r*2,this.r*2);
    }
    if(this.shield>0){ctx.globalAlpha=0.7;ctx.strokeStyle='#3b82f6';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r+6,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.slowTimer>0||this.hyperSlowTimer>0){ctx.strokeStyle='#a5f3fc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x,this.y,this.r+4,0,Math.PI*2);ctx.stroke();}
    if(this.curseMarks>0){
      const cursed=this.curseMarks>=3;
      if(cursed){ctx.globalAlpha=0.5+0.3*Math.sin(tickMs/80);ctx.strokeStyle='#7c3aed';ctx.lineWidth=4;ctx.beginPath();ctx.arc(this.x,this.y,this.r+8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
      for(let i=0;i<this.curseMarks;i++){const a=-Math.PI/2+i*0.8-(this.curseMarks-1)*0.4;const mx=this.x+Math.cos(a)*(this.r+14);const my=this.y+Math.sin(a)*(this.r+14);ctx.fillStyle='#7c3aed';ctx.beginPath();ctx.arc(mx,my,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();}
    }
    if(this.parasiteStacks>0){for(let i=0;i<this.parasiteStacks;i++){const a=tickMs/300+i*Math.PI*2/5;ctx.fillStyle='#84cc16';ctx.globalAlpha=0.8;ctx.beginPath();ctx.arc(this.x+Math.cos(a)*(this.r+8),this.y+Math.sin(a)*(this.r+8),2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}}
    if(this.sealStacks>0){ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillStyle='#a78bfa';ctx.fillText(`◆${this.sealStacks}`,this.x,this.y+this.r+14);ctx.textAlign='left';}
    if(this.weakPointTimer>0){const pulse=0.7+0.3*Math.sin(tickMs/80);ctx.globalAlpha=pulse;ctx.strokeStyle='#ff1744';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r+10,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
if(this.shadowWebTimer>0&&this.shadowWebOwner){
  const t=tickMs/200;
  const fx=this.shadowWebOwner.x, fy=this.shadowWebOwner.y;
  const tx=this.x, ty=this.y;
  // Точка-середина с волной
  const midX=(fx+tx)/2 + Math.sin(t)*18;
  const midY=(fy+ty)/2 + Math.cos(t*1.3)*18;
  // Внешнее свечение
  ctx.globalAlpha=0.35+0.15*Math.sin(tickMs/120);
  ctx.strokeStyle='#8b5cf6';
  ctx.lineWidth=6;
  ctx.shadowColor='#8b5cf6';ctx.shadowBlur=14;
  ctx.beginPath();ctx.moveTo(fx,fy);
  ctx.quadraticCurveTo(midX,midY,tx,ty);ctx.stroke();
  // Яркое ядро
  ctx.shadowBlur=0;
  ctx.globalAlpha=0.85;
  ctx.strokeStyle='#c4b5fd';
  ctx.lineWidth=1.8;
  ctx.beginPath();ctx.moveTo(fx,fy);
  ctx.quadraticCurveTo(midX,midY,tx,ty);ctx.stroke();
  // Бегущий «уголёк» по щупальцу
  const prog=(tickMs%1200)/1200;
  const cx=fx+(tx-fx)*prog + Math.sin(t)*18*(1-prog)*prog*4;
  const cy=fy+(ty-fy)*prog + Math.cos(t*1.3)*18*(1-prog)*prog*4;
  ctx.globalAlpha=1;
  ctx.fillStyle='#e0e7ff';
  ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
}
    if(this.stunTimer>0){const t=tickMs/200;for(let i=0;i<3;i++){const a=t+i*Math.PI*2/3;ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(this.x+Math.cos(a)*15,this.y-this.r-15+Math.sin(a)*4,3,0,Math.PI*2);ctx.fill();}}
    if(this.mindControlTimer>0){ctx.globalAlpha=0.5;ctx.strokeStyle='#fbbf24';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r+8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.bleedTimer>0){ctx.globalAlpha=0.6+0.3*Math.sin(tickMs/60);ctx.strokeStyle='#dc2626';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x,this.y,this.r+6,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
// ═══ Самурай в блоке: щит-дуга спереди ═══
if(this.specialType==='samurai' && this._samuraiBlocking){
  const facing=this._samuraiFacing||0;
  ctx.globalAlpha=0.6;
  ctx.strokeStyle='#fff';ctx.lineWidth=4;
  ctx.beginPath();
  ctx.arc(this.x,this.y,this.r+8,facing-Math.PI/2,facing+Math.PI/2);
  ctx.stroke();
  ctx.globalAlpha=0.25;
  ctx.fillStyle='#6b7280';
  ctx.beginPath();ctx.arc(this.x,this.y,this.r+10,0,Math.PI*2);ctx.fill();
}
    ctx.globalAlpha=1;
    if(enemyTier>=2){
      ctx.fillStyle=TIER_INFO[enemyTier].color;
      ctx.beginPath();ctx.arc(this.x+this.r*0.7,this.y-this.r*0.7,3,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#000';ctx.lineWidth=1;ctx.stroke();
    }
    if(this.hp<this.maxHp||this.specialType){
      const bw=Math.max(30,this.r*2.2),bh=4;const bx=this.x-bw/2,by=this.y-this.r-10;
      ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);
      ctx.fillStyle='#e33';ctx.fillRect(bx,by,bw,bh);
      ctx.fillStyle=this.specialType?'#ffd700':'#3e6';ctx.fillRect(bx,by,bw*(this.hp/this.maxHp),bh);
    }
    if(this.specialType){ctx.fillStyle='#ffd700';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(this.specialName,this.x,this.y-this.r-15);ctx.textAlign='left';}
    // ═══ Волчья метка: пульсирующее кольцо + эмодзи ═══
       // ═══ Метка жуков Шино ═══
    if(this.bugMarkTimer>0){
      const pulse=0.7+0.3*Math.sin(tickMs/100);
      ctx.globalAlpha=pulse;
      ctx.strokeStyle='#84cc16';ctx.lineWidth=2;
      ctx.setLineDash([4,3]);ctx.lineDashOffset=-tickMs/50;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r+12,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([]);ctx.lineDashOffset=0;
      ctx.globalAlpha=0.9;
      ctx.fillStyle='#84cc16';ctx.font='bold 14px monospace';
      ctx.textAlign='center';
      ctx.fillText('🐛',this.x,this.y-this.r-24);
      ctx.textAlign='left';
      ctx.globalAlpha=1;
    }
    // ═══ Волчья метка: пульсирующее кольцо + эмодзи ═══
    if(this.wolfMarkTimer>0){
      const pulse=0.6+0.4*Math.sin(tickMs/80);
      ctx.globalAlpha=0.7*pulse+0.3;
      ctx.strokeStyle='#d4b483';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r+12,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=0.5*pulse;
      ctx.strokeStyle='#fbbf24';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r+18,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
      ctx.fillStyle='#d4b483';ctx.font='bold 14px monospace';
      ctx.textAlign='center';
      ctx.fillText('🎯',this.x,this.y-this.r-24);
      ctx.textAlign='left';
    }
  }
}

// ==================== BOSS ====================
class Boss{
  constructor(x,y,bossKey,wv){
    const def=BOSSES[bossKey];this.key=bossKey;this.def=def;this.isBoss=true;
    this.x=x;this.y=y;this.r=def.r;this.color=def.color;this.name=def.name;this.tails=def.tails;
    this.speed=def.speed;this.contactDamage=def.contactDamage;
    const bossCycle=Math.max(0,Math.floor((wv-12)/12));
    // FIX #3: Кап роста HP (не более 32x)
    const bossMult=Math.min(32,Math.pow(2,bossCycle));
    this.maxHp=Math.floor((900+wv*80)*10*bossMult);this.hp=this.maxHp;this.phase=0;this.removed=false;this.hurtFlash=0;
    this.introTimer=120;this.phaseTransitionTimer=0;this.attackCd=90;
    this.dashVX=0;this.dashVY=0;this.dashTimer=0;this.touchCd=0;
    this.slowTimer=0;this.stunTimer=0;this.burnTimer=0;this.burnDamage=0;
    this.bleedTimer=0;this.bleedDamage=0;this.parasiteTimer=0;this.parasiteDamage=0;this.parasiteStacks=0;
    this.markTimer=0;this.markStacks=0;this.curseMarks=0;this.curseTimer=0;
    this.sealStacks=0;this.sealTriggered=false;this.weakPointTimer=0;this.shadowWebTimer=0;this.shadowWebOwner=null;
    this.vulnerableTimer=0;this.hyperSlowTimer=0;this.silenceTimer=0;
    this.chakraBlockStacks=0;this.weakenedTimer=0;this.shield=0;
    this.charging=false;this.chargeTimer=0;this.pendingAttack=null;
    this._inTakeDamage=false;this.contactDamageCooldown=0;
		this.wolfMarkTimer=0;
	this.bugMarkTimer=0;
  }
  getEffectiveDamage(){return this.contactDamage;}
  getSpeed(){return this.speed*(this.slowTimer>0?0.35:1)*(1+this.phase*0.25);}
  update(){
    if(this.removed)return;
    if(this.introTimer>0){this.introTimer--;if(this.introTimer%6===0)spawnParticles(this.x+rand(-this.r,this.r),this.y+rand(-this.r,this.r),this.color,3);return;}
    if(this.phaseTransitionTimer>0){this.phaseTransitionTimer--;screenShake=Math.max(screenShake,6);if(this.phaseTransitionTimer%4===0)spawnParticles(this.x+rand(-100,100),this.y+rand(-100,100),this.color,4);return;}
    if(this.slowTimer>0)this.slowTimer--;if(this.stunTimer>0)this.stunTimer--;
    if(this.markTimer>0){this.markTimer--;if(this.markTimer===0)this.markStacks=0;}
    if(this.vulnerableTimer>0)this.vulnerableTimer--;if(this.hurtFlash>0)this.hurtFlash--;
    if(this.contactDamageCooldown>0)this.contactDamageCooldown--;
    if(this.hyperSlowTimer>0)this.hyperSlowTimer--;if(this.silenceTimer>0)this.silenceTimer--;
    if(this.weakenedTimer>0)this.weakenedTimer--;if(this.weakPointTimer>0)this.weakPointTimer--;
		if(this.wolfMarkTimer>0)this.wolfMarkTimer--;
	if(this.bugMarkTimer>0)this.bugMarkTimer--;
    if(this.burnTimer>0){this.burnTimer--;if(this.burnTimer%15===0)this.takeDamage(this.burnDamage,this.x,this.y);}
    if(this.bleedTimer>0){this.bleedTimer--;if(this.bleedTimer%20===0)this.takeDamage(this.bleedDamage,this.x,this.y);}
    if(this.parasiteTimer>0){this.parasiteTimer--;if(this.parasiteTimer%20===0){const dmg=this.parasiteDamage*(1+(this.parasiteStacks||0)*0.3);this.takeDamage(dmg,this.x,this.y);}if(this.parasiteTimer===0)this.parasiteStacks=0;}
    if(this.removed)return;
    const pct=this.hp/this.maxHp;let target=0;
    if(pct<=0.33)target=2;else if(pct<=0.66)target=1;
    if(target>this.phase){this.phase=target;this.phaseTransitionTimer=60;this.attackCd=50;hitStop=10;spawnShockwave(this.x,this.y,this.r*4,this.color);for(let i=0;i<80;i++){const a=Math.random()*Math.PI*2,sp=rand(3,10);emitParticle(this.x,this.y,Math.cos(a)*sp,Math.sin(a)*sp,60,this.color,rand(3,7));}return;}
    if(this.dashTimer>0){this.dashTimer--;this.x+=this.dashVX;this.y+=this.dashVY;this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
if(this.contactDamageCooldown===0){for(const p of players){if(!p.alive||p.vanishedTimer>0||p.sakuraJumpActive)continue;
  if(Math.hypot(p.x-this.x,p.y-this.y)<this.r+p.r){p.takeDamage(this.contactDamage*1.5,this);this.contactDamageCooldown=30;}}}
    return;
    }
    if(this.stunTimer>0)return;
let tgt=null,bd=Infinity;
for(const p of players){if(!p.alive||p.sakuraJumpActive)continue;const d=dist2(this,p);if(d<bd){bd=d;tgt=p;}}
    if(tgt){const dx=tgt.x-this.x,dy=tgt.y-this.y;const d=Math.hypot(dx,dy)||1;const spd=this.getSpeed();
      if(d>120){this.x+=dx/d*spd;this.y+=dy/d*spd;}
      this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
      if(d<this.r+tgt.r&&this.contactDamageCooldown===0){tgt.takeDamage(this.contactDamage,this);this.contactDamageCooldown=60;}
    }
    if(this.charging){
      this.chargeTimer--;
      if(this.chargeTimer<=0){
        this.charging=false;
        const fn=BOSS_ATTACKS[this.pendingAttack.fn];
        const dmgMult=[1,1.35,1.7][this.phase]||1;
        const opts=Object.assign({},this.pendingAttack.opts||{});
        if(opts.dmg)opts.dmg=Math.floor(opts.dmg*dmgMult);
        if(this.phase>=1){if(opts.n)opts.n=Math.floor(opts.n*1.3);if(opts.waves)opts.waves+=1;}
        if(this.phase>=2){
          if(opts.n)opts.n=Math.floor(opts.n*1.15);
          scheduleAction(this,20,()=>{
            if(this.removed)return;
            const extra=this.def.attacks[Math.floor(Math.random()*this.def.attacks.length)];
            const fn2=BOSS_ATTACKS[extra.fn];
            if(fn2)fn2(this,tgt,extra.opts);
          });
        }
        if(fn)fn(this,tgt,opts);
        const cdMult=[1.0,0.65,0.4][this.phase]||1;
        this.attackCd=Math.floor(this.pendingAttack.cd*cdMult);
      }
      return;
    }
    this.attackCd--;
    if(this.attackCd<=0){const pool=this.def.attacks;const idx=Math.floor(Math.random()*pool.length);this.pendingAttack=pool[idx];this.charging=true;this.chargeTimer=35;}
  }
  // FIX #11: hitStop для боссов при крите
  takeDamage(d,fx,fy,fromLink=false,attacker=null,isExecution=false){
    if(this.removed||this.phaseTransitionTimer>0||this.introTimer>0)return;
    if(this._inTakeDamage)return;
    this._inTakeDamage=true;
    try{
      const cap=isExecution?this.maxHp*0.4:this.maxHp*0.18;
      if(d>cap)d=cap;
      if(this.shield>0){const absorbed=Math.min(this.shield,d);this.shield-=absorbed;d-=absorbed;}
      let mult=1;
      if(this.markTimer>0)mult*=1.4;
      if(this.vulnerableTimer>0)mult*=1.3;
      if(this.weakenedTimer>0)mult*=0.5;
      if((this.curseMarks||0)>=3)mult*=1.5;
      const isMarked=this.wolfMarkTimer>0;
      const critBonus=(attacker&&typeof attacker.getArtifactStack==='function')?attacker.getArtifactStack('kabutoGlasses')*0.05:0;
      const isCrit=Math.random()<(isMarked?0.5:0.15+critBonus);
      let rd=d*mult;
      if(isCrit)rd*=(isMarked?3:2);
      const cap2=isExecution?this.maxHp*0.4:this.maxHp*0.18;if(rd>cap2)rd=cap2;
      this.hp-=rd;this.hurtFlash=6;
      for(let _i=0;_i<6;_i++){const _a=Math.random()*Math.PI*2,_s=rand(3,9);emitParticle(this.x,this.y,Math.cos(_a)*_s,Math.sin(_a)*_s,22,_i%2?'#fff':'#ffd700',rand(2,5));}
      if(isCrit){spawnShockwave(this.x,this.y,this.r*1.8,'#ffd700');hitStop=Math.max(hitStop,3);sfxHit();}
      if(this.shadowWebOwner&&this.shadowWebTimer>0&&!fromLink){
        forEachEnemySnapshot(other=>{
          if(other!==this&&!other.removed&&other.shadowWebOwner===this.shadowWebOwner&&other.shadowWebTimer>0)
            other.takeDamage(rd*0.5,fx,fy,true,attacker);
        });
      }
      spawnDamageNumber(this.x+rand(-25,25),this.y-this.r-5,rd,isCrit?'#ffd700':'#fff',isCrit);
      if(this.hp<=0)this.die(attacker);
    } finally { this._inTakeDamage=false; }
  }
  die(attacker){
    if(this.removed)return;
    this.removed=true;this.hp=0;
    for(const p of players){if(!p.alive)continue;p.coins+=250;p.killStreak+=10;p.streakTimer=300;if(p.charId==='temari')p.fanKill=true;}
    spawnShockwave(this.x,this.y,500,this.color);
    for(let i=0;i<200;i++){const a=Math.random()*Math.PI*2,sp=rand(4,18);emitParticle(this.x,this.y,Math.cos(a)*sp,Math.sin(a)*sp,90,i%3===0?'#fff':this.color,rand(3,9));}
    hitStop=25;
    sfx(80,0.7,0.25,'sawtooth',0.3);
    const idx=bosses.indexOf(this);if(idx>=0)bosses.splice(idx,1);
  }
  draw(){
    if(this.removed)return;
    const auraR=this.r+20+Math.sin(tickMs/150)*8;
    ctx.globalAlpha=0.2+0.1*Math.sin(tickMs/200);ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,auraR,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    if(this.charging){const chargeRatio=1-this.chargeTimer/35;ctx.globalAlpha=0.4+0.4*chargeRatio;ctx.strokeStyle='#ff3030';ctx.lineWidth=4+chargeRatio*6;ctx.beginPath();ctx.arc(this.x,this.y,this.r+15+chargeRatio*20,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=0.3+0.3*chargeRatio;ctx.fillStyle='#ff3030';ctx.beginPath();ctx.arc(this.x,this.y,this.r+10,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    ctx.fillStyle=this.hurtFlash>0?'#fff':this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke();
    const tailAngle=tickMs/500;
    for(let i=0;i<this.tails;i++){const a=tailAngle+i*Math.PI*2/this.tails;const tr=this.r+20;ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x+Math.cos(a)*tr,this.y+Math.sin(a)*tr,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
    ctx.fillStyle='#fff';ctx.font=`bold ${Math.floor(this.r*0.9)}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(this.tails),this.x,this.y);ctx.textBaseline='alphabetic';ctx.textAlign='left';
    if(this.phaseTransitionTimer>0){ctx.globalAlpha=Math.min(1,this.phaseTransitionTimer/30);ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(this.x,this.y,this.r+30+(60-this.phaseTransitionTimer),0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if((this.curseMarks||0)>=3){ctx.globalAlpha=0.5+0.3*Math.sin(tickMs/80);ctx.strokeStyle='#7c3aed';ctx.lineWidth=4;ctx.beginPath();ctx.arc(this.x,this.y,this.r+8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.weakPointTimer>0){const pulse=0.7+0.3*Math.sin(tickMs/80);ctx.globalAlpha=pulse;ctx.strokeStyle='#ff1744';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r+10,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(this.sealStacks>0){ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillStyle='#a78bfa';ctx.fillText(`◆${this.sealStacks}`,this.x,this.y+this.r+20);ctx.textAlign='left';}
    if(this.bleedTimer>0){ctx.globalAlpha=0.6;ctx.strokeStyle='#dc2626';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r+4,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    
       // ═══ Метка жуков Шино ═══
    if(this.bugMarkTimer>0){
      const pulse=0.7+0.3*Math.sin(tickMs/100);
      ctx.globalAlpha=pulse;
      ctx.strokeStyle='#84cc16';ctx.lineWidth=3;
      ctx.setLineDash([6,4]);ctx.lineDashOffset=-tickMs/50;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r+14,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([]);ctx.lineDashOffset=0;
      ctx.globalAlpha=0.9;
      ctx.fillStyle='#84cc16';ctx.font='bold 20px monospace';
      ctx.textAlign='center';
      ctx.fillText('🐛',this.x,this.y-this.r-30);
      ctx.textAlign='left';
      ctx.globalAlpha=1;
    }
    // ═══ Волчья метка на боссе ═══
    if(this.wolfMarkTimer>0){
      const pulse=0.6+0.4*Math.sin(tickMs/80);
      ctx.globalAlpha=0.7*pulse+0.3;
      ctx.strokeStyle='#d4b483';ctx.lineWidth=4;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r+16,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=0.5*pulse;
      ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r+26,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
      ctx.fillStyle='#d4b483';ctx.font='bold 20px monospace';
      ctx.textAlign='center';
      ctx.fillText('🎯',this.x,this.y-this.r-32);
      ctx.textAlign='left';
    }
  }
}

// ==================== PROJECTILE ====================
// ==================== KUSANAGI SWORD ====================
class KusanagiSword{
  constructor(owner,offset){
    this.owner=owner;this.offset=offset;this.angle=offset;
    this.radius=85;this.x=owner.x;this.y=owner.y;
    this.hitCd={};this.dead=false;this.r=14;
  }
  update(){
    if(!this.owner.alive){this.dead=true;return false;}
    this.angle+=0.08;
    this.x=this.owner.x+Math.cos(this.angle)*this.radius;
    this.y=this.owner.y+Math.sin(this.angle)*this.radius;
    const damage=this.owner.getDamage()*1.5;
    forEachEnemySnapshot(e=>{
      if(e.removed)return;
      if(this.hitCd[e]&&this.hitCd[e]>tickMs)return;
      if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r){
        e.takeDamage(damage,this.x,this.y,false,this.owner);
        this.hitCd[e]=tickMs+400;
        spawnParticles(this.x,this.y,'#e2e8f0',4);
      }
    });
    return true;
  }
  draw(){
    ctx.globalAlpha=0.85;
    ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle+Math.PI/2);
    ctx.shadowColor='#e2e8f0';ctx.shadowBlur=12;
    ctx.fillStyle='#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(0,-this.r*1.3);
    ctx.lineTo(this.r*0.3,this.r*0.6);
    ctx.lineTo(0,this.r);
    ctx.lineTo(-this.r*0.3,this.r*0.6);
    ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();ctx.globalAlpha=1;
  }
}	
class Projectile{
  constructor(x,y,ang,dmg,col,r=4,speed=8,pierce=false){
    this.x=x;this.y=y;this.vx=Math.cos(ang)*speed;this.vy=Math.sin(ang)*speed;
    this.r=r;this.damage=dmg;this.color=col;this.life=120;this.dead=false;this.pierce=pierce;
    this.hitSet=new Set();this.bounces=0;
    this.appliesCurse=false;this.curseDuration=999999;
    this.appliesParasite=false;this.spreadsOnDeath=0;
    this.appliesWeakPoint=false;this.appliesBleed=false;this.appliesSeal=false;this.appliesShadowWeb=false;
    this.appliesChakraBlock=false;this.appliesStun=0;this.appliesSlow=0;
    this.pushes=0;this.explodeRadius=0;
    this.trailTimer=0;this.fromAutoAttack=false;
    this.boomerang=0;this.ownerRef=null;this.attacker=null;
    this.appliesPoison=false;this.poisonDmg=0;this.isRasenshuriken=false;
    this.isBoomerang=false;this.returning=false;this.sourceAbilityIndex=-1;
    this.isPoisonKamikaze=false;this.isSusanooArrow=false;this.dragsEnemies=false;
    this.spawnVortexOnEnd=false;this.pierceCount=0;
    this.isTentenBoomerang=false;this.isTentenSword=false;
      this.mindControlOnHit=false;this.hasStopped=false;this.stopTimer=0;
        this.stunOnHit=0;this.isFumaShuriken=false;
this.homing=false;this.homingRange=400;this.homingTarget=null;
    this.appliesShinoMark=false;
    this.isShikamaruNeedle=false;
  }
  update(){
    // ═══ Самонаведение ═══
    if(this.homing){
      if(!this.homingTarget||this.homingTarget.removed){
        if(this.isShikamaruNeedle && this.attacker){
          this.homingTarget = findNearestUnlinkedTarget(this, this.homingRange, this.attacker);
        } else {
          this.homingTarget = findNearestTarget(this, this.homingRange);
        }
      }
      if(this.homingTarget){
        const ta=Math.atan2(this.homingTarget.y-this.y,this.homingTarget.x-this.x);
        const ca=Math.atan2(this.vy,this.vx);
        const na=ca+clamp(angleDiff(ta,ca),-0.09,0.09);
        const spd=Math.hypot(this.vx,this.vy);
        this.vx=Math.cos(na)*spd;
        this.vy=Math.sin(na)*spd;
      }
    }
    if(this.isTentenBoomerang&&this.attacker){
      if(!this.hasStopped){
        this.boomerang--;
        if(this.boomerang<=0){this.hasStopped=true;this.stopTimer=60;this.vx=0;this.vy=0;}
      } else if(this.stopTimer>0){
        this.stopTimer--;this.vx=0;this.vy=0;
        if(this.stopTimer===0)this.hitSet.clear();
      } else {
        if(!this.attacker||!this.attacker.alive){this.dead=true;return;}
        const ang=Math.atan2(this.attacker.y-this.y,this.attacker.x-this.x);
        this.vx=Math.cos(ang)*14;this.vy=Math.sin(ang)*14;
        if(Math.hypot(this.attacker.x-this.x,this.attacker.y-this.y)<this.attacker.r+this.r){this.dead=true;return;}
      }
    }
    const prevX=this.x,prevY=this.y;
    this.x+=this.vx;this.y+=this.vy;this.life--;
    this.trailTimer++;
    if(this.trailTimer%2===0)addTrail(this.x,this.y,this.color,this.r*0.6);
    if(this.life<=0){
      if(this.spawnVortexOnEnd){
        addZone(new Zone(this.x,this.y,160,180,this.damage*0.25,'#a5f3fc',this.attacker,'vortex'));
        spawnShockwave(this.x,this.y,160,'#a5f3fc');spawnParticles(this.x,this.y,'#a5f3fc',40);
      }
      this.dead=true;return;
    }
    if(this.x<ARENA.x-100||this.x>ARENA.x+ARENA.w+100||this.y<ARENA.y-100||this.y>ARENA.y+ARENA.h+100){
      if(this.spawnVortexOnEnd){
        addZone(new Zone(clamp(this.x,ARENA.x+160,ARENA.x+ARENA.w-160),clamp(this.y,ARENA.y+160,ARENA.y+ARENA.h-160),160,180,this.damage*0.25,'#a5f3fc',this.attacker,'vortex'));
      }
      this.dead=true;return;
    }
    const self=this;
    forEachEnemySnapshot(e=>{
      if(e.removed||self.hitSet.has(e))return;
      const d=pointSegmentDist(e.x,e.y,prevX,prevY,self.x,self.y);
      if(d<e.r+self.r){
        let dmg=self.damage;
        if(self.attacker&&self.attacker.hook&&self.attacker.hook.type==='weakPoint'&&e.weakPointTimer>0)dmg*=1.6;
        e.takeDamage(dmg,self.x,self.y,false,self.attacker);
		        if(self.isKonanPaper && self.attacker && typeof self.attacker.hp==='number'){
          self.attacker.hp=Math.min(self.attacker.maxHp,self.attacker.hp+1);
          spawnDamageNumber(self.x,self.y-20,'+1❤','#4ade80',false);
        }
        if(self.dragsEnemies&&!e.removed&&!e.isBoss){
          const arrowAng=Math.atan2(self.vy,self.vx);
          const arrowSpd=Math.hypot(self.vx,self.vy);
          e.kx=Math.cos(arrowAng)*arrowSpd;e.ky=Math.sin(arrowAng)*arrowSpd;
        }
        if(!e.removed){
          if(self.appliesShinoMark){e.bugMarkTimer=300;}
          if(self.appliesCurse){e.curseTimer=999999;e.curseMarks=Math.min(3,(e.curseMarks||0)+1);}
          if(self.appliesParasite){e.parasiteTimer=300;e.parasiteDamage=self.damage*0.5;e.parasiteSpreads=self.spreadsOnDeath;e.parasiteStacks=Math.min(5,(e.parasiteStacks||0)+1);}
          if(self.appliesWeakPoint){e.weakPointTimer=180;}
          if(self.appliesBleed){e.bleedTimer=Math.max(e.bleedTimer,180);e.bleedDamage=self.damage*0.7;}
          if(self.appliesSeal){e.sealStacks=Math.min(8,(e.sealStacks||0)+1);if(self.attacker)self.attacker.triggerSeal(e);}
          if(self.appliesShadowWeb){e.shadowWebTimer=300;e.shadowWebOwner=self.attacker;}
          if(self.appliesChakraBlock)e.chakraBlockStacks=Math.min(10,(e.chakraBlockStacks||0)+1);
          if(self.appliesSlow>0)e.slowTimer=Math.max(e.slowTimer,self.appliesSlow);
          if(self.stunOnHit>0&&!e.isBoss)e.stunTimer=Math.max(e.stunTimer,self.stunOnHit);
          if(self.pushes>0){if(self.attacker&&self.attacker.hook&&self.attacker.hook.type==='gust')self.attacker.fanKill=true;if(!e.isBoss){const ang=Math.atan2(e.y-prevY,e.x-prevX);e.kx+=Math.cos(ang)*self.pushes;e.ky+=Math.sin(ang)*self.pushes;}}
          if(self.appliesPoison&&self.poisonDmg>0){e.burnTimer=Math.max(e.burnTimer,180);e.burnDamage=Math.max(e.burnDamage,self.poisonDmg);}
          if(self.mindControlOnHit&&!e.isBoss&&!e.specialType){e.mindControlTimer=Math.max(e.mindControlTimer,420);e.mindControlOwner=self.attacker;e.mcDamageMult=2;}
          if(self.attacker&&self.attacker.hook&&self.attacker.hook.type==='punchCharge'&&self.fromAutoAttack)self.attacker.hookValue=Math.min(3,self.attacker.hookValue+0.3);
          if(self.isShikamaruNeedle&&self.attacker){
            e.shadowWebTimer=Math.max(e.shadowWebTimer||0,300);
            e.shadowWebOwner=self.attacker;
          }
        }
        if(self.isPoisonKamikaze){
          spawnShockwave(self.x,self.y,140,'#7c2d12');spawnParticles(self.x,self.y,'#84cc16',30);
          const att=self.attacker;
          forEachEnemySnapshot(o=>{
            if(Math.hypot(o.x-self.x,o.y-self.y)<140){
              o.takeDamage(self.damage*0.6,self.x,self.y,false,att);
              if(!o.removed){o.burnTimer=Math.max(o.burnTimer,300);o.burnDamage=Math.max(o.burnDamage,self.damage*0.3);}
            }
          });
          addZone(new Zone(self.x,self.y,120,300,att.getDamage()*1.2,'#84cc16',att,'damage'));
          self.dead=true;return;
        }
        if(self.explodeRadius>0&&!self.isBoomerang){
          spawnShockwave(self.x,self.y,self.explodeRadius,'#f97316');
          const att=self.attacker;
          forEachEnemySnapshot(o=>{if(o!==e&&Math.hypot(o.x-self.x,o.y-self.y)<self.explodeRadius)o.takeDamage(self.damage*0.6,self.x,self.y,false,att);});
        }
        spawnParticles(self.x,self.y,self.color,12);
        for(let _i=0;_i<3;_i++){const _a=Math.random()*Math.PI*2,_s=rand(3,7);emitParticle(self.x,self.y,Math.cos(_a)*_s,Math.sin(_a)*_s,16,'#fff',3);}
        addTrail(self.x,self.y,'#fff',self.r*1.4);
        if(self.isTentenBoomerang){
          self.hitSet.add(e);
        } else if(self.bounces>0){
          self.hitSet.add(e);
          self.bounces--;
          let next=null,bd=Infinity;
          const checkTgt=(t)=>{if(t.removed||self.hitSet.has(t))return;const d2=(t.x-self.x)**2+(t.y-self.y)**2;if(d2<bd){bd=d2;next=t;}};
          for(const en of enemies)checkTgt(en);
          for(const b of bosses)checkTgt(b);
          if(next){
            const ang=Math.atan2(next.y-self.y,next.x-self.x);
            const spd=Math.hypot(self.vx,self.vy);
            self.vx=Math.cos(ang)*spd;self.vy=Math.sin(ang)*spd;
            self.life=Math.max(self.life,60);
          } else {self.dead=true;return false;}
        } else if(self.pierceCount>0){
          self.pierceCount--;self.hitSet.add(e);
          if(self.pierceCount<=0){self.dead=true;return false;}
        } else if(self.pierce){
          self.hitSet.add(e);
        } else {self.dead=true;return false;}
      }
    });
  }
  draw(){
  if(this.isShikamaruNeedle){
  const ang=Math.atan2(this.vy,this.vx);
  ctx.save();ctx.translate(this.x,this.y);ctx.rotate(ang);
  // Хвост-тень
  ctx.globalAlpha=0.35;
  const g=ctx.createLinearGradient(-this.r*4,0,0,0);
  g.addColorStop(0,'rgba(139,92,246,0)');
  g.addColorStop(1,'#8b5cf6');
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.moveTo(-this.r*4,0);
  ctx.lineTo(0,-this.r*0.6);
  ctx.lineTo(0,this.r*0.6);
  ctx.closePath();ctx.fill();
  // Тело: тонкий ромб (игла)
  ctx.globalAlpha=1;
  ctx.shadowColor='#8b5cf6';ctx.shadowBlur=10;
  ctx.fillStyle='#a5b4fc';
  ctx.beginPath();
  ctx.moveTo(this.r*2.2,0);           // остриё
  ctx.lineTo(0,-this.r*0.7);
  ctx.lineTo(-this.r*1.4,0);           // хвост
  ctx.lineTo(0,this.r*0.7);
  ctx.closePath();ctx.fill();
  // Блик
  ctx.shadowBlur=0;
  ctx.strokeStyle='#e0e7ff';ctx.lineWidth=1.2;
  ctx.beginPath();
  ctx.moveTo(this.r*1.5,0);
  ctx.lineTo(0,-this.r*0.35);
  ctx.stroke();
  ctx.restore();
  return;
}
    if(this.isFumaShuriken){
      const rot=tickMs/50;
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(rot);
      ctx.shadowColor='#a5f3fc';ctx.shadowBlur=10;
      ctx.fillStyle='#a5f3fc';
      ctx.strokeStyle='#fff';ctx.lineWidth=2;
      ctx.beginPath();
      for(let i=0;i<4;i++){
        const a=i*Math.PI/2;
        const outer=this.r*1.6,inner=this.r*0.55;
        ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);
        ctx.lineTo(Math.cos(a+Math.PI/4)*inner,Math.sin(a+Math.PI/4)*inner);
      }
      ctx.closePath();ctx.fill();ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle='#fff';
      ctx.beginPath();ctx.arc(0,0,this.r*0.35,0,Math.PI*2);ctx.fill();
      ctx.restore();
      return;
    }
    if(this.isTentenSword){
      const ang=Math.atan2(this.vy,this.vx);
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(ang);
      ctx.shadowColor='#e2e8f0';ctx.shadowBlur=12;
      ctx.fillStyle='#e2e8f0';
      ctx.beginPath();ctx.moveTo(this.r*1.8,0);ctx.lineTo(-this.r*0.4,-this.r*0.6);ctx.lineTo(-this.r*0.4,this.r*0.6);ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
      ctx.restore();return;
    }
    if(this.isSusanooArrow){
      const ang=Math.atan2(this.vy,this.vx);
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(ang);
      ctx.globalAlpha=0.5;ctx.fillStyle='#c084fc';
      ctx.beginPath();ctx.ellipse(0,0,this.r*2.2,this.r*0.6,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;ctx.fillStyle='#a855f7';
      ctx.beginPath();ctx.moveTo(this.r*1.6,0);ctx.lineTo(-this.r*1.4,-this.r*0.5);ctx.lineTo(-this.r*0.6,0);ctx.lineTo(-this.r*1.4,this.r*0.5);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
      ctx.restore();return;
    }
    if(this.isRasenshuriken){
      const rot=tickMs/60;const size=this.r*1.8;
      ctx.globalAlpha=0.4;ctx.fillStyle='#a5f3fc';ctx.beginPath();ctx.arc(this.x,this.y,size*1.6,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(rot);
      ctx.fillStyle='#a5f3fc';
      for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a-0.35)*size,Math.sin(a-0.35)*size);ctx.lineTo(Math.cos(a+0.35)*size*0.55,Math.sin(a+0.35)*size*0.55);ctx.closePath();ctx.fill();}
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,size*0.35,0,Math.PI*2);ctx.fill();
      ctx.restore();return;
    }
    if(this.r>8){ctx.globalAlpha=0.4;ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r*1.6,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    ctx.shadowColor=this.color;ctx.shadowBlur=this.r*2.5;
    ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,0.7)';
    ctx.beginPath();ctx.arc(this.x,this.y,this.r*0.4,0,Math.PI*2);ctx.fill();
  }
}

// ==================== CLONE / PET / BEAM / MINE / ZONE / SEAL / SWORD / TELEGRAPH / TORNADO / ANBU ====================
class Clone{
  constructor(x,y,owner,mode,aim){
    this.x=x;this.y=y;this.owner=owner;this.mode=mode;this.life=480;this.maxLife=480;this.r=12;
    this.shootTimer=0;this.aim=aim;this.color='#ffcc66';this.projectileColor=null;this.melee=false;this.meleeCd=0;
    this.isLivingPuppet=false;this.hp=0;this.maxHp=0;this.removed=false;
    if(mode==='shadow_clone'){this.color='#ff9900';this.projectileColor='#4fc3f7';this.r=13;}
    else if(mode==='rasengan_rusher'){this.color='#4fc3f7';this.r=13;this.exploded=false;}
    else if(mode==='ranged_clone'){this.color='#ffcc66';this.projectileColor='#4fc3f7';this.r=12;}
    else if(mode==='akamaru_clone'){this.color='#d4b483';this.r=12;}
    else if(mode==='bug_clone'){this.color='#84cc16';this.r=14;}
  }
  update(){
    this.life--;if(this.life<=0)return false;
    if(this.shootTimer>0)this.shootTimer--;
    if(this.meleeCd>0)this.meleeCd--;
    if(this.mode==='rasengan_rusher'){
      if(this.exploded)return false;
      const best=findNearestTarget(this,700);
      if(best){
        const dx=best.x-this.x,dy=best.y-this.y;const d=Math.hypot(dx,dy)||1;
        if(d>this.r+best.r){this.x+=dx/d*4.5;this.y+=dy/d*4.5;addTrail(this.x,this.y,'#4fc3f7',8);}
        this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
        if(!best.removed&&d<=this.r+best.r+4){
          this.exploded=true;
          const dmg=this.owner.getDamage()*7;
          spawnShockwave(this.x,this.y,180,'#4fc3f7');spawnParticles(this.x,this.y,'#4fc3f7',50);
          forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<180){e.takeDamage(dmg,this.x,this.y,false,this.owner);if(!e.removed&&!e.isBoss){const ex=e.x-this.x,ey=e.y-this.y,ed=Math.hypot(ex,ey)||1;e.kx+=ex/ed*25;e.ky+=ey/ed*25;}}});
          screenShake=Math.max(screenShake,15);hitStop=Math.max(hitStop,5);sfxBoom();
          return false;
        }
      }
      return true;
    }
    if(this.mode==='ranged_clone'){
      const dx=this.owner.x-this.x,dy=this.owner.y-this.y;const d=Math.hypot(dx,dy)||1;
      if(d>180){this.x+=dx/d*2.5;this.y+=dy/d*2.5;}
      else if(d<90){this.x-=dx/d*1.5;this.y-=dy/d*1.5;}
      this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
      if(this.shootTimer===0){
        const best=findNearestTarget(this,600);
        if(best){
          const ang=Math.atan2(best.y-this.y,best.x-this.x);
          const proj=new Projectile(this.x,this.y,ang,this.owner.getDamage()*0.7,this.owner.color,6,12);
          proj.attacker=this.owner;projectiles.push(proj);
          this.shootTimer=50;
        }
      }
      return true;
    }
    if(this.mode==='akamaru_clone'&&this.melee){
      const best=findNearestTarget(this,500);
      if(best){const dx=best.x-this.x,dy=best.y-this.y;const d=Math.hypot(dx,dy)||1;
        if(d>this.r+best.r+4){this.x+=dx/d*3.4;this.y+=dy/d*3.4;}
        else if(this.meleeCd===0&&!best.removed){this.meleeCd=20;best.takeDamage(this.owner.getDamage()*1.2,this.x,this.y,false,this.owner);if(!best.removed){const dd=Math.hypot(dx,dy)||1;best.kx+=dx/dd*6;best.ky+=dy/dd*6;best.bleedTimer=Math.max(best.bleedTimer,180);best.bleedDamage=this.owner.getDamage()*0.5;}}
        this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
      }
      return true;
    }
    if(this.mode==='bug_clone'){
      const best=findNearestTarget(this,600);
      if(best){
        const dx=best.x-this.x,dy=best.y-this.y;
        const d=Math.hypot(dx,dy)||1;
        if(d>200){this.x+=dx/d*3;this.y+=dy/d*3;}
        else if(d<120){this.x-=dx/d*2;this.y-=dy/d*2;}
        if(this.shootTimer===0){
          const ang=Math.atan2(dy,dx);
          const proj=new Projectile(this.x,this.y,ang,this.owner.getDamage()*0.9,'#84cc16',6,11);
          proj.attacker=this.owner;
          proj.homing=true;proj.homingRange=400;
          projectiles.push(proj);
          this.shootTimer=40;
        }
        this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
        this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
        addTrail(this.x,this.y,'#84cc16',4);
      }
      return true;
    }
    if(this.isLivingPuppet){
      if(this.mode==='turret'){
        if(this.shootTimer===0){
          const best=findNearestTarget(this,500);
          if(best){const ang=Math.atan2(best.y-this.y,best.x-this.x);
            const proj=new Projectile(this.x,this.y,ang,this.owner.getDamage()*0.9,'#a16207',7,10);
            proj.attacker=this.owner;proj.explodeRadius=60;projectiles.push(proj);
            this.shootTimer=60;
          }
        }
        return true;
      }
      if(this.mode==='shield_puppet'){
        for(const ep of enemyProjectiles){
          if(Math.hypot(ep.x-this.x,ep.y-this.y)<60){ep.dead=true;spawnParticles(ep.x,ep.y,'#3b82f6',8);}
        }
        return true;
      }
      if(this.mode==='trap_puppet'){
        if(this.shootTimer===0){
          forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<150){e.takeDamage(this.owner.getDamage()*1.5,this.x,this.y,false,this.owner);e.stunTimer=Math.max(e.stunTimer,30);}});
          this.shootTimer=60;
        }
        return true;
      }
    }
    return true;
  }
  draw(){
    ctx.globalAlpha=Math.min(1,this.life/60);
    if(this.mode==='rasengan_rusher'){
      const pulse=1+0.3*Math.sin(tickMs/80);
      ctx.fillStyle='#4fc3f7';ctx.beginPath();ctx.arc(this.x,this.y,this.r*1.6*pulse,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=0.6;ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Н',this.x,this.y);ctx.textBaseline='alphabetic';ctx.textAlign='left';
      return;
    }
    if(this.mode==='ranged_clone'){
      ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Н',this.x,this.y);ctx.textBaseline='alphabetic';ctx.textAlign='left';
      ctx.globalAlpha=1;return;
    }
    if(this.mode==='akamaru_clone'){
      ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#000';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('А',this.x,this.y);ctx.textBaseline='alphabetic';ctx.textAlign='left';
      ctx.globalAlpha=1;return;
    }
	    if(this.mode==='bug_clone'){
      const t=tickMs/80;
      // Крылья
      ctx.globalAlpha=0.4*Math.min(1,this.life/60);
      ctx.fillStyle='#a3e635';
      const wingA=Math.sin(t)*0.3;
      ctx.beginPath();ctx.ellipse(this.x-12,this.y-4,14,6,wingA,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(this.x+12,this.y-4,14,6,-wingA,0,Math.PI*2);ctx.fill();
      // Тело
      ctx.globalAlpha=Math.min(1,this.life/60);
      ctx.fillStyle=this.color;
      ctx.beginPath();ctx.ellipse(this.x,this.y,14,10,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#a3e635';ctx.lineWidth=2;ctx.stroke();
      // Глаз
      ctx.fillStyle='#ffd700';
      ctx.beginPath();ctx.arc(this.x,this.y,3,0,Math.PI*2);ctx.fill();
      // HP-бар
      if(this.hp<this.maxHp&&this.hp>0){
        const bw=24,bh=3,bx=this.x-bw/2,by=this.y-this.r-6;
        ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);
        ctx.fillStyle='#e33';ctx.fillRect(bx,by,bw,bh);
        ctx.fillStyle='#84cc16';ctx.fillRect(bx,by,bw*(this.hp/this.maxHp),bh);
      }
      ctx.globalAlpha=1;
      return;
    }
    if(this.isLivingPuppet){
      if(this.mode==='turret'){ctx.fillStyle=this.color||'#a16207';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#000';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('К',this.x,this.y);ctx.textBaseline='alphabetic';ctx.textAlign='left';}
      else if(this.mode==='shield_puppet'){ctx.fillStyle='#3b82f6';ctx.fillRect(this.x-this.r,this.y-this.r,this.r*2,this.r*2);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(this.x-this.r,this.y-this.r,this.r*2,this.r*2);}
      else if(this.mode==='trap_puppet'){ctx.fillStyle='#7c2d12';ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;const px=this.x+Math.cos(a)*this.r,py=this.y+Math.sin(a)*this.r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
      if(this.hp>0){const bw=24,bh=3;const bx=this.x-bw/2,by=this.y-this.r-8;ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);ctx.fillStyle='#e33';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle='#3e6';ctx.fillRect(bx,by,bw*(this.hp/this.maxHp),bh);}
      ctx.globalAlpha=1;return;
    }
    ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
    ctx.globalAlpha=1;
  }
}

class Pet{
  constructor(x,y,owner,type){this.x=x;this.y=y;this.owner=owner;this.type=type;
    this.isPet=true;this.rageMode=false;this.rageTimer=0;this.jumpTarget=null;this.removed=false;
    if(type==='akamaru'){this.r=13;this.life=999999;this.hp=800;this.maxHp=800;}
    else if(type==='wolf'){this.r=14;this.life=600;}
    else if(type==='gama'){this.r=28;this.life=480;}
    else if(type==='puppet_beast'){this.r=20;this.life=360;}
    else{this.r=13;this.life=300;}
    this.maxLife=this.life;this.target=null;this.biteTimer=0;this.aoeTimer=0;this.bleedPower=0.5;this.hurtFlash=0;this.shootTimer=0;
  }
  getNearest(){return findNearestTarget(this,500);}
  takeDamage(d){
    if(this.type!=='akamaru')return;
    if(this.hp<=0)return;
    if(this.rageMode)return;
    this.hp-=d;this.hurtFlash=6;
    if(this.hp<=0){
      this.hp=0;
      if(this.owner&&this.owner.charId==='kiba'){
        this.owner.akamaruDeadCd=900;
        spawnDamageNumber(this.owner.x,this.owner.y-50,'АКАМАРУ ПОГИБ! (15с)','#f55',true);
      }
      spawnShockwave(this.x,this.y,80,'#8b6f47');
      spawnParticles(this.x,this.y,'#8b6f47',30);
    }
  }
  update(){
    if(this.life<=0)return false;
    if(this.hurtFlash>0)this.hurtFlash--;
    if(this.type==='akamaru'&&this.hp<=0)return false;
    if(this.type!=='akamaru')this.life--;
    if(!this.owner.alive)return false;
    if(this.type==='akamaru'){
      const distToOwner=Math.hypot(this.x-this.owner.x,this.y-this.owner.y);
      const regen=(distToOwner<150)?3/60:1/60;
      this.hp=Math.min(this.maxHp,this.hp+regen);
      if(this.rageMode){
        this.rageTimer--;
        if(this.rageTimer<=0){this.rageMode=false;this.r=13;this.jumpTarget=null;}
        if(!this.jumpTarget||this.jumpTarget.removed){
          let best=null,bd=Infinity;
          for(const e of enemies){if(e.removed)continue;const d2=dist2(this,e);if(d2<bd){bd=d2;best=e;}}
          for(const b of bosses){if(b.removed)continue;const d2=dist2(this,b);if(d2<bd){bd=d2;best=b;}}
          this.jumpTarget=best;
        }
        if(this.jumpTarget){
          const dx=this.jumpTarget.x-this.x,dy=this.jumpTarget.y-this.y;
          const d=Math.hypot(dx,dy)||1;
          if(d>this.r+this.jumpTarget.r){this.x+=dx/d*15;this.y+=dy/d*15;addTrail(this.x,this.y,'#dc2626',10);}
          else{
            const dmg=this.owner.getDamage()*1.8;
            this.jumpTarget.takeDamage(dmg,this.x,this.y,false,this);
            if(!this.jumpTarget.removed){this.jumpTarget.bleedTimer=Math.max(this.jumpTarget.bleedTimer,300);this.jumpTarget.bleedDamage=this.owner.getDamage()*1.5;}
            spawnShockwave(this.x,this.y,60,'#dc2626');
            this.jumpTarget=null;
          }
        }
        this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
        this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
        this.r=25+Math.sin(tickMs/80)*3;
        return true;
      }
      // Следование за владельцем
      const dx=this.owner.x-this.x,dy=this.owner.y-this.y;const d=Math.hypot(dx,dy)||1;
      if(d>70){this.x+=dx/d*2.7;this.y+=dy/d*2.7;}
      // Поиск цели (радиус увеличен для ranged)
      if(!this.target||this.target.removed)this.target=findNearestTarget(this,400);
      if(this.target){
        const dx2=this.target.x-this.x,dy2=this.target.y-this.y;
        const d2=Math.hypot(dx2,dy2)||1;
        // Держит дистанцию: слишком близко — отходит, слишком далеко — подходит
        if(d2<150){this.x-=dx2/d2*2;this.y-=dy2/d2*2;}
        else if(d2>260){this.x+=dx2/d2*1.5;this.y+=dy2/d2*1.5;}
        // СТРЕЛЬБА (вместо укуса)
        if(this.shootTimer>0)this.shootTimer--;
        if(this.shootTimer<=0&&d2<450){
          this.shootTimer=25;
          const ang=Math.atan2(dy2,dx2);
          const proj=new Projectile(this.x,this.y,ang,this.owner.getDamage()*0.6,'#d4b483',5,12);
          proj.attacker=this.owner;
          proj.fromAutoAttack=true;
          projectiles.push(proj);
        }
        this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);
        this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
      }
      if(!this.rageMode){
        for(let i=0;i<enemies.length;i++){const e=enemies[i];if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r+2){this.takeDamage(e.getEffectiveDamage()*0.5);if(this.hp<=0)return false;}}
        for(let i=0;i<bosses.length;i++){const e=bosses[i];if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r+2){this.takeDamage(e.getEffectiveDamage()*0.5);if(this.hp<=0)return false;}}
      }
    } else if(this.type==='wolf'){
      if(!this.target||this.target.removed)this.target=this.getNearest();
      if(this.target){const dx=this.target.x-this.x,dy=this.target.y-this.y;const d=Math.hypot(dx,dy)||1;
        if(d>this.r+this.target.r){this.x+=dx/d*3;this.y+=dy/d*3;}
        this.biteTimer++;
        if(d<=this.r+this.target.r+5&&this.biteTimer>=35){this.biteTimer=0;this.target.takeDamage(this.owner.getDamage()*0.9,this.x,this.y,false,this.owner);}
      }
    } else if(this.type==='gama'){
      if(!this.target||this.target.removed)this.target=this.getNearest();
      if(this.target){const dx=this.target.x-this.x,dy=this.target.y-this.y;const d=Math.hypot(dx,dy)||1;if(d>120){this.x+=dx/d*1.6;this.y+=dy/d*1.6;}}
      this.aoeTimer++;
      if(this.aoeTimer>=60){this.aoeTimer=0;spawnShockwave(this.x,this.y,110,'#ff6600');forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<110){e.takeDamage(this.owner.getDamage()*1.5,this.x,this.y,false,this.owner);}});}
    } else if(this.type==='puppet_beast'){
      if(!this.target||this.target.removed)this.target=this.getNearest();
      if(this.target){const dx=this.target.x-this.x,dy=this.target.y-this.y;const d=Math.hypot(dx,dy)||1;
        if(d>this.r+this.target.r){this.x+=dx/d*2.8;this.y+=dy/d*2.8;}
        this.biteTimer++;
        if(d<=this.r+this.target.r+8&&this.biteTimer>=20){this.biteTimer=0;this.target.takeDamage(this.owner.getDamage()*1.4,this.x,this.y,false,this.owner);if(!this.target.removed&&!this.target.isBoss){const dd=Math.hypot(dx,dy)||1;this.target.kx+=dx/dd*15;this.target.ky+=dy/dd*15;this.target.stunTimer=Math.max(this.target.stunTimer,30);}}
      }
    }
    return true;
  }
  draw(){
    const alpha=Math.min(1,this.life/60);ctx.globalAlpha=alpha;
    const fill=this.hurtFlash>0?'#fff':null;
    if(this.type==='akamaru'){
      const bodyColor=this.rageMode?(fill||'#dc2626'):(fill||'#e8d5b7');
      const outlineColor=this.rageMode?'#7f1d1d':'#8b6f47';
      if(this.rageMode){ctx.globalAlpha=0.4+0.2*Math.sin(tickMs/60);ctx.fillStyle='#dc2626';ctx.beginPath();ctx.arc(this.x,this.y,this.r+10,0,Math.PI*2);ctx.fill();ctx.globalAlpha=alpha;}
      ctx.fillStyle=bodyColor;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=outlineColor;ctx.lineWidth=this.rageMode?3:2;ctx.stroke();
      if(!fill){ctx.fillStyle=outlineColor;ctx.beginPath();ctx.moveTo(this.x-8,this.y-this.r+2);ctx.lineTo(this.x-4,this.y-this.r-6);ctx.lineTo(this.x-1,this.y-this.r+2);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(this.x+8,this.y-this.r+2);ctx.lineTo(this.x+4,this.y-this.r-6);ctx.lineTo(this.x+1,this.y-this.r+2);ctx.closePath();ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(this.x-4,this.y-1,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(this.x+4,this.y-1,2,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=alpha;
      if(this.hp<this.maxHp){const bw=24,bh=3;const bx=this.x-bw/2,by=this.y-this.r-6;ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);ctx.fillStyle='#e33';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle='#3e6';ctx.fillRect(bx,by,bw*(this.hp/this.maxHp),bh);}
    } else if(this.type==='wolf'){ctx.fillStyle=fill||'#a08a70';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5a4a35';ctx.lineWidth=2;ctx.stroke();}
    else if(this.type==='gama'){ctx.fillStyle=fill||'#d97706';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#7c2d12';ctx.lineWidth=3;ctx.stroke();}
    else if(this.type==='puppet_beast'){ctx.fillStyle=fill||'#7c2d12';ctx.fillRect(this.x-this.r,this.y-this.r,this.r*2,this.r*2);ctx.strokeStyle='#a16207';ctx.lineWidth=3;ctx.strokeRect(this.x-this.r,this.y-this.r,this.r*2,this.r*2);}
    ctx.globalAlpha=1;
  }
}

class Beam{
  constructor(x,y,ang,length,width,damage,color,life,targetPlayers=false,owner=null){
    this.x=x;this.y=y;this.ang=ang;this.length=length;this.width=width;this.damage=damage;this.color=color;
    this.life=life;this.maxLife=life;this.dead=false;this.targetPlayers=targetPlayers;
    if(damage>0){
      const ex=x+Math.cos(ang)*length,ey=y+Math.sin(ang)*length;
if(targetPlayers){for(const p of players){
  if(!p.alive||p.vanishedTimer>0||p.sakuraJumpActive)continue;
  if(p.flyingBugActive && !(owner && owner.isBoss)) continue;
  if(pointSegmentDist(p.x,p.y,x,y,ex,ey)<p.r+width/2)p.takeDamage(damage,owner);
}}
      else{forEachEnemySnapshot(e=>{if(pointSegmentDist(e.x,e.y,x,y,ex,ey)<e.r+width/2)e.takeDamage(damage,x,y);});}
    }
  }
  update(){this.life--;if(this.life<=0)this.dead=true;}
  draw(){const alpha=this.life/this.maxLife;const ex=this.x+Math.cos(this.ang)*this.length;const ey=this.y+Math.sin(this.ang)*this.length;ctx.globalAlpha=alpha;ctx.strokeStyle=this.color;ctx.lineWidth=this.width;ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(ex,ey);ctx.stroke();if(this.damage>0){ctx.strokeStyle=this.targetPlayers?'#ff8888':'#fff';ctx.lineWidth=this.width*0.4;ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(ex,ey);ctx.stroke();}ctx.globalAlpha=1;}
}

class Mine{
  constructor(x,y,damage,owner,life){this.x=x;this.y=y;this.r=12;this.damage=damage;this.owner=owner;this.life=life;this.maxLife=life;this.dead=false;this.exploded=false;}
  update(){if(this.exploded){this.life--;if(this.life<=0)this.dead=true;return;}this.life--;if(this.life<=0){this.dead=true;return;}
    let detonated=false;
    for(let i=0;i<enemies.length;i++){const e=enemies[i];if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r){detonated=true;break;}}
    if(!detonated)for(let i=0;i<bosses.length;i++){const e=bosses[i];if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r){detonated=true;break;}}
    if(detonated){this.exploded=true;this.life=12;spawnShockwave(this.x,this.y,100,'#84cc16');const att=this.owner;forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<100)e.takeDamage(this.damage,this.x,this.y,false,att);});}}
  draw(){if(this.exploded){const a=this.life/12;ctx.globalAlpha=a;ctx.fillStyle='#84cc16';ctx.beginPath();ctx.arc(this.x,this.y,100*(1-a),0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return;}
    const pulse=0.7+0.3*Math.sin(tickMs/100);ctx.fillStyle='#84cc16';ctx.globalAlpha=pulse;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle='#a3e635';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x,this.y,this.r+3,0,Math.PI*2);ctx.stroke();}
}

class Zone{
  constructor(x,y,r,life,damage,color,owner,type='damage'){
    this.x=x;this.y=y;this.r=r;this.life=life;this.maxLife=life;this.damage=damage;this.color=color;this.owner=owner;
    this.tickTimer=0;this.type=type;this.triggered=false;this.triggerCount=0;this.maxTriggers=1;
    this.isDecoy=(type==='decoy');this.isAmaterasu=(type==='amaterasu');this.isParasite=(type==='parasite');this.isWindTrail=(type==='windtrail');this.isCrater=(type==='crater');
    this.isWindCircle=(type==='windCircle');this.isVortex=(type==='vortex');
    this.isPetal=(type==='petal');this.isQuicksand=(type==='quicksand');this.isPoisonGround=(type==='poisonGround');
  }
  update(){
    if(this.isDecoy){this.life--;return this.life>0;}
    this.life--;
    if(this.isPoisonGround){
      this.tickTimer++;
      if(this.tickTimer>=18){
        this.tickTimer=0;
        for(const p of players){
          if(!p.alive||p.invuln>0||p.sakuraJumpActive)continue;
          if(dist2(this,p)<this.r*this.r)p.takeDamage(this.damage,null);
        }
      }
      return this.life>0;
    }
    if(this.isQuicksand){
      forEachEnemySnapshot(e=>{
        if(e.removed)return;
        if(dist2(this,e)<this.r*this.r){
          e.hyperSlowTimer=Math.max(e.hyperSlowTimer,10);
          e.slowTimer=Math.max(e.slowTimer,30);
          if(tickMs%20<17)addTrail(e.x,e.y,'#d97706',e.r*0.6);
        }
      });
      return this.life>0;
    }
    if(this.isWindCircle){
      forEachEnemySnapshot(e=>{
        if(e.removed||e.isBoss)return;
        const dx=e.x-this.x,dy=e.y-this.y;
        const d=Math.hypot(dx,dy)||1;
        if(d<this.r+e.r){const push=10;e.kx+=dx/d*push;e.ky+=dy/d*push;}
      });
      return this.life>0;
    }
    if(this.type==='trap'){
      if(!this.triggered||this.triggerCount<this.maxTriggers){
        let hit=false;
        for(let i=0;i<enemies.length;i++)if(Math.hypot(enemies[i].x-this.x,enemies[i].y-this.y)<this.r){hit=true;break;}
        if(!hit)for(let i=0;i<bosses.length;i++)if(Math.hypot(bosses[i].x-this.x,bosses[i].y-this.y)<this.r){hit=true;break;}
        if(hit){forEachEnemySnapshot(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<this.r)e.stunTimer=Math.max(e.stunTimer,180);});this.triggerCount++;this.triggered=true;if(this.triggerCount>=this.maxTriggers)this.life=60;}
      }
      return this.life>0;
    }
    if(this.isCrater){
      forEachEnemySnapshot(e=>{if(dist2(this,e)<this.r*this.r)e.slowTimer=Math.max(e.slowTimer,10);});
      return this.life>0;
    }
    this.tickTimer++;
    if(this.tickTimer>=18){
      this.tickTimer=0;
      const att=this.owner;
      forEachEnemySnapshot(e=>{
        if(dist2(this,e)<this.r*this.r){
          e.takeDamage(this.damage,this.x,this.y,false,att);
          if(this.isParasite&&!e.removed){e.parasiteTimer=Math.max(e.parasiteTimer,180);e.parasiteDamage=Math.max(e.parasiteDamage,this.damage*0.4);e.parasiteStacks=Math.min(5,(e.parasiteStacks||0)+1);}
          if(this.isAmaterasu&&!e.removed){e.burnTimer=Math.max(e.burnTimer,60);e.burnDamage=Math.max(e.burnDamage,this.damage*0.5);}
          if(this.isWindTrail&&!e.removed){e.slowTimer=Math.max(e.slowTimer,20);}
        }
      });
    }
    return this.life>0;
  }
  draw(){
    if(this.isPoisonGround){
      const alpha=Math.min(1,this.life/60);
      ctx.globalAlpha=alpha*0.5;
      ctx.fillStyle='#84cc16';
      ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=alpha*0.9;
      ctx.strokeStyle='#a3e635';ctx.lineWidth=2;
      ctx.setLineDash([6,4]);ctx.lineDashOffset=-tickMs/40;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([]);
      const t=tickMs/150;
      for(let i=0;i<4;i++){
        const a=t+i*Math.PI/2;
        const rr=this.r*(0.4+0.3*Math.sin(t+i));
        ctx.globalAlpha=alpha*0.7;
        ctx.fillStyle='#84cc16';
        ctx.beginPath();ctx.arc(this.x+Math.cos(a)*rr,this.y+Math.sin(a)*rr,4,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;return;
    }
    if(this.isQuicksand){
      const t=tickMs/200;
      const alpha=Math.min(1,this.life/60);
      ctx.globalAlpha=alpha*(0.5+0.2*Math.sin(t));
      ctx.fillStyle='#7c2d12';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=alpha*0.7;
      ctx.strokeStyle='#a16207';ctx.lineWidth=4;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<7;i++){
        const a=t+i*Math.PI*2/7;
        const rr=this.r*(0.3+0.5*Math.abs(Math.sin(t*0.7+i)));
        ctx.globalAlpha=alpha*0.65;
        ctx.fillStyle=i%2?'#d97706':'#fbbf24';
        ctx.beginPath();ctx.arc(this.x+Math.cos(a)*rr,this.y+Math.sin(a)*rr,7,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;return;
    }
    if(this.isVortex){
      const t=tickMs/60;const alpha=Math.min(1,this.life/30);
      ctx.globalAlpha=alpha*0.6;ctx.strokeStyle='#a5f3fc';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=alpha*0.8;
      for(let i=0;i<4;i++){const a=t+i*Math.PI/2;ctx.save();ctx.translate(this.x,this.y);ctx.rotate(a);ctx.fillStyle='#67e8f9';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(this.r*0.9,-this.r*0.2);ctx.lineTo(this.r*0.9,this.r*0.2);ctx.closePath();ctx.fill();ctx.restore();}
      ctx.globalAlpha=alpha*0.5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(this.x,this.y,this.r*0.25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return;
    }
    if(this.isWindCircle){
      const ownerStanding=this.owner&&this.owner.alive&&Math.hypot(this.owner.x-this.x,this.owner.y-this.y)<this.r;
      const alpha=Math.min(1,this.life/60);
      ctx.globalAlpha=alpha*(0.5+0.2*Math.sin(tickMs/100));
      ctx.strokeStyle='#a5f3fc';ctx.lineWidth=ownerStanding?5:3;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();
      const rot=tickMs/400;
      ctx.globalAlpha=alpha*0.6;ctx.lineWidth=2;ctx.strokeStyle='#67e8f9';
      for(let i=0;i<4;i++){const a=rot+i*Math.PI/2;const ox=this.x+Math.cos(a)*this.r*0.65;const oy=this.y+Math.sin(a)*this.r*0.65;ctx.beginPath();ctx.arc(ox,oy,this.r*0.35,a,a+Math.PI*1.2);ctx.stroke();}
      if(ownerStanding){ctx.globalAlpha=alpha*(0.15+0.1*Math.sin(tickMs/80));ctx.fillStyle='#67e8f9';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;return;
    }
    if(this.isPetal){
      const t=tickMs/200;
      const alpha=Math.min(1,this.life/30);
      ctx.globalAlpha=alpha*0.7;
      for(let i=0;i<8;i++){
        const a=t+i*Math.PI/4;
        const rr=this.r*(0.3+0.7*Math.abs(Math.sin(t*0.5+i)));
        ctx.fillStyle=i%2===0?'#f9a8d4':'#ec4899';
        ctx.beginPath();ctx.ellipse(this.x+Math.cos(a)*rr,this.y+Math.sin(a)*rr,8,4,a,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=alpha*0.4;
      ctx.strokeStyle='#ec4899';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;return;
    }
    if(this.isDecoy){const alpha=Math.min(1,this.life/60);ctx.globalAlpha=alpha*0.6;ctx.fillStyle='#a16207';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=alpha;ctx.strokeStyle='#fbbf24';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;return;}
    if(this.type==='trap'){ctx.globalAlpha=this.triggered?0.9:0.6+0.2*Math.sin(tickMs/200);ctx.fillStyle=this.triggered?'#1e293b':'#0f172a';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#475569';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#94a3b8';ctx.font='bold 24px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('影',this.x,this.y);ctx.textBaseline='alphabetic';ctx.textAlign='left';return;}
    if(this.isAmaterasu){ctx.globalAlpha=0.6+0.2*Math.sin(tickMs/100);ctx.fillStyle='#0a0a0a';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=0.7;ctx.strokeStyle='#7c3aed';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;return;}
    if(this.isParasite){const t=tickMs/80;for(let i=0;i<6;i++){const a=t+i*Math.PI/3;const rr=this.r*(0.6+0.4*Math.sin(t*2+i));ctx.fillStyle='#84cc16';ctx.globalAlpha=0.6;ctx.beginPath();ctx.arc(this.x+Math.cos(a)*rr,this.y+Math.sin(a)*rr,4,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=0.4;ctx.strokeStyle='#84cc16';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;return;}
    if(this.isWindTrail){const lifeRatio=this.life/this.maxLife;ctx.globalAlpha=0.3*lifeRatio+0.1*Math.sin(tickMs/80);ctx.strokeStyle='#a5f3fc';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(this.x,this.y,this.r-i*15,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;return;}
    if(this.isCrater){ctx.globalAlpha=0.3;ctx.fillStyle='#3a3a4a';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=0.6;ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;return;}
    ctx.globalAlpha=0.35+0.15*Math.sin(tickMs/100);ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=0.9;ctx.strokeStyle='#f87171';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
  }
}

function spawnPetalZone(x,y,r,life,damage,owner){addZone(new Zone(x,y,r,life,damage,'#ec4899',owner,'petal'));}

class TentenSeal{
  constructor(x,y,damage,owner){
    this.x=x;this.y=y;this.r=22;this.damage=damage;this.owner=owner;
    this.dead=false;this.armTime=15;
  }
  update(){
    if(this.dead)return false;
    if(this.armTime>0){this.armTime--;return true;}
    let hit=false;
    for(const e of enemies){if(e.removed)continue;if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r){hit=true;break;}}
    if(!hit)for(const b of bosses){if(b.removed)continue;if(Math.hypot(b.x-this.x,b.y-this.y)<this.r+b.r){hit=true;break;}}
    if(hit)this.detonate(1);
    return !this.dead;
  }
  detonate(mult){
    if(this.dead)return;
    this.dead=true;
    const radius=85;
    const att=this.owner;
    spawnShockwave(this.x,this.y,radius,'#f87171');
    spawnShockwave(this.x,this.y,radius*0.6,'#fbbf24');
    spawnParticles(this.x,this.y,'#fbbf24',20);
    spawnParticles(this.x,this.y,'#f87171',15);
    forEachEnemySnapshot(e=>{
      if(e.removed)return;
      if(Math.hypot(e.x-this.x,e.y-this.y)<radius+e.r){
        e.takeDamage(this.damage*mult,this.x,this.y,false,att);
        if(!e.removed&&!e.isBoss){const dx=e.x-this.x,dy=e.y-this.y,d=Math.hypot(dx,dy)||1;e.kx+=dx/d*25*Math.min(mult,3);e.ky+=dy/d*25*Math.min(mult,3);}
      }
    });
    screenShake=Math.max(screenShake,10*Math.min(mult,3));
    screenFlash=Math.max(screenFlash,6*Math.min(mult,3));
    if(mult>=3)hitStop=Math.max(hitStop,4);
    sfxBoom();
  }
  draw(){
    if(this.dead)return;
    const t=tickMs/200;
    const pulse=1+0.15*Math.sin(t);
    let alpha=1;
    if(this.armTime>0)alpha=0.4+0.4*(1-this.armTime/15);
    ctx.globalAlpha=alpha;
    ctx.fillStyle='#dc2626';
    ctx.beginPath();ctx.arc(this.x,this.y,this.r*pulse,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=alpha*0.95;
    ctx.strokeStyle='#fff';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(this.x-8,this.y);ctx.lineTo(this.x+8,this.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(this.x,this.y-8);ctx.lineTo(this.x,this.y+8);ctx.stroke();
    ctx.globalAlpha=alpha*0.9;
    ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(this.x,this.y,this.r*pulse+4,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;
  }
}

class TentenOrbitingSword{
  constructor(owner,offset){
    this.owner=owner;this.angle=tickMs/300;this.offset=offset;
    this.radius=90;this.life=360;
    this.damage=owner.getDamage()*2;
    this.hitCd={};
    this.x=owner.x+Math.cos(this.angle+offset)*this.radius;
    this.y=owner.y+Math.sin(this.angle+offset)*this.radius;
    this.dead=false;this.trail=[];this.r=15;
  }
  update(){
    this.life--;
    if(this.life<=0){this.dead=true;return false;}
    if(!this.owner.alive){this.dead=true;return false;}
    this.angle+=0.09;
    this.x=this.owner.x+Math.cos(this.angle+this.offset)*this.radius;
    this.y=this.owner.y+Math.sin(this.angle+this.offset)*this.radius;
    this.trail.push({x:this.x,y:this.y});
    if(this.trail.length>16)this.trail.shift();
    forEachEnemySnapshot(e=>{
      if(e.removed)return;
      if(this.hitCd[e]&&this.hitCd[e]>tickMs)return;
      if(Math.hypot(e.x-this.x,e.y-this.y)<this.r+e.r){
        e.takeDamage(this.damage,this.x,this.y,false,this.owner);
        this.hitCd[e]=tickMs+280;
      }
    });
    return true;
  }
  draw(){
    for(let i=0;i<this.trail.length;i++){
      const tr=this.trail[i];
      const alpha=(i+1)/this.trail.length*0.7;
      ctx.globalAlpha=alpha;
      ctx.fillStyle='#e2e8f0';
      ctx.beginPath();ctx.arc(tr.x,tr.y,4-2*(1-i/this.trail.length),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle+this.offset+Math.PI/2);
    ctx.shadowColor='#a5f3fc';ctx.shadowBlur=10;
    ctx.fillStyle='#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(0,-this.r*1.3);
    ctx.lineTo(this.r*0.35,this.r*0.6);
    ctx.lineTo(0,this.r);
    ctx.lineTo(-this.r*0.35,this.r*0.6);
    ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();
  }
}

class Telegraph{
  constructor(x,y,r,delay,damage,color,owner){this.x=x;this.y=y;this.r=r;this.delay=delay;this.maxDelay=delay;this.damage=damage;this.color=color;this.owner=owner;this.exploded=false;this.life=25;this.dead=false;}
  update(){
    if(!this.exploded){
      this.delay--;
      if(this.delay<=0){
        this.exploded=true;
        spawnShockwave(this.x,this.y,this.r,this.color);
        spawnParticles(this.x,this.y,this.color,30);
        screenShake=Math.max(screenShake,8);
for(const p of players){
  if(!p.alive||p.vanishedTimer>0||p.sakuraJumpActive)continue;
  if(p.flyingBugActive && !(this.owner && this.owner.isBoss)) continue;
  if(Math.hypot(p.x-this.x,p.y-this.y)<this.r+p.r)p.takeDamage(this.damage,this.owner);
}
      }
    }else{
      this.life--;
      if(this.life<=0)this.dead=true;
    }
  }
  draw(){if(!this.exploded){const t=1-this.delay/this.maxDelay;ctx.globalAlpha=0.2+0.3*t;ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=0.8;ctx.strokeStyle=this.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}else{const a=this.life/25;ctx.globalAlpha=a;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(this.x,this.y,this.r*(1-a*0.7),0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}}
}

class Tornado{
  constructor(x,y,damage,owner,life){
    this.x=x;this.y=y;this.damage=damage;this.owner=owner;
    this.life=life;this.maxLife=life;this.dead=false;
    this.r=110;this.hitRadius=55;this.tickTimer=0;
    const a=Math.random()*Math.PI*2;
    this.vx=Math.cos(a)*2.6;this.vy=Math.sin(a)*2.6;
    this.wanderTimer=Math.floor(rand(30,60));
  }
  update(){
    this.life--;
    if(this.life<=0){this.dead=true;return;}
    this.wanderTimer--;
    if(this.wanderTimer<=0){
      this.wanderTimer=Math.floor(rand(40,80));
      const a=Math.atan2(this.vy,this.vx)+rand(-0.8,0.8);
      const spd=rand(2,3.2);
      this.vx=Math.cos(a)*spd;this.vy=Math.sin(a)*spd;
    }
    const em=this.r;
    if(this.x<ARENA.x+em){this.x=ARENA.x+em;this.vx=Math.abs(this.vx);}
    else if(this.x>ARENA.x+ARENA.w-em){this.x=ARENA.x+ARENA.w-em;this.vx=-Math.abs(this.vx);}
    if(this.y<ARENA.y+em){this.y=ARENA.y+em;this.vy=Math.abs(this.vy);}
    else if(this.y>ARENA.y+ARENA.h-em){this.y=ARENA.y+ARENA.h-em;this.vy=-Math.abs(this.vy);}
    this.x+=this.vx;this.y+=this.vy;
    this.tickTimer++;
    const dmgTick=(this.tickTimer%18===0);
    forEachEnemySnapshot(e=>{
      if(e.removed)return;
      const dx=this.x-e.x,dy=this.y-e.y;
      const d=Math.hypot(dx,dy)||1;
      const pullMult=e.isBoss?0.15:1;
      if(d<this.r+e.r){const pull=1.4*pullMult*(1-d/(this.r+e.r));e.kx+=dx/d*pull*8;e.ky+=dy/d*pull*8;}
      if(dmgTick && d<this.hitRadius+e.r){e.takeDamage(this.damage,this.x,this.y,false,this.owner);}
    });
    if(this.tickTimer%3===0){const a=Math.random()*Math.PI*2;const rr=this.r*0.6;addTrail(this.x+Math.cos(a)*rr,this.y+Math.sin(a)*rr,'#a5f3fc',6);}
  }
  draw(){
    const alpha=Math.min(1,this.life/30);const rot=tickMs/80;
    ctx.globalAlpha=alpha;
    for(let ring=0;ring<3;ring++){
      const rr=this.r-ring*22;if(rr<=0)continue;
      ctx.strokeStyle=ring===0?'#67e8f9':'#a5f3fc';ctx.lineWidth=ring===0?4:2;
      const startA=rot*(1+ring*0.5)+ring*1.7;
      ctx.beginPath();ctx.arc(this.x,this.y,rr,startA,startA+Math.PI*1.6);ctx.stroke();
    }
    ctx.globalAlpha=alpha*0.4;ctx.fillStyle='#67e8f9';
    const coreR=this.hitRadius*0.6+Math.sin(tickMs/60)*4;
    ctx.beginPath();ctx.arc(this.x,this.y,coreR,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=alpha*0.85;
    for(let i=0;i<6;i++){const a=rot*1.5+i*Math.PI/3;const rr=this.r*0.7+Math.sin(rot*2+i)*8;ctx.fillStyle='#a5f3fc';ctx.beginPath();ctx.arc(this.x+Math.cos(a)*rr,this.y+Math.sin(a)*rr,3,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
  }
}

class ANBU{
  constructor(x,y,owner){
    this.x=x;this.y=y;this.owner=owner;this.hp=80;this.maxHp=80;this.r=12;this.speed=3.2;
    this.shootTimer=Math.floor(Math.random()*30);this.alive=true;this.hurtFlash=0;
    this.wanderAngle=Math.random()*Math.PI*2;this.wanderTimer=Math.floor(rand(60,120));this.currentTarget=null;
  }
  update(){
    if(!this.alive)return;
    if(this.owner&&!this.owner.alive){this.alive=false;return;}
    if(this.hurtFlash>0)this.hurtFlash--;
    const tgt=findNearestTarget(this,600);this.currentTarget=tgt;
    let fleeX=0,fleeY=0,fleeCount=0;
    for(const e of enemies){const dx=this.x-e.x,dy=this.y-e.y;const d=Math.hypot(dx,dy);if(d<160){fleeX+=dx/(d||1);fleeY+=dy/(d||1);fleeCount++;}}
    for(const b of bosses){const dx=this.x-b.x,dy=this.y-b.y;const d=Math.hypot(dx,dy);if(d<240){fleeX+=dx/(d||1);fleeY+=dy/(d||1);fleeCount++;}}
    let mx=0,my=0;
    if(fleeCount>0){const fl=Math.hypot(fleeX,fleeY);mx=fleeX/fl*this.speed;my=fleeY/fl*this.speed;}
    else if(tgt&&Math.hypot(tgt.x-this.x,tgt.y-this.y)<250){
      const dx=tgt.x-this.x,dy=tgt.y-this.y;const d=Math.hypot(dx,dy)||1;
      const perpX=-dy/d,perpY=dx/d;const backoff=(d<280)?-0.6:0.4;
      mx=(dx/d*backoff+perpX*0.9)*this.speed;my=(dy/d*backoff+perpY*0.9)*this.speed;
    } else {
      this.wanderTimer--;if(this.wanderTimer<=0){this.wanderAngle=Math.random()*Math.PI*2;this.wanderTimer=Math.floor(rand(60,120));}
      mx=Math.cos(this.wanderAngle)*this.speed*0.7;my=Math.sin(this.wanderAngle)*this.speed*0.7;
    }
    const em=80;
    if(this.x<ARENA.x+em)mx+=1.5;if(this.x>ARENA.x+ARENA.w-em)mx-=1.5;
    if(this.y<ARENA.y+em)my+=1.5;if(this.y>ARENA.y+ARENA.h-em)my-=1.5;
    this.x+=mx;this.y+=my;
    this.x=clamp(this.x,ARENA.x+this.r,ARENA.x+ARENA.w-this.r);this.y=clamp(this.y,ARENA.y+this.r,ARENA.y+ARENA.h-this.r);
    if(this.shootTimer>0)this.shootTimer--;
    if(this.shootTimer===0&&tgt){
      const ang=Math.atan2(tgt.y-this.y,tgt.x-this.x);
      const proj=new Projectile(this.x,this.y,ang,this.owner.getDamage()*0.6,'#888',5,11);
      proj.attacker=this.owner;projectiles.push(proj);this.shootTimer=60;
    }
  }
  takeDamage(d){if(!this.alive)return;this.hp-=d;this.hurtFlash=6;if(this.hp<=0){this.hp=0;this.alive=false;spawnShockwave(this.x,this.y,60,'#444');spawnParticles(this.x,this.y,'#444',20);}}
  draw(){
    if(!this.alive)return;
    const fill=this.hurtFlash>0?'#fff':'#2a2a2a';
    ctx.fillStyle=fill;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#666';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#ddd';ctx.beginPath();ctx.arc(this.x,this.y-2,this.r*0.55,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#000';ctx.beginPath();ctx.arc(this.x-3,this.y-2,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(this.x+3,this.y-2,1.5,0,Math.PI*2);ctx.fill();
    if(this.hp<this.maxHp){const bw=24,bh=3;const bx=this.x-bw/2,by=this.y-this.r-6;ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);ctx.fillStyle='#e33';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle='#3e6';ctx.fillRect(bx,by,bw*(this.hp/this.maxHp),bh);}
  }
}
