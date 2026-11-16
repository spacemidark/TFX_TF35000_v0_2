import { useEffect, useMemo, useRef, useState } from 'react';
import project from './data/projectConfig.json';
import assets from './data/assetMap.json';
import { EngineViewer } from './components/EngineViewer';
import { Dashboard } from './components/Dashboard';
import { ChapterNavigator } from './components/ChapterNavigator';
import { groupChapters } from './data/chapterGroups';
import { EngineSchematic } from './components/EngineSchematic';
import { EngineeringNote, ThermalCalculator, VsvGuide } from './components/EngineeringWidgets';
import { components as baseComponents, glossaryTerms, loadSection } from './data';
import { ContentEditor } from './editor/ContentEditor';
import { MarkdownArticle } from './editor/MarkdownArticle';
import { articleKey, componentImageKey, mergeComponents, newContentState, readContent, writeContent, type ContentState } from './editor/contentStore';
import type { EngineComponent, Lang, Section } from './types';

function ancestry(id:string, components:EngineComponent[]):EngineComponent[]{
  const path:EngineComponent[]=[];
  let current=components.find(c=>c.id===id);
  while(current && path.length<8){path.unshift(current);current=components.find(c=>c.id===current?.parentId);}
  return path;
}
function withinHpc(id:string, components:EngineComponent[]){return ancestry(id,components).some(c=>c.id==='hpc-overview');}
const I:Record<string,string>={book:'▤', search:'⌕', favorite:'☆', favorited:'★', code:'</>', grid:'▦', back:'←', arrow:'↗', close:'×'};
const L=(lang:Lang,tr:string,en:string)=>lang==='tr'?tr:en;
const mdxWidgets={ EngineeringNote, ThermalCalculator, VsvGuide };

function initialComponent():string {
  const h=new URLSearchParams(window.location.hash.slice(1)).get('component');
  return baseComponents.some(c=>c.id===h)?h!:'turbofan-engine';
}
function initialChapter():string {
  const params=new URLSearchParams(window.location.hash.slice(1));
  const id=initialComponent();
  const c=baseComponents.find(c=>c.id===id);
  const wanted=params.get('chapter');
  return c?.chapters.find(s=>s.id===wanted)?.id || c?.chapters[0]?.id || 'overview';
}
function loadFavorites():string[] {
  try { return JSON.parse(localStorage.getItem('tfx-bookmarks-v1')||'[]') as string[]; } catch { return []; }
}
function Sidebar({ lang, component, components, onPick, query, setQuery, favorites, mobileOpen, setMobileOpen, searchRef }:{
  lang:Lang; component:string; components:EngineComponent[]; onPick:(id:string)=>void; query:string; setQuery:(q:string)=>void;
  favorites:string[]; mobileOpen:boolean; setMobileOpen:(v:boolean)=>void; searchRef:React.RefObject<HTMLInputElement|null>;
}){
  const [expanded,setExpanded]=useState<string[]>(['turbofan-engine']);
  useEffect(()=>{
    const parents=ancestry(component,components).map(c=>c.id);
    setExpanded(old=>Array.from(new Set([...old,...parents])));
  },[component]);
  const q=query.trim().toLocaleLowerCase();
  const matches=components.filter(c=>`${c.title.tr} ${c.title.en} ${c.code} ${c.subtitle.tr} ${c.subtitle.en} ${c.chapters.map(s=>`${s.tr} ${s.en}`).join(' ')}`.toLocaleLowerCase().includes(q));
  function choose(id:string){onPick(id);setMobileOpen(false);}
  function node(c:EngineComponent, depth:number):React.ReactNode{
    const kids=components.filter(item=>item.parentId===c.id);
    const isOpen=expanded.includes(c.id);
    return <div key={c.id} className="tree-node">
      <div className={`tree-row ${component===c.id?'tree-row-active':''}`} style={{paddingLeft:Math.min(depth,5)*12+5}}>
        {kids.length>0 ? <button type="button" className="tree-toggle" onClick={()=>setExpanded(old=>isOpen?old.filter(x=>x!==c.id):[...old,c.id])} aria-label={`${isOpen?'Collapse':'Expand'} ${c.title[lang]}`} aria-expanded={isOpen}>{isOpen?'▾':'▸'}</button> : <span className="tree-leaf">·</span>}
        <button type="button" className={`nav-item tree-item ${component===c.id?'active':''}`} onClick={()=>{choose(c.id);if(kids.length && !isOpen)setExpanded(old=>[...old,c.id]);}}><span className="nav-item-title">{c.title[lang]}<small>{c.status==='planned'?'○ OUTLINE':c.status==='reviewed'?'✓ REVIEWED':'◈ DRAFT'} · {c.code}</small></span><span className="nav-right">{favorites.includes(c.id)?'★':''}</span></button>
      </div>
      {isOpen && kids.map(child=>node(child,depth+1))}
    </div>;
  }
  return <>
    {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen?'open':''}`}>
      <div className="brand"><img className="brand-app-icon" src={assets.appIcon} alt="TFX application icon"/><div><div className="brand-name">{project.appName}</div><div className="brand-credit">Created by Emine Yasan</div><div className="brand-caption">{project.engineName} · ENGINEERING REFERENCE</div></div><button className="sidebar-close" onClick={()=>setMobileOpen(false)} aria-label="Close sidebar">×</button></div>
      <div className="sidebar-rule"/>
      <button type="button" className={`sidebar-home-link ${component==='turbofan-engine'?'current':''}`} onClick={()=>choose('turbofan-engine')}>⌂ &nbsp; {L(lang,'Ana sayfa','Home')} <span>↗</span></button>
      <div className="nav-meta"><span>{L(lang,'TÜM MOTOR KÜTÜPHANESİ','FULL ENGINE LIBRARY')}</span><small>TFX 0.2</small></div>
      <label className="search-wrap"><span>⌕</span><input ref={searchRef} value={query} placeholder={L(lang,'Tüm motor ve parçaları ara...','Search all engine components...')} onChange={e=>setQuery(e.target.value)} /><kbd>Ctrl K</kbd></label>
      <div className="tree-counter">{components.length} {L(lang,'SİSTEM / PARÇA DÜĞÜMÜ','SYSTEM / COMPONENT NODES')}</div>
      <div className="sidebar-scroll">
        {q ? <div className="nav-group"><div className="nav-group-title">{L(lang,'ARAMA SONUÇLARI','SEARCH RESULTS')} <small>{matches.length}</small></div>{matches.map(c=><button type="button" key={c.id} className={`nav-item ${component===c.id?'active':''}`} onClick={()=>choose(c.id)}><span className="nav-item-symbol">{c.status==='planned'?'○':'◈'}</span><span className="nav-item-title">{c.title[lang]}<small>{ancestry(c.id,components).slice(1,-1).map(x=>x.title[lang]).join(' › ')||'ENGINE'} · {c.code}</small></span></button>)}{!matches.length&&<p className="empty-small">{L(lang,'Sonuç bulunamadı.','No results.')}</p>}</div> : components.filter(c=>!c.parentId).map(c=>node(c,0))}
      </div>
      <div className="sidebar-bottom"><span className="sidebar-ornament">◈</span><div><strong>KNOWLEDGE FIRST.</strong><small>WHOLE ENGINE • COMPONENTS • SOURCES</small></div></div>
    </aside>
  </>;
}

function GlossaryPanel({ lang, onClose }:{lang:Lang;onClose:()=>void}) {
  const [termSearch,setTermSearch]=useState('');
  const terms=glossaryTerms.filter(t=>[t.term,t.tr,t.definition_tr,t.definition_en].join(' ').toLocaleLowerCase().includes(termSearch.toLocaleLowerCase()));
  return <div className="drawer-backdrop" onClick={onClose}><aside className="drawer" onClick={e=>e.stopPropagation()}>
    <div className="drawer-top"><span className="eyebrow">ENGINEERING LANGUAGE</span><button onClick={onClose} aria-label="Close glossary">×</button></div>
    <h2>{L(lang,'Teknik sözlük','Engineering glossary')}</h2><p className="drawer-intro">{L(lang,'Jet motoru mühendisliğinde kullanılan temel terimler.','Essential terminology in jet engine engineering.')}</p>
    <input className="drawer-input" placeholder={L(lang,'Terim ara...','Search a term...')} value={termSearch} onChange={e=>setTermSearch(e.target.value)}/>
    <div className="glossary-terms">{terms.map(t=><article key={t.term} className="term"><div><strong>{t.term}</strong><small>{t.tr}</small></div><p>{t[`definition_${lang}`]}</p></article>)}</div>
  </aside></div>;
}

function SectionReading({component, section,lang,overrideText,componentImage}:{component:EngineComponent;section:Section;lang:Lang;overrideText?:string;componentImage?:string}) {
  const Content=loadSection(component.id,section.id,lang) || loadSection(component.id,section.id,'tr');
  const refs=section.refs.map(r=>component.references.find(ref=>ref.id===r)).filter((r):r is NonNullable<typeof r>=>Boolean(r));
  return <article id="reading" className="reading-card">
    <div className="reading-head"><div><div className="eyebrow"><span className="small-green-dot"/> {section.tag} / {component.code}</div><span className="reading-index">{component.chapters.findIndex(c=>c.id===section.id)+1} / {component.chapters.length} &nbsp; — &nbsp; TECHNICAL CHAPTER</span></div><span className="reading-file-icon">▤</span></div>
    <div className="tf35000-notice">ⓘ {overrideText ? L(lang,'Bu bölüm kullanıcı tarafından düzenlenmiştir. Teknik doğruluk ve kaynak kontrolü içerik sahibinin sorumluluğundadır.','This chapter was edited locally. Review technical accuracy and sources before sharing.') : L(lang,'TF35000 için içerik hazırlama aşamasında. Aşağıdaki metinler genel mühendislik örnekleridir; TF35000 özelinde doğrulanmış bilgi değildir.','TF35000 content is in preparation. The text below is generic engineering reference material, not verified TF35000 information.')}</div><div className="article-content">{componentImage && <figure className="studio-component-figure"><img src={componentImage} alt={component.title[lang]} /><figcaption>{L(lang,'Kullanıcı tarafından eklenen komponent görseli','User-supplied component illustration')}</figcaption></figure>}{overrideText ? <MarkdownArticle text={overrideText}/> : Content ? <Content components={mdxWidgets}/> : <div className="article-placeholder"><strong>{L(lang,'Bu teknik bölüm henüz yazılmadı.','This engineering chapter has not been authored yet.')}</strong><p>{L(lang,'İçeriğini VS Code içinde aşağıdaki MDX dosyasını oluşturarak ekleyebilirsin. Doğrulanmamış mühendislik verisi otomatik üretilmez.','Create the following MDX file in VS Code to add your reviewed content. Unverified engineering claims will not be generated automatically.')}</p><code>content/{component.id}/{section.id}.{lang}.mdx</code></div>}</div>
    <div className="section-sources"><div className="source-heading">↗ {L(lang,'BU BÖLÜMÜN KAYNAKLARI','SECTION REFERENCES')} <span>{refs.length.toString().padStart(2,'0')}</span></div>
      {refs.length ? refs.map(ref=><a href={ref.url} target="_blank" rel="noopener noreferrer" key={ref.id}><span className="ref-badge">{ref.id}</span><div><strong>{ref.title}</strong><small>{ref.author} · {ref.year} {ref.scope?' · '+ref.scope:''}</small></div><span>↗</span></a>) : <p className="no-ref">{L(lang,'Bu bölüm için özel kaynak bağlantısı henüz girilmedi.','No section-specific references have been supplied.')}</p>}
    </div>
  </article>;
}
function Metric({value,label,icon}:{value:string;label:string;icon:string}){
  return <div className="metric"><div className="metric-top"><span>{icon}</span><strong>{value}</strong></div><small>{label}</small></div>;
}
export default function App(){
  const [lang,setLang]=useState<Lang>('tr');
  const [userContent,setUserContent]=useState<ContentState>(newContentState);
  const [contentLoadError,setContentLoadError]=useState('');
  const components=useMemo(()=>mergeComponents(baseComponents,userContent),[userContent]);
  const visuals=useMemo(()=>({...assets,...Object.fromEntries(Object.entries(userContent.imageOverrides).filter(([key])=>key in assets))}),[userContent]);
  const [selected,setSelected]=useState(initialComponent);
  const [activeSection,setActiveSection]=useState(initialChapter);
  const [query,setQuery]=useState('');
  const [glossary,setGlossary]=useState(false);
  const [editor,setEditor]=useState(false);
  const [favorites,setFavorites]=useState(loadFavorites);
  const [mobileOpen,setMobileOpen]=useState(false);
  const searchRef=useRef<HTMLInputElement>(null);
  const bootParams=useRef(new URLSearchParams(window.location.hash.slice(1)));
  const comp=components.find(c=>c.id===selected) ?? components[0];
  const isVsv=comp.id==='variable-stator-vane';
  const hpcBranch=withinHpc(comp.id,components);
  const childComponents=components.filter(c=>c.parentId===comp.id);
  const section=comp.chapters.find(s=>s.id===activeSection) || comp.chapters[0];
  const active=favorites.includes(comp.id);

  useEffect(()=>{
    const requestedId=bootParams.current.get('component');
    const requestedChapter=bootParams.current.get('chapter');
    readContent().then(data=>{
      setUserContent(data);
      const restored=mergeComponents(baseComponents,data).find(c=>c.id===requestedId);
      if(restored){
        setSelected(restored.id);
        setActiveSection(restored.chapters.find(ch=>ch.id===requestedChapter)?.id || restored.chapters[0]?.id || 'overview');
      }
    }).catch(error=>setContentLoadError(error instanceof Error?error.message:String(error)));
  },[]);
  async function saveUserContent(next:ContentState){await writeContent(next);setUserContent(next);setContentLoadError('');}
  useEffect(()=>{window.location.hash=`component=${encodeURIComponent(selected)}&chapter=${encodeURIComponent(activeSection)}`;},[selected,activeSection]);
  useEffect(()=>{localStorage.setItem('tfx-bookmarks-v1',JSON.stringify(favorites));},[favorites]);
  useEffect(()=>{function keys(e:KeyboardEvent){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchRef.current?.focus();setMobileOpen(true)}if(e.key==='Escape'){setGlossary(false);setMobileOpen(false);searchRef.current?.blur()}}window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys)},[]);

  function pick(id:string, chapter?:string){setSelected(id);setActiveSection(components.find(c=>c.id===id)?.chapters.find(x=>x.id===chapter)?.id || components.find(c=>c.id===id)?.chapters[0]?.id ||'overview');setQuery('')}
  function pickSection(id:string){setActiveSection(id);setTimeout(()=>document.getElementById('reading')?.scrollIntoView({behavior:'smooth',block:'start'}),50)}
  function toggleBookmark(){setFavorites(old=>old.includes(comp.id)?old.filter(a=>a!==comp.id):[...old,comp.id])}
  const chapterGroupCount=groupChapters(comp.chapters).length;
  const appTitle=useMemo(()=>L(lang,'INTERAKTİF MÜHENDİSLİK ANSİKLOPEDİSİ','INTERACTIVE ENGINEERING ENCYCLOPEDIA'),[lang]);
  return <div className="app-shell">
    <Sidebar lang={lang} component={selected} components={components} onPick={pick} query={query} setQuery={setQuery} favorites={favorites} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} searchRef={searchRef}/>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" aria-label="Open menu" onClick={()=>setMobileOpen(true)}>☰</button><span className="breadcrumb">ENGINE LIBRARY</span><span className="breadcrumb-chevron">›</span><span className="breadcrumb">{ancestry(selected,components).slice(-2,-1)[0]?.title[lang] || project.engineName}</span><span className="breadcrumb-chevron">›</span><strong>{comp.code}</strong></div><label className="header-search"><span>⌕</span><input aria-label={L(lang,'Bileşen ara','Search components')} placeholder={L(lang,'Motor, komponent veya konu ara...','Search components or topics...')} value={query} onChange={e=>setQuery(e.target.value)} /></label><div className="topbar-actions"><button onClick={()=>setGlossary(true)} className="top-link">▤ <span>{L(lang,'Sözlük','Glossary')}</span></button><button onClick={()=>setEditor(true)} className="top-link">⌘ <span>{L(lang,'İçerik Yönetimi','Content Studio')}</span></button><div className="lang-switch" aria-label="Language"><button className={lang==='tr'?'on':''} onClick={()=>setLang('tr')}>TR</button><button className={lang==='en'?'on':''} onClick={()=>setLang('en')}>EN</button></div></div></header>
      <div className="main-content">
        {contentLoadError && <div className="studio-load-warning">⚠ Yerel içerik veritabanı açılamadı: {contentLoadError}</div>}
        {selected==='turbofan-engine' ? <Dashboard lang={lang} onPick={pick} visuals={visuals} rootOverviewOverride={userContent.articleOverrides[articleKey('turbofan-engine','overview',lang)]} customImageKeys={userContent.imageOverrides}/> : <>
        <div className="hero-intro"><div className="hero-intro-content"><span className="eyebrow"><span className="eyebrow-line"/>{appTitle}</span><div className="hero-badge-line"><span>{ancestry(selected,components)[1]?.title.en || project.engineName}</span><span className="hero-dot"/><span>{comp.category.toUpperCase()}</span></div><h1>{comp.title[lang]}<span className="title-accent">.</span></h1><p>{comp.subtitle[lang]}</p><div className="hero-bottom"><span className={`status-pill ${comp.status==='planned'?'soon':''}`}><span className="status-light"/>{comp.status==='planned'?'CONTENT PLANNED':comp.status==='reviewed'?'CONTENT REVIEWED':'TECHNICAL DRAFT'}</span><span className="hero-separator"/><span>{comp.code}</span><button type="button" className={`save-button ${active?'saved':''}`} onClick={toggleBookmark} aria-label={active?'Remove bookmark':'Save bookmark'}>{active?I.favorited:I.favorite} <span>{active?L(lang,'Kaydedildi','Saved'):L(lang,'Kaydet','Bookmark')}</span></button></div></div>
          <div className="hero-watermark" aria-hidden="true">TFX<span> / 35000</span></div></div>
        <>
          <div className="feature-grid">{hpcBranch ? <EngineViewer lang={lang} isVsv={isVsv}/> : <EngineSchematic lang={lang} selected={selected} onPick={pick}/>}<div className="overview-card"><div className="overview-top"><span className="eyebrow">MODULE OVERVIEW</span><span className="overview-icon">◈</span></div><h2>{L(lang,'Bu bölümde neler var?','Inside this module')}</h2><p>{L(lang,'Motorun tamamı için sistem ve parça ağacı; mevcut makaleler, planlanan bölümler ve düzenlenebilir içerik dosyaları.','Whole-engine system/component hierarchy with current articles, planned chapters and editable MDX files.')}</p><div className="metrics-grid"><Metric icon="▤" value={String(comp.chapters.length).padStart(2,'0')} label={L(lang,'Teknik konu','Engineering topics')}/><Metric icon="↗" value={String(comp.references.length).padStart(2,'0')} label={L(lang,'Kaynak kaydı','Source entries')}/><Metric icon="◎" value={String(components.length)} label={L(lang,'Toplam sistem/parça','All library nodes')}/><Metric icon="✧" value="TR/EN" label={L(lang,'İki dil','Two languages')}/></div>{comp.status==='planned' && <div className="outline-alert">○ {L(lang,'Bu sayfa başlangıç taslağıdır; teknik bölümlerin çoğu henüz yazılmadı.','This is an outline. Most engineering chapters still need verified content.')}</div>}<div className="overview-alert"><span>ⓘ</span>{L(lang,'TF35000 için doğrulanmış tasarım verisi değildir. İçerikler genel mühendislik taslağıdır.','Generic engineering draft; not verified TF35000 design data.')}</div></div></div>
          {childComponents.length>0 && <section className="child-components"><div className="child-head"><span className="eyebrow">COMPONENT HIERARCHY</span><h2>{L(lang,'Alt sistemler ve parçalar','Sub-systems & components')}</h2><p>{L(lang,'Bir öğeye tıklayarak ilgili mühendislik sayfasını aç.','Open a component to explore its engineering chapter.')}</p></div><div className="child-grid">{childComponents.map(c=><button key={c.id} type="button" className="child-card" onClick={()=>pick(c.id)}><span className="child-symbol">{c.status==='planned'?'○':'◈'}</span><span><strong>{c.title[lang]}</strong><small>{c.code} · {c.status==='planned'?'OUTLINE':c.status==='reviewed'?'REVIEWED':'DRAFT'}</small></span><span className="child-arrow">↗</span></button>)}</div></section>}
          <div className="section-heading"><div><span className="eyebrow">ENGINEERING KNOWLEDGE BASE</span><h2>{L(lang,'Teknik kütüphane','Technical library')}</h2></div><span className="section-count">{String(chapterGroupCount).padStart(2,'0')} {L(lang,'ANA BAŞLIK','GROUPS')} · {comp.chapters.length} {L(lang,'KONU','TOPICS')}</span></div>
          <div className="reading-layout"><ChapterNavigator chapters={comp.chapters} selectedId={section?.id ?? ''} language={lang} onSelect={pickSection}/>
            <div className="article-column">{section && <SectionReading key={comp.id+'-'+section.id+'-'+lang} component={comp} section={section} lang={lang} overrideText={userContent.articleOverrides[articleKey(comp.id,section.id,lang)]} componentImage={userContent.imageOverrides[componentImageKey(comp.id)]}/>}
              <div className="article-footer"><div><strong>✦ &nbsp; TFX / TF35000</strong><span>Structured knowledge, engineered to be explored.</span></div><button onClick={()=>setEditor(true)}>{I.code} &nbsp; {L(lang,'Bu içeriği düzenle','Edit this content')} <span>↗</span></button></div>
            </div>
          </div>
        </>
        </>}
        <footer className="footer"><span>© TFX — TF35000 · Created by Emine Yasan</span><span>V 0.2.0 &nbsp; / &nbsp; REACT + TYPESCRIPT + THREE.JS + ELECTRON</span></footer>
      </div>
    </main>
    {glossary && <GlossaryPanel lang={lang} onClose={()=>setGlossary(false)}/>}
    {editor && <ContentEditor lang={lang} baseComponents={baseComponents} content={userContent} selectedId={selected} selectedSection={activeSection} onSave={saveUserContent} onPick={pick} onClose={()=>setEditor(false)}/>}
  </div>;
}
