(function () {
  'use strict';

  const canvas = document.getElementById('game');
  if (!canvas) {
    document.body.innerHTML = '<p style="color:#f87171;padding:2rem;">Canvas not found. Make sure index.html has &lt;canvas id="game"&gt;</p>';
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.innerHTML = '<p style="color:#f87171;padding:2rem;">Could not get canvas context.</p>';
    return;
  }
  const W = canvas.width;
  const H = canvas.height;

  // --- Assets (optional images in images/ folder) ---
  const assets = {
    ship: new Image(),
    monster: new Image(),
    monster1: new Image(),
    monster2: new Image(),
    monster3: new Image(),
    monster4: new Image(),
    target: new Image(),
    asteroid: new Image(),
    planet: new Image(),
    fairy: new Image(),
    fairyHelper: new Image(),
    showeringStars: new Image(),
    bullet: new Image(),
    buzz: new Image(),
    background: new Image(),
    timer: new Image(),
    life: new Image()
  };
  const assetDir = 'images/';
  assets.background.src = assetDir + 'background.gif';
  assets.timer.src = assetDir + 'timer.png';
  assets.life.src = assetDir + 'life.png';
  assets.ship.src = assetDir + 'ship.png';
  assets.monster.src = assetDir + 'monster.png';
  assets.monster1.src = assetDir + 'monster1.png';
  assets.monster2.src = assetDir + 'monster2.png';
  assets.monster3.src = assetDir + 'monster3.png';
  assets.monster4.src = assetDir + 'monster4.png';
  assets.target.src = assetDir + 'target.png';
  assets.asteroid.src = assetDir + 'asteroid.png';
  assets.planet.src = assetDir + 'planet.png';
  assets.fairy.src = assetDir + 'fairy.png';
  assets.fairyHelper.src = assetDir + 'fairy.png';
  assets.showeringStars.src = assetDir + 'showering_stars.png';
  assets.bullet.src = assetDir + 'bullet.png';
  assets.buzz.src = assetDir + 'buzz.png';

  function imgReady(img) {
    return img && img.complete && img.naturalWidth > 0;
  }

  const IMAGE_SCALE = 2;
  const BULLET_SCALE = 4;
  const SHIP_SCALE = 6;

  const TOTAL_ROUNDS = 10;
  function requiredKillsForRound(lvl) {
    if (lvl <= 1) return 15;
    if (lvl === 2 || lvl === 3) return 20;
    if (lvl === 4) return 25;
    return 30;  // rounds 5–10
  }
  function maxHitsForRound(lvl) {
    if (lvl <= 1) return 15;
    if (lvl === 2) return 15;
    if (lvl === 3 || lvl === 4 || lvl === 5) return 10;
    if (lvl === 6) return 5;
    if (lvl === 7 || lvl === 8) return 3;
    if (lvl === 9) return 2;
    return 1;  // round 10 (final)
  }
  function effectiveMaxHits() {
    return maxHitsForRound(level) + (window._extraHitsThisRound || 0);
  }

  function getShipHalfSize() {
    const mult = ship.sizeMultiplier ?? 1;
    return { w: (ship.w / 2) * SHIP_SCALE * mult, h: (ship.h / 2) * SHIP_SCALE * mult };
  }

  function getShipCollisionRadius() {
    const { w, h } = getShipHalfSize();
    return Math.max(w, h);
  }

  // --- State ---
  const ship = {
    x: 80, y: H / 2, w: 24, h: 16, speed: 320, speedMult: 1,
    angle: 0,
    hitsThisRound: 0, sizeMultiplier: 1,
    planets: 0, combo: 0, lastKillTime: 0,
    invincibleUntil: 0, barrelRollUntil: 0, boostUntil: 0,
    nextBarrelRoll: 0, nextBoost: 0,
    barrelRollDur: 0.35, barrelRollCd: 0.9, boostDur: 0.35, boostCd: 1, boostMult: 1.85,
    comboTimeout: 2, comboBonusEvery: 3
  };

  let bullets = [];
  let asteroids = [];
  let monsters = [];
  let planets = [];
  let timerPickups = [];
  let timerSpawnTimes = [
    5 + Math.random() * 25,
    30 + Math.random() * 30,
    60 + Math.random() * 30
  ];
  let timerSpawned = [false, false, false];
  let lifePickups = [];
  let lifeSpawnedAt = [false, false, false, false];
  let lifeSkipSlot = Math.random() < 0.5 ? -1 : Math.floor(Math.random() * 4);
  window._extraHitsThisRound = 0;
  let crashEffects = [];
  let starBurstParticles = [];
  let starEffects = [];
  const HELPER_FAIRY_MAX_USES = 2;
  let helperFairyUsesLeft = HELPER_FAIRY_MAX_USES;
  let helperFairyCooldownUntil = 0;
  const HELPER_FAIRY_KEY = 'F';
  const HELPER_FAIRY_DOUBLETAP_MS = 400;
  let helperFairyLastKeyTime = 0;
  let helperFairyLastTapTime = 0;
  let helperFairy = { x: W - 58, y: 58, r: 24 };
  const HELPER_FAIRY_TAP_R = 44;
  const TIMER_PICKUP_R = 22;
  const LIFE_PICKUP_R = 22;
  const TIMER_BONUS_SEC = 5;
  const LIFE_BONUS_HITS = 2;
  const LIFE_SPAWN_THRESHOLDS = [72, 52, 32, 12];

  let level = 1;
  let gameOver = false;
  let keys = {};
  let lastAsteroidSpawn = 0;
  let lastMonsterSpawn = 0;
  let asteroidInterval = 2.5;
  let monsterInterval = 4;
  let asteroidsDestroyedThisLevel = 0;
  let monstersKilledThisLevel = 0;
  let requiredTotalKills = requiredKillsForRound(level);
  const ROUND_DURATION = 90;
  let roundTimeLeft = ROUND_DURATION;
  let score = 0;
  const HIGH_SCORE_KEY = 'spaceshipJourneyHighScore';
  let highScore = 0;
  try {
    highScore = Math.max(0, parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10));
  } catch (e) {}
  let newRecordThisGame = false;
  let levelCompletePending = false;
  let levelJustCompleted = 0;
  let gameWon = false;
  let roundIntroUntil = 0;
  let gameStarted = false;
  const POINTS_KILL = 10;
  const POINTS_COIN = 5;

  // --- Input (keyboard + touch for mobile/tablet) ---
  const GAME_KEYS = ['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  const touchInput = {
    moveUp: false, moveDown: false, moveLeft: false, moveRight: false,
    fire: false, dodge: false, boost: false
  };
  const gameWrap = document.getElementById('gameWrap');
  if (gameWrap) {
    gameWrap.addEventListener('click', () => gameWrap.focus());
    gameWrap.focus();
  }

  (function setupFullscreen() {
    const fsBtn = document.getElementById('fullscreenBtn');
    const wrap = document.getElementById('gameWrap');
    const gameCanvas = document.getElementById('game');
    if (!fsBtn || !wrap || !gameCanvas) return;
    const GAME_W = 900;
    const GAME_H = 560;
    function isFullscreen() {
      return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    }
    function setCanvasSizeToFill() {
      var w = wrap.clientWidth;
      var h = wrap.clientHeight;
      if (!w || !h) return;
      var scale = Math.min(w / GAME_W, h / GAME_H);
      var dw = Math.round(GAME_W * scale);
      var dh = Math.round(GAME_H * scale);
      gameCanvas.style.width = dw + 'px';
      gameCanvas.style.height = dh + 'px';
    }
    function clearCanvasSize() {
      gameCanvas.style.width = '';
      gameCanvas.style.height = '';
    }
    function enterFullscreen() {
      var el = wrap;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    }
    function exitFullscreen() {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
    function onFullscreenChange() {
      if (isFullscreen()) {
        window.addEventListener('resize', setCanvasSizeToFill);
        requestAnimationFrame(function() {
          requestAnimationFrame(setCanvasSizeToFill);
        });
      } else {
        window.removeEventListener('resize', setCanvasSizeToFill);
        clearCanvasSize();
      }
      fsBtn.textContent = isFullscreen() ? '✕ Exit fullscreen' : '⛶ Fullscreen';
    }
    fsBtn.addEventListener('click', function() {
      if (isFullscreen()) exitFullscreen();
      else enterFullscreen();
    });
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
  })();

  const VOLUME_MUSIC = 0.5;
  const VOLUME_SFX = 0.5;
  const bgMusic = document.getElementById('bgMusic');
  const soundShoot = document.getElementById('soundShoot');
  const soundHit = document.getElementById('soundHit');
  const soundAsteroidCrash = document.getElementById('soundAsteroidCrash');
  const soundGameOver = document.getElementById('soundGameOver');
  const soundMonsterShipCrash = document.getElementById('soundMonsterShipCrash');
  const soundWin = document.getElementById('soundWin');
  window._soundMuted = false;
  function playSfx(el) {
    if (window._soundMuted || !el) return;
    el.currentTime = 0;
    el.volume = VOLUME_SFX;
    el.play().catch(function() {});
  }
  function setMuted(muted) {
    window._soundMuted = muted;
    if (bgMusic) {
      if (muted) {
        bgMusic.pause();
        bgMusic.volume = 0;
      } else {
        bgMusic.volume = VOLUME_MUSIC;
        if (window._musicStarted && !bgMusic.error) bgMusic.play().catch(function() {});
      }
    }
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
      muteBtn.textContent = muted ? '🔊 Sound on' : '🔇 Mute';
      muteBtn.style.background = muted ? '#1e293b' : '#334155';
    }
  }
  const muteBtn = document.getElementById('muteBtn');
  if (muteBtn) muteBtn.addEventListener('click', function(ev) {
    ev.stopPropagation();
    setMuted(!window._soundMuted);
  });
  const musicHint = document.getElementById('musicHint');
  const musicStatus = document.getElementById('musicStatus');
  const playMusicBtn = document.getElementById('playMusicBtn');
  function hideMusicHint() {
    if (musicHint) musicHint.style.display = 'none';
  }
  function setMusicStatus(text, isError) {
    if (musicStatus) {
      musicStatus.textContent = text;
      musicStatus.style.color = isError ? '#f87171' : '#4ade80';
    }
  }
  function showMusicError(msg) {
    if (musicHint) {
      musicHint.style.display = '';
      musicHint.textContent = msg;
      musicHint.style.color = '#fde68a';
      musicHint.style.maxWidth = '420px';
      musicHint.style.textAlign = 'center';
    }
  }
  function tryStartMusic() {
    if (!bgMusic) return;
    if (window._soundMuted) { window._musicStarted = true; return; }
    if (window._musicStarted) return;
    window._musicStarted = true;
    document.removeEventListener('keydown', tryStartMusic);
    document.removeEventListener('click', tryStartMusic);
    if (gameWrap) gameWrap.removeEventListener('click', tryStartMusic);
    if (playMusicBtn) playMusicBtn.removeEventListener('click', tryStartMusic);
    if (bgMusic.error) {
      window._musicStarted = false;
      if (playMusicBtn) playMusicBtn.addEventListener('click', tryStartMusic);
      setMusicStatus('Music file not found. Add web/sounds/music.mp3', true);
      showMusicError('sounds/music.mp3 could not be loaded. Create a folder "sounds" inside the web folder and put music.mp3 in it.');
      return;
    }
    if (window._soundMuted) return;
    bgMusic.volume = VOLUME_MUSIC;
    bgMusic.play().then(function() {
      hideMusicHint();
      setMusicStatus('♪ Playing — turn up system volume if you don\'t hear it', false);
      if (playMusicBtn) playMusicBtn.textContent = '♪ Music on';
    }).catch(function(err) {
      window._musicStarted = false;
      if (playMusicBtn) playMusicBtn.addEventListener('click', tryStartMusic);
      setMusicStatus('Play failed. Click "Play music" again.', true);
      showMusicError('Music was blocked. Use http://localhost:8000 (not file://) and click "Play music" once.');
    });
  }
  if (bgMusic) {
    bgMusic.addEventListener('error', function() {
      if (musicStatus && !window._musicStarted) setMusicStatus('sounds/music.mp3 missing or invalid. Add web/sounds/music.mp3', true);
    });
    document.addEventListener('keydown', tryStartMusic);
    document.addEventListener('click', tryStartMusic);
    if (gameWrap) gameWrap.addEventListener('click', tryStartMusic);
    if (playMusicBtn) playMusicBtn.addEventListener('click', tryStartMusic);
  } else {
    hideMusicHint();
  }

  document.addEventListener('keydown', e => {
    if (!gameStarted) {
      gameStarted = true;
      roundIntroUntil = Date.now() / 1000 + 2;
      e.preventDefault();
      return;
    }
    keys[e.code] = true;
    if (GAME_KEYS.includes(e.code)) e.preventDefault();
  });
  document.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (GAME_KEYS.includes(e.code)) e.preventDefault();
  });

  function isInvincible() {
    return Date.now() / 1000 < ship.invincibleUntil || Date.now() / 1000 < ship.barrelRollUntil;
  }
  function isBoosting() {
    return Date.now() / 1000 < ship.boostUntil;
  }

  function fireBullet() {
    playSfx(soundShoot);
    const speed = 720;
    const a = ship.angle;
    const vx = speed * Math.cos(a);
    const vy = -speed * Math.sin(a);
    const noseX = Math.cos(a);
    const noseY = -Math.sin(a);
    const half = getShipHalfSize();
    const spawnDist = Math.max(half.w, half.h) + 12;
    bullets.push({
      x: ship.x + noseX * spawnDist,
      y: ship.y + noseY * spawnDist,
      vx, vy, w: 8, h: 4, damage: 12 + (level - 1) * 2
    });
  }

  function spawnAsteroid() {
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;
    const base = 90 + level * 12;
    if (side === 0) { x = W + 20; y = Math.random() * H; vx = -base; vy = (Math.random() - 0.5) * 60; }
    else if (side === 1) { x = -20; y = Math.random() * H; vx = base; vy = (Math.random() - 0.5) * 60; }
    else if (side === 2) { x = Math.random() * W; y = H + 20; vx = (Math.random() - 0.5) * 60; vy = -base; }
    else { x = Math.random() * W; y = -20; vx = (Math.random() - 0.5) * 60; vy = base; }
    asteroids.push({ x, y, vx, vy, r: 12 + Math.random() * 8, damage: 8 + level * 2 });
  }

  function spawnMonster() {
    const x = W + 30;
    const y = Math.random() * (H - 40) + 20;
    const speed = 70 + level * 8;
    const health = level === 1 ? 10 : 20 + (level - 1) * 8;  // round 1: one shot kills
    const variant = 1 + Math.floor(Math.random() * 4);  // 1–4 for monster1–monster4
    monsters.push({ x, y, speed, r: 14, health, maxHealth: health, damage: 10 + level, variant });
  }

  function spawnPlanet(x, y) {
    planets.push({ x, y, r: 10, value: 1 });
  }

  function hitShip(byMonster) {
    if (isInvincible()) return;
    playSfx(soundMonsterShipCrash);
    const maxHits = effectiveMaxHits();
    ship.hitsThisRound++;
    ship.sizeMultiplier = Math.max(0.55, 1 - ship.hitsThisRound / maxHits);
    ship.invincibleUntil = Date.now() / 1000 + 1.2;
    ship.combo = 0;
    if (ship.hitsThisRound >= maxHits) {
      gameOver = true;
      playSfx(soundGameOver);
    }
  }

  function addCombo() {
    ship.combo++;
    ship.lastKillTime = Date.now() / 1000;
    if (ship.combo % ship.comboBonusEvery === 0) ship.planets++;
  }

  function spawnTimerPickup() {
    const padding = 70;
    const x = padding + Math.random() * (W - 2 * padding);
    const y = padding + Math.random() * (H - 2 * padding);
    const speed = 28 + Math.random() * 24;
    const angle = Math.random() * Math.PI * 2;
    timerPickups.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: TIMER_PICKUP_R,
      lastNudge: Date.now() / 1000
    });
  }

  function spawnLifePickup() {
    const padding = 70;
    const x = padding + Math.random() * (W - 2 * padding);
    const y = padding + Math.random() * (H - 2 * padding);
    const speed = 28 + Math.random() * 24;
    const angle = Math.random() * Math.PI * 2;
    lifePickups.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: LIFE_PICKUP_R,
      lastNudge: Date.now() / 1000
    });
  }

  function nextLevel() {
    level++;
    ship.x = 80;
    ship.y = H / 2;
    ship.hitsThisRound = 0;
    ship.sizeMultiplier = 1;
    ship.invincibleUntil = Date.now() / 1000 + 1.5;
    bullets = [];
    asteroids = [];
    monsters = [];
    planets = [];
    timerPickups = [];
    timerSpawnTimes = [
      5 + Math.random() * 25,
      30 + Math.random() * 30,
      60 + Math.random() * 30
    ];
    timerSpawned = [false, false, false];
    lifePickups = [];
    lifeSpawnedAt = [false, false, false, false];
    lifeSkipSlot = Math.random() < 0.5 ? -1 : Math.floor(Math.random() * 4);
    window._extraHitsThisRound = 0;
    ship.speedMult = Math.pow(1.08, level - 1);
    asteroidInterval = Math.max(0.8, 2.5 - level * 0.2);
    monsterInterval = Math.max(1.5, 4 - level * 0.25);
    lastAsteroidSpawn = Date.now() / 1000;
    lastMonsterSpawn = Date.now() / 1000;
    asteroidsDestroyedThisLevel = 0;
    monstersKilledThisLevel = 0;
    requiredTotalKills = requiredKillsForRound(level);
    roundTimeLeft = ROUND_DURATION;
  }

  function update(dt) {
    if (!gameStarted || gameOver) return;
    if (levelCompletePending) {
      if ((keys['Space'] || touchInput.fire) && !gameWon) {
        levelCompletePending = false;
        nextLevel();
        roundIntroUntil = Date.now() / 1000 + 2;
        window._lastSpace = true;
      }
      return;
    }

    const t = Date.now() / 1000;
    if (roundIntroUntil > 0) {
      if (t < roundIntroUntil) return;
      roundIntroUntil = 0;
    }
    if (ship.combo > 0 && t - ship.lastKillTime > ship.comboTimeout) ship.combo = 0;

    // Tricks — trigger as soon as key or touch is pressed when cooldown is ready
    if ((keys['KeyQ'] || keys['KeyE'] || touchInput.dodge) && t >= ship.nextBarrelRoll && t >= ship.barrelRollUntil) {
      ship.barrelRollUntil = t + ship.barrelRollDur;
      ship.nextBarrelRoll = t + ship.barrelRollDur + ship.barrelRollCd;
    }
    if ((keys['ShiftLeft'] || keys['ShiftRight'] || touchInput.boost) && t >= ship.nextBoost && t >= ship.boostUntil) {
      ship.boostUntil = t + ship.boostDur;
      ship.nextBoost = t + ship.boostDur + ship.boostCd;
    }

    let vx = 0, vy = 0;
    if (keys['KeyW'] || keys['ArrowUp'] || touchInput.moveUp) vy -= 1;
    if (keys['KeyS'] || keys['ArrowDown'] || touchInput.moveDown) vy += 1;
    if (keys['KeyA'] || keys['ArrowLeft'] || touchInput.moveLeft) vx -= 1;
    if (keys['KeyD'] || keys['ArrowRight'] || touchInput.moveRight) vx += 1;
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      vx /= len; vy /= len;
      ship.angle = Math.atan2(-vy, vx);
      let sp = ship.speed * ship.speedMult;
      if (isBoosting()) sp *= ship.boostMult;
      if (!(t < ship.barrelRollUntil)) {
        ship.x += vx * sp * dt;
        ship.y += vy * sp * dt;
      }
    }
    const half = getShipHalfSize();
    ship.x = Math.max(half.w, Math.min(W - half.w, ship.x));
    ship.y = Math.max(half.h, Math.min(H - half.h, ship.y));

    // Shoot
    const firing = keys['Space'] || touchInput.fire;
    if (firing && bullets.length < 12) {
      if (!window._lastSpace) fireBullet();
      window._lastSpace = true;
    } else {
      window._lastSpace = false;
    }

    // Bullets (hit monsters or asteroids — both get destroyed)
    bullets = bullets.filter(b => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) return false;
      for (const m of monsters) {
        const d = Math.hypot(b.x - m.x, b.y - m.y);
        if (d < m.r + 18) {
          m.health = 0;
          m.dead = true;
          return false;
        }
      }
      for (const a of asteroids) {
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d < a.r + 8) {
          a.dead = true;
          asteroidsDestroyedThisLevel++;
          score += POINTS_KILL;
          return false;
        }
      }
      return true;
    });

    const shipR = getShipCollisionRadius();
    const tNow = Date.now() / 1000;
    monsters = monsters.filter(m => {
      if (m.dead || m.health <= 0) {
        if (!m.removedByCollision) {
          monstersKilledThisLevel++;
          score += POINTS_KILL;
          addCombo();
        }
        return false;
      }
      const dx = ship.x - m.x, dy = ship.y - m.y;
      const dist = Math.hypot(dx, dy) || 1;
      const sp = (m.speed || 80) * dt;
      m.x += (dx / dist) * sp;
      m.y += (dy / dist) * sp;
      const distToShip = Math.hypot(ship.x - m.x, ship.y - m.y);
      const touchThreshold = (shipR + m.r) * 0.72;
      const touching = distToShip < touchThreshold;
      if (touching && !isInvincible() && !m.alreadyHitShip) {
        hitShip(true);
        m.alreadyHitShip = true;
        m.dead = true;
        m.removedByCollision = true;
        crashEffects.push({ x: (ship.x + m.x) / 2, y: (ship.y + m.y) / 2, until: tNow + 0.5 });
        return false;
      }
      return true;
    });

    asteroids.forEach(a => {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      const d = Math.hypot(ship.x - a.x, ship.y - a.y);
      if (d < (shipR + a.r) * 0.72 && !isInvincible() && !a.alreadyHitShip) {
        hitShip();
        a.alreadyHitShip = true;
        a.dead = true;
        crashEffects.push({ x: (ship.x + a.x) / 2, y: (ship.y + a.y) / 2, until: tNow + 0.5 });
      }
    });
    asteroids = asteroids.filter(a => !a.dead && a.x > -50 && a.x < W + 50 && a.y > -50 && a.y < H + 50);

    planets = planets.filter(p => {
      const d = Math.hypot(ship.x - p.x, ship.y - p.y);
      if (d < 32) {
        ship.planets += p.value;
        score += POINTS_COIN * p.value;
        return false;
      }
      return true;
    });

    const elapsed = ROUND_DURATION - roundTimeLeft;
    if (!levelCompletePending) {
      timerSpawnTimes.forEach((spawnAt, i) => {
        if (elapsed >= spawnAt && !timerSpawned[i]) {
          timerSpawned[i] = true;
          spawnTimerPickup();
        }
      });
    }
    timerPickups.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx) * 0.9; }
      if (p.x > W - p.r) { p.x = W - p.r; p.vx = -Math.abs(p.vx) * 0.9; }
      if (p.y < p.r) { p.y = p.r; p.vy = Math.abs(p.vy) * 0.9; }
      if (p.y > H - p.r) { p.y = H - p.r; p.vy = -Math.abs(p.vy) * 0.9; }
      const now = Date.now() / 1000;
      if (now - p.lastNudge > 2 + Math.random() * 1.5) {
        p.lastNudge = now;
        p.vx += (Math.random() - 0.5) * 40;
        p.vy += (Math.random() - 0.5) * 40;
        const cap = 55;
        p.vx = Math.max(-cap, Math.min(cap, p.vx));
        p.vy = Math.max(-cap, Math.min(cap, p.vy));
      }
    });
    timerPickups = timerPickups.filter(p => {
      const d = Math.hypot(ship.x - p.x, ship.y - p.y);
      if (d < getShipCollisionRadius() + p.r) {
        roundTimeLeft += TIMER_BONUS_SEC;
        return false;
      }
      return true;
    });

    LIFE_SPAWN_THRESHOLDS.forEach((thresh, i) => {
      if (!levelCompletePending && roundTimeLeft <= thresh && !lifeSpawnedAt[i] && i !== lifeSkipSlot) {
        lifeSpawnedAt[i] = true;
        spawnLifePickup();
      }
    });
    lifePickups.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx) * 0.9; }
      if (p.x > W - p.r) { p.x = W - p.r; p.vx = -Math.abs(p.vx) * 0.9; }
      if (p.y < p.r) { p.y = p.r; p.vy = Math.abs(p.vy) * 0.9; }
      if (p.y > H - p.r) { p.y = H - p.r; p.vy = -Math.abs(p.vy) * 0.9; }
      const now = Date.now() / 1000;
      if (now - p.lastNudge > 2 + Math.random() * 1.5) {
        p.lastNudge = now;
        p.vx += (Math.random() - 0.5) * 40;
        p.vy += (Math.random() - 0.5) * 40;
        const cap = 55;
        p.vx = Math.max(-cap, Math.min(cap, p.vx));
        p.vy = Math.max(-cap, Math.min(cap, p.vy));
      }
    });
    lifePickups = lifePickups.filter(p => {
      const d = Math.hypot(ship.x - p.x, ship.y - p.y);
      if (d < getShipCollisionRadius() + p.r) {
        window._extraHitsThisRound = (window._extraHitsThisRound || 0) + LIFE_BONUS_HITS;
        return false;
      }
      return true;
    });

    if (!levelCompletePending) roundTimeLeft -= dt;
    const totalKills = asteroidsDestroyedThisLevel + monstersKilledThisLevel;

    if (roundTimeLeft <= 0 && totalKills < requiredTotalKills) {
      gameOver = true;
      playSfx(soundGameOver);
    }
    if (!levelCompletePending && totalKills >= requiredTotalKills) {
      levelCompletePending = true;
      levelJustCompleted = level;
      if (level >= TOTAL_ROUNDS) gameWon = true;
      playSfx(soundWin);
    }

    if (lastAsteroidSpawn === 0) lastAsteroidSpawn = t;
    if (t - lastAsteroidSpawn > asteroidInterval) {
      spawnAsteroid();
      lastAsteroidSpawn = t;
    }
    if (lastMonsterSpawn === 0) lastMonsterSpawn = t;
    if (t - lastMonsterSpawn > monsterInterval) {
      spawnMonster();
      lastMonsterSpawn = t;
    }
    crashEffects = crashEffects.filter(e => e.until > t);

    starBurstParticles = starBurstParticles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      return p.life > 0;
    });
    starEffects = starEffects.filter(e => e.until > t);
  }

  function getCanvasPoint(ev) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }
  function activateHelperFairy() {
    if (helperFairyUsesLeft <= 0 || gameOver || levelCompletePending) return;
    const now = Date.now() / 1000;
    if (now < helperFairyCooldownUntil) return;
    const h = helperFairy;
    helperFairyUsesLeft--;
    helperFairyCooldownUntil = now + 1.2;
    window._extraHitsThisRound = (window._extraHitsThisRound || 0) + 2;
    starEffects.push({ x: h.x, y: h.y, until: now + 0.8 });
    if (!imgReady(assets.showeringStars)) {
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 + Math.random();
        const speed = 80 + Math.random() * 120;
        starBurstParticles.push({
          x: h.x, y: h.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 0.6,
          maxLife: 0.6
        });
      }
    }
  }
  document.addEventListener('keydown', function(ev) {
    if (ev.key !== HELPER_FAIRY_KEY && ev.key !== HELPER_FAIRY_KEY.toLowerCase()) return;
    const now = Date.now();
    if (now - helperFairyLastKeyTime <= HELPER_FAIRY_DOUBLETAP_MS) {
      ev.preventDefault();
      activateHelperFairy();
      helperFairyLastKeyTime = 0;
    } else {
      helperFairyLastKeyTime = now;
    }
  });

  (function setupTouchControls() {
    const container = document.getElementById('touchControls');
    if (!container) return;
    const buttons = container.querySelectorAll('.touch-btn[data-touch]');
    function setTouch(ev, value) {
      if (value && !gameStarted) {
        gameStarted = true;
        roundIntroUntil = Date.now() / 1000 + 2;
      }
      const action = ev.currentTarget.getAttribute('data-touch');
      if (action && touchInput.hasOwnProperty(action)) {
        touchInput[action] = value;
      }
      ev.preventDefault();
    }
    buttons.forEach(function(btn) {
      btn.addEventListener('touchstart', function(ev) { setTouch(ev, true); }, { passive: false });
      btn.addEventListener('touchend', function(ev) { setTouch(ev, false); }, { passive: false });
      btn.addEventListener('touchcancel', function(ev) { setTouch(ev, false); }, { passive: false });
      btn.addEventListener('mousedown', function(ev) { setTouch(ev, true); });
      btn.addEventListener('mouseup', function(ev) { setTouch(ev, false); });
      btn.addEventListener('mouseleave', function(ev) { if (ev.buttons === 0) setTouch(ev, false); });
    });
  })();

  function onFairyDoubleTap(cx, cy) {
    if (helperFairyUsesLeft <= 0) return;
    const h = helperFairy;
    if (Math.hypot(cx - h.x, cy - h.y) > HELPER_FAIRY_TAP_R) return;
    const now = Date.now();
    if (now - helperFairyLastTapTime <= HELPER_FAIRY_DOUBLETAP_MS) {
      activateHelperFairy();
      helperFairyLastTapTime = 0;
    } else {
      helperFairyLastTapTime = now;
    }
  }
  canvas.addEventListener('click', function(ev) {
    if (!gameStarted) {
      gameStarted = true;
      roundIntroUntil = Date.now() / 1000 + 2;
      ev.preventDefault();
      return;
    }
    const pt = getCanvasPoint(ev);
    onFairyDoubleTap(pt.x, pt.y);
  });
  canvas.addEventListener('touchstart', function(ev) {
    if (ev.touches.length === 0) return;
    if (!gameStarted) {
      gameStarted = true;
      roundIntroUntil = Date.now() / 1000 + 2;
      ev.preventDefault();
      return;
    }
    const pt = getCanvasPoint(ev);
    const h = helperFairy;
    const onFairy = helperFairyUsesLeft > 0 && Math.hypot(pt.x - h.x, pt.y - h.y) <= HELPER_FAIRY_TAP_R;
    onFairyDoubleTap(pt.x, pt.y);
    if (onFairy) ev.preventDefault();
  }, { passive: false });

  function draw() {
    if (imgReady(assets.background)) {
      ctx.drawImage(assets.background, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * W, 0);
        ctx.lineTo(Math.random() * W, H);
        ctx.stroke();
      }
    }

    timerPickups.forEach(p => {
      const s = p.r * IMAGE_SCALE;
      if (imgReady(assets.timer)) {
        ctx.drawImage(assets.timer, p.x - s, p.y - s, s * 2, s * 2);
      } else {
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    lifePickups.forEach(p => {
      const s = p.r * IMAGE_SCALE;
      if (imgReady(assets.life)) {
        ctx.drawImage(assets.life, p.x - s, p.y - s, s * 2, s * 2);
      } else {
        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    planets.forEach(p => {
      const r = p.r;
      if (imgReady(assets.planet)) {
        const s = r * IMAGE_SCALE;
        ctx.drawImage(assets.planet, p.x - s, p.y - s, s * 2, s * 2);
      } else {
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    asteroids.forEach(a => {
      if (imgReady(assets.asteroid)) {
        const s = a.r * IMAGE_SCALE;
        ctx.drawImage(assets.asteroid, a.x - s, a.y - s, s * 2, s * 2);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.stroke();
      }
    });

    monsters.forEach(m => {
      const monsterImg = assets['monster' + (m.variant || 1)];
      const useImg = (monsterImg && imgReady(monsterImg)) ? monsterImg : (imgReady(assets.monster) ? assets.monster : null);
      if (useImg) {
        const s = m.r * IMAGE_SCALE;
        ctx.drawImage(useImg, m.x - s, m.y - s, s * 2, s * 2);
      } else {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(m.x - m.r, m.y - m.r - 6, (m.health / m.maxHealth) * m.r * 2, 4);
    });

    starEffects.forEach(e => {
      const t = Date.now() / 1000;
      const left = e.until - t;
      if (left <= 0) return;
      const alpha = Math.min(1, left / 0.3);
      const size = 80 + (0.8 - left) * 60;
      if (imgReady(assets.showeringStars)) {
        ctx.globalAlpha = alpha;
        ctx.drawImage(assets.showeringStars, e.x - size / 2, e.y - size / 2, size, size);
        ctx.globalAlpha = 1;
      }
    });
    starBurstParticles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = 'rgba(253, 224, 71, ' + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha * 0.8 + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    crashEffects.forEach(e => {
      const size = 56;
      if (imgReady(assets.buzz)) {
        ctx.drawImage(assets.buzz, e.x - size / 2, e.y - size / 2, size, size);
      } else {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const roll = (Date.now() / 1000) < ship.barrelRollUntil;
    const angle = roll ? (Date.now() / 80) % (Math.PI * 2) : ship.angle;
    ctx.save();
    ctx.translate(ship.x, ship.y);
    const mult = ship.sizeMultiplier ?? 1;
    if (imgReady(assets.ship)) {
      ctx.rotate(Math.PI / 2 - angle);
      const sw = ship.w * SHIP_SCALE * mult, sh = ship.h * SHIP_SCALE * mult;
      ctx.drawImage(assets.ship, -sw / 2, -sh / 2, sw, sh);
    } else {
      ctx.rotate(-angle);
      const sw = ship.w * SHIP_SCALE * mult, sh = ship.h * SHIP_SCALE * mult;
      ctx.fillStyle = isInvincible() ? 'rgba(125, 211, 252, 0.9)' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(sw / 2, 0);
      ctx.lineTo(-sw / 2, sh / 2);
      ctx.lineTo(-sw / 4, 0);
      ctx.lineTo(-sw / 2, -sh / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    if (helperFairyUsesLeft > 0) {
      const h = helperFairy;
      const size = h.r * 2;
      if (imgReady(assets.fairyHelper)) {
        ctx.drawImage(assets.fairyHelper, h.x - size / 2, h.y - size / 2, size, size);
      } else {
        ctx.fillStyle = 'rgba(253, 186, 116, 0.95)';
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Double-tap ' + HELPER_FAIRY_KEY + ': +2 hits', h.x, h.y + size / 2 + 12);
    }

    bullets.forEach(b => {
      const bAngle = Math.atan2(-b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(bAngle);
      const bw = b.w * BULLET_SCALE, bh = b.h * BULLET_SCALE;
      if (imgReady(assets.bullet)) {
        ctx.drawImage(assets.bullet, -bw / 2, -bh / 2, bw, bh);
      } else {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      }
      ctx.restore();
    });

    const totalKillsForUi = asteroidsDestroyedThisLevel + monstersKilledThisLevel;
    const hurdlesEl = document.getElementById('hurdles');
    if (hurdlesEl) hurdlesEl.textContent = `Kills ${totalKillsForUi}/${requiredTotalKills}`;
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = `Time: ${Math.max(0, Math.ceil(roundTimeLeft))}s`;
    if (score > highScore) {
      newRecordThisGame = true;
      highScore = score;
      try { localStorage.setItem(HIGH_SCORE_KEY, String(highScore)); } catch (e) {}
    }
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = `Score: ${score}  |  Best: ${highScore}`;
    const planEl = document.getElementById('planets');
    if (planEl) planEl.textContent = `Coins: ${ship.planets}`;
    const healthEl = document.getElementById('health');
    const maxHits = effectiveMaxHits();
    if (healthEl) healthEl.textContent = `Hits: ${ship.hitsThisRound}/${maxHits}`;
    const comboEl = document.getElementById('combo');
    if (comboEl) comboEl.textContent = ship.combo > 0 ? `Combo x${ship.combo}` : '';
    const levelEl = document.getElementById('level');
    if (levelEl) levelEl.textContent = `Round ${level}`;

    if (gameStarted && !levelCompletePending && !gameOver) {
      const barH = 26;
      const y0 = H - barH;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(0, y0, W, barH);
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, y0, W, barH);
      ctx.font = '14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      const pad = 12;
      const row = y0 + 17;
      ctx.fillText('R' + level, pad, row);
      ctx.fillText(Math.max(0, Math.ceil(roundTimeLeft)) + 's', pad + 42, row);
      ctx.fillText(totalKillsForUi + '/' + requiredTotalKills + ' kills', pad + 85, row);
      ctx.fillText('Score: ' + score, pad + 195, row);
      ctx.fillText('Best: ' + highScore, pad + 295, row);
      ctx.fillText('Hits: ' + ship.hitsThisRound + '/' + maxHits, pad + 385, row);
      ctx.fillText('Coins: ' + ship.planets, pad + 470, row);
      if (ship.combo > 0) {
        ctx.fillStyle = '#facc15';
        ctx.fillText('Combo x' + ship.combo, W - pad - 70, row);
      }
    }

    if (levelCompletePending) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      if (gameWon) {
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 48px system-ui';
        ctx.fillText('You won!', W / 2, H / 2 - 50);
        ctx.font = '24px system-ui';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('You beat all ' + TOTAL_ROUNDS + ' rounds!', W / 2, H / 2 - 10);
        ctx.fillStyle = '#facc15';
        ctx.fillText('Score: ' + score, W / 2, H / 2 + 30);
        ctx.font = '20px system-ui';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Refresh to play again', W / 2, H / 2 + 70);
      } else {
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 38px system-ui';
        ctx.fillText('Round ' + levelJustCompleted + ' complete!', W / 2, H / 2 - 40);
        ctx.font = '22px system-ui';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('Ready for Round ' + (levelJustCompleted + 1) + '?', W / 2, H / 2 + 10);
        ctx.font = '20px system-ui';
        ctx.fillStyle = '#facc15';
        ctx.fillText('Space or tap FIRE to start', W / 2, H / 2 + 55);
      }
    }

    if (roundIntroUntil > 0 && Date.now() / 1000 < roundIntroUntil) {
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = 'bold 56px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Round ' + level, W / 2, H / 2);
    }

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 48px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 20);
      ctx.font = '22px system-ui';
      ctx.fillStyle = '#facc15';
      ctx.fillText('Score: ' + score, W / 2, H / 2 + 25);
      ctx.fillText('Best: ' + highScore, W / 2, H / 2 + 52);
      if (newRecordThisGame && score > 0) {
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 20px system-ui';
        ctx.fillText('New record!', W / 2, H / 2 + 82);
      }
      ctx.font = '20px system-ui';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('Refresh to play again', W / 2, H / 2 + 110);
    }

    if (!gameStarted) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 28px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Press any key or tap to start', W / 2, H / 2);
    }
  }

  let last = performance.now();
  function loop(now) {
    try {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!gameOver) update(dt);
      draw();
    } catch (err) {
      console.error(err);
      document.body.insertAdjacentHTML('beforeend', '<p style="color:#f87171;padding:1rem;">Game error: ' + (err.message || err) + '</p>');
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

})();
