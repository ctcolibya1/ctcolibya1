"""
Division Without Division Operator
A collection of algorithms to perform division without using the division operator (/, //, or divmod)
"""


class DivisionWithoutOperator:
    """Class containing multiple methods to divide numbers without using division operator"""

    @staticmethod
    def repeated_subtraction(dividend, divisor):
        """
        Divide using repeated subtraction method.
        Keep subtracting divisor from dividend until dividend becomes less than divisor.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by

        Returns:
            tuple: (quotient, remainder)

        Raises:
            ValueError: If divisor is zero
        """
        if divisor == 0:
            raise ValueError("Division by zero is not allowed")

        # Handle negative numbers
        negative_result = (dividend < 0) ^ (divisor < 0)  # XOR to check if signs differ
        dividend, divisor = abs(dividend), abs(divisor)

        quotient = 0
        remainder = dividend

        while remainder >= divisor:
            remainder -= divisor
            quotient += 1

        return (-quotient if negative_result else quotient, remainder)

    @staticmethod
    def bit_shift_method(dividend, divisor):
        """
        Divide using bit manipulation (similar to binary long division).
        This is much faster than repeated subtraction for large numbers.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by

        Returns:
            tuple: (quotient, remainder)

        Raises:
            ValueError: If divisor is zero
        """
        if divisor == 0:
            raise ValueError("Division by zero is not allowed")

        # Handle negative numbers
        negative_result = (dividend < 0) ^ (divisor < 0)
        dividend, divisor = abs(dividend), abs(divisor)

        quotient = 0
        remainder = dividend

        # Find the highest bit position where divisor can be subtracted
        while remainder >= divisor:
            temp_divisor = divisor
            multiple = 1

            # Keep doubling the divisor until it's bigger than remainder
            while remainder >= (temp_divisor << 1):
                temp_divisor <<= 1  # Left shift (multiply by 2)
                multiple <<= 1

            # Subtract the largest shifted divisor
            remainder -= temp_divisor
            quotient += multiple

        return (-quotient if negative_result else quotient, remainder)

    @staticmethod
    def multiplication_method(dividend, divisor):
        """
        Divide using multiplication (finding the multiplicative inverse approximation).
        Uses an iterative approach to find quotient.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by

        Returns:
            tuple: (quotient, remainder)

        Raises:
            ValueError: If divisor is zero
        """
        if divisor == 0:
            raise ValueError("Division by zero is not allowed")

        # Handle negative numbers
        negative_result = (dividend < 0) ^ (divisor < 0)
        dividend, divisor = abs(dividend), abs(divisor)

        if dividend < divisor:
            return (0, dividend)

        # Use binary search to find the quotient
        low, high = 0, dividend
        quotient = 0

        while low <= high:
            mid = (low + high) >> 1  # Bit shift instead of division by 2
            product = mid * divisor

            if product == dividend:
                quotient = mid
                break
            elif product < dividend:
                quotient = mid
                low = mid + 1
            else:
                high = mid - 1

        remainder = dividend - (quotient * divisor)
        return (-quotient if negative_result else quotient, remainder)

    @staticmethod
    def logarithm_method(dividend, divisor):
        """
        Divide using logarithms: log(a/b) = log(a) - log(b)
        Note: This method only works for positive numbers and may have precision issues.

        Args:
            dividend: The number to be divided (must be positive)
            divisor: The number to divide by (must be positive)

        Returns:
            tuple: (quotient, remainder)

        Raises:
            ValueError: If divisor is zero or if numbers are not positive
        """
        if divisor == 0:
            raise ValueError("Division by zero is not allowed")

        if dividend <= 0 or divisor <= 0:
            raise ValueError("Logarithm method requires positive numbers")

        import math

        # Calculate quotient using logarithms
        quotient = int(math.exp(math.log(dividend) - math.log(divisor)))

        # Calculate remainder
        remainder = dividend - (quotient * divisor)

        # Handle precision issues
        if remainder < 0:
            quotient -= 1
            remainder = dividend - (quotient * divisor)
        elif remainder >= divisor:
            quotient += 1
            remainder = dividend - (quotient * divisor)

        return (quotient, remainder)

    @staticmethod
    def recursive_method(dividend, divisor):
        """
        Divide using recursion.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by

        Returns:
            tuple: (quotient, remainder)

        Raises:
            ValueError: If divisor is zero
        """
        if divisor == 0:
            raise ValueError("Division by zero is not allowed")

        # Handle negative numbers
        negative_result = (dividend < 0) ^ (divisor < 0)
        dividend, divisor = abs(dividend), abs(divisor)

        def recursive_divide(dividend, divisor):
            if dividend < divisor:
                return (0, dividend)

            quotient, remainder = recursive_divide(dividend, divisor << 1)
            quotient <<= 1

            if remainder >= divisor:
                quotient += 1
                remainder -= divisor

            return (quotient, remainder)

        # Start the recursion
        if dividend < divisor:
            quotient, remainder = 0, dividend
        else:
            quotient, remainder = recursive_divide(dividend, divisor)

        return (-quotient if negative_result else quotient, remainder)


def divide(dividend, divisor, method="bit_shift"):
    """
    Convenience function to divide two numbers without using division operator.

    Args:
        dividend: The number to be divided
        divisor: The number to divide by
        method: Algorithm to use ("repeated_subtraction", "bit_shift", "multiplication",
                "logarithm", or "recursive"). Default is "bit_shift".

    Returns:
        tuple: (quotient, remainder)

    Raises:
        ValueError: If method is invalid or divisor is zero
    """
    methods = {
        "repeated_subtraction": DivisionWithoutOperator.repeated_subtraction,
        "bit_shift": DivisionWithoutOperator.bit_shift_method,
        "multiplication": DivisionWithoutOperator.multiplication_method,
        "logarithm": DivisionWithoutOperator.logarithm_method,
        "recursive": DivisionWithoutOperator.recursive_method,
    }

    if method not in methods:
        raise ValueError(f"Invalid method. Choose from: {', '.join(methods.keys())}")

    return methods[method](dividend, divisor)


if __name__ == "__main__":
    # Quick test
    print("Division Without Division Operator - Quick Test")
    print("=" * 50)

    test_cases = [
        (10, 3),
        (100, 7),
        (-15, 4),
        (15, -4),
        (-20, -3),
        (1000, 13),
    ]

    for dividend, divisor in test_cases:
        print(f"\n{dividend} ÷ {divisor}:")
        for method in ["repeated_subtraction", "bit_shift", "multiplication", "recursive"]:
            quotient, remainder = divide(dividend, divisor, method)
            print(f"  {method:25s}: {quotient} remainder {remainder}")
