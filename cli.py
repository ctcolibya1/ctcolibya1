#!/usr/bin/env python3
"""
CLI interface for Division Without Division Operator
"""

import argparse
import sys
import time
from division_algorithms import divide, DivisionWithoutOperator


def format_result(dividend, divisor, quotient, remainder, method, execution_time):
    """Format the division result nicely"""
    print("\n" + "=" * 60)
    print(f"Dividing {dividend} by {divisor} using {method.replace('_', ' ').title()}")
    print("=" * 60)
    print(f"Quotient:  {quotient}")
    print(f"Remainder: {remainder}")
    print(f"Verification: {divisor} × {quotient} + {remainder} = {divisor * quotient + abs(remainder)}")
    print(f"Execution time: {execution_time:.6f} seconds")
    print("=" * 60)


def interactive_mode():
    """Run in interactive mode"""
    print("\n" + "🔢 " * 20)
    print("   Division Without Division Operator - Interactive Mode")
    print("🔢 " * 20 + "\n")

    methods = [
        "repeated_subtraction",
        "bit_shift",
        "multiplication",
        "logarithm",
        "recursive"
    ]

    while True:
        print("\nEnter 'quit' or 'exit' to stop")

        try:
            # Get dividend
            dividend_input = input("Enter dividend (number to be divided): ").strip()
            if dividend_input.lower() in ['quit', 'exit']:
                print("Goodbye!")
                break

            dividend = int(dividend_input)

            # Get divisor
            divisor_input = input("Enter divisor (number to divide by): ").strip()
            if divisor_input.lower() in ['quit', 'exit']:
                print("Goodbye!")
                break

            divisor = int(divisor_input)

            # Show method options
            print("\nAvailable methods:")
            for i, method in enumerate(methods, 1):
                print(f"  {i}. {method.replace('_', ' ').title()}")
            print(f"  {len(methods) + 1}. All methods")

            method_input = input(f"Choose method (1-{len(methods) + 1}, default=2): ").strip()

            if method_input.lower() in ['quit', 'exit']:
                print("Goodbye!")
                break

            if not method_input:
                method_input = "2"

            method_choice = int(method_input)

            if method_choice == len(methods) + 1:
                # Run all methods
                print("\n" + "🔄 " * 20)
                print("   Running all methods for comparison")
                print("🔄 " * 20)

                for method in methods:
                    try:
                        start_time = time.time()
                        quotient, remainder = divide(dividend, divisor, method)
                        end_time = time.time()

                        print(f"\n{method.replace('_', ' ').title():25s}: "
                              f"Quotient = {quotient:6d}, Remainder = {remainder:6d}, "
                              f"Time = {end_time - start_time:.6f}s")
                    except ValueError as e:
                        print(f"\n{method.replace('_', ' ').title():25s}: Error - {e}")

                print("\n" + "🔄 " * 20)

            elif 1 <= method_choice <= len(methods):
                method = methods[method_choice - 1]
                start_time = time.time()
                quotient, remainder = divide(dividend, divisor, method)
                end_time = time.time()

                format_result(dividend, divisor, quotient, remainder, method,
                            end_time - start_time)
            else:
                print("Invalid choice!")

        except ValueError as e:
            print(f"\n❌ Error: {e}")
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Divide two numbers without using the division operator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python cli.py 100 7
  python cli.py 100 7 --method bit_shift
  python cli.py -100 7 --method recursive
  python cli.py --interactive
  python cli.py -i

Available methods:
  repeated_subtraction - Simple repeated subtraction (slow for large numbers)
  bit_shift           - Binary long division using bit shifting (fast)
  multiplication      - Binary search with multiplication (medium)
  logarithm          - Using logarithms (positive numbers only)
  recursive          - Recursive bit-shifting approach
        """
    )

    parser.add_argument('dividend', type=int, nargs='?',
                        help='The number to be divided')
    parser.add_argument('divisor', type=int, nargs='?',
                        help='The number to divide by')
    parser.add_argument('-m', '--method',
                        choices=['repeated_subtraction', 'bit_shift', 'multiplication',
                                'logarithm', 'recursive', 'all'],
                        default='bit_shift',
                        help='Division method to use (default: bit_shift)')
    parser.add_argument('-i', '--interactive', action='store_true',
                        help='Run in interactive mode')
    parser.add_argument('-b', '--benchmark', action='store_true',
                        help='Benchmark all methods')

    args = parser.parse_args()

    # Interactive mode
    if args.interactive:
        interactive_mode()
        return

    # Benchmark mode
    if args.benchmark:
        if args.dividend is None or args.divisor is None:
            print("Error: Dividend and divisor required for benchmark mode")
            sys.exit(1)

        print("\n" + "⏱️  " * 20)
        print("   Benchmarking all methods")
        print("⏱️  " * 20)

        methods = ['repeated_subtraction', 'bit_shift', 'multiplication', 'recursive']

        for method in methods:
            try:
                start_time = time.time()
                quotient, remainder = divide(args.dividend, args.divisor, method)
                end_time = time.time()

                print(f"\n{method.replace('_', ' ').title():25s}: "
                      f"Q={quotient:6d}, R={remainder:6d}, "
                      f"Time={end_time - start_time:.8f}s")
            except ValueError as e:
                print(f"\n{method.replace('_', ' ').title():25s}: Error - {e}")

        print("\n" + "⏱️  " * 20)
        return

    # Regular mode
    if args.dividend is None or args.divisor is None:
        parser.print_help()
        return

    try:
        if args.method == 'all':
            methods = ['repeated_subtraction', 'bit_shift', 'multiplication', 'recursive']
            print(f"\nDividing {args.dividend} by {args.divisor} using all methods:\n")

            for method in methods:
                try:
                    start_time = time.time()
                    quotient, remainder = divide(args.dividend, args.divisor, method)
                    end_time = time.time()

                    print(f"{method.replace('_', ' ').title():25s}: "
                          f"Quotient = {quotient:6d}, Remainder = {remainder:6d}")
                except ValueError as e:
                    print(f"{method.replace('_', ' ').title():25s}: Error - {e}")
        else:
            start_time = time.time()
            quotient, remainder = divide(args.dividend, args.divisor, args.method)
            end_time = time.time()

            format_result(args.dividend, args.divisor, quotient, remainder,
                        args.method, end_time - start_time)

    except ValueError as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
