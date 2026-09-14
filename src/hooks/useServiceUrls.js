import { useState, useEffect, useCallback } from 'react';
import { statusStripConfig } from '../config/index.js';

const STORAGE_KEY = 'jobbuddy.serviceUrls.v1';

const buildDefaults = () => {
  const defaults = {};
  for (const service of statusStripConfig.services) {
    defaults[service.id] = {
      apiUrl: service.apiUrl,
      apiPath: service.apiPath,
      healthUrl: service.healthUrl
    };
  }
  return defaults;
};

const buildLocalhostDefaults = () => {
  const defaults = {};
  for (const service of statusStripConfig.services) {
    defaults[service.id] = {
      apiUrl: service.localhostApiUrl,
      apiPath: service.apiPath,
      healthUrl: service.localhostHealthUrl
    };
  }
  return defaults;
};

const loadStored = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const mergeWithDefaults = (stored, defaults) => {
  if (!stored) return defaults;
  const merged = { ...defaults };
  for (const id of Object.keys(stored)) {
    if (merged[id]) {
      merged[id] = {
        apiUrl: stored[id]?.apiUrl ?? merged[id].apiUrl,
        apiPath: stored[id]?.apiPath ?? merged[id].apiPath,
        healthUrl: stored[id]?.healthUrl ?? merged[id].healthUrl
      };
    }
  }
  return merged;
};

export function useServiceUrls() {
  const defaults = buildDefaults();
  const localhostDefaults = buildLocalhostDefaults();
  const [urls, setUrls] = useState(() => mergeWithDefaults(loadStored(), defaults));

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
    } catch {
      // localStorage may be unavailable (private mode, quota); non-fatal.
    }
  }, [urls]);

  const updateUrl = useCallback((id, patch) => {
    setUrls(prev => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, ...patch } };
    });
  }, []);

  const resetUrl = useCallback((id) => {
    setUrls(prev => {
      const fallback = defaults[id];
      if (!fallback || !prev[id]) return prev;
      return { ...prev, [id]: { ...fallback } };
    });
  }, [defaults]);

  const resetAll = useCallback(() => {
    setUrls({ ...defaults });
  }, [defaults]);

  const applyLocalhost = useCallback((id) => {
    if (id) {
      const target = localhostDefaults[id];
      if (!target) return;
      setUrls(prev => (prev[id] ? { ...prev, [id]: { ...target } } : prev));
    } else {
      setUrls({ ...localhostDefaults });
    }
  }, [localhostDefaults]);

  const applyProduction = useCallback((id) => {
    if (id) {
      const target = defaults[id];
      if (!target) return;
      setUrls(prev => (prev[id] ? { ...prev, [id]: { ...target } } : prev));
    } else {
      setUrls({ ...defaults });
    }
  }, [defaults]);

  const getApiTarget = useCallback((id) => {
    const entry = urls[id];
    if (!entry) return null;
    const isDev = import.meta.env.DEV;
    return isDev ? entry.apiPath : entry.apiUrl;
  }, [urls]);

  return {
    urls,
    updateUrl,
    resetUrl,
    resetAll,
    applyLocalhost,
    applyProduction,
    getApiTarget,
    defaults,
    localhostDefaults
  };
}

export default useServiceUrls;