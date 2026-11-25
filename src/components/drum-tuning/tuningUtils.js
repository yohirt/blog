import { positive } from './musicTheory.js';
export const intervals = [
  ['Pryma czysta','Unison'],['Sekunda mała','Minor second'],['Sekunda wielka','Major second'],
  ['Tercja mała','Minor third'],['Tercja wielka','Major third'],['Kwarta czysta','Perfect fourth'],
  ['Tryton','Tritone'],['Kwinta czysta','Perfect fifth'],['Seksta mała','Minor sixth'],
  ['Seksta wielka','Major sixth'],['Septyma mała','Minor seventh'],['Septyma wielka','Major seventh'],['Oktawa','Octave']
];
export const anchors = [[1.75,1.75],[1.5,1.85],[1.4,2],[1.2,2.3]];
export function calculate(fundamental, cents = 300, direction = 'bottom', calibration = 1) {
  positive(fundamental); positive(calibration);
  if (!Number.isFinite(cents) || cents < 0 || cents > 2400 || !['bottom','top','equal'].includes(direction)) throw new RangeError('Invalid interval');
  const ratio = 2 ** ((direction === 'equal' ? 0 : cents) / 1200);
  let index = anchors.findIndex((p,i) => i > 0 && p[1] / p[0] >= ratio);
  if (index < 0) index = anchors.length - 1;
  const [a,b] = anchors[index - 1], [c,d] = anchors[index];
  const t = (ratio * a - b) / ((d - b) - ratio * (c - a));
  const lower = fundamental * (a + t * (c - a)) * calibration, higher = lower * ratio;
  return { top: direction === 'top' ? higher : lower, bottom: direction === 'top' ? lower : higher,
    experimental: ratio > 2.3 / 1.2, ratio, cents: direction === 'equal' ? 0 : cents };
}
export function calibrate(drum, measured) {
  Object.values(measured).forEach(positive);
  const base = calculate(drum.frequency, drum.cents, drum.direction, 1);
  // Geometric mean fits both measured heads with a common factor, preserving the selected interval.
  const factor = Math.sqrt((measured.top / base.top) * (measured.bottom / base.bottom)) * drum.frequency / measured.fundamental;
  return { factor, measuredCents: 1200 * Math.log2(measured.bottom / measured.top),
    top: base.top * factor, bottom: base.bottom * factor };
}
export function bendFrequency(start, end, progress, curve) {
  return curve === 'linear' ? start + (end - start) * progress : start * (end / start) ** progress;
}
