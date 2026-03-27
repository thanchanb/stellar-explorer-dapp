import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

// Type definition for fetch mock
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock Freighter API
vi.mock('@stellar/freighter-api', () => ({
    isConnected: vi.fn(() => Promise.resolve(false)),
    getAddress: vi.fn(() => Promise.resolve({ address: '' })),
}));

describe('Stellar Explorer App', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        localStorage.clear();
    });

    it('1. should show loading state when fetching', async () => {
        // Hangs the fetch to test loading state
        mockFetch.mockImplementationOnce(() => new Promise(() => { }));

        render(<App />);
        const input = screen.getByTestId('account-input');
        const button = screen.getByTestId('search-button');

        fireEvent.change(input, { target: { value: 'GAREALIZE...' } });
        fireEvent.click(button);

        // Initial loading indicator should be present
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        expect(screen.getByTestId('account-input')).toBeDisabled();
    });

    it('2. should fetch and display data successfully', async () => {
        const mockData = {
            id: 'GA1234567890ABCDEF1234567890ABCDEF',
            balances: [{ asset_type: 'native', balance: '100.50' }],
            sequence: '12345'
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        } as Response);

        render(<App />);
        const input = screen.getByTestId('account-input');
        const button = screen.getByTestId('search-button');

        fireEvent.change(input, { target: { value: 'GA123' } });
        fireEvent.click(button);

        // Wait for the simulated delay in the component
        await waitFor(() => {
            expect(screen.getByTestId('balance-amount')).toHaveTextContent(/100\.50000/);
        }, { timeout: 3000 });

        expect(screen.getByText(/LUMENS/i)).toBeInTheDocument();
        // Verify that the fetch was actually called
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('3. should use cached data instead of fetching twice', async () => {
        const mockData = {
            id: 'GCACHE123456',
            balances: [{ asset_type: 'native', balance: '500.00' }],
            sequence: '99999'
        };

        // Pre-populate sessionStorage with the P3 key format
        sessionStorage.setItem('stellar_p3_acc_GCACHE123456', JSON.stringify(mockData));

        render(<App />);
        const input = screen.getByTestId('account-input');
        const button = screen.getByTestId('search-button');

        fireEvent.change(input, { target: { value: 'GCACHE123456' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('balance-amount')).toHaveTextContent(/500\.00000/);
        }, { timeout: 3000 });

        // Ensure fetch was not called since data was cached
        expect(mockFetch).not.toHaveBeenCalled();
        // Cache badge should be visible
        expect(screen.getByTestId('cache-badge')).toBeInTheDocument();
    });

    it('4. should show an error message on API failure', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
        } as Response);

        render(<App />);
        const input = screen.getByTestId('account-input');
        const button = screen.getByTestId('search-button');

        fireEvent.change(input, { target: { value: 'INVALID_ID' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.getByText(/Account not found/i)).toBeInTheDocument();
    });

    it('5. should show a progress bar during fetching', async () => {
        // Hangs the fetch
        mockFetch.mockImplementationOnce(() => new Promise(() => { }));

        render(<App />);
        const input = screen.getByTestId('account-input');
        const button = screen.getByTestId('search-button');

        fireEvent.change(input, { target: { value: 'GA_PROGRESS' } });
        fireEvent.click(button);

        expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
        expect(screen.getByTestId('progress-bar')).toHaveClass('progress-active');
    });

    it('6. should persist and display search history', async () => {
        const mockData = {
            id: 'GA_HISTORY_LONG_ADDRESS_123',
            balances: [{ asset_type: 'native', balance: '10' }],
            sequence: '1'
        };

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockData
        } as Response);

        render(<App />);
        const input = screen.getByTestId('account-input');
        const button = screen.getByTestId('search-button');

        fireEvent.change(input, { target: { value: 'GA_HISTORY_LONG_ADDRESS_123' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('result-card')).toBeInTheDocument();
        }, { timeout: 3000 });

        // History item should be visible
        expect(screen.getByText(/GA_HISTORY/i)).toBeInTheDocument();
        expect(screen.getByText(/DDRESS_123/i)).toBeInTheDocument();
    });
});
