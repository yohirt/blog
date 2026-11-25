import React, { useEffect, useState } from 'react';
import { intervals } from './tuningUtils.js';
import { noteInfo, signed, midiFrequency } from './musicTheory.js';

export function NumberField({label,value,onChange,min=20,max=2000,step='any',optional=false}) {
  const [draft,setDraft] = useState(String(value));
  useEffect(()=>setDraft(String(value)),[value]);
  const valid = (draft === '' && optional) || (draft !== '' && Number.isFinite(Number(draft)) && Number(draft)>=min && Number(draft)<=max && (step !== 1 || Number.isInteger(Number(draft))));
  return <label className="field">{label}<input type="number" min={min} max={max} step={step} value={draft} aria-invalid={!valid} onChange={e=>{
    const text=e.target.value;setDraft(text);const n=Number(text);
    if (text==='' && optional) onChange('');
    else if (text!=='' && Number.isFinite(n) && n>=min && n<=max && (step!==1 || Number.isInteger(n))) onChange(n);
  }}/>{!valid && <small className="invalid">{min}–{max}{step===1?' · integer':''}</small>}</label>;
}
export function IntervalSelector({value,onChange,t}) {
  const [custom,setCustom] = useState(false);
  return <div className="form-grid"><label className="field">{t('Interwał','Interval')}
    <select value={!custom && value%100===0 && value<=1200?value:'custom'} onChange={e=>{setCustom(e.target.value==='custom');if(e.target.value!=='custom')onChange(Number(e.target.value));}}>
      {intervals.map((n,i)=><option key={i} value={i*100}>{t(...n)}</option>)}<option value="custom">{t('Własny','Custom')}</option>
    </select></label><NumberField label={t('Interwał w centach','Interval in cents')} value={value} onChange={onChange} min={0} max={2400} step={1}/></div>;
}
export function Direction({value,onChange,t}) {
  return <label className="field">{t('Wyżej strojony naciąg','Higher head')}<select value={value} onChange={e=>onChange(e.target.value)}>
    {value==='' && <option value="" disabled>{t('Różne ustawienia','Mixed settings')}</option>}
    <option value="bottom">{t('Dolny (rezonansowy)','Bottom (resonant)')}</option><option value="top">{t('Górny (uderzany)','Top (batter)')}</option><option value="equal">{t('Oba jednakowo','Both equal')}</option>
  </select></label>;
}
export function CentMeter({cents,t}) { return <div className="cent-meter" role="meter" aria-label={t('Odchylenie od nuty w centach','Deviation from note in cents')} aria-valuemin={-50} aria-valuemax={50} aria-valuenow={cents}>
  <div className="meter-track"><i style={{left:`${cents+50}%`}}/></div><div className="meter-labels"><span>−50 ct</span><span>0</span><span>+50 ct</span></div></div>; }
export function NoteDisplay({frequency,a4,t,play,kind='',compact=false}) {
  const n=noteInfo(frequency,a4);
  return <div className={`note-display ${kind}`}><strong>{frequency.toFixed(2)} <small>Hz</small></strong><span>{n.name} · {signed(n.cents)} ct</span>
    <small>{t('Nuta','Note')}: {n.exact.toFixed(2)} Hz{!compact && ` · Δ ${signed(n.delta,2)} Hz`}</small>
    {!compact && <><small>PL: {n.pl} · {t(`oktawa ${n.octavePl}`,`octave ${n.octave}`)}</small><CentMeter cents={n.cents} t={t}/><small>{Math.abs(n.cents)<0.05?t('Dokładna nuta','In tune'):n.cents>0?t('Powyżej nuty','Sharp'):t('Poniżej nuty','Flat')}</small></>}
    <div className="button-row"><button type="button" onClick={()=>play([frequency])} aria-label={`${t('Odsłuch','Play')} ${frequency.toFixed(2)} Hz`}>▶ {t('Ton','Tone')}</button>{!compact && <button type="button" onClick={()=>play([n.exact])}>♪ {t('Nuta','Note')}</button>}</div>
  </div>;
}
export function DrumVisualization({drum,result,a4,t}) {
  return <svg viewBox="0 0 380 210" className="drum-svg" role="img" aria-label={`${drum.name}: ${t('górny','top')} ${result.top.toFixed(2)} Hz, ${t('dolny','bottom')} ${result.bottom.toFixed(2)} Hz`}>
    <path d="M100 58 L100 150 C100 192 280 192 280 150 L280 58" fill="var(--shell)" stroke="var(--line)" strokeWidth="2"/>
    {[115,145,190,235,265].map(x=><g key={x}><path d={`M${x} 70 V153`} stroke="var(--muted)" strokeWidth="3"/><rect x={x-4} y="91" width="8" height="24" rx="3" fill="var(--muted)"/></g>)}
    <ellipse cx="190" cy="58" rx="90" ry="29" fill="var(--surface)" stroke="var(--top)" strokeWidth="4"/>
    <path d="M100 150 C100 190 280 190 280 150" fill="none" stroke="var(--bottom)" strokeWidth="4"/>
    <text x="190" y="62" textAnchor="middle" fill="var(--top)" fontSize="16">{result.top.toFixed(1)} Hz</text>
    <rect x="142" y="118" width="96" height="28" rx="7" fill="var(--surface)"/><text x="190" y="138" textAnchor="middle" fill="var(--fundamental)" fontSize="18">{drum.frequency.toFixed(1)} Hz</text>
    <text x="190" y="203" textAnchor="middle" fill="var(--bottom)" fontSize="16">{result.bottom.toFixed(1)} Hz · {noteInfo(result.bottom,a4).name}</text>
  </svg>;
}
export function PianoKeyboard({drum,result,a4,t,play,update}) {
  const marked = [drum.frequency,result.top,result.bottom].map(f=>noteInfo(f,a4).midi);
  const start = Math.max(0,Math.min(36,Math.floor(Math.min(...marked)/12)*12));
  const end = Math.min(108,Math.max(72,Math.ceil(Math.max(...marked)/12)*12));
  return <section className="piano-section"><p>{t('Klawiatura: kliknij nutę, aby odsłuchać i ustawić podstawę bębna.','Keyboard: play a note and set it as the drum fundamental.')}</p>
    <div className="piano" role="group" aria-label={t('Klawiatura fortepianowa','Piano keyboard')}>{Array.from({length:end-start+1},(_,i)=>start+i).map(m=>{
      const f=midiFrequency(m,a4), n=noteInfo(f,a4), black=[1,3,6,8,10].includes(m%12);
      return <button type="button" key={m} disabled={f<20 || f>2000} className={`piano-key ${black?'black':'white'}`} title={`${n.name} · ${f.toFixed(2)} Hz`} aria-label={`${n.name} ${f.toFixed(2)} Hz`} onClick={()=>{update({frequency:f});play([f]);}}>
        <span className="key-marks">{marked.map((note,index)=>note===m?<i key={index} className={['fundamental','top','bottom'][index]}/>:null)}</span><span>{n.name.split(' / ')[0]}</span>
      </button>;
    })}</div><p className="legend"><span className="fundamental">● {t('Podstawa','Fundamental')}</span><span className="top">● {t('Górny','Top')}</span><span className="bottom">● {t('Dolny','Bottom')}</span></p>
  </section>;
}
