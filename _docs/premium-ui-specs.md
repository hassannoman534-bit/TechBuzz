# Premium UI & Animation Specs (Cuberto & Exoape Inspired)

## 1. Premium Blur-to-Clear Text Reveal (Scroll Animation)
**Vibe:** Cinematic, soft, high-end entrance.
**Tech:** Framer Motion `whileInView` + CSS Filters.
**Logic:** Text starts with `opacity: 0`, `filter: blur(12px)`, and `y: 40`. On scroll, it transitions to `opacity: 1`, `filter: blur(0px)`, and `y: 0` with a slow ease (e.g., `duration: 0.8, ease: [0.25, 1, 0.5, 1]`). 
**Implementation Note:** Text should be split into lines or words, staggering the blur reveal for each word.

## 2. Hero 3D Parallax Text (Exoape Style)
**Vibe:** Immersive, massive typography tied to scroll physics.
**Tech:** Framer Motion `useScroll` + `useTransform`.
**Logic:** 
- The main hero heading is large.
- As the user scrolls down, the text moves vertically (`y`), scales down slightly (`scale`), and tilts slightly (`rotateX: 10deg`).
- The background image/canvas scales UP while the text moves DOWN, creating deep parallax.

## 3. Premium Service Cards (Cuberto Style)
**Vibe:** Large, tactile, rounded corners, hidden media reveal.
**Tech:** Tailwind + Framer Motion.
**Logic:** 
- Large border radii (`rounded-3xl` or `rounded-[2rem]`).
- On hover, the inner image or video scales up smoothly (`scale: 1.05`, `duration: 0.6`).
- A subtle floating custom cursor attaches to the card on hover.
- Glassmorphism overlay on the text block at the bottom of the card.

## 4. Trusted Clients Marquee (Cuberto Style)
**Vibe:** Infinite, smooth, grayscale to color.
**Tech:** CSS `@keyframes marquee` or Framer Motion infinite pan.
**Logic:** Two identical tracks of client logos moving horizontally. Logos are default `opacity-50 grayscale`. On hover, they transition to `opacity-100 grayscale-0`.

## 5. Global Custom Cursor
**Vibe:** Magnetic, context-aware.
**Tech:** React state tracking mouse `clientX/clientY` + Framer Motion `layoutId`.
**Logic:** A small dot follows the mouse globally. When hovering over a Service Card or Button, the cursor expands into a large blurred circle or displays text like "View Project".