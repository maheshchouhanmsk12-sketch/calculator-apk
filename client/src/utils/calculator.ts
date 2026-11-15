import Big from 'big.js';

/**
 * Validates whether an input string is a valid numeric string or typing in progress.
 * Supports:
 * - Empty string ""
 * - Negative prefix "-"
 * - Leading dot "." or "-."
 * - Integers and decimals
 */
export const isValidNumberInput = (value: string): boolean => {
  // Allow empty string, single minus, single dot, minus with dot, or standard numbers
  return /^-?\d*\.?\d*$/.test(value);
};

/**
 * Calculates (Number × Percentage) / 100 using arbitrary-precision arithmetic.
 * Returns empty string if either input is empty or invalid.
 * Formats up to 8 decimal places and removes unnecessary trailing zeros.
 * Avoids IEEE-754 floating-point inaccuracies.
 */
export const calculatePercentage = (numberStr: string, percentageStr: string): string => {
  if (!numberStr || !percentageStr) {
    return '';
  }

  const trimmedNum = numberStr.trim();
  const trimmedPct = percentageStr.trim();

  if (!trimmedNum || !trimmedPct) {
    return '';
  }

  // Intermediate typing states that are not full numbers
  if (
    trimmedNum === '-' ||
    trimmedNum === '.' ||
    trimmedNum === '-.' ||
    trimmedPct === '-' ||
    trimmedPct === '.' ||
    trimmedPct === '-.'
  ) {
    return '';
  }

  try {
    const num = new Big(trimmedNum);
    const pct = new Big(trimmedPct);

    // Formula: Answer = (Number × Percentage) / 100
    const result = num.times(pct).div(100);

    // Format up to 8 decimal places
    let formatted = result.toFixed(8);

    // Remove unnecessary trailing zeros and decimal point if whole number
    if (formatted.includes('.')) {
      formatted = formatted.replace(/\.?0+$/, '');
    }

    // Guard against negative zero representation
    if (formatted === '-0' || formatted === '-0.0' || formatted === '') {
      formatted = '0';
    }

    return formatted;
  } catch {
    // If parsing fails for any unexpected input, return blank
    return '';
  }
};
