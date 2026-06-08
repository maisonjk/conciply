import type { GrowthReport } from "./types";

export const DEMO_INPUT = "MailBloom — email marketing automation for Shopify stores";

export const DEMO_REPORT: GrowthReport = {
  executiveSummary: {
    icp: "Shopify store owners doing $10k–$500k/month in revenue who are stuck on Klaviyo's $400+/mo price or Mailchimp's clunky e-commerce integrations. Typically 1–3 person teams, no dedicated email marketer.",
    uvp: "MailBloom connects to Shopify in 60 seconds and ships revenue-generating flows in minutes — not days. 80% of Klaviyo's power at 30% of the price, built specifically for stores under $1M ARR.",
    topOpportunity: "There are 4.4M Shopify stores globally. Only ~15% use a dedicated email tool. The other 85% are leaving significant revenue on the table — that's your TAM with almost no incumbent lock-in.",
    assumptions: [
      "Store owners prioritise speed-to-value over feature depth — they want flows live before the weekend",
      "Price is the primary churn reason from Klaviyo — not missing features",
      "Shopify App Store discovery is the dominant acquisition channel (60%+ of installs come from it)",
      "A free trial with a real revenue-attribution dashboard will be the strongest conversion lever",
    ],
  },

  marketAnalysis: {
    tam: "$6.2B — global email marketing software market (2024), growing 13% YoY driven by e-commerce expansion and privacy changes reducing paid social ROI",
    sam: "$1.1B — SMB Shopify merchants needing dedicated email automation; ~650k stores in the $10k–$1M/mo revenue band",
    som: "$22M ARR — realistic 3-year target capturing 2% of SAM through Shopify App Store + content + partner channels",
    trends: [
      "iOS privacy changes destroyed Meta ROAS for small merchants — email is the new primary retention channel",
      "AI-generated email copy is becoming table-stakes; stores expect copy suggestions built-in",
      "SMS + email bundling is the fastest-growing upsell in the space (Klaviyo, Postscript both moving here)",
      "Zero-party data collection (quizzes, preferences) is replacing third-party cookie targeting",
      "Shopify's own 'Shopify Email' is free but deeply limited — it creates awareness of email marketing without satisfying power users",
    ],
  },

  competitorAnalysis: {
    competitors: [
      {
        name: "Klaviyo",
        strength: "Deep Shopify integration, industry-standard flows, massive template library, strong brand recognition among 6-figure stores",
        weakness: "Pricing scales steeply with list size — $400/mo at 10k contacts. Overwhelming for new store owners. Complex UI with a steep learning curve.",
      },
      {
        name: "Mailchimp",
        strength: "Brand recognition, generous free tier, non-technical UX, huge ecosystem of integrations",
        weakness: "E-commerce features feel bolted-on. Poor Shopify sync. Revenue attribution is weak. Not built for abandoned cart or post-purchase flows.",
      },
      {
        name: "Omnisend",
        strength: "Good omnichannel (email + SMS + push) at a mid-market price. Strong automation builder.",
        weakness: "SMS pricing is confusing. Template designs feel dated. Support quality drops at scale.",
      },
    ],
    gaps: [
      "No tool offers a genuinely simple setup that goes from install to first revenue-generating flow in under 10 minutes",
      "Transparent, predictable pricing that doesn't punish list growth is missing from every major player",
      "Built-in AI copy suggestions trained on e-commerce conversion data — nobody has this natively yet",
      "Real-time revenue attribution dashboard that non-marketers can actually understand",
    ],
    advantages: [
      "Shopify-native architecture means faster sync, fewer errors, and instant product blocks in emails",
      "Pricing model capped by revenue tier (not contact count) aligns incentives with merchant success",
      "Onboarding wizard that auto-generates the top 5 revenue flows based on store data",
      "Speed advantage: first flow live in under 5 minutes vs. 45+ minutes on Klaviyo",
    ],
  },

  positioning: {
    uvp: "MailBloom is the email platform that pays for itself — built exclusively for Shopify stores that want Klaviyo-level results without Klaviyo-level complexity or cost.",
    messaging: "Lead with revenue, not features. Every headline should reference money recovered or revenue generated. 'Your abandoned cart emails are leaving $2,300/month on the table' beats 'Powerful email automation'.",
    brandNarrative: "MailBloom exists because great email marketing shouldn't require a full-time specialist or a four-figure monthly bill. It's the unfair advantage for the solo founder who ships their own products, runs their own ads, and now wants their email to work as hard as they do.",
  },

  growthOpportunities: {
    organic: [
      "Shopify App Store SEO — optimise listing title, screenshots, and review velocity for 'email marketing', 'abandoned cart', and 'Klaviyo alternative' keywords",
      "Content hub targeting 'email marketing for Shopify' long-tail (15k+ monthly searches, low competition vs. Klaviyo's domain authority focus)",
      "YouTube tutorials: '5 Shopify email flows that generate 30% of store revenue' — high-intent audience, compounding views",
      "Product Hunt launch + AppSumo deal to seed reviews and social proof in year one",
    ],
    paid: [
      "Google Search: bid on 'klaviyo alternative', 'shopify email marketing', 'omnisend vs klaviyo' — high intent, CPCs of $4–$8",
      "Shopify App Store ads — direct placement at top of email marketing category, CPI model",
      "YouTube pre-roll targeting Shopify store owner channels (My First Million, Shopify Masters audience)",
    ],
    plg: [
      "Free tier: up to 500 contacts + 3 automations — enough to see revenue before paying",
      "Revenue attribution dashboard visible on free tier creates 'wow moment' and upgrade pressure",
      "In-app referral: 1 free month for every referred store that upgrades — merchants trust other merchants",
    ],
    viral: [
      "'Powered by MailBloom' footer badge with opt-out for paid tiers — every email sent is an impression",
      "Public revenue dashboard sharing: merchants can share 'MailBloom generated $X this month' to social",
      "Partner with Shopify theme developers to bundle 3-month trials with premium theme purchases",
    ],
  },

  acquisitionPlan: {
    channels: [
      { name: "Shopify App Store", priority: "high", rationale: "60% of installs for category leaders come from App Store search. Optimising listing + review velocity is the highest-leverage early investment." },
      { name: "Content / SEO", priority: "high", rationale: "'Klaviyo alternative' and 'email marketing for Shopify' keywords drive 25k+ searches/month with buyers 3–7x more likely to convert than broad traffic." },
      { name: "YouTube", priority: "medium", rationale: "Tutorial content compounds over 18+ months and drives installs from high-intent searchers. 3 videos/month at $0 ad spend can generate 200+ organic installs/month by month 6." },
      { name: "Paid Search (Google)", priority: "medium", rationale: "Competitor-comparison keywords convert at 8–12%. Budget $3k/month after month 3 once unit economics are proven." },
      { name: "Partner / Affiliate", priority: "low", rationale: "Shopify agency partners send 5–20 stores each. Build partner program in month 4 after core product is stable." },
    ],
    tactics: [
      "Week 1: Submit App Store listing with 8 screenshots, a demo video, and optimised keyword title",
      "Week 2–4: Launch 'MailBloom vs Klaviyo' comparison landing page targeting transactional keyword",
      "Month 2: Produce 3 YouTube tutorials targeting top Shopify email search queries",
      "Month 3: Activate Google Search campaign on competitor keywords with $3k/month budget",
      "Month 4: Launch affiliate program with 20% recurring commission for Shopify partners/agencies",
    ],
    budgetGuidance: "Months 1–3: $0–$2k/month (App Store + content only). Months 4–6: $3k–$5k/month (add paid search). Scale paid only after CAC:LTV is above 3:1. Target CAC under $80 to maintain healthy unit economics at $49–$149/month ACV.",
  },

  funnelImprovements: {
    awareness: [
      "App Store listing: Add 'As seen by 10,000+ Shopify stores' social proof as soon as you hit that milestone",
      "Homepage hero: Lead with a revenue number ('Recover $2,300/month in abandoned carts') not a feature list",
      "Add comparison pages: /vs-klaviyo, /vs-mailchimp, /vs-omnisend — these rank fast and convert at 2x the homepage rate",
    ],
    activation: [
      "Onboarding wizard: Connect Shopify → auto-detect top 3 revenue opportunities → suggest pre-built flows → one click to activate",
      "Show the revenue attribution dashboard within 60 seconds of install, even if empty, so users understand the value they're unlocking",
      "Send a 'your first flow is live' email with estimated revenue impact within 5 minutes of activation",
    ],
    retention: [
      "Weekly revenue email: 'MailBloom generated $X for your store this week' — makes the ROI undeniable",
      "In-app flow health score: flag under-performing sequences and offer one-click fixes",
      "Quarterly business review (QBR) email for paid plans: store growth stats + 3 recommendations for next 90 days",
    ],
    referral: [
      "Referral program: Give 1 free month per referred store that upgrades — email the referral link after first flow generates $100+",
      "Merchant success stories: feature case studies prominently in App Store listing and homepage — social proof drives installs",
      "App Store review prompt: trigger after user's flow generates its first $50 in attributed revenue (high satisfaction moment)",
    ],
  },

  marketingAssets: {
    landingCopy: "HEADLINE: Stop leaving $2,300/month in your Shopify abandoned carts.\nSUBHEAD: MailBloom connects to your store in 60 seconds and sends your first revenue-generating email flow in under 5 minutes. No developer. No agency. No Klaviyo invoice shock.\nSOCIAL PROOF: Trusted by 4,200+ Shopify stores generating $12M+ in attributed monthly revenue.\nCTA: Start free — see your revenue in 60 seconds →",
    adCopy: [
      "Klaviyo charges $400/mo. MailBloom starts at $29. Same abandoned cart recovery. Zero complexity. [Try free]",
      "Your Shopify store loses $47 every hour you're not running email automations. Fix that in 5 minutes. [Start free]",
      "The email tool 4,200 Shopify stores switched to after outgrowing Mailchimp. See why → [Free trial]",
      "Set up your welcome series, abandoned cart, and post-purchase flows before lunch. MailBloom for Shopify. [Install free]",
    ],
    emailSequence: [
      {
        subject: "Your store is ready — here's what to do first",
        body: "Hey [Name], MailBloom is connected to your store. Right now, your top 3 revenue opportunities are: (1) Abandoned cart recovery — the average store recovers $2,300/month with a 3-email sequence. (2) Welcome series — new subscribers convert 4x better with a 5-day nurture. (3) Post-purchase upsell — 22% of customers buy again within 30 days if you ask. Let's activate your first flow — takes 2 minutes.",
        cta: "Activate my abandoned cart flow →",
      },
      {
        subject: "Your first flow is live. Here's what happens next.",
        body: "Your abandoned cart sequence is now running. Based on your store's traffic, we estimate it will recover $800–$2,400 this month. You'll see every dollar in your revenue dashboard. Next up: your welcome series converts 4x more subscribers into first-time buyers. It takes 3 minutes to activate and we've pre-written all 5 emails for you.",
        cta: "Activate welcome series →",
      },
      {
        subject: "MailBloom recovered $[X] for your store this week",
        body: "Here's your week in email: [Revenue recovered] from abandoned cart flows. [New subscribers] joined your list. [Top performing subject line]. Your flows are running 24/7 while you focus on everything else. One thing that could double your recovery rate: add a 10% discount in email #2 of your cart sequence. Stores that do this see 2x the recovery rate. Want me to add it?",
        cta: "Add discount to cart sequence →",
      },
    ],
  },

  salesAssets: {
    outreachScript: "Subject: Quick question about your Shopify email setup\n\nHey [Name],\n\nI noticed [Store Name] is running on Shopify — congrats on the store, [specific compliment if possible].\n\nQuick question: are you currently recovering abandoned carts via email? The average store our size leaves $2k+/month on the table without it.\n\nWe built MailBloom specifically for Shopify stores — takes 60 seconds to connect, and your first flow goes live in under 5 minutes. No Klaviyo invoice shock.\n\nWorth a 15-minute look? I can show you exactly what your store would recover.\n\n[Name]",
    discoveryQuestions: [
      "What email tool are you currently using, and what's your biggest frustration with it?",
      "How many abandoned carts are you getting per week, and are you currently recovering any of them?",
      "What does your current email setup cost per month, and do you feel like you're getting ROI from it?",
      "If you could have one thing working perfectly in your email marketing by end of month, what would it be?",
      "Who else on your team would need to be involved in switching email platforms?",
    ],
    objections: [
      {
        objection: "We're already on Klaviyo and switching feels like too much work.",
        response: "Totally understand — migration anxiety is real. MailBloom imports your Klaviyo segments, flows, and templates in one click. Most stores are fully migrated in under an hour, and you keep your historical data. Plus you'll save $200–$400/month on day one.",
      },
      {
        objection: "Our current tool is free / cheap enough.",
        response: "Free tools are great for getting started. The question is: how much revenue are you leaving on the table without proper abandoned cart recovery and post-purchase sequences? If your store does $30k/month and you're not running these flows, you're likely missing $3–6k/month. MailBloom pays for itself 10x over.",
      },
      {
        objection: "We don't have time to set this up right now.",
        response: "That's exactly why we built the onboarding wizard. Connect your store, answer 3 questions, and your top 3 flows are live — all in under 10 minutes. We pre-write every email. You just review and activate.",
      },
    ],
  },

  retentionStrategy: {
    onboarding: [
      "Day 0 (Install): Auto-detect store data and present 'Your Top 3 Revenue Opportunities' — make the value concrete before they've done anything",
      "Day 0 (5 min): Guide user through activating their first flow (abandoned cart) with pre-written emails — time to value under 10 minutes",
      "Day 1: Send 'Your first flow is live' email with expected monthly recovery estimate",
      "Day 7: 'First week report' email — show actual revenue attributed, compare to estimate",
      "Day 14: Prompt to activate second flow (welcome series) — in-app notification + email",
    ],
    engagementLoops: [
      "Weekly revenue digest email — 'MailBloom generated $X for your store this week' keeps the ROI front of mind",
      "Flow health alerts — 'Your abandoned cart open rate dropped 12% — here's a subject line to test'",
      "In-app achievement system — 'You've recovered $1,000 with MailBloom' milestone notifications drive sharing",
      "Monthly benchmarks — 'Your open rate is 18% vs. 24% industry average — here's how to close the gap'",
    ],
    upsells: [
      "SMS add-on: prompt when abandoned cart flow hits $1,000 recovered — 'Add SMS to this flow and recover 40% more'",
      "Upgrade to Pro when contact list hits 80% of plan limit — show revenue projection at next tier",
      "Agency plan prompt when user creates their second Shopify store connection",
    ],
  },

  socialMediaStrategy: {
    platforms: [
      {
        platform: "LinkedIn",
        handle: "@mailbloom",
        contentTypes: ["Founder journey posts", "Revenue case studies", "E-commerce growth tips", "Behind-the-scenes product builds"],
        postingFrequency: "4x per week",
        bestTimes: "Tue–Thu, 8–9am or 5–6pm local",
        contentPillars: ["Shopify store growth", "Email marketing ROI", "Bootstrapped founder stories", "Product updates"],
        postIdeas: [
          "We analysed 500 Shopify abandoned cart sequences. The stores recovering the most do these 3 things differently.",
          "'Switched from Klaviyo to MailBloom and saved $340/month. Here's what I didn't expect.' — sharing a customer story.",
          "The 5 email flows every Shopify store should have running before they spend $1 on ads.",
          "How a $200/month email budget generated $22,000 in revenue last quarter for a skincare brand.",
        ],
        hooks: [
          "I checked 500 Shopify stores that were leaving money on the table. Here's what they had in common.",
          "The email that makes $2,300 per month while you sleep — and 85% of Shopify stores aren't sending it.",
          "We built MailBloom after our own Shopify store got a $600 Klaviyo invoice on $2,000 in revenue. Here's what we learned.",
        ],
      },
      {
        platform: "Twitter / X",
        handle: "@mailbloom",
        contentTypes: ["Quick tips", "Product launches", "Founder observations", "Thread breakdowns"],
        postingFrequency: "Daily",
        bestTimes: "7–9am and 6–8pm EST",
        contentPillars: ["Shopify growth hacks", "Email ROI data points", "Building in public", "Founder mindset"],
        postIdeas: [
          "Quick thread: The 5 email automations every Shopify store should run before running a single paid ad 🧵",
          "Hot take: 90% of Shopify stores would double their email revenue just by adding a 10% discount to email #2 of their cart sequence.",
          "We hit 1,000 stores on MailBloom today. Here's what we learned about why merchants switch from Klaviyo.",
        ],
        hooks: [
          "Most Shopify stores spend $500/month on ads and $0 on email. Here's why that's backwards.",
          "Email generates $42 for every $1 spent. Here are the 3 flows doing 80% of the work.",
          "I reviewed 100 Shopify welcome emails. Only 11% did this one thing that 3x conversion rates.",
        ],
      },
    ],
    contentCalendar: [
      { week: 1, theme: "Awareness — 'You're leaving money on the table'", posts: ["Stat post: '85% of Shopify stores have no email automation'", "Case study teaser: store recovered $4,200 in month 1", "Product tip: How to set up abandoned cart in 5 minutes"] },
      { week: 2, theme: "Authority — Email marketing education", posts: ["Thread: 5 flows every Shopify store needs", "Comparison: MailBloom vs Klaviyo pricing breakdown", "Founder story: Why we built MailBloom"] },
      { week: 3, theme: "Social Proof — Customer wins", posts: ["Customer spotlight: $22k attributed revenue in 90 days", "Review highlight: 'Switched from Mailchimp, never looking back'", "Before/after: store revenue with and without flows"] },
      { week: 4, theme: "Conversion — Direct offer", posts: ["Free trial CTA with revenue guarantee framing", "Limited-time onboarding call offer for new installs", "FAQ post: 'But we're already on Klaviyo…'"] },
    ],
    hashtagStrategy: "Primary: #ShopifyMarketing #EmailMarketing #EcommerceGrowth. Secondary: #Shopify #ShopifyStore #EmailAutomation #EcommerceTips. Use 3–5 hashtags on LinkedIn (more hurts reach), 1–2 on Twitter. Create owned hashtag #MailBloomWin for customer success stories.",
    viralFormulas: [
      "[Surprising stat] + [Counterintuitive insight] + [Actionable tip] — 'Most Shopify stores spend 10x more on ads than email. Email ROI is 42:1. Here's the 3-flow setup that changes that.'",
      "[Before/After revenue story] + [What changed] + [CTA] — works especially well as a LinkedIn carousel",
      "[I analysed X examples] + [Here's what I found] + [Numbered list] — thread format, high shareability",
      "[Hot take or contrarian view] + [Data to back it] — 'You shouldn't run ads until these 3 email flows are live'",
    ],
  },

  kpiDashboard: {
    metrics: [
      { metric: "Monthly Recurring Revenue (MRR)", target: "$15k by month 6", frequency: "daily" },
      { metric: "New installs / month", target: "200 by month 3", frequency: "daily" },
      { metric: "Trial-to-paid conversion rate", target: "≥ 25%", frequency: "weekly" },
      { metric: "Monthly churn rate", target: "< 4%", frequency: "weekly" },
      { metric: "Average Revenue Per User (ARPU)", target: "$72/month", frequency: "monthly" },
      { metric: "App Store rating", target: "≥ 4.7 stars", frequency: "weekly" },
      { metric: "Time to first flow live (onboarding)", target: "< 8 minutes", frequency: "weekly" },
      { metric: "Customer Acquisition Cost (CAC)", target: "< $80", frequency: "monthly" },
    ],
    targets: [
      "Month 3: 500 installs, 125 paying customers, $9k MRR",
      "Month 6: 1,200 installs, 300 paying customers, $22k MRR",
      "Month 12: 3,500 installs, 875 paying customers, $63k MRR",
      "Net Revenue Retention above 105% by month 9 (expansion revenue from SMS add-on)",
      "App Store rating ≥ 4.7 stars with 50+ reviews before scaling paid acquisition",
    ],
    warnings: [
      "If trial-to-paid conversion drops below 20%, freeze acquisition spend and fix onboarding first",
      "If monthly churn exceeds 6%, hold all growth initiatives and run customer exit interviews",
      "If App Store rating falls below 4.5, respond to every review and address top complaint within 2 weeks",
      "If CAC rises above $120, pause Google Search and audit landing page conversion rate",
    ],
  },

  topRoiActions: {
    actions: [
      { title: "Optimise Shopify App Store listing", description: "Update title to include 'abandoned cart' + 'Klaviyo alternative', add demo video, get 10 initial reviews from beta users. This is the single highest-leverage action — 60% of installs come from App Store search.", impact: 9, speed: 9, difficulty: 3, score: 27 },
      { title: "Build 'vs Klaviyo' comparison page", description: "A dedicated landing page targeting 'MailBloom vs Klaviyo' and 'Klaviyo alternative for Shopify' converts at 3x the homepage rate. Write it this week, it'll rank in 30 days.", impact: 8, speed: 8, difficulty: 2, score: 32 },
      { title: "Activate in-app revenue attribution dashboard", description: "Merchants need to see dollars — not opens or clicks. A revenue dashboard on the free tier creates the 'wow moment' that drives upgrades. This is your primary conversion lever.", impact: 9, speed: 7, difficulty: 5, score: 12.6 },
      { title: "Launch 3-email abandoned cart sequence template", description: "Pre-built, pre-written template that activates in one click. Remove all friction from the most valuable flow. Every day this isn't ready, you're losing installs to Klaviyo.", impact: 8, speed: 8, difficulty: 3, score: 21.3 },
      { title: "Set up weekly revenue digest email", description: "'MailBloom generated $X for your store this week' — sent every Monday. This single email reduces churn by making the ROI visible and undeniable. Build it before you have 100 users.", impact: 7, speed: 9, difficulty: 2, score: 31.5 },
    ],
  },

  plan7Day: {
    days: [
      { day: 1, tasks: ["Audit App Store listing — rewrite title to include 'abandoned cart' and 'Klaviyo alternative'", "Add 8 high-quality screenshots showing revenue dashboard", "Submit updated listing for review"] },
      { day: 2, tasks: ["Write 'MailBloom vs Klaviyo' comparison page (800 words, price table, feature comparison)", "Publish to /vs-klaviyo — submit to Google Search Console"] },
      { day: 3, tasks: ["Build one-click 'Abandoned Cart Starter Pack' — 3 pre-written emails, ready to activate in 60 seconds", "Test end-to-end on a staging Shopify store"] },
      { day: 4, tasks: ["Set up weekly revenue digest email automation (Mondays, 9am, personalised with store's weekly attributed revenue)", "Test with 5 internal accounts"] },
      { day: 5, tasks: ["Email 20 beta users asking for App Store reviews — include direct review link", "Respond to all existing reviews (positive and negative) within 4 hours"] },
      { day: 6, tasks: ["Record 5-minute YouTube tutorial: 'Set up abandoned cart recovery in under 5 minutes — MailBloom for Shopify'", "Upload with keyword-optimised title and description"] },
      { day: 7, tasks: ["Review week's install and conversion data", "Identify single biggest drop-off point in onboarding funnel", "Write Loom walkthrough of the fix you'll ship next week"] },
    ],
  },

  plan30Day: {
    weeks: [
      { week: 1, focus: "App Store & quick wins", tasks: ["Rewrite App Store listing with keyword-optimised title and new screenshots", "Ship one-click Abandoned Cart Starter Pack", "Publish vs-Klaviyo comparison page", "Get 10 reviews from beta users"] },
      { week: 2, focus: "Content engine launch", tasks: ["Publish 3 YouTube tutorials targeting top email-for-Shopify search queries", "Write 2 blog posts targeting long-tail keywords", "Set up LinkedIn and Twitter posting schedule", "Launch weekly revenue digest email for all active users"] },
      { week: 3, focus: "Onboarding conversion", tasks: ["A/B test two onboarding wizard flows — measure time-to-first-flow-live", "Add revenue projection to empty dashboard state ('Set up abandoned cart to recover est. $2,100/month')", "Ship in-app prompt: 'Activate welcome series — 4x your subscriber conversion'"] },
      { week: 4, focus: "Referral & social proof", tasks: ["Launch referral program: 1 month free per referred store that upgrades", "Feature 3 customer case studies on homepage and App Store listing", "Set up App Store review prompt trigger (fires when flow generates first $50 in revenue)"] },
    ],
  },

  plan90Day: {
    months: [
      { month: 1, theme: "Foundation & First Revenue", milestones: ["App Store listing fully optimised, 4.7+ star rating, 25 reviews", "300 trial installs, 75 paying customers", "$5,400 MRR", "Core flows (abandoned cart, welcome series, post-purchase) available as one-click templates", "Weekly revenue digest email live for all users"] },
      { month: 2, theme: "Distribution & Growth Engine", milestones: ["YouTube channel hits 500 subscribers, 3 tutorials with 1,000+ views each", "vs-Klaviyo page ranking page 2 for target keyword", "$12k MRR, 175 paying customers", "Referral program generating 20+ installs per month", "Google Search campaign live with $3k/month budget, CAC under $80"] },
      { month: 3, theme: "Expansion & Retention", milestones: ["SMS add-on launched and generating $2k+ in expansion MRR", "Net Revenue Retention above 100%", "$22k MRR, 300 paying customers", "Shopify agency partner program with 5 active partners", "App Store featuring secured — reach out to Shopify Partner team"] },
    ],
  },

  immediateActions: {
    next24h: [
      "Open your Shopify App Store listing and rewrite the title to include 'abandoned cart recovery' and 'Klaviyo alternative' — this is the single highest-ROI action you can take today",
      "Email your top 5 most-engaged beta users and ask them to leave an App Store review — include the direct review link to reduce friction",
      "Create a /vs-klaviyo page on your website with a simple comparison table — you can have a draft live by end of day",
      "Set up Google Search Console for your domain if you haven't — you'll need it to track the comparison page ranking",
    ],
    next72h: [
      "Record a 5-minute Loom showing the complete MailBloom setup flow — App Store install to first flow live. Use it for onboarding emails and sales outreach.",
      "Build the one-click 'Abandoned Cart Starter Pack' with 3 pre-written emails — remove all friction from your most valuable flow",
      "Write and schedule 5 LinkedIn posts for the coming week (use the content pillars above as your framework)",
      "Set up the weekly revenue digest email — 'MailBloom generated $X for your store this week' — this single email will cut your churn significantly",
      "Identify your three highest-potential early customers and offer them a 30-minute 1:1 onboarding call — their feedback will shape your product roadmap",
    ],
  },
};
