import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, History, RefreshCw, LogOut, Search, Activity, ExternalLink, Wallet } from 'lucide-react';
import { isConnected, getAddress } from "@stellar/freighter-api";
import './index.css';

interface AccountData {
  id: string;
  balances: { balance: string; asset_type: string }[];
  sequence: string;
}

const App: React.FC = () => {
  const [accountId, setAccountId] = useState('');
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  useEffect(() => {
    const saved = localStorage.getItem('stellar_history_v3');
    if (saved) setHistory(JSON.parse(saved));

    // Check initial Freighter connection
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (await isConnected()) {
        const addressData = await getAddress();
        if (addressData && addressData.address) setConnectedWallet(addressData.address);
      }
    } catch (err) {
      console.error("Freighter check failed", err);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      if (await isConnected()) {
        const addressData = await getAddress();
        if (addressData && addressData.address) {
          setConnectedWallet(addressData.address);
          setAccountId(addressData.address);
          fetchAccount(addressData.address);
        }
      } else {
        setError("Freighter wallet not found. Please install the extension.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (id: string) => {
    const newHistory = [id, ...history.filter(h => h !== id)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('stellar_history_v3', JSON.stringify(newHistory));
  };

  const fetchAccount = async (e?: React.FormEvent | string) => {
    if (e && typeof e !== 'string') e.preventDefault();
    const idToFetch = typeof e === 'string' ? e : accountId;

    if (!idToFetch) {
      setError("Please enter a valid Stellar address");
      return;
    }

    if (typeof e === 'string') setAccountId(idToFetch);

    setLoading(true);
    setError(null);
    setIsCached(false);

    try {
      const cacheKey = `stellar_p3_acc_${idToFetch}`;
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
        throw new Error('Account not found on Testnet');
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

          {connectedWallet ? (
            <div className="wallet-pill active">
              <div className="status-dot"></div>
              <span>{connectedWallet.substring(0, 4)}...{connectedWallet.slice(-4)}</span>
              <LogOut size={16} className="logout-btn" onClick={() => setConnectedWallet(null)} />
            </div>
          ) : (
            <button className="connect-wallet-btn" onClick={connectWallet} disabled={loading}>
              <Wallet size={16} /> CONNECT WALLET
            </button>
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="left-column">
          <section className="card balance-card" data-testid="result-card" style={{ display: data || loading ? 'block' : 'none' }}>
            <div className="card-title">
              <Activity size={18} /> LIVE ACCOUNT BALANCE
            </div>
            <div className="amount" style={{ color: loading ? 'var(--text-secondary)' : 'white' }} data-testid="balance-amount">
              {loading ? '0.00000' : parseFloat(nativeBalance).toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })} XLM
            </div>
            <div className="currency" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              STELLAR LUMENS
              {isCached && <span className="cache-badge" data-testid="cache-badge">CACHED DATA</span>}
            </div>

            <div className="card-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="status-dot" style={{ width: '8px', height: '8px' }}></div>
                <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>SYNCED: {network.toUpperCase()}</span>
              </div>
              <div className="refresh-action" onClick={() => fetchAccount()}>
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                <span style={{ marginLeft: '4px' }}>Force Refresh</span>
              </div>
            </div>
          </section>

          <section className="card lookup-card">
            <div className="card-title">
              <Search size={18} /> ACCOUNT SEARCH
            </div>

            <div className="input-group">
              <label className="input-label">Stellar Public Address</label>
              <form onSubmit={fetchAccount} style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-style"
                  placeholder="Enter G... address"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  disabled={loading}
                  data-testid="account-input"
                />
                <button
                  type="submit"
                  className="explore-btn-overlay"
                  disabled={loading || !accountId}
                  data-testid="search-button"
                >
                  {loading ? (
                    <div className="spinner" data-testid="loading-spinner"></div>
                  ) : (
                    <ArrowRightLeft size={18} />
                  )}
                </button>
              </form>
              {error && <div className="error-message" data-testid="error-message">{error}</div>}
            </div>

            <div className="tools-grid">
              <div className="tool-card disabled">
                <div className="tool-info">
                  <div className="tool-name">Transfer Funds</div>
                  <div className="tool-desc">Soroban contracts ready</div>
                </div>
                <div className="status-tag">LOCKED</div>
              </div>
              <div className="tool-card disabled">
                <div className="tool-info">
                  <div className="tool-name">Mint Asset</div>
                  <div className="tool-desc">Custom token factory</div>
                </div>
                <div className="status-tag">LOCKED</div>
              </div>
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="card history-card">
            <div className="history-header">
              <div className="card-title" style={{ margin: 0 }}>
                <History size={18} /> RECENT EXPLORATIONS
              </div>
              {history.length > 0 && (
                <button className="clear-btn" onClick={() => { localStorage.removeItem('stellar_history_v3'); setHistory([]); }}>
                  CLEAR
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="history-list">
                {history.map(id => (
                  <div
                    key={id}
                    className="history-item"
                    onClick={() => fetchAccount(id)}
                  >
                    <div className="history-info">
                      <div className="history-address">{id.substring(0, 10)}...{id.slice(-10)}</div>
                      <div className="history-meta">Testnet Exploration</div>
                    </div>
                    <ExternalLink size={14} className="history-link" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Search size={32} style={{ opacity: 0.1, marginBottom: '10px' }} />
                <div>No Exploration History</div>
                <p>Searched accounts will appear here for 1-click access.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <span>⚡ Stellar Premium Explorer v3.0</span>
          <span className="footer-separator"></span>
          <span style={{ color: 'var(--text-secondary)' }}>End-to-End Soroban dApp Challenge</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
