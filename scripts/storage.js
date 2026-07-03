"use strict";

const COLLECTIONS = Object.freeze({
  USERS: "users",
  INFLUENCERS: "influencers",
  BRANDS: "brands",
  TOURNAMENTS: "tournaments",
  SUBSCRIPTIONS: "subscriptions",
  SUPPORT: "supportTickets",
  ACTIVITY: "activityLogs",
  SETTINGS: "settings",
  REPORTS: "reports"
});

const StorageManager = (() => {
  const prefix = "gameverse:";
  const memory = new Map();
  const key = collection => `${prefix}${collection}`;
  const clone = value => JSON.parse(JSON.stringify(value));

  const hasLocalStorage = () => {
    try {
      const testKey = `${prefix}health`;
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  };

  const readRaw = collection => hasLocalStorage() ? localStorage.getItem(key(collection)) : memory.get(collection) || null;
  const writeRaw = (collection, value) => hasLocalStorage() ? localStorage.setItem(key(collection), value) : memory.set(collection, value);

  const load = (collection, fallback = []) => {
    try {
      const raw = readRaw(collection);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch {
      return clone(fallback);
    }
  };

  const save = (collection, data) => {
    writeRaw(collection, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("gv:storage", { detail: { collection } }));
    return clone(data);
  };

  const all = collection => load(collection, []);
  const find = (collection, id) => all(collection).find(item => item.id === id) || null;
  const uid = (base = "gv") => `${base.slice(0, 3)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const insert = (collection, record) => {
    const records = all(collection);
    const next = { ...record, id: record.id || uid(collection), createdAt: record.createdAt || new Date().toISOString() };
    if (records.some(item => item.id === next.id)) throw new Error(`Duplicate record id: ${next.id}`);
    records.unshift(next);
    save(collection, records);
    return next;
  };

  const update = (collection, id, changes) => {
    const records = all(collection);
    const index = records.findIndex(item => item.id === id);
    if (index < 0) throw new Error(`Record not found: ${id}`);
    records[index] = { ...records[index], ...changes, updatedAt: new Date().toISOString() };
    save(collection, records);
    return records[index];
  };

  const remove = (collection, id) => {
    const records = all(collection);
    const next = records.filter(item => item.id !== id);
    save(collection, next);
    return next.length !== records.length;
  };

  const bulkUpdate = (collection, ids, changes) => {
    const records = all(collection).map(item => ids.includes(item.id) ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item);
    save(collection, records);
    return records.filter(item => ids.includes(item.id));
  };

  const seedIfEmpty = seedData => {
    let seeded = false;
    Object.entries(seedData).forEach(([collection, records]) => {
      const current = load(collection, Array.isArray(records) ? [] : {});
      const empty = Array.isArray(current) ? current.length === 0 : !current || Object.keys(current).length === 0;
      if (empty) {
        save(collection, records);
        seeded = true;
      }
    });
    return seeded;
  };

  const backup = () => Object.values(COLLECTIONS).reduce((data, collection) => {
    data[collection] = load(collection, collection === COLLECTIONS.SETTINGS ? {} : []);
    return data;
  }, {});

  return { all, backup, bulkUpdate, find, insert, load, remove, save, seedIfEmpty, uid, update };
})();


