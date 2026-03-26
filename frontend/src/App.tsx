import React, { useState, useEffect } from 'react';
import { Search, Wallet, Archive } from 'lucide-react';
import './index.css';

interface AccountData {
  id: string;
  balances: { balance: string; asset_type: string }[];
  sequence: string;
}

const App: React.FC = () => {
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    setLoading(true);
    setError(null);
    setData(null);
    setIsCached(false);

    try {
      // 1. Basic Caching Implementation
      const cacheKey = `stellar_acc_${accountId}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        // Simulate a tiny delay for UX
        await new Promise((resolve) => setTimeout(resolve, 500));
        setData(JSON.parse(cachedData));
        setIsCached(true);
        setLoading(false);
        return;
      }

      // 2. Fetch from Horizon API
      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${accountId}`);

      if (!response.ok) {
        throw new Error('Account not found or invalid on Testnet');
      }

      const result = await response.json();

      const accountData: AccountData = {
        id: result.id,
        balances: result.balances,
        sequence: result.sequence,
      };

      // Save to cache
      sessionStorage.setItem(cacheKey, JSON.stringify(accountData));

      // Simulate network delay for progress indicator showcase
      await new Promise((resolve) => setTimeout(resolve, 800));

      setData(accountData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching');
    } finally {
      setLoading(false);
    }
  };

  const nativeBalance = data?.balances.find(b => b.asset_type === 'native')?.balance || '0';

  return (
    <div className="glass-container">
      <div className="title">Stellar Explorer</div>
      <div className="subtitle">View any testnet account instantly.</div>

      <form onSubmit={fetchAccount}>
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Enter Stellar Public Key (G...)"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={loading}
            data-testid="account-input"
          />
        </div>

        <button type="submit" className="btn" disabled={loading || !accountId} data-testid="search-button">
          {loading ? (
            <>
              <div className="spinner" data-testid="loading-spinner"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search size={20} />
              <span>Explore Account</span>
            </>
          )}
        </button>
      </form>

      {error && <div className="error-message" data-testid="error-message">{error}</div>}

      {data && !loading && (
        <div className="result-card" data-testid="result-card">
          <div className="data-row">
            <span className="data-label"><Wallet size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'sub' }} /> Account ID</span>
            <span className="data-value" style={{ fontSize: '0.8rem' }}>{data.id.substring(0, 8)}...{data.id.slice(-8)}</span>
          </div>
          <div className="data-row">
            <span className="data-label">XLM Balance</span>
            <span className="data-value">
              {nativeBalance} XLM
              {isCached && <span className="cache-badge" data-testid="cache-badge">Cached</span>}
            </span>
          </div>
          <div className="data-row">
            <span className="data-label"><Archive size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'sub' }} /> Sequence</span>
            <span className="data-value" style={{ fontSize: '0.8rem' }}>{data.sequence}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
