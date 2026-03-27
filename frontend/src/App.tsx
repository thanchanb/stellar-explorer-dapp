import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, History, RefreshCw, LogOut, Search, Activity, ExternalLink } from 'lucide-react';
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
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  useEffect(() => {
    const saved = localStorage.getItem('stellar_history_v2');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addToHistory = (id: string) => {
    const newHistory = [id, ...history.filter(h => h !== id)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('stellar_history_v2', JSON.stringify(newHistory));
  };

  const fetchAccount = async (e?: React.FormEvent | string) => {
    if (e && typeof e !== 'string') e.preventDefault();
    const idToFetch = typeof e === 'string' ? e : accountId;

    if (!idToFetch) return;
    if (typeof e === 'string') setAccountId(idToFetch);

    setLoading(true);
    setError(null);
    setIsCached(false);

    try {
      const cacheKey = `stellar_p_acc_${idToFetch}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        await new Promise((resolve) => setTimeout(resolve, 800));
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
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setData(accountData);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const nativeBalance = data?.balances.find(b => b.asset_type === 'native')?.balance || '0.00000';

  return (
    <div className="dashboard">
      {loading && <div className="progress-bar progress-active" data-testid="progress-bar"></div>}

      <header className="header">
        <div className="logo-section" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">S</div>
          <div className="logo-text">Stellar <span>Premium Explorer</span></div>
        </div>

        <div className="header-actions">
          <div className="network-toggle">
            <div
              className={`network-btn ${network === 'testnet' ? 'active' : ''}`}
              onClick={() => setNetwork('testnet')}
            >
              TESTNET
            </div>
            <div
              className={`network-btn ${network === 'mainnet' ? 'active' : ''}`}
              onClick={() => {
                setNetwork('mainnet');
                setError('Mainnet exploration coming soon');
                setTimeout(() => setError(null), 3000);
              }}
            >
              MAINNET
            </div>
          </div>

          <div className="wallet-pill">
            <div className="status-dot"></div>
            <span>{data ? `${data.id.substring(0, 8)}...` : 'Ready to Connect'}</span>
          </div>

          <div className="disconnect-btn" onClick={() => { setData(null); setAccountId(''); }} title="Reset Explorer">
            <LogOut size={20} />
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="left-column">
          <section className="card balance-card" data-testid="result-card">
            <div className="card-title">
              <Activity size={18} /> ASSET OVERVIEW
            </div>
            <div className="amount" style={{ color: loading ? 'var(--text-secondary)' : 'white' }} data-testid="balance-amount">
              {data ? parseFloat(nativeBalance).toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 }) : '0.00000'} XLM
            </div>
            <div className="currency" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              STELLAR LUMENS
              {isCached && <span className="cache-badge" data-testid="cache-badge">SECURED BY CACHE</span>}
            </div>

            <div className="card-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="status-dot" style={{ width: '8px', height: '8px' }}></div>
                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>NETWORK: TESTNET</span>
              </div>
              <div className="refresh-action" onClick={() => fetchAccount()}>
                <RefreshCw size={14} className={loading ? 'spin' : ''} style={{ opacity: loading ? 0.5 : 1 }} />
                <span style={{ marginLeft: '4px' }}>Sync Dashboard</span>
              </div>
            </div>
          </section>

          <section className="card transfer-card">
            <div className="card-title">
              <ArrowRightLeft size={18} /> ACCOUNT LOOKUP & TRANSFERS
            </div>

            <div className="input-group">
              <label className="input-label">Public Address (G...)</label>
              <form onSubmit={fetchAccount} style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-style"
                  placeholder="Paste Stellar account address..."
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  disabled={loading}
                  data-testid="account-input"
                  style={{ paddingRight: '120px' }}
                />
                <button
                  type="submit"
                  className="initiate-btn"
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '6px',
                    bottom: '6px',
                    width: 'auto',
                    padding: '0 20px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    boxShadow: 'none'
                  }}
                  disabled={loading || !accountId}
                  data-testid="search-button"
                >
                  {loading ? (
                    <div className="spinner" data-testid="loading-spinner"></div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Search size={16} /> EXPLORE
                    </div>
                  )}
                </button>
              </form>
              {error && <div className="error-message" data-testid="error-message">{error}</div>}
              {loading && <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '8px', fontWeight: 600 }}>Syncing with Stellar Horizon...</div>}
            </div>

            <div className="transfer-grid" style={{ opacity: 0.5, pointerEvents: 'none' }}>
              <div className="input-group">
                <label className="input-label">Amount (XLM)</label>
                <input type="text" className="input-style" placeholder="0.00" disabled />
              </div>
              <div className="input-group">
                <label className="input-label">Destination Memo</label>
                <input type="text" className="input-style" placeholder="Message..." disabled />
              </div>
            </div>

            <button className="initiate-btn" style={{ opacity: 0.3 }} disabled>INITIATE TRANSACTION</button>
          </section>
        </div>

        <div className="right-column">
          <section className="card history-card" style={{ height: '100%' }}>
            <div className="history-header">
              <div className="card-title" style={{ margin: 0 }}>
                <History size={18} /> SEARCH HISTORY
              </div>
              <div
                className="refresh-action"
                style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px' }}
                onClick={() => { localStorage.removeItem('stellar_history_v2'); setHistory([]); }}
              >
                PURGE LOGS
              </div>
            </div>

            {history.length > 0 ? (
              <div className="history-list" style={{ marginTop: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                  RECENT PERSISTENT STORAGE
                </div>
                {history.map(id => (
                  <div
                    key={id}
                    className="history-item"
                    onClick={() => fetchAccount(id)}
                  >
                    <span>{id.substring(0, 10).toUpperCase()}...{id.slice(-10).toUpperCase()}</span>
                    <ExternalLink size={16} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: '3rem', flexDirection: 'column', gap: '15px' }}>
                <History size={48} style={{ opacity: 0.1 }} />
                <span>NO PERSISTENT HISTORY FOUND</span>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer style={{ padding: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
        ⚡ Powered by Stellar Horizon Testnet • Premium High-Fidelity Dashboard v3.0
      </footer>

      <style>{`
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
