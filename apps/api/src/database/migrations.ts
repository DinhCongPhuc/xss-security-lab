export const managementMigrations = [
  `
  CREATE TABLE labs (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL
  ) STRICT;
  CREATE TABLE test_cases (
    id TEXT PRIMARY KEY,
    lab_id TEXT NOT NULL REFERENCES labs(id),
    label TEXT NOT NULL,
    UNIQUE(lab_id, id)
  ) STRICT;
  CREATE TABLE experiment_logs (
    id INTEGER PRIMARY KEY,
    lab_id TEXT NOT NULL,
    test_case_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('vulnerable','secure')),
    state TEXT NOT NULL CHECK(state IN ('EXECUTED','PREVENTED','NORMAL','INCONCLUSIVE','ERROR')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_id, test_case_id) REFERENCES test_cases(lab_id, id)
  ) STRICT;
`,
];
