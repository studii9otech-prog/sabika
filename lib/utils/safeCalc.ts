/**
 * lib/utils/safeCalc.ts
 *
 * Safe mathematical helpers for financial calculations.
 *
 * Why this file exists:
 * JavaScript produces `Infinity`, `-Infinity`, or `NaN` when dividing by zero
 * or operating on undefined values.  In a financial UI these silently corrupt
 * displayed numbers.  Every helper here returns a safe numeric fallback instead.
 *
 * Rules:
 *  1. Never throw — always return `fallback` (default 0) on bad input.
 *  2. Never mutate arguments.
 *  3. Keep logic trivial so the overhead is negligible.
 */

/**
 * Returns true only when `n` is a finite, non-NaN number.
 */
export function isValidNumber(n: unknown): n is number {
  return typeof n === "number" && isFinite(n) && !isNaN(n);
}

/**
 * Safe division.
 *
 * @param numerator   - The dividend
 * @param denominator - The divisor
 * @param fallback    - Value returned when the result would be Infinity / NaN (default: 0)
 */
export function safeDivide(
  numerator: number,
  denominator: number,
  fallback = 0
): number {
  if (!isValidNumber(numerator) || !isValidNumber(denominator) || denominator === 0) {
    return fallback;
  }
  const result = numerator / denominator;
  return isValidNumber(result) ? result : fallback;
}

/**
 * Safe percentage calculation: (value / total) * 100
 *
 * @param value    - The part
 * @param total    - The whole
 * @param fallback - Returned when total is 0 or inputs are invalid (default: 0)
 */
export function safePercent(value: number, total: number, fallback = 0): number {
  return safeDivide(value, total, fallback) * 100;
}

/**
 * Safe subtraction that never produces NaN.
 */
export function safeSub(a: number, b: number, fallback = 0): number {
  if (!isValidNumber(a) || !isValidNumber(b)) return fallback;
  return a - b;
}

/**
 * Clamps a value between min and max.
 * Returns `fallback` if the value is not a valid number.
 */
export function safeClamp(value: number, min: number, max: number, fallback = 0): number {
  if (!isValidNumber(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

/**
 * Safe toFixed that never throws or returns NaN strings.
 *
 * @param value   - The number to format
 * @param digits  - Decimal places
 * @param fallback - String returned when value is invalid (default: "—")
 */
export function safeFixed(value: number, digits = 2, fallback = "—"): string {
  if (!isValidNumber(value)) return fallback;
  return value.toFixed(digits);
}
