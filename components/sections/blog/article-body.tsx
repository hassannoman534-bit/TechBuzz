import { BLOG_GRID } from "./blog.config";

type ArticleBodyProps = { html: string };

/**
 * Renders the WordPress post body.
 *
 * dangerouslySetInnerHTML is deliberate and safe here: this is first-party
 * content from TechBuzz's own CMS, authored by TechBuzz staff. It is not user
 * submitted. Adding a sanitiser would mean a new dependency and would strip
 * the embeds the writers rely on.
 *
 * The styles are scoped to .wp-prose rather than added to globals.css, so this
 * layer travels with the component. Every selector here is class-qualified,
 * which also clears the unlayered h1-h6 Syne rule in globals.css without
 * touching it: .wp-prose h2 is specificity 0,1,1 against that rule's 0,0,1.
 */
export function ArticleBody({ html }: ArticleBodyProps) {
  return (
    <>
      <style>{PROSE}</style>
      <div
        className="wp-prose font-footer-text"
        style={{ maxWidth: `${BLOG_GRID.articleMaxWidthCh}ch` }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}

const PROSE = `
.wp-prose{color:rgb(255 255 255/0.72);font-size:1.02rem;line-height:1.75}
.wp-prose>*+*{margin-top:1.15em}
.wp-prose h1,.wp-prose h2,.wp-prose h3,.wp-prose h4,.wp-prose h5,.wp-prose h6{
  font-family:var(--font-outfit),ui-sans-serif,system-ui,sans-serif;
  font-weight:600;color:#fff;letter-spacing:-0.015em;text-wrap:balance;line-height:1.25}
.wp-prose h2{font-size:1.6rem;margin-top:2.3em;position:relative;padding-top:1.1em}
/* A hairline above every h2 gives the body a visible chapter rhythm without
   asking the writers to add anything in WordPress. */
.wp-prose h2::before{content:"";position:absolute;top:0;left:0;width:2.25rem;height:1px;
  background:linear-gradient(90deg,#7b61ff,rgb(34 216 255/0))}
.wp-prose h3{font-size:1.22rem;margin-top:1.9em}
.wp-prose h4,.wp-prose h5,.wp-prose h6{font-size:1.02rem;margin-top:1.7em}
.wp-prose p{margin-top:1.15em}
/* Opening paragraph only, and only when it really is the opening paragraph.
   :first-child guards against a post that starts with an image or a heading. */
.wp-prose>p:first-child{font-size:1.16rem;line-height:1.65;color:rgb(255 255 255/0.84)}
.wp-prose>p:first-child::first-letter{float:left;font-family:var(--font-outfit),sans-serif;
  font-size:3.4em;line-height:0.82;font-weight:600;color:#fff;
  margin:0.06em 0.11em 0 0;
  background:linear-gradient(160deg,#c9c2ff,#7b61ff);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.wp-prose a{color:#c9c2ff;text-decoration:underline;text-underline-offset:3px;
  text-decoration-color:rgb(201 194 255/0.35);transition:color .3s,text-decoration-color .3s}
.wp-prose a:hover{color:#fff;text-decoration-color:rgb(255 255 255/0.6)}
.wp-prose strong{color:#fff;font-weight:600}
.wp-prose ul,.wp-prose ol{padding-left:1.35em}
.wp-prose ul{list-style:disc}
.wp-prose ol{list-style:decimal}
.wp-prose li{margin-top:0.5em}
.wp-prose li::marker{color:rgb(123 97 255/0.8)}
.wp-prose blockquote{position:relative;margin-top:2em;border:1px solid rgb(255 255 255/0.09);
  border-radius:1rem;background:rgb(255 255 255/0.025);padding:1.4em 1.5em;
  color:rgb(255 255 255/0.86);font-size:1.08rem;line-height:1.6;font-style:normal;
  box-shadow:inset 0 1px 0 0 rgb(255 255 255/0.05)}
.wp-prose blockquote::before{content:"";position:absolute;left:0;top:1.2em;bottom:1.2em;width:2px;
  border-radius:2px;background:linear-gradient(180deg,#7b61ff,#22d8ff)}
.wp-prose blockquote p{margin-top:0.7em}
.wp-prose blockquote p:first-child{margin-top:0}
.wp-prose code{background:rgb(255 255 255/0.06);border-radius:4px;padding:0.15em 0.4em;font-size:0.9em}
.wp-prose pre{background:rgb(255 255 255/0.04);border:1px solid rgb(255 255 255/0.1);
  border-radius:12px;padding:1em;overflow-x:auto}
.wp-prose pre code{background:none;padding:0}
/* WordPress ships raw img and iframe with hard width attributes. Without these
   a single wide image gives the whole page a horizontal scrollbar. */
.wp-prose img{max-width:100%;height:auto;border-radius:12px;display:block}
.wp-prose figure{margin-top:1.6em}
.wp-prose figcaption{font-size:0.82rem;color:rgb(255 255 255/0.45);margin-top:0.6em}
.wp-prose iframe,.wp-prose video{max-width:100%;border-radius:12px;aspect-ratio:16/9;height:auto;width:100%}
.wp-prose table{width:100%;border-collapse:collapse;display:block;overflow-x:auto}
.wp-prose th,.wp-prose td{border:1px solid rgb(255 255 255/0.12);padding:0.6em 0.8em;text-align:left}
.wp-prose th{color:#fff;font-weight:600;background:rgb(255 255 255/0.03)}
.wp-prose hr{border:0;border-top:1px solid rgb(255 255 255/0.12);margin:2.4em 0}
@media (prefers-reduced-motion: reduce){
  .wp-prose a{transition:none}
}
`;
