import { LATTICE } from "./hero-scene.config";

/**
 * The lattice plane of the hero scene.
 *
 * The hero had a full parallax rig from the first build: four layers, each with
 * its own travel and scale. None of it could be seen. Everything behind the
 * word was either a smooth radial pool or a ridge a shade off the page black,
 * and a smooth gradient carries no information: slide it ten per cent and every
 * pixel still looks like its neighbour did a moment ago, so there is nothing
 * for the eye to track and the movement simply does not register.
 *
 * A regular field of points is the opposite. Every dot is a reference the eye
 * locks onto, so the same travel that was invisible against a gradient becomes
 * obvious against a lattice. The word moves 17, this moves 5, and that
 * differential is the whole effect.
 *
 * Static DOM and pure CSS backgrounds, like the environment layer it sits with.
 * No canvas, deliberately: this page is already at the browser's budget for
 * live WebGL contexts and a sixth is what costs the hero word its own.
 *
 * Two tones on one grid, offset by half a cell, so the field reads as a weave
 * rather than as graph paper, and masked hard so it concentrates where the word
 * is and is gone before it can reach the navbar, the figure or the ridges.
 */
export function HeroLattice(): React.ReactElement {
  const { cell, dot, primary, secondary, mask } = LATTICE;
  const half = cell / 2;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        backgroundImage: [
          `radial-gradient(circle at center, ${primary} ${dot}px, rgba(0,0,0,0) ${dot + 0.4}px)`,
          `radial-gradient(circle at center, ${secondary} ${dot}px, rgba(0,0,0,0) ${dot + 0.4}px)`,
        ].join(","),
        backgroundSize: `${cell}px ${cell}px, ${cell}px ${cell}px`,
        backgroundPosition: `0 0, ${half}px ${half}px`,
        // Masked rather than faded with opacity: a flat opacity would dim the
        // dots where they are wanted as much as where they are not, and the
        // field has to be gone entirely near the figure or it reads as a
        // texture printed over him.
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}
