import React from 'react';
import {intervals,calculate} from './tuningUtils.js';
import {NoteDisplay,Direction} from './controls.jsx';
import {download,csvCell} from './storageUtils.js';
import {noteInfo} from './musicTheory.js';
export default function TuningTable({kit,t,play,updateAll}) {
  const rows=[...new Set([...intervals.map((_,i)=>i*100),...kit.drums.map(d=>d.cents)])].sort((a,b)=>a-b);
  const label=c=>intervals[c/100]?t(...intervals[c/100]):`${c} ct`;
  function exportCsv() {
    const data=[[t('Bęben','Drum'),t('Interwał (ct)','Interval (ct)'),t('Naciąg','Head'),'Hz',t('Nuta','Note'),t('Nuta Hz','Note Hz'),'Cents',t('Eksperymentalne','Experimental')]];
    rows.forEach(c=>kit.drums.forEach(d=>{const r=calculate(d.frequency,c,d.direction,d.calibration);['top','bottom'].forEach(head=>{const n=noteInfo(r[head],kit.a4);data.push([d.name,r.cents,head,r[head],n.name,n.exact,n.cents,r.experimental]);});}));
    download('\uFEFF'+data.map(r=>r.map(csvCell).join(',')).join('\r\n'),'drum-tuning.csv','text/csv;charset=utf-8');
  }
  return <section className="panel tuning-table"><div className="section-heading"><div><p className="eyebrow">{t('PORÓWNANIE INTERWAŁÓW','INTERVAL COMPARISON')}</p><h2>{t('Tabela strojenia','Tuning table')}</h2></div><div className="button-row no-print"><button onClick={exportCsv}>CSV</button><button onClick={()=>window.print()}>{t('Drukuj','Print')}</button></div></div>
    <div className="no-print"><Direction value={kit.drums.every(d=>d.direction===kit.drums[0]?.direction)?kit.drums[0]?.direction||'bottom':''} onChange={v=>updateAll({direction:v})} t={t}/></div>
    <p>{t('Kierunek nad tabelą zmienia wszystkie bębny. Wyróżnienie oznacza wybrany interwał; „oba jednakowo” daje 0 ct w każdym wierszu. * oznacza ekstrapolację.','Direction above applies to all drums. Highlight marks the selected interval; “both equal” gives 0 ct in every row. * indicates extrapolation.')}</p>
    <div className="table-scroll" tabIndex={0} role="region" aria-label={t('Tabela częstotliwości','Frequency table')}><table><thead><tr><th rowSpan={2}>{t('Interwał','Interval')}</th>{kit.drums.map(d=><th key={d.id} colSpan={2}>{d.name}<small>{d.frequency.toFixed(2)} Hz · ×{d.calibration.toFixed(3)}</small></th>)}</tr><tr>{kit.drums.map(d=><React.Fragment key={d.id}><th className="top">{t('Górny','Top')}</th><th className="bottom">{t('Dolny','Bottom')}</th></React.Fragment>)}</tr></thead><tbody>
      {rows.map(c=><tr key={c}><th scope="row">{label(c)}<small>{c} ct</small></th>{kit.drums.map(d=>{const r=calculate(d.frequency,c,d.direction,d.calibration);return <React.Fragment key={d.id}>{['top','bottom'].map(head=><td key={head} className={(d.direction==='equal'?c===0:d.cents===c)?'selected-cell':''}>{r.experimental && <span title={t('Eksperymentalna ekstrapolacja','Experimental extrapolation')}>*</span>}<NoteDisplay frequency={r[head]} a4={kit.a4} t={t} play={play} kind={head} compact/></td>)}</React.Fragment>;})}</tr>)}
    </tbody></table></div>
  </section>;
}
