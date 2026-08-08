export type ListItem = { title: string; text: string };

export type SplitSection = {
  label: string;
  heading: string;
  sub: string;
  items: ListItem[];
  learnMore?: boolean;
};

export type InnerPageData = {
  slug: string;
  metaTitle: string;
  heroLabel: string;
  heroTitle: string;
  heroSub: string;
  sectionA: SplitSection;
  sectionB: SplitSection;
  processLabel: string;
  processHeading: string;
  processSub: string;
  processSteps: ListItem[];
  ctaText: string;
};

export const INNER_PAGES: Record<string, InnerPageData> = {
  trading: {
    slug: "trading",
    metaTitle: "Trading",
    heroLabel: "AI-ASSISTED TRADING",
    heroTitle: "GLOBAL MARKETS, ONE PLATFORM",
    heroSub:
      "Trade and invest across forex, indices, metals, energies and crypto—with AI analytics, fast execution, and flexible accounts.",
    sectionA: {
      label: "MARKETS",
      heading: "GLOBAL MARKETS, ONE PLATFORM",
      sub: "From major FX to crypto—use professional execution plus AI context to support your ideas.",
      items: [
        {
          title: "1. Forex pairs",
          text: "Major, minor and selected exotics—ideal for strategies you refine with data and AI overlays.",
        },
        {
          title: "2. Indices & energies",
          text: "Express macro views on indices and oil with sizing that matches your risk plan.",
        },
        {
          title: "3. Metals & crypto",
          text: "Hedge or speculate on gold, silver, and leading digital assets from one login.",
        },
      ],
    },
    sectionB: {
      label: "INSTRUMENTS",
      heading: "WHAT YOU CAN TRADE",
      sub: "Diversify with broad market access, transparent pricing, and tools that help you stress-test ideas before you trade.",
      learnMore: true,
      items: [
        {
          title: "1. Responsive routing",
          text: "Infrastructure built for stable, low-latency handling when liquidity shifts.",
        },
        {
          title: "2. Risk controls",
          text: "Stops, limits, and position sizing—pair with AI context, not hype.",
        },
        {
          title: "3. Any device",
          text: "MT4/MT5 and web access—monitor markets and act when signals align with your plan.",
        },
      ],
    },
    processLabel: "EXECUTION",
    processHeading: "BUILT FOR ACTIVE TRADERS",
    processSub:
      "Built for active traders who want speed, clarity, and intelligent tooling in the loop.",
    processSteps: [
      {
        title: "01. PLAN",
        text: "Define clear goals and align each action with measurable outcomes.",
      },
      {
        title: "02. EXECUTE",
        text: "Deploy size, entries, and exits with discipline—use AI signals as one input among many.",
      },
      {
        title: "03. REVIEW",
        text: "Analyze results, refine strategy, and iterate for better long-term growth.",
      },
    ],
    ctaText: "Build your trading plan and move from analysis to execution with confidence.",
  },

  resources: {
    slug: "resources",
    metaTitle: "Resources",
    heroLabel: "RESOURCES",
    heroTitle: "LEARN WITH AI CONTEXT",
    heroSub:
      "Education, macro data, and AI-assisted explainers—so you understand the “why” behind each market move.",
    sectionA: {
      label: "RESOURCES",
      heading: "LEARN WITH AI CONTEXT",
      sub: "Structured lessons plus smart summaries—turn complexity into actionable knowledge.",
      items: [
        {
          title: "1. Beginner Guides",
          text: "Understand market basics, order types and trading terminology.",
        },
        {
          title: "2. Strategy fundamentals",
          text: "Frameworks for entries, exits, and risk—with examples you can compare to AI-generated scenarios.",
        },
        {
          title: "3. Practical Checklists",
          text: "Use repeatable pre-trade and post-trade routines.",
        },
      ],
    },
    sectionB: {
      label: "EDUCATION",
      heading: "LEARNING PATHS FOR EVERY LEVEL",
      sub: "Structured material to help beginners start and experienced traders refine their process.",
      learnMore: true,
      items: [
        {
          title: "1. Economic Events",
          text: "Track market-moving events and prepare ahead of volatility.",
        },
        {
          title: "2. Signal ideas",
          text: "See how algorithmic and AI signals stack up against your manual read of the chart.",
        },
        {
          title: "3. Planning Support",
          text: "Use structured workflows to improve consistency over time.",
        },
      ],
    },
    processLabel: "TOOLS",
    processHeading: "TOOLS THAT SUPPORT DECISIONS",
    processSub:
      "Get context faster with research and market utilities built for active analysis.",
    processSteps: [
      {
        title: "01. PLAN",
        text: "Define clear goals and align each action with measurable outcomes.",
      },
      {
        title: "02. EXECUTE",
        text: "Use tools and workflows consistently to improve performance over time.",
      },
      {
        title: "03. REVIEW",
        text: "Analyze results, refine strategy, and iterate for better long-term growth.",
      },
    ],
    ctaText: "Turn learning into action with resources you can apply to every trading session.",
  },

  partnership: {
    slug: "partnership",
    metaTitle: "Partnership",
    heroLabel: "PARTNERSHIP",
    heroTitle: "PARTNER ON AN AI PLATFORM",
    heroSub:
      "Introduce audiences to AI-enhanced trading and investing—earn competitive rewards as they engage with the product.",
    sectionA: {
      label: "PARTNERSHIP",
      heading: "PARTNER ON AN AI PLATFORM",
      sub: "Differentiate with a modern story: smarter analytics, education, and execution in one place.",
      items: [
        {
          title: "1. Introducing Broker",
          text: "Build recurring revenue from referred active clients.",
        },
        {
          title: "2. Content partnerships",
          text: "Co-create webinars, guides, and AI-demo experiences that convert curious visitors into active users.",
        },
        {
          title: "3. Regional Expansion",
          text: "Develop market-specific acquisition and retention channels.",
        },
      ],
    },
    sectionB: {
      label: "PROGRAMS",
      heading: "PARTNERSHIP MODELS THAT SCALE",
      sub: "Choose the structure that best fits your audience, content and growth goals.",
      learnMore: true,
      items: [
        {
          title: "1. Performance Tracking",
          text: "Monitor client activity and key conversion milestones.",
        },
        {
          title: "2. Marketing Assets",
          text: "Use ready-to-deploy creatives and campaign materials.",
        },
        {
          title: "3. Dedicated Guidance",
          text: "Coordinate with support teams to optimize growth plans.",
        },
      ],
    },
    processLabel: "SUPPORT",
    processHeading: "TOOLS FOR PARTNER SUCCESS",
    processSub:
      "Everything needed to launch, measure and improve partner performance.",
    processSteps: [
      {
        title: "01. PLAN",
        text: "Define clear goals and align each action with measurable outcomes.",
      },
      {
        title: "02. EXECUTE",
        text: "Use tools and workflows consistently to improve performance over time.",
      },
      {
        title: "03. REVIEW",
        text: "Analyze results, refine strategy, and iterate for better long-term growth.",
      },
    ],
    ctaText: "Start building a scalable partner channel with structured support from day one.",
  },

  "about-us": {
    slug: "about-us",
    metaTitle: "About Us",
    heroLabel: "ABOUT US",
    heroTitle: "AI-FIRST TRADING & INVESTING",
    heroSub:
      "We combine transparent market access, intelligent analytics, and human support—so you can trade and invest with a clearer picture of risk and opportunity.",
    sectionA: {
      label: "ABOUT US",
      heading: "WHO WE ARE",
      sub: "An AI-powered platform built for traders and investors who want professional tools without the noise.",
      items: [
        {
          title: "1. Client-first design",
          text: "Interfaces and flows built for clarity—whether you’re automating or trading by hand.",
        },
        {
          title: "2. Transparent by default",
          text: "Straightforward conditions and honest messaging—especially where leverage and risk are involved.",
        },
        {
          title: "3. Long-term partnerships",
          text: "We invest in education, tooling, and uptime—not short-term hype cycles.",
        },
      ],
    },
    sectionB: {
      label: "MISSION",
      heading: "WHAT DRIVES US",
      sub: "We ship features that help you measure, learn, and improve—powered by data and responsible AI.",
      learnMore: true,
      items: [
        {
          title: "1. Service Reliability",
          text: "Maintain stable access across platform and support channels.",
        },
        {
          title: "2. Continuous improvement",
          text: "Models, dashboards, and workflows evolve from real client feedback and market changes.",
        },
        {
          title: "3. Global Mindset",
          text: "Support diverse trading audiences across regions and experience levels.",
        },
      ],
    },
    processLabel: "STANDARDS",
    processHeading: "HOW WE OPERATE",
    processSub:
      "Operational standards centered on accountability and continuous improvement.",
    processSteps: [
      {
        title: "01. PLAN",
        text: "Define clear goals and align each action with measurable outcomes.",
      },
      {
        title: "02. EXECUTE",
        text: "Use tools and workflows consistently to improve performance over time.",
      },
      {
        title: "03. REVIEW",
        text: "Analyze results, refine strategy, and iterate for better long-term growth.",
      },
    ],
    ctaText: "Learn more about our team, vision and commitment to trader success.",
  },
};
