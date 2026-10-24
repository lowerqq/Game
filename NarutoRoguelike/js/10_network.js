"use strict";

// ==================== СЕТЕВОЙ РЕЖИМ (Trystero P2P) ====================
let room = null;
let isHost = false;
let isClient = false;
let networkState = null;
let lastBroadcast = 0;
let lastInputSent = 0;
let myChar = null;
let partnerChar = null;
let hostReady = false;
let clientReady = false;
let currentRoomCode = null;

const APP_ID = 'naruto-roguelike-v1-final';

function initNetwork(asHost) {
  if (room) return;

  isHost = asHost;
  isClient = !asHost;

  if (isHost) {
    // ═══ ХОСТ: Генерируем случайный код ═══
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    currentRoomCode = `NARUTO-${rand}`;
  } else {
    // ═══ КЛИЕНТ: Спрашиваем код ═══
    currentRoomCode = prompt("Введите код комнаты (например, NARUTO-A1B2):");
    if (!currentRoomCode) { state = 'menu'; return; }
    currentRoomCode = currentRoomCode.trim().toUpperCase();
  }

  try {
    // Подключаемся к P2P комнате
    room = window.Trystero.joinRoom({ appId: APP_ID }, currentRoomCode);

    room.onPeerJoin(peerId => {
      console.log('Соединение установлено с:', peerId);
      if (isHost) {
        // Если хост уже выбрал персонажа, сразу отправляем его клиенту
        if (myChar) room.send({ type: 'partnerChar', charId: myChar });
      } else {
        // Если клиент уже выбрал, отправляем хосту
        if (myChar) room.send({ type: 'lobbySelect', charId: myChar });
      }
    });

    room.onPeerLeave(peerId => {
      console.log('Соединение потеряно с:', peerId);
      if (isClient) {
        alert("Хост отключился или потеряна связь.");
        state = 'menu';
        isClient = false;
        if (room) { room.leave(); room = null; }
      } else if (isHost) {
        clientReady = false;
        partnerChar = null;
      }
    });

    room.onMessage((data, peerId) => {
      if (isHost) {
        // ═══ ХОСТ ПРИНИМАЕТ ДАННЫЕ ═══
        if (data.type === 'input') {
          if (players.length >= 2) {
            const p = players[1];
            p.remoteInput = data.input;
            if (data.input.dash && p.dashCharges > 0 && p.dashTimer <= 0) {
              let dx = 0, dy = 0;
              if (data.input.up) dy--; if (data.input.down) dy++;
              if (data.input.left) dx--; if (data.input.right) dx++;
              p.tryDash(dx, dy);
            }
            if (data.input.q && p.cooldowns[0] <= 0) p.castAbility(0);
            if (data.input.e && p.cooldowns[1] <= 0) p.castAbility(1);
            if (data.input.r && p.cooldowns[2] <= 0) p.castAbility(2);
            if (data.input.space && p.cooldowns[3] <= 0) p.castAbility(3);
            if (data.input.f && p.comboUltCooldown === 0) {
              if (p.charId === 'tenten' || p.comboPoints >= COMBO_COST) p.castComboUlt();
            }
          }
        } else if (data.type === 'clientReady') {
          clientReady = true;
          tryAdvancePhase();
        } else if (data.type === 'clientBuyUpgrade') {
          if (!isHost || players.length < 2) return;
          const p = players[1];
          const d = data.data;
          if (d.type === 'ability') {
            const ab = p.abilities[d.index];
            if (d.track === 'cooldown' && (ab.noCd || ab.cd === 0)) return;
            if (d.track === 'damage' && ab.noDamage) return;
            const up = p.abilityUpgrades[d.index]; const lvl = up[d.track];
            if (lvl >= 3) return;
            const cost = upgradeCost(lvl);
            if (p.coins >= cost) { p.coins -= cost; up[d.track]++; sfxCoin(); }
          } else if (d.type === 'stat') {
            const stat = STAT_UPGRADES[d.statKey]; const lvl = p.statUpgrades[d.statKey];
            if (lvl >= stat.max) return;
            const cost = stat.cost(lvl);
            if (p.coins >= cost) { p.coins -= cost; p.statUpgrades[d.statKey]++; applyStatUpgrade(p, d.statKey); sfxCoin(); }
          } else if (d.type === 'heal') {
            const healCost = 30 + p.healCount * 20;
            if (p.hp < p.maxHp && p.coins >= healCost) { p.coins -= healCost; p.hp = p.maxHp; p.healCount++; sfxCoin(); }
          } else if (d.type === 'anbu') {
            if (p.coins >= 200) { p.coins -= 200; spawnAnbuForPlayer(p); sfxCoin(); }
          }
        } else if (data.type === 'clientBuyArtifact') {
          if (!isHost || players.length < 2 || state !== 'shop' || !shopState) return;
          const ai = data.data.ai;
          if (shopState.bought[1][ai]) return;
          const key = shopState.offers[1][ai];
          if (!key) return;
          const p = players[1];
          const stack = p.getArtifactStack(key);
          if (stack >= ARTIFACTS[key].maxStack) return;
          const price = getArtifactPriceFor(p, key);
          if (p.coins >= price) { p.coins -= price; p.equipArtifact(key); shopState.bought[1][ai] = true; sfxCoin(); }
        } else if (data.type === 'clientAutoChoose') {
          if (!isHost || !autoChoiceState || autoChoiceState.clientPicked) return;
          autoChoiceState.clientKey = data.data.key;
          autoChoiceState.clientPicked = true;
          tryAdvanceAutoUpgrade();
        } else if (data.type === 'lobbySelect') {
          partnerChar = data.charId;
        }
      } else {
        // ═══ КЛИЕНТ ПРИНИМАЕТ ДАННЫЕ ═══
        if (data.type === 'state') {
          networkState = data.data;
        } else if (data.type === 'gameStart') {
          startRun(2, data.data.p2Char, data.data.p1Char);
        } else if (data.type === 'partnerChar') {
          partnerChar = data.charId;
        }
      }
    });

  } catch (e) {
    console.error("Ошибка создания комнаты:", e);
    alert("Ошибка подключения. Убедитесь, что игра открыта через https:// или localhost.");
    state = 'menu';
  }
}

// ═══ ПЕРЕХОД К СЛЕДУЮЩЕЙ ФАЗЕ ═══
function tryAdvancePhase() {
  if (!isHost) return;
  if (!hostReady || !clientReady) return;
  hostReady = false;
  clientReady = false;

  if (state === 'upgrade') {
    if (wave % 5 === 0) {
      for (const p of players) {
        if (!p.alive) continue;
        const avail = ARTIFACT_KEYS.filter(k => p.getArtifactStack(k) < ARTIFACTS[k].maxStack);
        if (avail.length > 0) {
          const key = avail[Math.floor(Math.random() * avail.length)];
          p.equipArtifact(key);
        } else { p.coins += 50 + wave * 3; }
      }
    }
    beginShop();
  } else if (state === 'shop') {
    if (wave % 10 === 0) beginAutoUpgradeSelection();
    else { nextWave(); state = 'playing'; }
  }
}

function tryAdvanceAutoUpgrade() {
  if (!isHost || !autoChoiceState) return;
  const needHost = autoChoiceState.choiceForP0 && !autoChoiceState.hostPicked;
  const needClient = autoChoiceState.choiceForP1 && !autoChoiceState.clientPicked;
  if (needHost || needClient) return;
  if (autoChoiceState.choiceForP0 && autoChoiceState.hostKey) players[0].autoUpgrades[autoChoiceState.hostKey]++;
  if (autoChoiceState.choiceForP1 && autoChoiceState.clientKey) players[1].autoUpgrades[autoChoiceState.clientKey]++;
  autoChoiceState = null;
  hostReady = false;
  clientReady = false;
  nextWave();
  state = 'playing';
}

// ═══ ОТПРАВКА ДАННЫХ ═══
function broadcastState() {
  if (!isHost || !room) return;

  const netParticles = particles.slice(-30).map(p => ({ x: p.x, y: p.y, r: p.r, color: p.color, life: p.life, maxLife: p.maxLife }));
  const netTrails = []; 

  const data = {
    state: state,
    wave: wave, phase: phase, defenseWave: defenseWave, defenseFailCount: defenseFailCount,
    defenseOutcome: defenseOutcome, waveTimer: waveTimer, waveEnded: waveEnded,
    bossWaveActive: bossWaveActive, enemyTier: enemyTier,
    hostReady: hostReady,
    players: players.map(p => ({
      id: p.id, charId: p.charId, isAI: p.isAI,
      x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp, alive: p.alive,
      color: p.color, facing: p.facing, r: p.r, baseR: p.baseR,
      cooldowns: p.cooldowns.slice ? p.cooldowns.slice() : p.cooldowns,
      comboPoints: p.comboPoints, comboUltCooldown: p.comboUltCooldown || 0,
      coins: p.coins, shield: p.shield || 0, regenPerSec: p.regenPerSec || 0,
      hookValue: p.hookValue || 0, hookMax: p.hookMax || 0,
      calories: p.calories || 0, maxCalories: p.maxCalories || 100,
      fanLevel: p.fanLevel || 1, fanOpenTimer: p.fanOpenTimer || 0,
      hakkeCount: p.hakkeCount || 0, tentenStanceIndex: p.tentenStanceIndex || 0,
      sasukeMode: p.sasukeMode || 'sharingan',
      abilityUpgrades: p.abilityUpgrades, statUpgrades: p.statUpgrades, healCount: p.healCount, artifacts: p.artifacts,
      autoUpgrades: p.autoUpgrades, currentAutoKey: p.currentAutoKey,
      dashCharges: p.dashCharges, maxDashCharges: p.maxDashCharges, dashRechargeTimer: p.dashRechargeTimer,
      sasoriOrbitAngle: p.sasoriOrbitAngle || 0, sasoriCooldown: p.sasoriCooldown || 0,
      invuln: p.invuln, hurtFlash: p.hurtFlash, invisibleTimer: p.invisibleTimer,
      castRingTimer: p.castRingTimer, castRingColor: p.castRingColor,
      meleeSwipeTimer: p.meleeSwipeTimer, meleeSwipeAim: p.meleeSwipeAim,
      kyuubiComboTimer: p.kyuubiComboTimer, sageTimer: p.sageTimer, susanooTimer: p.susanooTimer,
      byakugoTimer: p.byakugoTimer, twoHeadedTimer: p.twoHeadedTimer, eightGatesTimer: p.eightGatesTimer,
      kaitenTimer: p.kaitenTimer, byakuganTimer: p.byakuganTimer, wolfTimer: p.wolfTimer,
      heavenlyTimer: p.heavenlyTimer, shukakuTimer: p.shukakuTimer, shukakuTailAngle: p.shukakuTailAngle,
      shadowChokeTimer: p.shadowChokeTimer, rollingTimer: p.rollingTimer, rollingAim: p.rollingAim,
      giantTimer: p.giantTimer, butterflyTimer: p.butterflyTimer, eatTimer: p.eatTimer,
      sakuraJumpActive: !!p.sakuraJumpActive, sakuraJumpTimer: p.sakuraJumpTimer,
      vanishedTimer: p.vanishedTimer, piercingFangTimer: p.piercingFangTimer, piercingFangAim: p.piercingFangAim,
      sandWaveTimer: p.sandWaveTimer, sandWaveX: p.sandWaveX, sandWaveY: p.sandWaveY, sandWaveAuraR: p.sandWaveAuraR,
      shootBlockedTimer: p.shootBlockedTimer, byakugoNoInTimer: p.byakugoNoInTimer, leeGateCount: p.leeGateCount,
      flyingBugActive: !!p.flyingBugActive, flyingBugRiding: !!p.flyingBugRiding, bugAuraTick: p.bugAuraTick,
      sakuraHealingActive: !!p.sakuraHealingActive,
      sakuraHealingTargetId: (p.sakuraHealingTarget ? p.sakuraHealingTarget.id : null),
      kusanagiSwords: p.kusanagiSwords ? p.kusanagiSwords.map(s => ({ x: s.x, y: s.y, angle: s.angle })) : []
    })),
    enemies: enemies.map(e => ({
      x: e.x, y: e.y, r: e.r, color: e.color, hp: e.hp, maxHp: e.maxHp,
      type: e.type, specialType: e.specialType || null, shape: e.shape || null,
      hurtFlash: e.hurtFlash, isPhased: !!e.isPhased, stunTimer: e.stunTimer,
      slowTimer: e.slowTimer, hyperSlowTimer: e.hyperSlowTimer, shield: e.shield,
      _samuraiBlocking: !!e._samuraiBlocking, _samuraiFacing: e._samuraiFacing,
      dashDir: e.dashDir, chargeState: e.chargeState,
      bugMarkTimer: e.bugMarkTimer, wolfMarkTimer: e.wolfMarkTimer, bleedTimer: e.bleedTimer,
      parasiteStacks: e.parasiteStacks, sealStacks: e.sealStacks, weakPointTimer: e.weakPointTimer,
      curseMarks: e.curseMarks,
      shadowWebTimer: e.shadowWebTimer, shadowWebOwnerId: e.shadowWebOwner ? e.shadowWebOwner.id : null,
      mindControlTimer: e.mindControlTimer
    })),
    bosses: bosses.map(b => ({
      x: b.x, y: b.y, r: b.r, color: b.color, hp: b.hp, maxHp: b.maxHp, tails: b.tails, phase: b.phase, name: b.name,
      hurtFlash: b.hurtFlash, charging: !!b.charging, chargeTimer: b.chargeTimer,
      phaseTransitionTimer: b.phaseTransitionTimer, introTimer: b.introTimer,
      bugMarkTimer: b.bugMarkTimer, wolfMarkTimer: b.wolfMarkTimer, bleedTimer: b.bleedTimer,
      parasiteStacks: b.parasiteStacks, sealStacks: b.sealStacks, weakPointTimer: b.weakPointTimer,
      curseMarks: b.curseMarks,
      shadowWebTimer: b.shadowWebTimer, shadowWebOwnerId: b.shadowWebOwner ? b.shadowWebOwner.id : null
    })),
    projectiles: projectiles.map(p => ({ 
      x: p.x, y: p.y, r: p.r, color: p.color, vx: p.vx, vy: p.vy,
      isRasenshuriken: !!p.isRasenshuriken, isFumaShuriken: !!p.isFumaShuriken,
      isTentenSword: !!p.isTentenSword, isSusanooArrow: !!p.isSusanooArrow, isShikamaruNeedle: !!p.isShikamaruNeedle 
    })),
    enemyProjectiles: enemyProjectiles.map(p => ({ x: p.x, y: p.y, r: p.r, homing: !!p.homing })),
    clones: clones.map(c => ({ x: c.x, y: c.y, r: c.r, color: c.color, mode: c.mode, isLivingPuppet: !!c.isLivingPuppet,
      hp: c.hp || 0, maxHp: c.maxHp || 0, life: c.life, maxLife: c.maxLife })),
    pets: pets.map(pt => ({ x: pt.x, y: pt.y, r: pt.r, type: pt.type, hp: pt.hp || 0, maxHp: pt.maxHp || 0,
      rageMode: !!pt.rageMode, life: pt.life, maxLife: pt.maxLife, hurtFlash: pt.hurtFlash })),
    zones: zones.map(z => ({ x: z.x, y: z.y, r: z.r, color: z.color, life: z.life, maxLife: z.maxLife,
      isAmaterasu: !!z.isAmaterasu, isPoisonGround: !!z.isPoisonGround, isQuicksand: !!z.isQuicksand, isPetal: !!z.isPetal,
      isWindCircle: !!z.isWindCircle, isVortex: !!z.isVortex, isCrater: !!z.isCrater, isDecoy: !!z.isDecoy,
      isParasite: !!z.isParasite, isWindTrail: !!z.isWindTrail })),
    mines: mines.map(m => ({ x: m.x, y: m.y, r: m.r, life: m.life, exploded: !!m.exploded })),
    tornadoes: tornadoes.map(t => ({ x: t.x, y: t.y, r: t.r, hitRadius: t.hitRadius, life: t.life, maxLife: t.maxLife })),
    cocoons: cocoons.map(c => ({ x: c.x, y: c.y, r: c.r, hp: c.hp, maxHp: c.maxHp })),
    swarms: swarms.map(s => ({ x: s.x, y: s.y, r: s.r, hp: s.hp, maxHp: s.maxHp, life: s.life })),
    tentenSeals: tentenSeals.map(s => ({ x: s.x, y: s.y, r: s.r, armTime: s.armTime })),
    tentenSwords: tentenSwords.map(s => ({ x: s.x, y: s.y, angle: s.angle, offset: s.offset })),
    whiteFangSwords: whiteFangSwords.map(w => ({ x: w.x, y: w.y })),
    beams: beams.map(b => ({ x: b.x, y: b.y, ang: b.ang, length: b.length, width: b.width, color: b.color, life: b.life, maxLife: b.maxLife, targetPlayers: !!b.targetPlayers })),
    beamWarnings: beamWarnings.map(w => ({ x: w.x, y: w.y, ang: w.ang, length: w.length, width: w.width, color: w.color, delay: w.delay, maxDelay: w.maxDelay })),
    telegraphs: telegraphs.map(t => ({ x: t.x, y: t.y, r: t.r, color: t.color, delay: t.delay, maxDelay: t.maxDelay, exploded: !!t.exploded, life: t.life })),
    chibakuBalls: chibakuBalls.map(cb => ({ x: cb.x, y: cb.y, r: cb.r, phase: cb.phase, pullRadius: cb.pullRadius })),
    spawnMarkers: spawnMarkers.map(m => ({ x: m.x, y: m.y, timer: m.timer, maxTimer: m.maxTimer, isBoss: !!m.isBoss, specialType: m.specialType || null })),
    anbuSquads: anbuSquads.map(s => ({ members: s.members.map(a => ({ x: a.x, y: a.y, r: a.r, hp: a.hp, maxHp: a.maxHp, alive: a.alive, hurtFlash: a.hurtFlash })) })),
    shopState: (state === 'shop') ? shopState : null,
    autoChoiceData: (state === 'autoUpgrade' && autoChoiceState) ? {
      choiceForP1: autoChoiceState.choiceForP1, autoAppliedForP1: autoChoiceState.autoAppliedForP1, clientPicked: autoChoiceState.clientPicked
    } : null,
    particles: netParticles, trails: netTrails,
    damageNumbers: damageNumbers.slice(-15).map(d => ({ x: d.x, y: d.y, amount: d.amount, color: d.color, isCrit: d.isCrit, life: d.life, maxLife: d.maxLife, offset: d.offset })),
    shockwaves: shockwaves.slice(-10).map(s => ({ x: s.x, y: s.y, r: s.r, maxR: s.maxR, color: s.color, life: s.life, maxLife: s.maxLife }))
  };
  
  room.send({ type: 'state', data: data });
}

function sendInputIfClient() {
  if (!isClient || !room) return;
  const now = performance.now();
  if (now - lastInputSent < 50) return;
  lastInputSent = now;
  room.send({ type: 'input', input: {
    up: keys['ArrowUp'] || keys['KeyW'], down: keys['ArrowDown'] || keys['KeyS'],
    left: keys['ArrowLeft'] || keys['KeyA'], right: keys['ArrowRight'] || keys['KeyD'],
    dash: keys['ShiftLeft'] || keys['ShiftRight'],
    q: keys['KeyQ'] || keys['KeyU'], e: keys['KeyE'] || keys['KeyI'],
    r: keys['KeyR'] || keys['KeyO'], space: keys['Space'] || keys['KeyP'],
    f: keys['KeyF'] || keys['KeyL']
  }});
}

// ==================== ЛОББИ ====================
function drawNetworkLobby() {
  ctx.fillStyle = '#0f0f18'; ctx.fillRect(0,0,W,H); ctx.textAlign = 'center';
  ctx.fillStyle = '#eee'; ctx.font = 'bold 40px monospace'; ctx.fillText('ЛОББИ СЕТЕВОЙ ИГРЫ', W/2, 60);
  ctx.font = 'bold 20px monospace';
  
  if (isHost) { 
    ctx.fillStyle = '#ff9900'; 
    ctx.fillText('ВЫ - ХОСТ', W/2, 100); 
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(`КОД КОМНАТЫ: ${currentRoomCode}`, W/2, 140);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Отправьте этот код другу', W/2, 170);
  } else { 
    ctx.fillStyle = '#e74c3c'; 
    ctx.fillText('ВЫ - КЛИЕНТ', W/2, 100); 
    ctx.fillStyle = '#aaa'; 
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`Подключение к комнате: ${currentRoomCode}`, W/2, 140);
  }

  const cards = getCharSelectLayout();
  if (!myChar) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px monospace';
    ctx.fillText('Выберите своего персонажа:', W/2, 200);
    for (const card of cards) drawCharacterCard(card.x, card.y, card.w, card.h, card.id, '#fff', false);
  } else {
    ctx.fillStyle = '#4caf50'; ctx.font = 'bold 28px monospace';
    ctx.fillText(`Вы выбрали: ${CHARACTERS[myChar].name}`, W/2, 220);
    if (partnerChar) {
      ctx.fillStyle = '#ffd700'; ctx.fillText(`Партнер выбрал: ${CHARACTERS[partnerChar].name}`, W/2, 270);
      if (isHost) { const bw=300,bh=70,bx=W/2-bw/2,by=H/2+50; drawButton(bx,by,bw,bh,'НАЧАТЬ ИГРУ','#4caf50',isHover(bx,by,bw,bh)); }
      else { ctx.fillStyle = '#aaa'; ctx.font = 'bold 20px monospace'; ctx.fillText('Ждем хоста...', W/2, 320); }
    } else { 
      ctx.fillStyle = '#aaa'; ctx.font = 'bold 20px monospace'; 
      ctx.fillText('Ждем партнера...', W/2, 270); 
    }
  }
}

function updateNetworkLobby() {
  if (!mouse.clicked) return;
  if (!myChar) {
    const cards = getCharSelectLayout();
    for (const c of cards) if (isHover(c.x, c.y, c.w, c.h)) { 
      myChar = c.id; 
      if (room) room.send({ type: 'lobbySelect', charId: myChar }); 
      return; 
    }
  } else if (isHost && partnerChar) {
    const bw=300,bh=70,bx=W/2-bw/2,by=H/2+50;
    if (isHover(bx,by,bw,bh)) startRun(2, myChar, partnerChar);
  }
}

// ==================== ПЕРЕХВАТ ЦИКЛА ====================
function syncClientState() {
  if (!isClient || !networkState || players.length < 2) return;

  wave = networkState.wave || 0; 
  phase = networkState.phase || 'normal';
  applyPhaseArena();
  defenseWave = networkState.defenseWave || 0; 
  defenseFailCount = networkState.defenseFailCount || 0;
  defenseOutcome = networkState.defenseOutcome || null; 
  waveTimer = networkState.waveTimer || 0;
  waveEnded = !!networkState.waveEnded; 
  bossWaveActive = !!networkState.bossWaveActive; 
  enemyTier = networkState.enemyTier || 0;
  hostReady = networkState.hostReady || false;

  if (networkState.players && networkState.players.length >= 2) {
    applyPlayerState(players[0], networkState.players[1]);
    applyPlayerState(players[1], networkState.players[0]);
  }

  if (networkState.state === 'shop' && networkState.shopState) {
    shopState = { offers: [networkState.shopState.offers[1]], bought: [networkState.shopState.bought[1]] };
  }
}

const _originalUpdate = update;
update = function() {
  if (state === 'networkLobby') { updateNetworkLobby(); mouse.clicked = false; return; }
  
  if (isClient && networkState) {
    syncClientState();
    const hs = networkState.state || 'playing';
    if (hs !== state && (hs === 'playing' || hs === 'upgrade' || hs === 'shop' || hs === 'autoUpgrade')) {
       clientReady = false;
       state = hs;
    }
  }
  
  _originalUpdate();
  
  if (isHost && room) {
    const now = performance.now();
    if (now - lastBroadcast > 40) { lastBroadcast = now; broadcastState(); }
  }
};

const _originalDraw = draw;
draw = function() {
  if (state === 'networkLobby') { drawNetworkLobby(); return; }
  if (isClient && networkState) {
    const hs = networkState.state || 'playing';
    if (hs !== 'playing' && hs !== 'upgrade' && hs !== 'shop' && hs !== 'autoUpgrade') {
      drawWorld(); drawOverlays();
      ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 46px monospace'; ctx.textAlign = 'center';
      let msg = 'ОЖИДАНИЕ ХОСТА';
      if (hs === 'dead') msg = 'ХОСТ ПОГИБ';
      else if (hs === 'artifact') msg = 'ХОСТ ВЫБИРАЕТ АРТЕФАКТ';
      else if (hs === 'sasukeMode') msg = 'ХОСТ ВЫБИРАЕТ ДОДЗЮЦУ';
      ctx.fillText(msg, W / 2, H / 2);
      ctx.font = 'bold 20px monospace'; ctx.fillStyle = '#aaa';
      ctx.fillText('Подождите...', W / 2, H / 2 + 55);
      ctx.textAlign = 'left';
      if (paused) drawPauseMenu();
      return;
    }
  }
  _originalDraw();
};

// ==================== ИГРОВОЙ ЦИКЛ В СЕТИ ====================
function applyPlayerState(target, src) {
  if (!src) return;
  target.x = src.x; target.y = src.y; target.hp = src.hp; target.maxHp = src.maxHp; target.alive = src.alive;
  target._networkId = src.id;
  target.prevX = target.x; target.prevY = target.y;
  target.facing = src.facing; target.r = src.r || target.baseR; target.baseR = src.baseR || target.baseR;
  target.dashCharges = src.dashCharges !== undefined ? src.dashCharges : target.dashCharges;
  target.maxDashCharges = src.maxDashCharges !== undefined ? src.maxDashCharges : target.maxDashCharges;
  target.dashRechargeTimer = src.dashRechargeTimer || 0;
  target.sasoriOrbitAngle = src.sasoriOrbitAngle || 0;
  target.sasoriCooldown = src.sasoriCooldown || 0;
  target.cooldowns = src.cooldowns.slice ? src.cooldowns.slice() : src.cooldowns;
  target.comboPoints = src.comboPoints; target.comboUltCooldown = src.comboUltCooldown || 0;
  target.coins = src.coins; target.shield = src.shield || 0; target.regenPerSec = src.regenPerSec || 0;
  target.hookValue = src.hookValue || 0; target.hookMax = src.hookMax || 0;
  target.calories = src.calories || 0; target.maxCalories = src.maxCalories || 100;
  target.fanLevel = src.fanLevel || 1; target.fanOpenTimer = src.fanOpenTimer || 0;
  target.hakkeCount = src.hakkeCount || 0; target.tentenStanceIndex = src.tentenStanceIndex || 0;
  const newMode = src.sasukeMode || 'sharingan';
  if (target.charId === 'sasuke' && target.sasukeMode !== newMode) target.setSasukeMode(newMode);
  target.sasukeMode = newMode;
  if (src.abilityUpgrades) target.abilityUpgrades = JSON.parse(JSON.stringify(src.abilityUpgrades));
  if (src.statUpgrades) target.statUpgrades = JSON.parse(JSON.stringify(src.statUpgrades));
  if (src.autoUpgrades) target.autoUpgrades = JSON.parse(JSON.stringify(src.autoUpgrades));
  target.currentAutoKey = src.currentAutoKey || null;
  target.healCount = src.healCount || 0;
  if (src.artifacts) target.artifacts = JSON.parse(JSON.stringify(src.artifacts));

  target.invuln = src.invuln || 0; target.hurtFlash = src.hurtFlash || 0; target.invisibleTimer = src.invisibleTimer || 0;
  target.castRingTimer = src.castRingTimer || 0; target.castRingColor = src.castRingColor || '#fff';
  target.meleeSwipeTimer = src.meleeSwipeTimer || 0; target.meleeSwipeAim = src.meleeSwipeAim || 0;
  target.kyuubiComboTimer = src.kyuubiComboTimer || 0; target.sageTimer = src.sageTimer || 0; target.susanooTimer = src.susanooTimer || 0;
  target.byakugoTimer = src.byakugoTimer || 0; target.twoHeadedTimer = src.twoHeadedTimer || 0; target.eightGatesTimer = src.eightGatesTimer || 0;
  target.kaitenTimer = src.kaitenTimer || 0; target.byakuganTimer = src.byakuganTimer || 0; target.wolfTimer = src.wolfTimer || 0;
  target.heavenlyTimer = src.heavenlyTimer || 0; target.shukakuTailAngle = src.shukakuTailAngle || 0;
  target.shadowChokeTimer = src.shadowChokeTimer || 0; target.rollingTimer = src.rollingTimer || 0; target.rollingAim = src.rollingAim || 0;
  target.giantTimer = src.giantTimer || 0; target.butterflyTimer = src.butterflyTimer || 0; target.eatTimer = src.eatTimer || 0;
  target.sakuraJumpActive = !!src.sakuraJumpActive; target.sakuraJumpTimer = src.sakuraJumpTimer || 0;
  target.vanishedTimer = src.vanishedTimer || 0; target.piercingFangTimer = src.piercingFangTimer || 0; target.piercingFangAim = src.piercingFangAim || 0;
  target.sandWaveTimer = src.sandWaveTimer || 0; target.sandWaveX = src.sandWaveX || 0; target.sandWaveY = src.sandWaveY || 0; target.sandWaveAuraR = src.sandWaveAuraR || 160;
  target.shootBlockedTimer = src.shootBlockedTimer || 0; target.byakugoNoInTimer = src.byakugoNoInTimer || 0; target.leeGateCount = src.leeGateCount || 0;
  target.flyingBugActive = !!src.flyingBugActive; target.flyingBugRiding = !!src.flyingBugRiding; target.bugAuraTick = src.bugAuraTick || 0;
  target.sakuraHealingActive = !!src.sakuraHealingActive;
  target.sakuraHealingTarget = src.sakuraHealingTargetId !== null ? players.find(p=>p.id===src.sakuraHealingTargetId) : null;
}

const _originalUpdatePlaying = updatePlaying;
updatePlaying = function() {
  if (isClient) {
    sendInputIfClient();
    enemies.length = 0; bosses.length = 0; spawnMarkers.length = 0;
    projectiles.length = 0; enemyProjectiles.length = 0;
    clones.length = 0; pets.length = 0; zones.length = 0;
    mines.length = 0; beams.length = 0; beamWarnings.length = 0;
    telegraphs.length = 0; tornadoes.length = 0; cocoons.length = 0;
    swarms.length = 0; tentenSeals.length = 0; tentenSwords.length = 0;
    chibakuBalls.length = 0; whiteFangSwords.length = 0; anbuSquads.length = 0;
    particles.length = 0; trails.length = 0;
    return;
  }
  _originalUpdatePlaying();
};

// ==================== КЛИЕНТ: ОТРИСОВКА ====================
const _originalDrawWorld = drawWorld;
drawWorld = function() {
  if (!isClient || !networkState) { _originalDrawWorld(); return; }
  _originalDrawWorld();
  const ns = networkState;

  if (ns.trails) for (const t of ns.trails) drawNetTrail(t);
  if (ns.zones) for (const z of ns.zones) drawNetZone(z);
  if (ns.whiteFangSwords) for (const w of ns.whiteFangSwords) drawNetWhiteFang(w);
  if (ns.spawnMarkers) for (const m of ns.spawnMarkers) drawNetSpawnMarker(m);
  if (ns.telegraphs) for (const t of ns.telegraphs) drawNetTelegraph(t);
  if (ns.mines) for (const m of ns.mines) drawNetMine(m);
  if (ns.tornadoes) for (const t of ns.tornadoes) drawNetTornado(t);
  if (ns.tentenSeals) for (const s of ns.tentenSeals) drawNetTentenSeal(s);
  if (ns.tentenSwords) for (const s of ns.tentenSwords) drawNetTentenSword(s);
  if (ns.cocoons) for (const c of ns.cocoons) drawNetCocoon(c);
  if (ns.swarms) for (const s of ns.swarms) drawNetSwarm(s);
  if (ns.chibakuBalls) for (const cb of ns.chibakuBalls) drawNetChibaku(cb);
  if (ns.particles) for (let i = 0; i < Math.min(ns.particles.length, 25); i++) drawNetParticle(ns.particles[i]);
  if (ns.beamWarnings) for (const w of ns.beamWarnings) drawNetBeamWarning(w);
  if (ns.beams) for (const b of ns.beams) drawNetBeam(b);

  if (ns.enemies) for (const e of ns.enemies) drawNetEnemy(e);
  if (ns.bosses) for (const b of ns.bosses) drawNetBoss(b);
  if (ns.clones) for (const c of ns.clones) drawNetClone(c);
  if (ns.pets) for (const pt of ns.pets) drawNetPet(pt);
  if (ns.anbuSquads) for (const squad of ns.anbuSquads) for (const a of squad.members) if (a.alive) drawNetANBU(a);

  if (ns.projectiles) for (const p of ns.projectiles) drawNetProjectile(p);
  if (ns.enemyProjectiles) for (const p of ns.enemyProjectiles) drawNetEnemyProjectile(p);
  if (ns.shockwaves) for (const s of ns.shockwaves) drawNetShockwave(s);

  if (ns.players) for (const p of ns.players) if (p.kusanagiSwords) for (const s of p.kusanagiSwords) drawNetKusanagi(s);
  if (ns.damageNumbers) for (const d of ns.damageNumbers) drawNetDamageNumber(d);
};

const _originalDrawMenu = drawMenu;
drawMenu = function() {
  _originalDrawMenu();
  const bw = 400, bh = 70, bx = W/2 - bw/2;
  drawButton(bx, 560, bw, bh, 'СОЗДАТЬ ИГРУ (ХОСТ)', '#ff9900', isHover(bx, 560, bw, bh));
  drawButton(bx, 650, bw, bh, 'ПРИСОЕДИНИТЬСЯ', '#e74c3c', isHover(bx, 650, bw, bh));
};
const _originalUpdateMenu = updateMenu;
updateMenu = function() {
  _originalUpdateMenu();
  const bw = 400, bh = 70, bx = W/2 - bw/2;
  if (mouse.clicked) {
    if (isHover(bx, 560, bw, bh)) { initNetwork(true); myChar = null; partnerChar = null; }
    else if (isHover(bx, 650, bw, bh)) { initNetwork(false); myChar = null; partnerChar = null; }
  }
};

// ==================== ХЕЛПЕРЫ ОТРИСОВКИ ====================
function drawNetTrail(t) { ctx.globalAlpha = (t.life / Math.max(1, t.maxLife)) * 0.5; ctx.fillStyle = t.color; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
function drawNetParticle(p) { ctx.globalAlpha = p.life / Math.max(1, p.maxLife); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
function drawNetKusanagi(s) {
  ctx.globalAlpha = 0.85; ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.angle + Math.PI / 2);
  ctx.shadowColor = '#e2e8f0'; ctx.shadowBlur = 12; ctx.fillStyle = '#e2e8f0';
  ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(4, 8); ctx.lineTo(0, 14); ctx.lineTo(-4, 8); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1;
}
function drawNetZone(z) {
  if(z.isPoisonGround){
    const alpha=Math.min(1,z.life/60);
    ctx.globalAlpha=alpha*0.5; ctx.fillStyle='#84cc16';
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=alpha*0.9; ctx.strokeStyle='#a3e635';ctx.lineWidth=2;
    ctx.setLineDash([6,4]);ctx.lineDashOffset=-tickMs/40;
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();
    ctx.setLineDash([]);
    const t=tickMs/150;
    for(let i=0;i<4;i++){
      const a=t+i*Math.PI/2;
      const rr=z.r*(0.4+0.3*Math.sin(t+i));
      ctx.globalAlpha=alpha*0.7; ctx.fillStyle='#84cc16';
      ctx.beginPath();ctx.arc(z.x+Math.cos(a)*rr,z.y+Math.sin(a)*rr,4,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;return;
  }
  if(z.isQuicksand){
    const t=tickMs/200;
    const alpha=Math.min(1,z.life/60);
    ctx.globalAlpha=alpha*(0.5+0.2*Math.sin(t));
    ctx.fillStyle='#7c2d12';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=alpha*0.7; ctx.strokeStyle='#a16207';ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<7;i++){
      const a=t+i*Math.PI*2/7;
      const rr=z.r*(0.3+0.5*Math.abs(Math.sin(t*0.7+i)));
      ctx.globalAlpha=alpha*0.65; ctx.fillStyle=i%2?'#d97706':'#fbbf24';
      ctx.beginPath();ctx.arc(z.x+Math.cos(a)*rr,z.y+Math.sin(a)*rr,7,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;return;
  }
  if(z.isVortex){
    const t=tickMs/60;const alpha=Math.min(1,z.life/30);
    ctx.globalAlpha=alpha*0.6;ctx.strokeStyle='#a5f3fc';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=alpha*0.8;
    for(let i=0;i<4;i++){const a=t+i*Math.PI/2;ctx.save();ctx.translate(z.x,z.y);ctx.rotate(a);ctx.fillStyle='#67e8f9';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(z.r*0.9,-z.r*0.2);ctx.lineTo(z.r*0.9,z.r*0.2);ctx.closePath();ctx.fill();ctx.restore();}
    ctx.globalAlpha=alpha*0.5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(z.x,z.y,z.r*0.25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return;
  }
  if(z.isWindCircle){
    const alpha=Math.min(1,z.life/60);
    ctx.globalAlpha=alpha*(0.5+0.2*Math.sin(tickMs/100));
    ctx.strokeStyle='#a5f3fc';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();
    const rot=tickMs/400;
    ctx.globalAlpha=alpha*0.6;ctx.lineWidth=2;ctx.strokeStyle='#67e8f9';
    for(let i=0;i<4;i++){const a=rot+i*Math.PI/2;const ox=z.x+Math.cos(a)*z.r*0.65;const oy=z.y+Math.sin(a)*z.r*0.65;ctx.beginPath();ctx.arc(ox,oy,z.r*0.35,a,a+Math.PI*1.2);ctx.stroke();}
    ctx.globalAlpha=1;return;
  }
  if(z.isPetal){
    const t=tickMs/200;
    const alpha=Math.min(1,z.life/30);
    ctx.globalAlpha=alpha*0.7;
    for(let i=0;i<8;i++){
      const a=t+i*Math.PI/4;
      const rr=z.r*(0.3+0.7*Math.abs(Math.sin(t*0.5+i)));
      ctx.fillStyle=i%2===0?'#f9a8d4':'#ec4899';
      ctx.beginPath();ctx.ellipse(z.x+Math.cos(a)*rr,z.y+Math.sin(a)*rr,8,4,a,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=alpha*0.4; ctx.strokeStyle='#ec4899';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;return;
  }
  if(z.isAmaterasu){
    ctx.globalAlpha=0.6+0.2*Math.sin(tickMs/100);ctx.fillStyle='#0a0a0a';
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=0.7;ctx.strokeStyle='#7c3aed';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;return;
  }
  if(z.isParasite){
    const t=tickMs/80;for(let i=0;i<6;i++){const a=t+i*Math.PI/3;const rr=z.r*(0.6+0.4*Math.sin(t*2+i));ctx.fillStyle='#84cc16';ctx.globalAlpha=0.6;ctx.beginPath();ctx.arc(z.x+Math.cos(a)*rr,z.y+Math.sin(a)*rr,4,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=0.4;ctx.strokeStyle='#84cc16';ctx.lineWidth=2;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;return;
  }
  if(z.isWindTrail){
    const lifeRatio=z.life/z.maxLife;ctx.globalAlpha=0.3*lifeRatio+0.1*Math.sin(tickMs/80);
    ctx.strokeStyle='#a5f3fc';ctx.lineWidth=3;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(z.x,z.y,z.r-i*15,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;return;
  }
  if(z.isCrater){
    ctx.globalAlpha=0.3;ctx.fillStyle='#3a3a4a';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=0.6;ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;return;
  }
  ctx.globalAlpha=0.35+0.15*Math.sin(tickMs/100);ctx.fillStyle=z.color;
  ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=0.9;ctx.strokeStyle='#f87171';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
}
function drawNetWhiteFang(w) {
  ctx.globalAlpha = 0.25; ctx.fillStyle = '#e2e8f0';
  ctx.beginPath(); ctx.arc(w.x, w.y, 60, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.9; ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(w.x, w.y, 150, 0, Math.PI * 2); ctx.stroke();
  ctx.save(); ctx.translate(w.x, w.y);
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-9, 12); ctx.lineTo(9, 12); ctx.stroke(); ctx.restore();
  ctx.globalAlpha = 1;
}
function drawNetSpawnMarker(m) {
  const t = 1 - m.timer / Math.max(1, m.maxTimer);
  const isBoss = !!m.isBoss; const isSpecial = !!m.specialType || isBoss;
  const color = isBoss ? '#ff6600' : (isSpecial ? '#ffd700' : '#ff3333');
  const pulse = 22 + 4 * Math.sin(tickMs / 80) + (isBoss ? 15 : 0);
  ctx.globalAlpha = 0.3 + 0.4 * Math.sin(tickMs / 100); ctx.strokeStyle = color; ctx.lineWidth = isBoss ? 5 : 3;
  ctx.beginPath(); ctx.arc(m.x, m.y, pulse, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.4; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(m.x, m.y, pulse * t, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
}
function drawNetTelegraph(t) {
  if (!t.exploded) {
    const prog = 1 - t.delay / Math.max(1, t.maxDelay);
    ctx.globalAlpha = 0.2 + 0.3 * prog; ctx.fillStyle = t.color;
    ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.8; ctx.strokeStyle = t.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.stroke();
  } else {
    const a = Math.max(0, t.life / 25); ctx.globalAlpha = a; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(t.x, t.y, t.r * (1 - (1 - a) * 0.7), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function drawNetMine(m) {
  if (m.exploded) { const a = Math.max(0, m.life / 12); ctx.globalAlpha = a; ctx.fillStyle = '#84cc16'; ctx.beginPath(); ctx.arc(m.x, m.y, 100 * (1 - a), 0, Math.PI * 2); ctx.fill(); }
  else { ctx.globalAlpha = 0.7 + 0.3 * Math.sin(tickMs / 100); ctx.fillStyle = '#84cc16'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(m.x, m.y, m.r + 3, 0, Math.PI * 2); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function drawNetTornado(t) {
  const rot = tickMs / 80; ctx.globalAlpha = 0.8;
  for (let ring = 0; ring < 3; ring++) { const rr = t.r - ring * 22; if (rr <= 0) continue;
    ctx.strokeStyle = ring === 0 ? '#67e8f9' : '#a5f3fc'; ctx.lineWidth = ring === 0 ? 4 : 2;
    const startA = rot * (1 + ring * 0.5) + ring * 1.7;
    ctx.beginPath(); ctx.arc(t.x, t.y, rr, startA, startA + Math.PI * 1.6); ctx.stroke(); }
  ctx.globalAlpha = 0.4; ctx.fillStyle = '#67e8f9'; ctx.beginPath(); ctx.arc(t.x, t.y, t.hitRadius * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}
function drawNetTentenSeal(s) {
  const pulse = 1 + 0.15 * Math.sin(tickMs / 200);
  const alpha = s.armTime > 0 ? 0.4 + 0.4 * (1 - s.armTime / 15) : 1;
  ctx.globalAlpha = alpha; ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(s.x - 8, s.y); ctx.lineTo(s.x + 8, s.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s.x, s.y - 8); ctx.lineTo(s.x, s.y + 8); ctx.stroke();
  ctx.globalAlpha = 1;
}
function drawNetTentenSword(s) {
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.angle + s.offset + Math.PI / 2);
  ctx.shadowColor = '#a5f3fc'; ctx.shadowBlur = 10; ctx.fillStyle = '#e2e8f0';
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(5, 9); ctx.lineTo(0, 15); ctx.lineTo(-5, 9); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}
function drawNetCocoon(c) {
  const pulse = 1 + 0.1 * Math.sin(tickMs / 200);
  ctx.globalAlpha = 0.6; ctx.fillStyle = '#84cc16'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1; ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c.x, c.y, c.r * pulse, 0, Math.PI * 2); ctx.stroke();
  const bw = 50, bh = 5, bx = c.x - bw / 2, by = c.y - c.r - 12;
  ctx.fillStyle = '#000'; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
  ctx.fillStyle = '#e33'; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#84cc16'; ctx.fillRect(bx, by, bw * (c.hp / Math.max(1, c.maxHp)), bh);
}
function drawNetSwarm(s) {
  const t = tickMs / 100; ctx.fillStyle = '#84cc16';
  for (let i = 0; i < 3; i++) { const a = t + i * Math.PI * 2 / 3; ctx.beginPath(); ctx.arc(s.x + Math.cos(a) * 6, s.y + Math.sin(a) * 6, 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.stroke();
}
function drawNetChibaku(cb) {
  if (cb.phase === 'pull') { const t = tickMs / 200; ctx.globalAlpha = 0.1 + 0.08 * Math.sin(t * 2); ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.arc(cb.x, cb.y, cb.pullRadius, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1; const grd = ctx.createRadialGradient(cb.x, cb.y, 0, cb.x, cb.y, cb.r);
  grd.addColorStop(0, '#000'); grd.addColorStop(1, '#7c3aed'); ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cb.x, cb.y, cb.r, 0, Math.PI * 2); ctx.fill();
}
function drawNetBeamWarning(w) {
  const t = 1 - Math.max(0, w.delay) / Math.max(1, w.maxDelay);
  const ex = w.x + Math.cos(w.ang) * w.length; const ey = w.y + Math.sin(w.ang) * w.length;
  ctx.globalAlpha = 0.2 + 0.5 * Math.max(0, t); ctx.strokeStyle = w.color; ctx.lineWidth = w.width * (0.3 + 0.7 * Math.max(0, t));
  ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(ex, ey); ctx.stroke(); ctx.globalAlpha = 1;
}
function drawNetBeam(b) {
  const alpha = b.life / Math.max(1, b.maxLife);
  const ex = b.x + Math.cos(b.ang) * b.length; const ey = b.y + Math.sin(b.ang) * b.length;
  ctx.globalAlpha = Math.max(0, alpha); ctx.strokeStyle = b.color; ctx.lineWidth = b.width;
  ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = b.targetPlayers ? '#ff8888' : '#fff'; ctx.lineWidth = b.width * 0.4;
  ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(ex, ey); ctx.stroke(); ctx.globalAlpha = 1;
}
function drawNetEnemy(e) {
  if (!e.isPhased) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(e.x, e.y + e.r * 0.85, e.r * 1.0, e.r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (e.shadowWebTimer > 0 && e.shadowWebOwnerId !== null && typeof players !== 'undefined') {
    const owner = players.find(pl => pl._networkId === e.shadowWebOwnerId);
    if (owner) {
      ctx.globalAlpha = 0.5 + 0.2 * Math.sin(tickMs / 120);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  ctx.globalAlpha = e.isPhased ? 0.3 : 1;
  const fill = e.hurtFlash > 0 ? '#fff' : e.color;
  if (e.specialType && e.shape) {
    let sides = 4, rot = 0;
    if (e.shape === 'triangle') sides = 3; else if (e.shape === 'square') sides = 4;
    else if (e.shape === 'pentagon') sides = 5; else if (e.shape === 'hexagon') sides = 6;
    else if (e.shape === 'diamond') { sides = 4; rot = Math.PI / 4; }
    if (e.shape === 'circle') { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill(); }
    else drawPolygon(e.x, e.y, e.r, sides, rot - Math.PI / 2, fill);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    if (e.shape === 'circle') { ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.stroke(); }
    else { ctx.beginPath(); for (let i = 0; i < sides; i++) { const a = rot - Math.PI / 2 + i * Math.PI * 2 / sides; const px = e.x + Math.cos(a) * e.r, py = e.y + Math.sin(a) * e.r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.stroke(); }
  } else {
    ctx.fillStyle = fill;
    if (e.type === 'fast') { ctx.beginPath(); ctx.moveTo(e.x, e.y - e.r); ctx.lineTo(e.x + e.r, e.y + e.r); ctx.lineTo(e.x - e.r, e.y + e.r); ctx.closePath(); ctx.fill(); }
    else if (e.type === 'tank') drawPolygon(e.x, e.y, e.r, 6, -Math.PI / 6, fill);
    else if (e.type === 'ranger') drawPolygon(e.x, e.y, e.r, 4, Math.PI / 4, fill);
    else if (e.type === 'kamikaze') { ctx.beginPath(); ctx.moveTo(e.x, e.y - e.r); ctx.lineTo(e.x + e.r, e.y + e.r * 0.6); ctx.lineTo(e.x - e.r, e.y + e.r * 0.6); ctx.closePath(); ctx.fill(); }
    else if (e.type === 'charger') { const ang = Math.atan2(e.dashDir?.y || 0, e.dashDir?.x || 0); ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(e.r, 0); ctx.lineTo(-e.r, e.r * 0.8); ctx.lineTo(-e.r * 0.5, 0); ctx.lineTo(-e.r, -e.r * 0.8); ctx.closePath(); ctx.fill(); ctx.restore(); }
    else if (e.type === 'summoner') drawPolygon(e.x, e.y, e.r, 5, -Math.PI / 2, fill);
    else if (e.type === 'healer2') { ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(e.x - 2, e.y - 6, 4, 12); ctx.fillRect(e.x - 6, e.y - 2, 12, 4); }
    else ctx.fillRect(e.x - e.r, e.y - e.r, e.r * 2, e.r * 2);
  }
  ctx.globalAlpha = 1;
  if (e.shield > 0) { ctx.globalAlpha = 0.7; ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 6, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  if (e.slowTimer > 0 || e.hyperSlowTimer > 0) { ctx.strokeStyle = '#a5f3fc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 4, 0, Math.PI * 2); ctx.stroke(); }
  if (e.stunTimer > 0) { const t = tickMs / 200; for (let i = 0; i < 3; i++) { const a = t + i * Math.PI * 2 / 3; ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(e.x + Math.cos(a) * 15, e.y - e.r - 15 + Math.sin(a) * 4, 3, 0, Math.PI * 2); ctx.fill(); } }
  if (e.mindControlTimer > 0) { ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 8, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  if (e._samuraiBlocking) { 
    const facing = e._samuraiFacing || 0; 
    ctx.globalAlpha = 0.6; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; 
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 8, facing - Math.PI / 2, facing + Math.PI / 2); ctx.stroke(); 
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#6b7280'; 
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 10, 0, Math.PI * 2); ctx.fill(); 
    ctx.globalAlpha = 1; 
  }
  if (e.bugMarkTimer > 0) { const pulse = 0.7 + 0.3 * Math.sin(tickMs / 100); ctx.globalAlpha = pulse; ctx.strokeStyle = '#84cc16'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.lineDashOffset = -tickMs / 50; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 12, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.globalAlpha = 1; }
  if (e.wolfMarkTimer > 0) { const pulse = 0.6 + 0.4 * Math.sin(tickMs / 80); ctx.globalAlpha = 0.7 * pulse + 0.3; ctx.strokeStyle = '#d4b483'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 12, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  if (e.bleedTimer > 0) { ctx.globalAlpha = 0.6 + 0.3 * Math.sin(tickMs / 60); ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 6, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  if(e.curseMarks>0){
    const cursed=e.curseMarks>=3;
    if(cursed){ctx.globalAlpha=0.5+0.3*Math.sin(tickMs/80);ctx.strokeStyle='#7c3aed';ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,e.r+8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    for(let i=0;i<e.curseMarks;i++){const a=-Math.PI/2+i*0.8-(e.curseMarks-1)*0.4;const mx=e.x+Math.cos(a)*(e.r+14);const my=e.y+Math.sin(a)*(e.r+14);ctx.fillStyle='#7c3aed';ctx.beginPath();ctx.arc(mx,my,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();}
  }
  if(e.parasiteStacks>0){
    for(let i=0;i<e.parasiteStacks;i++){const a=tickMs/300+i*Math.PI*2/5;ctx.fillStyle='#84cc16';ctx.globalAlpha=0.8;ctx.beginPath();ctx.arc(e.x+Math.cos(a)*(e.r+8),e.y+Math.sin(a)*(e.r+8),2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
  }
  if (e.hp < e.maxHp || e.specialType) {
    const bw = Math.max(30, e.r * 2.2), bh = 4; const bx = e.x - bw / 2, by = e.y - e.r - 10;
    ctx.fillStyle = '#000'; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
    ctx.fillStyle = '#e33'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = e.specialType ? '#ffd700' : '#3e6'; ctx.fillRect(bx, by, bw * (e.hp / Math.max(1, e.maxHp)), bh);
  }
}
function drawNetBoss(b) {
  if (b.shadowWebTimer > 0 && b.shadowWebOwnerId !== null && typeof players !== 'undefined') {
    const owner = players.find(pl => pl._networkId === b.shadowWebOwnerId);
    if (owner) {
      ctx.globalAlpha = 0.5 + 0.2 * Math.sin(tickMs / 120);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  const auraR = b.r + 20 + Math.sin(tickMs / 150) * 8;
  ctx.globalAlpha = 0.2 + 0.1 * Math.sin(tickMs / 200); ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, auraR, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  if (b.charging) { const chargeRatio = 1 - b.chargeTimer / 35; ctx.globalAlpha = 0.4 + 0.4 * chargeRatio; ctx.strokeStyle = '#ff3030'; ctx.lineWidth = 4 + chargeRatio * 6; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 15 + chargeRatio * 20, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.fillStyle = b.hurtFlash > 0 ? '#fff' : b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
  const tailAngle = tickMs / 500;
  for (let i = 0; i < b.tails; i++) { const a = tailAngle + i * Math.PI * 2 / b.tails; ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x + Math.cos(a) * (b.r + 20), b.y + Math.sin(a) * (b.r + 20), 9, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.floor(b.r * 0.9)}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(b.tails), b.x, b.y); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if (b.phaseTransitionTimer > 0) { ctx.globalAlpha = Math.min(1, b.phaseTransitionTimer / 30); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 30 + (60 - b.phaseTransitionTimer), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  if (b.bugMarkTimer > 0) { const pulse = 0.7 + 0.3 * Math.sin(tickMs / 100); ctx.globalAlpha = pulse; ctx.strokeStyle = '#84cc16'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -tickMs / 50; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 14, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.globalAlpha = 1; }
  if (b.wolfMarkTimer > 0) { const pulse = 0.6 + 0.4 * Math.sin(tickMs / 80); ctx.globalAlpha = 0.7 * pulse + 0.3; ctx.strokeStyle = '#d4b483'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 16, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  if (b.bleedTimer > 0) { ctx.globalAlpha = 0.6; ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 4, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  if((b.curseMarks||0)>=3){ctx.globalAlpha=0.5+0.3*Math.sin(tickMs/80);ctx.strokeStyle='#7c3aed';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.x,b.y,b.r+8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
  if(b.weakPointTimer>0){const pulse=0.7+0.3*Math.sin(tickMs/80);ctx.globalAlpha=pulse;ctx.strokeStyle='#ff1744';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,b.r+10,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
  if(b.sealStacks>0){ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillStyle='#a78bfa';ctx.fillText(`◆${b.sealStacks}`,b.x,b.y+b.r+20);ctx.textAlign='left';}
  const bw = b.r * 2.5; ctx.fillStyle = '#e33'; ctx.fillRect(b.x - bw / 2, b.y - b.r - 15, bw, 8);
  ctx.fillStyle = '#3e6'; ctx.fillRect(b.x - bw / 2, b.y - b.r - 15, bw * (b.hp / Math.max(1, b.maxHp)), 8);
}
function drawNetClone(c) {
  ctx.globalAlpha = Math.min(1, c.life / 60); const fill = c.color || '#ffcc66';
  if (c.mode === 'rasengan_rusher') {
    const pulse = 1 + 0.3 * Math.sin(tickMs / 80); ctx.fillStyle = '#4fc3f7'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 1.6 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.6 * Math.min(1, c.life / 60); ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = Math.min(1, c.life / 60);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Н', c.x, c.y); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  } else if (c.mode === 'ranged_clone') { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Н', c.x, c.y); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  } else if (c.mode === 'akamaru_clone') { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#000'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('А', c.x, c.y); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  } else if (c.mode === 'bug_clone') {
    const t = tickMs / 80; ctx.globalAlpha = 0.4 * Math.min(1, c.life / 60); ctx.fillStyle = '#a3e635';
    const wingA = Math.sin(t) * 0.3;
    ctx.beginPath(); ctx.ellipse(c.x - 12, c.y - 4, 14, 6, wingA, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x + 12, c.y - 4, 14, 6, -wingA, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = Math.min(1, c.life / 60); ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(c.x, c.y, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, Math.PI * 2); ctx.fill();
  } else if (c.isLivingPuppet) {
    if (c.mode === 'turret') { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#000'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('К', c.x, c.y); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; }
    else if (c.mode === 'shield_puppet') { ctx.fillStyle = '#3b82f6'; ctx.fillRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2); }
    else if (c.mode === 'trap_puppet') { ctx.fillStyle = '#7c2d12'; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const px = c.x + Math.cos(a) * c.r, py = c.y + Math.sin(a) * c.r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
  } else { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function drawNetPet(pt) {
  ctx.globalAlpha = Math.min(1, pt.life / 60);
  const fill = pt.hurtFlash > 0 ? '#fff' : null;
  if (pt.type === 'akamaru') {
    if (pt.rageMode) { ctx.globalAlpha = 0.4 + 0.2 * Math.sin(tickMs / 60); ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r + 10, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = Math.min(1, pt.life / 60); }
    const bodyColor = pt.rageMode ? (fill || '#dc2626') : (fill || '#e8d5b7');
    ctx.fillStyle = bodyColor; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = pt.rageMode ? '#7f1d1d' : '#8b6f47'; ctx.lineWidth = pt.rageMode ? 3 : 2; ctx.stroke();
    if (!fill) { ctx.fillStyle = pt.rageMode ? '#7f1d1d' : '#8b6f47';
      ctx.beginPath(); ctx.moveTo(pt.x - 8, pt.y - pt.r + 2); ctx.lineTo(pt.x - 4, pt.y - pt.r - 6); ctx.lineTo(pt.x - 1, pt.y - pt.r + 2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(pt.x + 8, pt.y - pt.r + 2); ctx.lineTo(pt.x + 4, pt.y - pt.r - 6); ctx.lineTo(pt.x + 1, pt.y - pt.r + 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(pt.x - 4, pt.y - 1, 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(pt.x + 4, pt.y - 1, 2, 0, Math.PI * 2); ctx.fill(); }
  } else if (pt.type === 'wolf') { ctx.fillStyle = fill || '#a08a70'; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#5a4a35'; ctx.lineWidth = 2; ctx.stroke(); }
  else if (pt.type === 'gama') { ctx.fillStyle = fill || '#d97706'; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 3; ctx.stroke(); }
  else if (pt.type === 'puppet_beast') { ctx.fillStyle = fill || '#7c2d12'; ctx.fillRect(pt.x - pt.r, pt.y - pt.r, pt.r * 2, pt.r * 2); ctx.strokeStyle = '#a16207'; ctx.lineWidth = 3; ctx.strokeRect(pt.x - pt.r, pt.y - pt.r, pt.r * 2, pt.r * 2); }
  if (pt.hp < pt.maxHp) { const bw = 24, bh = 3, bx = pt.x - bw / 2, by = pt.y - pt.r - 6; ctx.fillStyle = '#000'; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2); ctx.fillStyle = '#e33'; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = '#3e6'; ctx.fillRect(bx, by, bw * (pt.hp / pt.maxHp), bh); }
  ctx.globalAlpha = 1;
}
function drawNetANBU(a) {
  const fill = a.hurtFlash > 0 ? '#fff' : '#2a2a2a';
  ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#666'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(a.x, a.y - 2, a.r * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(a.x - 3, a.y - 2, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(a.x + 3, a.y - 2, 1.5, 0, Math.PI * 2); ctx.fill();
  if (a.hp < a.maxHp) { const bw = 24, bh = 3, bx = a.x - bw / 2, by = a.y - a.r - 6; ctx.fillStyle = '#000'; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2); ctx.fillStyle = '#e33'; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = '#3e6'; ctx.fillRect(bx, by, bw * (a.hp / a.maxHp), bh); }
}
function drawNetProjectile(p) {
  const ang = Math.atan2(p.vy, p.vx);
  if (p.isShikamaruNeedle) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang);
    ctx.globalAlpha = 0.35; const g = ctx.createLinearGradient(-p.r*4, 0, 0, 0); g.addColorStop(0, 'rgba(139,92,246,0)'); g.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-p.r*4, 0); ctx.lineTo(0, -p.r*0.6); ctx.lineTo(0, p.r*0.6); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1; ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 10; ctx.fillStyle = '#a5b4fc';
    ctx.beginPath(); ctx.moveTo(p.r*2.2, 0); ctx.lineTo(0, -p.r*0.7); ctx.lineTo(-p.r*1.4, 0); ctx.lineTo(0, p.r*0.7); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#e0e7ff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.r*1.5, 0); ctx.lineTo(0, -p.r*0.35); ctx.stroke();
    ctx.restore(); return;
  }
  if (p.isFumaShuriken) {
    const rot = tickMs / 50; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(rot);
    ctx.shadowColor = '#a5f3fc'; ctx.shadowBlur = 10; ctx.fillStyle = '#a5f3fc'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; const outer = p.r * 1.6, inner = p.r * 0.55; ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer); ctx.lineTo(Math.cos(a + Math.PI / 4) * inner, Math.sin(a + Math.PI / 4) * inner); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, p.r * 0.35, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return;
  }
  if (p.isTentenSword) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang); ctx.shadowColor = '#e2e8f0'; ctx.shadowBlur = 12; ctx.fillStyle = '#e2e8f0';
    ctx.beginPath(); ctx.moveTo(p.r * 1.8, 0); ctx.lineTo(-p.r * 0.4, -p.r * 0.6); ctx.lineTo(-p.r * 0.4, p.r * 0.6); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); return; }
  if (p.isSusanooArrow) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang); ctx.globalAlpha = 0.5; ctx.fillStyle = '#c084fc';
    ctx.beginPath(); ctx.ellipse(0, 0, p.r * 2.2, p.r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = '#a855f7';
    ctx.beginPath(); ctx.moveTo(p.r * 1.6, 0); ctx.lineTo(-p.r * 1.4, -p.r * 0.5); ctx.lineTo(-p.r * 0.6, 0); ctx.lineTo(-p.r * 1.4, p.r * 0.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); return; }
  if (p.isRasenshuriken) {
    const rot = tickMs / 60; const size = p.r * 1.8;
    ctx.globalAlpha = 0.4; ctx.fillStyle = '#a5f3fc'; ctx.beginPath(); ctx.arc(p.x, p.y, size * 1.6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(rot); ctx.fillStyle = '#a5f3fc';
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - 0.35) * size, Math.sin(a - 0.35) * size); ctx.lineTo(Math.cos(a + 0.35) * size * 0.55, Math.sin(a + 0.35) * size * 0.55); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return;
  }
  if (p.r > 8) { ctx.globalAlpha = 0.4; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.shadowColor = p.color; ctx.shadowBlur = p.r * 2.5; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2); ctx.fill();
}
function drawNetEnemyProjectile(p) { ctx.fillStyle = p.homing ? '#f43f5e' : '#f59e0b'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); }
function drawNetShockwave(s) {
  const a = s.life / Math.max(1, s.maxLife); 
  ctx.globalAlpha = a * 0.7; 
  ctx.strokeStyle = s.color; 
  ctx.lineWidth = 3 * a + 1; 
  ctx.beginPath(); 
  ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); 
  ctx.stroke(); 
  ctx.globalAlpha = 1; 
}
function drawNetDamageNumber(d) {
  const a = d.life / Math.max(1, d.maxLife); ctx.globalAlpha = a;
  const size = d.isCrit ? 26 : 18; ctx.font = `bold ${size}px monospace`; ctx.textAlign = 'center';
  ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(d.amount, d.x + d.offset, d.y);
  ctx.fillStyle = d.color; ctx.fillText(d.amount, d.x + d.offset, d.y);
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

// ==================== HUD override ====================
const _originalDrawHUD = drawHUD;
drawHUD = function() {
  if (!isClient || !networkState) { _originalDrawHUD(); return; }
  const realEnemies = enemies; const realBosses = bosses;
  enemies = new Array(networkState.enemies ? networkState.enemies.length : 0);
  bosses = new Array(networkState.bosses ? networkState.bosses.length : 0);
  try { _originalDrawHUD(); } finally { enemies = realEnemies; bosses = realBosses; }
};

const _originalDrawBossHPBar = drawBossHPBar;
drawBossHPBar = function() {
  if (!isClient || !networkState || !networkState.bosses || networkState.bosses.length === 0) { _originalDrawBossHPBar(); return; }
  const realBosses = bosses;
  bosses = networkState.bosses.map(function(b) { return { name: b.name, hp: b.hp, maxHp: b.maxHp, color: b.color, phase: b.phase, removed: false }; });
  try { _originalDrawBossHPBar(); } finally { bosses = realBosses; }
};