---
name: vocabulary-audit
description: Use when checking whether two supposedly decoupled services share hidden semantic coupling — detecting shared domain vocabulary (OrderState, PaymentIntent, FulfillmentStatus) that no import statement reveals.
---

# Vocabulary Audit

Detect hidden semantic coupling between two service directories. Based on the Bavota et al. coupling research — when two services share domain terminology but have no explicit import dependency, they have a hidden "ley line" that will eventually cause integration pain.

## When to Use

- Auditing two services believed to be decoupled
- Before merging a refactor that splits a monolith
- During architecture reviews to surface undocumented shared concepts
- CI gate: fail the build when hidden coupling exceeds a threshold

## How to Run

```bash
python3 scripts/vocab_audit.py <serviceA_dir> <serviceB_dir> [options]
```

### Options

| Flag | Description |
|---|---|
| `--min-freq N` | Minimum combined frequency for a term (default: 1) |
| `--top N` | Show only the top N shared terms |
| `--ext LIST` | Comma-separated extensions to scan (overrides defaults) |
| `--threshold F` | Jaccard score threshold (0.0–1.0, default: 0.10) |
| `--json` | Machine-readable JSON output (CI-friendly) |

### Exit Codes

| Code | Meaning |
|---|---|
| `0` | Clean — no hidden coupling detected |
| `1` | Hidden semantic coupling detected (CI failure) |
| `2` | Usage error (bad args, missing directory) |

## Reading the Report

The report shows:

1. **Shared terms** ranked by combined frequency across both services
2. **Jaccard score** — what fraction of vocabulary is shared
3. **Import edge** — whether one service imports from the other
4. **Coupling verdict**: `hidden` (high overlap, no import), `explicit` (overlap + import), or `none`

## Remediation

If hidden coupling is detected, formalize the shared vocabulary into an explicit, versioned schema:
- Shared protobuf definition
- JSON Schema contract
- Published type package (npm, crate, gem, etc.)

The format matters less than making it visible and versioned.

## Example

```bash
# Audit two microservice directories
python3 scripts/vocab_audit.py services/order-service services/invoice-service

# CI-friendly JSON output with custom threshold
python3 scripts/vocab_audit.py services/a services/b --json --threshold 0.15
```
