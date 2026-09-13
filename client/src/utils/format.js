/**
 * Format a number as Indian Rupees.
 * Example: money(2450) returns "₹2,450".
 */
export const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
