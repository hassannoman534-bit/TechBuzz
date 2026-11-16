import { ENVIRONMENT } from "./hero-scene.config";

/**
 * The back layer of the hero scene.
 *
 * Two ridgelines and a few pools of light, all static DOM. No canvas, no blur
 * filter, no animation of its own: the only thing that ever happens to this
 * layer is one transform applied by the parent for parallax, so it stays a
 * single promoted bitmap for the whole scroll.
 *
 * The ridges are SVG rather than images so they scale to any width without an
 * asset, cost nothing to download, and can take the page's own colours. They
 * are nearly the same value as the background on purpose. At the brief's
 * "subtle atmospheric silhouettes" they should register as depth rather than
 * as scenery, and anything with real contrast started to look like a stock
 * mountain photograph behind a man in a suit.
 */
export function HeroEnvironment(): React.ReactElement {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Ambient pools. Violet high and left, blue lower and right. */}
      <span
        className="absolute inset-0"
        style={{
          background: `radial-gradient(52% 46% at 28% 34%, ${ENVIRONMENT.violet}, rgba(3,7,18,0) 70%)`,
        }}
      />
      <span
        className="absolute inset-0"
        style={{
          background: `radial-gradient(44% 42% at 74% 56%, ${ENVIRONMENT.blue}, rgba(3,7,18,0) 72%)`,
        }}
      />

      {/* Haze along the ridgeline, where the ground light would gather. */}
      <span
        className="absolute inset-x-0"
        style={{
          bottom: "16%",
          height: "34%",
          background: `linear-gradient(to top, ${ENVIRONMENT.haze}, rgba(3,7,18,0))`,
        }}
      />

      {/*
        Ridges. preserveAspectRatio is set to slice from the bottom so the
        silhouettes keep their height on a short window instead of flattening
        into stripes.
      */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        style={{ height: "46%" }}
        viewBox="0 0 1600 420"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <defs>
          <linearGradient id="ceo-ridge-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ENVIRONMENT.ridgeFar} />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>
          <linearGradient id="ceo-ridge-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ENVIRONMENT.ridgeNear} />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>
        </defs>

        {/*
          Curves, and no rim strokes.

          The first version drew these as straight polylines with a one pixel
          stroke along the top. Behind a man in a suit on a dark page that did
          not read as distant hills, it read as a line chart, which is the one
          thing a marketing site must not accidentally draw. Smooth beziers
          with no outline at all read as landform.
        */}
        <path
          d="M0 254 C 190 196, 318 236, 470 168 S 772 128, 988 190 S 1330 146, 1600 208 L1600 420 L0 420 Z"
          fill="url(#ceo-ridge-far)"
        />
        <path
          d="M0 334 C 226 294, 372 334, 566 290 S 904 324, 1126 286 S 1412 328, 1600 304 L1600 420 L0 420 Z"
          fill="url(#ceo-ridge-near)"
        />
      </svg>

      {/*
        Floor. Sinks the base of the ridges and the figure's feet into the page
        colour so nothing in the scene ends on a hard horizontal line.
      */}
      <span
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "22%",
          background: "linear-gradient(to top, #030712 18%, rgba(3,7,18,0))",
        }}
      />
    </div>
  );
}
