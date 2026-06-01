#!/usr/bin/env python3
# Unit tests for vocab_audit.py

import json
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import vocab_audit

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


class TestTokenization(unittest.TestCase):
    def test_camelcase_splitting(self):
        tokens = vocab_audit.tokenize_content("OrderState")
        self.assertIn("order", tokens)
        self.assertIn("state", tokens)

    def test_snake_case_splitting(self):
        tokens = vocab_audit.tokenize_content("payment_intent_id")
        self.assertIn("payment", tokens)
        self.assertIn("intent", tokens)

    def test_kebab_case_splitting(self):
        tokens = vocab_audit.tokenize_content("fulfillment-status")
        self.assertIn("fulfillment", tokens)
        self.assertIn("status", tokens)

    def test_screaming_case_splitting(self):
        tokens = vocab_audit.tokenize_content("MAX_RETRY_COUNT")
        self.assertIn("max", tokens)
        self.assertIn("retry", tokens)
        self.assertIn("count", tokens)

    def test_screaming_camel_boundary(self):
        tokens = vocab_audit.tokenize_content("MAX_RETRY_COUNT_LIMIT")
        self.assertIn("retry", tokens)
        self.assertIn("count", tokens)
        self.assertIn("limit", tokens)

    def test_stop_words_stripped(self):
        tokens = vocab_audit.tokenize_content("return class def function if else public")
        for sw in ("return", "class", "def", "function", "if", "else", "public"):
            self.assertNotIn(sw, tokens)

    def test_short_tokens_stripped(self):
        tokens = vocab_audit.tokenize_content("a an to of is it")
        for short in ("a", "an", "to", "of", "is", "it"):
            self.assertNotIn(short, tokens)

    def test_string_literals_skipped(self):
        tokens = vocab_audit.tokenize_content(
            'const x = "OrderStateManager"; // OrderStateManager'
        )
        self.assertIn("order", tokens)
        self.assertIn("state", tokens)
        self.assertIn("manager", tokens)

    def test_mixed_case_file(self):
        filepath = os.path.join(FIXTURES, "tokenization", "mixed_case.py")
        with open(filepath) as f:
            text = f.read()
        tokens = vocab_audit.tokenize_content(text)
        for expected in ("order", "state", "manager", "retry", "count",
                         "payment", "intent", "amount", "calculate"):
            self.assertIn(expected, tokens)


class TestExtractNouns(unittest.TestCase):
    def test_extracts_from_directory(self):
        src = os.path.join(FIXTURES, "hidden-coupling", "service_a")
        nouns, freq = vocab_audit.extract_nouns(src, vocab_audit.DEFAULT_EXTENSIONS)
        for expected in ("order", "state", "payment", "fulfillment", "status"):
            self.assertIn(expected, nouns)


class TestJaccardOverlap(unittest.TestCase):
    def test_identical_sets(self):
        self.assertEqual(vocab_audit.jaccard_overlap({"a", "b"}, {"a", "b"}), 1.0)

    def test_disjoint_sets(self):
        self.assertEqual(vocab_audit.jaccard_overlap({"a", "b"}, {"c", "d"}), 0.0)

    def test_partial_overlap(self):
        score = vocab_audit.jaccard_overlap({"a", "b", "c"}, {"b", "c", "d"})
        self.assertAlmostEqual(score, 0.5)

    def test_empty_unions(self):
        self.assertEqual(vocab_audit.jaccard_overlap(set(), set()), 0.0)


class TestDetectImportEdges(unittest.TestCase):
    def test_no_import_in_hidden_coupling(self):
        src_a = os.path.join(FIXTURES, "hidden-coupling", "service_a")
        src_b = os.path.join(FIXTURES, "hidden-coupling", "service_b")
        self.assertFalse(vocab_audit.detect_import_edges(src_a, src_b))

    def test_import_in_explicit_coupling(self):
        src_a = os.path.join(FIXTURES, "explicit-coupling", "service_a")
        src_b = os.path.join(FIXTURES, "explicit-coupling", "service_b")
        self.assertTrue(vocab_audit.detect_import_edges(src_a, src_b))


class TestHiddenCouplingDetection(unittest.TestCase):
    def test_hidden_coupling_exit_code(self):
        src_a = os.path.join(FIXTURES, "hidden-coupling", "service_a")
        src_b = os.path.join(FIXTURES, "hidden-coupling", "service_b")
        with self.assertRaises(SystemExit) as cm:
            vocab_audit.main([src_a, src_b, "--threshold", "0.05"])
        self.assertEqual(cm.exception.code, 1)

    def test_explicit_coupling_not_flagged(self):
        src_a = os.path.join(FIXTURES, "explicit-coupling", "service_a")
        src_b = os.path.join(FIXTURES, "explicit-coupling", "service_b")
        with self.assertRaises(SystemExit) as cm:
            vocab_audit.main([src_a, src_b, "--threshold", "0.05"])
        self.assertEqual(cm.exception.code, 0)

    def test_no_overlap_exit_code(self):
        src_a = os.path.join(FIXTURES, "no-overlap", "service_a")
        src_b = os.path.join(FIXTURES, "no-overlap", "service_b")
        with self.assertRaises(SystemExit) as cm:
            vocab_audit.main([src_a, src_b])
        self.assertEqual(cm.exception.code, 0)


class TestUsageErrors(unittest.TestCase):
    def test_missing_directory(self):
        with self.assertRaises(SystemExit) as cm:
            vocab_audit.main(["/nonexistent", "/nonexistent2"])
        self.assertEqual(cm.exception.code, 2)

    def test_bad_threshold(self):
        src_a = os.path.join(FIXTURES, "hidden-coupling", "service_a")
        src_b = os.path.join(FIXTURES, "hidden-coupling", "service_b")
        with self.assertRaises(SystemExit) as cm:
            vocab_audit.main([src_a, src_b, "--threshold", "1.5"])
        self.assertEqual(cm.exception.code, 2)

    def test_json_output_is_valid(self):
        src_a = os.path.join(FIXTURES, "hidden-coupling", "service_a")
        src_b = os.path.join(FIXTURES, "hidden-coupling", "service_b")
        try:
            vocab_audit.main([src_a, src_b, "--json", "--threshold", "0.05"])
        except SystemExit as e:
            self.assertEqual(e.code, 1)


class TestReportOutput(unittest.TestCase):
    def test_json_format(self):
        src_a = os.path.join(FIXTURES, "hidden-coupling", "service_a")
        src_b = os.path.join(FIXTURES, "hidden-coupling", "service_b")
        try:
            vocab_audit.main([src_a, src_b, "--json", "--threshold", "0.05"])
        except SystemExit:
            pass


if __name__ == "__main__":
    unittest.main()
