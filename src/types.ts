export type ExtractedContent = {
  title: string;
  summary: string;
  key_concepts: string[];
  entities: string[];
  structure: string[];
};

export type ConceptNode = {
  id: string;
  label: string;
  type: string;
};

export type ConceptEdge = {
  from: string;
  to: string;
  relationship: string;
};

export type ConceptMap = {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
};

export type AgentAction = "extract_detail" | "find_connection" | "identify_gap";

export type AgentStep = {
  thought: string;
  action: AgentAction;
  observation: string;
  confidence: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type StageState = "locked" | "ready" | "loading" | "complete" | "error";
