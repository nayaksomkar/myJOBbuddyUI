import { useEffect, useState } from 'react';
import { statusStripConfig } from '../config/index.js';

const isValidUrl = (value) => {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isValidPath = (value) => {
  if (!value) return false;
  return value.startsWith('/');
};

function ServiceRow({ service, current, defaults, onUpdate, onReset }) {
  const [draft, setDraft] = useState(current);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setDraft(current);
  }, [current]);

  const apiUrlValid = isValidUrl(draft.apiUrl);
  const healthUrlValid = isValidUrl(draft.healthUrl);
  const apiPathValid = isValidPath(draft.apiPath);
  const allValid = apiUrlValid && healthUrlValid && apiPathValid;

  const dirty =
    draft.apiUrl !== current.apiUrl ||
    draft.apiPath !== current.apiPath ||
    draft.healthUrl !== current.healthUrl;

  const differsFromDefaults =
    draft.apiUrl !== defaults.apiUrl ||
    draft.apiPath !== defaults.apiPath ||
    draft.healthUrl !== defaults.healthUrl;

  const handleSave = () => {
    if (!allValid) {
      setTouched(true);
      return;
    }
    onUpdate(service.id, {
      apiUrl: draft.apiUrl,
      apiPath: draft.apiPath,
      healthUrl: draft.healthUrl
    });
    setTouched(false);
  };

  const handleReset = () => {
    setDraft({ ...defaults });
    onReset(service.id);
    setTouched(false);
  };

  const fieldError = (valid) => (touched && !valid ? 'Invalid value' : null);

  return (
    <div className="settings-row">
      <div className="settings-row-header">
        <div className="settings-row-name">{service.name}</div>
        <div className="settings-row-desc">{service.description}</div>
      </div>

      <label className="settings-field">
        <span className="settings-field-label">API URL (production)</span>
        <input
          type="text"
          className="settings-input"
          value={draft.apiUrl}
          onChange={(e) => setDraft(d => ({ ...d, apiUrl: e.target.value }))}
          onBlur={() => setTouched(true)}
          placeholder="https://example.com/parse"
          spellCheck={false}
        />
        {fieldError(apiUrlValid) && <span className="settings-error">{fieldError(apiUrlValid)}</span>}
      </label>

      <label className="settings-field">
        <span className="settings-field-label">Dev proxy path</span>
        <input
          type="text"
          className="settings-input"
          value={draft.apiPath}
          onChange={(e) => setDraft(d => ({ ...d, apiPath: e.target.value }))}
          onBlur={() => setTouched(true)}
          placeholder="/parse"
          spellCheck={false}
        />
        {fieldError(apiPathValid) && <span className="settings-error">Must start with /</span>}
      </label>

      <label className="settings-field">
        <span className="settings-field-label">Health URL</span>
        <input
          type="text"
          className="settings-input"
          value={draft.healthUrl}
          onChange={(e) => setDraft(d => ({ ...d, healthUrl: e.target.value }))}
          onBlur={() => setTouched(true)}
          placeholder="https://example.com/health"
          spellCheck={false}
        />
        {fieldError(healthUrlValid) && <span className="settings-error">{fieldError(healthUrlValid)}</span>}
      </label>

      <div className="settings-row-actions">
        <button
          className="settings-btn settings-btn-secondary"
          onClick={handleReset}
          disabled={!differsFromDefaults}
          title={differsFromDefaults ? 'Revert to default' : 'Already at default'}
        >
          Reset
        </button>
        <button
          className="settings-btn settings-btn-primary"
          onClick={handleSave}
          disabled={!dirty || !allValid}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function ServiceUrlSettings({ open, onClose, urls, defaults, onUpdate, onReset, onResetAll }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="settings-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Service URL settings">
        <div className="settings-modal-header">
          <div>
            <div className="settings-modal-title">Service URLs</div>
            <div className="settings-modal-subtitle">
              Override backend endpoints. Edits are saved automatically per service.
            </div>
          </div>
          <button className="settings-close" onClick={onClose} aria-label="Close settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-modal-body">
          {statusStripConfig.services.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              current={urls[service.id]}
              defaults={defaults[service.id]}
              onUpdate={onUpdate}
              onReset={onReset}
            />
          ))}
        </div>

        <div className="settings-modal-footer">
          <button className="settings-btn settings-btn-ghost" onClick={onResetAll}>
            Reset all to defaults
          </button>
        </div>
      </div>
    </div>
  );
}