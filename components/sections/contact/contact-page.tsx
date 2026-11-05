import { ContactIntro } from "./contact-intro";
import { ContactForm } from "./contact-form";
import { Studios } from "./studios";
import { contactContent, type ContactContent } from "./contact.config";

/**
 * Contact: an asymmetric opening (heading, live studio status and direct lines on the left,
 * the glass form on the right), then the three studios set large across the width.
 * Server component; the parts animate on the client.
 */
export function ContactPage({ content = contactContent }: { content?: ContactContent }) {
  return (
    <>
      <section
        aria-label="Contact"
        className="relative isolate px-[clamp(1.25rem,5vw,6rem)] pt-[clamp(7rem,17svh,11rem)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_45%_at_78%_45%,rgb(123_97_255/0.14),transparent_70%),radial-gradient(30%_35%_at_12%_85%,rgb(34_216_255/0.06),transparent_70%)]" />
        <div
          className="mx-auto grid items-start gap-x-[clamp(2rem,5vw,6rem)] gap-y-[clamp(3rem,7svh,5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          style={{ maxWidth: "min(100%, 96rem)" }}
        >
          <div className="lg:sticky lg:top-[clamp(6rem,14svh,9rem)]">
            <ContactIntro content={content} />
          </div>
          <ContactForm content={content} />
        </div>
      </section>
      <div className="mx-auto" style={{ maxWidth: "min(100%, 96rem)" }}>
        <Studios content={content.studios} />
      </div>
    </>
  );
}
