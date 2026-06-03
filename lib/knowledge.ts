import "server-only";
import goldenConcepts from "@/data/golden_concepts.json";
import searchFields from "@/data/search_fields.json";
import tonalities from "@/data/tonality_examples.json";
import scoringRubric from "@/data/scoring_rubric.json"
import type {
  GoldenConcept,
  ScoringRubric,
  SearchFieldDef,
  TonalityDef,
} from "./types";

// Loads curated internal knowledge from disk. Everything the model is grounded on
// lives in /data and /docs so non-engineers can edit it without touching code.

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
  searchFields,
  tonalities,
  goldenConcepts,
  rubric: scoringRubric,
  rules: "",
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
