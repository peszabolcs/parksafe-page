import React from 'react';
import { SwitchProps } from '../types';

function Switch({
  label = 'Enable Feature',
  checked = false,
  onChange,
  disabled = false,
  appearance = {
    onColor: '#10b981',
    offColor: '#e5e7eb',
    thumbColor: '#ffffff',
    borderRadius: '999px',
    width: '44px',
    height: '24px',
  },
  labelStyle = {
    marginLeft: '10px',
    verticalAlign: 'middle',
    fontSize: '15px',
    color: '#374151',
  },
  name,
  id,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const { onColor, offColor, thumbColor, borderRadius, width, height } = appearance || {};

  // Normalize numeric sizes for perfect centering
  const num = (v: any, fallback: number): number => {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : fallback;
  };
  const nWidth = num(width, 44);
  const nHeight = num(height, 24);
  const padding = Math.max(2, Math.round(nHeight * 0.083)); // ~2px on 24px height
  const nThumb = nHeight - padding * 2; // centered thumb size

  const trackStyle: React.CSSProperties = {
    width: `${nWidth}px`,
    height: `${nHeight}px`,
    background: checked ? onColor : offColor,
    borderRadius,
    position: 'relative' as const,
    transition: 'background 0.2s ease',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    flex: '0 0 auto',
  };

  const thumbTranslatePx = nWidth - nHeight; // distance the circle should travel

  const thumbStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: `${padding}px`,
    left: `${padding}px`,
    width: `${nThumb}px`,
    height: `${nThumb}px`,
    background: thumbColor,
    borderRadius: '50%',
    transition: 'transform 0.2s ease',
    transform: checked ? `translateX(${thumbTranslatePx}px)` : 'translateX(0)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
  };

  const handleToggle = () => {
    if (disabled) return;
    if (onChange) onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <label
      className="switch-component"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
      aria-disabled={disabled}
    >
      <input
        type="checkbox"
        name={name}
        id={id}
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
        aria-label={ariaLabel || label}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={trackStyle}>
          <span style={thumbStyle} />
        </span>
      </button>
      {label && (
        <span style={labelStyle}>{label}</span>
      )}
    </label>
  );
}

export default Switch;


