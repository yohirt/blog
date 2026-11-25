import React, {useState} from 'react';
import {NumberField} from './controls.jsx';
import {calibrate} from './tuningUtils.js';
import {signed} from './musicTheory.js';
export default function CalibrationPanel({drum,result,t,update}) {
  const [measured,setMeasured]=useState({fundamental:drum.frequency,top:result.top,bottom:result.bottom});
  const [confirmed,setConfirmed]=useState(false);
  const proposal=calibrate(drum,measured);
  const edit=(key,value)=>{setMeasured({...measured,[key]:value});setConfirmed(false);};
  return <details className="calibration"><summary>{t('Kalibracja rzeczywistego bębna','Calibrate your drum')} <span>{drum.history.length ? `(${drum.history.length})`:''}</span></summary>
    <p>{t('Wpisz pomiary ze stroika. Korekta skaluje oba naciągi wspólnie i zachowuje wybrany interwał. Przy różnym interwale pomiarów dopasowujemy ich średnią geometryczną.','Enter readings from your tuner. Correction scales both heads together and preserves your selected interval, fitting the geometric mean of the measurements.')}</p>
    <div className="form-grid"><NumberField label={t('Zmierzona podstawa (Hz)','Measured fundamental (Hz)')} value={measured.fundamental} onChange={v=>edit('fundamental',v)} min={1} max={20000}/><NumberField label={t('Zmierzony górny (Hz)','Measured top (Hz)')} value={measured.top} onChange={v=>edit('top',v)} min={1} max={20000}/><NumberField label={t('Zmierzony dolny (Hz)','Measured bottom (Hz)')} value={measured.bottom} onChange={v=>edit('bottom',v)} min={1} max={20000}/></div>
    <p>{t('Zmierzony interwał dolny/górny','Measured bottom/top interval')}: <b>{signed(proposal.measuredCents)} ct</b></p>
    <p>{t('Propozycja przy śrubach','Suggested lug frequencies')}: <span className="top">{proposal.top.toFixed(2)} Hz</span> / <span className="bottom">{proposal.bottom.toFixed(2)} Hz</span> · ×{proposal.factor.toFixed(4)}</p>
    <label className="check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>{t('Wprowadziłem nowe, rzeczywiste pomiary','I have entered new actual measurements')}</label>
    <button type="button" disabled={!confirmed || proposal.factor<0.1 || proposal.factor>10} onClick={()=>{update({calibration:proposal.factor,history:[...drum.history,{date:new Date().toISOString(),factor:proposal.factor,measured:measured.fundamental}].slice(-20)});setConfirmed(false);}}>{t('Zastosuj kalibrację','Apply calibration')}</button>
    {(proposal.factor<0.1 || proposal.factor>10) && <p className="warning">{t('Korekta poza zakresem 0,1–10. Sprawdź pomiary.','Correction outside 0.1–10. Check measurements.')}</p>}
    {drum.history.length>0 && <ol className="history">{drum.history.map((h,i)=><li key={i}>{new Date(h.date).toLocaleString()} · {h.measured.toFixed(2)} Hz · ×{h.factor.toFixed(4)}</li>)}</ol>}
  </details>;
}
