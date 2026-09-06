import { useState, useEffect } from 'react';
import { statusStripConfig } from '../config/index.js';

const POLL_TIMEOUT_MS = 8000;

const fetchHealth = async (url) => {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), POLL_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      mode: 'no-cors'
    });
    const latency = Date.now() - start;
    clearTimeout(timeout);
    return { status: response.type === 'opaque' || response.ok ? 'up' : 'down', latency };
  } catch (error) {
    clearTimeout(timeout);
    const latency = Date.now() - start;
    if (error.name === 'AbortError') {
      return { status: 'timeout', latency };
    }
    return { status: 'down', latency };
  }
};

const StatusDot = ({ status }) => (
  <span className={`status-dot status-${status}`} />
);

function ServiceRow({ service, showLatency, pollMs }) {
  const [health, setHealth] = useState({ status: 'checking', latency: null });

  useEffect(() => {
    let cancelled = false;

    const checkHealth = () => {
      setHealth(prev => prev.status === 'checking' ? prev : { status: 'checking', latency: null });
      fetchHealth(service.healthUrl).then(result => {
        if (!cancelled) {
          setHealth(result);
        }
      });
    };

    checkHealth();

    if (pollMs <= 0) {
      return;
    }

    const interval = setInterval(checkHealth, pollMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [service.id, service.healthUrl, pollMs]);

  const statusLabel = {
    up: 'Online',
    down: 'Offline',
    timeout: 'Offline',
    checking: 'Checking...'
  }[health.status];

  return (
    <div className="status-service">
      <div className="status-service-header">
        <StatusDot status={health.status} />
        <span className="status-service-name">{service.name}</span>
        <span className={`status-label status-label-${health.status}`}>{statusLabel}</span>
        {showLatency && health.status === 'up' && health.latency !== null && (
          <span className="status-service-latency">{health.latency}ms</span>
        )}
      </div>
      <div className="status-service-desc">{service.description}</div>
    </div>
  );
}

export default function ServerStatus({ mobile = false }) {
  const { enabled, showLatency, pollMs, services } = statusStripConfig;

  if (!enabled) {
    return null;
  }

  return (
    <div className={`server-status-strip${mobile ? ' mobile' : ''}`}>
      <div className="server-status-title">Service Status</div>
      <div className="server-status-services">
        {services.map((service) => (
          <ServiceRow
            key={service.id}
            service={service}
            showLatency={showLatency}
            pollMs={pollMs}
          />
        ))}
      </div>
    </div>
  );
}
