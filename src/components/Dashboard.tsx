import { useState } from 'react';
import project from '../data/projectConfig.json';
import assets from '../data/assetMap.json';
import { loadSection } from '../data';
import { EngineSchematic } from './EngineSchematic';
import { EngineViewer } from './EngineViewer';
import type { Lang } from '../types';
import { MarkdownArticle } from '../editor/MarkdownArticle';

type Props = {lang:Lang; onPick:(id:string, chapter?:string)=>void; visuals:typeof assets; rootOverviewOverride?:string; customImageKeys:Record<string,string>};
const makeTopics = (visuals:typeof assets) => [
  {id:'fan-system',name:'Fan',x:10,thumb:visuals.fanThumbnail},
  {id:'hpc-overview',name:'HPC',x:44,thumb:visuals.hpcThumbnail},
  {id:'combustor',name:'Combustor',x:59,thumb:visuals.combustorThumbnail},
  {id:'hpt',name:'HPT',x:73,thumb:visuals.hpcThumbnail},
  {id:'lpt',name:'LPT',x:84,thumb:visuals.hpcThumbnail},
  {id:'exhaust-system',name:'Nozzle',x:94,thumb:visuals.combustorThumbnail},
];
const hpcParts=[
  {name:'Rotor',tr:'Rotor',id:'hpc-rotor'},
  {name:'Stator Vane',tr:'Stator kanadı',id:'fixed-stator-vane'},
  {name:'VSV',tr:'VSV',id:'variable-stator-vane'},
  {name:'Shroud',tr:'Shroud',id:'stator-shroud'},
  {name:'Bushing',tr:'Bushing',id:'vsv-bushing'},
  {name:'Seal',tr:'Seal',id:'compressor-seal'},
];
const T=(lang:Lang,tr:string,en:string)=>lang==='tr'?tr:en;
export function Dashboard({lang,onPick,visuals,rootOverviewOverride,customImageKeys}:Props){
 const topics=makeTopics(visuals);
 const [engineTab,setEngineTab]=useState<'cutaway'|'schematic'|'parts'|'info'>('cutaway');
 const [hpcTab,setHpcTab]=useState<'picture'|'model'|'parts'>('picture');
 const [focused,setFocused]=useState('hpc-overview');
 const RootOverview = loadSection('turbofan-engine', 'overview', lang) || loadSection('turbofan-engine', 'overview', 'tr');
 function navigate(id:string,chapter?:string){onPick(id,chapter)}
 return <div className="dashboard" aria-label="Turbofan engineering dashboard">
   <div className="dashboard-intro"><div><span className="eyebrow">TFX / TF35000 ENGINE ATLAS</span><h1>{T(lang,'TF35000 Motorunu Keşfet','Explore TF35000')}</h1><p><strong>{lang==='tr'?project.subtitleTr:project.subtitleEn}</strong> — {T(lang,'Görseller ve teknik bilgiler şu an genel taslaktır; TF35000 verilerini daha sonra ekleyebilirsin.','Images and articles are placeholders until TF35000 sources are added.')}</p></div><div className="dashboard-intro-badge">◉ &nbsp; {project.buildLabel}</div></div>
   <div className="dashboard-split">
     <section className="dashboard-panel engine-atlas">
       <div className="dashboard-panel-header"><div><span className="dash-kicker">ENGINE OVERVIEW</span><h2>{T(lang,'TF35000 · Konsept Görünüm','TF35000 · Concept View')} <small>— {T(lang,'Etkileşimli görünüm','Interactive explorer')}</small></h2></div><div className="dash-segments" role="group" aria-label="Engine view">
          <button type="button" className={engineTab==='cutaway'?'chosen':''} onClick={()=>setEngineTab('cutaway')}>{T(lang,'Kesit','Cutaway')}</button><button type="button" className={engineTab==='schematic'?'chosen':''} onClick={()=>setEngineTab('schematic')}>{T(lang,'Şema','Schematic')}</button><button type="button" className={engineTab==='parts'?'chosen':''} onClick={()=>setEngineTab('parts')}>{T(lang,'Sistemler','Systems')}</button><button type="button" className={engineTab==='info'?'chosen':''} onClick={()=>setEngineTab('info')}>{T(lang,'Motor Bilgisi','Engine Info')}</button>
       </div></div>
       {engineTab==='cutaway' ? <div className="atlas-stage">
         <img src={visuals.engineCutaway} alt="Illustrative cutaway render of a turbofan engine" className="atlas-engine-image" />
         {topics.map((area,index)=><button type="button" key={area.id} className={`atlas-point ${focused===area.id?'atlas-point-active':''}`} style={{left:`${area.x}%`,top:`${index%2?27:12}%`}} onMouseEnter={()=>setFocused(area.id)} onFocus={()=>setFocused(area.id)} onClick={()=>navigate(area.id)} title={T(lang,'Detay sayfasını aç','Open detail page')+': '+area.name}><span>{area.name}</span><i/></button>)}
         <div className="atlas-label">{customImageKeys.engineCutaway ? T(lang,'KULLANICI GÖRSELİ · KAYNAĞI DOĞRULA','USER IMAGE · VERIFY SOURCE') : T(lang,'TEMSİLİ MOTOR KESİTİ · GERÇEK CAD DEĞİL','PLACEHOLDER CUTAWAY · NOT OEM CAD')}</div>
       </div> : engineTab==='schematic' ? <div className="atlas-schematic"><EngineSchematic lang={lang} selected={focused} onPick={navigate}/></div> : engineTab==='info' ? <div className="dashboard-root-overview article-content">{rootOverviewOverride ? <MarkdownArticle text={rootOverviewOverride}/> : RootOverview ? <RootOverview/> : <p>{T(lang,'Motor genel bakış metni henüz eklenmedi.','Engine overview has not been added yet.')}</p>}</div> : <div className="atlas-systems">{topics.map(t=><button type="button" key={t.id} onClick={()=>navigate(t.id)}><img src={t.thumb} alt=""/><span>{t.name}</span><b>↗</b></button>)}</div>}
       <div className="atlas-thumb-row">{topics.map(t=><button type="button" key={t.id} onMouseEnter={()=>setFocused(t.id)} onFocus={()=>setFocused(t.id)} onClick={()=>navigate(t.id)} className={focused===t.id?'atlas-thumb selected':''}><img src={t.thumb} alt=""/><span>{t.name}</span></button>)}</div>
       <div className="atlas-footer-note">ⓘ {T(lang,'Konsept çizimi motor mimarisini anlatır; motor üreticisine ait ölçü veya geometri içermez.','Illustrative engine architecture, not manufacturer geometry or dimensional data.')}</div>
     </section>
     <section className="dashboard-panel hpc-highlight"><div className="hpc-breadcrumb">ENGINE OVERVIEW <span>›</span> HPC</div><h2>{T(lang,'Yüksek Basınç Kompresörü','High Pressure Compressor')}</h2><p>{T(lang,'Kompresör çekirdeğinde basınç yükselmesini sağlayan çok kademeli sistem.','A multi-stage system that raises core airflow pressure.')}</p><div className="dash-segments hpc-tabs" role="group" aria-label="HPC display"><button className={hpcTab==='picture'?'chosen':''} onClick={()=>setHpcTab('picture')}>{T(lang,'Görünüm','Overview')}</button><button className={hpcTab==='model'?'chosen':''} onClick={()=>setHpcTab('model')}>3D</button><button className={hpcTab==='parts'?'chosen':''} onClick={()=>setHpcTab('parts')}>{T(lang,'Parçalar','Parts')}</button></div>
        {hpcTab==='picture'?<div className="hpc-picture" role="img" aria-label="Illustrative compressor render"><img src={visuals.hpcAssembly} alt="Conceptual compressor assembly visualization"/><span>{customImageKeys.hpcAssembly ? T(lang,'KULLANICI GÖRSELİ','USER IMAGE') : T(lang,'TEMSİLİ GÖRSEL','ILLUSTRATIVE RENDER')}</span></div>:hpcTab==='model'?<div className="hpc-model"><EngineViewer lang={lang} isVsv={false}/></div>:<div className="hpc-part-list">{hpcParts.map(part=><button type="button" key={part.id} onClick={()=>navigate(part.id)}><span>◈</span>{lang==='tr'?part.tr:part.name}<b>↗</b></button>)}</div>}
        <div className="hpc-key-features"><span>◈ {T(lang,'Rotor + stator kademeleri','Rotor + stator stages')}</span><span>◈ {T(lang,'Akış yönlendirme / difüzyon','Flow turning / diffusion')}</span></div><button type="button" className="dash-primary" onClick={()=>navigate('hpc-overview')}>{T(lang,'HPC Teknik Sayfasına Git','Open HPC Engineering Chapter')} <span>↗</span></button>
     </section>
   </div>
   <div className="dashboard-card-grid">
     <article className="dashboard-feature"><div><span className="dash-kicker">COMPONENT SPOTLIGHT / 01</span><h3>{T(lang,'Stator Kanadı','Stator Vane')}</h3><p>{T(lang,'Akışı sonraki rotor kademesine uygun koşullarda yönlendiren kanatların geometrisini, malzemesini ve yüklerini incele.','Explore geometry, materials and loads of the vanes that redirect flow towards the next rotor stage.')}</p><button onClick={()=>navigate('fixed-stator-vane')}>{T(lang,'Detayları aç','Explore component')} ↗</button></div><img src={visuals.statorVane} alt="Illustrative stator vane geometry"/></article>
     <article className="dashboard-feature"><div><span className="dash-kicker">ENGINEERING TOPICS / 02</span><h3>{T(lang,'Aerodinamik Tasarım','Aerodynamic Design')}</h3><p>{T(lang,'Velocity triangles, incidence, diffusion ve kayıp mekanizmalarıyla kompresör aerodinamiğini keşfet.','Learn about velocity triangles, incidence, diffusion and compressor losses.')}</p><button onClick={()=>navigate('fixed-stator-vane','aero')}>{T(lang,'Makaleye git','Read engineering article')} ↗</button></div><img src={visuals.aerodynamics} alt="Illustrative compressor flow lines"/></article>
     <article className="dashboard-feature"><div><span className="dash-kicker">PARTS & ASSEMBLIES / 03</span><h3>{T(lang,'Parçalar ve Montajlar','Parts & Assemblies')}</h3><p>{T(lang,'Rotor, stator, shroud, bushing ve seal gibi alt bileşenlerin tasarım ilişkilerine ulaş.','Open linked design pages for rotor, stator, shroud, bushing and seal assemblies.')}</p><button onClick={()=>navigate('hpc-overview','architecture')}>{T(lang,'Parça ağacını aç','Explore assemblies')} ↗</button></div><img src={visuals.partsAssembly} alt="Illustrative exploded compressor assembly"/></article>
   </div>
   <div className="dashboard-disclaimer">◈ {T(lang,'Görseller önceki prototipten korunmuştur; TF35000 motoruna ait değildir. Teknik bilgiler genel örnektir ve motor özelinde doğrulanmalıdır.','Visuals are retained from the previous prototype, not actual TF35000 imagery. Technical content is generic and must be verified.')}</div>
 </div>
}
