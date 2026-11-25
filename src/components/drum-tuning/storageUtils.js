export const STORAGE_KEY = 'blog-drum-lab-v1';
export const defaultKit = () => ({ version: 1, a4: 440, language:'pl', volume:0.2, duration:1, sound:'sine', drums:
  [156,116,71].map((frequency,i) => ({id:`tom-${i}`,name:`Drum set 1 — Tom ${i+1}`,diameter:i===0?10:'',depth:'',frequency,cents:300,direction:'bottom',calibration:1,history:[]})) });
function range(v,min,max) { return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max; }
export function validateKit(input) {
  if (!input || input.version !== 1 || !range(input.a4,400,480) || !Array.isArray(input.drums) || input.drums.length > 100 ||
    !['pl','en'].includes(input.language) || !range(input.volume,0,0.5) || !range(input.duration,0.1,5) || !['sine','drum'].includes(input.sound)) throw new Error('Invalid configuration');
  const ids = new Set();
  const drums = input.drums.map(d => {
    if (!d || typeof d.id !== 'string' || ids.has(d.id) || typeof d.name !== 'string' || d.name.length > 120 ||
      !range(d.frequency,20,2000) || !range(d.cents,0,2400) || !Number.isInteger(d.cents) || !range(d.calibration,0.1,10) ||
      !['bottom','top','equal'].includes(d.direction) || ![d.diameter,d.depth].every(v => v === '' || range(v,1,60))) throw new Error('Invalid drum');
    ids.add(d.id);
    return { id:d.id,name:d.name,frequency:d.frequency,cents:d.cents,calibration:d.calibration,direction:d.direction,diameter:d.diameter,depth:d.depth,
      history: Array.isArray(d.history) ? d.history.filter(h => h && typeof h.date === 'string' && range(h.factor,0.1,10) && range(h.measured,1,20000)).slice(-20) : [] };
  });
  return {...defaultKit(),a4:input.a4,language:input.language,volume:input.volume,duration:input.duration,sound:input.sound,drums};
}
export function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content],{type}));
  const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function csvCell(value) {
  let text = String(value); if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"','""')}"`;
}
