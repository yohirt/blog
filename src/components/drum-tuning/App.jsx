import React, {useEffect,useState} from 'react';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './tuning.css';
import DrumCard from './DrumCard.jsx';
import TuningTable from './TuningTable.jsx';
import PresetManager from './PresetManager.jsx';
import PitchBendSimulator from './PitchBendSimulator.jsx';
import {NumberField,IntervalSelector,Direction} from './controls.jsx';
import {defaultKit,validateKit,STORAGE_KEY} from './storageUtils.js';
import {playTones,stopAudio} from './audioUtils.js';

export default function App() {
  const [kit,setKit]=useState(defaultKit),[presets,setPresets]=useState([]),[ready,setReady]=useState(false);
  const [message,setMessage]=useState(''),[storageError,setStorageError]=useState(false),[theme,setTheme]=useState('dark');
  const [globalCents,setGlobalCents]=useState(300),[globalDirection,setGlobalDirection]=useState('bottom');
  const t=(pl,en)=>kit.language==='pl'?pl:en;
  useEffect(()=>{
    setTheme(document.documentElement.classList.contains('dark')?'dark':'light');
    try { const raw=localStorage.getItem(STORAGE_KEY);if(raw){const saved=JSON.parse(raw);const current=validateKit(saved.kit);const list=(saved.presets||[]).map(p=>{if(typeof p.id!=='string'||typeof p.name!=='string')throw new Error();return {id:p.id,name:p.name.slice(0,80),kit:validateKit(p.kit)};});setKit(current);setPresets(list);} }
    catch {setStorageError(true);}finally{setReady(true);}
    return stopAudio;
  },[]);
  useEffect(()=>{if(!ready)return;try{localStorage.setItem(STORAGE_KEY,JSON.stringify({kit,presets}));}catch{setStorageError(true);}},[kit,presets,ready]);
  useEffect(()=>{if(ready && window.location.hash==='#pitch-bend')document.getElementById('pitch-bend')?.scrollIntoView();},[ready]);
  function updateDrum(id,patch){setKit(s=>({...s,drums:s.drums.map(d=>d.id===id?{...d,...patch}:d)}));}
  function updateAll(patch){setKit(s=>({...s,drums:s.drums.map(d=>({...d,...patch}))}));}
  const setting=(key,value)=>setKit(s=>({...s,[key]:value}));
  async function play(frequencies,sequential=false,bend=null){try{await playTones(frequencies,kit,sequential,bend);}catch{setMessage(t('Nie udało się uruchomić dźwięku. Sprawdź obsługę Web Audio i ustawienia przeglądarki.','Could not start audio. Check Web Audio support and browser settings.'));}}
  return <div className="drum-app" data-theme={theme} lang={kit.language}>
    <header className="lab-header"><div><p className="eyebrow">DRUM LAB / {t('WARSZTAT PERKUSISTY','DRUMMER’S WORKSHOP')}</p><h1>{t('Znajdź swoje brzmienie.','Find your sound.')}</h1><p>{t('Strojenie perkusji od podstawy do naciągów. Oblicz, posłuchaj, skalibruj.','Drum tuning from fundamental to heads. Calculate, listen, calibrate.')}</p></div><div className="button-row"><button onClick={()=>setting('language',kit.language==='pl'?'en':'pl')} aria-label={t('Switch to English','Przełącz na polski')}>{kit.language==='pl'?'EN':'PL'}</button><button onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?t('Jasny motyw','Light theme'):t('Ciemny motyw','Dark theme')}</button></div></header>
    <aside className="method-note"><b>{t('Podstawa ≠ częstotliwość przy śrubach.','Fundamental ≠ lug frequency.')}</b> {t('Obliczenia to punkt wyjścia dla tomów. Interpolacja i ekstrapolacja są rozszerzeniem, a nie oficjalnym algorytmem Tune-Bot. Dopasuj wynik do bębna przez kalibrację.','Calculations are a starting point for toms. Interpolation and extrapolation extend the method and are not an official Tune-Bot algorithm. Calibrate for your drum.')} <a href="https://tune-bot.com/tuning-guide/" target="_blank" rel="noreferrer">{t('Instrukcja Tune-Bot','Tune-Bot guide')}</a></aside>
    {storageError && <p className="warning" role="alert">{t('Nie udało się odczytać lub zapisać danych przeglądarki. Zachowaj konfigurację przez eksport JSON.','Browser data could not be read or saved. Keep a backup using JSON export.')}</p>}
    <div role="status" className="status-message">{message}</div>
    <section className="panel no-print"><h2>{t('Ustawienia sesji','Session settings')}</h2><div className="row g-3"><div className="col-12 col-md-4"><NumberField label={t('Strój referencyjny A4 (Hz)','Reference A4 (Hz)')} value={kit.a4} min={400} max={480} onChange={v=>setting('a4',v)}/></div><div className="col-12 col-md-4"><label className="field">{t('Głośność','Volume')} · {Math.round(kit.volume*200)}%<input type="range" min={0} max={0.5} step={0.01} value={kit.volume} onChange={e=>setting('volume',Number(e.target.value))}/></label></div><div className="col-12 col-md-4"><NumberField label={t('Czas tonu (s)','Tone duration (s)')} value={kit.duration} min={0.1} max={5} onChange={v=>setting('duration',v)}/></div></div>
    <div className="button-row"><label className="field">{t('Brzmienie','Sound')}<select value={kit.sound} onChange={e=>setting('sound',e.target.value)}><option value="sine">{t('Czysty sinus','Pure sine')}</option><option value="drum">{t('Perkusyjne wybrzmiewanie','Percussive decay')}</option></select></label><button disabled={!kit.drums.length} onClick={()=>play(kit.drums.map(d=>d.frequency),true)}>▶ {t('Odsłuchaj cały zestaw','Play the kit')}</button><button onClick={stopAudio}>■ Stop</button></div>
    <details><summary>{t('Wspólne ustawienia naciągów','Shared head settings')}</summary><div className="global-controls"><IntervalSelector value={globalCents} onChange={setGlobalCents} t={t}/><Direction value={globalDirection} onChange={setGlobalDirection} t={t}/><button onClick={()=>updateAll({cents:globalCents,direction:globalDirection})}>{t('Zastosuj do wszystkich','Apply to all')}</button></div></details></section>
    <section className="kit-editor"><div className="section-heading"><div><p className="eyebrow">{t('TWÓJ ZESTAW','YOUR KIT')}</p><h2>{t('Każdy bęben. Własny charakter.','Every drum. Its own character.')}</h2></div><button className="primary" disabled={kit.drums.length>=100} onClick={()=>setKit(s=>({...s,drums:[...s.drums,{...defaultKit().drums[0],id:crypto.randomUUID(),name:t('Nowy tom','New tom'),diameter:'',history:[]}]}))}>+ {t('Dodaj bęben','Add drum')}</button></div>
      {!kit.drums.length && <p className="panel">{t('Dodaj pierwszy bęben, aby rozpocząć.','Add your first drum to get started.')}</p>}
      <div className="drum-grid">{kit.drums.map((drum,index)=><DrumCard key={drum.id} drum={drum} index={index} update={patch=>updateDrum(drum.id,patch)} remove={()=>setKit(s=>({...s,drums:s.drums.filter(d=>d.id!==drum.id)}))} t={t} a4={kit.a4} play={play}/>)}</div>
    </section>
    {kit.drums.length>0 && <TuningTable kit={kit} t={t} play={play} updateAll={updateAll}/>}
    <div className="no-print"><PitchBendSimulator t={t} play={play}/><PresetManager kit={kit} setKit={setKit} presets={presets} setPresets={setPresets} t={t} notify={setMessage}/></div>
    <footer className="lab-footer">{t('A4','A4')} = {kit.a4} Hz · {t('Strój równomiernie temperowany · Obliczenia przybliżone, interwały dokładne.','Equal temperament · Approximate drum model, exact intervals.')}</footer>
  </div>;
}
