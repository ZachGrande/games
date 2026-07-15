// Pure canvas drawing helpers + type tables for Bigfoot Runner.
// Every function here only touches the passed-in CanvasRenderingContext2D and
// numeric arguments — no React state. The one exception is the emoji sprite
// cache below, which pre-rasterizes color-emoji glyphs into offscreen canvases
// so the game loop can blit them with drawImage instead of re-running the (very
// expensive) fillText glyph shaping every frame.

export interface ObstacleType {
  type: string;
  w: number;
  h: number;
  emoji?: string;
}

export interface Obstacle extends ObstacleType {
  x: number;
  y: number;
}

export interface CollectType {
  type: string;
  pts: number;
  sz: number;
}

export interface Collectible extends CollectType {
  x: number;
  y: number;
  collected: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vy: number;
  life: number;
  decay: number;
  vx?: number;
  r?: number;
  color?: string;
  isText?: boolean;
  text?: string;
}

export interface Footprint {
  x: number;
  y: number;
  alpha: number;
}

export interface BgTree {
  x: number;
  h: number;
  w: number;
  spd: number;
  hue?: number;
  variant?: number;
}

export interface GroundDetail {
  x: number;
  type: string;
  scale: number;
}

export interface Bigfoot {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  jumping: boolean;
  doubleJumped: boolean;
  legPhase: number;
  getTop(): number;
}

// ── EMOJI SPRITE CACHE ───────────────────────────────────────────────────────
// Color emoji are drawn as center-x / bottom-baseline anchored glyphs. We render
// each (emoji, fontPx) combo once into a supersampled offscreen canvas and then
// blit it, which matches the original fillText placement pixel-for-pixel while
// avoiding per-frame glyph rasterization.

interface EmojiSprite {
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
  anchorX: number;
  anchorY: number;
}

const emojiSpriteCache = new Map<string, EmojiSprite>();

function getEmojiSprite(emoji: string, fontPx: number): EmojiSprite {
  const ss = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
  const key = `${emoji}|${fontPx}|${ss}`;
  const cached = emojiSpriteCache.get(key);
  if (cached) return cached;
  const w = Math.ceil(fontPx * 1.8);
  const h = Math.ceil(fontPx * 1.8);
  const anchorX = w / 2;
  const anchorY = h - 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(w * ss);
  canvas.height = Math.ceil(h * ss);
  const octx = canvas.getContext("2d");
  if (octx) {
    octx.scale(ss, ss);
    octx.font = `${fontPx}px serif`;
    octx.textAlign = "center";
    octx.textBaseline = "bottom";
    octx.fillText(emoji, anchorX, anchorY);
  }
  const sprite: EmojiSprite = { canvas, w, h, anchorX, anchorY };
  emojiSpriteCache.set(key, sprite);
  return sprite;
}

// Blits a cached emoji so its horizontal center lands on centerX and its bottom
// baseline lands on bottomY — identical placement to the previous
// textAlign="center" / textBaseline="bottom" fillText call.
export function drawEmojiSprite(
  ctx: CanvasRenderingContext2D,
  emoji: string,
  fontPx: number,
  centerX: number,
  bottomY: number,
  alpha = 1,
) {
  const sprite = getEmojiSprite(emoji, fontPx);
  if (alpha !== 1) ctx.globalAlpha = alpha;
  ctx.drawImage(
    sprite.canvas,
    centerX - sprite.anchorX,
    bottomY - sprite.anchorY,
    sprite.w,
    sprite.h,
  );
  if (alpha !== 1) ctx.globalAlpha = 1;
}

// ── TREE DRAWERS ────────────────────────────────────────────────────────────

export function drawTreeSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  w: number,
  h: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  // Trunk
  ctx.fillRect(x + w * 0.4, groundY - h * 0.25, w * 0.2, h * 0.25);
  // Crown (rounded blob)
  ctx.beginPath();
  ctx.arc(x + w / 2, groundY - h * 0.55, w * 0.52, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.3, groundY - h * 0.45, w * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.72, groundY - h * 0.42, w * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPineTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  w: number,
  h: number,
  col1: string,
  col2: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = x + w / 2;
  // Trunk
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(cx - w * 0.1, groundY - h * 0.22, w * 0.2, h * 0.22);
  // Three tiers
  const tiers = 3;
  for (let i = 0; i < tiers; i++) {
    const ty = groundY - h * (0.22 + i * 0.26);
    const tw = w * (0.9 - i * 0.18);
    ctx.fillStyle = i % 2 === 0 ? col1 : col2;
    ctx.beginPath();
    ctx.moveTo(cx, ty - h * 0.32);
    ctx.lineTo(cx - tw / 2, ty);
    ctx.lineTo(cx + tw / 2, ty);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawOakTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  w: number,
  h: number,
  col1: string,
  col2: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = x + w / 2;
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(cx - w * 0.1, groundY - h * 0.3, w * 0.2, h * 0.3);
  ctx.fillStyle = col1;
  ctx.beginPath();
  ctx.arc(cx, groundY - h * 0.55, w * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = col2;
  ctx.beginPath();
  ctx.arc(cx - w * 0.22, groundY - h * 0.45, w * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + w * 0.22, groundY - h * 0.42, w * 0.3, 0, Math.PI * 2);
  ctx.fill();
  // highlight top
  ctx.fillStyle = "rgba(100,200,80,0.25)";
  ctx.beginPath();
  ctx.arc(cx - w * 0.08, groundY - h * 0.65, w * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawBirchTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  w: number,
  h: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const cx = x + w / 2;
  // Pale trunk
  ctx.fillStyle = "#c8c8b4";
  ctx.fillRect(cx - w * 0.08, groundY - h * 0.35, w * 0.16, h * 0.35);
  // Dark bark marks
  ctx.fillStyle = "#5a5a4a";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(cx - w * 0.08, groundY - h * (0.12 + i * 0.1), w * 0.16, h * 0.025);
  }
  // Leafy crown - light fresh green
  ctx.fillStyle = "#7cb87c";
  ctx.beginPath();
  ctx.arc(cx, groundY - h * 0.52, w * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#90cc80";
  ctx.beginPath();
  ctx.arc(cx - w * 0.18, groundY - h * 0.44, w * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + w * 0.16, groundY - h * 0.46, w * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── OBSTACLE DRAWERS ─────────────────────────────────────────────────────────

export function drawTentCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const cx = x + w / 2;
  const base = y + h;
  ctx.fillStyle = "#e8780a";
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x, base);
  ctx.lineTo(x + w, base);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#c45e00";
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x, base);
  ctx.lineTo(cx, base);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a3a2a";
  ctx.beginPath();
  ctx.arc(cx, base - 1, w * 0.18, Math.PI, 0);
  ctx.lineTo(cx + w * 0.18, base);
  ctx.lineTo(cx - w * 0.18, base);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffaa44";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, y - 2);
  ctx.lineTo(cx, y + h * 0.4);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x - 8, base - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x + w + 8, base - 4);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawCampfireCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: number,
) {
  const cx = x + w / 2;
  const base = y + h;
  ctx.save();
  ctx.translate(cx, base - 6);
  ctx.rotate(0.4);
  ctx.fillStyle = "#5c3d1e";
  ctx.fillRect(-w * 0.38, -5, w * 0.76, 9);
  ctx.restore();
  ctx.save();
  ctx.translate(cx, base - 6);
  ctx.rotate(-0.4);
  ctx.fillStyle = "#3a2610";
  ctx.fillRect(-w * 0.38, -5, w * 0.76, 9);
  ctx.restore();
  ctx.fillStyle = "#888";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * w * 0.3, base - 3 + Math.sin(a) * 4, 4, 3, a, 0, Math.PI * 2);
    ctx.fill();
  }
  const fl = Math.sin(frame * 0.25) * 2;
  const fl2 = Math.cos(frame * 0.3) * 2;
  ctx.fillStyle = "#e8780a";
  ctx.beginPath();
  ctx.moveTo(cx, y + 2 + fl);
  ctx.bezierCurveTo(cx + w * 0.22, base - h * 0.55, cx + w * 0.32, base - h * 0.25, cx + w * 0.22, base - 10);
  ctx.bezierCurveTo(cx, base - 12, cx - w * 0.22, base - 10, cx - w * 0.22, base - 10);
  ctx.bezierCurveTo(cx - w * 0.32, base - h * 0.25, cx - w * 0.22, base - h * 0.55, cx, y + 2 + fl);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd040";
  ctx.beginPath();
  ctx.moveTo(cx + fl2, y + h * 0.25 + fl);
  ctx.bezierCurveTo(cx + w * 0.14, base - h * 0.5, cx + w * 0.18, base - h * 0.2, cx + w * 0.12, base - 12);
  ctx.bezierCurveTo(cx, base - 14, cx - w * 0.12, base - 12, cx - w * 0.12, base - 12);
  ctx.bezierCurveTo(cx - w * 0.18, base - h * 0.2, cx - w * 0.14, base - h * 0.5, cx + fl2, y + h * 0.25 + fl);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,220,0.7)";
  ctx.beginPath();
  ctx.ellipse(cx, base - h * 0.35, w * 0.07, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffaa44";
  for (let i = 0; i < 3; i++) {
    const sx = cx + Math.sin(frame * 0.2 + i * 2.1) * w * 0.18;
    const sy = base - h * 0.55 - ((frame * 0.8 + i * 30) % 30);
    ctx.globalAlpha = Math.max(0, 1 - ((frame * 0.8 + i * 30) % 30) / 30);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawCampLanternCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: number,
) {
  const cx = x + w / 2;
  const fl = Math.sin(frame * 0.15) * 1.2;
  const grd = ctx.createRadialGradient(cx, y + h, 0, cx, y + h, w * 1.2);
  grd.addColorStop(0, "rgba(255,200,60,0.18)");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.fillRect(x - w * 0.7, y, w * 2.4, h + 10);
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.18, w * 0.36, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = "#3d5c2a";
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.28, y + h * 0.18);
  ctx.lineTo(cx + w * 0.28, y + h * 0.18);
  ctx.lineTo(cx + w * 0.22, y + h * 0.3);
  ctx.lineTo(cx - w * 0.22, y + h * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#556b2f";
  ctx.fillRect(cx - w * 0.3, y + h * 0.28, w * 0.6, h * 0.06);
  ctx.strokeStyle = "#2a3e1a";
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * w * 0.1, y + h * 0.19);
    ctx.lineTo(cx + i * w * 0.1, y + h * 0.28);
    ctx.stroke();
  }
  const glassGrad = ctx.createLinearGradient(x, 0, x + w, 0);
  glassGrad.addColorStop(0, "rgba(180,90,0,0.6)");
  glassGrad.addColorStop(0.3, `rgba(255,${160 + Math.floor(fl * 8)},40,0.85)`);
  glassGrad.addColorStop(0.7, `rgba(255,${140 + Math.floor(fl * 8)},20,0.75)`);
  glassGrad.addColorStop(1, "rgba(160,70,0,0.55)");
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.28, y + h * 0.34, w * 0.56, h * 0.46, 4);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,200,0.25)";
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.18, y + h * 0.36, w * 0.1, h * 0.4, 3);
  ctx.fill();
  ctx.fillStyle = `rgba(255,${230 + Math.floor(fl * 5)},180,0.9)`;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.57, w * 0.12, h * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3d5c2a";
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.3, y + h * 0.8, w * 0.6, h * 0.22, 3);
  ctx.fill();
  ctx.fillStyle = "#556b2f";
  ctx.fillRect(cx - w * 0.28, y + h * 0.86, w * 0.56, h * 0.07);
  ctx.fillStyle = "#2a3e1a";
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 1.02, w * 0.32, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#556b2f";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.3, y + h * 0.3);
  ctx.lineTo(cx - w * 0.3, y + h * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.3, y + h * 0.3);
  ctx.lineTo(cx + w * 0.3, y + h * 0.8);
  ctx.stroke();
}

// ── LANTERN SPRITE CACHE ─────────────────────────────────────────────────────
// The lantern is the only obstacle that builds canvas gradients, and it rebuilt
// two of them on every frame. Its animation is fully quantized — the only
// frame-dependent inputs are Math.floor(fl * 8) and Math.floor(fl * 5) where
// fl = sin(frame * 0.15) * 1.2 — so each distinct visual state can be rendered
// once into an offscreen canvas and blitted. Output is byte-identical to the
// direct draw, but the gradients are built at most ~30 times total instead of
// once per lantern per frame.

interface ObstacleSprite {
  canvas: HTMLCanvasElement;
  offsetX: number;
  offsetY: number;
  w: number;
  h: number;
}

const lanternSpriteCache = new Map<string, ObstacleSprite>();

function getLanternSprite(w: number, h: number, frame: number): ObstacleSprite {
  const ss = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
  const fl = Math.sin(frame * 0.15) * 1.2;
  const g8 = Math.floor(fl * 8);
  const g5 = Math.floor(fl * 5);
  const key = `${w}|${h}|${ss}|${g8}|${g5}`;
  const cached = lanternSpriteCache.get(key);
  if (cached) return cached;
  // Generous padding so the glow rect (starts at x - 0.7w, spans 2.4w) and the
  // hook arc above y are never clipped.
  const offsetX = w * 1.3;
  const offsetY = h * 0.5 + w * 0.5;
  const logicalW = Math.ceil(offsetX + w * 1.3);
  const logicalH = Math.ceil(offsetY + h + 15);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(logicalW * ss);
  canvas.height = Math.ceil(logicalH * ss);
  const octx = canvas.getContext("2d");
  if (octx) {
    octx.scale(ss, ss);
    drawCampLanternCanvas(octx, offsetX, offsetY, w, h, frame);
  }
  const sprite: ObstacleSprite = { canvas, offsetX, offsetY, w: logicalW, h: logicalH };
  lanternSpriteCache.set(key, sprite);
  return sprite;
}

// ── COLLECTIBLE DRAWERS ──────────────────────────────────────────────────────

export function drawStarShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pts: number,
  outerR: number,
  innerR: number,
) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = (i * Math.PI) / pts - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
}

export function drawLogoCollectible(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;
  ctx.save();
  ctx.fillStyle = "#1565c0";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(245,240,232,0.92)";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a75d2";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  drawStarShape(ctx, cx, cy, 5, r * 0.46, r * 0.19);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.2, cy - r * 0.25, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawSmore(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  ctx.fillStyle = "#c8922a";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.42, cy + s * 0.05, s * 0.84, s * 0.28, 3);
  ctx.fill();
  ctx.strokeStyle = "#a06818";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx - s * 0.42, cy + s * 0.05, s * 0.84, s * 0.28);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.05);
  ctx.lineTo(cx, cy + s * 0.33);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy + s * 0.19);
  ctx.lineTo(cx + s * 0.42, cy + s * 0.19);
  ctx.stroke();
  ctx.fillStyle = "#f5f0e8";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.36, cy - s * 0.15, s * 0.72, s * 0.26, 6);
  ctx.fill();
  ctx.fillStyle = "#5c2a00";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.3, cy - s * 0.32, s * 0.6, s * 0.2, 3);
  ctx.fill();
  ctx.strokeStyle = "#3a1800";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.32);
  ctx.lineTo(cx, cy - s * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.15, cy - s * 0.32);
  ctx.lineTo(cx - s * 0.15, cy - s * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.15, cy - s * 0.32);
  ctx.lineTo(cx + s * 0.15, cy - s * 0.12);
  ctx.stroke();
  ctx.fillStyle = "#c8922a";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.4, cy - s * 0.48, s * 0.8, s * 0.2, 3);
  ctx.fill();
  ctx.strokeStyle = "#a06818";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx - s * 0.4, cy - s * 0.48, s * 0.8, s * 0.2);
}

export function drawSodaBottle(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  ctx.fillStyle = "#2d6e2d";
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.2, cy + s * 0.45);
  ctx.lineTo(cx - s * 0.26, cy + s * 0.1);
  ctx.bezierCurveTo(cx - s * 0.26, cy - s * 0.1, cx - s * 0.22, cy - s * 0.2, cx - s * 0.14, cy - s * 0.28);
  ctx.lineTo(cx - s * 0.1, cy - s * 0.44);
  ctx.lineTo(cx + s * 0.1, cy - s * 0.44);
  ctx.lineTo(cx + s * 0.14, cy - s * 0.28);
  ctx.bezierCurveTo(cx + s * 0.22, cy - s * 0.2, cx + s * 0.26, cy - s * 0.1, cx + s * 0.26, cy + s * 0.1);
  ctx.lineTo(cx + s * 0.2, cy + s * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.16, cy + s * 0.4);
  ctx.lineTo(cx - s * 0.22, cy + s * 0.1);
  ctx.lineTo(cx - s * 0.12, cy + s * 0.1);
  ctx.lineTo(cx - s * 0.06, cy + s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#cc2200";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.24, cy, s * 0.48, s * 0.28, 2);
  ctx.fill();
  ctx.fillStyle = "#ff4422";
  ctx.font = `bold ${s * 0.14}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SODA", cx, cy + s * 0.14);
  ctx.fillStyle = "#cc2200";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.1, cy - s * 0.5, s * 0.2, s * 0.08, 2);
  ctx.fill();
}

export function drawHamburger(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  ctx.fillStyle = "#c8922a";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.4, cy + s * 0.22, s * 0.8, s * 0.2, [0, 0, 8, 8]);
  ctx.fill();
  ctx.fillStyle = "#5c2a00";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.38, cy + s * 0.08, s * 0.76, s * 0.18, 3);
  ctx.fill();
  ctx.fillStyle = "#7a3800";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.38, cy + s * 0.08, s * 0.76, s * 0.07, 2);
  ctx.fill();
  ctx.fillStyle = "#f0c030";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.4, cy + s * 0.04, s * 0.82, s * 0.1, 2);
  ctx.fill();
  ctx.fillStyle = "#3a8a2a";
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy + s * 0.04);
  for (let i = 0; i < 5; i++) {
    ctx.quadraticCurveTo(
      cx - s * 0.42 + i * s * 0.17 + s * 0.085,
      cy - s * 0.03,
      cx - s * 0.42 + (i + 1) * s * 0.17,
      cy + s * 0.04,
    );
  }
  ctx.lineTo(cx + s * 0.42, cy + s * 0.1);
  ctx.lineTo(cx - s * 0.42, cy + s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d4a040";
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.1, s * 0.38, Math.PI, 0);
  ctx.lineTo(cx + s * 0.38, cy + s * 0.04);
  ctx.lineTo(cx - s * 0.38, cy + s * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f5f0e8";
  for (let i = 0; i < 4; i++) {
    const sx = cx - s * 0.2 + i * s * 0.12;
    const sy = cy - s * 0.2 + Math.sin(i * 1.3) * s * 0.06;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(Math.sin(i) * 0.8);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.04, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawHotDog(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  ctx.fillStyle = "#c8922a";
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.28, s * 0.44, s * 0.2, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#b84422";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.4, cy + s * 0.02, s * 0.8, s * 0.22, 10);
  ctx.fill();
  ctx.fillStyle = "rgba(255,150,100,0.3)";
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.36, cy + s * 0.04, s * 0.72, s * 0.08, 8);
  ctx.fill();
  ctx.fillStyle = "#9a3318";
  ctx.beginPath();
  ctx.ellipse(cx - s * 0.4, cy + s * 0.13, s * 0.05, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + s * 0.4, cy + s * 0.13, s * 0.05, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d4a040";
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.04, s * 0.44, s * 0.2, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = "#f0c030";
  ctx.lineWidth = s * 0.06;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.3, cy + s * 0.08);
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(cx - s * 0.3 + i * s * 0.1 + s * 0.05, cy + (i % 2 === 0 ? s * 0.02 : s * 0.18));
  }
  ctx.stroke();
  ctx.lineCap = "butt";
}

// ── TYPE TABLES ──────────────────────────────────────────────────────────────

export const OBSTACLE_TYPES: ObstacleType[] = [
  { type: "tent", w: 52, h: 44 },
  { type: "campfire", w: 40, h: 38 },
  { type: "lantern", w: 28, h: 48 },
  { type: "log", w: 38, h: 26, emoji: "🪵" },
  { type: "rock", w: 34, h: 26, emoji: "🪨" },
  { type: "ranger", w: 38, h: 52, emoji: "🔦" },
];

export const COLLECT_TYPES: CollectType[] = [
  { type: "logo", pts: 25, sz: 32 },
  { type: "logo", pts: 25, sz: 32 },
  { type: "smore", pts: 10, sz: 30 },
  { type: "smore", pts: 10, sz: 30 },
  { type: "soda", pts: 8, sz: 28 },
  { type: "burger", pts: 12, sz: 32 },
  { type: "hotdog", pts: 10, sz: 32 },
];

// ── DISPATCH DRAWERS ─────────────────────────────────────────────────────────

export function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, frame: number) {
  if (o.type === "tent") drawTentCanvas(ctx, o.x, o.y, o.w, o.h);
  else if (o.type === "campfire") drawCampfireCanvas(ctx, o.x, o.y, o.w, o.h, frame);
  else if (o.type === "lantern") {
    const sprite = getLanternSprite(o.w, o.h, frame);
    ctx.drawImage(sprite.canvas, o.x - sprite.offsetX, o.y - sprite.offsetY, sprite.w, sprite.h);
  } else if (o.emoji) {
    drawEmojiSprite(ctx, o.emoji, Math.min(o.w, o.h) * 1.2, o.x + o.w / 2, o.y + o.h);
  }
}

export function drawCollectible(ctx: CanvasRenderingContext2D, c: Collectible, frame: number) {
  if (c.collected) return;
  // Gentle bob: small amplitude (2px), anchored to fixed y
  const bob = Math.sin(frame * 0.06 + c.x * 0.05) * 2;
  ctx.save();
  ctx.translate(0, bob);
  const s = c.sz;
  const cx2 = c.x;
  const cy2 = c.y;
  if (c.type === "logo") {
    const pulse = 0.4 + Math.sin(frame * 0.08) * 0.2;
    ctx.save();
    ctx.globalAlpha = pulse * 0.3;
    ctx.fillStyle = "#1a75d2";
    ctx.beginPath();
    ctx.arc(cx2 + s / 2, cy2 + s / 2, s * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawLogoCollectible(ctx, cx2, cy2, s);
  } else if (c.type === "smore") drawSmore(ctx, cx2, cy2, s);
  else if (c.type === "soda") drawSodaBottle(ctx, cx2, cy2, s);
  else if (c.type === "burger") drawHamburger(ctx, cx2, cy2, s);
  else if (c.type === "hotdog") drawHotDog(ctx, cx2, cy2, s);
  ctx.restore();
}

// ── BIGFOOT ──────────────────────────────────────────────────────────────────
// Round chunky brown body, amber glowing eyes. Mutates BF.legPhase while grounded.

export function drawBigfoot(ctx: CanvasRenderingContext2D, BF: Bigfoot) {
  const bx = BF.x;
  const by = BF.y;
  const bw = BF.w;
  const bh = BF.h;
  const top = by - bh;
  const cx = bx + bw / 2;
  const onGround = !BF.jumping;

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#1a3a1a";
  ctx.beginPath();
  ctx.ellipse(cx, by + 2, bw * 0.5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body
  ctx.fillStyle = "#5c3200";
  ctx.beginPath();
  ctx.roundRect(bx + 6, top + 22, bw - 12, bh - 30, 10);
  ctx.fill();

  // Fur texture lines
  ctx.strokeStyle = "#7a4a10";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(bx + 8 + i * 5, top + 28);
    ctx.lineTo(bx + 10 + i * 5, top + 40);
    ctx.stroke();
  }

  // Arms swing with leg phase
  const armSwing = onGround ? Math.sin(BF.legPhase) * 8 : 0;
  ctx.fillStyle = "#5c3200";
  ctx.beginPath();
  ctx.roundRect(bx, top + 24 + armSwing, 10, 22, 5);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(bx + bw - 10, top + 24 - armSwing, 10, 22, 5);
  ctx.fill();

  // Legs
  const legSwing = onGround ? Math.sin(BF.legPhase) * 10 : BF.vy < 0 ? -15 : 10;
  ctx.fillStyle = "#4a2800";
  ctx.save();
  ctx.translate(cx - 8, by - 14);
  ctx.rotate((legSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.roundRect(-5, 0, 12, 20, 5);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(cx + 8, by - 14);
  ctx.rotate((-legSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.roundRect(-5, 0, 12, 20, 5);
  ctx.fill();
  ctx.restore();

  // Big feet
  ctx.fillStyle = "#3a1f00";
  ctx.beginPath();
  ctx.ellipse(cx - 8, by + 1, 10, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 8, by + 1, 10, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#6b3d05";
  ctx.beginPath();
  ctx.arc(cx, top + 14, 15, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (glowing amber)
  ctx.fillStyle = "#e8780a";
  ctx.beginPath();
  ctx.arc(cx - 5, top + 12, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 5, top + 12, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8e1";
  ctx.beginPath();
  ctx.arc(cx - 5, top + 12, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 5, top + 12, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#3a1f00";
  ctx.beginPath();
  ctx.arc(cx, top + 17, 3, 0, Math.PI * 2);
  ctx.fill();

  // Brow ridge
  ctx.strokeStyle = "#3a1f00";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 9, top + 8);
  ctx.lineTo(cx - 3, top + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 9, top + 8);
  ctx.lineTo(cx + 3, top + 10);
  ctx.stroke();

  // Update leg animation
  if (onGround) BF.legPhase += 0.25;
}

// ── COLLISION ────────────────────────────────────────────────────────────────

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  getTop?: () => number;
}

export function checkCollision(a: Rect, b: Rect): boolean {
  const pad = 10;
  const aTop = a.getTop ? a.getTop() : a.y;
  return !(
    a.x + a.w - pad < b.x + pad ||
    a.x + pad > b.x + b.w - pad ||
    aTop + pad > b.y + b.h - pad ||
    aTop + a.h - pad < b.y + pad
  );
}
