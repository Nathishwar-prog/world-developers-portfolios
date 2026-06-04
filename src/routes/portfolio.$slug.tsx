import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Copy, Globe, Share2, Sparkles, Trophy, Gauge } from "lucide-react";
import { useState, useEffect } from "react";
import {
  findBySlug,
  slugFor,
  categoryFor,
  technologiesFor,
} from "@/lib/portfolio-taxonomy";
import portfolios from "@/data/portfolios.json";
import { PortfolioCard, type Portfolio } from "@/components/PortfolioCard";
import { getScreenshotUrl } from "@/lib/screenshot";
import { Lightbox, type LightboxImage } from "@/components/Lightbox";
import { Maximize2 } from "lucide-react";

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export const Route = createFileRoute("/portfolio/$slug")({
  loader: ({ params }) => {
    const p = findBySlug(params.slug);
    if (!p) throw notFound();
    return { portfolio: p };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.portfolio;
    const title = p ? `${p.name} — Portfolio` : "Portfolio";
    const desc = p?.tagline
      ? `${p.tagline}. Visit ${hostname(p.url)}.`
      : p
        ? `Portfolio of ${p.name} — ${hostname(p.url)}.`
        : "Portfolio details.";
    const img = p
      ? getScreenshotUrl(p.url, { width: 1200, height: 630 })
      : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(img
          ? [
              { property: "og:image", content: img },
              { name: "twitter:image", content: img },
              { name: "twitter:card", content: "summary_large_image" },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: NotFoundPortfolio,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Couldn't load portfolio</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  ),
  component: PortfolioDetail,
});

function NotFoundPortfolio() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Portfolio not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn't find that portfolio. It may have been removed.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-green to-brand-blue px-5 py-2.5 text-sm font-semibold text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to gallery
      </Link>
    </div>
  );
}

const all = portfolios as Portfolio[];

function PortfolioDetail() {
  const { portfolio: initialPortfolio } = Route.useLoaderData() as { portfolio: Portfolio };
  const [p, setP] = useState<Portfolio>(initialPortfolio);

  useEffect(() => {
    setP(initialPortfolio);
  }, [initialPortfolio]);

  const host = hostname(p.url);
  const category = categoryFor(p);
  const techs = technologiesFor(p);
  const big = getScreenshotUrl(p.url, { width: 1280, height: 800 });
  const mobile = getScreenshotUrl(p.url, { width: 420, height: 720, isMobile: true });
  const hires = getScreenshotUrl(p.url, { width: 1920, height: 1200 });
  const [copied, setCopied] = useState(false);
  const galleryImages: LightboxImage[] = [
    { src: hires, alt: `${p.name} — desktop view`, label: `${p.name} · Desktop` },
    { src: mobile, alt: `${p.name} — mobile view`, label: `${p.name} · Mobile` },
  ];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const initials = p.name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Related: same category, different portfolio
  const related = all
    .filter((x) => x.url !== p.url && categoryFor(x) === category)
    .slice(0, 4);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(p.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const share = async () => {
    const shareData = { title: p.name, text: p.tagline ?? p.name, url: p.url };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* fall through */
      }
    }
    copy();
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to gallery
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              Leaderboard
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-green to-brand-blue text-white shadow">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-display text-sm font-bold tracking-tight">Folio</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Preview */}
          <div className="space-y-4">
            <div
              className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-green/15 via-card to-brand-blue/15"
              style={{ boxShadow: "var(--shadow-card-hover)" }}
            >
              <div className="flex items-center gap-1.5 border-b border-border/60 bg-background/60 px-4 py-3 backdrop-blur">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-green-400/80" />
                <div className="ml-3 flex flex-1 items-center gap-2 truncate rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3 shrink-0" />
                  <span className="truncate">{p.url}</span>
                </div>
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-[16/10] overflow-hidden bg-brand-ink"
              >
                {/* Desktop Mock Web Page Fallback */}
                <div className="absolute inset-0 flex flex-col justify-between p-8 text-white bg-gradient-to-br from-brand-ink via-slate-900 to-brand-green/20 select-none">
                  {/* Nav */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="font-display font-bold text-lg text-primary tracking-wider">{initials}</span>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>About</span>
                      <span>Projects</span>
                      <span>Contact</span>
                    </div>
                  </div>
                  
                  {/* Hero */}
                  <div className="my-auto max-w-lg text-left">
                    <span className="inline-block rounded-full bg-primary/20 px-2.5 py-1 text-[10px] font-semibold text-primary uppercase tracking-wider">
                      Portfolio Showcase
                    </span>
                    <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                      Hi, I'm <span className="bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">{p.name}</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                      {p.tagline ?? "Software engineer and creator pushing the boundaries of web development."}
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <span className="rounded-full bg-gradient-to-r from-brand-green to-brand-blue px-4 py-2 text-xs font-semibold text-white shadow-md">
                        Hire Me
                      </span>
                      <span className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300">
                        View Work
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/40">
                    <span>Designed by {p.name}</span>
                    <span>Powered by Folio</span>
                  </div>
                </div>

                <img
                  src={big}
                  alt={`${p.name} portfolio screenshot`}
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-500"
                  onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "1")}
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-[9/16] overflow-hidden relative bg-brand-ink flex flex-col justify-between p-4">
                  {/* Mobile Mock Web Page Fallback */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-75 text-white select-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold text-primary">{initials}</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    {/* Hero */}
                    <div className="my-auto flex flex-col items-center gap-2 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm shadow">
                        {initials}
                      </div>
                      <h4 className="font-display text-xs font-bold leading-tight">{p.name}</h4>
                      <p className="text-[9px] text-slate-300 line-clamp-3 px-1">{p.tagline ?? "Software Developer"}</p>
                      <span className="rounded-full bg-gradient-to-r from-brand-green to-brand-blue px-3 py-1 text-[8px] font-bold text-white shadow mt-1">
                        Connect
                      </span>
                    </div>
                    {/* Footer bar */}
                    <div className="h-1 w-12 bg-white/20 mx-auto rounded-full" />
                  </div>
                  
                  <img
                    src={mobile}
                    alt={`${p.name} mobile preview`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-500"
                    onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "1")}
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  />
                </div>
                <p className="px-3 py-2 text-center text-[11px] text-muted-foreground">
                  Mobile view
                </p>
              </div>
              <div className="col-span-2 grid place-content-center rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
                <p className="font-display text-sm font-semibold">Live website preview</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Screenshots refresh automatically. Visit the live site for the latest version.
                </p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-green to-brand-blue px-4 py-2 text-xs font-semibold text-white shadow"
                >
                  Open live site <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Info */}
          <aside className="space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-green to-brand-blue font-display text-lg font-bold text-white shadow">
                  {initials}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    {category}
                  </span>
                  <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight">
                    {p.name}
                  </h1>
                </div>
              </div>
              {p.tagline && (
                <p className="mt-4 text-base text-muted-foreground">{p.tagline}</p>
              )}
            </div>

            <div className="space-y-2">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-green to-brand-blue px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 transition-transform hover:-translate-y-0.5"
              >
                Visit {host} <ArrowUpRight className="h-4 w-4" />
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <button
                  onClick={share}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Details
              </p>
              <dl className="mt-3 space-y-2.5 text-sm">
                {p.rank && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">Rank</dt>
                    <dd className="text-right font-bold text-primary">
                      {p.rank === 1 ? "🥇 #1" : p.rank === 2 ? "🥈 #2" : p.rank === 3 ? "🥉 #3" : `#${p.rank}`}
                    </dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Domain</dt>
                  <dd className="text-right font-medium">{host}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-right font-medium">{category}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Technologies</dt>
                  <dd className="text-right font-medium">
                    {techs.length > 0 ? techs.length : "—"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Lighthouse Performance Audit Dashboard */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Performance Audit
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.lighthouse?.updatedAt 
                      ? `Last audited: ${new Date(p.lighthouse.updatedAt).toLocaleDateString()}` 
                      : "Not audited yet"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                  Auto-updated weekly
                </span>
              </div>

              {p.lighthouse ? (
                <div className="mt-4 space-y-4">
                  {/* Overall score gauge */}
                  <div className="flex items-center justify-between bg-muted/40 rounded-xl p-3 border border-border/40">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display font-extrabold text-sm border-2 ${
                        p.lighthouse.score >= 90
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow shadow-emerald-500/15"
                          : p.lighthouse.score >= 50
                            ? "bg-amber-500/10 border-amber-500 text-amber-500"
                            : "bg-destructive/10 border-destructive text-destructive"
                      }`}>
                        {p.lighthouse.score}
                      </div>
                      <div>
                        <p className="font-display font-bold text-xs">Performance Index</p>
                        <p className="text-[10px] text-muted-foreground text-left">Weighted score of all audits</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary">#{p.rank} Ranked</span>
                  </div>

                  {/* Category bars */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Performance */}
                    <div className="border border-border/60 bg-muted/20 rounded-xl p-2.5 text-left">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground text-[10px] font-medium">Performance</span>
                        <span className={`font-extrabold ${
                          p.lighthouse.performance >= 90 ? "text-emerald-500" : p.lighthouse.performance >= 50 ? "text-amber-500" : "text-destructive"
                        }`}>{p.lighthouse.performance}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            p.lighthouse.performance >= 90 ? "bg-emerald-500" : p.lighthouse.performance >= 50 ? "bg-amber-500" : "bg-destructive"
                          }`}
                          style={{ width: `${p.lighthouse.performance}%` }}
                        />
                      </div>
                    </div>

                    {/* Accessibility */}
                    <div className="border border-border/60 bg-muted/20 rounded-xl p-2.5 text-left">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground text-[10px] font-medium">Accessibility</span>
                        <span className={`font-extrabold ${
                          p.lighthouse.accessibility >= 90 ? "text-emerald-500" : p.lighthouse.accessibility >= 50 ? "text-amber-500" : "text-destructive"
                        }`}>{p.lighthouse.accessibility}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            p.lighthouse.accessibility >= 90 ? "bg-emerald-500" : p.lighthouse.accessibility >= 50 ? "bg-amber-500" : "bg-destructive"
                          }`}
                          style={{ width: `${p.lighthouse.accessibility}%` }}
                        />
                      </div>
                    </div>

                    {/* Best Practices */}
                    <div className="border border-border/60 bg-muted/20 rounded-xl p-2.5 text-left">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground text-[10px] font-medium">Best Practices</span>
                        <span className={`font-extrabold ${
                          p.lighthouse.bestPractices >= 90 ? "text-emerald-500" : p.lighthouse.bestPractices >= 50 ? "text-amber-500" : "text-destructive"
                        }`}>{p.lighthouse.bestPractices}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            p.lighthouse.bestPractices >= 90 ? "bg-emerald-500" : p.lighthouse.bestPractices >= 50 ? "bg-amber-500" : "bg-destructive"
                          }`}
                          style={{ width: `${p.lighthouse.bestPractices}%` }}
                        />
                      </div>
                    </div>

                    {/* SEO */}
                    <div className="border border-border/60 bg-muted/20 rounded-xl p-2.5 text-left">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground text-[10px] font-medium">SEO</span>
                        <span className={`font-extrabold ${
                          p.lighthouse.seo >= 90 ? "text-emerald-500" : p.lighthouse.seo >= 50 ? "text-amber-500" : "text-destructive"
                        }`}>{p.lighthouse.seo}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            p.lighthouse.seo >= 90 ? "bg-emerald-500" : p.lighthouse.seo >= 50 ? "bg-amber-500" : "bg-destructive"
                          }`}
                          style={{ width: `${p.lighthouse.seo}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 py-6 border border-dashed border-border rounded-xl text-center bg-muted/10">
                  <p className="text-xs font-medium">No performance data available</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Click Run Audit to query Google PageSpeed Insights.</p>
                </div>
              )}
            </div>

            {techs.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tech stack
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {techs.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  More in {category}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                  Related portfolios
                </h2>
              </div>
              <Link
                to="/"
                className="text-xs font-medium text-primary hover:underline"
              >
                Browse all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <PortfolioCard key={slugFor(r)} p={r} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
