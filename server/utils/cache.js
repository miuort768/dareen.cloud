const logger = require('./logger');

const store = new Map();
const defaults = { ttl: 300000 };

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, ttl) {
  store.set(key, { value, expiry: Date.now() + (ttl || defaults.ttl) });
}

function del(key) {
  store.delete(key);
}

function delPattern(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

function wrap(key, ttl, fetchFn) {
  const cached = get(key);
  if (cached !== null) return cached;
  return fetchFn().then(value => {
    set(key, value, ttl);
    return value;
  });
}

function stats() {
  return { size: store.size, keys: [...store.keys()] };
}

module.exports = { get, set, del, delPattern, wrap, stats };
