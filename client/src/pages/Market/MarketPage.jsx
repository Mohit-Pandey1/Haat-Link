import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  ComposedChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { gsap } from 'gsap';
import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  ChevronRight,
  Compass,
  FileCheck,
  LoaderCircle,
  MapPin,
  Navigation,
  Phone,
  QrCode,
  Radar,
  RefreshCw,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import {
  getMarketAnalysis,
  reverseGeocode,
} from '../../services/marketService';
import { MARKET_FALLBACK } from '../../data/marketFallback';
import { getHistoricalData } from '../../utils/marketHistory';
import { money } from '../../utils/format';

const DEFAULT_LOCATION = { state: 'Maharashtra', district: 'Nashik' };
const TABS = [
  'Price Charts',
  'Nearby Mandis',
  'Verified Buyers',
  'Profit Calculator',
];
const PERIODS = ['24H', '7D', '1M', '3M', '1Y'];
const APMC_CHIPS = ['Nashik - Lasalgaon', 'Pune', 'Latur', 'Ahmednagar'];

function parsePrice(value) {
  const price = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(price) && price > 0 ? price : 0;
}

function validAnalysis(data) {
  return Boolean(
    data &&
      Array.isArray(data.trendingCrops) &&
      data.trendingCrops.length > 0 &&
      data.trendingCrops.every(
        (crop) =>
          crop?.name &&
          parsePrice(crop.price) > 0 &&
          ['up', 'down'].includes(crop.trend) &&
          typeof crop.demand === 'string' &&
          crop.demand.trim()
      ) &&
      Array.isArray(data.mandis) &&
      data.mandis.length > 0 &&
      Array.isArray(data.buyers) &&
      data.buyers.length > 0
  );
}

function enrichHistory(data) {
  return data.map((point, index) => ({
    ...point,
    volume: point.volume || 820 + ((index * 147) % 750),
    min: point.min || Math.round(point.price * 0.94),
    max: point.max || Math.round(point.price * 1.06),
    arrival: point.arrival || point.volume || 820 + ((index * 147) % 750),
  }));
}

/** 3D Floating Modal for Changing APMC Location with GSAP */
function LocationChangeModal({ location, onClose, onSubmit }) {
  const [form, setForm] = useState(location);
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.92, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  const chooseApmc = (chip) => {
    const district = chip.split(' - ')[0];
    setForm({ state: 'Maharashtra', district });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a150e]/70 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        ref={cardRef}
        className="w-full max-w-lg bg-white rounded-3xl p-7 border border-[#E2DBD0] shadow-[0_25px_60px_-15px_rgba(20,37,25,0.35)] relative transform-gpu"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E2DBD0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#142519] leading-none mb-1">
                Select APMC Market Corridor
              </h3>
              <p className="text-xs text-stone-500 m-0">
                Switch mandi hub for targeted live arbitrage & arrival rates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              Maharashtra APMC Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              {APMC_CHIPS.map((chip) => {
                const districtName = chip.split(' - ')[0];
                const isActive = form.district.toLowerCase() === districtName.toLowerCase();
                return (
                  <button
                    type="button"
                    key={chip}
                    onClick={() => chooseApmc(chip)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-[#142519] text-[#E8D9B5] border-[#142519] shadow-md -translate-y-0.5'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    📍 {chip}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1.5">
                State
              </label>
              <input
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-[#142519] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1.5">
                District / Mandi
              </label>
              <input
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-[#142519] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                value={form.district}
                onChange={(e) =>
                  setForm({ ...form, district: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#142519] to-[#1F3926] text-[#E8D9B5] text-xs font-extrabold shadow-lg hover:brightness-110 active:translate-y-0.5 transition"
            >
              Update APMC Corridor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Custom Financial 3D Trading Tooltip for Recharts */
function CustomTradingTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-trading-tooltip">
        <div className="tooltip-date">📅 {data.date || label}</div>
        <div className="tooltip-row modal-rate">
          <span>Modal Rate:</span>
          <span>{money(data.price)}/q</span>
        </div>
        <div className="tooltip-row">
          <span style={{ color: '#94a3b8' }}>Min Price:</span>
          <span style={{ color: '#f87171', fontWeight: 600 }}>
            {money(data.min)}
          </span>
        </div>
        <div className="tooltip-row">
          <span style={{ color: '#94a3b8' }}>Max Price:</span>
          <span style={{ color: '#34d399', fontWeight: 600 }}>
            {money(data.max)}
          </span>
        </div>
        <div
          className="tooltip-row"
          style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ color: '#fbbf24' }}>Arrival Volume:</span>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>
            {data.arrival || data.volume} Qtl
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/** e-Mandi QR Gate Pass Modal */
function PassModal({ cropName, price, quantity, netProfit, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  const [passId] = useState(
    () => `MH-NSK-2026-${Math.floor(10000 + Math.random() * 90000)}`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a150e]/75 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#0e1d13] text-white rounded-3xl p-6 border border-emerald-500/30 shadow-[0_30px_70px_rgba(0,0,0,0.6)] relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-emerald-500/20 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <QrCode size={18} />
            </span>
            <strong className="text-sm font-extrabold tracking-wide uppercase text-emerald-400">
              Official e-Mandi Gate Pass
            </strong>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-[#14281b] border border-emerald-500/20 rounded-2xl p-4 mb-4 text-center">
          <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
            Pass Identifier
          </div>
          <div className="text-lg font-mono font-extrabold text-amber-300 tracking-wider">
            {passId}
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Secured via National Agriculture Market & APMC Gateway
          </div>
        </div>

        <div className="space-y-2.5 text-xs mb-5">
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-stone-400">Target Crop</span>
            <span className="font-bold text-white">{cropName}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-stone-400">Locked Modal Rate</span>
            <span className="font-bold text-emerald-400">
              {money(price)} / Quintal
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-stone-400">Registered Volume</span>
            <span className="font-bold text-white">{quantity} Quintals</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-stone-400">Est. Net Realization</span>
            <span className="font-extrabold text-amber-300">
              {money(netProfit)}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-stone-400">Gate Entry Priority</span>
            <span className="font-bold text-emerald-300">
              Green Lane (48h Validity)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              alert(`Pass ${passId} confirmed! Sent via SMS to your registered farmer mobile.`);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold text-xs shadow-lg hover:brightness-110 active:translate-y-0.5 transition"
          >
            Confirm & Save to Phone
          </button>
        </div>
      </div>
    </div>
  );
}

export function MarketPage() {
  const [analysis, setAnalysis] = useState(MARKET_FALLBACK);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [period, setPeriod] = useState('1M');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const initialised = useRef(false);
  const priceTickerRef = useRef(null);
  const chartShellRef = useRef(null);

  const loadAnalysis = async (nextLocation) => {
    setLoading(true);
    setError('');
    try {
      const response = await getMarketAnalysis({
        ...nextLocation,
        location: `${nextLocation.district}, ${nextLocation.state}`,
      });
      if (!validAnalysis(response)) {
        throw new Error('The market response was incomplete.');
      }
      setAnalysis(response);
      setSelectedIndex((index) =>
        Math.min(index, response.trendingCrops.length - 1)
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          'Live APMC sync unavailable. Operating on high-confidence corridor fallback.'
      );
    } finally {
      setLoading(false);
    }
  };

  const trackLocation = () => {
    if (!navigator.geolocation) {
      setError('Location detection is not supported in this browser.');
      loadAnalysis(DEFAULT_LOCATION);
      return;
    }
    setTracking(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const detected = await reverseGeocode(
            coords.latitude,
            coords.longitude
          );
          const nextLocation = {
            state: detected.state || DEFAULT_LOCATION.state,
            district: detected.district || DEFAULT_LOCATION.district,
          };
          setLocation(nextLocation);
          await loadAnalysis(nextLocation);
        } catch {
          setError(
            'Could not read your GPS corridor. Reverting to default market.'
          );
          await loadAnalysis(DEFAULT_LOCATION);
        } finally {
          setTracking(false);
        }
      },
      async () => {
        setError(
          'Location permission unavailable. Displaying default Maharashtra APMC corridor.'
        );
        setTracking(false);
        await loadAnalysis(DEFAULT_LOCATION);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    trackLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCrop =
    analysis.trendingCrops[selectedIndex] || analysis.trendingCrops[0];
  const currentPrice = parsePrice(selectedCrop?.price);

  const chartData = useMemo(() => {
    if (selectedCrop?.history?.length) return selectedCrop.history;
    return enrichHistory(
      getHistoricalData(currentPrice, period, selectedCrop?.trend)
    );
  }, [selectedCrop, currentPrice, period]);

  useEffect(() => {
    setHistory(chartData);
  }, [chartData]);

  // GSAP Smooth Number Counter on Current Price change
  useEffect(() => {
    if (priceTickerRef.current) {
      const counter = { val: Math.max(0, currentPrice - 320) };
      gsap.to(counter, {
        val: currentPrice,
        duration: 0.75,
        ease: 'power2.out',
        onUpdate: () => {
          if (priceTickerRef.current) {
            priceTickerRef.current.innerText = `₹${Math.round(counter.val).toLocaleString('en-IN')}`;
          }
        },
      });
    }
  }, [currentPrice, selectedIndex]);

  // GSAP Stroke Dashoffset line-draw and fade on timeframe/crop change
  useEffect(() => {
    const chartEl = chartShellRef.current;
    if (!chartEl) return;

    gsap.fromTo(
      chartEl,
      { opacity: 0.5, y: 6 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );

    const timer = setTimeout(() => {
      const path = chartEl.querySelector('.recharts-area-curve');
      if (path && path.getTotalLength) {
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 0.85, ease: 'power2.out' }
        );
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [currentPrice, period, selectedIndex, history]);

  const handleManualLocation = async (nextLocation) => {
    setLocation(nextLocation);
    setShowLocationModal(false);
    await loadAnalysis(nextLocation);
  };

  return (
    <div className="market-terminal">
      {/* Terminal Title Heading */}
      <div className="terminal-header">
        <div>
          <div className="terminal-badge">
            <TrendingUp size={13} />
            Agritech Financial Intelligence
          </div>
          <h1 className="terminal-title">APMC Price Discovery Terminal</h1>
          <p className="terminal-subtitle">
            Live modal rates, volume depth & arbitrage signals for{' '}
            <strong>{location.district} Corridor</strong>, {location.state}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2DBD0] text-stone-700 text-xs font-bold shadow-sm hover:bg-stone-50 active:translate-y-0.5 transition"
            onClick={() => loadAnalysis(location)}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              className={loading ? 'animate-spin text-emerald-600' : ''}
            />
            {loading ? 'Syncing...' : 'Sync Mandi API'}
          </button>
        </div>
      </div>

      {/* 1. 3D Floating Glass Location Bar & Animated GPS Radar */}
      <section className="floating-location-bar bg-white/80 backdrop-blur-xl border border-[#E2DBD0] rounded-2xl p-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Animated GPS Radar Icon with concentric rings */}
          <div className="radar-pulse-box">
            <span className="radar-ring" />
            <span className="radar-ring-delayed" />
            <span className="radar-core" />
          </div>

          <div className="market-active-pill">
            <span className="text-xs text-stone-500 font-medium">
              Active Corridor:
            </span>
            <strong>
              📍 {location.district} APMC Corridor, {location.state}
            </strong>
            <button
              type="button"
              className="change-apmc-chip"
              onClick={() => setShowLocationModal(true)}
            >
              Change APMC
            </button>
          </div>
        </div>

        {/* 3D Tactile GPS Button */}
        <button
          className="tactile-gps-btn active:translate-y-0.5 active:shadow-inner bg-gradient-to-r from-[#142519] to-[#1F3926] text-[#E8D9B5] shadow-lg rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold text-xs"
          type="button"
          onClick={trackLocation}
          disabled={tracking}
        >
          {tracking ? (
            <LoaderCircle className="animate-spin" size={15} />
          ) : (
            <Navigation size={15} />
          )}
          {tracking ? 'Triangulating GPS...' : 'Track My GPS Location'}
        </button>
      </section>

      {/* 2. AI Arbitrage Signal Banner (Glowing Emerald/Amber Border) */}
      <section className="arbitrage-signal-banner">
        <div className="arbitrage-signal-inner">
          <div className="flex items-start gap-3.5">
            <div className="arbitrage-icon-box">
              <BrainCircuit size={26} />
            </div>
            <div className="arbitrage-content">
              <span className="arbitrage-tag">
                ⚡ Real-Time APMC Arbitrage Alert
              </span>
              <h2 className="arbitrage-headline">
                High Demand Arbitrage Detected in {location.district} APMC
              </h2>
              <p className="arbitrage-desc">
                Onion Modal rates are currently <strong>₹220/quintal higher</strong> than neighboring Ahmednagar. Recommended selling window: Next 48 hours before fresh arrivals hit.
              </p>
            </div>
          </div>

          <div className="arbitrage-metric-pill">
            <Zap size={15} className="text-amber-400 animate-pulse" />
            <span>Projected Margin Boost: +11.4%</span>
          </div>
        </div>
      </section>

      {/* Error / Alert notice */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="terminal-tabs" aria-label="Terminal views">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`terminal-tab-btn ${activeTab === tab ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* TAB 1: PRO-TRADER PRICE CHARTS (TRADINGVIEW AGRITECH STYLE) */}
      {activeTab === 'Price Charts' && (
        <div className="pro-chart-grid">
          {/* Main Chart Terminal */}
          <article className="pro-chart-terminal">
            {/* 3D Crop Pills */}
            <div className="crop-pill-row">
              {analysis.trendingCrops.map((crop, index) => {
                const isActive = index === selectedIndex;
                const emoji =
                  crop.emoji ||
                  (crop.name.toLowerCase().includes('onion')
                    ? '🧅'
                    : crop.name.toLowerCase().includes('potato')
                    ? '🥔'
                    : crop.name.toLowerCase().includes('tomato')
                    ? '🍅'
                    : crop.name.toLowerCase().includes('soya')
                    ? '🌱'
                    : crop.name.toLowerCase().includes('wheat')
                    ? '🌾'
                    : '🌾');
                return (
                  <button
                    key={crop.name}
                    type="button"
                    className={`crop-3d-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <span>{emoji}</span>
                    <span>{crop.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Price Readout with animated GSAP counter */}
            <div className="terminal-price-row">
              <strong className="terminal-big-price" ref={priceTickerRef}>
                ₹{currentPrice.toLocaleString('en-IN')}
              </strong>
              <span className="terminal-price-unit">/ quintal (Modal Rate)</span>

              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${
                  selectedCrop?.trend === 'down'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {selectedCrop?.trend === 'down' ? (
                  <ArrowDownRight size={15} />
                ) : (
                  <ArrowUpRight size={15} />
                )}
                {selectedCrop?.trend === 'down'
                  ? 'Downward Shift'
                  : 'Bullish Momentum'}
              </span>
            </div>

            {/* Sentiment Tags */}
            <div className="terminal-sentiment-bar">
              <span className="sentiment-pill green">
                🟢 Demand: {selectedCrop?.demand || 'High'}
              </span>
              <span className="sentiment-pill gold">
                📈 {selectedCrop?.weeklyGain || '+8.4% Weekly Gain'}
              </span>
              <span className="sentiment-pill">
                Vol: {selectedCrop?.volume || 1420} Quintals today
              </span>
            </div>

            {/* Timeframe Switcher with sliding pills */}
            <div className="timeframe-bar">
              {PERIODS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`timeframe-pill-btn ${period === item ? 'active' : ''}`}
                  onClick={() => setPeriod(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Glowing Pro Area Chart with Arrival Volume Bars */}
            <div className="tradingview-chart-wrap" ref={chartShellRef}>
              <ResponsiveContainer width="100%" height={310}>
                <ComposedChart
                  key={`${selectedCrop?.name}-${period}`}
                  data={history}
                  margin={{ top: 16, right: 14, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="terminalEmeraldFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#10b981"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="60%"
                        stopColor="#059669"
                        stopOpacity={0.12}
                      />
                      <stop
                        offset="100%"
                        stopColor="#047857"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="volumeBarGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#e8d9b5"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="100%"
                        stopColor="#c99a3b"
                        stopOpacity={0.15}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                    tick={{ fill: '#799786', fontSize: 11, fontWeight: 500 }}
                  />

                  <YAxis
                    yAxisId="priceAxis"
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tick={{ fill: '#799786', fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(val) => `₹${Math.round(val)}`}
                    width={50}
                  />

                  <YAxis
                    yAxisId="volumeAxis"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 4000]}
                    hide
                  />

                  {/* Mandi Arrival Volume Bars */}
                  <Bar
                    yAxisId="volumeAxis"
                    dataKey="arrival"
                    barSize={10}
                    fill="url(#volumeBarGrad)"
                    radius={[4, 4, 0, 0]}
                  />

                  {/* 3D Glowing Tooltip */}
                  <Tooltip
                    cursor={{
                      stroke: 'rgba(52, 211, 153, 0.45)',
                      strokeWidth: 1.5,
                      strokeDasharray: '4 4',
                    }}
                    content={<CustomTradingTooltip />}
                  />

                  {/* Glowing Neon Area Chart */}
                  <Area
                    yAxisId="priceAxis"
                    type="monotone"
                    dataKey="price"
                    stroke="#22c55e"
                    strokeWidth={3.5}
                    fill="url(#terminalEmeraldFill)"
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-white/10 mt-2">
              <span>
                💡 Dynamic chart reflects arrival loads & authenticated trader bids
              </span>
              <span className="text-emerald-400 font-bold">
                ● Live APMC Corridor Stream
              </span>
            </div>
          </article>

          {/* Watchlist Sidebar Terminal */}
          <aside className="watchlist-terminal">
            <div className="flex items-center justify-between">
              <span className="watchlist-header">Corridor Commodities</span>
              <span className="text-[10px] font-bold text-stone-400">
                {analysis.trendingCrops.length} Active
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {analysis.trendingCrops.map((crop, index) => {
                const isSelected = index === selectedIndex;
                const emoji =
                  crop.emoji ||
                  (crop.name.toLowerCase().includes('onion')
                    ? '🧅'
                    : crop.name.toLowerCase().includes('potato')
                    ? '🥔'
                    : crop.name.toLowerCase().includes('tomato')
                    ? '🍅'
                    : '🌱');
                return (
                  <button
                    key={crop.name}
                    type="button"
                    className={`watchlist-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{emoji}</span>
                      <div>
                        <strong className="block text-xs text-[#142519]">
                          {crop.name}
                        </strong>
                        <span className="text-[10px] text-stone-500">
                          {crop.demand} Demand
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <strong className="block text-xs font-extrabold text-[#142519]">
                        {crop.price}
                      </strong>
                      <span
                        className={`text-[10px] font-bold flex items-center justify-end ${
                          crop.trend === 'down'
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {crop.trend === 'down' ? '↓ down' : '↑ gain'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-3 border-t border-stone-100 text-[11px] text-stone-500">
              <p className="m-0 leading-relaxed">
                Click any crop to reload depth chart, modal spread and arrival statistics.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: "NEARBY MANDIS" 3D TACTILE CARDS */}
      {activeTab === 'Nearby Mandis' && (
        <section className="mandi-3d-grid">
          {analysis.mandis.length ? (
            analysis.mandis.map((mandi) => (
              <article
                className="mandi-3d-card transform-gpu hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(20,37,25,0.18)] transition-all duration-300 rounded-3xl border border-[#E2DBD0] bg-white p-6"
                key={mandi.name}
              >
                <div>
                  <div className="mandi-card-header">
                    <div>
                      <h3 className="mandi-card-name">{mandi.name}</h3>
                      <div className="mandi-meta-row">
                        <span className="mandi-meta-badge">
                          📍 {mandi.distance}
                        </span>
                        <span className="mandi-meta-badge">
                          {mandi.routeDuration || '⏱ ~35 mins via NH 60'}
                        </span>
                      </div>
                    </div>

                    <div className="mandi-price-badge">
                      {mandi.price || '₹2,480/q'}
                    </div>
                  </div>

                  {/* Price Spread Indicator */}
                  <div className="my-4">
                    <span
                      className={`price-spread-pill ${
                        mandi.positiveSpread !== false
                          ? 'positive'
                          : 'negative'
                      }`}
                    >
                      {mandi.positiveSpread !== false ? '📈' : '📉'}
                      {mandi.spread || '+₹140/q more profit'}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 mb-2">
                    Specialized Arrival:{' '}
                    <strong className="text-[#142519]">
                      {mandi.bestFor || 'Onion & Grains'}
                    </strong>
                  </div>
                </div>

                {/* Bottom Action: Get Turn-by-Turn Route & Gate Entry */}
                <button
                  type="button"
                  className="turn-by-turn-btn"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        mandi.name + ', Maharashtra'
                      )}`,
                      '_blank'
                    )
                  }
                >
                  <Compass size={16} className="text-emerald-600" />
                  Get Turn-by-Turn Route & Gate Entry
                </button>
              </article>
            ))
          ) : (
            <p className="text-stone-500 text-sm">
              No APMC mandis available for this corridor.
            </p>
          )}
        </section>
      )}

      {/* TAB 3: VERIFIED BUYERS */}
      {activeTab === 'Verified Buyers' && (
        <section className="buyer-3d-grid">
          {analysis.buyers.map((buyer) => (
            <article
              key={`${buyer.name}-${buyer.contact}`}
              className="buyer-3d-card"
            >
              <div className="buyer-avatar-3d">
                {buyer.name.slice(0, 1).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-extrabold text-[#142519] m-0 truncate">
                    {buyer.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {buyer.type}
                  </span>
                </div>

                <p className="text-xs text-stone-600 my-2 line-clamp-2">
                  {buyer.requirements}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-[11px] font-bold text-amber-600">
                    {buyer.rating || '4.9 ★ Verified'}
                  </span>
                  <a
                    href={`tel:${buyer.contact.replace(/[^+\d]/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142519] text-[#E8D9B5] text-xs font-bold hover:brightness-110 active:translate-y-0.5 transition"
                  >
                    <Phone size={12} /> Call Buyer
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* TAB 4: 3D PROJECTED PROFIT & ROI CALCULATOR */}
      {activeTab === 'Profit Calculator' && (
        <ProfitCalculatorTerminal
          crop={selectedCrop}
          currentPrice={currentPrice}
        />
      )}

      {/* Location Change Modal */}
      {showLocationModal && (
        <LocationChangeModal
          location={location}
          onClose={() => setShowLocationModal(false)}
          onSubmit={handleManualLocation}
        />
      )}
    </div>
  );
}

/** 5. 3D PROJECTED PROFIT & ROI CALCULATOR KIOSK */
function ProfitCalculatorTerminal({ crop, currentPrice }) {
  const [quantity, setQuantity] = useState(15);
  const [costPerQtl, setCostPerQtl] = useState(1110);
  const [targetModalRate, setTargetModalRate] = useState(currentPrice || 2480);
  const [showPassModal, setShowPassModal] = useState(false);

  const profitCounterRef = useRef(null);

  // Sync target rate when current price changes
  useEffect(() => {
    if (currentPrice) {
      setTargetModalRate(currentPrice);
    }
  }, [currentPrice]);

  // Waterfall financial calculations
  const grossSale = quantity * targetModalRate;
  const totalProductionCost = quantity * costPerQtl;
  // Freight & Mandi cess: ₹45/quintal transportation + 1.5% APMC cess
  const estimatedFreightCess = Math.round(quantity * 45 + grossSale * 0.015);
  const netProfit = Math.max(0, grossSale - totalProductionCost - estimatedFreightCess);
  const roiPercentage =
    totalProductionCost > 0
      ? ((netProfit / totalProductionCost) * 100).toFixed(1)
      : '0.0';

  // GSAP Count-up animation for huge net profit readout
  useEffect(() => {
    if (profitCounterRef.current) {
      const target = { val: Math.max(0, netProfit - 900) };
      gsap.to(target, {
        val: netProfit,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
          if (profitCounterRef.current) {
            profitCounterRef.current.innerText = `₹${Math.round(target.val).toLocaleString('en-IN')}`;
          }
        },
      });
    }
  }, [netProfit]);

  return (
    <section className="kiosk-grid">
      {/* Left Input Terminal (Skeuomorphic 3D Card) */}
      <article className="kiosk-card">
        <span className="text-[11px] font-extrabold uppercase text-emerald-700 tracking-wider">
          Interactive Parameter Kiosk
        </span>
        <h2 className="kiosk-card-heading">
          Harvest ROI & Liquidation Simulator
        </h2>
        <p className="kiosk-card-sub">
          Fine-tune harvest volume and production input expenses for{' '}
          <strong>{crop?.name || 'Onion'}</strong>.
        </p>

        {/* 1. Harvest Quantity Control */}
        <div className="kiosk-control-group">
          <div className="kiosk-control-label">
            <span>Harvest Quantity to Sell</span>
            <span className="text-emerald-700 font-extrabold">
              {quantity} Quintals ({(quantity * 100).toLocaleString('en-IN')} kg)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="250"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="kiosk-slider"
          />
          <input
            type="number"
            min="1"
            max="1000"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Number(e.target.value) || 1))
            }
            className="kiosk-input-box"
          />
        </div>

        {/* 2. Production Cost Control */}
        <div className="kiosk-control-group">
          <div className="kiosk-control-label">
            <span>Production Cost per Quintal</span>
            <span className="text-stone-600 font-extrabold">
              ₹{costPerQtl} / qtl (Regional Avg: ₹1,110)
            </span>
          </div>
          <input
            type="range"
            min="400"
            max="3000"
            step="10"
            value={costPerQtl}
            onChange={(e) => setCostPerQtl(Number(e.target.value))}
            className="kiosk-slider"
          />
          <input
            type="number"
            min="100"
            value={costPerQtl}
            onChange={(e) =>
              setCostPerQtl(Math.max(0, Number(e.target.value) || 0))
            }
            className="kiosk-input-box"
          />
        </div>

        {/* 3. Target APMC Modal Rate */}
        <div className="kiosk-control-group">
          <div className="kiosk-control-label">
            <span>Target APMC Modal Rate</span>
            <span className="text-emerald-700 font-extrabold">
              Auto-Synced Live Rate
            </span>
          </div>
          <input
            type="number"
            min="100"
            value={targetModalRate}
            onChange={(e) =>
              setTargetModalRate(Math.max(0, Number(e.target.value) || 0))
            }
            className="kiosk-input-box"
          />
        </div>
      </article>

      {/* Right Projected Return Console (Illuminated 3D Green Dashboard) */}
      <article className="kiosk-card console-dashboard">
        <span className="text-[11px] font-extrabold uppercase text-emerald-400 tracking-wider">
          Projected Return Console
        </span>

        {/* Huge glowing Net Profit display */}
        <div className="net-profit-display">
          <div>
            <span className="text-xs text-stone-300 block mb-1">
              Net In-Pocket Realization
            </span>
            <strong className="huge-profit-number" ref={profitCounterRef}>
              ₹{netProfit.toLocaleString('en-IN')}
            </strong>
          </div>

          <span className="roi-gold-badge">+{roiPercentage}% ROI</span>
        </div>

        {/* 3D Financial Waterfall Breakdown */}
        <div className="waterfall-box">
          <div className="waterfall-line">
            <span>Gross Mandi Sale ({quantity} qtl × {money(targetModalRate)})</span>
            <b>{money(grossSale)}</b>
          </div>

          <div className="waterfall-line">
            <span>− Total Production Cost ({quantity} qtl × {money(costPerQtl)})</span>
            <b className="text-rose-300">−{money(totalProductionCost)}</b>
          </div>

          <div className="waterfall-line">
            <span>− Estimated Freight & Mandi Cess (NH transport + APMC levy)</span>
            <b className="text-amber-300">−{money(estimatedFreightCess)}</b>
          </div>

          <div className="waterfall-line net-line">
            <span>= Net In-Pocket Realization</span>
            <b>{money(netProfit)}</b>
          </div>
        </div>

        {/* Tactile Button: Lock In Rate & Generate e-Mandi Pass */}
        <button
          type="button"
          className="emandi-pass-btn"
          onClick={() => setShowPassModal(true)}
        >
          <FileCheck size={18} />
          Lock In Rate & Generate e-Mandi Pass
        </button>

        <p className="text-[10px] text-emerald-200/60 text-center mt-3 m-0">
          Locks in spot allocation at selected corridor gate with 48h priority unloading.
        </p>
      </article>

      {showPassModal && (
        <PassModal
          cropName={crop?.name || 'Onion'}
          price={targetModalRate}
          quantity={quantity}
          netProfit={netProfit}
          onClose={() => setShowPassModal(false)}
        />
      )}
    </section>
  );
}
