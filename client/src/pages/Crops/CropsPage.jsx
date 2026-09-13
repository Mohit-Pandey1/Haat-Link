import { useEffect, useRef, useState } from 'react';
import { Plus, Search, Sprout, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageTitle } from '../../components/common/PageTitle';
import { CropCard } from './CropCard';
import { CropForm } from './CropForm';
import { money } from '../../utils/format';

const FILTERS = [
  { key: 'all', label: 'All Crops' },
  { key: 'Ready to Sell', label: 'Ready to Sell' },
  { key: 'Growing', label: 'Growing' },
  { key: 'Past Deals', label: 'Past Deals' },
];

export function CropsPage() {
  const { crops, cropsLoading, cropsError, setSelectedCrop } = useApp();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  useEffect(() => {
    const focusSearch = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);
  const readyCrops = crops.filter((crop) => crop.status === 'Ready to Sell');
  const growingCrops = crops.filter((crop) => crop.status === 'Growing');
  const totalVolume = crops.reduce(
    (sum, crop) => sum + Number(crop.quantity || 0),
    0
  );
  const portfolioValue = crops.reduce(
    (sum, crop) => sum + Number(crop.quantity || 0) * Number(crop.price || 0),
    0
  );
  const filteredCrops = crops.filter((crop) => {
    const matchesStatus = filter === 'all' || crop.status === filter;
    const matchesSearch = `${crop.name} ${crop.quality}`
      .toLowerCase()
      .includes(query.toLowerCase().trim());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="crops-inventory-page">
      <PageTitle
        title="My Harvest Inventory"
        action={
          <button
            className="inventory-add-button"
            type="button"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={17} /> Add New Crop
          </button>
        }
      />
      <p className="inventory-intro">
        Track crop maturity, monitor live mandi valuations, and connect with
        verified buyers.
      </p>
      <section className="inventory-summary" aria-label="Inventory summary">
        <div>
          <span>Total Volume</span>
          <strong>{totalVolume.toLocaleString('en-IN')} Quintals</strong>
          <small>across {crops.length} crops</small>
        </div>
        <div>
          <span>Est. Portfolio Value</span>
          <strong>{money(portfolioValue)}</strong>
          <small>based on today&apos;s APMC rates</small>
        </div>
        <div>
          <span>Ready for Dispatch</span>
          <strong>
            {readyCrops
              .reduce((sum, crop) => sum + Number(crop.quantity || 0), 0)
              .toLocaleString('en-IN')}{' '}
            Quintals
          </strong>
          <small>{readyCrops.length} lots ready</small>
        </div>
      </section>
      {!cropsLoading && !cropsError && crops.length > 0 && (
        <section className="inventory-controls">
          <label className="inventory-search">
            <Search size={17} />
            <input
              value={query}
              ref={searchRef}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your crops (e.g. Tomato, Onion)..."
              aria-label="Search your crops"
            />
            <kbd>Ctrl + K</kbd>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <div
            className="inventory-filters"
            role="tablist"
            aria-label="Crop filters"
          >
            {FILTERS.map((item) => {
              const count =
                item.key === 'all'
                  ? crops.length
                  : item.key === 'Ready to Sell'
                    ? readyCrops.length
                    : item.key === 'Growing'
                      ? growingCrops.length
                      : 0;
              return (
                <button
                  key={item.key}
                  className={filter === item.key ? 'active' : ''}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  role="tab"
                  aria-selected={filter === item.key}
                >
                  {item.label} ({count})
                </button>
              );
            })}
          </div>
        </section>
      )}
      {cropsLoading && <p className="intro">Loading your harvest lots…</p>}
      {cropsError && (
        <p className="intro inventory-error">
          Failed to load crops: {cropsError}
        </p>
      )}
      {!cropsLoading && !cropsError && crops.length === 0 && (
        <div className="inventory-empty">
          <Sprout size={28} />
          <h2>Your harvest ledger is empty</h2>
          <p>
            Add your first crop to start tracking mandi value and buyer
            interest.
          </p>
          <button
            className="inventory-add-button"
            type="button"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={17} /> Add New Crop
          </button>
        </div>
      )}
      {!cropsLoading &&
        !cropsError &&
        crops.length > 0 &&
        filteredCrops.length === 0 && (
          <div className="inventory-empty">
            <Search size={28} />
            <h2>No matching harvest lots</h2>
            <p>Try another crop name or choose a different status filter.</p>
          </div>
        )}
      {!cropsLoading && !cropsError && filteredCrops.length > 0 && (
        <section className="crop-grid inventory-grid">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop._id}
              crop={crop}
              onFindBuyers={() => {
                setSelectedCrop(crop._id);
                navigate(`/buyers?crop=${crop._id}`);
              }}
            />
          ))}
        </section>
      )}
      {addOpen && <CropForm onClose={() => setAddOpen(false)} />}
    </div>
  );
}
