import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeIndianRupee,
  Check,
  CircleDollarSign,
  FileCheck2,
  PackageCheck,
  Sprout,
  TrendingUp,
  Truck,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { getDashboardStats } from '../../services/dashboardService';
import { getMarketByCrop } from '../../services/marketService';
import { PageTitle } from '../../components/common/PageTitle';
import { money } from '../../utils/format';

const CHART_HISTORY = [
  { day: 'Mon', price: 2280 },
  { day: 'Tue', price: 2320 },
  { day: 'Wed', price: 2350 },
  { day: 'Thu', price: 2410 },
  { day: 'Fri', price: 2420 },
  { day: 'Sat', price: 2450 },
  { day: 'Sun', price: 2480 },
];

const activeStatuses = ['Deal Created', 'Pickup Scheduled', 'In Transit'];

function DashboardStat({ icon: Icon, tone, label, value, detail, badge }) {
  return (
    <article className="dashboard-stat-card">
      <div className={`dashboard-stat-icon ${tone}`}>
        {React.createElement(Icon, { size: 19 })}
      </div>
      <div className="dashboard-stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      {badge && (
        <em className={`dashboard-stat-badge ${badge.tone || ''}`}>
          {badge.label}
        </em>
      )}
    </article>
  );
}

export function DashboardPage() {
  const { farmer, crops, cropsLoading, deals } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [onionMarket, setOnionMarket] = useState(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [chartRange, setChartRange] = useState('7 Days');

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((error) => setStatsError(error.message))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    getMarketByCrop('Onion')
      .then(setOnionMarket)
      .catch(() => setOnionMarket(null))
      .finally(() => setMarketLoading(false));
  }, []);

  const featuredCrop = crops.find((crop) => crop.name === 'Onion') || crops[0];
  const activeDeal = deals.find((deal) => activeStatuses.includes(deal.status));
  const bestMarket = onionMarket?.markets?.reduce(
    (best, market) => (!best || market.price > best.price ? market : best),
    null
  );
  const chartData = useMemo(() => CHART_HISTORY, []);
  const firstName = farmer.name.split(' ')[0];
  const totalQuantity =
    stats?.totalQuantity ||
    crops.reduce((sum, crop) => sum + (crop.quantity || 0), 0);
  const cropCount = stats?.cropCount ?? crops.length;
  const activeDealCount = stats?.activeDeals ?? stats?.dealCount ?? 0;

  if (statsLoading || cropsLoading) {
    return (
      <>
        <PageTitle title={`Good morning, ${firstName}`} />
        <p className="intro">Loading your mandi desk…</p>
      </>
    );
  }

  if (statsError) {
    return (
      <>
        <PageTitle title="Dashboard" />
        <p className="intro dashboard-error">
          Could not load your mandi desk: {statsError}
        </p>
      </>
    );
  }

  return (
    <div className="dashboard-home">
      <section className="dashboard-welcome-row">
        <div>
          <p className="dashboard-date">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <h1>
            Good morning, {firstName} <span aria-hidden="true">👋</span>
          </h1>
          <p>
            Here&apos;s how your harvest is positioned across Maharashtra mandis
            today.
          </p>
        </div>
        <button
          className="dashboard-crops-cta"
          type="button"
          onClick={() => navigate('/crops')}
        >
          <Sprout size={17} /> View My Crops
        </button>
      </section>

      <section className="dashboard-kpi-grid" aria-label="Farm overview">
        <DashboardStat
          icon={Sprout}
          tone="gold"
          label="Total Crops"
          value={cropCount}
          detail={`${totalQuantity} quintals ready`}
          badge={{ label: `${Math.min(cropCount, 3)} GI Tagged`, tone: 'gold' }}
        />
        <DashboardStat
          icon={TrendingUp}
          tone="green"
          label="Best Available Price"
          value={bestMarket ? `${money(bestMarket.price)} / qtl` : '—'}
          detail={`${bestMarket?.name || 'Nearby APMC'} • Onion Grade A`}
          badge={{
            label: onionMarket?.change
              ? `+${onionMarket.change}% ↗`
              : 'Market watch',
            tone: 'green',
          }}
        />
        <DashboardStat
          icon={Truck}
          tone="purple"
          label="Active Deals"
          value={`${activeDealCount} Deal${activeDealCount === 1 ? '' : 's'} Active`}
          detail={
            activeDeal
              ? `Pickup scheduled by ${activeDeal.buyer}`
              : 'No pickup scheduled'
          }
          badge={{ label: activeDeal?.status || 'Watching', tone: 'purple' }}
        />
        <DashboardStat
          icon={CircleDollarSign}
          tone="amber"
          label="Pending Payment"
          value="₹72,000"
          detail="Direct Escrow Payout"
          badge={{ label: 'Expected in 3 days', tone: 'amber' }}
        />
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-primary-column">
          <article className="advisor-card">
            <div className="advisor-topline">
              <span className="advisor-engine">
                <span>✦</span> AI Mandi Advisor
              </span>
              <span className="advisor-match">
                <Check size={13} /> 94% Match Rate
              </span>
            </div>
            <div className="advisor-heading">
              <div>
                <p>Best route for this harvest</p>
                <h2>
                  Sell {featuredCrop?.name || 'Onion'} (Grade A) to{' '}
                  {activeDeal?.buyer || 'ABC Foods'}
                </h2>
              </div>
              <BadgeIndianRupee size={34} />
            </div>
            <div className="advisor-insights">
              <div className="advisor-highlight">
                <span>Recommendation</span>
                <strong>SELL NOW</strong>
                <p>
                  Nashik supply is peaking soon; the current price window is
                  healthy.
                </p>
              </div>
              <div className="advisor-profit">
                <span>Net realization</span>
                <strong>
                  {money(activeDeal?.net || 2520)} <small>/ qtl</small>
                </strong>
                <p>
                  Gross: {money(activeDeal?.price || 2700)} <b>−</b> Logistics
                  &amp; mandi fee:{' '}
                  {money(
                    (activeDeal?.price || 2700) - (activeDeal?.net || 2520)
                  )}{' '}
                  <b>=</b> Net: {money(activeDeal?.net || 2520)}
                </p>
              </div>
            </div>
            <div className="advisor-tags">
              <span>
                <Check size={13} /> High Current Demand
              </span>
              <span>
                <Check size={13} /> Verified Institutional Buyer
              </span>
              <span>
                <Check size={13} /> Farmgate Pickup Included
              </span>
            </div>
            <div className="advisor-actions">
              <button
                className="advisor-primary"
                type="button"
                onClick={() => navigate('/recommendation')}
              >
                Accept Deal &amp; Lock Price <ArrowRight size={16} />
              </button>
              <button
                className="advisor-secondary"
                type="button"
                onClick={() => navigate('/market')}
              >
                Compare Other APMCs
              </button>
            </div>
          </article>

          <MarketPulseCard
            market={onionMarket}
            loading={marketLoading}
            range={chartRange}
            setRange={setChartRange}
            data={chartData}
          />
        </div>

        <aside className="dashboard-side-column">
          <article className="activity-card">
            <div className="dashboard-card-heading">
              <div>
                <span>Farm activity</span>
                <h2>Stay on top of your farm</h2>
              </div>
              <FileCheck2 size={19} />
            </div>
            <div className="activity-feed">
              {(stats?.notifications || []).slice(0, 3).map((notification) => (
                <div className="dashboard-activity" key={notification._id}>
                  <i />
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.text}</p>
                    <small>{notification.time}</small>
                  </div>
                </div>
              ))}
              {!stats?.notifications?.length && (
                <p className="dashboard-empty">
                  Your mandi updates will appear here.
                </p>
              )}
            </div>
          </article>
          {featuredCrop && (
            <article className="harvest-card">
              <div className="dashboard-card-heading">
                <div>
                  <span>Ready for market</span>
                  <h2>
                    {featuredCrop.name} — {featuredCrop.quality}
                  </h2>
                </div>
                <span className="harvest-emoji">{featuredCrop.emoji}</span>
              </div>
              <div className="harvest-stock">
                <PackageCheck size={17} />
                <strong>{featuredCrop.quantity} Quintals Ready</strong>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/buyers?crop=${featuredCrop._id}`)}
              >
                Find Matching Buyers <ArrowRight size={15} />
              </button>
            </article>
          )}
        </aside>
      </section>
    </div>
  );
}

function MarketPulseCard({ market, loading, range, setRange, data }) {
  return (
    <article className="market-pulse-card">
      <div className="dashboard-card-heading">
        <div>
          <span>Market pulse</span>
          <h2>
            Onion Price Trend <small>(Nashik APMC)</small>
          </h2>
        </div>
        <Link className="market-detail-link" to="/market">
          Open market <ArrowRight size={14} />
        </Link>
      </div>
      {loading ? (
        <p className="dashboard-empty">Loading market prices…</p>
      ) : market ? (
        <>
          <div className="pulse-price">
            <strong>
              {money(market.average)} <small>/ qtl</small>
            </strong>
            <span>+{market.change}% vs last week</span>
          </div>
          <div className="chart-range-toggle">
            {['7 Days', '15 Days', '1 Month', 'Season View'].map((item) => (
              <button
                className={range === item ? 'active' : ''}
                type="button"
                key={item}
                onClick={() => setRange(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={data}
                margin={{ top: 18, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="dashboardGreenFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4B6043" stopOpacity={0.32} />
                    <stop
                      offset="100%"
                      stopColor="#4B6043"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#e7e2d4"
                  strokeDasharray="4 5"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a8d7b', fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8a8d7b', fontSize: 10 }}
                  tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                  width={42}
                />
                <Tooltip
                  cursor={{ stroke: '#c99a3b', strokeDasharray: '3 3' }}
                  contentStyle={{
                    border: 0,
                    borderRadius: 10,
                    boxShadow: '0 10px 24px #2a231822',
                  }}
                  formatter={(value) => [money(value), 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#4B6043"
                  strokeWidth={3}
                  fill="url(#dashboardGreenFill)"
                  dot={{
                    r: 3,
                    fill: '#C99A3B',
                    strokeWidth: 2,
                    stroke: '#fff',
                  }}
                  activeDot={{
                    r: 6,
                    fill: '#C99A3B',
                    stroke: '#fff',
                    strokeWidth: 3,
                  }}
                  isAnimationActive
                  animationDuration={1100}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="dashboard-empty">Market data unavailable.</p>
      )}
    </article>
  );
}
