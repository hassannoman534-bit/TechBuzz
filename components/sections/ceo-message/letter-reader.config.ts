/**
 * Reading mode for the belief letter.
 *
 * At rest the sheet is an object: small, tilted, draggable. Clicking it opens
 * the reader, which brings the sheet forward until it owns the screen, flattens
 * it so the type is square to the eye, and parks it on its first line. From
 * there the page's own scroll walks down the sheet. At the end of the read the
 * sheet returns to exactly the frame it started in.
 *
 * ── Why the read is scrubbed by real scroll ─────────────────────────────────
 *
 * The obvious implementation captures the wheel and moves the sheet by the
 * delta. This project does not do that: hijacking wheel or touch is a standing
 * rule, it breaks trackpad momentum, keyboard paging and every assistive
 * scroller, and it leaves the reader with no way out but a button. So the
 * reader instead borrows the pattern the section above it already uses. A
 * runway of empty scroll is appended to the section, the stage is pinned to the
 * top of the viewport with `position: sticky`, and the read is driven by how
 * far through that runway the page has scrolled. Scrolling down advances the
 * sheet upward, scrolling up sends it back down, and the whole read is
 * reversible and interruptible because it is nothing but a scroll position.
 *
 * ── Why the runway is added on open, not left in the markup ─────────────────
 *
 * A permanent runway would mean 150svh of pinned letter for every visitor,
 * including the ones who never click it, which changes the rhythm of a page
 * whose section heights were measured rather than guessed. So the runway is
 * mounted when the reader opens. Growing the section is safe at that moment
 * because the reader also scrolls the page to the top of the section, so the
 * new height is entirely below the fold and nothing above the viewport moves.
 * Taking it away again is only safe in one place, which is why the runway is
 * left armed until the section has scrolled fully below the viewport.
 */
export const READER = {
  /**
   * Master switch. False ships the letter exactly as it was before: an object
   * to drag, no runway, no pin, no reader.
   */
  enabled: true,

  /**
   * The runway, in svh, added below the pinned stage when the reader opens.
   * This is the entire scroll budget for one read, so it sets the pace: less
   * makes the sheet race past the lines, more makes the reader scroll a long
   * way for a short letter. 150 reads at roughly the speed of the pinned
   * message stage above it.
   */
  runwaySvh: 150,

  /**
   * Sheet height while reading, as a multiple of the stage height. Anything
   * above 1 leaves something to pan; at 1.42 a little over two thirds of the
   * sheet is on screen at once, so there is always a line of context above and
   * below the one being read.
   */
  fillH: 1.42,

  /**
   * Hard ceiling on the sheet's width, as a fraction of the stage width, so a
   * short wide window cannot push the sheet's edges outside the stage and have
   * them clipped by its overflow.
   */
  maxW: 0.9,

  /** Breathing room past the first and last line, in stage heights. */
  padH: 0.035,

  /**
   * Enter and exit springs for the zoom.
   *
   * Apple's duration and bounce form rather than stiffness and damping: it is
   * the one that can be reasoned about. Bounce stays near zero because paper
   * does not overshoot, and the exit is quicker than the entrance on purpose.
   * Opening is the reader deciding; closing is the interface answering, and an
   * answer that takes as long as the decision feels slow.
   */
  enter: { duration: 0.52, bounce: 0.06 },
  exit: { duration: 0.34, bounce: 0 },

  /**
   * Read progress at which the sheet starts travelling back to its resting
   * frame, and the progress at which the reader closes itself. The gap between
   * them is the return: by the time the runway runs out the sheet is already
   * home, so the section unpins with nothing left to animate.
   */
  returnFrom: 0.84,
  returnDone: 0.985,

  /**
   * Pointer travel in px under which a press counts as a click rather than a
   * drag. Without this the sheet opens the reader every time it is turned,
   * because a drag is a press and a release at almost the same point.
   */
  clickSlopPx: 6,

  /** Lenis duration for the scroll that pins the stage, in seconds. */
  pinScrollS: 0.7,
  /** Lenis duration for the scroll that re-centres the sheet on manual close. */
  closeScrollS: 0.45,

  /**
   * Supersampling for the letter's texture, on top of SHEET.texW and texH.
   *
   * At rest the sheet is about 420px wide and the 1280px texture is three times
   * oversampled, so this was never needed. Reading it is a different problem:
   * the sheet gets about two and a half times larger, and on a 2x screen the
   * type would be upscaled by roughly a third and go soft at exactly the moment
   * someone is reading it.
   *
   * 1.25 costs about 14MB of video memory instead of 9MB and holds up to a 2x
   * screen. Set it to 1 to go back to the old texture if a machine on this page
   * is tight on memory; the letter stays sharp at rest either way, and nothing
   * about the layout changes, because paintLetter scales the context rather
   * than the coordinates it draws with.
   */
  texScale: 1.25,

  /**
   * Device pixel ratio ceiling for the stage canvas. The canvas now covers the
   * whole stage rather than a 420px box, so the old ceiling of 2 would be four
   * times the fragments on a retina laptop for a surface that is one textured
   * plane with no post processing. 1.75 is the point where the paper's grain
   * stops visibly improving.
   */
  dprMax: 1.75,

  /** Idle breathing is damped while reading. Paper held up close is held still. */
  idleDamp: 0.85,
} as const;
