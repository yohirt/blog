import { bendFrequency } from './tuningUtils.js';
let context;
const active = new Set();
export function stopAudio() { for (const source of active) { try { source.stop(); } catch {} } active.clear(); }
export async function playTones(frequencies, settings, sequential = false, bend = null) {
  const Audio = window.AudioContext;
  if (!Audio) throw new Error('Web Audio unavailable');
  context ||= new Audio(); await context.resume(); stopAudio();
  if (settings.volume === 0) return;
  const duration = bend ? bend.duration / 1000 : settings.duration;
  const level = settings.volume / (sequential ? 1 : Math.max(1,frequencies.length));
  frequencies.forEach((frequency,index) => {
    if (!Number.isFinite(frequency) || frequency <= 0 || frequency >= context.sampleRate / 2) return;
    const start = context.currentTime + 0.02 + (sequential ? index * (duration + 0.12) : 0);
    const osc = context.createOscillator(), gain = context.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(frequency,start);
    if (bend) {
      const values = Float32Array.from({length:128},(_,i)=>bendFrequency(bend.start,bend.end,i/127,bend.curve));
      osc.frequency.setValueCurveAtTime(values,start,duration);
    }
    gain.gain.setValueAtTime(0,start); gain.gain.linearRampToValueAtTime(level,start+0.01);
    if (bend?.envelope === 'linear') gain.gain.linearRampToValueAtTime(0,start+duration);
    else if (bend || settings.sound === 'drum') { gain.gain.exponentialRampToValueAtTime(0.0001,start+duration-0.02); gain.gain.linearRampToValueAtTime(0,start+duration); }
    else { gain.gain.setValueAtTime(level,start+duration-0.04); gain.gain.linearRampToValueAtTime(0,start+duration); }
    osc.connect(gain); gain.connect(context.destination); active.add(osc);
    osc.onended = () => {active.delete(osc);osc.disconnect();gain.disconnect();};
    osc.start(start); osc.stop(start+duration+0.01);
  });
}
