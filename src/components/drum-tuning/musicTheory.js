export const names = ['C', 'C♯ / D♭', 'D', 'D♯ / E♭', 'E', 'F', 'F♯ / G♭', 'G', 'G♯ / A♭', 'A', 'A♯ / B♭', 'B'];
const polish = ['c', 'cis / des', 'd', 'dis / es', 'e', 'f', 'fis / ges', 'g', 'gis / as', 'a', 'ais / b', 'h'];
export function positive(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) throw new RangeError('Expected a positive finite frequency');
  return value;
}
export function midiFrequency(midi, a4 = 440) { return positive(a4) * 2 ** ((midi - 69) / 12); }
export function noteInfo(frequency, a4 = 440) {
  positive(frequency); positive(a4);
  const midi = 69 + 12 * Math.log2(frequency / a4);
  const nearest = Math.round(midi), pitch = ((nearest % 12) + 12) % 12;
  const octave = Math.floor(nearest / 12) - 1, exact = midiFrequency(nearest, a4);
  return { midi: nearest, octave, exact, cents: 1200 * Math.log2(frequency / exact), delta: frequency - exact,
    name: names[pitch].split(' / ').map(n => `${n}${octave}`).join(' / '),
    pl: octave <= 2 ? polish[pitch].toUpperCase() : polish[pitch],
    octavePl: ({0:'subkontra',1:'kontra',2:'wielka',3:'mała',4:'razkreślna',5:'dwukreślna',6:'trzykreślna',7:'czterokreślna'})[octave] || String(octave) };
}
export const signed = (n, digits = 1) => `${n >= 0 ? '+' : ''}${n.toFixed(digits)}`;
