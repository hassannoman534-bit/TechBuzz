/**
 * The belief letter: a sheet of paper the reader can pick up and turn.
 *
 * Why this exists. The page already states that the company was built on one
 * idea and names it, then streams the long message through the camera. What was
 * missing was the artefact: the thing the message was transcribed from. This is
 * that sheet, and it sits between the stage and the sign off, so the order of
 * the page reads idea, then argument, then object, then signature.
 *
 * Copy rules, same as the rest of this folder: short sentences, no dashes.
 * Paragraphs are wrapped by measurement at paint time, not by hand, so these
 * can be edited to any length without re-tuning the layout. An empty string is
 * a paragraph break.
 *
 * Fonts are the ones already loaded site wide, so the sheet costs no extra
 * font request: Syne for the letterhead and the vertical word, Newsreader for
 * the body, Caveat for the signature. Georgia and friends were the obvious
 * choice for a letter, but a system serif renders differently on every machine
 * and this type is baked into a texture, so visitors would not be looking at
 * the same letter. These three are loaded, so everyone is.
 */

export type BeliefLetterContent = {
  /** Small caps line at the head of the sheet. */
  letterhead: string;
  /** Runs down the right margin in display type. Kept to one short word. */
  verticalWord: string;
  /** Label above the body. */
  label: string;
  /** Body paragraphs. An empty string is a break. */
  body: string[];
  /** Handwritten signature. The formal name and role live in CeoSignoff below. */
  signature: string;
  /** Faint line under the rule. */
  place: string;
  /** Monogram inside the seal. Two characters, three at the most. */
  monogram: string;
  /** Section heading and the cue under the sheet. */
  eyebrow: string;
  heading: string;
  cue: string;
  cueTouch: string;
  /** Shown under the sheet once the reader is open. */
  cueRead: string;
  /** Accessible name of the control that opens and closes the reader. */
  openLabel: string;
  closeLabel: string;
  /** Read out in place of the sheet, which is a picture as far as a reader is concerned. */
  ariaLabel: string;
};

export const beliefLetter: BeliefLetterContent = {
  letterhead: "TechBuzz",
  verticalWord: "Belief",
  label: "Our belief",
  body: [
    "That the work should be good enough to argue for itself.",
    "",
    "Restaurants taught us this. A full room is not won by a louder voice. It is won by the photograph that makes someone hungry, and by the hour you chose to post it.",
    "",
    "So we do not win accounts on the strength of a deck. We win them in the second month, when the numbers move and the client stops checking whether we replied.",
  ],
  signature: "Muhammad Usman",
  place: "Lahore",
  monogram: "TB",
  eyebrow: "Signed",
  heading: "The letter itself",
  cue: "Click to read it, drag to lift it",
  cueTouch: "Swipe the page",
  cueRead: "Scroll to read, Esc to close",
  openLabel: "Read the letter close up",
  closeLabel: "Close the letter",
  ariaLabel:
    "A letter on TechBuzz paper, titled Our belief, signed by Muhammad Usman in Lahore. The text is repeated below the sheet.",
};

/**
 * Paper, in texture pixels. A4 proportion, 1 to 1.414.
 *
 * Fixed rather than scaled by device pixel ratio. The sheet renders at roughly
 * 420 CSS pixels wide, so 1280 is already oversampled more than three times and
 * reads sharp on a retina screen, while a ratio of 2 would have put this one
 * texture at 23MB of video memory. Mipmaps handle the minification.
 */
export const SHEET = {
  texW: 1280,
  texH: 1810,
  /** Margin inside the sheet, texture pixels. */
  pad: 112,
  /** Mesh size in world units. The camera is framed to this. */
  worldW: 1,
  worldH: 1.414,
  /**
   * Plane subdivision. The bend is per vertex, so this is the resolution of the
   * curve. 32 by 44 is the point past which the silhouette stopped visibly
   * improving at this sheet size; 16 by 22 showed faceting along the curl.
   */
  segX: 32,
  segY: 44,
} as const;

/** Warm stock and gold. The sheet is the one warm object on a cold page. */
export const PAPER = {
  /** Stock, light to shade. Painted as a soft diagonal so the sheet is never flat. */
  stockLight: "#f7f2e7",
  stockMid: "#f1ebdc",
  stockShade: "#e4dac6",
  /** Body ink. Near black, warmed, so it sits on paper rather than on screen. */
  ink: "#241d14",
  inkSoft: "#5a4e3c",
  inkFaint: "#8d8069",
  /** Gold, for rules, the vertical word, the label and the seal. */
  gold: "#a9811f",
  goldSoft: "#c9a34a",
  goldPale: "#e4cd94",
} as const;

/**
 * Motion and lighting.
 *
 * The sheet rests at a slight angle so it reads as an object in space before
 * anyone touches it. Drag turns it; release springs it home. The spring is
 * critically damped on purpose: a bouncy sheet of paper reads as rubber.
 */
export const LETTER_MOTION = {
  /** Resting tilt, radians. */
  restX: -0.07,
  restY: -0.26,
  /** How far a full drag across the canvas can turn the sheet, radians. */
  dragRangeY: 1.15,
  dragRangeX: 0.62,
  /** Clamp, so the sheet is never turned past a readable angle. */
  maxX: 0.5,
  maxY: 0.95,
  /** Return spring. Stiffness over mass, and the damping ratio. */
  stiffness: 46,
  damping: 0.92,
  /** Idle breathing: a slow wave across the stock. */
  idleAmp: 0.035,
  idleSpeedS: 0.27,
  /** Curl driven by how far the sheet is turned. Paper bends when you lift it. */
  curlFromTurn: 0.16,
  /** Hover lifts the sheet toward the reader and brightens the sheen. */
  hoverLift: 0.07,
  hoverSheen: 0.5,
  /** Scroll: the sheet rises and settles as the section crosses the viewport. */
  scrollRiseVh: 0.07,
  scrollTurn: 0.1,
  /** Light direction in view space. Warm key from the upper left. */
  lightDir: [-0.42, 0.72, 0.55],
  /** Specular width. Low is a tight hotspot, high is a broad soft sheen. */
  sheenSpread: 9,
  sheenStrength: 0.34,
  /** Paper fibre, in the shader. Fine and very low contrast. */
  grain: 0.035,
} as const;

/**
 * Where the sheet is allowed to be live.
 *
 * Below this width the static letter is rendered instead: real HTML, same copy,
 * no WebGL context and no 9MB texture on a phone GPU. The same convention the
 * liquid headlines on this page already follow. Set to 0 to run the sheet
 * everywhere.
 */
export const LETTER_LIVE_ABOVE_PX = 640;
