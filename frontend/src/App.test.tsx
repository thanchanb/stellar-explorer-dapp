import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import React from 'react';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Stellar Explorer App', () => {
    beforeEach(() => {
        sessionStorage.clear();
        mockFetch.mockClear();
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
        expect(button).toBeDisabled();
        expect(input).toBeDisabled();
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

        // Wait for the simulated delay in the component (800ms)
        await waitFor(() => {
            expect(screen.getByTestId('result-card')).toBeInTheDocument();
        }, { timeout: 1500 });

        // Check if the balance is displayed
        expect(screen.getByText(/100\.50 XLM/i)).toBeInTheDocument();
        // Verify that the fetch was actually called
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith('https://horizon-testnet.stellar.org/accounts/GA123');
    });

    it('3. should use cached data instead of fetching twice', async () => {
        const mockData = {
            id: 'GCACHE123456',
            balances: [{ asset_type: 'native', balance: '500.00' }],
            sequence: '99999'
        };

        // Pre-populate sessionStorage
        sessionStorage.setItem('stellar_acc_GCACHE123456', JSON.stringify(mockData));

        render(<App />);
        const input = screen.getByTestId('account-input');
        const button = screen.getByTestId('search-button');

        fireEvent.change(input, { target: { value: 'GCACHE123456' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('result-card')).toBeInTheDocument();
        }, { timeout: 1000 });

        // Ensure fetch was not called since data was cached
        expect(mockFetch).not.toHaveBeenCalled();
        // Cache badge should be visible
        expect(screen.getByTestId('cache-badge')).toBeInTheDocument();
        expect(screen.getByText(/500\.00 XLM/i)).toBeInTheDocument();
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
        }, { timeout: 1000 });

        expect(screen.getByText('Account not found or invalid on Testnet')).toBeInTheDocument();
    });
});
