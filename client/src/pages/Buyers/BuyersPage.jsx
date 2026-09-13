import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { validateOffer, formatDate } from '../../utils/validation';
import { money } from '../../utils/format';
import { gsap } from 'gsap';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  Filter,
  Layers,
  LoaderCircle,
  Lock,
  MapPin,
  Package,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  X,
  Zap,
} from 'lucide-react';

/** Remove presentation suffix like "(buyer)" */
const formatBuyerName = (name) => {
  if (!name) return 'ABC Foods Pvt Ltd';
  return name.replace(/\s*\(buyer\)/gi, '').trim() || 'ABC Foods Pvt Ltd';
};

const SAMPLE_REQUIREMENTS = [
  {
    _id: 'req-sample-01',
    buyer: 'ABC Foods Pvt Ltd',
    crop: 'Onion',
    variety: 'Grade A (Nashik Red)',
    offeredPrice: 2700,
    modalSpread: '+₹220 above APMC modal rate',
    quantity: 500,
    received: 320,
    minLot: 20,
    quality: 'Grade A (Nashik Red)',
    location: 'Pune, Maharashtra (Farmgate Pickup Available)',
    paymentTerms: 'Escrow release within 7 days of weighing',
    requiredBy: '2026-09-22',
    notes: 'Farm pickup preferred for Grade A produce. Weighbridge receipt validated instantly.',
    status: 'Active',
    rating: '4.8 / 5 from 42 FPOs',
    cin: 'CIN: U01111MH2019PTC329011',
    history: 'Over 2,400 Qtl fulfilled',
    specs: {
      moisture: '< 14% max moisture',
      grading: 'Grade A, 55mm+ uniform diameter',
      packaging: '50kg ventilated mesh bags',
    },
    pickup: true,
    verified: true,
  },
  {
    _id: 'req-sample-02',
    buyer: 'Reliance Fresh Procurement',
    crop: 'Tomato',
    variety: 'Grade A (Vine-Ripened)',
    offeredPrice: 2350,
    modalSpread: '+₹200 above APMC modal rate',
    quantity: 300,
    received: 210,
    minLot: 15,
    quality: 'Grade A (Vine-Ripened)',
    location: 'Nashik Hub, Maharashtra (Farmgate Pickup Available)',
    paymentTerms: 'Escrow release within 3 days of inspection',
    requiredBy: '2026-09-25',
    notes: 'Consistent supply contracts available for FPOs with standard plastic crates.',
    status: 'Active',
    rating: '4.9 / 5 from 88 FPOs',
    cin: 'CIN: L51900MH2006PLC163829',
    history: 'Over 8,500 Qtl fulfilled',
    specs: {
      moisture: 'Firm texture, 90%+ red color',
      grading: 'Grade A, zero surface blemishes',
      packaging: 'Standard 25kg returnable plastic crates',
    },
    pickup: true,
    verified: true,
  },
  {
    _id: 'req-sample-03',
    buyer: 'Sahyadri Agro Exporters',
    crop: 'Potato',
    variety: 'Grade A (Kufri Jyoti)',
    offeredPrice: 2150,
    modalSpread: '+₹330 above APMC modal rate',
    quantity: 800,
    received: 560,
    minLot: 40,
    quality: 'Grade A (Kufri Jyoti)',
    location: 'Mumbai Port Transit, Maharashtra',
    paymentTerms: 'Escrow release within 5 days of loading',
    requiredBy: '2026-09-28',
    notes: 'Export lot requiring phytosanitary verification and dry sorting.',
    status: 'Active',
    rating: '4.9 / 5 from 65 FPOs',
    cin: 'CIN: U01403MH2010PTC208453',
    history: 'Over 12,000 Qtl fulfilled',
    specs: {
      moisture: '< 12% dry skin cure',
      grading: 'Export Grade, 60mm+ oval tubers',
      packaging: 'Standard 50kg export grade jute sacks',
    },
    pickup: false,
    verified: true,
  },
  {
    _id: 'req-sample-04',
    buyer: 'ITC Agri Business Hub',
    crop: 'Wheat',
    variety: 'Sharbati Gold Grade A',
    offeredPrice: 2680,
    modalSpread: '+₹300 above APMC modal rate',
    quantity: 1200,
    received: 850,
    minLot: 50,
    quality: 'Sharbati Gold Grade A',
    location: 'Latur Corridor, Maharashtra (Farmgate Pickup Available)',
    paymentTerms: 'Immediate Escrow release on gate weighment',
    requiredBy: '2026-10-05',
    notes: 'Pre-cleaning & bagging bonus of ₹50/qtl credited automatically.',
    status: 'Active',
    rating: '5.0 / 5 from 120 FPOs',
    cin: 'CIN: L16005WB1910PLC001985',
    history: 'Over 35,000 Qtl fulfilled',
    specs: {
      moisture: '< 11% grain moisture limit',
      grading: 'Certified clean bold Sharbati grain',
      packaging: '50kg certified gunny bags',
    },
    pickup: true,
    verified: true,
  },
];

export function BuyersPage() {
  const {
    requirements,
    requirementsLoading,
    requirementsError,
    fetchRequirements,
    createOffer,
    crops,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [filterImmediatePickup, setFilterImmediatePickup] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);

  const [detailModalItem, setDetailModalItem] = useState(null);
  const [offerModalItem, setOfferModalItem] = useState(null);

  // Fetch requirements on mount
  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  // Merge MongoDB requirements with high-trust sample specifications
  const activeRequirements = useMemo(() => {
    if (requirements && requirements.length > 0) {
      return requirements.map((req, index) => {
        const sampleMatch = SAMPLE_REQUIREMENTS.find(
          (s) => s.crop.toLowerCase() === req.crop?.toLowerCase()
        ) || SAMPLE_REQUIREMENTS[index % SAMPLE_REQUIREMENTS.length];

        return {
          ...sampleMatch,
          ...req,
          _id: req._id || `req-${index}`,
          buyer: formatBuyerName(req.buyer || req.buyerId?.name || sampleMatch.buyer),
          crop: req.crop || sampleMatch.crop,
          offeredPrice: req.offeredPrice || sampleMatch.offeredPrice,
          quantity: req.quantity || sampleMatch.quantity,
          received: req.received !== undefined ? req.received : sampleMatch.received,
          location: req.location || sampleMatch.location,
          paymentTerms: req.paymentTerms || sampleMatch.paymentTerms,
          requiredBy: req.requiredBy || sampleMatch.requiredBy,
          notes: req.notes || sampleMatch.notes,
          status: req.status || sampleMatch.status || 'Active',
        };
      });
    }
    return SAMPLE_REQUIREMENTS;
  }, [requirements]);

  // Filter logic
  const filteredRequirements = useMemo(() => {
    return activeRequirements.filter((req) => {
      const buyerName = formatBuyerName(req.buyer || req.buyerId?.name).toLowerCase();
      const location = (req.location || '').toLowerCase();
      const crop = (req.crop || '').toLowerCase();
      const query = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !query ||
        buyerName.includes(query) ||
        location.includes(query) ||
        crop.includes(query);

      const matchesCrop =
        selectedCrop === 'All' ||
        crop === selectedCrop.toLowerCase() ||
        (selectedCrop.includes('Onion') && crop.includes('onion')) ||
        (selectedCrop.includes('Tomato') && crop.includes('tomato')) ||
        (selectedCrop.includes('Potato') && crop.includes('potato'));

      const matchesPickup = !filterImmediatePickup || req.pickup || location.includes('pickup');
      const matchesVerified = !filterVerifiedOnly || req.verified !== false;

      return matchesSearch && matchesCrop && matchesPickup && matchesVerified;
    });
  }, [activeRequirements, searchTerm, selectedCrop, filterImmediatePickup, filterVerifiedOnly]);

  return (
    <div className="b2b-exchange-container">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="b2b-breadcrumb">
        <span>Farmer desk</span>
        <ChevronRight size={12} />
        <span className="text-emerald-700 font-extrabold">
          Buyer Requirements
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="b2b-header-title">Institutional Procurement Orders</h1>
          <p className="b2b-header-sub">
            Browse verified purchase contracts from food processors, exporters, and retail chains.
          </p>
        </div>
      </div>

      {/* Metric Strip (3 compact counter pills) */}
      <div className="b2b-metric-strip">
        <div className="b2b-metric-pill">
          <Layers size={15} className="text-emerald-600" />
          <span>Active B2B Demand: <strong>14,800 Qtl</strong></span>
        </div>
        <div className="b2b-metric-pill">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Verified Institutional Buyers: <strong>38</strong></span>
        </div>
        <div className="b2b-metric-pill">
          <Lock size={14} className="text-amber-600" />
          <span className="text-amber-900">Guaranteed Escrow Payouts</span>
        </div>
      </div>

      {/* FILTER CONTROLS (Modern Filter Bar) */}
      <div className="b2b-filter-bar bg-white border border-[#E2DBD0] rounded-2xl p-2 shadow-sm flex items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="b2b-search-wrap">
          <Search size={16} className="text-stone-400 flex-shrink-0" />
          <input
            type="text"
            className="b2b-search-input"
            placeholder="Search buyers or locations (e.g. ABC Foods, Pune)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Center: Crop filter pills */}
        <div className="b2b-crop-pills">
          {['All', '🧅 Onion', '🍅 Tomato', '🥔 Potato'].map((cropLabel) => {
            const isActive = selectedCrop === cropLabel;
            return (
              <button
                key={cropLabel}
                type="button"
                className={`b2b-crop-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCrop(cropLabel)}
              >
                {cropLabel === 'All' ? 'All Crops' : cropLabel}
              </button>
            );
          })}
        </div>

        {/* Right: Status filter pills */}
        <div className="b2b-status-filters">
          <button
            type="button"
            className={`b2b-status-pill-btn ${filterImmediatePickup ? 'active' : ''}`}
            onClick={() => setFilterImmediatePickup((prev) => !prev)}
          >
            <Truck size={13} /> Immediate Pickup
          </button>
          <button
            type="button"
            className={`b2b-status-pill-btn ${filterVerifiedOnly ? 'active' : ''}`}
            onClick={() => setFilterVerifiedOnly((prev) => !prev)}
          >
            <CheckCircle2 size={13} /> Verified Only
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {requirementsLoading && (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#E2DBD0] my-6">
          <LoaderCircle className="animate-spin text-emerald-600 mx-auto mb-2" size={24} />
          <p className="text-sm font-bold text-stone-600 m-0">Syncing institutional procurement contracts…</p>
        </div>
      )}

      {requirementsError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-6 flex items-center gap-2">
          <span>⚠️</span> {requirementsError}
        </div>
      )}

      {/* 2. B2B PROCUREMENT CARDS */}
      {!requirementsLoading && filteredRequirements.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E2DBD0] my-6">
          <p className="text-base font-bold text-stone-700 m-0">
            No institutional procurement orders match your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCrop('All');
              setFilterImmediatePickup(false);
              setFilterVerifiedOnly(false);
            }}
            className="mt-3 text-xs font-bold text-emerald-700 underline"
          >
            Reset all filters
          </button>
        </div>
      )}

      <section className="b2b-cards-grid">
        {filteredRequirements.map((req) => {
          const buyerName = formatBuyerName(req.buyer || req.buyerId?.name);
          const initials = buyerName
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase() || 'AB';

          const totalQty = Math.max(1, req.quantity || 500);
          const receivedQty = req.received || 320;
          const fulfillmentPct = Math.min(100, Math.round((receivedQty / totalQty) * 100));
          const remainingQty = Math.max(0, totalQty - receivedQty);

          const cropDisplayName =
            req.variety ||
            (req.crop?.toLowerCase().includes('onion')
              ? 'Onion — Grade A (Nashik Red)'
              : req.crop?.toLowerCase().includes('tomato')
              ? 'Tomato — Grade A (Vine-Ripened)'
              : req.crop?.toLowerCase().includes('potato')
              ? 'Potato — Grade A (Kufri Jyoti)'
              : `${req.crop} — Institutional Lot`);

          return (
            <article
              className="b2b-trade-card bg-white border border-[#E7E2D4] rounded-3xl p-6 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
              key={req._id}
            >
              {/* Card Header: Avatar, Name, Verification, Urgency & Escrow */}
              <div className="b2b-card-header">
                <div className="b2b-buyer-info">
                  <div className="b2b-corp-avatar">{initials}</div>
                  <div>
                    <h3 className="b2b-buyer-name">{buyerName}</h3>
                    <span className="b2b-verified-badge">
                      <ShieldCheck size={12} /> Corporate Verified Buyer
                    </span>
                  </div>
                </div>

                <div className="b2b-badge-stack">
                  <span className="b2b-urgency-badge">
                    <span className="pulse-dot" />
                    {fulfillmentPct}% Fulfilled
                  </span>
                  <span className="b2b-escrow-badge">
                    🛡️ Escrow Protected
                  </span>
                </div>
              </div>

              {/* Crop & Pricing Spotlight */}
              <div className="b2b-crop-spotlight">
                <div className="b2b-spotlight-label">Requested Produce Lot</div>
                <h4 className="b2b-spotlight-crop">{cropDisplayName}</h4>

                <div className="b2b-price-row">
                  <span className="b2b-big-price">{money(req.offeredPrice)}</span>
                  <span className="text-xs text-stone-500 font-bold">/ quintal</span>
                  <span className="b2b-price-spread">
                    {req.modalSpread || '(+₹220 above APMC modal rate)'}
                  </span>
                </div>
              </div>

              {/* Live Order Fulfillment Progress Bar */}
              <div className="b2b-progress-box">
                <div className="b2b-progress-labels">
                  <span>
                    <strong>{receivedQty}</strong> / {totalQty} quintals fulfilled
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    {fulfillmentPct}%
                  </span>
                </div>
                <div className="b2b-progress-bar-bg">
                  <div
                    className="b2b-progress-bar-fill"
                    style={{ width: `${fulfillmentPct}%` }}
                  />
                </div>
                <div className="text-[11.5px] text-amber-800 font-bold">
                  🔥 Only {remainingQty} quintals remaining for this lot
                </div>
              </div>

              {/* Key Deal Terms 2x2 Clean Metric Grid */}
              <div className="b2b-terms-grid bg-[#FAF8F2] rounded-2xl p-4">
                <div className="b2b-term-item">
                  <span className="b2b-term-label">Required Volume</span>
                  <span className="b2b-term-value">
                    {totalQty} Qtl (Min lot: {req.minLot || 20} Qtl)
                  </span>
                </div>

                <div className="b2b-term-item">
                  <span className="b2b-term-label">Delivery Hub</span>
                  <span className="b2b-term-value">
                    {req.location || 'Pune, Maharashtra (Farmgate Pickup Available)'}
                  </span>
                </div>

                <div className="b2b-term-item">
                  <span className="b2b-term-label">Payment Terms</span>
                  <span className="b2b-term-value">
                    {req.paymentTerms || 'Escrow release within 7 days of weighing'}
                  </span>
                </div>

                <div className="b2b-term-item">
                  <span className="b2b-term-label">Delivery Deadline</span>
                  <span className="b2b-term-value text-emerald-900 font-extrabold">
                    {formatDate(req.requiredBy)} (9 days left)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="b2b-card-actions">
                <button
                  type="button"
                  className="b2b-view-btn"
                  onClick={() => setDetailModalItem(req)}
                >
                  <Eye size={15} /> View Details
                </button>
                <button
                  type="button"
                  className="b2b-offer-btn"
                  onClick={() => setOfferModalItem(req)}
                >
                  Submit Supply Offer <ArrowRight size={15} />
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* 3. "VIEW DETAILS" MODAL (STRUCTURED DEAL DOSSIER) */}
      {detailModalItem && (
        <ViewDetailsModal
          item={detailModalItem}
          onClose={() => setDetailModalItem(null)}
          onProceedToOffer={(item) => {
            setDetailModalItem(null);
            setOfferModalItem(item);
          }}
        />
      )}

      {/* 4. "SUBMIT OFFER" MODAL (SMART QUOTE GENERATOR) */}
      {offerModalItem && (
        <SubmitOfferModal
          item={offerModalItem}
          farmerCrops={crops}
          onClose={() => setOfferModalItem(null)}
          onSubmit={async (payload) => {
            await createOffer({
              requirementId: offerModalItem._id,
              crop: offerModalItem.crop,
              cropId: offerModalItem.cropId,
              buyer: formatBuyerName(offerModalItem.buyer || offerModalItem.buyerId?.name),
              buyerId: offerModalItem.buyerId?._id || offerModalItem.buyerId,
              quality: payload.quality || offerModalItem.quality || 'Grade A',
              quantity: +payload.quantity,
              price: +payload.price,
              message: payload.message,
            });
            setOfferModalItem(null);
          }}
        />
      )}
    </div>
  );
}

/** 3. "VIEW DETAILS" MODAL COMPONENT (STRUCTURED DEAL DOSSIER) */
function ViewDetailsModal({ item, onClose, onProceedToOffer }) {
  const buyerName = formatBuyerName(item.buyer || item.buyerId?.name);
  const initials = buyerName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'AB';

  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.94, opacity: 0, y: 14 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="b2b-modal-backdrop backdrop-blur-md bg-black/60"
      onMouseDown={onClose}
    >
      <div
        ref={modalRef}
        className="b2b-modal-dossier"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="b2b-dossier-header">
          <div className="flex items-center gap-3.5">
            <div className="b2b-corp-avatar">{initials}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-extrabold text-[#142519] m-0">
                  {buyerName}
                </h3>
                <span className="b2b-verified-badge">
                  <ShieldCheck size={12} /> Verified Corporate
                </span>
              </div>
              <div className="text-xs text-stone-500 flex items-center gap-3">
                <span className="text-amber-700 font-bold">
                  ⭐ {item.rating || '4.8 / 5 from 42 FPOs'}
                </span>
                <span>•</span>
                <span>{item.cin || 'CIN: U01111MH2019PTC329011'}</span>
              </div>
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

        {/* Contract Specs Summary */}
        <div>
          <span className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">
            Institutional Contract Specification
          </span>
          <h2 className="text-2xl font-black text-[#142519] mt-1 mb-2">
            {item.crop} — {item.quality || 'Grade A'}
          </h2>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-black text-[#142519]">
              {money(item.offeredPrice)}
            </span>
            <span className="text-xs text-stone-500 font-bold">/ quintal</span>
            <span className="b2b-price-spread">
              {item.modalSpread || '(+₹220 above APMC modal rate)'}
            </span>
          </div>
        </div>

        {/* Visual Specs Grid */}
        <div className="b2b-specs-grid">
          <div className="b2b-spec-card">
            <span className="b2b-term-label">Moisture Specification</span>
            <strong className="block text-xs font-extrabold text-[#142519] mt-1">
              {item.specs?.moisture || '< 14% max moisture allowed'}
            </strong>
          </div>

          <div className="b2b-spec-card">
            <span className="b2b-term-label">Grading & Sizing</span>
            <strong className="block text-xs font-extrabold text-[#142519] mt-1">
              {item.specs?.grading || 'Grade A, 55mm+ uniform diameter'}
            </strong>
          </div>

          <div className="b2b-spec-card">
            <span className="b2b-term-label">Packaging Criteria</span>
            <strong className="block text-xs font-extrabold text-[#142519] mt-1">
              {item.specs?.packaging || '50kg ventilated mesh bags'}
            </strong>
          </div>

          <div className="b2b-spec-card">
            <span className="b2b-term-label">Payment Security</span>
            <strong className="block text-xs font-extrabold text-emerald-800 mt-1">
              HaatLink Escrow Guaranteed (7 Days)
            </strong>
          </div>
        </div>

        {/* Procurement Notes Quote Box */}
        <div className="b2b-notes-quote">
          “{item.notes || 'Farm pickup preferred for Grade A produce. Weighbridge receipt validated instantly.'}”
        </div>

        {/* Procurement History */}
        <div className="bg-[#FAF8F2] border border-[#E7E2D4] rounded-2xl p-4 mb-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-emerald-700" />
            <span className="text-stone-600 font-medium">Buyer Procurement Volume:</span>
          </div>
          <strong className="text-[#142519]">{item.history || 'Over 2,400 Qtl fulfilled'}</strong>
        </div>

        {/* Footer CTA */}
        <button
          type="button"
          onClick={() => onProceedToOffer(item)}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#B47C20] to-[#DCA134] text-white font-extrabold text-sm shadow-xl hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-2"
        >
          Proceed to Make Supply Offer <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}

/** 4. "SUBMIT OFFER" MODAL COMPONENT (SMART QUOTE GENERATOR) */
function SubmitOfferModal({ item, farmerCrops, onClose, onSubmit }) {
  const buyerName = formatBuyerName(item.buyer || item.buyerId?.name);

  // Auto-detect farmer's ready stock for this crop
  const farmerCropStock = useMemo(() => {
    if (!farmerCrops || !farmerCrops.length) return 80;
    const match = farmerCrops.find(
      (c) => c.name?.toLowerCase() === item.crop?.toLowerCase()
    );
    return match ? match.quantity : 80;
  }, [farmerCrops, item.crop]);

  const [quantity, setQuantity] = useState(farmerCropStock || 80);
  const [price, setPrice] = useState(item.offeredPrice || 2700);
  const [quality, setQuality] = useState(item.quality || 'Grade A');
  const [message, setMessage] = useState('I can supply Grade A produce.');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.94, opacity: 0, y: 14 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  // Live total contract calculator: Quantity × Offer Price
  const totalContractValue = useMemo(() => {
    const q = Number(quantity) || 0;
    const p = Number(price) || 0;
    return q * p;
  }, [quantity, price]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateOffer({ quantity, price });
    if (Object.keys(validationErrors).length) {
      setErrorMsg(
        validationErrors.quantity ||
          validationErrors.price ||
          'Please provide valid quantity and price.'
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        quantity: Number(quantity),
        price: Number(price),
        quality,
        message,
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit binding offer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="b2b-modal-backdrop backdrop-blur-md bg-black/60"
      onMouseDown={onClose}
    >
      <div
        ref={modalRef}
        className="b2b-modal-dossier"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="b2b-dossier-header">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">
              Smart Quotation Terminal
            </span>
            <h3 className="text-xl font-extrabold text-[#142519] m-0">
              Submit Supply Offer to {buyerName}
            </h3>
            <p className="text-xs text-stone-500 m-0 mt-1">
              Target Lot: <strong>{item.crop} ({item.quality || 'Grade A'})</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Inventory Quick-Fill Pill */}
          <button
            type="button"
            className="b2b-stock-pill-btn"
            onClick={() => setQuantity(farmerCropStock)}
          >
            <Zap size={14} className="text-amber-600" />
            Match with My Ready Stock ({farmerCropStock} Quintals Available)
          </button>

          {/* Real-time Valuation Engine Banner */}
          <div className="b2b-valuation-banner">
            <div>
              <span className="text-[11px] font-bold text-stone-300 block mb-0.5">
                Total Deal Value
              </span>
              <strong className="text-2xl font-black text-amber-300 tracking-tight">
                {money(totalContractValue)}
              </strong>
            </div>

            <div className="text-right text-xs text-emerald-200">
              <span>{quantity} Qtl × {money(price)}/q</span>
              <span className="block text-[10px] text-stone-400">Ex-Farmgate Valuation</span>
            </div>
          </div>

          {/* Dual Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Quantity to Supply (Quintals)
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-extrabold text-[#142519] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Your Offer Price (₹/q)
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-extrabold text-[#142519] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Quality Grade & Message */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Offered Quality Grade
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-[#142519] focus:border-emerald-500 outline-none"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Message / Pickup Availability
            </label>
            <textarea
              rows="2"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-medium text-[#142519] focus:border-emerald-500 outline-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Escrow Reassurance Badge */}
          <div className="b2b-escrow-reassurance">
            <ShieldCheck size={18} className="text-emerald-700 flex-shrink-0" />
            <span>
              Buyer deposit is held in <strong>HaatLink Smart Escrow</strong> until electronic delivery slip is signed.
            </span>
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-600 mb-3">{errorMsg}</p>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#142519] to-[#1F3926] text-[#E8D9B5] font-extrabold text-sm shadow-xl hover:brightness-110 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Submitting Binding Offer…
              </>
            ) : (
              <>
                Confirm & Submit Binding Offer
                <ArrowUpRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
