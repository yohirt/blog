import React, {useMemo,useState} from 'react';
import {ResponsiveContainer,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip} from 'recharts';
import {NumberField} from './controls.jsx';
import {bendFrequency} from './tuningUtils.js';
export default function PitchBendSimulator({t,play}) {
  const [bend,setBend]=useState({start:182.4,end:156.1,duration:800,curve:'exponential',envelope:'exponential'});
  const update=(key,value)=>setBend(s=>({...s,[key]:value}));
  const semitones=12*Math.log2(bend.start/bend.end);
  const data=useMemo(()=>Array.from({length:81},(_,i)=>({time:i/80*bend.duration,frequency:bendFrequency(bend.start,bend.end,i/80,bend.curve)})),[bend]);
  return <section id="pitch-bend" className="panel pitch-panel"><p className="eyebrow">{t('LABORATORIUM BRZMIENIA','SOUND LAB')}</p><h2>{t('Symulator pitch bendu','Pitch bend simulator')}</h2>
    <p>{t('Model poglądowy, niezależny od interwału naciągów. Nie jest fizycznie dokładną symulacją bębna.','Illustrative model, independent of the head interval. This is not a physically accurate drum simulation.')}</p>
    <div className="button-row">{[[182.4,156.1],[138.6,116.1],[86.1,70.7]].map(([start,end],i)=><button key={i} onClick={()=>setBend(s=>({...s,start,end}))}>Polmuz · Tom {i+1}</button>)}</div>
    <div className="simulator-grid"><div><NumberField label={t('Początek (Hz)','Start (Hz)')} value={bend.start} onChange={v=>update('start',v)}/><NumberField label={t('Koniec (Hz)','End (Hz)')} value={bend.end} onChange={v=>update('end',v)}/><NumberField label={t('Wybrzmiewanie (ms)','Decay (ms)')} value={bend.duration} onChange={v=>update('duration',v)} min={100} max={5000} step={1}/>
      <label className="field">{t('Krzywa częstotliwości','Frequency curve')}<select value={bend.curve} onChange={e=>update('curve',e.target.value)}><option value="exponential">{t('Wykładnicza','Exponential')}</option><option value="linear">{t('Liniowa','Linear')}</option></select></label>
      <label className="field">{t('Zanikanie amplitudy','Amplitude decay')}<select value={bend.envelope} onChange={e=>update('envelope',e.target.value)}><option value="exponential">{t('Wykładnicze','Exponential')}</option><option value="linear">{t('Liniowe','Linear')}</option></select></label>
      <p><b>{semitones.toFixed(2)}</b> {t('półtonów','semitones')} · {(semitones*100).toFixed(1)} ct</p><button className="primary" onClick={()=>play([bend.start],false,bend)}>▶ {t('Odsłuchaj symulację','Play simulation')}</button>
    </div><div className="chart" role="img" aria-label={`${bend.start} Hz → ${bend.end} Hz / ${bend.duration} ms`}><ResponsiveContainer width="100%" height={320}><LineChart data={data} margin={{top:25,right:25,left:5,bottom:25}}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis dataKey="time" unit=" ms" stroke="var(--muted)"/><YAxis unit=" Hz" domain={['auto','auto']} stroke="var(--muted)"/><Tooltip contentStyle={{background:'var(--surface)',border:'1px solid var(--line)',color:'var(--text)'}} formatter={v=>[`${Number(v).toFixed(2)} Hz`,t('Częstotliwość','Frequency')]} labelFormatter={v=>`${v} ms`}/><Line type="monotone" dataKey="frequency" stroke="var(--fundamental)" strokeWidth={3} dot={false} isAnimationActive={false}/></LineChart></ResponsiveContainer></div></div>
  </section>;
}
