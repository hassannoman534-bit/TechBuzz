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
  /**
   * The still logo the reveal hands over to, and the colour the glass draws
   * the mark in.
   *
   * The reveal only ever reads the source's alpha, so the white PNG is still
   * the right input: it is the shape that matters. The still fallback cannot
   * use it on a light field, where white is invisible, so it gets an inked
   * copy of the same artwork.
   */
  stillSrc: "/assets/brand/techbuzz-logo-ink.png",
  logoColor: "#0e1428",
  /**
   * The field the reveal happens on, and the single change that fixes the box.
   *
   * This ran on the page void before, which is what the dark preset is for,
   * and it was wrong in a way no amount of tuning was going to repair. On a
   * page at rgb(3,7,18) the glass has nothing to refract and nothing to catch:
   * the only thing with any luminance is the rim light, so the one part of the
   * effect that read at all was its outline, which is precisely why it looked
   * like a logo sitting in a box.
   *
   * On a light field the same shader has something to bend. The rim stops
   * being the brightest thing on screen, the dispersion in the corners becomes
   * visible, and the tile reads as glass rather than as an edge. This is the
   * preset the component was built for and the one the reference shows.
   *
   * The canvas paints this flat and covers the whole screen, so the frosted
   * texture below goes over the top of it rather than around it. Nothing is
   * masked, nothing has to line up, and no rectangle can exist.
   */
  look: "light" as const,
  background: "#edeef2",

  /**
   * The frosted field: what makes it read as glass rather than as grey.
   *
   * Two wide colour blooms well behind the tile, and a fine grain over
   * everything including the canvas. The grain is the important half. It is
   * what a frosted surface actually looks like up close, and because it is
   * laid over the canvas as well as the page it also guarantees the two read
   * as one surface.
   */
  field: {
    bloomA: "rgba(123,97,255,0.30)",
    bloomB: "rgba(91,124,255,0.26)",
    bloomC: "rgba(44,245,176,0.14)",
    /** Grain tile and how much of it shows. Past about 0.06 it reads as dirt. */
    grainSrc: "/assets/brand/grain.png",
    grainOpacity: 0.045,
    grainTilePx: 128,
    /** Pulls the eye to the middle and stops the blooms touching the edges. */
    vignette: "radial-gradient(118% 100% at 50% 45%, rgba(0,0,0,0) 52%, rgba(14,20,40,0.10) 100%)",
  },

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
  /*
    These now follow the light preset rather than fighting it.

    On the void every one of them had to be turned down or off, because each
    was drawing an outline. On a light field they are the effect: the lift
    shadow gives the tile a place to sit, and the specular is what catches
    along the bevel. The one thing still overridden is the melt, and only
    gently, because the light path has no blazing rim to hide.
  */
  halo: 0,
  shadow: 1,
  bevelWidth: 0.14,
  specular: 1,
  /** The landing ring. Kept faint: it is the one other thing drawn on the void. */
  ripple: 1,

  /**
   * How far the tile's own shading fades out at its rim, in plate units.
   *
   * Zero on the light field, and that is deliberate rather than an oversight.
   *
   * This existed to kill the rim light on the void, where it measured +64/255
   * against a page at rgb(3,7,18): a band twenty times brighter than its
   * surroundings, drawn around the tile, which is what the box was. On the
   * light field the identical rim measures +15/255 against a field at 237, a
   * lift of about six per cent. It is not an outline any more, it is the
   * hairline along the edge of a piece of glass, and it is a large part of why
   * the reference reads as glass at all.
   *
   * Measured before changing it: at 0.16 the hairline came out at +0/255, so
   * the melt was erasing the very thing that was wanted here. Raise it only if
   * the edge ever looks hard; the glow and the inner lip survive it, the
   * hairline does not.
   */
  edgeMelt: 0,
  /**
   * How far the droplet magnifies the mark before it glides out. The upstream
   * dark preset uses 1.6; a wordmark's thin strokes smear at that, so this is
   * deliberately lower. Raise it if the mark ever becomes square.
   */
  startZoom: 1.9,

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
  dprMax: 1.5,

  /**
   * Intro timing, ms.
   *
   * The hold starts when the reveal is ready to play rather than on mount, so a
   * slow machine does not get a reveal cut off halfway by the overlay leaving.
   * `maxHoldMs` is the ceiling that makes that safe: whatever happens to the
   * field build, the page is never held longer than this.
   */
  holdMs: 2500,
  maxHoldMs: 4200,

  /**
   * The handover, which is the other half of what was wrong.
   *
   * The overlay used to start fading at the same instant the hero word was
   * mounted, so the fade and the building of a WebGL context, the compiling of
   * its shaders and the rasterising of the word all happened on the same
   * frames. That is the stutter: the exit was not slow, it was starved.
   *
   * Now the word is mounted `prewarmMs` before the overlay moves, while the
   * plate is still fully opaque and hiding it. By the time anything animates,
   * the expensive work is done and the main thread has nothing else to do.
   * The reveal's own canvas is released at the same moment, so the two are
   * never alive together.
   */
  prewarmMs: 420,

  /**
   * How long the plate takes to leave, ms.
   *
   * 550 before, which read as a cut. The plate now lifts and softens on its
   * way out instead of simply vanishing, and that only works with time to do
   * it in. The light field is also crossfaded to the page void before the
   * plate goes, so the eye is taken from light to dark in one movement rather
   * than being dropped into it.
   */
  exitMs: 1150,
  /** How long to wait for the reveal before falling back to the static logo. */
  patienceMs: 900,
} as const;
