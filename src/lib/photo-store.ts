/**
 * IndexedDB-backed store for wizard photo files.
 * Files survive page navigations (e.g. auth redirect) where in-memory refs would be lost.
 */

const DB_NAME = "petmemorial-photos";
const DB_VERSION = 1;
const STORE_NAME = "files";
const HERO_KEY = "__hero__";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put(key: string, value: File): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function get(key: string): Promise<File | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => { db.close(); resolve(req.result as File | undefined); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

async function del(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function clearAll(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getAllKeys(): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAllKeys();
    req.onsuccess = () => { db.close(); resolve(req.result as string[]); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

// --- Public API ---

export async function saveHeroFile(file: File): Promise<void> {
  await put(HERO_KEY, file);
}

export async function loadHeroFile(): Promise<File | undefined> {
  return get(HERO_KEY);
}

export async function removeHeroFile(): Promise<void> {
  await del(HERO_KEY);
}

export async function savePhotoFile(photoId: string, file: File): Promise<void> {
  await put(photoId, file);
}

export async function loadPhotoFiles(): Promise<Map<string, File>> {
  const keys = await getAllKeys();
  const map = new Map<string, File>();
  for (const key of keys) {
    if (key === HERO_KEY) continue;
    const file = await get(key as string);
    if (file) map.set(key as string, file);
  }
  return map;
}

export async function removePhotoFile(photoId: string): Promise<void> {
  await del(photoId);
}

export async function clearPhotoStore(): Promise<void> {
  await clearAll();
}
