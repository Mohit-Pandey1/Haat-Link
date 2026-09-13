import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getBuyers } from '../../services/buyerService';
import { rankedBuyers } from '../../utils/recommendation';
import { money } from '../../utils/format';
import { PageTitle } from '../../components/common/PageTitle';
import { Modal } from '../../components/common/Modal';

export function RecommendationPage() {
  const { crops, selectedCrop, createDeal } = useApp();
  const n = useNavigate();

  const crop = crops.find((c) => c._id === selectedCrop) || crops[0];
  const cropName = crop?.name;

  const [buyers, setBuyers] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(true);
  const [buyersError, setBuyersError] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    if (!cropName) return;
    setBuyersLoading(true);
    setBuyersError(null);
    getBuyers(cropName)
      .then((data) => setBuyers(data))
      .catch((err) => setBuyersError(err.message))
      .finally(() => setBuyersLoading(false));
  }, [cropName]);

  const ranked = rankedBuyers(crop, buyers);
  const best = ranked[0];

  if (!crop || buyersLoading) {
    return (
      <>
        <PageTitle title="Smart selling recommendation" />
        <p className="intro">{!crop ? 'No crops found.' : 'Loading…'}</p>
      </>
    );
  }

  if (buyersError) {
    return (
      <>
        <PageTitle title="Smart selling recommendation" />
        <p className="intro" style={{ color: 'var(--danger, #e53e3e)' }}>
          Failed to load buyers: {buyersError}
        </p>
      </>
    );
  }

  if (!best) {
    return (
      <>
        <PageTitle title="Smart selling recommendation" />
        <article className="card empty-state">
          <span>⌁</span>
          <h2>No buyer has called for {crop.name} yet</h2>
          <p>
            Check the buyer board for nearby requirements, then return here when
            someone is ready for your harvest.
          </p>
          <Link className="primary" to="/buyers">
            View buyers
          </Link>
        </article>
      </>
    );
  }

  const handleConfirmDeal = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await createDeal({
        crop: crop.name,
        quantity: crop.quantity,
        buyer: best.name,
        price: best.price,
        total: best.price * crop.quantity,
        status: 'Deal Created',
        created: new Date().toISOString().slice(0, 10),
        net: best.net,
      });
      setConfirm(false);
      n('/deals');
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <PageTitle title="Smart selling recommendation" />
      <section className="recommendation-page">
        <article className="card recommendation-hero">
          <div>
            <small>
              {crop.name.toUpperCase()} · {crop.quantity} QUINTALS ·{' '}
              {crop.quality.toUpperCase()}
            </small>
            <h2>Sell now to {best.name}</h2>
            <p>
              Best overall deal after accounting for selling costs and buyer
              reliability.
            </p>
          </div>
          <b>
            {best.match}%<small>match score</small>
          </b>
        </article>
        <section className="recommendation-grid">
          <article className="card">
            <h2>Net realization</h2>
            <div className="calculation">
              <span>
                Listed price <b>{money(best.price)}/q</b>
              </span>
              <span>
                Transport cost <b>− {money(best.transport)}/q</b>
              </span>
              <span>
                Handling cost <b>− {money(best.handling)}/q</b>
              </span>
              <strong>
                Expected net <b>{money(best.net)}/q</b>
              </strong>
            </div>
            <button className="primary" onClick={() => setConfirm(true)}>
              Create deal
            </button>
          </article>
          <article className="card">
            <h2>Why this wins</h2>
            <ul className="reason">
              <li>✓ Highest weighted match across six transparent factors</li>
              <li>✓ Required quantity supports your entire harvest</li>
              <li>
                ✓ Pickup is available and payment is expected in{' '}
                {best.paymentDays} days
              </li>
              <li>✓ Quality requirement exactly matches {crop.quality}</li>
            </ul>
            <p className="formula">
              Price 30% · Quantity 20% · Distance 15% · Quality 15% · Pickup 10%
              · Payment 10%
            </p>
          </article>
        </section>
        <article className="card">
          <div className="card-title">
            <div>
              <small>Other buyers</small>
              <h2>How other options compare</h2>
            </div>
          </div>
          {ranked.slice(1).map((b) => (
            <div className="alternative" key={b._id}>
              <span>
                <b>{b.name}</b>
                <small>{money(b.net)}/q net realization</small>
              </span>
              <strong>{b.match}% match</strong>
              <em>
                {b.pickup ? 'Pickup available' : 'No pickup'} · Payment{' '}
                {b.paymentDays} days
              </em>
            </div>
          ))}
        </article>
      </section>

      {confirm && (
        <Modal title="Confirm new deal" onClose={() => setConfirm(false)}>
          <div className="confirm">
            <p>
              <b>Crop</b>
              <span>
                {crop.name} · {crop.quantity} quintals
              </span>
            </p>
            <p>
              <b>Buyer</b>
              <span>{best.name}</span>
            </p>
            <p>
              <b>Listed price</b>
              <span>{money(best.price)}/q</span>
            </p>
            <p>
              <b>Estimated net realization</b>
              <span>{money(best.net)}/q</span>
            </p>
            <p>
              <b>Estimated total value</b>
              <span>{money(best.price * crop.quantity)}</span>
            </p>
            {createError && (
              <p
                style={{
                  color: 'var(--danger, #e53e3e)',
                  fontSize: '0.875rem',
                }}
              >
                {createError}
              </p>
            )}
            <button
              className="primary"
              onClick={handleConfirmDeal}
              disabled={creating}
            >
              {creating ? 'Creating deal…' : 'Confirm Deal'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
