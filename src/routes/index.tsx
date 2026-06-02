import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles, Github } from "lucide-react";
import portfolios from "@/data/portfolios.json";
import { PortfolioCard, type Portfolio } from "@/components/PortfolioCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio Showcase — Discover Developer Portfolios" },
      {
        name: "description",
        content:
          "Browse a curated showcase of developer, designer, and engineer portfolios. Search by name, role, or tagline.",
      },
      { property: "og:title", content: "Portfolio Showcase" },
      { property: "og:description", content: "A modern gallery of developer portfolios." },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

const PAGE_SIZE = 36;
const data = portfolios as Portfolio[];

function Index() {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tagline?.toLowerCase().includes(q) ?? false) ||
        p.url.toLowerCase().includes(q),
    );
  }, [query]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-brand-blue text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-bold tracking-tight">Folio</p>
              <p className="text-[11px] text-muted-foreground">Portfolio Showcase</p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent sm:flex"
          >
            <Github className="h-4 w-4" />
            Submit yours
          </a>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {data.length.toLocaleString()} portfolios indexed
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Discover portfolios from{" "}
            <span className="bg-gradient-to-r from-brand-green via-brand-blue to-brand-ink bg-clip-text text-transparent">
              builders worldwide
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            A living gallery of developer, designer, and engineer portfolios. Find inspiration,
            connect with talent, and showcase your own work.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search by name, role, or domain…"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mr-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
              >
                Clear
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Showing {Math.min(visible, filtered.length).toLocaleString()} of{" "}
            {filtered.length.toLocaleString()} results
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
            <p className="font-display text-lg font-semibold">No portfolios found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => (
                <PortfolioCard key={p.url + p.name} p={p} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="rounded-full bg-gradient-to-r from-brand-green to-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 transition-transform hover:-translate-y-0.5"
                >
                  Load more portfolios
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-border/60 bg-background/60 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Built with care. Previews via thum.io · {data.length.toLocaleString()} curated entries.
        </div>
      </footer>
    </div>
  );
}
