/**
 * Vanilla JS implementation of the PixelatedCanvas component.
 * Features: sampling, dot scaling, interactivity (repel, attract, swirl), jitter, and fading.
 */
export class PixelatedCanvas {
  constructor(options) {
    this.src = options.src;
    this.container = options.container;
    this.width = options.width || 400;
    this.height = options.height || 500;
    this.cellSize = options.cellSize || 3;
    this.dotScale = options.dotScale || 0.9;
    this.shape = options.shape || "square";
    this.backgroundColor = options.backgroundColor || "transparent";
    this.grayscale = options.grayscale || false;
    this.responsive = options.responsive || false;
    this.dropoutStrength = options.dropoutStrength !== undefined ? options.dropoutStrength : 0.4;
    this.interactive = options.interactive !== undefined ? options.interactive : true;
    this.distortionStrength = options.distortionStrength || 3;
    this.distortionRadius = options.distortionRadius || 80;
    this.distortionMode = options.distortionMode || "swirl";
    this.followSpeed = options.followSpeed || 0.2;
    this.sampleAverage = options.sampleAverage !== undefined ? options.sampleAverage : true;
    this.tintColor = options.tintColor || "#FFFFFF";
    this.tintStrength = options.tintStrength || 0.2;
    this.maxFps = options.maxFps || 60;
    this.objectFit = options.objectFit || "cover";
    this.jitterStrength = options.jitterStrength || 4;
    this.jitterSpeed = options.jitterSpeed || 4;
    this.fadeOnLeave = options.fadeOnLeave !== undefined ? options.fadeOnLeave : true;
    this.fadeSpeed = options.fadeSpeed || 0.1;

    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.samples = [];
    this.dims = { width: 0, height: 0, dot: 0 };
    this.targetMouse = { x: -9999, y: -9999 };
    this.animMouse = { x: -9999, y: -9999 };
    this.pointerInside = false;
    this.activity = 0;
    this.activityTarget = 0;
    this.lastFrameTime = 0;
    this.rafId = null;

    this.init();
  }

  async init() {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.src;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    this.compute(img);

    if (this.interactive) {
      this.canvas.addEventListener('pointermove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.targetMouse.x = e.clientX - rect.left;
        this.targetMouse.y = e.clientY - rect.top;
        this.pointerInside = true;
        this.activityTarget = 1;
      });

      this.canvas.addEventListener('pointerenter', () => {
        this.pointerInside = true;
        this.activityTarget = 1;
      });

      this.canvas.addEventListener('pointerleave', () => {
        this.pointerInside = false;
        if (this.fadeOnLeave) {
          this.activityTarget = 0;
        } else {
          this.targetMouse.x = -9999;
          this.targetMouse.y = -9999;
        }
      });
    }

    if (this.responsive) {
        window.addEventListener('resize', () => this.compute(img));
    }

    this.animate();
  }

  compute(img) {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = this.width;
    const displayHeight = this.height;

    this.canvas.width = Math.max(1, Math.floor(displayWidth * dpr));
    this.canvas.height = Math.max(1, Math.floor(displayHeight * dpr));
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    const offscreen = document.createElement("canvas");
    offscreen.width = Math.max(1, Math.floor(displayWidth));
    offscreen.height = Math.max(1, Math.floor(displayHeight));
    const off = offscreen.getContext("2d");

    const iw = img.naturalWidth || displayWidth;
    const ih = img.naturalHeight || displayHeight;
    let dw = displayWidth;
    let dh = displayHeight;
    let dx = 0;
    let dy = 0;

    if (this.objectFit === "cover") {
      const scale = Math.max(displayWidth / iw, displayHeight / ih);
      dw = Math.ceil(iw * scale);
      dh = Math.ceil(ih * scale);
      dx = Math.floor((displayWidth - dw) / 2);
      dy = Math.floor((displayHeight - dh) / 2);
    } else if (this.objectFit === "contain") {
      const scale = Math.min(displayWidth / iw, displayHeight / ih);
      dw = Math.ceil(iw * scale);
      dh = Math.ceil(ih * scale);
      dx = Math.floor((displayWidth - dw) / 2);
      dy = Math.floor((displayHeight - dh) / 2);
    }

    off.drawImage(img, dx, dy, dw, dh);

    let imageData;
    try {
      imageData = off.getImageData(0, 0, offscreen.width, offscreen.height);
    } catch (e) {
      console.error(e);
      return;
    }

    const data = imageData.data;
    const stride = offscreen.width * 4;
    const effectiveDotSize = Math.max(1, Math.floor(this.cellSize * this.dotScale));
    this.dims = { width: displayWidth, height: displayHeight, dot: effectiveDotSize };

    const luminanceAt = (px, py) => {
      const ix = Math.max(0, Math.min(offscreen.width - 1, px));
      const iy = Math.max(0, Math.min(offscreen.height - 1, py));
      const i = iy * stride + ix * 4;
      return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    };

    const hash2D = (ix, iy) => {
      const s = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453123;
      return s - Math.floor(s);
    };

    let tintRGB = null;
    if (this.tintColor && this.tintStrength > 0) {
      if (this.tintColor.startsWith("#")) {
        const hex = this.tintColor.slice(1);
        if (hex.length === 3) {
          tintRGB = [parseInt(hex[0] + hex[0], 16), parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16)];
        } else {
          tintRGB = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
        }
      }
    }

    this.samples = [];
    for (let y = 0; y < offscreen.height; y += this.cellSize) {
      const cy = Math.min(offscreen.height - 1, y + Math.floor(this.cellSize / 2));
      for (let x = 0; x < offscreen.width; x += this.cellSize) {
        const cx = Math.min(offscreen.width - 1, x + Math.floor(this.cellSize / 2));
        
        let r, g, b, a;
        if (!this.sampleAverage) {
          const idx = cy * stride + cx * 4;
          r = data[idx]; g = data[idx + 1]; b = data[idx + 2]; a = data[idx + 3] / 255;
        } else {
          let tr = 0, tg = 0, tb = 0, ta = 0, count = 0;
          for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
              const sx = Math.max(0, Math.min(offscreen.width - 1, cx + ox));
              const sy = Math.max(0, Math.min(offscreen.height - 1, cy + oy));
              const sIdx = sy * stride + sx * 4;
              tr += data[sIdx]; tg += data[sIdx + 1]; tb += data[sIdx + 2]; ta += data[sIdx + 3] / 255;
              count++;
            }
          }
          r = tr / count; g = tg / count; b = tb / count; a = ta / count;
        }

        if (this.grayscale) {
          const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          r = g = b = L;
        } else if (tintRGB) {
          const k = this.tintStrength;
          r = r * (1 - k) + tintRGB[0] * k;
          g = g * (1 - k) + tintRGB[1] * k;
          b = b * (1 - k) + tintRGB[2] * k;
        }

        const Lc = luminanceAt(cx, cy);
        const Lx1 = luminanceAt(cx - 1, cy);
        const Lx2 = luminanceAt(cx + 1, cy);
        const Ly1 = luminanceAt(cx, cy - 1);
        const Ly2 = luminanceAt(cx, cy + 1);
        const grad = Math.abs(Lx2 - Lx1) + Math.abs(Ly2 - Ly1) + Math.abs(Lc - (Lx1 + Lx2 + Ly1 + Ly2) / 4);
        const dropoutProb = Math.max(0, Math.min(1, (1 - (grad / 255)) * this.dropoutStrength));
        const drop = hash2D(cx, cy) < dropoutProb;
        
        this.samples.push({ x, y, r, g, b, a, drop, seed: hash2D(cx, cy) });
      }
    }
  }

  animate() {
    const now = performance.now();
    const minDelta = 1000 / this.maxFps;
    if (now - this.lastFrameTime < minDelta) {
      this.rafId = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastFrameTime = now;

    if (this.interactive) {
      this.animMouse.x += (this.targetMouse.x - this.animMouse.x) * this.followSpeed;
      this.animMouse.y += (this.targetMouse.y - this.animMouse.y) * this.followSpeed;
      
      if (this.fadeOnLeave) {
        this.activity += (this.activityTarget - this.activity) * this.fadeSpeed;
      } else {
        this.activity = this.pointerInside ? 1 : 0;
      }
    }

    if (this.backgroundColor === "transparent") {
      this.ctx.clearRect(0, 0, this.dims.width, this.dims.height);
    } else {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.dims.width, this.dims.height);
    }

    const mx = this.animMouse.x;
    const my = this.animMouse.y;
    const sigma = this.distortionRadius * 0.5;
    const t = now * 0.001 * this.jitterSpeed;
    const activity = Math.max(0, Math.min(1, this.activity));

    for (const s of this.samples) {
      if (s.drop || s.a <= 0) continue;

      let drawX = s.x + this.cellSize / 2;
      let drawY = s.y + this.cellSize / 2;

      if (this.interactive && activity > 0.0005) {
        const dx = drawX - mx;
        const dy = drawY - my;
        const dist2 = dx * dx + dy * dy;
        const falloff = Math.exp(-dist2 / (2 * sigma * sigma));
        const influence = falloff * activity;

        if (influence > 0.0005) {
          if (this.distortionMode === "repel") {
            const dist = Math.sqrt(dist2) + 0.0001;
            drawX += (dx / dist) * this.distortionStrength * influence;
            drawY += (dy / dist) * this.distortionStrength * influence;
          } else if (this.distortionMode === "attract") {
            const dist = Math.sqrt(dist2) + 0.0001;
            drawX -= (dx / dist) * this.distortionStrength * influence;
            drawY -= (dy / dist) * this.distortionStrength * influence;
          } else if (this.distortionMode === "swirl") {
            const angle = this.distortionStrength * 0.05 * influence;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            drawX = mx + (cosA * dx - sinA * dy);
            drawY = my + (sinA * dx + cosA * dy);
          }

          if (this.jitterStrength > 0) {
            drawX += Math.sin(t + s.seed * 100) * this.jitterStrength * influence;
            drawY += Math.cos(t + s.seed * 110) * this.jitterStrength * influence;
          }
        }
      }

      this.ctx.globalAlpha = s.a;
      this.ctx.fillStyle = `rgb(${s.r}, ${s.g}, ${s.b})`;
      if (this.shape === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, this.dims.dot / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(drawX - this.dims.dot / 2, drawY - this.dims.dot / 2, this.dims.dot, this.dims.dot);
      }
    }

    this.rafId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
