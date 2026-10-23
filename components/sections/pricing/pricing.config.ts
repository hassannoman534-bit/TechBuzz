/**
 * Pricing data, copied exactly from techbuzz.com.pk/pricings (all services, packages, add-ons and the
 * bundle discount rules). Prices are in USD, as on the original page.
 */

export type PricingPackage = {
  name: string;
  /** null = custom quote; the range is shown from `desc` */
  price: number | null;
  desc: string;
  feats: string[];
};

export type PricingAddon = { name: string; unit: string; price: number };
export type PricingAddonGroup = { cat: string; items: PricingAddon[] };

export type PricingSub = { label: string; pkgs: PricingPackage[]; addons: PricingAddonGroup[] };

export type ServiceIcon = "smm" | "ads" | "content" | "brand" | "ai" | "seo" | "web" | "yt";

export type PricingService = { id: ServiceIcon; label: string; subs: PricingSub[] };

export type PricingContent = {
  hero: { eyebrow: string; lines: string[]; sub: string };
  /** Bundle discount by the order packages are picked in: 1st 0%, 2nd 20%, 3rd and later 50% */
  discount: { tier1: number; tier2: number };
  services: PricingService[];
};

export const pricingContent: PricingContent = {
  hero: {
    eyebrow: "Pricing",
    lines: ["Clear pricing,", "real results"],
    sub: "Pick a package for each service you need, add extras, and save up to 50% when you bundle services.",
  },
  discount: { tier1: 0.2, tier2: 0.5 },
  services: [
    {
      id: "smm",
      label: "Social Media",
      subs: [
        {
          label: "Packages",
          pkgs: [
            { name: "Basic", price: 499, desc: "Best for startups", feats: ["16 designs/mo", "6 reels", "Scheduling", "Analytics", "Sales funnels", "Paid boosting"] },
            { name: "Standard", price: 899, desc: "Best for growth", feats: ["All in Basic +", "24 designs/mo", "16 reels", "DM management"] },
            { name: "Premium", price: 1999, desc: "Best for scaling", feats: ["All in Standard +", "30 designs/mo", "48 reels", "Community mgmt", "Influencer campaign/mo"] },
          ],
          addons: [
            {
              cat: "",
              items: [
                { name: "More posts", unit: "post", price: 10 },
                { name: "More reels/videos", unit: "video", price: 25 },
                { name: "Influencer campaign", unit: "campaign", price: 300 },
                { name: "Social media audit", unit: "audit", price: 100 },
                { name: "DM automation", unit: "month", price: 150 },
                { name: "AI Avatar", unit: "avatar", price: 100 },
                { name: "Custom AI influencer", unit: "creation", price: 300 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ads",
      label: "Paid Ads",
      subs: [
        {
          label: "Packages",
          pkgs: [
            { name: "Basic", price: 499, desc: "Meta & TikTok only", feats: ["1 campaign/platform", "4 ad creatives", "Ad copywriting", "Campaign optimization", "Analytics & reporting"] },
            { name: "Standard", price: 999, desc: "Meta, TikTok & Google", feats: ["All in Basic +", "2 campaigns/platform", "10 creatives", "A/B testing", "Retargeting", "Conversion tracking"] },
            { name: "Premium", price: 1999, desc: "All 4 platforms incl. LinkedIn", feats: ["All in Standard +", "4 campaigns/platform", "25 creatives", "Full multi-platform mgmt"] },
          ],
          addons: [
            {
              cat: "",
              items: [
                { name: "Extra ad creative", unit: "creative", price: 20 },
                { name: "Landing page design", unit: "page", price: 200 },
                { name: "CRM integration", unit: "integration", price: 300 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "content",
      label: "Content Production",
      subs: [
        {
          label: "Packages",
          pkgs: [
            { name: "Half-Day", price: 799, desc: "3–4 hour shoot", feats: ["Pre-shoot planning", "Professional equipment", "Content direction", "Full production team", "6 edited videos"] },
            { name: "Full-Day", price: 1499, desc: "6–8 hour shoot", feats: ["All in Half-Day +", "Pre-shoot planning", "Professional equipment", "Content direction", "Full production team", "16 edited videos"] },
          ],
          addons: [
            {
              cat: "",
              items: [
                { name: "More short-form videos", unit: "video", price: 25 },
                { name: "Additional shoot hour", unit: "hour", price: 100 },
                { name: "Influencer / Actor", unit: "session", price: 200 },
                { name: "Premium equipment upgrade", unit: "upgrade", price: 150 },
                { name: "Multi-location shoot", unit: "location", price: 300 },
                { name: "Urgent delivery", unit: "project", price: 150 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "brand",
      label: "Branding",
      subs: [
        {
          label: "Packages",
          pkgs: [
            { name: "Basic", price: 399, desc: "3–5 day delivery · 2 revisions", feats: ["2–3 logo concepts", "Color palette", "Typography selection", "Logo variations"] },
            { name: "Standard", price: 999, desc: "5–10 day delivery · 4 revisions", feats: ["All in Basic +", "4–6 logo concepts", "Brand guidelines", "Social media branding kit", "Stationery design"] },
          ],
          addons: [
            {
              cat: "",
              items: [
                { name: "Extra logo concept", unit: "concept", price: 50 },
                { name: "Packaging design", unit: "design", price: 300 },
                { name: "Website branding kit", unit: "kit", price: 200 },
                { name: "Standee design", unit: "design", price: 80 },
                { name: "Billboard design", unit: "design", price: 150 },
                { name: "Flex / Banner design", unit: "design", price: 80 },
                { name: "Menu design", unit: "design", price: 100 },
                { name: "Flyer / Poster design", unit: "design", price: 50 },
                { name: "Brochure design", unit: "design", price: 150 },
                { name: "Signage design", unit: "design", price: 100 },
                { name: "Pitch deck design", unit: "deck", price: 300 },
                { name: "Advanced brand guidelines", unit: "document", price: 300 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ai",
      label: "AI Content",
      subs: [
        {
          label: "Packages",
          pkgs: [
            {
              name: "Starter",
              price: 799,
              desc: "AI-first content creation",
              feats: ["10 AI scripts", "8 AI videos", "2 AI video ads", "10 AI graphic designs", "5 image creatives", "AI voiceover", "AI tools (Sora, Kling, HeyGen…)"],
            },
            { name: "Growth", price: 1999, desc: "Scale with AI at volume", feats: ["All in Starter +", "35 AI scripts", "25 AI videos", "10 AI video ads", "30 AI graphic designs", "10 image creatives"] },
          ],
          addons: [
            {
              cat: "",
              items: [
                { name: "AI Avatar", unit: "avatar", price: 100 },
                { name: "Custom AI influencer creation", unit: "influencer", price: 300 },
                { name: "Short AI animations", unit: "animation", price: 50 },
                { name: "More AI scripts", unit: "script", price: 20 },
                { name: "More AI videos", unit: "video", price: 30 },
                { name: "More AI video ads", unit: "ad", price: 50 },
                { name: "More AI voiceovers", unit: "audio", price: 10 },
                { name: "Advanced DM automation", unit: "month", price: 150 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "seo",
      label: "SEO",
      subs: [
        {
          label: "Packages",
          pkgs: [
            {
              name: "Basic",
              price: 699,
              desc: "Startups · results in 8–12 months",
              feats: ["Technical SEO", "Google Search Console setup", "60 keywords", "4 blogs/mo", "Local SEO", "GA4 + GTM setup", "Monthly reporting"],
            },
            { name: "Standard", price: 1299, desc: "Growth · results in 6–8 months", feats: ["All in Basic +", "250 keywords", "8 blogs/mo", "10 backlinks/mo", "Local SEO included"] },
            { name: "Premium", price: 1999, desc: "Scaling · results in 3–5 months", feats: ["All in Standard +", "600+ keywords", "15 blogs/mo", "25 backlinks/mo"] },
          ],
          addons: [
            {
              cat: "",
              items: [
                { name: "SEO audit", unit: "audit", price: 100 },
                { name: "High authority backlinks", unit: "link", price: 100 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "web",
      label: "Web Development & AI Automation",
      subs: [
        {
          label: "Packages",
          pkgs: [
            {
              name: "Static WordPress",
              price: null,
              desc: "$150–$300+",
              feats: ["WordPress + Elementor", "Template-based custom design", "Basic CMS control", "Basic forms & lead capture", "Best for: portfolios, startups"],
            },
            {
              name: "Dynamic CMS",
              price: null,
              desc: "$350–$700+",
              feats: ["WordPress / Webflow / Shopify", "Semi-custom UI/UX", "API + third-party integrations", "CRM integrations", "Best for: growing businesses"],
            },
            {
              name: "Full Custom Dev",
              price: null,
              desc: "$700–$3,000+",
              feats: ["MERN / Laravel / Next.js", "100% custom UI/UX", "Unlimited integrations", "Custom CRM & admin panel", "Best for: SaaS, enterprise"],
            },
            {
              name: "Automation Systems",
              price: null,
              desc: "$200–$1,000+",
              feats: ["GoHighLevel, Zapier, n8n", "Full pipeline automation", "Deep CRM/Ads/Email/WhatsApp integration", "Best for: agencies, lead gen"],
            },
          ],
          addons: [
            {
              cat: "Expansion",
              items: [
                { name: "Extra page", unit: "page", price: 125 },
                { name: "Blog setup", unit: "setup", price: 150 },
                { name: "Content upload", unit: "project", price: 125 },
                { name: "Multi-language setup", unit: "language", price: 300 },
              ],
            },
            {
              cat: "Performance & SEO",
              items: [
                { name: "Advanced SEO setup", unit: "setup", price: 350 },
                { name: "Monthly SEO", unit: "month", price: 999 },
                { name: "Speed optimization pro", unit: "project", price: 225 },
                { name: "Core Web Vitals optimization", unit: "project", price: 200 },
              ],
            },
            {
              cat: "Automation",
              items: [
                { name: "CRM setup (GHL)", unit: "setup", price: 350 },
                { name: "Lead automation system", unit: "system", price: 550 },
                { name: "Email automation", unit: "system", price: 350 },
                { name: "WhatsApp automation", unit: "system", price: 300 },
                { name: "Zapier / n8n workflows", unit: "workflow", price: 650 },
              ],
            },
            {
              cat: "Conversion & Growth",
              items: [
                { name: "Sales funnel setup", unit: "funnel", price: 650 },
                { name: "A/B testing setup", unit: "project", price: 350 },
                { name: "Heatmap tracking", unit: "project", price: 150 },
              ],
            },
            {
              cat: "Support & Retainers",
              items: [
                { name: "Monthly maintenance", unit: "month", price: 125 },
                { name: "Priority support", unit: "month", price: 100 },
                { name: "Website backup & security", unit: "month", price: 75 },
                { name: "Hosting management", unit: "month", price: 100 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "yt",
      label: "YouTube",
      subs: [
        {
          label: "Full Channel",
          pkgs: [
            {
              name: "Explore",
              price: 1499,
              desc: "12 videos + 24 shorts/month",
              feats: [
                "Dedicated channel manager",
                "Channel audit & setup",
                "Topic research",
                "Script writing",
                "Voice-over production",
                "Video editing (8–10 min)",
                "Thumbnail design",
                "YouTube SEO",
                "Monetization guidance",
              ],
            },
            { name: "Trending", price: 2499, desc: "24 videos + 48 shorts/month", feats: ["All in Explore +", "Community management"] },
            { name: "Viral", price: 4999, desc: "60 videos + 100+ shorts/month", feats: ["All in Trending +", "Analytics & reporting", "AI Avatar production & mgmt"] },
          ],
          addons: [
            {
              cat: "",
              items: [
                { name: "Channel audit & setup", unit: "audit", price: 100 },
                { name: "Extra script", unit: "script", price: 30 },
                { name: "Extra voiceover", unit: "voiceover", price: 20 },
                { name: "Extra video edit", unit: "video", price: 80 },
                { name: "Extra short", unit: "short", price: 20 },
                { name: "Extra thumbnail", unit: "thumbnail", price: 10 },
              ],
            },
          ],
        },
        {
          label: "Long Videos",
          pkgs: [
            {
              name: "Explore",
              price: 150,
              desc: "1 video · 2 revisions · 48hr turnaround",
              feats: ["Up to 8 min video", "Stock footage (unlimited)", "Motion graphics (unlimited)", "Visual effects", "Color correction", "Audio enhancement", "Captions"],
            },
            { name: "Trending", price: 999, desc: "Up to 10 videos · 3 revisions each", feats: ["All in Explore +", "Up to 10 min video length", "Multiple editors support"] },
            { name: "Viral", price: 1699, desc: "Up to 24 videos · 3 revisions each", feats: ["All in Trending +", "Up to 24 videos/month"] },
          ],
          addons: [
            {
              cat: "",
              items: [
                { name: "Script per video", unit: "script", price: 30 },
                { name: "Voiceover", unit: "voiceover", price: 20 },
                { name: "Short-form edit", unit: "short", price: 20 },
                { name: "Thumbnail", unit: "thumbnail", price: 10 },
              ],
            },
          ],
        },
        {
          label: "#Shorts",
          pkgs: [
            {
              name: "Explore",
              price: 25,
              desc: "1 YouTube Short · revisions included",
              feats: ["Dedicated editor", "48hr turnaround", "Stock footage", "Motion graphics", "Color correction", "Audio enhancement", "Captions"],
            },
            { name: "Trending", price: 499, desc: "30 YouTube Shorts/month", feats: ["All in Explore +", "30 shorts/month"] },
            { name: "Viral", price: 899, desc: "60 YouTube Shorts/month", feats: ["All in Explore +", "60 shorts/month"] },
          ],
          addons: [
            {
              cat: "",
              items: [
                { name: "Script per short", unit: "script", price: 30 },
                { name: "Voiceover", unit: "voiceover", price: 20 },
                { name: "Long video edit", unit: "video", price: 80 },
                { name: "Thumbnail", unit: "thumbnail", price: 10 },
              ],
            },
          ],
        },
        {
          label: "Thumbnails",
          pkgs: [
            { name: "Explore", price: 10, desc: "1 thumbnail · 24hr delivery · 2 revisions", feats: ["Dedicated designer", "Real-time communication", "PSD file included"] },
            { name: "Trending", price: 199, desc: "24 thumbnails · 24hr delivery", feats: ["All in Explore +", "PSD files included", "24 thumbnails/month"] },
          ],
          addons: [],
        },
        {
          label: "Scripts",
          pkgs: [
            {
              name: "Explore",
              price: 25,
              desc: "1 script · up to 1,500 words · 2 revisions",
              feats: ["Dedicated script writer", "Multiple writing styles", "24hr turnaround", "Real-time communication"],
            },
            { name: "Trending", price: 499, desc: "24 scripts · up to 1,500 words each", feats: ["All in Explore +", "Multiple writers support", "24 scripts/month"] },
          ],
          addons: [{ cat: "", items: [{ name: "Extra 500 words", unit: "block", price: 15 }] }],
        },
        {
          label: "Voiceovers",
          pkgs: [
            { name: "Explore", price: 15, desc: "1 voiceover · 192kbps · up to 32 languages", feats: ["Sample requests allowed", "24hr turnaround", "Higher quality 192kbps audio"] },
            { name: "Trending", price: 299, desc: "24 voiceovers · 240,000+ chars/month", feats: ["All in Explore +", "24 voiceovers/month", "36,000+ word count/month"] },
          ],
          addons: [{ cat: "", items: [{ name: "Extra 5,000 characters", unit: "block", price: 10 }] }],
        },
      ],
    },
  ],
};

/**
 * Enquiry email. Same EmailJS account, service and template as the current site, so enquiries
 * keep arriving exactly as they do now. These are public browser keys (EmailJS is designed for that);
 * they can be overridden with NEXT_PUBLIC_EMAILJS_* env vars.
 */
export const emailConfig = {
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "DVTEUDhIzO82Ep8LL",
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "service_pz42l1j",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "template_vvawuhr",
};
