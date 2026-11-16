import type { EngineComponent } from '../types';

/**
 * Content Studio stores only the user's additions/overrides. The bundled
 * catalog, MDX chapters and original images remain untouched.
 * IndexedDB is local to this app's origin and survives restarts / EXE upgrades.
 */
export type ComponentOverride = Partial<Pick<EngineComponent, 'title' | 'subtitle' | 'code' | 'status'>>;
export type ContentState = {
  schemaVersion: 1;
  customComponents: EngineComponent[];
  componentOverrides: Record<string, ComponentOverride>;
  articleOverrides: Record<string, string>;
  imageOverrides: Record<string, string>;
};

const DATABASE = 'tfx-content-studio';
const STORE = 'documents';
const KEY = 'content-v1';

export const newContentState = (): ContentState => ({
  schemaVersion: 1,
  customComponents: [],
  componentOverrides: {},
  articleOverrides: {},
  imageOverrides: {},
});

export const articleKey = (componentId: string, chapterId: string, lang: 'tr' | 'en') =>
  `${componentId}/${chapterId}/${lang}`;
export const componentImageKey = (id: string) => `component:${id}`;

export function mergeComponents(base: EngineComponent[], state: ContentState): EngineComponent[] {
  const baseIds = new Set(base.map(c => c.id));
  return [...base, ...state.customComponents.filter(c => !baseIds.has(c.id))]
    .map(c => ({ ...c, ...(state.componentOverrides[c.id] ?? {}) }));
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('Bu ortamda IndexedDB desteklenmiyor.')); return; }
    const req = indexedDB.open(DATABASE, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Yerel veritabanı açılamadı.'));
    req.onblocked = () => reject(new Error('Veritabanı başka bir pencere tarafından kilitlendi.'));
  });
}

export async function readContent(): Promise<ContentState> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result ? validateContent(req.result) : newContentState());
      req.onerror = () => reject(req.error ?? new Error('İçerikler okunamadı.'));
    });
  } finally { db.close(); }
}

export async function writeContent(content: ContentState): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(content, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('İçerikler kaydedilemedi.'));
      tx.onabort = () => reject(tx.error ?? new Error('Kayıt işlemi iptal edildi.'));
    });
  } finally { db.close(); }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  Boolean(v && typeof v === 'object' && !Array.isArray(v));
const isLocalized = (v: unknown): v is { tr: string; en: string } =>
  isRecord(v) && typeof v.tr === 'string' && typeof v.en === 'string';
const isSafeImage = (v: unknown): v is string =>
  typeof v === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length < 16_000_000;

/** Validate imported backups; never allow executable HTML, arbitrary image URLs or oversized data. */
export function validateContent(value: unknown): ContentState {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.customComponents)
    || !isRecord(value.componentOverrides) || !isRecord(value.articleOverrides) || !isRecord(value.imageOverrides)) {
    throw new Error('Dosya TFX Content Studio v1 yedeği değil.');
  }
  if (value.customComponents.length > 1500) throw new Error('Çok fazla komponent kaydı var.');
  const customComponents = value.customComponents.map((c): EngineComponent => {
    if (!isRecord(c) || typeof c.id !== 'string' || !/^[a-z0-9-]{2,90}$/.test(c.id)
      || typeof c.code !== 'string' || !isLocalized(c.title) || !isLocalized(c.subtitle)
      || !Array.isArray(c.chapters) || c.chapters.length > 30 || !Array.isArray(c.references)
      || !['draft', 'reviewed', 'planned'].includes(String(c.status))
      || typeof c.category !== 'string') throw new Error('Komponent kaydı geçersiz.');
    const chapters = c.chapters.map(ch => {
      if (!isRecord(ch) || typeof ch.id !== 'string' || !/^[a-z0-9-]{2,60}$/.test(ch.id)
        || typeof ch.tr !== 'string' || typeof ch.en !== 'string'
        || typeof ch.tag !== 'string' || !Array.isArray(ch.refs)) throw new Error('Teknik bölüm kaydı geçersiz.');
      return { id: ch.id, tr: ch.tr.slice(0, 180), en: ch.en.slice(0, 180), tag: ch.tag.slice(0, 80), refs: [] as string[] };
    });
    return {
      id: c.id, parentId: typeof c.parentId === 'string' ? c.parentId : null,
      code: c.code.slice(0, 80), status: c.status as EngineComponent['status'],
      category: c.category.slice(0, 80), title: { tr: c.title.tr.slice(0, 180), en: c.title.en.slice(0, 180) },
      subtitle: { tr: c.subtitle.tr.slice(0, 2000), en: c.subtitle.en.slice(0, 2000) },
      chapters, references: [],
    };
  });
  const componentOverrides: ContentState['componentOverrides'] = {};
  for (const [id, edit] of Object.entries(value.componentOverrides)) {
    if (!/^[a-z0-9-]{2,90}$/.test(id) || !isRecord(edit)) continue;
    const override: ComponentOverride = {};
    if (isLocalized(edit.title)) override.title = { tr: edit.title.tr.slice(0, 180), en: edit.title.en.slice(0, 180) };
    if (isLocalized(edit.subtitle)) override.subtitle = { tr: edit.subtitle.tr.slice(0, 2000), en: edit.subtitle.en.slice(0, 2000) };
    if (typeof edit.code === 'string') override.code = edit.code.slice(0, 80);
    if (edit.status === 'draft' || edit.status === 'reviewed' || edit.status === 'planned') override.status = edit.status;
    componentOverrides[id] = override;
  }
  const articleOverrides: Record<string, string> = {};
  for (const [key, text] of Object.entries(value.articleOverrides)) {
    if (/^[a-z0-9-]{2,90}\/[a-z0-9-]{2,60}\/(tr|en)$/.test(key) && typeof text === 'string') {
      articleOverrides[key] = text.slice(0, 200_000);
    }
  }
  const imageOverrides: Record<string, string> = {};
  for (const [key, image] of Object.entries(value.imageOverrides)) {
    if (/^(component:[a-z0-9-]{2,90}|[A-Za-z][A-Za-z0-9]{1,40})$/.test(key) && isSafeImage(image)) imageOverrides[key] = image;
  }
  return { schemaVersion: 1, customComponents, componentOverrides, articleOverrides, imageOverrides };
}
