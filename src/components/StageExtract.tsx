import type { ReactNode } from "react";
import type { ExtractedContent, StageState } from "../types";

type StageExtractProps = {
  rawText: string;
  value: ExtractedContent | null;
  state: StageState;
  error: string | null;
  onRawTextChange: (value: string) => void;
  onExtract: () => void;
};

const FieldCard = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="rounded-lg border border-omni-border bg-[#171724] p-4">
    <div className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
      {label}
    </div>
    {children}
  </div>
);

const TagList = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.length ? (
      items.map((item) => (
        <span
          className="rounded-full border border-omni-border bg-[#10101a] px-3 py-1 font-mono text-xs text-slate-200"
          key={item}
        >
          {item}
        </span>
      ))
    ) : (
      <span className="text-sm text-slate-500">No items found.</span>
    )}
  </div>
);

export default function StageExtract({
  rawText,
  value,
  state,
  error,
  onRawTextChange,
  onExtract,
}: StageExtractProps) {
  const isLoading = state === "loading";

  return (
    <section className="rounded-lg border border-omni-border bg-omni-card p-4 shadow-glow transition-all duration-300 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-omni-indigo">
            01 Extract
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Convert raw document text into structured intelligence.
          </h2>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-md bg-omni-indigo px-5 text-sm font-semibold text-white transition hover:bg-[#5558dc] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
          onClick={onExtract}
          type="button"
        >
          {isLoading ? "Extracting..." : rawText.trim() ? "Extract" : "Extract Sample"}
        </button>
      </div>

      <textarea
        className="min-h-52 w-full resize-y rounded-lg border border-omni-border bg-[#0f0f18] p-4 font-mono text-sm leading-6 text-slate-200 outline-none transition focus:border-omni-indigo"
        onChange={(event) => onRawTextChange(event.target.value)}
        placeholder="Paste raw text, OCR output, meeting notes, policy content, or any document body..."
        value={rawText}
      />

      {isLoading && (
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-300">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-omni-indigo border-t-transparent" />
          Claude is extracting the document schema.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p>{error}</p>
          <button
            className="mt-3 rounded-md border border-rose-400/40 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/10"
            onClick={onExtract}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {value && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <FieldCard label="Title">
            <h3 className="text-lg font-semibold text-white">{value.title}</h3>
          </FieldCard>
          <FieldCard label="Summary">
            <p className="text-sm leading-6 text-slate-300">{value.summary}</p>
          </FieldCard>
          <FieldCard label="Key Concepts">
            <TagList items={value.key_concepts} />
          </FieldCard>
          <FieldCard label="Entities">
            <TagList items={value.entities} />
          </FieldCard>
          <div className="md:col-span-2">
            <FieldCard label="Structure">
              <ol className="grid gap-2 sm:grid-cols-2">
                {value.structure.length ? (
                  value.structure.map((heading, index) => (
                    <li
                      className="rounded-md border border-omni-border bg-[#10101a] px-3 py-2 font-mono text-xs text-slate-300"
                      key={`${heading}-${index}`}
                    >
                      {String(index + 1).padStart(2, "0")} {heading}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No headings found.</li>
                )}
              </ol>
            </FieldCard>
          </div>
        </div>
      )}
    </section>
  );
}
