import "server-only";
import fs from "fs";
import path from "path";
import type {
  GoldenConcept,
  ScoringRubric,
  SearchFieldDef,
  TonalityDef,
} from "./types";

// Loads curated internal knowledge from disk. Everything the model is grounded on
// lives in /data and /docs so non-engineers can edit it without touching code.

const root = process.cwd();

function readJSON<T>(rel: string): T {
  const raw = fs.readFileSync(path.join(root, rel), "utf-8");
  return JSON.parse(raw) as T;
}

function readText(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf-8");
}

// Cache across requests in a single server process (cheap, files are small).
let cache: {
  searchFields: SearchFieldDef[];
  tonalities: TonalityDef[];
  goldenConcepts: GoldenConcept[];
  rubric: ScoringRubric;
  rules: string;
} | null = null;

export function getKnowledge() {
  if (cache) return cache;
  cache = {
    searchFields: readJSON<SearchFieldDef[]>("data/search_fields.json"),
    tonalities: readJSON<TonalityDef[]>("data/tonality_examples.json"),
    goldenConcepts: readJSON<GoldenConcept[]>("data/golden_concepts.json"),
    rubric: readJSON<ScoringRubric>("data/scoring_rubric.json"),
    rules: readText("docs/concept_writing_rules.md"),
  };
  return cache;
}

// Exposed for the client (UI selectors / tooltips) via a thin API or server component.
export function getSelectableMeta() {
  const k = getKnowledge();
  return {
    searchFields: k.searchFields.map(({ name, description, angle }) => ({
      name,
      description,
      angle,
    })),
    tonalities: k.tonalities.map(({ name, description, example_phrase }) => ({
      name,
      description,
      example_phrase,
    })),
  };
}
