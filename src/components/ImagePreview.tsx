import React, { useEffect } from 'react';
import { lockScroll, unlockScroll } from '../utils/modalLock';

function ImagePreview({ src, alt = 'Kép előnézet', onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', onKey);
    lockScroll();
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [onClose]);

  if (!src) return null;

  const handleOverlay = (e) => {
    // Prevent click from bubbling to underlying modals
    e.stopPropagation();
    if (e.target === e.currentTarget) onClose && onClose();
  };

  return (
    <div
      className="image-preview-overlay"
      onClick={handleOverlay}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100000
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose && onClose(); }}
        aria-label="Bezárás"
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 36, height: 36, borderRadius: 9999,
          border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer',
          background: '#ffffff', color: '#111827',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)'
        }}
      >
        ×
      </button>
      <div
        className="image-preview-content"
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, display: 'block' }}
        />
      </div>
    </div>
  );
}

export default ImagePreview;


