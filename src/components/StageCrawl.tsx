import type { ConceptMap, StageState } from "../types";

type StageCrawlProps = {
  value: ConceptMap | null;
  state: StageState;
  error: string | null;
  onCrawl: () => void;
  onRetry: () => void;
};

const positions = [
  { x: 50, y: 14 },
  { x: 78, y: 30 },
  { x: 72, y: 68 },
  { x: 50, y: 84 },
  { x: 24, y: 68 },
  { x: 20, y: 30 },
  { x: 50, y: 50 },
  { x: 82, y: 50 },
];

export default function StageCrawl({
  value,
  state,
  error,
  onCrawl,
  onRetry,
}: StageCrawlProps) {
  const isLocked = state === "locked";
  const isLoading = state === "loading";
  const canRun = state === "ready" || state === "complete" || state === "error";
  const nodes = value?.nodes.slice(0, 8) ?? [];

  return (
    <section
      className={`rounded-lg border border-omni-border bg-omni-card p-4 transition-all duration-300 sm:p-6 ${
        isLocked ? "opacity-45" : "shadow-glow"
      }`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-omni-purple">
            02 Crawl
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Map concepts into a connected visual graph.
          </h2>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-md bg-omni-purple px-5 text-sm font-semibold text-white transition hover:bg-[#7c4ee6] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canRun || isLoading}
          onClick={onCrawl}
          type="button"
        >
          {isLoading ? "Crawling..." : value ? "Recrawl" : "Crawl"}
        </button>
      </div>

      {isLocked && (
        <p className="text-sm text-slate-500">Complete extraction to unlock.</p>
      )}

      {isLoading && (
        <div className="flex h-80 items-center justify-center gap-3 text-sm text-slate-300">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-omni-purple border-t-transparent" />
          Crawling concept relationships.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p>{error}</p>
          <button
            className="mt-3 rounded-md border border-rose-400/40 px-3 py-2 text-xs font-semibold hover:bg-rose-400/10"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {value && (
        <div className="relative h-[28rem] overflow-hidden rounded-lg border border-omni-border bg-[#0f0f18]">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {value.edges.map((edge, index) => {
              const fromIndex = nodes.findIndex((node) => node.id === edge.from);
              const toIndex = nodes.findIndex((node) => node.id === edge.to);
              if (fromIndex < 0 || toIndex < 0) return null;
              const from = positions[fromIndex];
              const to = positions[toIndex];
              return (
                <line
                  className="stroke-omni-border"
                  key={`${edge.from}-${edge.to}-${index}`}
                  strokeWidth="0.45"
                  x1={from.x}
                  x2={to.x}
                  y1={from.y}
                  y2={to.y}
                />
              );
            })}
          </svg>

          {value.edges.map((edge, index) => {
            const fromIndex = nodes.findIndex((node) => node.id === edge.from);
            const toIndex = nodes.findIndex((node) => node.id === edge.to);
            if (fromIndex < 0 || toIndex < 0) return null;
            const from = positions[fromIndex];
            const to = positions[toIndex];
            return (
              <div
                className="group absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2"
                key={`${edge.relationship}-${index}`}
                style={{
                  left: `${(from.x + to.x) / 2}%`,
                  top: `${(from.y + to.y) / 2}%`,
                }}
              >
                <span className="block h-2 w-2 rounded-full bg-omni-cyan" />
                <span className="pointer-events-none absolute left-1/2 top-5 z-20 hidden w-48 -translate-x-1/2 rounded-md border border-omni-border bg-[#181827] p-2 text-center font-mono text-[11px] text-slate-200 shadow-xl group-hover:block">
                  {edge.relationship}
                </span>
              </div>
            );
          })}

          {nodes.map((node, index) => {
            const position = positions[index];
            return (
              <div
                className="absolute flex min-h-16 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-omni-indigo/40 bg-[#171724] p-3 text-center shadow-lg"
                key={node.id}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  animation: `node-pop 420ms ${index * 140}ms both ease-out`,
                }}
              >
                <div>
                  <p className="break-words text-sm font-semibold leading-5 text-white">
                    {node.label}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase text-slate-500">
                    {node.type}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
