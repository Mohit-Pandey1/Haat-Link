import { useState } from 'react';
import { ArrowRight, BarChart3, Clock3, Edit3, TrendingUp } from 'lucide-react';
import { formatDate } from '../../utils/validation';
import { money } from '../../utils/format';
import { CropDetailsModal } from './CropDetailsModal';
import { CropEditModal } from './CropEditModal';

function cropTone(name) {
  const value = name.toLowerCase();
  if (value.includes('tomato')) return 'tomato';
  if (value.includes('potato')) return 'potato';
  if (value.includes('onion')) return 'onion';
  return 'leaf';
}

export function CropCard({ crop, onFindBuyers }) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const ready = crop.status === 'Ready to Sell';
  const tone = cropTone(crop.name);
  const lotValue = Number(crop.quantity || 0) * Number(crop.price || 0);

  return (
    <article
      className={`card inventory-crop-card crop-tone-${tone}`}
      data-status={crop.status}
      data-crop={crop.name}
    >
      <div className="inventory-card-top">
        <div className="crop-avatar">{crop.emoji || '🌱'}</div>
        <span className={`inventory-status ${ready ? 'ready' : 'growing'}`}>
          {ready ? <i /> : <Clock3 size={12} />}
          {ready ? 'Ready to Sell' : 'Growing'}
        </span>
      </div>
      <div className="inventory-card-heading">
        <div>
          <h2>{crop.name}</h2>
          <span className="quality-badge">
            {crop.quality || 'Grade A'} •{' '}
            {crop.quality === 'Grade A' ? 'GI Tagged' : 'Commercial'}
          </span>
        </div>
        <span className="harvest-date">
          Harvest: {formatDate(crop.harvestDate)}
        </span>
      </div>
      <div className="inventory-metrics">
        <div>
          <span>Stock Volume</span>
          <strong>{crop.quantity} Quintals</strong>
          <small>Available Lot</small>
        </div>
        <div>
          <span>Current APMC Rate</span>
          <strong>{money(crop.price)} / qtl</strong>
          <small className="market-up">
            <TrendingUp size={12} /> Live market rate
          </small>
        </div>
      </div>
      <div className="lot-value">
        <span>Estimated Lot Value</span>
        <strong>{money(lotValue)}</strong>
      </div>
      {!ready && (
        <div className="growth-progress">
          <div>
            <span>Crop maturity</span>
            <b>Growing</b>
          </div>
          <i>
            <em style={{ width: '65%' }} />
          </i>
          <small>
            Expected harvest milestone: {formatDate(crop.harvestDate)}
          </small>
        </div>
      )}
      <div className="inventory-card-actions">
        <button
          className="find-buyers-button"
          type="button"
          onClick={onFindBuyers}
        >
          Find Buyers <ArrowRight size={16} />
        </button>
        <button
          className="crop-icon-action"
          type="button"
          onClick={() => setEditOpen(true)}
          title="Edit crop"
        >
          <Edit3 size={16} />
        </button>
        <button
          className="crop-icon-action"
          type="button"
          onClick={() => setViewOpen(true)}
          title="View crop analytics"
        >
          <BarChart3 size={16} />
        </button>
      </div>
      {viewOpen && (
        <CropDetailsModal
          crop={crop}
          onClose={() => setViewOpen(false)}
          onFindBuyers={() => {
            setViewOpen(false);
            onFindBuyers();
          }}
        />
      )}
      {editOpen && (
        <CropEditModal crop={crop} onClose={() => setEditOpen(false)} />
      )}
    </article>
  );
}
