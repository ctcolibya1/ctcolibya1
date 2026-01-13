"""
Unit tests for Division Without Division Operator
"""

import unittest
import sys
from division_algorithms import (
    DivisionWithoutOperator,
    divide
)


class TestDivisionAlgorithms(unittest.TestCase):
    """Test all division algorithms"""

    def setUp(self):
        """Set up test cases"""
        self.test_cases = [
            # (dividend, divisor, expected_quotient, expected_remainder)
            (10, 3, 3, 1),
            (100, 7, 14, 2),
            (50, 5, 10, 0),
            (7, 10, 0, 7),
            (0, 5, 0, 0),
            (1000, 13, 76, 12),
            (999, 1, 999, 0),
            (12345, 678, 18, 141),
        ]

        self.negative_test_cases = [
            # (dividend, divisor, expected_quotient, expected_remainder)
            (-10, 3, -3, 1),
            (10, -3, -3, 1),
            (-10, -3, 3, 1),
            (-100, 7, -14, 2),
            (100, -7, -14, 2),
            (-100, -7, 14, 2),
            (-15, 4, -3, 3),
        ]

        self.methods = [
            'repeated_subtraction',
            'bit_shift',
            'multiplication',
            'recursive'
        ]

    def test_positive_division_all_methods(self):
        """Test positive number division with all methods"""
        for dividend, divisor, expected_q, expected_r in self.test_cases:
            for method in self.methods:
                with self.subTest(dividend=dividend, divisor=divisor, method=method):
                    quotient, remainder = divide(dividend, divisor, method)
                    self.assertEqual(quotient, expected_q,
                                   f"Quotient mismatch for {dividend}/{divisor} using {method}")
                    self.assertEqual(remainder, expected_r,
                                   f"Remainder mismatch for {dividend}/{divisor} using {method}")

    def test_negative_division_all_methods(self):
        """Test negative number division with all methods"""
        for dividend, divisor, expected_q, expected_r in self.negative_test_cases:
            for method in self.methods:
                with self.subTest(dividend=dividend, divisor=divisor, method=method):
                    quotient, remainder = divide(dividend, divisor, method)
                    self.assertEqual(quotient, expected_q,
                                   f"Quotient mismatch for {dividend}/{divisor} using {method}")

    def test_division_by_zero(self):
        """Test that division by zero raises ValueError"""
        for method in self.methods:
            with self.subTest(method=method):
                with self.assertRaises(ValueError):
                    divide(10, 0, method)

    def test_logarithm_method_positive(self):
        """Test logarithm method with positive numbers"""
        positive_cases = [(10, 3), (100, 7), (1000, 13)]

        for dividend, divisor in positive_cases:
            with self.subTest(dividend=dividend, divisor=divisor):
                quotient, remainder = divide(dividend, divisor, 'logarithm')
                # Verify the division property: dividend = quotient * divisor + remainder
                self.assertEqual(dividend, quotient * divisor + remainder)
                self.assertGreaterEqual(remainder, 0)
                self.assertLess(remainder, divisor)

    def test_logarithm_method_negative(self):
        """Test that logarithm method raises ValueError for negative numbers"""
        with self.assertRaises(ValueError):
            divide(-10, 3, 'logarithm')

        with self.assertRaises(ValueError):
            divide(10, -3, 'logarithm')

    def test_invalid_method(self):
        """Test that invalid method raises ValueError"""
        with self.assertRaises(ValueError):
            divide(10, 3, 'invalid_method')

    def test_repeated_subtraction(self):
        """Test repeated subtraction method specifically"""
        quotient, remainder = DivisionWithoutOperator.repeated_subtraction(17, 5)
        self.assertEqual(quotient, 3)
        self.assertEqual(remainder, 2)

    def test_bit_shift_method(self):
        """Test bit shift method specifically"""
        quotient, remainder = DivisionWithoutOperator.bit_shift_method(17, 5)
        self.assertEqual(quotient, 3)
        self.assertEqual(remainder, 2)

    def test_multiplication_method(self):
        """Test multiplication method specifically"""
        quotient, remainder = DivisionWithoutOperator.multiplication_method(17, 5)
        self.assertEqual(quotient, 3)
        self.assertEqual(remainder, 2)

    def test_recursive_method(self):
        """Test recursive method specifically"""
        quotient, remainder = DivisionWithoutOperator.recursive_method(17, 5)
        self.assertEqual(quotient, 3)
        self.assertEqual(remainder, 2)

    def test_large_numbers(self):
        """Test with large numbers"""
        large_test_cases = [
            (1000000, 7),
            (9999999, 123),
            (8765432, 9876),
        ]

        for dividend, divisor in large_test_cases:
            for method in ['bit_shift', 'multiplication', 'recursive']:
                with self.subTest(dividend=dividend, divisor=divisor, method=method):
                    quotient, remainder = divide(dividend, divisor, method)
                    # Verify division property
                    self.assertEqual(dividend, quotient * divisor + remainder)
                    self.assertGreaterEqual(remainder, 0)
                    self.assertLess(remainder, divisor)

    def test_division_properties(self):
        """Test mathematical properties of division"""
        test_values = [(100, 7), (50, 3), (1000, 13)]

        for dividend, divisor in test_values:
            for method in self.methods:
                with self.subTest(dividend=dividend, divisor=divisor, method=method):
                    quotient, remainder = divide(dividend, divisor, method)

                    # Property 1: dividend = quotient * divisor + remainder
                    self.assertEqual(dividend, quotient * divisor + remainder)

                    # Property 2: 0 <= remainder < divisor
                    self.assertGreaterEqual(remainder, 0)
                    self.assertLess(remainder, divisor)

    def test_edge_cases(self):
        """Test edge cases"""
        # Dividend equals divisor
        quotient, remainder = divide(5, 5, 'bit_shift')
        self.assertEqual(quotient, 1)
        self.assertEqual(remainder, 0)

        # Dividend less than divisor
        quotient, remainder = divide(3, 5, 'bit_shift')
        self.assertEqual(quotient, 0)
        self.assertEqual(remainder, 3)

        # Divisor is 1
        quotient, remainder = divide(100, 1, 'bit_shift')
        self.assertEqual(quotient, 100)
        self.assertEqual(remainder, 0)

        # Dividend is 1
        quotient, remainder = divide(1, 5, 'bit_shift')
        self.assertEqual(quotient, 0)
        self.assertEqual(remainder, 1)


class TestDivisionConsistency(unittest.TestCase):
    """Test that all methods produce consistent results"""

    def test_all_methods_agree(self):
        """Test that all methods produce the same results for various inputs"""
        test_cases = [
            (100, 7),
            (50, 3),
            (1000, 13),
            (9999, 123),
            (-100, 7),
            (100, -7),
            (-100, -7),
        ]

        methods = ['repeated_subtraction', 'bit_shift', 'multiplication', 'recursive']

        for dividend, divisor in test_cases:
            with self.subTest(dividend=dividend, divisor=divisor):
                results = []
                for method in methods:
                    quotient, remainder = divide(dividend, divisor, method)
                    results.append((quotient, remainder))

                # All results should be the same
                self.assertEqual(len(set(results)), 1,
                               f"Methods produced different results for {dividend}/{divisor}: {results}")


def run_tests():
    """Run all tests"""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add all test cases
    suite.addTests(loader.loadTestsFromTestCase(TestDivisionAlgorithms))
    suite.addTests(loader.loadTestsFromTestCase(TestDivisionConsistency))

    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
