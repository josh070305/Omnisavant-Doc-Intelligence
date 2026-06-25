import type { ChatMessage, StageState } from "../types";

type StageQueryProps = {
  messages: ChatMessage[];
  question: string;
  state: StageState;
  error: string | null;
  isLoading: boolean;
  onQuestionChange: (value: string) => void;
  onSend: () => void;
  onRetry: () => void;
};

export default function StageQuery({
  messages,
  question,
  state,
  error,
  isLoading,
  onQuestionChange,
  onSend,
  onRetry,
}: StageQueryProps) {
  const isLocked = state === "locked";

  return (
    <section
      className={`rounded-lg border border-omni-border bg-omni-card p-4 transition-all duration-300 sm:p-6 ${
        isLocked ? "opacity-45" : "shadow-glow"
      }`}
    >
      <div className="mb-5">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-omni-emerald">
          04 Query
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Ask document-grounded questions.
        </h2>
      </div>

      {isLocked ? (
        <p className="text-sm text-slate-500">Complete agent reasoning to unlock.</p>
      ) : (
        <>
          <div className="flex max-h-[28rem] min-h-72 flex-col gap-3 overflow-y-auto rounded-lg border border-omni-border bg-[#0f0f18] p-3">
            {messages.length === 0 && (
              <div className="flex h-56 items-center justify-center text-center text-sm text-slate-500">
                Your document context is ready.
              </div>
            )}
            {messages.map((message) => (
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                key={message.id}
              >
                <div
                  className={`max-w-[82%] rounded-lg border px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "border-omni-indigo/40 bg-omni-indigo/20 text-white"
                      : "border-omni-border bg-[#171724] text-slate-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-omni-border bg-[#171724] px-4 py-3 font-mono text-sm text-slate-300">
                  typing<span className="typing-dot">.</span>
                  <span className="typing-dot [animation-delay:150ms]">.</span>
                  <span className="typing-dot [animation-delay:300ms]">.</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
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

          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              onSend();
            }}
          >
            <input
              className="min-h-12 flex-1 rounded-lg border border-omni-border bg-[#0f0f18] px-4 text-sm text-slate-100 outline-none transition focus:border-omni-indigo"
              disabled={isLoading}
              onChange={(event) => onQuestionChange(event.target.value)}
              placeholder="Ask about the extracted document..."
              value={question}
            />
            <button
              className="h-12 rounded-md bg-omni-purple px-5 text-sm font-semibold text-white transition hover:bg-[#7c4ee6] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!question.trim() || isLoading}
              type="submit"
            >
              Send
            </button>
          </form>
        </>
      )}
    </section>
  );
}
