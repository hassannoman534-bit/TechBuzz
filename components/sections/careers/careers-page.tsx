import { PageHero } from "@/components/sections/page-hero/page-hero";
import { OpenRoles } from "./open-roles";
import { CareersGrowth } from "./careers-growth";
import { CareersCulture } from "./careers-culture";
import { careersContent, type CareersContent } from "./careers.config";

type CareersPageProps = { content?: CareersContent };

/** Careers page body: hero, open roles (hover list), growth and perks, culture values. */
export function CareersPage({ content = careersContent }: CareersPageProps) {
  return (
    <>
      <PageHero content={content.hero} />
      <OpenRoles content={content.roles} />
      <CareersGrowth content={content.growth} />
      <CareersCulture content={content.culture} />
    </>
  );
}
