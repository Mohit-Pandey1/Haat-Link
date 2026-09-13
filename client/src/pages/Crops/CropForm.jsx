import { useState } from 'react';
import { ArrowRight, CalendarDays, Leaf } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FieldError } from '../../components/common/FieldError';
import { Modal } from '../../components/common/Modal';
import { validateCrop } from '../../utils/validation';
import { money } from '../../utils/format';

const quickCrops = [
  { name: 'Onion', emoji: '🧅' },
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Potato', emoji: '🥔' },
  { name: 'Soybean', emoji: '🌾' },
];
const otherCrops = ['Wheat', 'Maize', 'Rice', 'Apple', 'Walnut'];
const grades = [
  { value: 'Grade A', title: 'Export / GI Standard' },
  { value: 'Grade B', title: 'Premium Domestic' },
  { value: 'Grade C', title: 'Processing / Bulk' },
];
const APMC_RATE = 2450;

export function CropForm({ onClose }) {
  const { addCrop } = useApp();
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    quality: '',
    harvestDate: '',
    status: '',
    price: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCrop(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addCrop({ ...form, quantity: +form.quantity, price: +form.price });
      onClose();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Register New Harvest Lot" onClose={onClose}>
      <div className="crop-form-heading">
        <span className="crop-form-icon">
          <Leaf size={20} />
        </span>
        <div>
          <p>
            Enter crop metrics to receive automated buyer quotes and live mandi
            matching.
          </p>
        </div>
      </div>
      <form className="harvest-form" onSubmit={handleSubmit}>
        <fieldset className="quick-crop-selector">
          <legend>Choose crop</legend>
          <div className="quick-crop-grid">
            {quickCrops.map((crop) => (
              <button
                key={crop.name}
                className={form.name === crop.name ? 'selected' : ''}
                type="button"
                onClick={() => update('name', crop.name)}
              >
                {crop.emoji} {crop.name}
              </button>
            ))}
            <select
              value={
                quickCrops.some((crop) => crop.name === form.name)
                  ? ''
                  : form.name
              }
              onChange={(event) => update('name', event.target.value)}
              aria-label="Other crops"
            >
              <option value="">Other Crops</option>
              {otherCrops.map((crop) => (
                <option key={crop}>{crop}</option>
              ))}
            </select>
          </div>
          <FieldError>{errors.name}</FieldError>
        </fieldset>
        <div className="harvest-form-grid">
          <label>
            Harvest Quantity (Quintals)
            <input
              aria-invalid={Boolean(errors.quantity)}
              type="number"
              min="0.01"
              step="1"
              value={form.quantity}
              onChange={(event) => update('quantity', event.target.value)}
              placeholder="e.g. 80"
            />
            <FieldError>{errors.quantity}</FieldError>
          </label>
          <label>
            Expected Price (₹ / quintal)
            <input
              aria-invalid={Boolean(errors.price)}
              type="number"
              min="0.01"
              step="1"
              value={form.price}
              onChange={(event) => update('price', event.target.value)}
              placeholder="e.g. 2450"
            />
            <FieldError>{errors.price}</FieldError>
            <small className="apmc-rate-hint">
              💡 Today&apos;s APMC Modal Rate: {money(APMC_RATE)}/qtl{' '}
              <button
                type="button"
                onClick={() => update('price', String(APMC_RATE))}
              >
                Use Mandi Rate
              </button>
            </small>
          </label>
        </div>
        <fieldset className="grade-selector">
          <legend>Quality grading</legend>
          <div className="grade-grid">
            {grades.map((grade) => (
              <label
                className={form.quality === grade.value ? 'selected' : ''}
                key={grade.value}
              >
                <input
                  type="radio"
                  name="quality"
                  value={grade.value}
                  checked={form.quality === grade.value}
                  onChange={(event) => update('quality', event.target.value)}
                />
                <strong>{grade.value}</strong>
                <small>{grade.title}</small>
              </label>
            ))}
          </div>
          <FieldError>{errors.quality}</FieldError>
        </fieldset>
        <div className="harvest-form-grid">
          <fieldset className="status-selector">
            <legend>Lot status</legend>
            <div>
              <button
                type="button"
                className={form.status === 'Growing' ? 'selected' : ''}
                onClick={() => update('status', 'Growing')}
              >
                <span>🌱</span> Growing
              </button>
              <button
                type="button"
                className={form.status === 'Ready to Sell' ? 'selected' : ''}
                onClick={() => update('status', 'Ready to Sell')}
              >
                <span>🟢</span> Ready to Sell
              </button>
            </div>
            <FieldError>{errors.status}</FieldError>
          </fieldset>
          <label>
            Harvest Date
            <div className="date-input">
              <CalendarDays size={16} />
              <input
                aria-invalid={Boolean(errors.harvestDate)}
                type="date"
                min="2020-01-01"
                value={form.harvestDate}
                onChange={(event) => update('harvestDate', event.target.value)}
              />
            </div>
            <FieldError>{errors.harvestDate}</FieldError>
          </label>
        </div>
        <div className="live-valuation">
          <span>Estimated Lot Worth</span>
          <strong>
            {money(Number(form.quantity || 0) * Number(form.price || 0))}
          </strong>
        </div>
        {submitError && <p className="harvest-submit-error">{submitError}</p>}
        <button
          className="list-harvest-button"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Listing harvest…' : 'List Harvest to Mandi Network'}{' '}
          <ArrowRight size={17} />
        </button>
      </form>
    </Modal>
  );
}
