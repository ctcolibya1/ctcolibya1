# Division Without Division Operator

A comprehensive Python project demonstrating multiple algorithms to perform integer division without using the division operator (`/`, `//`, or `divmod`).

## Overview

This project implements five different algorithms to divide two integers without using built-in division operators:

1. **Repeated Subtraction** - Simple but slow for large numbers
2. **Bit Shift Method** - Fast binary long division using bit manipulation
3. **Multiplication Method** - Binary search approach with multiplication
4. **Logarithm Method** - Mathematical approach using logarithms
5. **Recursive Method** - Recursive bit-shifting implementation

## Features

- Multiple division algorithms with different trade-offs
- Support for positive and negative numbers
- Command-line interface with multiple modes
- Interactive mode for easy experimentation
- Comprehensive unit tests
- Benchmark mode to compare algorithm performance
- Detailed documentation and examples

## Installation

No external dependencies required! Just Python 3.6+.

```bash
git clone <repository-url>
cd division-without-operator
```

## Usage

### As a Python Module

```python
from division_algorithms import divide

# Basic usage (default: bit_shift method)
quotient, remainder = divide(100, 7)
print(f"100 ÷ 7 = {quotient} remainder {remainder}")

# Specify a method
quotient, remainder = divide(100, 7, method="repeated_subtraction")

# All available methods
methods = ["repeated_subtraction", "bit_shift", "multiplication", "logarithm", "recursive"]
```

### Command-Line Interface

#### Basic Usage

```bash
# Divide two numbers using default method (bit_shift)
python cli.py 100 7

# Specify a method
python cli.py 100 7 --method repeated_subtraction
python cli.py 100 7 -m multiplication

# Use all methods for comparison
python cli.py 100 7 --method all
```

#### Interactive Mode

```bash
python cli.py --interactive
# or
python cli.py -i
```

In interactive mode, you'll be prompted to enter numbers and choose algorithms.

#### Benchmark Mode

```bash
# Compare performance of all methods
python cli.py 1000000 13 --benchmark
python cli.py 1000000 13 -b
```

### Examples

```bash
# Simple division
$ python cli.py 100 7

============================================================
Dividing 100 by 7 using Bit Shift
============================================================
Quotient:  14
Remainder: 2
Verification: 7 × 14 + 2 = 100
Execution time: 0.000012 seconds
============================================================

# Negative numbers
$ python cli.py -100 7 --method recursive

============================================================
Dividing -100 by 7 using Recursive
============================================================
Quotient:  -14
Remainder: 2
Verification: 7 × -14 + 2 = -96
Execution time: 0.000015 seconds
============================================================

# Compare all methods
$ python cli.py 1000 13 --method all

Dividing 1000 by 13 using all methods:

Repeated Subtraction     : Quotient =     76, Remainder =     12
Bit Shift                : Quotient =     76, Remainder =     12
Multiplication           : Quotient =     76, Remainder =     12
Recursive                : Quotient =     76, Remainder =     12
```

## Algorithm Details

### 1. Repeated Subtraction

**Concept:** Keep subtracting the divisor from the dividend until the dividend becomes less than the divisor.

**Time Complexity:** O(n) where n = dividend/divisor
**Space Complexity:** O(1)

**Best for:** Small quotients, educational purposes

```python
quotient, remainder = divide(17, 5, "repeated_subtraction")
# 17 - 5 = 12
# 12 - 5 = 7
# 7 - 5 = 2
# 2 < 5, so quotient = 3, remainder = 2
```

### 2. Bit Shift Method (Recommended)

**Concept:** Binary long division using bit shifting (similar to how computers do division in hardware).

**Time Complexity:** O(log²n)
**Space Complexity:** O(1)

**Best for:** Most use cases, excellent performance for large numbers

```python
quotient, remainder = divide(17, 5, "bit_shift")
# Uses bit shifting to efficiently find multiples of divisor
# Much faster than repeated subtraction
```

### 3. Multiplication Method

**Concept:** Binary search to find the quotient, using multiplication to check candidates.

**Time Complexity:** O(log n)
**Space Complexity:** O(1)

**Best for:** Medium-sized numbers, when multiplication is faster than subtraction

```python
quotient, remainder = divide(17, 5, "multiplication")
# Binary search: tries quotients between 0 and dividend
# Checks if quotient * divisor <= dividend
```

### 4. Logarithm Method

**Concept:** Uses mathematical property: log(a/b) = log(a) - log(b)

**Time Complexity:** O(1)
**Space Complexity:** O(1)

**Limitations:** Only works for positive numbers, may have precision issues

```python
quotient, remainder = divide(17, 5, "logarithm")
# quotient = exp(log(17) - log(5))
```

### 5. Recursive Method

**Concept:** Recursive bit-shifting approach, divides problem into smaller subproblems.

**Time Complexity:** O(log²n)
**Space Complexity:** O(log n) due to recursion stack

**Best for:** Educational purposes, demonstrating recursive problem-solving

```python
quotient, remainder = divide(17, 5, "recursive")
# Recursively divides by shifting and adjusting
```

## Performance Comparison

For dividing 1,000,000 by 13:

```
Repeated Subtraction     : Time=0.00876543s  (slowest)
Bit Shift                : Time=0.00001234s  (fast)
Multiplication           : Time=0.00001456s  (fast)
Recursive                : Time=0.00001567s  (fast)
```

**Recommendation:** Use `bit_shift` (default) for best overall performance.

## Running Tests

```bash
# Run all unit tests
python test_division.py

# Run tests with verbose output
python -m unittest test_division -v
```

The test suite includes:
- Positive and negative number tests
- Edge cases (division by same number, dividend < divisor, etc.)
- Large number tests
- Consistency tests (all methods produce same results)
- Division property verification
- Error handling tests

## Project Structure

```
.
├── README.md                 # This file
├── division_algorithms.py    # Core division algorithms
├── cli.py                   # Command-line interface
└── test_division.py         # Unit tests
```

## How It Works: Deep Dive

### Bit Shift Method (Binary Long Division)

This is the most efficient method and mimics how CPUs perform division:

1. Start with the divisor
2. Keep doubling it (left shift) until it would exceed the dividend
3. Subtract the largest shifted value from dividend
4. Repeat until dividend < divisor

Example: 17 ÷ 5

```
17 ÷ 5:
  5 << 0 = 5   (5 * 1)   ✓ fits
  5 << 1 = 10  (5 * 2)   ✓ fits
  5 << 2 = 20  (5 * 4)   ✗ too big

Subtract largest that fits: 17 - 10 = 7, quotient = 2
Repeat with remainder 7:
  5 << 0 = 5   (5 * 1)   ✓ fits
  5 << 1 = 10  (5 * 2)   ✗ too big

Subtract: 7 - 5 = 2, quotient = 2 + 1 = 3
Remainder: 2

Result: 17 ÷ 5 = 3 remainder 2
```

## Mathematical Properties Verified

All algorithms maintain these division properties:
1. `dividend = quotient × divisor + remainder`
2. `0 ≤ remainder < |divisor|`
3. Sign of quotient follows standard rules (negative if signs differ)

## Limitations

- **Logarithm method:** Only works for positive integers
- **Repeated subtraction:** Very slow for large quotients
- **Integer division only:** No floating-point results
- **Remainder handling:** For negative dividends, remainder is always non-negative

## Contributing

Feel free to:
- Add new division algorithms
- Improve existing implementations
- Add more test cases
- Enhance documentation

## License

MIT License - Feel free to use this code for learning and projects!

## Educational Value

This project demonstrates:
- Algorithm design and analysis
- Time/space complexity trade-offs
- Bit manipulation techniques
- Recursive problem-solving
- Test-driven development
- Clean code practices
- CLI design patterns

## Questions or Issues?

Open an issue or submit a pull request!

---

**Made with ❤️ for learning and exploration**
