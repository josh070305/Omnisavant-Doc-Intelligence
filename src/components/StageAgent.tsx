import type { AgentAction, AgentStep, StageState } from "../types";

type StageAgentProps = {
  visibleSteps: AgentStep[];
  state: StageState;
  error: string | null;
  isThinking: boolean;
  onRun: () => void;
  onRetry: () => void;
};

const actionStyles: Record<AgentAction, string> = {
  extract_detail: "border-omni-cyan/40 text-omni-cyan",
  find_connection: "border-omni-purple/40 text-omni-purple",
  identify_gap: "border-omni-rose/40 text-omni-rose",
};

export default function StageAgent({
  visibleSteps,
  state,
  error,
  isThinking,
  onRun,
  onRetry,
}: StageAgentProps) {
  const isLocked = state === "locked";
  const isLoading = state === "loading";
  const canRun = state === "ready" || state === "complete" || state === "error";

  return (
    <section
      className={`rounded-lg border border-omni-border bg-omni-card p-4 transition-all duration-300 sm:p-6 ${
        isLocked ? "opacity-45" : "shadow-glow"
      }`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-omni-cyan">
            03 Agent
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Watch a ReAct loop reason across the document.
          </h2>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-md bg-omni-cyan px-5 text-sm font-semibold text-[#071013] transition hover:bg-[#67e8f9] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canRun || isLoading || isThinking}
          onClick={onRun}
          type="button"
        >
          {isLoading || isThinking ? "Reasoning..." : visibleSteps.length ? "Rerun" : "Run Agent"}
        </button>
      </div>

      {isLocked && (
        <p className="text-sm text-slate-500">Complete the concept crawl to unlock.</p>
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

      {(isLoading || isThinking) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-omni-border bg-[#0f0f18] p-3 font-mono text-sm text-slate-300">
          <span>Agent thinking</span>
          <span className="typing-dot">.</span>
          <span className="typing-dot [animation-delay:150ms]">.</span>
          <span className="typing-dot [animation-delay:300ms]">.</span>
        </div>
      )}

      <div className="grid gap-3">
        {visibleSteps.map((step, index) => (
          <article
            className="rounded-lg border border-omni-border bg-[#171724] p-4"
            key={`${step.action}-${index}`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                Step {index + 1}
              </span>
              <span
                className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase ${actionStyles[step.action]}`}
              >
                {step.action}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="font-mono text-xs uppercase text-slate-500">Thought</p>
                <p className="mt-1 text-sm leading-6 text-slate-200">{step.thought}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase text-slate-500">Action</p>
                <p className="mt-1 text-sm leading-6 text-slate-200">{step.action}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase text-slate-500">Observation</p>
                <p className="mt-1 text-sm leading-6 text-slate-200">
                  {step.observation}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
                <span>Confidence</span>
                <span>{step.confidence}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#0d0d14]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-omni-indigo to-omni-cyan"
                  style={{ width: `${Math.max(0, Math.min(step.confidence, 100))}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
