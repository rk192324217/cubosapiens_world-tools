// tests/unit/utils.test.ts

export const capitalize = (s: string) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
};

describe('String Utils', () => {
    it('should capitalize a string', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('')).toBe('');
    });
});

describe('Number Utils', () => {
    it('should format currency', () => {
        expect(formatCurrency(10.5)).toBe('$10.50');
        expect(formatCurrency(0)).toBe('$0.00');
    });
});
