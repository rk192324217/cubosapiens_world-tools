/* ══════════════════════════════════════════════════════
   db.js — IndexedDB + localStorage persistence layer
   ══════════════════════════════════════════════════════ */

const DB_NAME    = 'CuboPDF_DB';
const DB_VERSION = 1;
const STORE_NAME = 'books';
const LS_KEY     = 'cubo_pdf_progress';

let _db = null;

/** Open (or create) the IndexedDB database */
function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE_NAME)) {
        d.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror   = ()  => reject(req.error);
  });
}

/** Generic get */
function dbGet(key) {
  return new Promise((resolve, reject) => {
    const tx  = _db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror   = () => reject(req.error);
  });
}

/** Generic put (insert or update) */
function dbPut(value) {
  return new Promise((resolve, reject) => {
    const tx  = _db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(value);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

/** Get all records */
function dbGetAll() {
  return new Promise((resolve, reject) => {
    const tx  = _db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = () => reject(req.error);
  });
}

/** Delete a record by key */
function dbDelete(key) {
  return new Promise((resolve, reject) => {
    const tx  = _db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

/* ── Progress helpers (localStorage) ──────────────── */

/**
 * Save reading progress for a book.
 * @param {string} id       - unique book ID
 * @param {number} page     - current page / chapter index
 * @param {number} total    - total pages / chapters
 * @param {string} type     - 'pdf' | 'epub'
 */
function saveProgress(id, page, total, type) {
  const all = _getAllProgress();
  all[id] = { page, total, type, ts: Date.now() };
  try { localStorage.setItem(LS_KEY, JSON.stringify(all)); } catch (e) { /* quota exceeded */ }
}

/** Get progress for a single book (or null) */
function getProgress(id) {
  return _getAllProgress()[id] || null;
}

/** Get all progress entries keyed by book ID */
function getAllProgress() {
  return _getAllProgress();
}

/** Remove progress entry */
function deleteProgress(id) {
  const all = _getAllProgress();
  delete all[id];
  try { localStorage.setItem(LS_KEY, JSON.stringify(all)); } catch (e) {}
}

function _getAllProgress() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}