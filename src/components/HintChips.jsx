import { useState, useEffect, useCallback, useRef } from 'react';
import { hintsConfig } from '../config/index.js';

const HintChip = ({ hint, isActive, onClick }) => (
  <button
    className={`hint-chip ${isActive ? 'active' : ''}`}
    onClick={() => onClick(hint)}
  >
    {hint.trigger}
  </button>
);

const DetailPanel = ({ hint, onClose }) => {
  if (!hint) return null;

  return (
    <div className="hint-detail-panel">
      <div className="hint-detail-header">
        <span className="hint-detail-title">{hint.trigger}</span>
        <button className="hint-detail-close" onClick={onClose}>×</button>
      </div>
      <div className="hint-detail-body">
        {hint.detail.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {hint.relatedIds && hint.relatedIds.length > 0 && (
        <div className="hint-detail-related">
          Related insights: {hint.relatedIds.length} available
        </div>
      )}
    </div>
  );
};

export default function HintChips({ onInsight }) {
  const { enabled, maxVisible, rotateMs, hints } = hintsConfig;
  const [rotationIndex, setRotationIndex] = useState(0);
  const [activeHint, setActiveHint] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const pausedRef = useRef(false);

  const getVisibleHints = useCallback(() => {
    const total = hints.length;
    const visible = [];
    for (let i = 0; i < maxVisible; i++) {
      visible.push(hints[(rotationIndex + i) % total]);
    }
    return visible;
  }, [hints, maxVisible, rotationIndex]);

  useEffect(() => {
    if (!enabled || rotateMs <= 0 || hints.length <= maxVisible) return;

    const interval = setInterval(() => {
      if (!pausedRef.current) {
        setRotationIndex(prev => (prev + 1) % hints.length);
      }
    }, rotateMs);

    return () => clearInterval(interval);
  }, [enabled, rotateMs, hints.length, maxVisible]);

  const handleChipClick = useCallback((hint) => {
    setActiveHint(hint);
    if (onInsight) {
      onInsight(hint.preview);
    }
  }, [onInsight]);

  const handleCloseDetail = useCallback(() => {
    setActiveHint(null);
  }, []);

  const handleMouseEnter = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
  }, []);

  if (!enabled || hints.length === 0) {
    return null;
  }

  const visibleHints = getVisibleHints();

  return (
    <div className="hint-chips-container">
      <div
        className="hint-chips-row"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {visibleHints.map((hint) => (
          <HintChip
            key={hint.id}
            hint={hint}
            isActive={activeHint?.id === hint.id}
            onClick={handleChipClick}
          />
        ))}
        {rotateMs > 0 && (
          <span className={`hint-rotation-indicator ${isPaused ? 'paused' : ''}`} />
        )}
      </div>
      <DetailPanel hint={activeHint} onClose={handleCloseDetail} />
    </div>
  );
}
