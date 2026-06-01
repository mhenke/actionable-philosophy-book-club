#!/usr/bin/env python3
# skills/vocabulary-audit/scripts/vocab_audit.py
# Detect hidden semantic coupling between two service directories.
#
# Usage:
#   python3 scripts/vocab_audit.py <serviceA_dir> <serviceB_dir> [options]

import argparse
import json
import os
import re
import sys
from collections import Counter
from pathlib import Path

DEFAULT_EXTENSIONS = {
    ".js", ".ts", ".jsx", ".tsx", ".py", ".go", ".java", ".rb", ".rs",
    ".c", ".h", ".cpp", ".cs", ".php", ".kt", ".swift", ".scala",
    ".md", ".txt",
}

_STOP_WORDS = {
    # Programming keywords (language-agnostic common set)
    "abstract", "alignas", "alignof", "and", "and_eq", "any", "as",
    "assert", "async", "auto", "await", "become", "bitand", "bitor",
    "bool", "box", "break", "case", "catch", "char", "class", "co_await",
    "co_return", "co_yield", "compl", "concept", "const", "constexpr",
    "const_cast", "continue", "contract", "decltype", "def", "default",
    "defer", "define", "del", "delegate", "delete", "do", "double",
    "dyn", "dynamic_cast", "elif", "else", "enum", "except", "explicit",
    "export", "extends", "extern", "false", "final", "finally", "float",
    "fn", "for", "friend", "from", "func", "function", "get", "global",
    "goto", "if", "implements", "import", "in", "include", "inline",
    "instanceof", "int", "interface", "internal", "is", "let", "long",
    "loop", "macro", "match", "mod", "module", "move", "mut", "mutable",
    "namespace", "new", "noexcept", "not", "not_eq", "null", "nullptr",
    "object", "of", "operator", "or", "or_eq", "out", "override", "package",
    "partial", "pass", "print", "printf", "private", "protected", "protocol",
    "public", "raise", "ref", "register", "reinterpret_cast", "repeat",
    "require", "requires", "return", "sealed", "select", "self", "set",
    "short", "signed", "sizeof", "static", "static_cast", "strictfp",
    "string", "struct", "subscript", "super", "switch", "synchronized",
    "template", "then", "this", "throw", "throws", "trait", "true", "try",
    "type", "typedef", "typeid", "typename", "typeof", "union", "unless",
    "unsigned", "unsafe", "until", "use", "using", "var", "virtual",
    "void", "volatile", "when", "where", "while", "with", "xor", "xor_eq",
    "yield",
    # English stop words
    "about", "above", "after", "again", "all", "also", "am", "an",
    "any", "are", "because", "been", "before", "being", "below",
    "between", "both", "but", "by", "can", "could", "did", "does",
    "doing", "done", "each", "few", "find", "for", "found", "from",
    "further", "had", "has", "have", "having", "here", "how", "its",
    "just", "like", "made", "make", "making", "many", "may", "might",
    "more", "most", "much", "must", "need", "needs", "next", "nor",
    "not", "now", "once", "only", "other", "our", "own", "per",
    "put", "puts", "rather", "really", "same", "see", "seen", "shall",
    "should", "show", "shown", "some", "such", "than", "that", "the",
    "their", "them", "then", "there", "these", "they", "thing",
    "things", "those", "through", "thus", "too", "under", "upon",
    "used", "uses", "using", "very", "want", "wants", "was", "well",
    "were", "what", "when", "where", "which", "while", "who", "why",
    "will", "with", "would", "yet", "you", "your",
}

# Compiled at module level for speed
_SCREAMING_RE = re.compile(r"[A-Z][A-Z]+(?:_|$|[A-Z][a-z])")
_CAMEL_RE = re.compile(r"[a-z]+|[A-Z][a-z]*|\d+")
_IMPORT_RE = re.compile(
    r'(?:import|require\s*\(|include|use\s+[a-zA-Z])',
    re.IGNORECASE
)


def should_skip(path: str) -> bool:
    name = os.path.basename(path)
    if name.startswith("."):
        return True
    return name in (
        "node_modules", "vendor", ".git", "__pycache__",
        ".tox", "venv", ".venv", "dist", "build", "target",
        ".next", ".nuxt", ".output",
    )


def _split_identifier(token: str) -> list[str]:
    parts: list[str] = []

    # Split on underscores and hyphens first
    raw_segments = re.split(r"[_-]", token)
    for seg in raw_segments:
        if not seg:
            continue
        # SCREAMING_SNAKE segment (all uppercase, length > 1)
        if seg.isupper() and len(seg) > 1:
            for submatch in _SCREAMING_RE.findall(seg):
                cleaned = submatch.rstrip("_")
                if cleaned.isupper():
                    parts.append(cleaned.lower())
                else:
                    parts.extend(_CAMEL_RE.findall(cleaned))
        else:
            # CamelCase splitting via regex
            camel_parts = _CAMEL_RE.findall(seg)
            if camel_parts:
                parts.extend(p.lower() for p in camel_parts)
            else:
                parts.append(seg.lower())

    if not parts:
        parts.append(token.lower())

    result: list[str] = []
    for p in parts:
        kp = p.strip()
        if len(kp) >= 3 and kp not in _STOP_WORDS:
            result.append(kp)
    return result


def tokenize_content(text: str) -> list[str]:
    tokens: list[str] = []

    # Remove multi-line string literals
    text = re.sub(r'"""[\s\S]*?"""', " ", text)
    text = re.sub(r"'''[\s\S]*?'''", " ", text)

    # Remove single-line string literals (but keep comments intact)
    text = re.sub(r"'[^']*'", " ", text)
    text = re.sub(r'"[^"]*"', " ", text)
    text = re.sub(r'`[^`]*`', " ", text)

    # Remove block comments only (line comments contain useful vocabulary)
    text = re.sub(r"/\*[\s\S]*?\*/", " ", text)
    text = re.sub(r"<!--[\s\S]*?-->", " ", text)

    # Extract identifiers
    raw_tokens = re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", text)

    for token in raw_tokens:
        tokens.extend(_split_identifier(token))

    return tokens


def extract_nouns(directory: str, extensions: set[str]) -> tuple[set[str], Counter]:
    freq: Counter = Counter()
    dir_path = Path(directory)

    if not dir_path.is_dir():
        print(f"Error: not a directory: {directory}", file=sys.stderr)
        sys.exit(2)

    for root, dirs, files in os.walk(dir_path):
        dirs[:] = [d for d in dirs if not should_skip(os.path.join(root, d))]

        for filename in files:
            filepath = os.path.join(root, filename)
            ext = os.path.splitext(filename)[1].lower()

            if ext not in extensions:
                continue
            if should_skip(filename):
                continue

            try:
                with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                    text = f.read()
            except Exception as e:
                print(f"Warning: skipping unreadable file {filepath}: {e}", file=sys.stderr)
                continue

            tokens = tokenize_content(text)
            freq.update(tokens)

    return set(freq.keys()), freq


def jaccard_overlap(set_a: set[str], set_b: set[str]) -> float:
    intersection = set_a & set_b
    union = set_a | set_b
    if not union:
        return 0.0
    return len(intersection) / len(union)


def detect_import_edges(dir_a: str, dir_b: str) -> bool:
    name_a = os.path.basename(os.path.normpath(dir_a)).lower()
    name_b = os.path.basename(os.path.normpath(dir_b)).lower()

    def has_cross_reference(source_dir: str, target_name: str) -> bool:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if not should_skip(os.path.join(root, d))]
            for filename in files:
                ext = os.path.splitext(filename)[1].lower()
                if ext not in DEFAULT_EXTENSIONS:
                    continue
                filepath = os.path.join(root, filename)
                try:
                    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                        for line in f:
                            if _IMPORT_RE.search(line) and target_name in line.lower():
                                return True
                except Exception:
                    continue
        return False

    return has_cross_reference(dir_a, name_b) or has_cross_reference(dir_b, name_a)


def _format_report(
    shared_terms: list[tuple[str, int]],
    shared_set: set[str],
    noun_set_a: set[str],
    noun_set_b: set[str],
    score: float,
    has_import: bool,
    threshold: float,
    json_output: bool,
) -> str:
    verdict = "none"
    if score >= threshold:
        verdict = "explicit" if has_import else "hidden"

    if json_output:
        return json.dumps({
            "shared_terms_count": len(shared_set),
            "service_a_terms": len(noun_set_a),
            "service_b_terms": len(noun_set_b),
            "jaccard_score": round(score, 4),
            "has_import_edge": has_import,
            "threshold": threshold,
            "coupling_verdict": verdict,
            "shared_terms": [{"term": t, "combined_freq": f} for t, f in shared_terms],
        }, indent=2)

    lines = [
        "=" * 60,
        "VOCABULARY AUDIT REPORT",
        "=" * 60,
        "",
        f"  Service A: {noun_set_a}",
        f"  Service B: {noun_set_b}",
        f"  Service A terms: {len(noun_set_a)}",
        f"  Service B terms: {len(noun_set_b)}",
        f"  Shared terms:    {len(shared_set)}",
        f"  Jaccard score:   {score:.2%}",
        f"  Threshold:       {threshold:.0%}",
        "",
    ]

    if shared_terms:
        lines.append("  Shared terms (ranked by combined frequency):")
        for term, freq in shared_terms:
            lines.append(f"    - {term} (freq={freq})")
        lines.append("")

    lines.append(f"  Import edge: {'yes' if has_import else 'no'}")
    lines.append(f"  Coupling: {verdict}")

    if verdict == "hidden":
        lines.extend([
            "",
            "  \u26a0 HIDDEN SEMANTIC COUPLING DETECTED",
            "  Recommendation: Formalize shared vocabulary into an explicit,",
            "  versioned schema (protobuf, JSON Schema, shared type package).",
        ])
    elif verdict == "explicit":
        lines.extend([
            "",
            "  Shared vocabulary exists but is visible via an import edge.",
            "  No hidden coupling. Still consider formalizing shared terms.",
        ])
    else:
        lines.extend([
            "",
            "  Low overlap \u2014 no coupling concerns detected.",
        ])

    lines.extend(["", "=" * 60])
    return "\n".join(lines)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Detect hidden semantic coupling between two service directories."
    )
    parser.add_argument("service_a", help="Path to first service directory")
    parser.add_argument("service_b", help="Path to second service directory")
    parser.add_argument(
        "--min-freq", type=int, default=1,
        help="Minimum combined frequency for a term in the report (default: 1)"
    )
    parser.add_argument(
        "--top", type=int, default=None,
        help="Show only the top N shared terms by frequency"
    )
    parser.add_argument(
        "--ext", type=str, default=None,
        help="Comma-separated file extensions to scan (overrides defaults)"
    )
    parser.add_argument(
        "--threshold", type=float, default=0.10,
        help="Jaccard score threshold for flagging coupling (0.0-1.0, default: 0.10)"
    )
    parser.add_argument(
        "--json", action="store_true",
        help="Emit machine-readable JSON instead of text report"
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)

    if args.threshold < 0.0 or args.threshold > 1.0:
        print("Error: --threshold must be between 0.0 and 1.0", file=sys.stderr)
        sys.exit(2)

    if args.ext:
        extensions = {f".{e.strip().lstrip('.')}" for e in args.ext.split(",")}
    else:
        extensions = DEFAULT_EXTENSIONS

    nouns_a, freq_a = extract_nouns(args.service_a, extensions)
    nouns_b, freq_b = extract_nouns(args.service_b, extensions)

    if not nouns_a:
        print(f"Warning: no vocabulary extracted from {args.service_a}", file=sys.stderr)
    if not nouns_b:
        print(f"Warning: no vocabulary extracted from {args.service_b}", file=sys.stderr)

    score = jaccard_overlap(nouns_a, nouns_b)

    shared_set = nouns_a & nouns_b
    shared_ranked = [
        (term, freq_a.get(term, 0) + freq_b.get(term, 0))
        for term in shared_set
        if freq_a.get(term, 0) + freq_b.get(term, 0) >= args.min_freq
    ]
    shared_ranked.sort(key=lambda x: (-x[1], x[0]))

    if args.top and args.top < len(shared_ranked):
        shared_ranked = shared_ranked[:args.top]

    has_import = detect_import_edges(args.service_a, args.service_b)

    report = _format_report(
        shared_ranked, shared_set,
        nouns_a, nouns_b,
        score, has_import,
        args.threshold, args.json,
    )
    print(report)

    hidden = (score >= args.threshold) and not has_import
    sys.exit(1 if hidden else 0)


if __name__ == "__main__":
    main()
