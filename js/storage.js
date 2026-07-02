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

  const memory = new Map();

  const readRaw = collection => {
    if (hasLocalStorage()) {
      return localStorage.getItem(key(collection));
    }
    return memory.get(collection) || null;
  };

  const writeRaw = (collection, value) => {
    if (hasLocalStorage()) {
      localStorage.setItem(key(collection), value);
      return;
    }
    memory.set(collection, value);
  };

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

  const insert = (collection, record) => {
    const records = all(collection);
    if (record.id && records.some(item => item.id === record.id)) {
      throw new Error(`Duplicate record id: ${record.id}`);
    }
    const next = { ...record, id: record.id || uid(collection), createdAt: record.createdAt || new Date().toISOString() };
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
    return records.length !== next.length;
  };

  const bulkUpdate = (collection, ids, changes) => {
    const records = all(collection).map(item => ids.includes(item.id) ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item);
    save(collection, records);
    return records.filter(item => ids.includes(item.id));
  };

  const uid = (base = "gv") => `${base.slice(0, 3)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const seedIfEmpty = seedData => {
    if (all(COLLECTIONS.USERS).length) return false;
    Object.entries(seedData).forEach(([collection, records]) => save(collection, records));
    return true;
  };

  const backup = () => {
    const data = {};
    Object.values(COLLECTIONS).forEach(collection => {
      data[collection] = load(collection, Array.isArray(collection) ? [] : []);
    });
    return data;
  };

  return { all, backup, bulkUpdate, find, insert, load, remove, save, seedIfEmpty, uid, update };
})();
