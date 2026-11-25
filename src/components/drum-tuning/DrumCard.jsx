import React from 'react';
import {NumberField,IntervalSelector,Direction,NoteDisplay,DrumVisualization,PianoKeyboard} from './controls.jsx';
import CalibrationPanel from './CalibrationPanel.jsx';
import {calculate} from './tuningUtils.js';
import {midiFrequency,noteInfo} from './musicTheory.js';
export default function DrumCard({drum,update,remove,t,a4,play,index}) {
  const result=calculate(drum.frequency,drum.cents,drum.direction,drum.calibration);
  return <article className="drum-card panel">
    <div className="card-heading"><span className="eyebrow">TOM {String(index+1).padStart(2,'0')}</span><button type="button" className="quiet" onClick={remove} aria-label={`${t('Usuń','Remove')} ${drum.name}`}>{t('Usuń bęben','Remove drum')}</button></div>
    <label className="field drum-name">{t('Nazwa bębna','Drum name')}<input value={drum.name} maxLength={120} onChange={e=>update({name:e.target.value})}/></label>
    <div className="form-grid"><NumberField label={t('Średnica (cale)','Diameter (inches)')} value={drum.diameter} onChange={v=>update({diameter:v})} min={1} max={60} optional/><NumberField label={t('Głębokość (cale)','Depth (inches)')} value={drum.depth} onChange={v=>update({depth:v})} min={1} max={60} optional/></div>
    <DrumVisualization drum={drum} result={result} a4={a4} t={t}/>
    <div className="fundamental-block"><h3>{t('Docelowa podstawa bębna','Target drum fundamental')}</h3><NoteDisplay frequency={drum.frequency} a4={a4} t={t} play={play} kind="fundamental"/>
      <NumberField label={t('Częstotliwość (Hz)','Frequency (Hz)')} value={drum.frequency} onChange={v=>update({frequency:v})}/>
      <input aria-label={t('Częstotliwość podstawowa','Fundamental frequency')} type="range" min={20} max={2000} step={0.1} value={drum.frequency} onChange={e=>update({frequency:Number(e.target.value)})}/>
      <label className="field">{t('Wybierz nutę','Choose note')}<select value={noteInfo(drum.frequency,a4).midi} onChange={e=>update({frequency:midiFrequency(Number(e.target.value),a4)})}>{Array.from({length:82},(_,i)=>i+15).filter(m=>midiFrequency(m,a4)>=20 && midiFrequency(m,a4)<=2000).map(m=><option key={m} value={m}>{noteInfo(midiFrequency(m,a4),a4).name}</option>)}</select></label>
      <button type="button" onClick={()=>{let midi=noteInfo(drum.frequency,a4).midi;while(midiFrequency(midi,a4)<20)midi++;while(midiFrequency(midi,a4)>2000)midi--;update({frequency:midiFrequency(midi,a4)});}}>{t('Dostrój do najbliższej nuty','Snap to nearest note')}</button>
    </div>
    <IntervalSelector value={drum.cents} onChange={v=>update({cents:v})} t={t}/><Direction value={drum.direction} onChange={v=>update({direction:v})} t={t}/>
    <p className="interval-readout">{t('Interwał naciągów','Head interval')}: <b>{result.cents} ct</b> · {result.ratio.toFixed(5)} : 1</p>
    {result.experimental && <p className="warning">{t('Eksperymentalna ekstrapolacja: interwał poza zakresem punktów Tune-Bot.','Experimental extrapolation: interval exceeds the Tune-Bot reference range.')}</p>}
    <div className="head-results"><section><h3 className="top">{t('Górny · przy śrubach','Top · at lugs')}</h3><NoteDisplay frequency={result.top} a4={a4} t={t} play={play} kind="top"/></section><section><h3 className="bottom">{t('Dolny · przy śrubach','Bottom · at lugs')}</h3><NoteDisplay frequency={result.bottom} a4={a4} t={t} play={play} kind="bottom"/></section></div>
    <div className="button-row"><button type="button" onClick={()=>play([result.top,result.bottom])}>{t('Oba razem','Both together')}</button><button type="button" onClick={()=>play([result.top,result.bottom],true)}>{t('Oba kolejno','Both in sequence')}</button></div>
    <details><summary>{t('Klawiatura i nuty','Keyboard and notes')}</summary><PianoKeyboard drum={drum} result={result} a4={a4} t={t} play={play} update={update}/></details>
    <NumberField label={t('Współczynnik kalibracji','Calibration multiplier')} value={drum.calibration} onChange={v=>update({calibration:v})} min={0.1} max={10}/>
    <CalibrationPanel drum={drum} result={result} t={t} update={update}/>
  </article>;
}
