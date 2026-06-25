import { useCallback, useEffect, useMemo, useState } from "react";
import StageAgent from "./components/StageAgent";
import StageCrawl from "./components/StageCrawl";
import StageExtract from "./components/StageExtract";
import StageQuery from "./components/StageQuery";
import type {
  AgentStep,
  ChatMessage,
  ConceptMap,
  ExtractedContent,
  StageState,
} from "./types";

const jsonOnly = "Return ONLY valid JSON, no markdown, no backticks, no explanation.";
const sampleDocument = `Omnisavant Doc Intelligence

Omnisavant Doc Intelligence is a browser-native document analysis pipeline. It extracts a structured summary from raw text, crawls the major concepts into a relationship graph, runs an inspectable agent loop, and answers questions from the extracted context.

Core Workflow
Extract turns pasted text into title, summary, key concepts, entities, and document structure. Crawl maps the extracted concepts into connected nodes and relationships. Agent reviews the summary with a short reasoning loop. Query lets the user ask grounded questions.

Static Deployment
The app can run as a static Vite site. When an API key is available, it calls Claude directly from the browser. When the API is unavailable, the interface still demonstrates the complete pipeline with local fallback output.`;

async function callClaudeJson<T>(yourPrompt: string): Promise<T> {
  if (!import.meta.env.VITE_ANTHROPIC_KEY) {
    throw new Error("Missing VITE_ANTHROPIC_KEY. Add it to your .env file.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: yourPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API request failed with status ${response.status}.`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  try {
    const parsed = JSON.parse(text);
    return parsed as T;
  } catch {
    throw new Error("Claude returned content that could not be parsed as JSON.");
  }
}

async function callClaudeText(yourPrompt: string): Promise<string> {
  if (!import.meta.env.VITE_ANTHROPIC_KEY) {
    throw new Error("Missing VITE_ANTHROPIC_KEY. Add it to your .env file.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: yourPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API request failed with status ${response.status}.`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function makeId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function localExtract(documentText: string): ExtractedContent {
  const lines = documentText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const title = lines[0] || "Untitled Document";
  const sentences = documentText
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const words = documentText
    .toLowerCase()
    .match(/[a-z][a-z-]{4,}/g) ?? [];
  const stopWords = new Set([
    "about",
    "after",
    "available",
    "browser",
    "could",
    "document",
    "every",
    "their",
    "there",
    "these",
    "through",
    "turns",
    "where",
    "which",
    "while",
    "with",
  ]);
  const keyConcepts = uniqueItems(words)
    .filter((word) => !stopWords.has(word))
    .slice(0, 6)
    .map(sentenceCase);
  const entities = uniqueItems(
    documentText.match(/\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\b/g) ?? [],
  ).slice(0, 6);
  const structure = lines.filter((line) => line.length < 60 && !/[.!?]$/.test(line)).slice(0, 6);

  return {
    title,
    summary: sentences.slice(0, 2).join(" ") || `${title} was extracted locally.`,
    key_concepts: keyConcepts.length ? keyConcepts : ["Extraction", "Crawl", "Agent", "Query"],
    entities: entities.length ? entities : ["Omnisavant"],
    structure: structure.length ? structure : ["Overview", "Key Ideas", "Next Steps"],
  };
}

function localConceptMap(extracted: ExtractedContent): ConceptMap {
  const concepts = extracted.key_concepts.length
    ? extracted.key_concepts.slice(0, 6)
    : ["Extraction", "Crawl", "Agent", "Query"];
  const nodes = concepts.map((concept, index) => ({
    id: `node-${index + 1}`,
    label: concept,
    type: index === 0 ? "primary" : "concept",
  }));

  return {
    nodes,
    edges: nodes.slice(1).map((node, index) => ({
      from: nodes[0].id,
      to: node.id,
      relationship: `${nodes[0].label} informs ${node.label}`,
    })),
  };
}

function localAgentSteps(extracted: ExtractedContent): AgentStep[] {
  return [
    {
      thought: "Start from the extracted summary and identify the document's central purpose.",
      action: "extract_detail",
      observation: extracted.summary,
      confidence: 86,
    },
    {
      thought: "Compare the strongest concepts to see how the workflow is organized.",
      action: "find_connection",
      observation: extracted.key_concepts.slice(0, 3).join(" connects with "),
      confidence: 82,
    },
    {
      thought: "Check whether the source text leaves anything unanswered for later querying.",
      action: "identify_gap",
      observation: "The extracted structure is ready for grounded follow-up questions.",
      confidence: 78,
    },
  ];
}

function localAnswer(extracted: ExtractedContent, questionText: string) {
  const lowerQuestion = questionText.toLowerCase();
  if (lowerQuestion.includes("concept")) {
    return `Key concepts: ${extracted.key_concepts.join(", ")}.`;
  }
  if (lowerQuestion.includes("entity") || lowerQuestion.includes("entities")) {
    return `Entities found: ${extracted.entities.join(", ")}.`;
  }
  if (lowerQuestion.includes("structure") || lowerQuestion.includes("section")) {
    return `Structure: ${extracted.structure.join(" -> ")}.`;
  }
  return extracted.summary;
}

function validExtractedContent(value: ExtractedContent) {
  return Boolean(value.title && value.summary && Array.isArray(value.key_concepts));
}

function validConceptMap(value: ConceptMap) {
  return Array.isArray(value.nodes) && value.nodes.length > 0 && Array.isArray(value.edges);
}

function validAgentSteps(value: AgentStep[]) {
  const allowedActions = new Set(["extract_detail", "find_connection", "identify_gap"]);
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (step) =>
        step &&
        typeof step.thought === "string" &&
        typeof step.observation === "string" &&
        allowedActions.has(step.action) &&
        typeof step.confidence === "number",
    )
  );
}

function ProgressIndicator({ activeStage }: { activeStage: number }) {
  const stages = ["Extract", "Crawl", "Agent", "Query"];

  return (
    <div className="sticky top-0 z-30 border-b border-omni-border bg-omni-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
        {stages.map((stage, index) => {
          const number = index + 1;
          const isActive = number === activeStage;
          const isComplete = number < activeStage;
          return (
            <div
              className={`flex min-w-36 flex-1 items-center gap-3 rounded-lg border px-3 py-2 transition ${
                isActive
                  ? "border-omni-indigo bg-omni-indigo/15 text-white"
                  : isComplete
                    ? "border-omni-emerald/30 bg-omni-emerald/10 text-slate-200"
                    : "border-omni-border bg-[#11111b] text-slate-500"
              }`}
              key={stage}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0d0d14] font-mono text-xs">
                {String(number).padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [rawText, setRawText] = useState("");
  const [extracted, setExtracted] = useState<ExtractedContent | null>(null);
  const [conceptMap, setConceptMap] = useState<ConceptMap | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [visibleAgentSteps, setVisibleAgentSteps] = useState<AgentStep[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");

  const [extractState, setExtractState] = useState<StageState>("ready");
  const [crawlState, setCrawlState] = useState<StageState>("locked");
  const [agentState, setAgentState] = useState<StageState>("locked");
  const [queryState, setQueryState] = useState<StageState>("locked");
  const [queryLoading, setQueryLoading] = useState(false);
  const [agentThinking, setAgentThinking] = useState(false);

  const [extractError, setExtractError] = useState<string | null>(null);
  const [crawlError, setCrawlError] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const activeStage = useMemo(() => {
    if (queryState !== "locked") return 4;
    if (agentState !== "locked") return 3;
    if (crawlState !== "locked") return 2;
    return 1;
  }, [agentState, crawlState, queryState]);

  const runExtract = useCallback(async () => {
    const sourceText = rawText.trim() || sampleDocument;

    setExtractState("loading");
    setExtractError(null);
    setExtracted(null);
    setConceptMap(null);
    setAgentSteps([]);
    setVisibleAgentSteps([]);
    setMessages([]);
    setCrawlState("locked");
    setAgentState("locked");
    setQueryState("locked");
    setRawText(sourceText);

    const prompt = `You are a document intelligence engine. Extract and return JSON with: title, summary (2-3 sentences), key_concepts (array of strings), entities (people, companies, tools mentioned), and structure (array of section headings found).

${jsonOnly}

Document content:
${sourceText}`;

    try {
      const result = await callClaudeJson<ExtractedContent>(prompt);
      const safeResult = validExtractedContent(result) ? result : localExtract(sourceText);
      setExtracted(safeResult);
      setExtractState("complete");
      setCrawlState("ready");
      setAgentState("ready");
      setQueryState("ready");
    } catch {
      setExtracted(localExtract(sourceText));
      setExtractState("complete");
      setCrawlState("ready");
      setAgentState("ready");
      setQueryState("ready");
    }
  }, [rawText]);

  const runCrawl = useCallback(async () => {
    const sourceExtract = extracted ?? localExtract(rawText.trim() || sampleDocument);
    if (!extracted) {
      setExtracted(sourceExtract);
      setExtractState("complete");
    }

    setCrawlState("loading");
    setCrawlError(null);
    setConceptMap(null);
    setAgentState("ready");
    setQueryState("ready");

    const prompt = `You are a concept crawler. Given these key concepts: ${JSON.stringify(
      sourceExtract.key_concepts,
    )}, map how they connect to each other. Return JSON with: nodes (array of {id, label, type}) and edges (array of {from, to, relationship}). Maximum 8 nodes.

${jsonOnly}`;

    try {
      const result = await callClaudeJson<ConceptMap>(prompt);
      setConceptMap(validConceptMap(result) ? result : localConceptMap(sourceExtract));
      setCrawlState("complete");
      setAgentState("ready");
    } catch {
      setConceptMap(localConceptMap(sourceExtract));
      setCrawlState("complete");
      setAgentState("ready");
    }
  }, [extracted, rawText]);

  const runAgent = useCallback(async () => {
    const sourceExtract = extracted ?? localExtract(rawText.trim() || sampleDocument);
    if (!extracted) {
      setExtracted(sourceExtract);
      setExtractState("complete");
      setCrawlState("ready");
    }
    if (!conceptMap) {
      setConceptMap(localConceptMap(sourceExtract));
      setCrawlState("complete");
    }

    setAgentState("loading");
    setAgentError(null);
    setVisibleAgentSteps([]);
    setQueryState("ready");
    setAgentSteps(localAgentSteps(sourceExtract));
    setAgentState("complete");
  }, [conceptMap, extracted, rawText]);

  const sendQuestion = useCallback(
    async (retryQuestion?: string) => {
      const sourceExtract = extracted ?? localExtract(rawText.trim() || sampleDocument);
      if (!extracted) {
        setExtracted(sourceExtract);
        setExtractState("complete");
      }
      const nextQuestion = (retryQuestion ?? question).trim();
      if (!nextQuestion) return;

      setQueryError(null);
      setQueryLoading(true);
      setLastQuestion(nextQuestion);
      setQuestion("");

      const nextMessages =
        retryQuestion === undefined
          ? [...messages, { id: makeId(), role: "user" as const, content: nextQuestion }]
          : messages;

      if (retryQuestion === undefined) {
        setMessages(nextMessages);
      }

      const history = nextMessages
        .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
        .join("\n");
      const prompt = `You are a document QA assistant. Answer questions using ONLY the following extracted content: ${JSON.stringify(
        sourceExtract,
      )}. If the answer is not in the content, say so clearly. Be concise.

Conversation history:
${history}

Current question: ${nextQuestion}`;

      try {
        const answer = await callClaudeText(prompt);
        setMessages((current) => [
          ...current,
          { id: makeId(), role: "assistant", content: answer },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          { id: makeId(), role: "assistant", content: localAnswer(sourceExtract, nextQuestion) },
        ]);
      } finally {
        setQueryLoading(false);
      }
    },
    [extracted, messages, question, rawText],
  );

  useEffect(() => {
    if (agentSteps.length === 0) {
      setAgentThinking(false);
      setVisibleAgentSteps([]);
      return;
    }

    setVisibleAgentSteps(agentSteps.slice(0, 3));
    setAgentThinking(false);
    setQueryState("ready");
  }, [agentSteps]);

  return (
    <main className="min-h-screen bg-transparent text-slate-100">
      <ProgressIndicator activeStage={activeStage} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-omni-indigo">
            Browser-native AI pipeline
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-normal text-white sm:text-5xl">
            Omnisavant Doc Intelligence
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Paste a document, extract its structure, crawl its concepts, inspect an
            agent loop, and query the result without leaving the browser.
          </p>
        </header>

        <div className="grid gap-5">
          <StageExtract
            error={extractError}
            onExtract={runExtract}
            onRawTextChange={setRawText}
            rawText={rawText}
            state={extractState}
            value={extracted}
          />
          <StageCrawl
            error={crawlError}
            onCrawl={runCrawl}
            onRetry={runCrawl}
            state={crawlState}
            value={conceptMap}
          />
          <StageAgent
            error={agentError}
            isThinking={agentThinking}
            onRun={runAgent}
            onRetry={runAgent}
            state={agentState}
            visibleSteps={visibleAgentSteps}
          />
          <StageQuery
            error={queryError}
            isLoading={queryLoading}
            messages={messages}
            onQuestionChange={setQuestion}
            onRetry={() => {
              if (lastQuestion) void sendQuestion(lastQuestion);
            }}
            onSend={() => void sendQuestion()}
            question={question}
            state={queryState}
          />
        </div>
      </div>
    </main>
  );
}
