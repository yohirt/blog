import test from 'node:test';
import assert from 'node:assert/strict';
import {anchors,calculate,calibrate,bendFrequency} from './tuningUtils.js';
import {noteInfo,midiFrequency} from './musicTheory.js';
import {defaultKit,validateKit,csvCell} from './storageUtils.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('reference anchors are reproduced without intermediate rounding',()=>{
  for(const [low,high] of anchors){const r=calculate(100,1200*Math.log2(high/low));close(r.top,100*low);close(r.bottom,100*high);}
});
test('all intervals preserve exact ratios in both directions and with calibration',()=>{
  for(let cents=0;cents<=2400;cents++)for(const direction of ['top','bottom']){
    const r=calculate(156,cents,direction,1.2345);close(Math.max(r.top,r.bottom)/Math.min(r.top,r.bottom),2**(cents/1200));assert.ok(r.top>0&&r.bottom>0);
  }
});
test('equal heads, extrapolation and invalid input',()=>{
  const r=calculate(100,1200,'equal');close(r.top,175);close(r.bottom,175);assert.equal(r.cents,0);assert.equal(r.experimental,false);
  assert.equal(calculate(100,1200).experimental,true);assert.equal(calculate(100,1100).experimental,false);
  for(const f of [0,-1,NaN,Infinity,'100'])assert.throws(()=>calculate(f));
  for(const cents of [-1,NaN,Infinity,2401])assert.throws(()=>calculate(100,cents));
});
test('music notation, octaves, A4 and cents',()=>{
  close(noteInfo(440).exact,440);close(noteInfo(440).cents,0);close(midiFrequency(69,442),442);
  for(const [m,pl,octave] of [[47,'H',2],[46,'AIS / B',2],[41,'F',2],[53,'f',3],[65,'f',4],[77,'f',5]]){const n=noteInfo(midiFrequency(m));assert.equal(n.pl,pl);assert.equal(n.octave,octave);}
  const n=noteInfo(156);assert.equal(n.name,'D♯3 / E♭3');assert.ok(n.cents>4.8 && n.cents<5);
  for(let m=15;m<100;m++)close(noteInfo(midiFrequency(m,442),442).cents,0);
  for(const f of [0,NaN,Infinity,-440])assert.throws(()=>noteInfo(f));
});
test('calibration fits measured heads while preserving selected interval and supports iteration',()=>{
  let drum=defaultKit().drums[0];let r=calculate(drum.frequency,drum.cents,drum.direction);
  let result=calibrate(drum,{fundamental:140,top:r.top,bottom:r.bottom});close(result.factor,156/140);close(result.bottom/result.top,2**0.25);
  drum={...drum,calibration:result.factor};r=calculate(drum.frequency,drum.cents,drum.direction,drum.calibration);
  result=calibrate(drum,{fundamental:156,top:r.top,bottom:r.bottom});close(result.factor,drum.calibration);
  result=calibrate(drum,{fundamental:150,top:200,bottom:310});close(result.bottom/result.top,2**0.25);close(result.measuredCents,1200*Math.log2(310/200));
  assert.throws(()=>calibrate(drum,{fundamental:0,top:200,bottom:300}));
});
test('pitch bend endpoints and midpoint',()=>{
  for(const curve of ['linear','exponential']){close(bendFrequency(200,100,0,curve),200);close(bendFrequency(200,100,1,curve),100);}
  close(bendFrequency(200,100,0.5,'linear'),150);close(bendFrequency(200,100,0.5,'exponential'),Math.sqrt(20000));
});
test('JSON round trip and hostile or corrupt imports',()=>{
  const kit=defaultKit();assert.deepEqual(validateKit(JSON.parse(JSON.stringify(kit))),kit);
  for(const patch of [{a4:0},{version:2},{volume:2},{duration:-1},{language:'xx'},{drums:null}])assert.throws(()=>validateKit({...kit,...patch}));
  for(const patch of [{frequency:'156'},{frequency:NaN},{direction:'invalid'},{calibration:0},{cents:300.5},{diameter:-10}])assert.throws(()=>validateKit({...kit,drums:[{...kit.drums[0],...patch}]}));
  assert.throws(()=>validateKit({...kit,drums:[kit.drums[0],kit.drums[0]]}));
  assert.equal(csvCell('=SUM(1,2)'),`"'=SUM(1,2)"`);assert.equal(csvCell('Tom "A"'),'"Tom ""A"""');
});
