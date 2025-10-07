import React, { useEffect } from 'react';

function Lightbox({ src, alt = 'Preview', onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!src) return null;

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose && onClose();
  };

  return (
    <div
      className="lightbox-overlay"
      onClick={handleOverlay}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100000
      }}
    >
      <div
        className="lightbox-content"
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Bezárás"
          style={{
            position: 'absolute', top: -12, right: -12,
            width: 36, height: 36, borderRadius: 9999,
            border: 'none', cursor: 'pointer',
            background: '#111827', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}
        >
          ×
        </button>
        <img
          src={src}
          alt={alt}
          style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, display: 'block' }}
        />
      </div>
    </div>
  );
}

export default Lightbox;


