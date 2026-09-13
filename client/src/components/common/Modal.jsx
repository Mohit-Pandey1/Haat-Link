import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Modal — reusable overlay dialog.
 *
 * Clicking the backdrop closes the modal (mousedown to avoid conflicting
 * with inner element click events).
 */
export function Modal({ title, children, onClose }) {
  const [closing, setClosing] = useState(false);

  const close = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 300);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div
      className={`modal-wrap ${closing ? 'is-closing' : ''}`}
      onMouseDown={close}
    >
      <section className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={close}
          aria-label="Close dialog"
        >
          <X size={17} />
        </button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}
