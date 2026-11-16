import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { EngineComponent, Lang, Section } from '../types';
import { MarkdownArticle } from './MarkdownArticle';
import {
  articleKey, componentImageKey, mergeComponents, validateContent,
  type ContentState, type ComponentOverride,
} from './contentStore';
import assetMap from '../data/assetMap.json';

type Props = {
  lang: Lang;
  baseComponents: EngineComponent[];
  content: ContentState;
  selectedId: string;
  selectedSection: string;
  onSave: (next: ContentState) => Promise<void>;
  onPick: (id: string) => void;
  onClose: () => void;
};
type Tab = 'details' | 'article' | 'images' | 'backup';
const L = (lang: Lang, tr: string, en: string) => lang === 'tr' ? tr : en;
const assetOptions = [
  ['engineCutaway', 'Motor kesit görseli / Engine cutaway'],
  ['fanThumbnail', 'Fan küçük görseli / Fan thumbnail'],
  ['hpcThumbnail', 'HPC küçük görseli / HPC thumbnail'],
  ['combustorThumbnail', 'Combustor küçük görseli / Combustor thumbnail'],
  ['hpcAssembly', 'HPC assembly'],
  ['statorVane', 'Stator vane'],
  ['aerodynamics', 'Aerodynamic design'],
  ['partsAssembly', 'Parts assembly'],
] as const;
const defaultChapters: Section[] = [
  { id: 'overview', tr: 'Genel bakış ve görev', en: 'Overview & function', tag: 'OVERVIEW', refs: [] },
  { id: 'principles', tr: 'Çalışma prensibi', en: 'Working principle', tag: 'PRINCIPLES', refs: [] },
  { id: 'geometry', tr: 'Geometri ve tasarım', en: 'Geometry & design', tag: 'DESIGN', refs: [] },
  { id: 'materials', tr: 'Malzemeler ve kaplamalar', en: 'Materials & coatings', tag: 'MATERIALS', refs: [] },
  { id: 'mechanical', tr: 'Mekanik yükler', en: 'Mechanical integrity', tag: 'MECHANICS', refs: [] },
  { id: 'manufacturing', tr: 'Üretim ve kalite', en: 'Manufacturing & quality', tag: 'MANUFACTURING', refs: [] },
  { id: 'interfaces', tr: 'Montaj ve arayüzler', en: 'Assembly & interfaces', tag: 'INTERFACES', refs: [] },
  { id: 'failure', tr: 'Hasar mekanizmaları', en: 'Failure mechanisms', tag: 'RELIABILITY', refs: [] },
  { id: 'inspection', tr: 'Muayene ve bakım', en: 'Inspection & maintenance', tag: 'INSPECTION', refs: [] },
];
function slugify(text: string) {
  return text.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 72);
}
async function readImage(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error('Yalnızca PNG, JPG, WebP veya GIF yüklenebilir (SVG desteklenmez).');
  }
  if (file.size > 5 * 1024 * 1024) throw new Error('Görsel 5 MB altında olmalı.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Görsel okunamadı.'));
    reader.onerror = () => reject(reader.error ?? new Error('Görsel okunamadı.'));
    reader.readAsDataURL(file);
  });
}

export function ContentEditor({ lang, baseComponents, content, selectedId, selectedSection, onSave, onPick, onClose }: Props) {
  const [draft, setDraft] = useState<ContentState>(content);
  const [editId, setEditId] = useState(selectedId);
  const [chapterId, setChapterId] = useState(selectedSection);
  const [articleLang, setArticleLang] = useState<Lang>(lang);
  const [tab, setTab] = useState<Tab>('details');
  const [assetKey, setAssetKey] = useState<string>(componentImageKey(selectedId));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [newMode, setNewMode] = useState(false);
  const [newTitleTr, setNewTitleTr] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newParent, setNewParent] = useState(selectedId);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const importInput = useRef<HTMLInputElement | null>(null);
  const components = useMemo(() => mergeComponents(baseComponents, draft), [baseComponents, draft]);
  const current = components.find(c => c.id === editId) ?? components[0];
  const isCustom = draft.customComponents.some(c => c.id === current.id);
  const chapter = current.chapters.find(c => c.id === chapterId) ?? current.chapters[0];
  const key = articleKey(current.id, chapter?.id ?? 'overview', articleLang);
  const articleText = draft.articleOverrides[key] ?? '';
  const image = draft.imageOverrides[assetKey] ?? (assetKey in assetMap ? assetMap[assetKey as keyof typeof assetMap] : '');

  function changed(next: ContentState) { setDraft(next); setDirty(true); setMessage(''); }
  function editMetadata(patch: ComponentOverride) {
    if (isCustom) changed({ ...draft, customComponents: draft.customComponents.map(c => c.id === current.id ? { ...c, ...patch } : c) });
    else changed({ ...draft, componentOverrides: { ...draft.componentOverrides, [current.id]: { ...(draft.componentOverrides[current.id] ?? {}), ...patch } } });
  }
  function editLocalized(field: 'title' | 'subtitle', language: Lang, value: string) {
    editMetadata({ [field]: { ...current[field], [language]: value } });
  }
  function editArticle(value: string) {
    const articles = { ...draft.articleOverrides };
    if (value) articles[key] = value;
    else delete articles[key];
    changed({ ...draft, articleOverrides: articles });
  }
  function changeComponent(id: string) {
    if (dirty && !window.confirm(L(lang, 'Kaydedilmemiş değişiklikler var. Başka komponent seçilsin mi?', 'You have unsaved changes. Switch component?'))) return;
    setDraft(content); setDirty(false); setNewMode(false); setEditId(id);
    const c = components.find(x => x.id === id);
    setChapterId(c?.chapters[0]?.id ?? 'overview');
    setAssetKey(componentImageKey(id)); setMessage('');
  }
  async function save(next = draft, notice?: string) {
    setBusy(true); setMessage('');
    try {
      await onSave(next);
      setDraft(next); setDirty(false);
      setMessage(notice ?? L(lang, '✓ Değişiklikler bu bilgisayara kaydedildi. EXE oluşturmak gerekmez.', '✓ Saved locally. No EXE rebuild needed.'));
      return true;
    } catch (error) {
      setMessage(`⚠ ${error instanceof Error ? error.message : String(error)}`);
      return false;
    } finally { setBusy(false); }
  }
  async function createComponent() {
    const titleTr = newTitleTr.trim();
    if (!titleTr) { setMessage('⚠ Komponentin Türkçe adını yaz.'); return; }
    const baseId = `custom-${slugify(titleTr) || 'component'}`;
    let id = baseId; let counter = 2;
    while (components.some(c => c.id === id)) id = `${baseId.slice(0, 70)}-${counter++}`;
    const item: EngineComponent = {
      id, parentId: newParent, code: `TFX-${id.replace('custom-', '').toUpperCase().slice(0, 20)}`,
      status: 'planned', category: 'component',
      title: { tr: titleTr, en: newTitleEn.trim() || titleTr },
      subtitle: { tr: 'Teknik içerik hazırlanıyor.', en: 'Technical content is being prepared.' },
      chapters: defaultChapters.map(ch => ({ ...ch, refs: [] })), references: [],
    };
    const next = { ...draft, customComponents: [...draft.customComponents, item] };
    if (await save(next, L(lang, '✓ Yeni komponent eklendi. Teknik bölümlerini yazabilirsin.', '✓ Component added. You can now author its chapters.'))) {
      setEditId(id); setChapterId('overview'); setAssetKey(componentImageKey(id));
      setNewMode(false); setNewTitleTr(''); setNewTitleEn(''); onPick(id); setTab('article');
    }
  }
  async function deleteCustomComponent() {
    if (!isCustom || components.some(c => c.parentId === current.id)) {
      setMessage('⚠ Alt parçaları olan bir komponent silinemez.'); return;
    }
    if (!window.confirm(L(lang, 'Bu komponenti ve düzenlenmiş içeriklerini silmek istiyor musun?', 'Delete this component and its custom content?'))) return;
    const articles = Object.fromEntries(Object.entries(draft.articleOverrides).filter(([k]) => !k.startsWith(`${current.id}/`)));
    const images = { ...draft.imageOverrides }; delete images[componentImageKey(current.id)];
    const next = { ...draft, customComponents: draft.customComponents.filter(c => c.id !== current.id), articleOverrides: articles, imageOverrides: images };
    if (await save(next)) { setEditId('turbofan-engine'); setChapterId('overview'); onPick('turbofan-engine'); }
  }
  async function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readImage(file);
      changed({ ...draft, imageOverrides: { ...draft.imageOverrides, [assetKey]: data } });
      setMessage('Görsel hazır. Kalıcı olması için “Değişiklikleri kaydet” butonuna bas.');
    } catch (error) { setMessage(`⚠ ${error instanceof Error ? error.message : String(error)}`); }
    e.target.value = '';
  }
  function removeImage() {
    const images = { ...draft.imageOverrides }; delete images[assetKey];
    changed({ ...draft, imageOverrides: images });
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url;
    link.download = `TFX-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    setMessage(L(lang, 'Yedek indirildi. Kaydedilmemiş değişiklikler de yedeğe dahil edildi.', 'Backup downloaded, including unsaved edits.'));
  }
  async function importBackup(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = '';
    if (file.size > 120 * 1024 * 1024) { setMessage('⚠ Yedek dosyası çok büyük.'); return; }
    try {
      const imported = validateContent(JSON.parse(await file.text()));
      if (!window.confirm(L(lang, 'Mevcut yerel düzenlemeler yedekteki içeriklerle DEĞİŞTİRİLECEK. Devam?', 'This will REPLACE your local edits with the backup. Continue?'))) return;
      if (await save(imported, L(lang, '✓ Yedek yüklendi ve kaydedildi.', '✓ Backup restored.'))) {
        setEditId('turbofan-engine'); setChapterId('overview'); setAssetKey(componentImageKey('turbofan-engine')); onPick('turbofan-engine');
      }
    } catch (error) { setMessage(`⚠ ${error instanceof Error ? error.message : String(error)}`); }
  }
  function close() {
    if (!dirty || window.confirm(L(lang, 'Kaydedilmemiş değişikliklerden vazgeçilsin mi?', 'Discard unsaved changes?'))) onClose();
  }

  return <div className="studio-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
    <section className="studio-dialog" role="dialog" aria-modal="true" aria-label="TFX Content Studio">
      <header className="studio-header"><div><span className="eyebrow">TFX / CONTENT STUDIO · 0.2</span><h2>{L(lang, 'İçerik Yönetimi', 'Content Management')}</h2><p>{L(lang, 'Kod yazmadan komponent, teknik bilgi ve görsel ekle.', 'Edit components, articles and images without writing code.')}</p></div><button className="studio-close" onClick={close} aria-label="Close editor">×</button></header>
      <nav className="studio-tabs" aria-label="Content editor sections">
        <button className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>◈ {L(lang, 'Komponentler', 'Components')}</button>
        <button className={tab === 'article' ? 'active' : ''} onClick={() => setTab('article')}>▤ {L(lang, 'Teknik içerik', 'Articles')}</button>
        <button className={tab === 'images' ? 'active' : ''} onClick={() => setTab('images')}>▧ {L(lang, 'Görseller', 'Images')}</button>
        <button className={tab === 'backup' ? 'active' : ''} onClick={() => setTab('backup')}>⇅ {L(lang, 'Yedekleme', 'Backup')}</button>
      </nav>
      <div className="studio-body">
        {tab !== 'backup' && <div className="studio-pick-row"><label>{L(lang, 'Düzenlenecek komponent', 'Selected component')}<select value={current.id} onChange={e => changeComponent(e.target.value)}>{components.map(c => <option key={c.id} value={c.id}>{c.title[lang]} · {c.code}</option>)}</select></label><span className="studio-pill">{isCustom ? 'CUSTOM' : 'CATALOG'} · {current.id}</span></div>}
        {tab === 'details' && <>
          <div className="studio-section-heading"><div><h3>{L(lang, 'Komponent bilgileri', 'Component details')}</h3><p>{L(lang, 'Başlıklar, açıklamalar ve içerik durumu', 'Titles, descriptions and content status')}</p></div><button className="studio-outline-button" onClick={() => { setNewMode(!newMode); setNewParent(current.id); }}>＋ {L(lang, 'Yeni komponent', 'New component')}</button></div>
          {newMode ? <div className="studio-new-box"><h3>{L(lang, 'Yeni komponent ekle', 'Add a component')}</h3><div className="studio-grid"><label>{L(lang, 'Türkçe ad *', 'Turkish title *')}<input value={newTitleTr} maxLength={160} onChange={e => setNewTitleTr(e.target.value)} placeholder="Ör. Stator Shroud" /></label><label>{L(lang, 'İngilizce ad', 'English title')}<input value={newTitleEn} maxLength={160} onChange={e => setNewTitleEn(e.target.value)} placeholder="Stator Shroud" /></label></div><label>{L(lang, 'Bağlanacağı üst sistem', 'Parent system')}<select value={newParent} onChange={e => setNewParent(e.target.value)}>{components.map(c => <option key={c.id} value={c.id}>{c.title[lang]}</option>)}</select></label><div className="studio-row"><button className="studio-primary" onClick={createComponent} disabled={busy}>{L(lang, 'Komponenti oluştur', 'Create component')}</button><button className="studio-outline-button" onClick={() => setNewMode(false)}>{L(lang, 'Vazgeç', 'Cancel')}</button></div></div> : <>
            <div className="studio-grid"><label>{L(lang, 'Türkçe başlık', 'Turkish title')}<input value={current.title.tr} maxLength={160} onChange={e => editLocalized('title', 'tr', e.target.value)} /></label><label>{L(lang, 'İngilizce başlık', 'English title')}<input value={current.title.en} maxLength={160} onChange={e => editLocalized('title', 'en', e.target.value)} /></label></div>
            <div className="studio-grid"><label>{L(lang, 'Türkçe kısa açıklama', 'Turkish summary')}<textarea rows={3} value={current.subtitle.tr} onChange={e => editLocalized('subtitle', 'tr', e.target.value)} /></label><label>{L(lang, 'İngilizce kısa açıklama', 'English summary')}<textarea rows={3} value={current.subtitle.en} onChange={e => editLocalized('subtitle', 'en', e.target.value)} /></label></div>
            <div className="studio-grid"><label>{L(lang, 'Komponent kodu', 'Component code')}<input value={current.code} maxLength={80} onChange={e => editMetadata({ code: e.target.value })} /></label><label>{L(lang, 'İçerik durumu', 'Content status')}<select value={current.status} onChange={e => editMetadata({ status: e.target.value as EngineComponent['status'] })}><option value="planned">Planned / Taslak plan</option><option value="draft">Draft / Yazılıyor</option><option value="reviewed">Reviewed / Kontrol edildi</option></select></label></div>
            {isCustom && <button className="studio-danger" onClick={deleteCustomComponent} disabled={busy}>{L(lang, 'Bu yeni komponenti sil', 'Delete this custom component')}</button>}
          </>}
        </>}
        {tab === 'article' && <><div className="studio-section-heading"><div><h3>{L(lang, 'Teknik makale yaz', 'Author a technical article')}</h3><p>{L(lang, 'Genel bakış, malzemeler, üretim ve diğer teknik başlıklar', 'Overview, materials, manufacturing and other chapters')}</p></div></div><div className="studio-grid"><label>{L(lang, 'Teknik bölüm', 'Chapter')}<select value={chapter?.id ?? 'overview'} onChange={e => setChapterId(e.target.value)}>{current.chapters.map(ch => <option key={ch.id} value={ch.id}>{ch[lang]}</option>)}</select></label><label>{L(lang, 'İçerik dili', 'Article language')}<select value={articleLang} onChange={e => setArticleLang(e.target.value as Lang)}><option value="tr">Türkçe</option><option value="en">English</option></select></label></div>
          <label>{L(lang, 'Teknik açıklama (Markdown)', 'Technical text (Markdown)')}<textarea className="studio-article-input" value={articleText} onChange={e => editArticle(e.target.value)} placeholder={'# Başlık\n\nTeknik açıklamanı buraya yaz.\n\n## Malzeme seçimi\n\n- Özellik 1\n- Özellik 2'} /></label>
          <p className="studio-hint">{L(lang, 'Boş bırakırsan paket içindeki mevcut MDX makalesi gösterilir. # ve ## başlık, - liste, **kalın** metin için kullanılır. Bu editör HTML veya MDX kodu çalıştırmaz.', 'If left blank, the bundled MDX article is displayed. Supports headings (#, ##), lists (-) and **bold**; HTML and MDX code are not executed.')}</p>
          {articleText && <div className="studio-preview"><span className="eyebrow">LIVE PREVIEW</span><MarkdownArticle text={articleText} /></div>}
          {articleText && <button className="studio-outline-button" onClick={() => editArticle('')}>{L(lang, 'Bu bölümdeki özel metni kaldır', 'Remove custom text for this chapter')}</button>}
        </>}
        {tab === 'images' && <><div className="studio-section-heading"><div><h3>{L(lang, 'Görsel değiştir', 'Replace an image')}</h3><p>{L(lang, 'Eski görseller silinmez; kendi görselin onların üzerinde gösterilir.', 'Original images remain in the package; your image is an override.')}</p></div></div><label>{L(lang, 'Görsel alanı', 'Image slot')}<select value={assetKey} onChange={e => setAssetKey(e.target.value)}><option value={componentImageKey(current.id)}>{L(lang, 'Seçili komponentin teknik görseli', 'Selected component illustration')}</option>{assetOptions.map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select></label>
          <div className="studio-image-box">{image ? <img src={image} alt="Image preview" /> : <span>{L(lang, 'Bu alanda henüz görsel yok.', 'No image in this slot yet.')}</span>}</div>
          <input ref={fileInput} className="studio-hidden-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImage} />
          <div className="studio-row"><button className="studio-outline-button" onClick={() => fileInput.current?.click()}>＋ {L(lang, 'Görsel seç (PNG/JPG/WebP)', 'Choose image')}</button>{draft.imageOverrides[assetKey] && <button className="studio-danger" onClick={removeImage}>{L(lang, 'Özel görseli kaldır', 'Remove override')}</button>}</div>
          <p className="studio-hint">{L(lang, 'Maksimum 5 MB. Kaydettiğinde uygulama yeniden açıldığında da görünür. Büyük görseller için dosya boyutunu küçültmeni öneririz. Windows EXE ikonu bu panelden değişmez.', 'Max 5 MB. Saved images persist after restarting. Windows EXE icon is not changed here.')}</p>
        </>}
        {tab === 'backup' && <><div className="studio-section-heading"><div><h3>{L(lang, 'İçerikleri yedekle ve taşı', 'Backup and transfer content')}</h3><p>{L(lang, 'İçerikler bu bilgisayarın uygulama veritabanında tutulur.', 'Content is stored in this computer’s app database.')}</p></div></div><div className="studio-backup-card"><h4>01 — {L(lang, 'Yedek indir', 'Export backup')}</h4><p>{L(lang, 'Eklediğin komponentler, teknik makaleler ve görseller tek bir JSON dosyasında saklanır. Yeni bilgisayara geçmeden önce yedek al.', 'Components, articles and images are saved to one JSON file. Export before moving to a new computer.')}</p><button className="studio-primary" onClick={exportBackup}>↓ {L(lang, 'TFX içerik yedeğini indir', 'Download TFX backup')}</button></div><div className="studio-backup-card"><h4>02 — {L(lang, 'Yedeği içe aktar', 'Restore backup')}</h4><p>{L(lang, 'Önceki yedekteki bilgiler bu bilgisayardaki düzenlemelerin yerine geçer. Geri alma için önce mevcut yedeğini indir.', 'Imported data replaces the current local edits. Export a backup first if you may need to undo.')}</p><input ref={importInput} type="file" className="studio-hidden-input" accept="application/json,.json" onChange={importBackup} /><button className="studio-outline-button" onClick={() => importInput.current?.click()}>↑ {L(lang, 'JSON yedeğini yükle', 'Import JSON backup')}</button></div><p className="studio-hint">{L(lang, 'Tarayıcıdaki geliştirme sürümü ile kurulu Electron EXE farklı depolama alanları kullanır. Aralarında taşımak için dışa/içe aktarma kullan. Uygulama verilerini silmek düzenlemeleri silebilir.', 'Browser dev and installed Electron app have separate storage. Use export/import to transfer content. Clearing app data can erase edits.')}</p></>}
      </div>
      <footer className="studio-footer"><div className="studio-feedback" aria-live="polite">{message || (dirty ? L(lang, '● Kaydedilmemiş değişiklik var', '● Unsaved changes') : L(lang, 'Yerel içerik editörü · çevrimdışı çalışır', 'Local editor · works offline'))}</div><div className="studio-row"><button className="studio-outline-button" onClick={close}>{L(lang, 'Kapat', 'Close')}</button>{tab !== 'backup' && <button className="studio-primary" disabled={busy || !dirty} onClick={() => save()}>{busy ? 'Kaydediliyor...' : L(lang, 'Değişiklikleri kaydet', 'Save changes')}</button>}</div></footer>
    </section>
  </div>;
}
