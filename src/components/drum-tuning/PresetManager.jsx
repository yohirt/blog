import React, {useState} from 'react';
import {defaultKit,download,validateKit} from './storageUtils.js';
import {calculate} from './tuningUtils.js';
export default function PresetManager({kit,setKit,presets,setPresets,t,notify}) {
  const [name,setName]=useState(''),[compare,setCompare]=useState([]);
  async function importFile(e) {
    const file=e.target.files?.[0];if(!file)return;
    try {if(file.size>1000000)throw new Error();setKit(validateKit(JSON.parse(await file.text())));notify(t('Zaimportowano konfigurację.','Configuration imported.'));}
    catch {notify(t('Nieprawidłowy plik. Wybierz JSON wyeksportowany z tej aplikacji (maks. 1 MB).','Invalid file. Choose JSON exported by this app (max 1 MB).'));}finally{e.target.value='';}
  }
  return <section className="panel presets"><h2>{t('Twoje zestawy i warianty','Your kits and variations')}</h2><p>{t('Ostatnia konfiguracja i zapisane warianty pozostają w tej przeglądarce. Eksportuj JSON, aby zachować kopię.','The last configuration and saved variations stay in this browser. Export JSON to keep a backup.')}</p>
    <div className="button-row"><label className="field">{t('Nazwa wariantu','Variation name')}<input value={name} maxLength={80} onChange={e=>setName(e.target.value)} placeholder={t('np. Polmuz — studio','e.g. Polmuz — studio')}/></label><button disabled={!name.trim()} onClick={()=>{setPresets([...presets,{id:crypto.randomUUID(),name:name.trim(),kit:structuredClone(kit)}]);setName('');notify(t('Zapisano wariant.','Variation saved.'));}}>{t('Zapisz wariant','Save variation')}</button>
    <button onClick={()=>download(JSON.stringify(kit,null,2),'drum-kit.json','application/json')}>{t('Eksport JSON','Export JSON')}</button><label className="file-button">{t('Import JSON','Import JSON')}<input type="file" accept="application/json,.json" onChange={importFile}/></label><button onClick={()=>{if(window.confirm(t('Zastąpić bieżący zestaw presetem Polmuz?','Replace the current kit with the Polmuz preset?')))setKit({...defaultKit(),language:kit.language});}}>{t('Przywróć Polmuz','Restore Polmuz')}</button></div>
    {presets.map(p=><div className="preset-row" key={p.id}><label className="check"><input type="checkbox" checked={compare.includes(p.id)} onChange={e=>setCompare(e.target.checked?[...compare,p.id]:compare.filter(id=>id!==p.id))}/>{p.name}</label><div className="button-row"><button onClick={()=>{setKit(validateKit(p.kit));notify(t('Wczytano wariant.','Variation loaded.'));}}>{t('Wczytaj','Load')}</button><button onClick={()=>{setPresets(presets.filter(s=>s.id!==p.id));setCompare(compare.filter(id=>id!==p.id));}}>{t('Usuń','Remove')}</button></div></div>)}
    {compare.length>0 && <div className="table-scroll"><table><caption>{t('Porównanie zaznaczonych wariantów','Selected variation comparison')}</caption><thead><tr>{[t('Wariant','Variation'),t('Bęben','Drum'),'A4',t('Podstawa','Fundamental'),t('Górny','Top'),t('Dolny','Bottom'),'ct'].map(s=><th key={s}>{s}</th>)}</tr></thead><tbody>{presets.filter(p=>compare.includes(p.id)).flatMap(p=>p.kit.drums.map(d=>{const r=calculate(d.frequency,d.cents,d.direction,d.calibration);return <tr key={`${p.id}-${d.id}`}><th>{p.name}</th><td>{d.name}</td><td>{p.kit.a4}</td><td>{d.frequency.toFixed(2)} Hz</td><td>{r.top.toFixed(2)} Hz</td><td>{r.bottom.toFixed(2)} Hz</td><td>{r.cents}</td></tr>;}))}</tbody></table></div>}
  </section>;
}
