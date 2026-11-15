import { describe, it, expect } from 'vitest';
import { calculatePercentage, isValidNumberInput } from './calculator';

describe('Percentage Calculator Core Math & Input Validation', () => {
  const testCases = [
    { name: '100 * 50% => 50', num: '100', pct: '50', expected: '50' },
    { name: '500 * 20% => 100', num: '500', pct: '20', expected: '100' },
    { name: '2500 * 10% => 250', num: '2500', pct: '10', expected: '250' },
    { name: '1000 * 75% => 750', num: '1000', pct: '75', expected: '750' },
    { name: '200 * 150% => 300', num: '200', pct: '150', expected: '300' },
    { name: '99 * 12.5% => 12.375', num: '99', pct: '12.5', expected: '12.375' },
    { name: '0 * 50% => 0', num: '0', pct: '50', expected: '0' },
    { name: '100 * 0% => 0', num: '100', pct: '0', expected: '0' },
    { name: '0 * 0% => 0', num: '0', pct: '0', expected: '0' },
    { name: 'Blank fields => blank', num: '', pct: '', expected: '' },
    { name: 'Only Number filled => blank', num: '100', pct: '', expected: '' },
    { name: 'Only Percentage filled => blank', num: '', pct: '50', expected: '' },
    { name: 'Negative number => -50', num: '-100', pct: '50', expected: '-50' },
    { name: 'Negative percentage => -50', num: '100', pct: '-50', expected: '-50' },
    { name: 'Both negative => 300', num: '-200', pct: '-150', expected: '300' },
    { name: 'Small decimals => 0.0125', num: '0.5', pct: '2.5', expected: '0.0125' },
    { name: 'Large numbers => 150000000', num: '1000000000', pct: '15', expected: '150000000' },
    { name: 'Precision limit: 8 decimal places', num: '1', pct: '0.33333333', expected: '0.00333333' },
    { name: 'Intermediate minus => blank', num: '-', pct: '50', expected: '' },
    { name: 'Intermediate dot => blank', num: '.', pct: '50', expected: '' },
    { name: 'Invalid string => blank', num: 'abc', pct: '50', expected: '' },
  ];

  for (const t of testCases) {
    it(t.name, () => {
      expect(calculatePercentage(t.num, t.pct)).toBe(t.expected);
    });
  }

  const inputValidationTests = [
    { input: '', expected: true },
    { input: '123', expected: true },
    { input: '-123', expected: true },
    { input: '123.45', expected: true },
    { input: '-123.45', expected: true },
    { input: '.', expected: true },
    { input: '-.', expected: true },
    { input: '-', expected: true },
    { input: '12.3.4', expected: false },
    { input: 'abc', expected: false },
    { input: '--5', expected: false },
    { input: '50%', expected: false },
  ];

  for (const iv of inputValidationTests) {
    it(`isValidNumberInput("${iv.input}") should be ${iv.expected}`, () => {
      expect(isValidNumberInput(iv.input)).toBe(iv.expected);
    });
  }
});
