const store = new Map();
const timers = new Map();
let hits = 0;
let misses = 0;

function get(key) {
  const entry = store.get(key);
  if (!entry) {
    misses++;
    return undefined;
  }
  if (entry.expires && Date.now() > entry.expires) {
    store.delete(key);
    timers.delete(key);
    misses++;
    return undefined;
  }
  hits++;
  return entry.value;
}

function set(key, value, ttl) {
  if (timers.has(key)) {
    clearTimeout(timers.get(key));
  }
  store.set(key, {
    value,
    expires: ttl ? Date.now() + ttl * 1000 : null,
  });
  if (ttl) {
    timers.set(key, setTimeout(() => {
      store.delete(key);
      timers.delete(key);
    }, ttl * 1000));
  }
}

function del(key) {
  store.delete(key);
  if (timers.has(key)) {
    clearTimeout(timers.get(key));
    timers.delete(key);
  }
}

function clear() {
  store.clear();
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
  hits = 0;
  misses = 0;
}

function getKeys() {
  return Array.from(store.keys());
}

function getStats() {
  return {
    keys: store.size,
    hits,
    misses,
  };
}

module.exports = { get, set, del, clear, getKeys, getStats };
