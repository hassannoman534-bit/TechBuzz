import { FrostedFolder } from "@/components/ui/frosted-folder";
import type { CaseStudy } from "./case-studies.config";

type CaseFileProps = {
  study: CaseStudy;
};

/**
 * The deliverables, as a document folder you open. The folder is the section: a small heading,
 * then the stage. Everything physical about it lives in FrostedFolder; this only supplies copy.
 */
export function CaseFile({ study }: CaseFileProps) {
  return (
    <section className="relative bg-[#030712] pt-[clamp(3rem,8vh,5.5rem)]">
      <div className="mx-auto max-w-[min(100%,78rem)] px-[clamp(1.25rem,6vw,8rem)]">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/45">Deliverables</p>
        {/* the family goes on an inner span: the unlayered h1-h6 Syne rule in globals.css beats a
            utility class on the heading itself */}
        <h2 className="mt-[clamp(0.75rem,2vh,1.25rem)] text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-white">
          <span className="font-footer-display">What is in the file</span>
        </h2>
        <p className="mt-[clamp(0.5rem,1.5vh,0.9rem)] max-w-[46ch] text-[clamp(0.95rem,1.1vw,1.1rem)] leading-[1.5] text-white/55">
          {study.sheets.length === 1 ? "One piece" : `${study.sheets.length} pieces`} of the work, in the folder it
          was handed over in. Open it.
        </p>
      </div>

      <FrostedFolder
        title={study.file.title}
        subtitle={study.file.subtitle}
        line={study.file.line}
        footer="Handle with care"
        wordmark="TechBuzz"
        sheets={study.sheets}
        tint={study.tint}
        background="#030712"
        headroom={24}
        openLabel="Open file"
        closeLabel="Close file"
        className="mt-[clamp(0.5rem,2vh,1.5rem)]"
      />
    </section>
  );
}
