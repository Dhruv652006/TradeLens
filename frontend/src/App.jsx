import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Activity,
  Eye,
  Settings,
  Search,
  Menu,
  X,
  Moon,
  Sun,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Star,
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [data, setData] = useState(null);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [watchlist, setWatchlist] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);

      const marketRes = await fetch(`${API}/api/market`);
      const marketData = await marketRes.json();

      const chartRes = await fetch(`${API}/api/nifty/history`);
      const chartData = await chartRes.json();

      setData(marketData);
      setChart(chartData.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const timer = setInterval(loadData, 30000);

    return () => clearInterval(timer);
  }, []);

  const toggleWatchlist = (symbol) => {
    setWatchlist((old) =>
      old.includes(symbol)
        ? old.filter((item) => item !== symbol)
        : [...old, symbol]
    );
  };

  const filteredStocks =
    data?.stocks?.filter(
      (stock) =>
        stock.name.toLowerCase().includes(search.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <div className={dark ? "app dark" : "app"}>
      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <Sidebar
        page={page}
        setPage={setPage}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={22} />
          </button>

          <div>
            <h1>{page}</h1>
            <p>Indian market intelligence dashboard</p>
          </div>

          <div className="top-actions">
            <div className="search">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stocks..."
              />
            </div>

            <button
              className="icon-btn"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              className="refresh"
              onClick={loadData}
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </header>

        {loading && !data ? (
          <div className="loading">
            <RefreshCw className="spin" size={30} />
            <p>Loading market data...</p>
          </div>
        ) : (
          <>
            {page === "Dashboard" && (
              <Dashboard
                data={data}
                chart={chart}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
              />
            )}

            {page === "Markets" && (
              <Markets data={data} chart={chart} />
            )}

            {page === "Stocks" && (
              <Stocks
                stocks={filteredStocks}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
              />
            )}

            {page === "Market Movers" && (
              <Movers
                stocks={data?.stocks || []}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
              />
            )}

            {page === "Anomalies" && (
              <Anomalies stocks={data?.stocks || []} />
            )}

            {page === "Watchlist" && (
              <Watchlist
                stocks={data?.stocks || []}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
              />
            )}

            {page === "Settings" && (
              <SettingsPage
                dark={dark}
                setDark={setDark}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Sidebar({
  page,
  setPage,
  mobileMenu,
  setMobileMenu,
}) {
  const items = [
    ["Dashboard", LayoutDashboard],
    ["Markets", TrendingUp],
    ["Stocks", BarChart3],
    ["Market Movers", Activity],
    ["Anomalies", Activity],
    ["Watchlist", Eye],
    ["Settings", Settings],
  ];

  return (
    <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-icon">
          M
        </div>

        <div>
          <strong>MarketPulse</strong>
          <span>INTELLIGENCE</span>
        </div>

        <button
          className="close-menu"
          onClick={() => setMobileMenu(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav>
        {items.map(([name, Icon]) => (
          <button
            key={name}
            className={page === name ? "active" : ""}
            onClick={() => {
              setPage(name);
              setMobileMenu(false);
            }}
          >
            <Icon size={19} />
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <span>MARKET STATUS</span>
        <div className="market-online">
          <i />
          Live data connected
        </div>
      </div>
    </aside>
  );
}

function Dashboard({
  data,
  chart,
  watchlist,
  toggleWatchlist,
}) {
  const indices = [
    data?.indices?.nifty,
    data?.indices?.sensex,
    data?.indices?.bankNifty,
  ];

  return (
    <div className="content">
      <section className="hero">
        <div>
          <span className="eyebrow">LIVE MARKET INTELLIGENCE</span>
          <h2>Understand the market<br />before you trade.</h2>
          <p>
            Track Indian indices, stocks and market movements
            from one place.
          </p>
        </div>

        <div className="hero-status">
          <span className="live-dot" />
          MARKET DATA LIVE
        </div>
      </section>

      <section className="index-grid">
        {indices.map(
          (item) =>
            item && (
              <IndexCard
                key={item.symbol}
                item={item}
              />
            )
        )}
      </section>

      <section className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-head">
            <div>
              <span>NIFTY 50</span>
              <h3>Intraday Movement</h3>
            </div>

            <span className="live-badge">LIVE</span>
          </div>

          <MarketChart data={chart} />
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span>TRACKED STOCKS</span>
              <h3>Market Snapshot</h3>
            </div>
          </div>

          <StockList
            stocks={data?.stocks || []}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
          />
        </div>
      </section>
    </div>
  );
}

function IndexCard({ item }) {
  const positive = Number(item.change) >= 0;

  return (
    <div className="index-card">
      <div className="index-top">
        <span>{item.name}</span>
        <span className={positive ? "positive" : "negative"}>
          {positive ? "+" : ""}
          {Number(item.change || 0).toFixed(2)}%
        </span>
      </div>

      <strong>
        {item.price
          ? Number(item.price).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })
          : "--"}
      </strong>

      <div className="index-bottom">
        <span>{item.marketState}</span>
        <span>{item.symbol}</span>
      </div>
    </div>
  );
}

function Markets({ data, chart }) {
  return (
    <div className="content">
      <PageTitle
        title="Markets"
        text="Real-time overview of major Indian market indices."
      />

      <div className="index-grid">
        {[
          data?.indices?.nifty,
          data?.indices?.sensex,
          data?.indices?.bankNifty,
        ].map(
          (item) =>
            item && (
              <IndexCard
                key={item.symbol}
                item={item}
              />
            )
        )}
      </div>

      <div className="panel large-panel">
        <div className="panel-head">
          <div>
            <span>NIFTY 50</span>
            <h3>Price History</h3>
          </div>
        </div>

        <MarketChart data={chart} />
      </div>
    </div>
  );
}

function Stocks({
  stocks,
  watchlist,
  toggleWatchlist,
}) {
  return (
    <div className="content">
      <PageTitle
        title="Stock Explorer"
        text="Explore tracked Indian equities."
      />

      <div className="stock-grid">
        {stocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
          />
        ))}
      </div>
    </div>
  );
}

function Movers({
  stocks,
  watchlist,
  toggleWatchlist,
}) {
  const sorted = [...stocks].sort(
    (a, b) =>
      Math.abs(Number(b.change || 0)) -
      Math.abs(Number(a.change || 0))
  );

  return (
    <div className="content">
      <PageTitle
        title="Market Movers"
        text="Stocks showing the largest tracked percentage movements."
      />

      <div className="stock-grid">
        {sorted.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
          />
        ))}
      </div>
    </div>
  );
}

function Anomalies({ stocks }) {
  const unusual = stocks.filter(
    (stock) => Math.abs(Number(stock.change || 0)) >= 2
  );

  return (
    <div className="content">
      <PageTitle
        title="Anomaly Monitor"
        text="A simple rule-based view of unusually large price movements."
      />

      <div className="panel">
        {unusual.length === 0 ? (
          <div className="empty">
            <Activity size={32} />
            <h3>No large movements detected</h3>
            <p>
              None of the currently tracked stocks moved
              2% or more.
            </p>
          </div>
        ) : (
          <div className="anomaly-list">
            {unusual.map((stock) => {
              const positive = Number(stock.change) >= 0;

              return (
                <div className="anomaly" key={stock.symbol}>
                  <div className="anomaly-icon">
                    <Activity size={18} />
                  </div>

                  <div>
                    <strong>{stock.name}</strong>
                    <span>{stock.symbol}</span>
                  </div>

                  <b className={positive ? "positive" : "negative"}>
                    {positive ? "+" : ""}
                    {Number(stock.change).toFixed(2)}%
                  </b>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Watchlist({
  stocks,
  watchlist,
  toggleWatchlist,
}) {
  const selected = stocks.filter((stock) =>
    watchlist.includes(stock.symbol)
  );

  return (
    <div className="content">
      <PageTitle
        title="Watchlist"
        text="Keep the stocks you want to monitor close."
      />

      {selected.length === 0 ? (
        <div className="panel empty">
          <Star size={35} />
          <h3>Your watchlist is empty</h3>
          <p>
            Add stocks using the star button in Stock Explorer.
          </p>
        </div>
      ) : (
        <div className="stock-grid">
          {selected.map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsPage({ dark, setDark }) {
  return (
    <div className="content">
      <PageTitle
        title="Settings"
        text="Customize your MarketPulse experience."
      />

      <div className="panel settings-panel">
        <div className="setting-row">
          <div>
            <strong>Dark Mode</strong>
            <span>Use a darker interface.</span>
          </div>

          <button
            className={`toggle ${dark ? "on" : ""}`}
            onClick={() => setDark(!dark)}
          >
            <i />
          </button>
        </div>

        <div className="setting-row">
          <div>
            <strong>Auto Refresh</strong>
            <span>Market data refreshes every 30 seconds.</span>
          </div>

          <div className="status-pill">
            ACTIVE
          </div>
        </div>
      </div>
    </div>
  );
}

function StockCard({
  stock,
  watchlist,
  toggleWatchlist,
}) {
  const positive = Number(stock.change) >= 0;
  const watched = watchlist.includes(stock.symbol);

  return (
    <div className="stock-card">
      <div className="stock-head">
        <div className="stock-logo">
          {stock.name.charAt(0)}
        </div>

        <button
          className={watched ? "star active" : "star"}
          onClick={() => toggleWatchlist(stock.symbol)}
        >
          <Star size={17} fill={watched ? "currentColor" : "none"} />
        </button>
      </div>

      <span className="stock-symbol">
        {stock.symbol}
      </span>

      <h3>{stock.name}</h3>

      <strong className="stock-price">
        ₹
        {stock.price
          ? Number(stock.price).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })
          : "--"}
      </strong>

      <div className="stock-change">
        {positive ? (
          <ArrowUpRight size={17} />
        ) : (
          <ArrowDownRight size={17} />
        )}

        <span className={positive ? "positive" : "negative"}>
          {positive ? "+" : ""}
          {Number(stock.change || 0).toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function StockList({
  stocks,
  watchlist,
  toggleWatchlist,
}) {
  return (
    <div className="stock-list">
      {stocks.map((stock) => {
        const positive = Number(stock.change) >= 0;

        return (
          <div className="stock-row" key={stock.symbol}>
            <div className="stock-mini-logo">
              {stock.name.charAt(0)}
            </div>

            <div className="stock-info">
              <strong>{stock.name}</strong>
              <span>{stock.symbol}</span>
            </div>

            <div className="stock-row-price">
              ₹
              {stock.price
                ? Number(stock.price).toLocaleString(
                    "en-IN",
                    { maximumFractionDigits: 2 }
                  )
                : "--"}
            </div>

            <span
              className={
                positive ? "positive change" : "negative change"
              }
            >
              {positive ? "+" : ""}
              {Number(stock.change || 0).toFixed(2)}%
            </span>

            <button
              className={
                watchlist.includes(stock.symbol)
                  ? "mini-star active"
                  : "mini-star"
              }
              onClick={() =>
                toggleWatchlist(stock.symbol)
              }
            >
              <Star size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MarketChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        Chart data unavailable
      </div>
    );
  }

  const values = data.map((item) => Number(item.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data
    .map((item, index) => {
      const x =
        (index / Math.max(data.length - 1, 1)) * 100;

      const y =
        90 -
        ((Number(item.value) - min) / range) * 75;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="chart-labels">
        <span>{data[0]?.time}</span>
        <span>
          {data[data.length - 1]?.time}
        </span>
      </div>
    </div>
  );
}

function PageTitle({ title, text }) {
  return (
    <div className="page-title">
      <span>MARKETPULSE</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export default App;