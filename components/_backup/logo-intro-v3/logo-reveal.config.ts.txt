/**
 * The glass reveal on the Message From CEO intro.
 *
 * Phase 1 of the page used to be the logo alone on the void, arriving soft and
 * sharpening. This replaces that with the liquid glass reveal: a droplet grows,
 * lands, spreads into a glass tile holding the mark, a band of light crosses it,
 * and the glass lets go and leaves the mark on the void.
 *
 * ── The asset problem, which decides how good this looks ────────────────────
 *
 * The effect's tile is a square superellipse. There is no aspect parameter
 * anywhere in the shader: `shape()` divides by a scalar, and the corner focus,
 * the diagonal weighting and `contourRadius` all assume the tile is isotropic.
 * It is built for a squarish mark, which is what the registry demo uses.
 *
 * Every TechBuzz logo in this repo is the same file at 2167 by 1004, a wide
 * wordmark. Fitted into a square tile it becomes a band across the middle, so
 * the rim bends the first and last letters, which is the good part, but the
 * corner optics, which are the signature of this effect, spend themselves on
 * empty glass above and below the type. The settings below get the most out of
 * the wordmark: it is scaled to very nearly the tile's width so the side rim
 * does the work, and the magnification is kept modest because thin letter
 * strokes smear under it in a way a chunky glyph does not.
 *
 * If a square mark exists outside the repo, a monogram, an app icon, anything
 * roughly square, point `logoSrc` at it and raise `startZoom` back toward 1.6:
 * that is the version this effect was designed for.
 * TODO Malik: is there a square TechBuzz mark? The letter's seal already uses a
 * "TB" monogram, so the idea exists in the brand, but I am not inventing the
 * artwork for it.
 */
export const LOGO_REVEAL = {
  /** Master switch. False restores the original static logo intro exactly. */
  enabled: true,

  /**
   * The mark. Same asset the static intro used, so nothing new is downloaded.
   * Only its shape is read: the reveal draws it in `logoColor`, because
   * `originalColors` stays off and the shader never samples the colour texture.
   */
  logoSrc: "/assets/brand/techbuzz-logo-white.png",
  logoColor: "#ffffff",
  /** The page void. The canvas paints this, so a mismatch would show as a box. */
  background: "#030712",

  /**
   * Tile size in px, and the logo's share of it.
   *
   * The revealed mark ends up `logoScale * tileSize` wide, so 0.9 of a 300px
   * tile is a 270px wordmark, close to the low end of the static logo's old
   * clamp. Bigger would be easy and is not free: the expensive branch of the
   * fragment shader runs over the tile's area, so this number squared is the
   * GPU bill. The wrapper is sized at 1.75 times this by the engine, which is
   * the margin the halo and the lift shadow need.
   */
  tileSize: 300,
  logoScale: 0.9,
  finalScale: 1,

  /**
   * Timing, in seconds, fitted to the intro hold below.
   *
   * `present` is how long the glass holds the mark, and the reveal runs for
   * `present` plus a fixed 1.1s tail. The upstream defaults are 2.4 and 2.3,
   * which would have outlasted the whole intro.
   */
  present: 1.15,
  glide: 1.1,

  /*
    Softening the tile's outer boundary.

    The upstream dark preset was built to sit on pure black as an app icon, and
    it is drawn to read as a distinct object: a bluish halo outside the rim, a
    wide bevel band, and a full strength specular. On this page that combination
    outlines a rounded rectangle on the void, and because the mark inside it is
    a wide wordmark rather than a square glyph, what the eye reads is a logo
    sitting in a container rather than a mark held in glass.

    So: no halo and no lift shadow, which are the two things that draw anything
    at all outside the tile; a bevel narrowed back to the light preset's width,
    so the rim is a hairline instead of a band; and the specular pulled down so
    that hairline glints rather than glows. The glass still refracts the mark
    exactly as before, which is the part worth keeping. Raise `halo` back toward
    1 if it now reads as too flat.
  */
  halo: 0,
  shadow: 0,
  bevelWidth: 0.14,
  specular: 0.55,
  /** The landing ring. Kept faint: it is the one other thing drawn on the void. */
  ripple: 0.25,

  /**
   * How far the tile's own shading fades out at its rim, in plate units.
   *
   * This is the one that actually removes the container. Dropping the halo took
   * away the glow outside the rim and the box survived it, because the box was
   * never outside the rim: it is the rim light itself, which measures +64/255
   * at the edge against a page at rgb(3,7,18). The melt takes that to +1/255.
   *
   * At 0.3 the shading is gone over the outer third of the tile's half width
   * while the refraction carries on to the very edge, so the mark is still bent
   * and split into colour and the glass itself has no boundary to find. Set it
   * to 0 for the upstream hard edged pane.
   */
  edgeMelt: 0.3,
  /**
   * How far the droplet magnifies the mark before it glides out. The upstream
   * dark preset uses 1.6; a wordmark's thin strokes smear at that, so this is
   * deliberately lower. Raise it if the mark ever becomes square.
   */
  startZoom: 1.45,

  /**
   * Cost levers. See the component's header for what each one buys.
   *
   * texSize is the distance field's resolution and the CPU cost. The build is
   * time sliced so it never blocks a frame, which is why 1024 is affordable
   * here: the wordmark's thin strokes need the resolution, and the only thing a
   * slow machine loses is a few hundred ms before the reveal can start, which
   * the intro absorbs. Drop to 512 if a weak machine takes too long to start.
   *
   * spectralSamples is the fragment shader's inner loop and the GPU cost.
   * Upstream hard-codes 20. 12 keeps the dispersion smooth at this tile size;
   * go up if the colour fringe bands, down if frames drop.
   */
  texSize: 1024,
  spectralSamples: 12,
  dprMax: 1.75,

  /**
   * Intro timing, ms.
   *
   * The hold starts when the reveal is ready to play rather than on mount, so a
   * slow machine does not get a reveal cut off halfway by the overlay leaving.
   * `maxHoldMs` is the ceiling that makes that safe: whatever happens to the
   * field build, the page is never held longer than this.
   */
  holdMs: 2500,
  maxHoldMs: 3600,
  /** How long to wait for the reveal before falling back to the static logo. */
  patienceMs: 900,
} as const;
