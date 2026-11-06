import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { loadTeam } from "./team-library";
import { teamContent, type TeamShowcaseContent } from "./team-showcase.config";
import { TeamStage } from "./team-stage";

type TeamShowcaseProps = { content?: TeamShowcaseContent; className?: string };

/**
 * Our Team showcase. Server component: pairs the roster with the photos in
 * /public/assets/team at build time, then hands plain data to the animated stage.
 */
export function TeamShowcase({ content = teamContent, className }: TeamShowcaseProps) {
  const members = loadTeam(content);
  if (!members.length) return null;

  return (
    <div className={cn(montserrat.variable, "relative bg-[#030712]", className)}>
      <TeamStage members={members} eyebrow={content.eyebrow} hint={content.hint} roleCue={content.roleCue} />
    </div>
  );
}
