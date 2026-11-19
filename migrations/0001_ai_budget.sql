CREATE TABLE ai_budget_charges (
  request_id TEXT PRIMARY KEY,
  budget_scope TEXT NOT NULL,
  micro_yuan INTEGER NOT NULL CHECK (micro_yuan >= 0),
  settled INTEGER NOT NULL DEFAULT 0 CHECK (settled IN (0, 1))
);
CREATE INDEX ai_budget_scope ON ai_budget_charges(budget_scope, micro_yuan);
