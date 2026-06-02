import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Copy, Globe, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  findBySlug,
  slugFor,
  categoryFor,
  technologiesFor,
} from "@/lib/portfolio-taxonomy";
import portfolios from "@/data/portfolios.json";
import { PortfolioCard, type Portfolio } from "@/components/PortfolioCard";

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
      ? `https://image.thum.io/get/width/1200/crop/630/noanimate/${p.url}`
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
  const { portfolio: p } = Route.useLoaderData();
  const host = hostname(p.url);
  const category = categoryFor(p);
  const techs = technologiesFor(p);
  const big = `https://image.thum.io/get/width/1280/crop/800/noanimate/${p.url}`;
  const mobile = `https://image.thum.io/get/width/420/viewportWidth/420/crop/720/noanimate/${p.url}`;
  const [copied, setCopied] = useState(false);

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
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-green to-brand-blue text-white shadow">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-sm font-bold tracking-tight">Folio</span>
          </Link>
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
                className="block aspect-[16/10] overflow-hidden"
              >
                <img
                  src={big}
                  alt={`${p.name} portfolio screenshot`}
                  loading="eager"
                  className="h-full w-full object-cover object-top"
                />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-[9/16] overflow-hidden">
                  <img
                    src={mobile}
                    alt={`${p.name} mobile preview`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
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
