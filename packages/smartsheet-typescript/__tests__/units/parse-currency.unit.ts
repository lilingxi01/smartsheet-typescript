import { parseCurrency } from '@/utils/parse-currency';

describe('parseCurrency', () => {
  test('parses currency from number to formatted string obeying the rule', () => {
    expect(parseCurrency(null)).toBe(null);
    expect(parseCurrency(1000000)).toBe('$1,000,000');
    expect(parseCurrency(1000000.9)).toBe('$1,000,000.9');
    expect(parseCurrency(1000000.99)).toBe('$1,000,000.99');
  });
});
