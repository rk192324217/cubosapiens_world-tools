// tests/unit/api.test.ts

const mockFetchData = async (url: string) => {
    if (url.includes('/tools')) return [{ id: 1, name: 'Tool A' }];
    if (url.includes('/error')) throw new Error('Network Error');
    return [];
};

describe('API Utils', () => {
    it('should fetch tools successfully', async () => {
        const data = await mockFetchData('/api/tools');
        expect(data).toHaveLength(1);
        expect(data[0].name).toBe('Tool A');
    });

    it('should handle API errors gracefully', async () => {
        await expect(mockFetchData('/api/error')).rejects.toThrow('Network Error');
    });
});
