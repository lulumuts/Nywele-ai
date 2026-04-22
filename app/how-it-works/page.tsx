'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  Database,
  Heart,
  Save,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  XCircle,
} from 'lucide-react';
import { BottomNavHubShell } from '@/app/components/BottomNavHubLayout';
import { DASHBOARD_CARD_TEXT } from '@/lib/app-theme';

// ─── Shared class names ───────────────────────────────────────────────────────

const panelClassName =
  'rounded-[28px] border border-[rgba(178,104,5,0.22)] bg-white/[0.88] p-6 shadow-[0_10px_40px_rgba(87,50,3,0.08)] backdrop-blur-sm md:p-8';
const heroPanelClassName =
  'rounded-[28px] border border-[rgba(178,104,5,0.22)] bg-[#FB8C1C] shadow-[0_10px_40px_rgba(87,50,3,0.08)]';
const mutedTextClassName = 'text-sm leading-6 md:text-base';
const aboutMainAreaClassName =
  'bottom-nav-hub-main flex min-h-0 flex-1 flex-col px-4 pt-[env(safe-area-inset-top,0px)] sm:px-5 md:px-8 lg:px-10';
const aboutInnerClassName =
  'mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-2 sm:px-3 md:px-4 lg:px-6';

// ─── Data ────────────────────────────────────────────────────────────────────

const researchMetrics = [
  {
    label: 'Respondents',
    value: '17',
    note: 'Women of African origin, 10 in Singapore, 7 in Canada (6 months to 3+ years)',
  },
  {
    label: 'Made routine changes',
    value: '82%',
    note: 'Adjusted or overhauled washing frequency, styles worn, and daily care',
  },
  {
    label: 'Top pain point',
    value: '6 / 17',
    note: 'Missing home stylists, the single most cited hardest challenge',
  },
  {
    label: 'Climate impact',
    value: '5 / 17',
    note: 'Humidity and dryness disrupting routines, especially acute in Singapore',
  },
  {
    label: 'Wasted spend (SG)',
    value: '~$88',
    note: "Average spent on products that didn't work in Singapore",
  },
  {
    label: 'Wasted spend (CA)',
    value: '~$264',
    note: "Average spent on products that didn't work in Canada, 3× higher than SG",
  },
  {
    label: '#1 feature need',
    value: '4.0 / 5',
    note: 'Finding stylists who understand my hair, highest rated across both cities',
  },
  {
    label: '#2 feature need',
    value: '3.9 / 5',
    note: "Knowing if products will work before buying, the gap technology can close",
  },
];

const competitorComparison = [
  { feature: 'Hair type analysis',                     nywele: true,  iruncoil: true  },
  { feature: 'Ingredient-level analysis',              nywele: true,  iruncoil: false },
  { feature: 'Trichologist-informed ingredient flags', nywele: true,  iruncoil: false },
  { feature: 'Africa-first product catalogue',         nywele: true,  iruncoil: false },
  { feature: 'Local pricing (KES)',                    nywele: true,  iruncoil: false },
  { feature: 'Hair health tracking over time',         nywele: true,  iruncoil: false },
  { feature: 'Exportable reports',                     nywele: true,  iruncoil: false },
  { feature: 'Style compatibility check',              nywele: true,  iruncoil: false },
];

const productDecisions = [
  {
    icon: XCircle,
    decision: "We didn't build a stylist marketplace",
    rationale:
      'Finding a qualified stylist scored highest in our research at 4.0/5. But a marketplace is a supply-side problem, it requires recruiting and vetting stylists city by city, and it already exists in partial forms elsewhere. We chose to solve the problem technology could uniquely address: helping users know whether a specific product, with its specific ingredients, will work for their hair before they spend money on it.',
  },
  {
    icon: Brain,
    decision: 'Ingredient intelligence, not just product ratings',
    rationale:
      "Existing tools like iruncoil.com stop at product type recommendations. We went a layer deeper: analysing the actual ingredient list against 4c hair needs, flagging sulfates, drying alcohols, and heavy mineral oils, and surfacing trichologist-informed context for each flag. The goal is comprehension, understanding why something works or doesn't, not just a compatibility score.",
  },
  {
    icon: Zap,
    decision: 'Africa-first, not Africa-localised',
    rationale:
      'Most hair care AI tools are built around Western product catalogues and adapted for other markets as an afterthought. Nywele prices in KES, sources products available in Nairobi, and is calibrated for the humidity, water quality, and product landscape of East African markets first. This is not a US product adapted for Africa. It is an African product.',
  },
  {
    icon: TrendingUp,
    decision: 'Freemium consumer, B2B at scale',
    rationale:
      'The consumer product, free hair analysis, saved routines, product compatibility, builds the dataset and the trust. The business model at scale is B2B: licensing the ingredient intelligence and compatibility API to beauty retailers, e-commerce platforms, and corporate wellness programmes that want to serve Black hair customers without building the knowledge base themselves.',
  },
];

const whatWeBuilt = [
  {
    icon: Brain,
    name: 'AI hair analysis',
    description:
      'Photo upload into Gemini AI reads hair type, health, porosity, and condition. Outputs a personalised routine with products from the Africa-first catalogue, priced in KES.',
    rationale:
      'From research: 82% had changed their routines since moving but had no reliable guidance on what to change to.',
  },
  {
    icon: Save,
    name: 'Style check',
    description:
      'Upload a reference photo or pick from the library. Gemini AI identifies the style, surfaces maintenance requirements, duration expectations, and damage risk specific to your hair profile.',
    rationale:
      'From research: 27% had done styles they knew might cause damage, for convenience or professionalism. This feature makes the risk visible before the decision.',
  },
  {
    icon: Sparkles,
    name: 'Product compatibility',
    description:
      'Ingredient-level analysis against 4c hair needs. Flags specific ingredients. Scores compatibility against your hair profile. Trichologist-informed context for each flag so users understand the reasoning, not just the result.',
    rationale:
      "From research: respondents averaged $88, $264 on products that didn't work. The problem is not awareness, it's certainty before purchase.",
  },
];

const techStack = [
  {
    icon: Brain,
    name: 'Gemini AI',
    role: 'Hair analysis and style detection',
    description:
      'Analyses hair photos to determine health, type, and styling needs. Identifies hairstyles from reference images and surfaces maintenance considerations specific to 4c hair.',
  },
  {
    icon: Database,
    name: 'Next.js + Supabase',
    role: 'App architecture and data',
    description:
      'Built as an installable PWA for a native app feel without an app store. Supabase handles the Africa-first product catalogue, user profiles, and saved routines. Optimised for mobile-first, lower-bandwidth environments.',
  },
  {
    icon: Sparkles,
    name: 'Blender + Three.js',
    role: 'Motion design and 3D',
    description:
      'Blender + Three.js power the intro animation and the loading screen. The product opening sequence was built in Blender over several months, self-taught. The in-app 3D bust animation uses React Three Fiber with a custom ShaderMaterial: triplanar world-space grid projection, a clipping plane reveal, and a scan edge highlight driven by a uScanStrength uniform.',
  },
];

const businessModel = [
  {
    tier: 'Free',
    audience: 'Individual users',
    what: 'Hair analysis, basic product recommendations, style compatibility check',
    why: 'Builds the user base, generates hair profile data, establishes trust with the core audience.',
  },
  {
    tier: 'Pro',
    audience: 'Power users',
    what: 'Full ingredient analysis, health tracking over time, exportable reports, trichologist notes',
    why: 'Natural upsell for users who have experienced a failed product purchase and want more certainty.',
  },
  {
    tier: 'B2B',
    audience: 'Beauty retailers and platforms',
    what: 'Ingredient intelligence API, compatibility scoring, product recommendation engine',
    why: "The highest-margin tier. Beauty retailers want to serve Black hair customers better but lack the knowledge base. We license ours.",
  },
];

const roadmap = [
  'Barcode scanning for real-time ingredient analysis at point of purchase',
  'Nairobi salon directory with verified natural hair specialists',
  'Trichologist partnership for a clinically validated ingredient database',
  'WhatsApp-native experience for low-data markets across East Africa',
];

// ─── Shared components ────────────────────────────────────────────────────────

function SectionHeading({
  eyebrow,
  title,
  description,
  color,
  descriptionColor,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  color?: string;
  descriptionColor?: string;
}) {
  const resolvedColor = color ?? '#7A3F00';
  const resolvedEyebrowColor = color ?? '#7A3F00';
  const resolvedDescriptionColor = descriptionColor ?? (color ? resolvedColor : DASHBOARD_CARD_TEXT);

  return (
    <div className="mb-6 md:mb-8">
      {eyebrow && (
        <p
          className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]"
          style={{ color: resolvedEyebrowColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="text-3xl font-bold md:text-4xl"
        style={{ color: resolvedColor, fontFamily: 'Caprasimo, serif' }}
      >
        {title}
      </h2>
      {description && (
        <p
          className="mt-3 max-w-3xl text-base leading-7 md:text-lg"
          style={{ color: resolvedDescriptionColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  return (
    <BottomNavHubShell
      mainAreaClassName={aboutMainAreaClassName}
      innerClassName={aboutInnerClassName}
      showNav={false}
    >
      <div className="mt-4 flex flex-col gap-7 pb-5 pt-0 md:mt-6 md:gap-9 md:pb-9 md:pt-2 lg:mt-8 lg:pt-4">

        {/* ── 1. Hero ── */}
        <section className={`${heroPanelClassName} overflow-hidden`}>
          <div className="flex flex-col gap-7 lg:flex-row lg:items-stretch lg:justify-between">
            <div className="bg-transparent px-7 py-10 md:px-9 md:py-12 lg:flex lg:w-[55%] lg:flex-col lg:justify-center lg:pl-12 lg:pr-6">
              <div className="mb-3 flex justify-end">
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.3)] bg-transparent px-4 py-2 text-xs font-semibold md:text-sm"
                  style={{ color: '#3B1C00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  <Sparkles className="h-4 w-4" />
                  Product case study
                </div>
              </div>
              <h1
                className="text-3xl font-bold leading-tight md:text-4xl"
                style={{ color: '#3B1C00', fontFamily: 'Caprasimo, serif' }}
              >
                AI for African hair.
              </h1>
              <p
                className="mt-4 text-base leading-7 md:text-lg"
                style={{ color: '#3B1C00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                African hair, particularly 4c curl patterns, are one of the most underserved categories in consumer technology.
                Thats where nywele ai comes in.
              </p>
              <p
                className="mt-3 text-sm leading-7"
                style={{ color: '#3B1C00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Nywele AI accommodates coil patterns from 4a to 4c. We put the coil pattern first, then tailor your needs
                using Gemini AI for hair analysis, a trichologist-informed ingredient layer, and a 3D experience built with
                Three.js.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {['Next.js', 'Gemini AI', 'Supabase', 'Blender', 'Three.js', 'React Three Fiber', 'PWA'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.15)] px-3 py-1 text-xs font-semibold"
                    style={{ color: '#3B1C00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-5 lg:flex lg:w-[45%] lg:-ml-8">
              <div
                className="how-it-works-hero-phone-bg relative h-[340px] w-full overflow-hidden rounded-[28px] bg-[#FB8C1C] bg-[url('/images/mobile-image.png')] bg-cover md:h-[440px] lg:h-auto lg:min-h-[560px] lg:flex-1"
                aria-label="Nywele.ai running on a phone"
              />
            </div>
          </div>
        </section>

        {/* ── 2. The problem ── */}
        <section className={panelClassName}>
          <SectionHeading
            eyebrow="The problem"
            title="A gap that has always been visible"
            description="This is not a niche edge case. It is a large, underserved population with real spending power and a consistent set of unmet needs."
          />
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {[
              {
                icon: Users,
                heading: 'The diaspora experience',
                body: "An unfamiliar climate, unrecognisable products, no trusted stylist, no way to know what will work before spending money. Respondents in Canada averaged ~$264 on products that didn't work. In Singapore, many had stopped buying new things altogether.",
              },
              {
                icon: XCircle,
                heading: 'Tools built as afterthoughts',
                body: 'The AI hair tools that exist treat African hair as a variant to accommodate, not a category to centre, surface-level scans with no ingredient depth, no local pricing, no understanding of 4c hair in humid or cold climates.',
              },
              {
                icon: Brain,
                heading: 'Knowledge locked away',
                body: 'Trichologists know which ingredients strip moisture from coily hair, how humidity affects porosity, which hold types cause breakage. That knowledge exists, but it lives in specialist consultations, not at the moment someone is standing in a chemist deciding what to buy.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.heading}
                  className="rounded-[24px] bg-transparent px-5 pb-7 pt-5 md:px-6 md:pb-8 md:pt-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-[#7A3F00]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: '#7A3F00', fontFamily: 'Caprasimo, serif' }}
                  >
                    {item.heading}
                  </h3>
                  <p
                    className="mt-3 text-sm leading-7"
                    style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── 3. Research ── */}
        <section className="rounded-[28px] border border-[rgba(178,104,5,0.22)] bg-white p-6 shadow-[0_10px_40px_rgba(87,50,3,0.08)] md:p-8">
          <SectionHeading
            eyebrow="User research"
            title="What the research told us"
            description="Before building anything, we surveyed women of African origin living in Singapore and Canada about how relocation reshaped their hair routines, spending, and confidence."
            descriptionColor="#7A3F00"
          />
          <div
            className="rounded-[24px] border border-[rgba(178,104,5,0.18)] bg-[#FFFEE1] p-5 md:p-6"
            style={{ color: '#7A3F00' }}
          >
            <div className="rounded-[20px] bg-[#FFFEE1] p-4 md:p-5">
              <p
                className="text-base leading-7"
                style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Across{' '}
                <span style={{ color: '#7A3F00', fontWeight: 700 }}>17 respondents</span> in two
                cities, the findings were consistent. Over 80% had changed their routines since
                moving. The most commonly cited hardest challenge was missing a trusted stylist
                from home. The spend data was the sharpest signal: Canada respondents averaged{' '}
                <span style={{ color: '#7A3F00', fontWeight: 700 }}>~$264</span> on products that
              didn't work, three times the Singapore figure of ~$88, largely because Singapore
                respondents had stopped buying new products altogether rather than continue
                experimenting. When asked which features would help most, both cohorts rated{' '}
                <span style={{ color: '#7A3F00', fontWeight: 700 }}>knowing if a product will work before buying</span>{' '}
              at 3.9/5, second only to finding a qualified stylist. That distinction shaped
                the product: one is a marketplace problem, the other is a technology problem.
                We built for the one technology could actually solve.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {researchMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className={[
                    'rounded-[20px] border border-[rgba(178,104,5,0.18)] px-4 py-4',
                    [
                      'Respondents',
                      'Made routine changes',
                      'Top pain point',
                      'Climate impact',
                      '#1 feature need',
                      '#2 feature need',
                    ].includes(metric.label) || metric.label.startsWith('Wasted spend')
                      ? 'bg-white'
                      : 'bg-[#FFFEE1]',
                  ].join(' ')}
                >
                  <div
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {metric.label}
                  </div>
                  <div
                    className="mt-2 text-2xl font-bold"
                    style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {metric.value}
                  </div>
                  <div
                    className="mt-2 text-sm leading-6"
                    style={{ color: 'rgba(122,63,0,0.86)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {metric.note}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-6 rounded-[20px] border border-[rgba(178,104,5,0.18)] bg-[#FFFEE1] px-4 py-4 text-sm leading-6"
              style={{ color: 'rgba(122,63,0,0.86)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              <span style={{ color: '#7A3F00', fontWeight: 700 }}>Methodology: </span>
              Qualitative survey distributed via diaspora community groups on WhatsApp and Slack.
              Respondents self-selected. Countries of origin: Nigeria, Kenya, Uganda, South Africa,
              Togo, France, UK, and the US. Same question set used across both cohorts (Singapore
              2024, Canada 2024) to allow direct comparison.
            </div>
          </div>
        </section>

        {/* ── 4. Competitive landscape ── */}
        <section className={panelClassName}>
          <SectionHeading
            eyebrow="Competitive landscape"
            title="What exists and where it falls short"
            description="iruncoil.com is the closest direct competitor, an AI hair scan tool with a focus on coily hair. The comparison clarifies what Nywele AI is actually doing differently."
            descriptionColor="#7A3F00"
          />
          <div className="overflow-x-auto rounded-[24px] border border-[rgba(178,104,5,0.18)] bg-[rgba(255,254,225,0.72)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(178,104,5,0.16)]">
                  <th
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Feature
                  </th>
                  <th
                    className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Nywele AI
                  </th>
                  <th
                    className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    iruncoil.com
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i < competitorComparison.length - 1
                        ? 'border-b border-[rgba(178,104,5,0.10)]'
                        : ''
                    }
                  >
                    <td
                      className="px-5 py-3 text-sm leading-6"
                      style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      {row.feature}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.nywele ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F0E6] text-xs font-bold text-[#3A6B34]">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FDE8E8] text-xs font-bold text-[#8B2020]">
                          ✗
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.iruncoil ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F0E6] text-xs font-bold text-[#3A6B34]">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FDE8E8] text-xs font-bold text-[#8B2020]">
                          ✗
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            className="mt-4 text-sm leading-6"
            style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            The differentiator is depth and geography. iruncoil tells you what type of product
            to use. Nywele tells you whether the specific product in your hand, with its specific
            ingredients, will work for your specific hair, and prices the alternatives in your
            local currency.
          </p>
        </section>

        {/* ── 5. Product decisions ── */}
        <section className={panelClassName}>
          <SectionHeading
            eyebrow="Product decisions"
            title="The calls we made and why"
            description="Product thinking is mostly about what you choose not to build. These were the four decisions that shaped Nywele AI."
          />
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {productDecisions.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.decision}
                  className="rounded-[24px] bg-transparent px-5 pb-6 pt-5 md:px-6"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-transparent text-[#7A3F00]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3
                    className="text-base font-bold md:text-lg"
                    style={{ color: '#7A3F00', fontFamily: 'Caprasimo, serif' }}
                  >
                    {item.decision}
                  </h3>
                  <p
                    className="mt-3 text-sm leading-6 md:text-base md:leading-7"
                    style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {item.rationale}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── 6. What we built ── */}
        <section className={panelClassName}>
          <SectionHeading
            eyebrow="What we built"
            title="Features that follow from the decisions"
            description="Every feature maps back to a research finding or a product decision, nothing was added because it seemed useful in the abstract."
          />
          <div className="mx-auto mb-8 grid max-w-5xl gap-7 md:mb-12 md:gap-8">
            {whatWeBuilt.map((feature, index) => {
              const Icon = feature.icon;
              const imageOnRight = index % 2 === 0;
              const imageBackground =
                feature.name === 'AI hair analysis'
                  ? "bg-[url('/images/hair-analysis-image.png')] bg-cover bg-[position:center_60%]"
                  : feature.name === 'Product compatibility'
                    ? "bg-[url('/images/product-compatibility-image.png')] bg-cover bg-[position:center_60%]"
                    : feature.name === 'Style check'
                      ? "bg-[url('/images/style-check-image.png')] bg-cover bg-[position:center_60%]"
                    : '';
              return (
                <article
                  key={feature.name}
                  className={[
                    'flex flex-col overflow-hidden rounded-[24px] bg-[#FFFEE1] shadow-[0_6px_18px_rgba(87,50,3,0.14)]',
                    ['AI hair analysis', 'Style check', 'Product compatibility'].includes(feature.name)
                      ? 'mx-auto max-w-4xl'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
                    <div
                      className={
                        imageOnRight
                          ? 'min-w-0 px-5 py-6 md:order-1 md:flex-1 md:max-w-[440px] md:px-6 md:py-7 lg:max-w-[480px]'
                          : 'min-w-0 px-5 py-6 md:order-2 md:flex-1 md:max-w-[440px] md:px-6 md:py-7 lg:max-w-[480px]'
                      }
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-[#7A3F00]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3
                        className="text-lg font-bold md:text-xl"
                        style={{ color: '#7A3F00', fontFamily: 'Caprasimo, serif' }}
                      >
                        {feature.name}
                      </h3>
                      <p
                        className="mt-3 text-sm leading-7 md:text-base md:leading-7"
                        style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {feature.description}
                      </p>

                      <div
                        className="mt-4 inline-block rounded-[14px] border border-white/25 bg-white/10 px-3 py-3 text-[11px] leading-5 md:text-xs"
                        style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {feature.rationale}
                      </div>
                    </div>

                    <div className={imageOnRight ? 'md:order-2 md:self-stretch' : 'md:order-1 md:self-stretch'}>
                      <div
                        className={`flex h-[340px] w-full items-center justify-center rounded-none border border-white/25 bg-[#FFFEE1] text-xs font-semibold uppercase tracking-[0.18em] text-[#7A3F00] md:min-h-[420px] md:h-full md:w-[340px] ${imageBackground}`}
                        aria-label={`${feature.name} image`}
                      >
                        {feature.name === 'AI hair analysis' ||
                        feature.name === 'Product compatibility' ||
                        feature.name === 'Style check'
                          ? null
                          : 'Image'}
                      </div>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        </section>

        {/* ── 7. Tech and craft ── */}
        <section className={panelClassName}>
          <SectionHeading
            eyebrow="Technology and craft"
            title="How it was built"
            description="The stack was chosen to move fast and stay lightweight. The 3D and motion work was a deliberate craft investment, the experience of the product matters as much as its utility."
          />
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <article
                  key={tech.name}
                  className={[
                    'rounded-[24px] bg-transparent px-5 pb-7 pt-5 shadow-[0_6px_18px_rgba(87,50,3,0.14)] md:px-6 md:pb-8 md:pt-6',
                    tech.role === 'Motion design and 3D' ? 'md:col-span-2 md:pl-10' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div
                    className={[
                      'flex flex-col gap-5',
                      tech.role === 'Motion design and 3D' ? 'md:flex-row md:items-start md:justify-between' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div
                      className={
                        tech.role === 'Motion design and 3D'
                          ? 'min-w-0 max-w-[360px] md:flex-1 md:max-w-[460px] lg:max-w-[520px] lg:pr-16 xl:pr-24'
                          : undefined
                      }
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-[#B26805]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p
                        className="text-sm font-semibold uppercase tracking-[0.14em]"
                        style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {tech.role}
                      </p>
                      <h3
                        className="mt-2 text-xl font-bold"
                        style={{ color: '#7A3F00', fontFamily: 'Caprasimo, serif' }}
                      >
                        {tech.name}
                      </h3>
                      <p
                        className="mt-3 text-base leading-7"
                        style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {tech.role === 'Motion design and 3D' ? (
                          <>
                            Blender + Three.js power the intro animation and the loading screen. The product opening sequence was
                            built in Blender over several months, self-taught.
                            <span className="mt-3 block">
                              The in-app 3D bust animation uses React Three Fiber with a custom ShaderMaterial: triplanar world-space
                              grid projection, a clipping plane reveal, and a scan edge highlight driven by a uScanStrength uniform.
                            </span>
                          </>
                        ) : (
                          tech.description
                        )}
                      </p>
                    </div>

                    {tech.role === 'Motion design and 3D' ? (
                      <div className="w-full md:w-[320px] md:shrink-0 md:self-stretch">
                        <div className="h-[220px] w-full overflow-hidden rounded-[20px] border border-[rgba(178,104,5,0.22)] bg-white/40 md:h-full">
                          <video
                            className="h-full w-full object-cover"
                            src="/videos/blender-video.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── 8. Business model ── */}
        <section
          className="rounded-[32px] bg-[#FFFECD] px-6 py-7 shadow-[0_14px_48px_rgba(87,50,3,0.18)] md:px-8 md:py-9"
        >
          <SectionHeading
            eyebrow="Business model"
            title="How it sustains itself"
            description="The consumer product builds trust and data. The B2B layer is where the business scales."
            color="#7A3F00"
          />
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {businessModel.map((tier) => (
              <div
                key={tier.tier}
                className="rounded-[24px] border border-white/20 bg-[rgba(255,255,255,0.12)] p-5 backdrop-blur-sm"
              >
                <div
                  className="mb-1 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: 'rgba(122,63,0,0.78)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {tier.audience}
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: '#7A3F00', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {tier.tier}
                </div>
                <p
                  className="mt-3 text-sm leading-6"
                  style={{ color: 'rgba(122,63,0,0.9)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {tier.what}
                </p>
                <div
                  className="mt-3 border-t border-white/20 pt-3 text-xs leading-5"
                  style={{ color: 'rgba(122,63,0,0.78)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {tier.why}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 9. Roadmap ── */}
        <section className={panelClassName}>
          <SectionHeading
            eyebrow="What's next"
            title="The roadmap"
            description="The current build proves the core loop. These are the next meaningful additions, each tied to a specific gap in the current experience."
          />
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {roadmap.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[20px] border border-[rgba(178,104,5,0.14)] bg-[rgba(255,254,225,0.8)] px-4 py-4"
              >
                <ArrowRight className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#7A3F00' }} />
                <p
                  className={mutedTextClassName}
                  style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="pb-3 text-center md:pb-6">
          <Link
            href="/hair-care"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B26805] px-7 py-3 text-base font-semibold text-[#FFFEE1] shadow-[0_10px_30px_rgba(87,50,3,0.16)] transition-opacity hover:opacity-90"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            <Heart className="h-5 w-5" />
            Try the product
          </Link>
        </section>

      </div>
    </BottomNavHubShell>
  );
}