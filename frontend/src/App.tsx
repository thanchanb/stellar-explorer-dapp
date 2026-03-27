import { useState, useEffect } from 'react';
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
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('stellar_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addToHistory = (id: string) => {
    const newHistory = [id, ...history.filter(h => h !== id)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('stellar_history', JSON.stringify(newHistory));
  };

  const fetchAccount = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const idToFetch = typeof e === 'string' ? e : accountId;

    if (!idToFetch) return;
    if (typeof e === 'string') setAccountId(idToFetch);

    setLoading(true);
    setError(null);
    setData(null);
    setIsCached(false);

    try {
      const cacheKey = `stellar_acc_${idToFetch}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setData(JSON.parse(cachedData));
        setIsCached(true);
        addToHistory(idToFetch);
        setLoading(false);
        return;
      }

      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${idToFetch}`);

      if (!response.ok) {
        throw new Error('Account not found or invalid on Testnet');
      }

      const result = await response.json();

      const accountData: AccountData = {
        id: result.id,
        balances: result.balances,
        sequence: result.sequence,
      };

      sessionStorage.setItem(cacheKey, JSON.stringify(accountData));
      addToHistory(idToFetch);

      // Simulate network delay for progress indicator showcase
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
      {loading && <div className="progress-bar progress-active" data-testid="progress-bar"></div>}

      <div className="title" style={{ position: 'relative', zIndex: 1 }}>Stellar Explorer</div>
      <div className="subtitle" style={{ position: 'relative', zIndex: 1 }}>View any testnet account instantly.</div>

      <form onSubmit={fetchAccount} style={{ position: 'relative', zIndex: 1 }}>
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

      {error && <div className="error-message" data-testid="error-message" style={{ position: 'relative', zIndex: 1 }}>{error}</div>}

      {data && !loading && (
        <div className="result-card" data-testid="result-card" style={{ position: 'relative', zIndex: 1 }}>
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

      {!loading && history.length > 0 && (
        <div className="history-section" style={{ position: 'relative', zIndex: 1 }}>
          <div className="history-title">Recent Searches</div>
          <div className="history-list">
            {history.map(id => (
              <div
                key={id}
                className="history-item"
                onClick={() => fetchAccount(id)}
              >
                {id.substring(0, 6)}...{id.slice(-4)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
