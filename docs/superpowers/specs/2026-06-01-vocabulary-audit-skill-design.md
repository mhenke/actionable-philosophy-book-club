# Vocabulary Audit Skill Design

This document specifies a standalone, installable `vocabulary-audit` skill that automates
the meeting-03 Vocabulary Audit worksheet (`meetings/meeting-03/03-vocabulary-audit.md`).
The skill detects hidden semantic coupling between two supposedly decoupled services by
comparing their domain vocabulary.

## Background

The worksheet (sourced from the Bavota et al. coupling reading in
`meetings/meeting-03/resources/03-reading-bavota-coupling.pdf`) defines four manual steps:

1. Extract the nouns from both services' interfaces, names, and comments.
2. Calculate the set overlap (intersection).
3. Identify silent coupling: high shared-term density with no `import` dependency = hidden ley line.
4. Formalize the contract: encode the shared vocabulary into an explicit, versioned schema.

This skill turns those four manual steps into a deterministic, runnable tool plus agent guidance.

## Goals

- Automate the worksheet end-to-end: point at two directories, get a coupling report.
- Be language-agnostic (regex-based extraction), so it runs on any codebase.
- Ship as a standalone, independently installable skill via the `skills` CLI
  (`npx skills add actionable-philosophy-book-club`), parallel to but independent of
  `asset-compressor`.

## Non-Goals

- No language-specific AST parsing (regex tokenization only; see Risks).
- No automatic schema generation; the skill points the user to formalize a contract.
- Not bundled with or dependent on `asset-compressor`.

## Skill Package Shape

A standalone top-level directory, mirroring the self-contained, script-bearing pattern of
`asset-compressor/`, but as an independent installable unit:

```text
vocabulary-audit/
  SKILL.md                  # frontmatter + when/how to run
  scripts/
    vocab_audit.py          # deterministic engine (stdlib only)
```

Distribution artifacts:

- Packaged into `vocabulary-audit.skill` (a zip of `SKILL.md` + `scripts/`), matching the
  existing `asset-compressor.skill` archive format.
- Gets its own entry in `skills-lock.json`, independent of any other skill.
- Repo-root `README.md` updated to list `vocabulary-audit` as an installable skill.

Rationale: the repo already establishes the `skills` CLI convention (`skills-lock.json`,
`.claude/skills/` symlinks, `.skill` zip archives). The skill follows that convention so it
stays consistent with `impeccable` and `asset-compressor` rather than inventing a new layout.

## SKILL.md

Frontmatter (lowercase-hyphen name; description states *when*, not the workflow, per
writing-skills CSO guidance):

```md
---
name: vocabulary-audit
description: Use when checking whether two supposedly decoupled services share hidden semantic coupling — detecting shared domain vocabulary (OrderState, PaymentIntent, FulfillmentStatus) that no import statement reveals.
---
```

Body covers:

- What semantic coupling is (1-2 sentences grounded in the Bavota reading).
- When to run it (auditing two services believed to be decoupled).
- The exact command to invoke `vocab_audit.py`.
- How to read the report (shared terms, scores, import-edge verdict).
- The remediation step: encode the shared vocabulary into an explicit, versioned schema
  (shared protobuf, JSON Schema contract, or published type package).

## The Engine: `scripts/vocab_audit.py`

Language-agnostic, Python 3 standard library only (no pip dependencies), self-contained —
consistent with `asset-compressor`'s scripts. One function per worksheet step.

### Step 1 — Extract nouns

- Recursively walk each service directory.
- Restrict to common code/text extensions by default
  (`.js .ts .jsx .tsx .py .go .java .rb .rs .c .h .cpp .cs .php .kt .swift .scala .md .txt`);
  override with `--ext`.
- For each file, extract candidate tokens: identifiers from code and words from comments.
- Split compound identifiers: `CamelCase`, `snake_case`, `kebab-case`, `SCREAMING_CASE`
  into component tokens.
- Lowercase all tokens.
- Strip a built-in stop-word list: programming keywords (`function return class def const let
  var import export if else for while …`) plus common English stop words.
- Drop tokens shorter than a minimum length (default 3 chars).
- Result: a frequency map (token -> count) per service. The map's keys form the noun set
  used for overlap (Step 2); the counts are retained for frequency ranking in the report
  (Step 4). "Combined frequency" for a shared term = its count in service A plus its count
  in service B.

### Step 2 — Calculate overlap

- Compute the set intersection of the two services' noun sets.
- Compute an overlap score: `|A ∩ B| / |A ∪ B|` (Jaccard), reported as a percentage.

### Step 3 — Identify silent coupling

- Regex-scan both services for cross-import edges: lines matching
  `import` / `require(` / `include` / `use` that reference the other service's directory
  name or path.
- Decision: if shared-term density is high (overlap score above a threshold, default
  configurable) AND no cross-import edge exists between the two services, flag as
  **hidden semantic coupling**.
- If an import edge exists, the coupling is explicit (visible), not hidden — report but do
  not flag.

### Step 4 — Report

Human-readable report (default) containing:

- The shared domain terms, ranked by combined frequency, filtered by `--min-freq`.
- The overlap (Jaccard) score.
- The import-edge verdict (hidden vs. explicit vs. none).
- A remediation pointer: formalize the shared vocabulary into a versioned schema.

`--json` emits the same data as machine-readable JSON for CI integration.

### CLI

```text
python3 scripts/vocab_audit.py <serviceA_dir> <serviceB_dir> [options]

Options:
  --min-freq N    Minimum combined frequency for a term to appear in the report (default 1)
  --top N         Show only the top N shared terms by frequency (default: all)
  --ext LIST      Comma-separated file extensions to scan (overrides defaults)
  --threshold F   Overlap score (0.0-1.0) above which coupling is flagged (default 0.10)
  --json          Emit machine-readable JSON instead of the text report
```

### Exit codes

- `0` — clean (no hidden coupling detected).
- `1` — hidden semantic coupling detected (CI-friendly failure signal).
- `2` — usage error (bad args, missing directory).

## Data Flow

```text
serviceA_dir ─┐
              ├─> extract_nouns() ─> setA, freqA ─┐
serviceB_dir ─┘                                   ├─> overlap() ─> shared, score ─┐
              └─> extract_nouns() ─> setB, freqB ─┘                               │
                                                                                  ├─> report()
serviceA_dir, serviceB_dir ─> detect_import_edges() ─> edge_exists ───────────────┘
```

## Error Handling

- Missing or non-directory arguments -> exit `2` with a usage message to stderr.
- Unreadable / binary files -> skipped with a warning to stderr; the walk continues.
- Empty services (no extractable nouns) -> exit `0` with a "no vocabulary found" note.

## Testing (writing-skills = TDD)

### Engine unit tests

Fixture directories under the test tree:

- **Hidden-coupling fixture:** two service dirs sharing planted domain terms
  (e.g. `OrderState`, `PaymentIntent`) with NO cross-import. Assert exit code `1` and that
  the shared terms appear in the report.
- **Explicit-coupling control:** same shared terms but WITH a cross-import edge. Assert the
  coupling is reported as explicit and exit code is `0` (not flagged as hidden).
- **No-overlap control:** two dirs with disjoint vocabulary. Assert exit code `0` and empty
  shared-term list.
- **Tokenization unit:** assert `CamelCase` / `snake_case` / `kebab-case` splitting and
  stop-word stripping behave as specified.
- **Usage errors:** missing dir -> exit `2`.

### Skill behavior test

Per writing-skills RED-GREEN: baseline a subagent against the worksheet WITHOUT the skill
(document behavior), then WITH the skill, and verify the agent invokes `vocab_audit.py`
correctly and interprets the report.

## Distribution & Verification

- Package `vocabulary-audit/` into `vocabulary-audit.skill` (zip of `SKILL.md` + `scripts/`).
- Add the skill's entry to `skills-lock.json`.
- Update repo-root `README.md` to document the installable skill.
- Verify installation two ways to catch layout issues early:
  - Repo shorthand: `npx skills add actionable-philosophy-book-club`.
  - Direct path to the skill folder.

## Risks & Mitigations

- **Regex tokenization is noisier than AST parsing.** Mitigated by the stop-word list,
  minimum token length, `--min-freq` filtering, and `--ext` scoping. Acceptable because the
  audit is a heuristic signal, not a proof.
- **Import-edge detection is heuristic across languages.** Mitigated by matching multiple
  import syntaxes and falling back to "no edge found" (which biases toward flagging, the safe
  direction for an audit).
- **Threshold tuning.** The default `--threshold` may need adjustment per codebase; exposed
  as a CLI flag rather than hardcoded.
