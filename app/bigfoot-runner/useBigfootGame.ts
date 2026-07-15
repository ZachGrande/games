"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type BgTree,
  type Bigfoot,
  type Collectible,
  type Footprint,
  type GroundDetail,
  type Obstacle,
  type Particle,
  type Rect,
  COLLECT_TYPES,
  OBSTACLE_TYPES,
  checkCollision,
  drawBigfoot,
  drawBirchTree,
  drawCollectible,
  drawEmojiSprite,
  drawObstacle,
  drawOakTree,
  drawPineTree,
  drawTreeSilhouette,
} from "./draw";

const BEST_KEY = "bigfoot-runner-best";
const MAX_DEVICE_PIXEL_RATIO = 1.75;
const FRAME_MS_60FPS = 1000 / 60;

export type GameState = "title" | "playing" | "gameover";

export interface BigfootGame {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: GameState;
  score: number;
  best: number;
  speedLabel: string;
  debugEnabled: boolean;
  toggleDebug: () => void;
  debugFps: number;
  debugDt: number;
  debugDpr: number;
  startGame: () => void;
}

export function useBigfootGame(): BigfootGame {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const debugEnabledRef = useRef(false);

  const [gameState, setGameState] = useState<GameState>("title");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [speedLabel, setSpeedLabel] = useState("1x");
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugFps, setDebugFps] = useState(60);
  const [debugDt, setDebugDt] = useState(FRAME_MS_60FPS);
  const [debugDpr, setDebugDpr] = useState(1);

  useEffect(() => {
    debugEnabledRef.current = debugEnabled;
  }, [debugEnabled]);

  // Imperative handle so the React overlay buttons can start the game.
  const startGameRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Dimensions ──────────────────────────────────────────────────────────
    let W = 0;
    let H = 0;
    let GROUND_Y = 0;

    // ── Mutable per-frame state ────────────────────────────────────────────
    let state: GameState = "title";
    let scoreVal = 0;
    let bestVal = 0;
    let frame = 0;
    let speed = 4;
    let gameOver = false;
    let footprintTimer = 0;
    let renderStepFrames = 1;
    let animId = 0;
    let lastFrameTs = 0;
    let lastDebugPublishTs = 0;
    let lastObstacle = 0;
    let lastCollectible = 0;
    let gameOverTimeout: ReturnType<typeof setTimeout> | null = null;

    let skyGradient: CanvasGradient | null = null;
    let sunGradient: CanvasGradient | null = null;
    let groundGradient: CanvasGradient | null = null;
    let vignetteGradient: CanvasGradient | null = null;

    let obstacles: Obstacle[] = [];
    let collectibles: Collectible[] = [];
    let particles: Particle[] = [];
    let footprints: Footprint[] = [];
    let bgLayer1: BgTree[] = [];
    let bgLayer2: BgTree[] = [];
    let bgLayer3: BgTree[] = [];
    let groundDetails: GroundDetail[] = [];

    const BF: Bigfoot = {
      x: 80,
      y: 0,
      w: 46,
      h: 58,
      vy: 0,
      jumping: false,
      doubleJumped: false,
      legPhase: 0,
      getTop() {
        return this.y - this.h;
      },
    };

    // ── HUD publishing (throttled to actual value changes) ──────────────────
    let publishedScore = -1;
    let publishedBest = -1;
    let publishedSpeed = "";
    function publishHud() {
      if (scoreVal !== publishedScore) {
        publishedScore = scoreVal;
        setScore(scoreVal);
      }
      if (bestVal !== publishedBest) {
        publishedBest = bestVal;
        setBest(bestVal);
      }
      const spd = speed.toFixed(1) + "x";
      if (spd !== publishedSpeed) {
        publishedSpeed = spd;
        setSpeedLabel(spd);
      }
    }

    // ── Canvas sizing (DPR-aware) ───────────────────────────────────────────
    function setupCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      setDebugDpr(dpr);
      W = Math.min(760, canvas!.parentElement!.getBoundingClientRect().width);
      // Narrow (mobile) viewports get a taller, more portrait aspect so the play
      // area isn't cramped; desktop keeps the original 0.6 landscape ratio.
      const isNarrow = W < 520;
      if (isNarrow) {
        const viewportCap = Math.round((window.innerHeight || 900) * 0.72);
        H = Math.min(viewportCap, Math.round(W * 1.3));
      } else {
        H = Math.min(460, Math.round(W * 0.6));
      }
      GROUND_Y = H - 62;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      skyGradient = ctx!.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGradient.addColorStop(0, "#5ba8e0");
      skyGradient.addColorStop(0.55, "#a8d8f0");
      skyGradient.addColorStop(1, "#c8eac0");

      sunGradient = ctx!.createRadialGradient(W * 0.88, 18, 0, W * 0.88, 18, 80);
      sunGradient.addColorStop(0, "rgba(255,245,180,0.95)");
      sunGradient.addColorStop(0.25, "rgba(255,225,120,0.4)");
      sunGradient.addColorStop(1, "transparent");

      groundGradient = ctx!.createLinearGradient(0, GROUND_Y, 0, H);
      groundGradient.addColorStop(0, "#4caf50");
      groundGradient.addColorStop(0.12, "#388e3c");
      groundGradient.addColorStop(0.4, "#5c3d1e");
      groundGradient.addColorStop(1, "#3a2610");

      vignetteGradient = ctx!.createLinearGradient(0, 0, W, 0);
      vignetteGradient.addColorStop(0, "rgba(20,60,20,0.3)");
      vignetteGradient.addColorStop(0.15, "transparent");
      vignetteGradient.addColorStop(0.85, "transparent");
      vignetteGradient.addColorStop(1, "rgba(20,60,20,0.3)");

      if (BF.y === 0) BF.y = GROUND_Y;
    }

    // ── Background ──────────────────────────────────────────────────────────
    function initBG() {
      bgLayer1 = [];
      for (let i = 0; i < 14; i++) {
        bgLayer1.push({
          x: Math.random() * W,
          h: 55 + Math.random() * 30,
          w: 22 + Math.random() * 14,
          spd: 0.25,
          hue: 80 + Math.random() * 30,
        });
      }
      bgLayer2 = [];
      for (let i = 0; i < 10; i++) {
        bgLayer2.push({
          x: Math.random() * W,
          h: 70 + Math.random() * 40,
          w: 28 + Math.random() * 18,
          spd: 0.6,
          variant: Math.floor(Math.random() * 3),
        });
      }
      bgLayer3 = [];
      for (let i = 0; i < 6; i++) {
        bgLayer3.push({
          x: Math.random() * W,
          h: 90 + Math.random() * 50,
          w: 36 + Math.random() * 20,
          spd: 1.2,
        });
      }
      groundDetails = [];
      for (let i = 0; i < 30; i++) {
        groundDetails.push({
          x: Math.random() * W,
          type: ["fern", "fern", "grass", "pebble", "mushroom"][Math.floor(Math.random() * 5)],
          scale: 0.7 + Math.random() * 0.6,
        });
      }
    }

    function drawBackground() {
      const c = ctx!;
      const moving = state === "playing";
      c.fillStyle = skyGradient ?? "#a8d8f0";
      c.fillRect(0, 0, W, GROUND_Y);

      c.fillStyle = sunGradient ?? "transparent";
      c.fillRect(0, 0, W, GROUND_Y);

      c.fillStyle = "#fff8c0";
      c.beginPath();
      c.arc(W * 0.88, 18, 14, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(255,245,150,0.5)";
      c.beginPath();
      c.arc(W * 0.88, 18, 22, 0, Math.PI * 2);
      c.fill();

      c.save();
      c.globalAlpha = 0.06;
      for (let i = 0; i < 5; i++) {
        const angle = -0.3 + i * 0.18;
        c.fillStyle = "#ffffc0";
        c.beginPath();
        c.moveTo(W * 0.88, 18);
        c.lineTo(W * 0.88 + Math.cos(angle + Math.PI / 2) * 300, 18 + Math.sin(angle + Math.PI / 2) * 300);
        c.lineTo(
          W * 0.88 + Math.cos(angle + Math.PI / 2 + 0.08) * 300,
          18 + Math.sin(angle + Math.PI / 2 + 0.08) * 300,
        );
        c.closePath();
        c.fill();
      }
      c.restore();

      bgLayer1.forEach((t) => {
        if (moving) t.x -= t.spd * (speed / 4) * renderStepFrames;
        if (t.x + t.w < 0) {
          t.x = W + t.w;
          t.h = 55 + Math.random() * 30;
        }
        const col = `hsl(${t.hue}, 35%, 62%)`;
        drawTreeSilhouette(c, t.x, GROUND_Y, t.w, t.h, col, 0.55);
      });

      bgLayer2.forEach((t) => {
        if (moving) t.x -= t.spd * (speed / 4) * renderStepFrames;
        if (t.x + t.w < 0) {
          t.x = W + t.w;
          t.h = 70 + Math.random() * 40;
        }
        if (t.variant === 0) drawPineTree(c, t.x, GROUND_Y, t.w, t.h, "#2e7d32", "#1b5e20", 0.82);
        else if (t.variant === 1) drawOakTree(c, t.x, GROUND_Y, t.w, t.h, "#388e3c", "#2e7d32", 0.82);
        else drawBirchTree(c, t.x, GROUND_Y, t.w, t.h, 0.82);
      });

      c.save();
      c.globalAlpha = 0.07;
      for (let i = 0; i < 8; i++) {
        const px = ((i * 97 + frame * 0.08) % (W + 60)) - 30;
        const py = GROUND_Y - 30 - (i % 3) * 20;
        c.fillStyle = "#e8f8a0";
        c.beginPath();
        c.ellipse(px, py, 22, 10, -0.3, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }

    function drawGround() {
      const c = ctx!;
      const moving = state === "playing";
      c.fillStyle = groundGradient ?? "#4caf50";
      c.fillRect(0, GROUND_Y, W, H - GROUND_Y);

      c.strokeStyle = "#66bb6a";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, GROUND_Y);
      c.lineTo(W, GROUND_Y);
      c.stroke();

      groundDetails.forEach((d) => {
        if (moving) d.x -= speed * 0.85 * renderStepFrames;
        if (d.x < -20) d.x = W + 20;
        const s = d.scale;
        if (d.type === "fern") {
          c.strokeStyle = "#2e7d32";
          c.lineWidth = 1.2;
          for (let i = -2; i <= 2; i++) {
            c.beginPath();
            c.moveTo(d.x, GROUND_Y);
            c.quadraticCurveTo(d.x + i * 8 * s, GROUND_Y - 10 * s, d.x + i * 14 * s, GROUND_Y - 4 * s);
            c.stroke();
          }
        } else if (d.type === "grass") {
          c.strokeStyle = "#43a047";
          c.lineWidth = 1.5;
          for (let i = -1; i <= 1; i++) {
            c.beginPath();
            c.moveTo(d.x + i * 5 * s, GROUND_Y);
            c.lineTo(d.x + i * 6 * s + i * 2, GROUND_Y - 9 * s);
            c.stroke();
          }
        } else if (d.type === "mushroom") {
          c.fillStyle = "#f5f0e8";
          c.fillRect(d.x - 2 * s, GROUND_Y - 8 * s, 4 * s, 8 * s);
          c.fillStyle = "#e53935";
          c.beginPath();
          c.arc(d.x, GROUND_Y - 9 * s, 6 * s, Math.PI, 0);
          c.fill();
          c.fillStyle = "#fff";
          c.beginPath();
          c.arc(d.x - 2 * s, GROUND_Y - 11 * s, 1.5 * s, 0, Math.PI * 2);
          c.fill();
          c.beginPath();
          c.arc(d.x + 2 * s, GROUND_Y - 10 * s, 1.2 * s, 0, Math.PI * 2);
          c.fill();
        } else {
          c.fillStyle = "#8d6e63";
          c.beginPath();
          c.ellipse(d.x, GROUND_Y + 4, 4 * s, 3 * s, 0, 0, Math.PI * 2);
          c.fill();
        }
      });

      bgLayer3.forEach((t) => {
        if (moving) t.x -= t.spd * (speed / 4) * renderStepFrames;
        if (t.x + t.w < 0) {
          t.x = W + t.w;
          t.h = 90 + Math.random() * 50;
        }
        drawPineTree(c, t.x, GROUND_Y, t.w, t.h, "#1b5e20", "#145214", 1.0);
      });
    }

    // ── Spawning ────────────────────────────────────────────────────────────
    function spawnObstacle() {
      const t = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
      obstacles.push({ ...t, x: W + 20, y: GROUND_Y - t.h });
    }

    function spawnCollectible() {
      const t = COLLECT_TYPES[Math.floor(Math.random() * COLLECT_TYPES.length)];
      const sz = t.sz;
      const elevated = Math.random() > 0.35;
      const yOff = elevated ? GROUND_Y - sz - 50 - Math.random() * 45 : GROUND_Y - sz - 2;
      const spawnX = W + 20;
      const tooClose = obstacles.some((o) => {
        const dx = Math.abs(o.x + o.w / 2 - (spawnX + sz / 2));
        return dx < 90;
      });
      if (tooClose) return;
      collectibles.push({ ...t, x: spawnX, y: yOff, collected: false });
    }

    function spawnParticles(x: number, y: number, color: string, n: number) {
      for (let i = 0; i < n; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 5,
          vy: Math.random() * -4 - 1,
          life: 1,
          decay: 0.05 + Math.random() * 0.04,
          r: 3 + Math.random() * 4,
          color,
        });
      }
    }

    function showScorePopup(x: number, y: number, text: string, color: string) {
      particles.push({ isText: true, x, y, text, color, life: 1.2, decay: 0.04, vy: -2 });
    }

    // ── Particle / footprint drawers ────────────────────────────────────────
    function drawFootprints() {
      const c = ctx!;
      for (let i = 0; i < footprints.length; i++) {
        const fp = footprints[i];
        drawEmojiSprite(c, "👣", 11, fp.x, fp.y, fp.alpha);
      }
    }

    function drawParticles() {
      const c = ctx!;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.isText) continue;
        c.save();
        c.globalAlpha = p.life;
        c.fillStyle = p.color ?? "#fff";
        c.beginPath();
        c.arc(p.x, p.y, (p.r ?? 3) * p.life, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    function drawTextParticles() {
      const c = ctx!;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.isText) continue;
        c.save();
        c.globalAlpha = Math.min(p.life, 1);
        c.fillStyle = p.color ?? "#fff";
        c.font = 'bold 16px "Courier New"';
        c.textAlign = "center";
        c.fillText(p.text ?? "", p.x, p.y);
        c.restore();
      }
    }

    // ── Game loop ───────────────────────────────────────────────────────────
    function reset() {
      scoreVal = 0;
      frame = 0;
      speed = 4;
      gameOver = false;
      footprintTimer = 0;
      lastFrameTs = 0;
      BF.y = GROUND_Y;
      BF.vy = 0;
      BF.jumping = false;
      BF.doubleJumped = false;
      BF.legPhase = 0;
      obstacles = [];
      collectibles = [];
      particles = [];
      footprints = [];
      lastObstacle = 0;
      lastCollectible = 0;
      initBG();
    }

    function startGame() {
      if (gameOverTimeout) {
        clearTimeout(gameOverTimeout);
        gameOverTimeout = null;
      }
      reset();
      state = "playing";
      setGameState("playing");
      publishHud();
      if (animId) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(loop);
    }
    startGameRef.current = startGame;

    function jump() {
      if (state !== "playing") return;
      if (!BF.jumping) {
        BF.vy = -14;
        BF.jumping = true;
      } else if (!BF.doubleJumped) {
        BF.vy = -11;
        BF.doubleJumped = true;
        spawnParticles(BF.x + BF.w / 2, BF.getTop() + BF.h / 2, "#66bb6a", 6);
      }
    }

    function update(stepFrames: number) {
      frame += stepFrames;
      scoreVal = Math.floor(frame / 6);
      speed = 4 + Math.min(scoreVal / 200, 5);
      BF.vy += 0.7 * stepFrames;
      BF.y += BF.vy * stepFrames;
      if (BF.y >= GROUND_Y) {
        BF.y = GROUND_Y;
        BF.vy = 0;
        BF.jumping = false;
        BF.doubleJumped = false;
      }
      footprintTimer += stepFrames;
      if (footprintTimer > 18 && !BF.jumping) {
        footprintTimer = 0;
        footprints.push({ x: BF.x + BF.w / 2, y: GROUND_Y + 8, alpha: 0.7 });
      }
      let fpWrite = 0;
      for (let i = 0; i < footprints.length; i++) {
        const fp = footprints[i];
        fp.alpha -= 0.004 * stepFrames;
        if (fp.alpha > 0) footprints[fpWrite++] = fp;
      }
      footprints.length = fpWrite;

      const minGap = Math.max(180, 350 - scoreVal * 0.5);
      if (frame - lastObstacle > (minGap / speed) * 4) {
        spawnObstacle();
        lastObstacle = frame;
      }
      if (frame - lastCollectible > 90) {
        spawnCollectible();
        lastCollectible = frame;
      }

      let obWrite = 0;
      for (let i = 0; i < obstacles.length; i++) {
        const o = obstacles[i];
        o.x -= speed * stepFrames;
        if (o.x > -80) obstacles[obWrite++] = o;
      }
      obstacles.length = obWrite;
      let colWrite = 0;
      for (let i = 0; i < collectibles.length; i++) {
        const cItem = collectibles[i];
        cItem.x -= speed * stepFrames;
        if (cItem.x > -60 && !cItem.collected) collectibles[colWrite++] = cItem;
      }
      collectibles.length = colWrite;

      const bfRect: Rect = {
        x: BF.x,
        y: BF.getTop(),
        w: BF.w,
        h: BF.h,
        getTop: () => BF.getTop(),
      };
      for (const o of obstacles) {
        if (checkCollision(bfRect, o)) {
          triggerGameOver();
          return;
        }
      }

      collectibles.forEach((c) => {
        const cw = c.sz;
        const ch = c.sz;
        const bob = Math.sin(frame * 0.06 + c.x * 0.05) * 2;
        const cRect: Rect = { x: c.x, y: c.y + bob, w: cw, h: ch };
        if (!c.collected && checkCollision(bfRect, cRect)) {
          c.collected = true;
          scoreVal += c.pts;
          frame += c.pts * 3;
          const col = c.type === "logo" ? "#1a75d2" : "#e8780a";
          spawnParticles(c.x + cw / 2, c.y + ch / 2, col, c.type === "logo" ? 12 : 8);
          showScorePopup(c.x + cw / 2, c.y, `+${c.pts}`, col);
        }
      });

      let ptWrite = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.isText) {
          p.y += p.vy * stepFrames;
          p.life -= p.decay * stepFrames;
        } else {
          p.x += (p.vx ?? 0) * stepFrames;
          p.y += p.vy * stepFrames;
          p.vy += 0.15 * stepFrames;
          p.life -= p.decay * stepFrames;
        }
        if (p.life > 0) particles[ptWrite++] = p;
      }
      particles.length = ptWrite;

      publishHud();
    }

    function triggerGameOver() {
      gameOver = true;
      state = "gameover";
      if (scoreVal > bestVal) {
        bestVal = scoreVal;
        try {
          window.localStorage.setItem(BEST_KEY, String(bestVal));
        } catch {
          // ignore storage errors (private mode, etc.)
        }
      }
      spawnParticles(BF.x + BF.w / 2, BF.getTop() + 20, "#e8780a", 20);
      publishHud();
      gameOverTimeout = setTimeout(() => {
        setGameState("gameover");
      }, 600);
    }

    function draw() {
      const c = ctx!;
      c.clearRect(0, 0, W, H);
      drawBackground();
      drawGround();
      drawFootprints();
      obstacles.forEach((o) => drawObstacle(c, o, frame));
      collectibles.forEach((col) => drawCollectible(c, col, frame));
      drawBigfoot(c, BF);
      drawParticles();
      drawTextParticles();
      c.fillStyle = vignetteGradient ?? "transparent";
      c.fillRect(0, 0, W, H);
    }

    function loop(ts: number) {
      if (state !== "playing") return;
      if (!lastFrameTs) lastFrameTs = ts;
      const dtMs = Math.min(50, Math.max(0, ts - lastFrameTs || FRAME_MS_60FPS));
      lastFrameTs = ts;
      const stepFrames = dtMs / FRAME_MS_60FPS;
      renderStepFrames = stepFrames;
      update(stepFrames);
      if (debugEnabledRef.current && ts - lastDebugPublishTs > 120) {
        lastDebugPublishTs = ts;
        setDebugDt(Math.round(dtMs * 10) / 10);
        setDebugFps(Math.round(1000 / Math.max(dtMs, 1)));
      }
      draw();
      if (!gameOver) animId = requestAnimationFrame(loop);
      else draw();
    }

    // ── Static title render loop ────────────────────────────────────────────
    let titleRaf = 0;
    function titleDraw() {
      if (state === "title") {
        renderStepFrames = 1;
        draw();
        titleRaf = requestAnimationFrame(titleDraw);
      }
    }

    // ── Init ────────────────────────────────────────────────────────────────
    setupCanvas();
    BF.y = GROUND_Y;
    initBG();
    try {
      const stored = window.localStorage.getItem(BEST_KEY);
      if (stored) {
        bestVal = parseInt(stored, 10) || 0;
      }
    } catch {
      // ignore
    }
    publishHud();
    titleDraw();

    // ── Input listeners ─────────────────────────────────────────────────────
    const onClick = () => jump();
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchstart", onTouch, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    // ── Resize handling ─────────────────────────────────────────────────────
    let lastWidth = W;
    let lastHeight = H;
    const onResize = () => {
      const newWidth = Math.min(760, canvas.parentElement!.getBoundingClientRect().width);
      if (Math.abs(newWidth - lastWidth) < 1 && Math.abs(window.innerHeight - lastHeight) < 1) {
        return;
      }
      lastWidth = newWidth;
      lastHeight = window.innerHeight;
      setupCanvas();
      initBG();
      if (state !== "playing") draw();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas.parentElement);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    // ── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (titleRaf) cancelAnimationFrame(titleRaf);
      if (gameOverTimeout) clearTimeout(gameOverTimeout);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchstart", onTouch);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      resizeObserver.disconnect();
    };
  }, []);

  const startGame = useCallback(() => {
    startGameRef.current();
  }, []);

  const toggleDebug = useCallback(() => {
    setDebugEnabled((v) => !v);
  }, []);

  return {
    canvasRef,
    gameState,
    score,
    best,
    speedLabel,
    debugEnabled,
    toggleDebug,
    debugFps,
    debugDt,
    debugDpr,
    startGame,
  };
}
