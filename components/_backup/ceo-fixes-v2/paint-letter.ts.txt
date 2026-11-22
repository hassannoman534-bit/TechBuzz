import { beliefLetter, PAPER, SHEET } from "./belief-letter.config";

/**
 * Paints the letter onto a 2D canvas, once, to be used as a texture.
 *
 * Everything on the sheet is drawn here rather than composited from images, so
 * the copy in the config is the only place the letter exists and a wording
 * change needs no new asset. The paint is deliberately one shot: the result is
 * uploaded to the GPU and never redrawn, so cost here is paid a single time.
 *
 * Tracking is drawn glyph by glyph rather than through ctx.letterSpacing.
 * That property is recent enough that Safari only grew it in 17.4, and a sheet
 * whose letterhead loses its spacing on an iPad is worse than a loop.
 */

export type LetterFonts = {
  display: string;
  serif: string;
  hand: string;
  ui: string;
};

/** Draws a string with manual tracking and returns the width it occupied. */
function tracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
): number {
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + spacing;
  }
  return cursor - spacing - x;
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number): number {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + spacing;
  return Math.max(0, w - spacing);
}

/** Greedy wrap by measurement, so config copy can be any length. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** A faint fibre tile, so the stock is never a flat fill. */
function fibre(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number): void {
  const tile = document.createElement("canvas");
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext("2d");
  if (!tctx) return;
  const img = tctx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    // Warm speckle: the noise rides on the stock rather than greying it.
    const n = Math.random();
    const v = 255 - Math.round(n * 46);
    img.data[i] = v;
    img.data[i + 1] = v - 4;
    img.data[i + 2] = v - 14;
    img.data[i + 3] = Math.round(n * 255 * amount);
  }
  tctx.putImageData(img, 0, 0);
  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // A few long fibres across the grain, barely there.
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = PAPER.inkFaint;
  ctx.lineWidth = 1;
  for (let i = 0; i < 26; i += 1) {
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.3, y + 14, w * 0.7, y - 14, w, y + 6);
    ctx.stroke();
  }
  ctx.restore();
}

/** The wax seal, bottom right of the text block. */
function seal(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fonts: LetterFonts): void {
  ctx.save();
  // Outer ring, then an inner hairline, then the monogram.
  ctx.strokeStyle = PAPER.gold;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 11, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = PAPER.gold;
  ctx.font = `600 ${Math.round(r * 0.72)}px ${fonts.display}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(beliefLetter.monogram, cx, cy + 2);
  ctx.restore();
}

/**
 * Paints the sheet. Returns the canvas so the caller can hand it to a texture.
 *
 * Fonts must already be resolved to real family names. ctx.font cannot parse a
 * CSS custom property, which is the same trap the liquid headlines on this page
 * hit, so the caller reads them off a probe element first.
 */
export function paintLetter(fonts: LetterFonts, scale = 1): HTMLCanvasElement {
  const { texW: W, texH: H, pad } = SHEET;
  const canvas = document.createElement("canvas");
  // Supersampling is applied to the backing store and then to the context, so
  // every coordinate, font size and padding below still reads in the 1280 by
  // 1810 space the letter was laid out in. Scaling the numbers instead would
  // have meant re-tuning the whole sheet for one texture change.
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  if (scale !== 1) ctx.scale(scale, scale);

  // ── Stock ───────────────────────────────────────────────────────────────
  const stock = ctx.createLinearGradient(0, 0, W * 0.75, H);
  stock.addColorStop(0, PAPER.stockLight);
  stock.addColorStop(0.52, PAPER.stockMid);
  stock.addColorStop(1, PAPER.stockShade);
  ctx.fillStyle = stock;
  ctx.fillRect(0, 0, W, H);

  // A soft bloom where the key light lands, so the flat fill reads as a surface.
  const bloom = ctx.createRadialGradient(W * 0.26, H * 0.16, 0, W * 0.26, H * 0.16, H * 0.82);
  bloom.addColorStop(0, "rgba(255,255,255,0.5)");
  bloom.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);

  fibre(ctx, W, H, 0.5);

  // Edge shade. Real paper is never lit evenly to its own border.
  const edge = ctx.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, "rgba(90,78,60,0.07)");
  edge.addColorStop(0.12, "rgba(90,78,60,0)");
  edge.addColorStop(0.88, "rgba(90,78,60,0)");
  edge.addColorStop(1, "rgba(90,78,60,0.1)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, W, H);

  // ── The vertical word down the right margin ─────────────────────────────
  // The one feature worth keeping from the certificate that started this:
  // display type set vertically, holding the right edge of the sheet.
  const colW = 150;
  const bodyRight = W - pad - colW;
  const bodyW = bodyRight - pad;

  ctx.save();
  ctx.translate(W - pad - colW * 0.34, pad + 40);
  ctx.rotate(Math.PI / 2);
  ctx.font = `600 ${colW * 0.84}px ${fonts.display}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = PAPER.goldPale;
  ctx.globalAlpha = 0.5;
  tracked(ctx, beliefLetter.verticalWord.toUpperCase(), 0, 0, colW * 0.1);
  ctx.restore();

  // ── Letterhead ──────────────────────────────────────────────────────────
  let y = pad + 46;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = PAPER.ink;
  ctx.font = `600 40px ${fonts.display}`;
  const headW = tracked(ctx, beliefLetter.letterhead.toUpperCase(), pad, y, 11);

  y += 30;
  const rule = ctx.createLinearGradient(pad, 0, pad + headW, 0);
  rule.addColorStop(0, PAPER.gold);
  rule.addColorStop(1, "rgba(169,129,31,0.15)");
  ctx.fillStyle = rule;
  ctx.fillRect(pad, y, headW, 2);

  // ── Label ───────────────────────────────────────────────────────────────
  y += 118;
  ctx.fillStyle = PAPER.gold;
  ctx.font = `italic 400 38px ${fonts.serif}`;
  ctx.fillText(beliefLetter.label, pad, y);

  // ── Body ────────────────────────────────────────────────────────────────
  y += 76;
  // 44 measured out at roughly 13px once the sheet was drawn at its real width
  // on a laptop, which is under the size this would be printed at. 50 is the
  // most the copy takes before it runs past the signature block.
  const size = 50;
  const lead = Math.round(size * 1.66);
  ctx.fillStyle = PAPER.ink;
  ctx.font = `400 ${size}px ${fonts.serif}`;

  for (const para of beliefLetter.body) {
    if (!para) {
      y += Math.round(lead * 0.62);
      continue;
    }
    for (const line of wrap(ctx, para, bodyW)) {
      ctx.fillText(line, pad, y);
      y += lead;
    }
  }

  // ── Rule, signature, place ──────────────────────────────────────────────
  // Anchored to the bottom margin rather than trailing the last line of body.
  // Letting it follow the copy left a quarter of the sheet empty underneath
  // the signature, and it would move again on any wording change. The guard
  // keeps it below the body if the copy ever grows long enough to reach it.
  const placeY = H - pad - 36;
  const signY = placeY - 52;
  const ruleY = Math.max(y + 40, signY - 104);

  const closeRule = ctx.createLinearGradient(pad, 0, pad + 240, 0);
  closeRule.addColorStop(0, "rgba(169,129,31,0.55)");
  closeRule.addColorStop(1, "rgba(169,129,31,0)");
  ctx.fillStyle = closeRule;
  ctx.fillRect(pad, ruleY, 240, 1);

  ctx.fillStyle = PAPER.ink;
  ctx.font = `600 90px ${fonts.hand}`;
  ctx.fillText(beliefLetter.signature, pad, signY);

  // Was inkFaint at 24: at the size the sheet actually renders it had gone.
  ctx.fillStyle = PAPER.inkSoft;
  ctx.font = `400 27px ${fonts.ui}`;
  tracked(ctx, beliefLetter.place.toUpperCase(), pad, placeY, 5);

  // The seal sits opposite the signature, on the body's right edge.
  seal(ctx, bodyRight - 58, signY - 30, 60, fonts);

  return canvas;
}

/** The letter as plain text, for the screen reader copy and the static sheet. */
export function letterParagraphs(): string[] {
  return beliefLetter.body.filter(Boolean);
}
