/**
 * Career Adventure Game - 2D Platformer
 * Explore Ayek's career journey by running & jumping through levels!
 */

const GAME_CONFIG = {
  GRAVITY: 0.6,
  JUMP_FORCE: -12,
  MOVE_SPEED: 5,
  GROUND_Y: 0.75, // percentage of canvas height
  PLATFORM_HEIGHT: 16,
  PLAYER_W: 28,
  PLAYER_H: 36,
  SCROLL_SPEED: 3,
  COLORS: {
    sky_top: '#0f0a1e',
    sky_bottom: '#1a1035',
    ground: '#1e1638',
    ground_line: '#2d2050',
    platform: '#7c3aed',
    platform_glow: 'rgba(139, 92, 246, 0.3)',
    player: '#c084fc',
    player_eye: '#ffffff',
    checkpoint_inactive: '#374151',
    checkpoint_active: '#10b981',
    checkpoint_glow: 'rgba(16, 185, 129, 0.4)',
    star: '#fbbf24',
    text: '#e2e8f0',
    text_muted: '#94a3b8',
    coin: '#fbbf24',
    particle: '#c084fc',
  }
};

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6 - 2;
    this.life = 1;
    this.decay = 0.02 + Math.random() * 0.03;
    this.size = 2 + Math.random() * 4;
    this.color = color || GAME_CONFIG.COLORS.particle;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1;
    this.life -= this.decay;
  }
  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = GAME_CONFIG.PLAYER_W;
    this.h = GAME_CONFIG.PLAYER_H;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1; // 1 = right, -1 = left
    this.frame = 0;
    this.frameTimer = 0;
    this.isMoving = false;
    this.jumpSquash = 1;
  }

  update(keys, platforms, groundY) {
    // Horizontal movement
    this.isMoving = false;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
      this.vx = -GAME_CONFIG.MOVE_SPEED;
      this.facing = -1;
      this.isMoving = true;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
      this.vx = GAME_CONFIG.MOVE_SPEED;
      this.facing = 1;
      this.isMoving = true;
    } else {
      this.vx *= 0.8;
    }

    // Jump
    if ((keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' ']) && this.onGround) {
      this.vy = GAME_CONFIG.JUMP_FORCE;
      this.onGround = false;
      this.jumpSquash = 0.7;
    }

    // Gravity
    this.vy += GAME_CONFIG.GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Squash & stretch recovery
    this.jumpSquash += (1 - this.jumpSquash) * 0.1;

    // Ground collision
    this.onGround = false;
    if (this.y + this.h >= groundY) {
      this.y = groundY - this.h;
      this.vy = 0;
      this.onGround = true;
      this.jumpSquash = 1;
    }

    // Platform collision
    for (const p of platforms) {
      if (
        this.vy >= 0 &&
        this.x + this.w > p.x &&
        this.x < p.x + p.w &&
        this.y + this.h >= p.y &&
        this.y + this.h <= p.y + p.h + 10
      ) {
        this.y = p.y - this.h;
        this.vy = 0;
        this.onGround = true;
        this.jumpSquash = 1;
      }
    }

    // Animation frame
    if (this.isMoving && this.onGround) {
      this.frameTimer++;
      if (this.frameTimer > 6) {
        this.frame = (this.frame + 1) % 4;
        this.frameTimer = 0;
      }
    } else if (!this.onGround) {
      this.frame = 1; // jumping pose
    } else {
      this.frame = 0;
      this.frameTimer = 0;
    }

    // Keep in bounds (left side only)
    if (this.x < 0) this.x = 0;
  }

  draw(ctx) {
    ctx.save();
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h;
    ctx.translate(cx, cy);
    ctx.scale(this.facing, 1);

    // Squash & stretch
    const sy = this.jumpSquash;
    const sx = 2 - sy;
    ctx.scale(sx, sy);

    const w = this.w;
    const h = this.h;

    // Body (pixel-art character)
    ctx.fillStyle = GAME_CONFIG.COLORS.player;

    // Torso
    ctx.fillRect(-w / 2 + 4, -h + 8, w - 8, h - 20);

    // Head
    ctx.fillStyle = '#e0d0f0';
    ctx.fillRect(-w / 2 + 6, -h, w - 12, 12);

    // Eyes
    ctx.fillStyle = GAME_CONFIG.COLORS.player_eye;
    ctx.fillRect(0, -h + 4, 3, 3);

    // Hair
    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(-w / 2 + 6, -h - 2, w - 12, 4);

    // Legs (animated)
    ctx.fillStyle = '#6d28d9';
    const legOffset = this.isMoving && this.onGround ? Math.sin(this.frame * Math.PI / 2) * 4 : 0;
    ctx.fillRect(-w / 2 + 6, -12 + legOffset, 6, 12);
    ctx.fillRect(w / 2 - 12, -12 - legOffset, 6, 12);

    // Laptop (carried item)
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(-w / 2 - 2, -h + 16, 8, 6);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(-w / 2, -h + 17, 4, 3);

    ctx.restore();
  }
}

export function initCareerGame(careerData) {
  const modal = document.getElementById('careerGameModal');
  const canvas = document.getElementById('careerGameCanvas');
  const closeBtn = document.getElementById('careerGameClose');
  const launchBtn = document.getElementById('careerGameBtn');
  const infoBox = document.getElementById('careerGameInfo');
  const infoTitle = document.getElementById('careerGameInfoTitle');
  const infoDesc = document.getElementById('careerGameInfoDesc');
  const infoClose = document.getElementById('careerGameInfoClose');
  const mobileLeft = document.getElementById('gameLeft');
  const mobileRight = document.getElementById('gameRight');
  const mobileJump = document.getElementById('gameJump');

  if (!modal || !canvas || !launchBtn) return;

  let ctx, animId;
  let player, platforms, checkpoints, particles, stars, coins;
  let enemies = [];
  let gaps = [];
  let movingPlatforms = [];
  let keys = {};
  let cameraX = 0;
  let groundY;
  let score = 0;
  let lives = 3;
  let activeCheckpoint = null;
  let checkpointTimer = 0;
  let gameStarted = false;
  let respawnX = 80;
  let invincibleTimer = 0;

  // Build career milestones from Supabase data
  function buildMilestones() {
    const milestones = [];

    if (careerData.education) {
      careerData.education.forEach((edu, i) => {
        milestones.push({
          type: 'edu',
          title: `🎓 ${edu.degree}`,
          desc: `${edu.institution} (${edu.year})`,
          order: i,
        });
      });
    }

    if (careerData.experience) {
      careerData.experience.forEach((exp, i) => {
        milestones.push({
          type: 'exp',
          title: `💼 ${exp.role}`,
          desc: `${exp.company} — ${exp.duration}`,
          order: careerData.education ? careerData.education.length + i : i,
        });
      });
    }

    // Sort by order
    milestones.sort((a, b) => a.order - b.order);
    return milestones;
  }

  function initGame() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx = canvas.getContext('2d');
    groundY = canvas.height * GAME_CONFIG.GROUND_Y;

    const milestones = buildMilestones();
    const spacing = 400;
    const totalWidth = milestones.length * spacing + 800;

    player = new Player(80, groundY - GAME_CONFIG.PLAYER_H);
    platforms = [];
    checkpoints = [];
    particles = [];
    coins = [];
    enemies = [];
    gaps = [];
    movingPlatforms = [];
    score = 0;
    lives = 3;
    cameraX = 0;
    respawnX = 80;
    invincibleTimer = 0;
    activeCheckpoint = null;
    gameStarted = true;

    // Generate platforms and checkpoints
    milestones.forEach((m, i) => {
      const baseX = 300 + i * spacing;

      // Platform leading up to checkpoint
      if (i % 2 === 0) {
        platforms.push({ x: baseX - 80, y: groundY - 60, w: 100, h: GAME_CONFIG.PLATFORM_HEIGHT });
        platforms.push({ x: baseX + 40, y: groundY - 120, w: 120, h: GAME_CONFIG.PLATFORM_HEIGHT });
      } else {
        platforms.push({ x: baseX - 60, y: groundY - 80, w: 140, h: GAME_CONFIG.PLATFORM_HEIGHT });
      }

      // Checkpoint flag
      const cpY = i % 2 === 0 ? groundY - 120 : groundY - 80;
      checkpoints.push({
        x: baseX + 60,
        y: cpY - 40,
        w: 30,
        h: 40,
        reached: false,
        milestone: m,
      });

      // Coins
      for (let j = 0; j < 3; j++) {
        coins.push({
          x: baseX - 40 + j * 50,
          y: groundY - 140 - (i % 2 === 0 ? 40 : 0),
          w: 12,
          h: 12,
          collected: false,
          bobOffset: Math.random() * Math.PI * 2,
        });
      }
    });

    // Generate enemies (bugs) between milestones
    milestones.forEach((m, i) => {
      const baseX = 300 + i * spacing;
      // Bug enemy patrolling near ground
      if (i > 0) {
        enemies.push({
          x: baseX - 150, y: groundY - 20, w: 20, h: 20,
          vx: 1.5, minX: baseX - 200, maxX: baseX - 50,
          alive: true, squashTimer: 0, frame: 0
        });
      }
      // Flying enemy on some levels
      if (i % 3 === 1) {
        enemies.push({
          x: baseX + 20, y: groundY - 100, w: 22, h: 18,
          vx: 2, minX: baseX - 30, maxX: baseX + 100,
          alive: true, squashTimer: 0, frame: 0, flying: true
        });
      }
    });

    // Generate gaps (pits) between some milestones
    milestones.forEach((m, i) => {
      if (i > 0 && i % 2 === 0) {
        const gapX = 300 + i * spacing - 220;
        gaps.push({ x: gapX, w: 60 });
      }
    });

    // Generate moving platforms
    milestones.forEach((m, i) => {
      if (i % 3 === 2) {
        const mpX = 300 + i * spacing - 100;
        movingPlatforms.push({
          x: mpX, y: groundY - 90, w: 80, h: GAME_CONFIG.PLATFORM_HEIGHT,
          originY: groundY - 90, amplitude: 40, speed: 0.02, phase: Math.random() * Math.PI * 2
        });
      }
    });

    // End platform (finish line)
    const endX = 300 + milestones.length * spacing;
    platforms.push({ x: endX, y: groundY - 100, w: 200, h: GAME_CONFIG.PLATFORM_HEIGHT });
    checkpoints.push({
      x: endX + 80,
      y: groundY - 140,
      w: 40,
      h: 40,
      reached: false,
      milestone: {
        type: 'finish',
        title: '🏆 Selesai!',
        desc: 'Anda telah menyelesaikan perjalanan karir Ayek! Terima kasih telah bermain.',
      },
    });

    // Stars background
    stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * totalWidth,
        y: Math.random() * groundY,
        size: Math.random() * 2 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  function respawnPlayer() {
    player.x = respawnX;
    player.y = groundY - GAME_CONFIG.PLAYER_H - 10;
    player.vx = 0;
    player.vy = 0;
    invincibleTimer = 90; // 1.5 seconds of invincibility
  }

  function killPlayer() {
    lives--;
    for (let i = 0; i < 15; i++) {
      particles.push(new Particle(player.x + player.w/2, player.y + player.h/2, '#ef4444'));
    }
    if (lives <= 0) {
      gameStarted = false;
      infoTitle.textContent = '💀 Game Over!';
      infoDesc.textContent = `Skor akhir: ${score}. Klik untuk bermain lagi.`;
      infoBox.classList.add('active');
      infoClose.textContent = 'Main Lagi';
      infoClose.onclick = () => { infoBox.classList.remove('active'); infoClose.onclick = null; infoClose.textContent = 'Lanjutkan →'; initGame(); };
    } else {
      respawnPlayer();
    }
  }

  function update() {
    if (!gameStarted) return;

    // Update moving platforms
    const allPlatforms = [...platforms];
    for (const mp of movingPlatforms) {
      mp.phase += mp.speed;
      mp.y = mp.originY + Math.sin(mp.phase) * mp.amplitude;
      allPlatforms.push(mp);
    }

    player.update(keys, allPlatforms, groundY);
    if (invincibleTimer > 0) invincibleTimer--;

    // Camera follows player
    const targetCam = player.x - canvas.width * 0.3;
    cameraX += (targetCam - cameraX) * 0.08;
    if (cameraX < 0) cameraX = 0;

    // Check if player fell into a gap
    for (const gap of gaps) {
      if (
        player.x + player.w > gap.x + 5 &&
        player.x < gap.x + gap.w - 5 &&
        player.y + player.h >= groundY - 2
      ) {
        killPlayer();
        break;
      }
    }

    // Check if player fell off screen
    if (player.y > canvas.height + 50) {
      killPlayer();
    }

    // Update enemies
    for (const e of enemies) {
      if (!e.alive) {
        e.squashTimer--;
        continue;
      }
      e.x += e.vx;
      e.frame++;
      if (e.x <= e.minX || e.x + e.w >= e.maxX) e.vx *= -1;

      // Enemy-player collision
      if (invincibleTimer <= 0 &&
        player.x + player.w > e.x &&
        player.x < e.x + e.w &&
        player.y + player.h > e.y &&
        player.y < e.y + e.h
      ) {
        // Stomp from above?
        if (player.vy > 0 && player.y + player.h < e.y + e.h * 0.6) {
          e.alive = false;
          e.squashTimer = 30;
          player.vy = GAME_CONFIG.JUMP_FORCE * 0.6;
          score += 50;
          for (let i = 0; i < 10; i++) {
            particles.push(new Particle(e.x + e.w/2, e.y + e.h/2, '#ef4444'));
          }
        } else {
          killPlayer();
        }
      }
    }
    // Remove fully dead enemies
    enemies = enemies.filter(e => e.alive || e.squashTimer > 0);

    // Update respawn point based on reached checkpoints
    for (const cp of checkpoints) {
      if (cp.reached && cp.x > respawnX) {
        respawnX = cp.x - 40;
      }
    }

    // Check checkpoint collisions
    for (const cp of checkpoints) {
      if (
        !cp.reached &&
        player.x + player.w > cp.x &&
        player.x < cp.x + cp.w &&
        player.y + player.h > cp.y &&
        player.y < cp.y + cp.h
      ) {
        cp.reached = true;
        activeCheckpoint = cp;
        checkpointTimer = 180;
        score += 100;
        infoTitle.textContent = cp.milestone.title;
        infoDesc.textContent = cp.milestone.desc;
        infoBox.classList.add('active');
        for (let i = 0; i < 25; i++) {
          particles.push(new Particle(
            cp.x + cp.w / 2, cp.y + cp.h / 2,
            cp.milestone.type === 'finish' ? GAME_CONFIG.COLORS.star : GAME_CONFIG.COLORS.checkpoint_active
          ));
        }
      }
    }

    // Check coin collisions
    for (const c of coins) {
      if (
        !c.collected &&
        player.x + player.w > c.x &&
        player.x < c.x + c.w &&
        player.y + player.h > c.y &&
        player.y < c.y + c.h
      ) {
        c.collected = true;
        score += 10;
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle(c.x + 6, c.y + 6, GAME_CONFIG.COLORS.coin));
        }
      }
    }

    // Update particles
    particles = particles.filter(p => { p.update(); return p.life > 0; });
    if (checkpointTimer > 0) checkpointTimer--;
  }

  function drawBackground() {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, GAME_CONFIG.COLORS.sky_top);
    grad.addColorStop(1, GAME_CONFIG.COLORS.sky_bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars (parallax)
    for (const s of stars) {
      const sx = s.x - cameraX * 0.3;
      if (sx < -10 || sx > canvas.width + 10) continue;
      const alpha = 0.4 + Math.sin(s.twinkle + performance.now() * 0.002) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;

    // Mountains (parallax)
    ctx.fillStyle = '#150f28';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x < canvas.width; x += 60) {
      const mountainX = x + (cameraX * 0.1) % 60;
      ctx.lineTo(x, groundY - 40 - Math.sin(mountainX * 0.01) * 30 - Math.cos(mountainX * 0.007) * 20);
    }
    ctx.lineTo(canvas.width, groundY);
    ctx.closePath();
    ctx.fill();

    // City silhouette (parallax)
    ctx.fillStyle = '#1a1430';
    for (let x = 0; x < canvas.width + 80; x += 40) {
      const bx = ((x + cameraX * 0.2) % (canvas.width + 80));
      const bh = 20 + Math.sin(bx * 0.05) * 30 + Math.cos(bx * 0.03) * 15;
      ctx.fillRect(bx - cameraX * 0.2 + cameraX * 0.2 % 40, groundY - bh, 30, bh);
    }
  }

  function drawGround() {
    // Draw gaps (pits) as dark voids
    // First draw ground, then cut gaps
    ctx.fillStyle = GAME_CONFIG.COLORS.ground;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Draw gap pits
    for (const gap of gaps) {
      const gx = gap.x - cameraX;
      if (gx > canvas.width + 10 || gx + gap.w < -10) continue;
      ctx.fillStyle = '#050210';
      ctx.fillRect(gx, groundY, gap.w, canvas.height - groundY);
      // Warning stripes on edges
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(gx, groundY, 3, 8);
      ctx.fillRect(gx + gap.w - 3, groundY, 3, 8);
    }

    // Ground top line
    ctx.fillStyle = GAME_CONFIG.COLORS.ground_line;
    ctx.fillRect(0, groundY, canvas.width, 2);

    // Grid lines on ground
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.lineWidth = 1;
    for (let y = groundY + 20; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawPlatforms() {
    for (const p of platforms) {
      const px = p.x - cameraX;
      if (px > canvas.width + 10 || px + p.w < -10) continue;

      // Glow
      ctx.shadowColor = GAME_CONFIG.COLORS.platform_glow;
      ctx.shadowBlur = 12;

      // Platform body
      ctx.fillStyle = GAME_CONFIG.COLORS.platform;
      ctx.fillRect(px, p.y, p.w, p.h);

      // Top highlight
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(px, p.y, p.w, 3);

      ctx.shadowBlur = 0;
    }
  }

  function drawCheckpoints() {
    for (const cp of checkpoints) {
      const cx = cp.x - cameraX;
      if (cx > canvas.width + 40 || cx + cp.w < -40) continue;

      const color = cp.reached ? GAME_CONFIG.COLORS.checkpoint_active : GAME_CONFIG.COLORS.checkpoint_inactive;
      const glowColor = cp.reached ? GAME_CONFIG.COLORS.checkpoint_glow : 'transparent';

      // Glow
      if (cp.reached) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 20;
      }

      // Flag pole
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(cx + cp.w / 2 - 2, cp.y - 10, 4, cp.h + 10);

      // Flag
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx + cp.w / 2 + 2, cp.y - 10);
      ctx.lineTo(cx + cp.w / 2 + 22, cp.y);
      ctx.lineTo(cx + cp.w / 2 + 2, cp.y + 10);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;

      // Label (visible when near)
      const dist = Math.abs(player.x - cp.x);
      if (dist < 200) {
        const alpha = Math.max(0, 1 - dist / 200);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = GAME_CONFIG.COLORS.text;
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cp.milestone.title, cx + cp.w / 2, cp.y - 20);
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawCoins() {
    const time = performance.now() * 0.003;
    for (const c of coins) {
      if (c.collected) continue;
      const cx = c.x - cameraX;
      if (cx > canvas.width + 10 || cx + c.w < -10) continue;

      const bobY = Math.sin(time + c.bobOffset) * 4;

      ctx.fillStyle = GAME_CONFIG.COLORS.coin;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
      ctx.shadowBlur = 8;

      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(cx + 6, c.y + bobY);
      ctx.lineTo(cx + 12, c.y + 6 + bobY);
      ctx.lineTo(cx + 6, c.y + 12 + bobY);
      ctx.lineTo(cx, c.y + 6 + bobY);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }

  function drawMovingPlatforms() {
    for (const mp of movingPlatforms) {
      const px = mp.x - cameraX;
      if (px > canvas.width + 10 || px + mp.w < -10) continue;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.3)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px, mp.y, mp.w, mp.h);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px, mp.y, mp.w, 3);
      ctx.shadowBlur = 0;
    }
  }

  function drawEnemies() {
    for (const e of enemies) {
      const ex = e.x - cameraX;
      if (ex > canvas.width + 30 || ex + e.w < -30) continue;

      if (!e.alive) {
        // Squashed enemy
        ctx.globalAlpha = e.squashTimer / 30;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ex, e.y + e.h - 4, e.w, 4);
        ctx.globalAlpha = 1;
        continue;
      }

      if (e.flying) {
        // Flying bug (bat-like)
        const wingFlap = Math.sin(e.frame * 0.3) * 5;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(ex + 4, e.y + 4, e.w - 8, e.h - 4);
        // Wings
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(ex - 2 + wingFlap, e.y, 8, 8);
        ctx.fillRect(ex + e.w - 6 - wingFlap, e.y, 8, 8);
        // Eyes
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(ex + 6, e.y + 6, 3, 3);
        ctx.fillRect(ex + e.w - 9, e.y + 6, 3, 3);
      } else {
        // Ground bug (goomba-like)
        const legWiggle = Math.sin(e.frame * 0.2) * 2;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(ex + 2, e.y + 2, e.w - 4, e.h - 6);
        // Legs
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(ex + 2, e.y + e.h - 6 + legWiggle, 5, 6);
        ctx.fillRect(ex + e.w - 7, e.y + e.h - 6 - legWiggle, 5, 6);
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ex + 5, e.y + 5, 4, 4);
        ctx.fillRect(ex + e.w - 9, e.y + 5, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(ex + (e.vx > 0 ? 7 : 5), e.y + 6, 2, 2);
        ctx.fillRect(ex + e.w - (e.vx > 0 ? 7 : 9), e.y + 6, 2, 2);
      }
    }
  }

  function drawHUD() {
    // Score
    ctx.fillStyle = GAME_CONFIG.COLORS.text;
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 16, 30);

    // Lives
    ctx.fillText(`❤️ x${lives}`, 16, 50);

    // Reached milestones counter
    const reached = checkpoints.filter(c => c.reached).length;
    ctx.fillStyle = GAME_CONFIG.COLORS.text_muted;
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`Milestones: ${reached}/${checkpoints.length}`, 16, 70);

    // Controls hint
    ctx.textAlign = 'right';
    ctx.fillStyle = GAME_CONFIG.COLORS.text_muted;
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText('← → Move  |  ↑/Space Jump  |  Stomp enemies!', canvas.width - 16, 30);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    ctx.save();
    drawGround();
    drawPlatforms();
    drawMovingPlatforms();
    drawCoins();
    drawCheckpoints();

    // Enemies
    ctx.save();
    ctx.translate(-cameraX, 0);
    drawEnemies();
    ctx.restore();

    // Player (flash when invincible)
    ctx.save();
    ctx.translate(-cameraX, 0);
    if (invincibleTimer <= 0 || Math.floor(invincibleTimer / 4) % 2 === 0) {
      player.draw(ctx);
    }
    ctx.restore();

    // Particles
    ctx.save();
    ctx.translate(-cameraX, 0);
    for (const p of particles) {
      p.draw(ctx);
    }
    ctx.restore();

    ctx.restore();

    drawHUD();
  }

  function gameLoop() {
    update();
    render();
    animId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Resize canvas
    canvas.width = modal.offsetWidth;
    canvas.height = modal.offsetHeight;

    initGame();
    gameLoop();
  }

  function stopGame() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    infoBox.classList.remove('active');
    gameStarted = false;
    if (animId) cancelAnimationFrame(animId);
    keys = {};
  }

  // Event listeners
  launchBtn.addEventListener('click', startGame);
  closeBtn.addEventListener('click', stopGame);

  document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  // Mobile controls - handle both touch and mouse (for emulators)
  function bindMobileBtn(btn, key) {
    if (!btn) return;
    // Touch events
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); keys[key] = true; }, { passive: false });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); keys[key] = false; }, { passive: false });
    btn.addEventListener('touchcancel', (e) => { e.preventDefault(); keys[key] = false; }, { passive: false });
    // Mouse events (fallback for desktop testing / emulation)
    btn.addEventListener('mousedown', (e) => { e.preventDefault(); keys[key] = true; });
    btn.addEventListener('mouseup', (e) => { e.preventDefault(); keys[key] = false; });
    btn.addEventListener('mouseleave', () => { keys[key] = false; });
  }

  bindMobileBtn(mobileLeft, 'ArrowLeft');
  bindMobileBtn(mobileRight, 'ArrowRight');
  bindMobileBtn(mobileJump, 'ArrowUp');

  infoClose?.addEventListener('click', () => {
    infoBox.classList.remove('active');
  });

  // Handle resize
  window.addEventListener('resize', () => {
    if (!gameStarted) return;
    canvas.width = modal.offsetWidth;
    canvas.height = modal.offsetHeight;
    groundY = canvas.height * GAME_CONFIG.GROUND_Y;
  });
}
