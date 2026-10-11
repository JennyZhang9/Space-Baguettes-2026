/* Research-derived generative model + Isolation Forest. All processing is local. */
window.HealthEngine=(()=>{
 const finite=Number.isFinite,avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const random=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 function forest(points,seed=2026){
  const clean=points.filter(p=>p.every(finite));if(clean.length<8)return null;
  const rng=random(seed),n=Math.min(clean.length,64),depth=Math.ceil(Math.log2(n));
  const c=n=>{if(n<2)return 0;let h=0;for(let i=1;i<n;i++)h+=1/i;return 2*h-2*(n-1)/n};
  function build(ps,d=0){if(d>=depth||ps.length<2)return {n:ps.length};let ranges=ps[0].map((_,f)=>({f,lo:Math.min(...ps.map(p=>p[f])),hi:Math.max(...ps.map(p=>p[f]))})).filter(r=>r.hi>r.lo);if(!ranges.length)return {n:ps.length};let r=ranges[Math.floor(rng()*ranges.length)],split=r.lo+rng()*(r.hi-r.lo);return {f:r.f,split,l:build(ps.filter(p=>p[r.f]<split),d+1),r:build(ps.filter(p=>p[r.f]>=split),d+1)}}
  const trees=Array.from({length:64},()=>{let shuffled=[...clean];for(let i=shuffled.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}return build(shuffled.slice(0,n))});
  const path=(t,p,d=0)=>t.n!==undefined?d+c(t.n):path(p[t.f]<t.split?t.l:t.r,p,d+1);
  return {samples:clean.length,trees:64,score:p=>p.every(finite)?2**(-avg(trees.map(t=>path(t,p)))/c(n)):null};
 }
 function train(record,seed=2026){
  const ci=name=>record.columns.indexOf(name);
  const rows=record.rows.map(r=>({t:r[0],hr:r[ci('HR')],resp:r[ci('RESP')],spo2:r[ci('SpO2')],pulse:r[ci('PULSE')]}));
  const training=rows.filter(r=>r.t<240&&[r.hr,r.resp,r.spo2].every(finite));
  const center=avg(training.map(r=>r.hr)),rng=random(seed);
  const detector=forest(training.map(r=>[r.hr-center+62,r.resp,r.spo2]),seed);
  // Empirical block-bootstrap fit: observed multivariate distribution and local sequences.
  function sample(count){let out=[];while(out.length<count){let start=Math.floor(rng()*Math.max(1,training.length-10));for(let j=0;j<10&&out.length<count;j++)out.push({...training[start+j]})}return out}
  return {rows,training,center,detector,sample,recordId:record.id,seed};
 }
 function generate(model,inputs,count=30){
  const sampled=model.sample(count);
  return sampled.map((r,i)=>{let progress=clamp((i-9)/10,0,1),hr=inputs.sensor&&i>=10&&i%4===0?null:r.hr-model.center+62+progress*(inputs.hr-62);
   return {day:i+1,hr,pulse:hr,resp:r.resp,spo2:inputs.sensor&&i>=10&&i%4===0?null:r.spo2,sleep:7.5+progress*(inputs.sleep-7.5),stress:3+progress*(inputs.stress-3),sweat:2+progress*(inputs.sweat-2),sys:120+progress*(inputs.sys-120),dia:80+progress*(inputs.dia-80),provenance:'synthetic: BIDMC block bootstrap + explicit user-selected context'};
  });
 }
 function checkin(row,detector,baseline={hr:62,sys:120,dia:80},personal=false){
  const coverage=['hr','sleep','stress','sweat','sys','dia'].filter(k=>finite(row[k])).length;
  // Personal physiology is scored only against the person's established reference.
  const ml=detector?detector.score(personal?[row.hr,row.sleep,row.stress]:[row.hr,row.resp,row.spo2]):null;
  const parts=[{name:'Physiological pattern',value:ml===null?null:Math.round(clamp((.72-ml)/.35,0,1)*100),weight:.3,kind:'ML: Isolation Forest similarity'},
   {name:'Sleep context',value:finite(row.sleep)?Math.round(clamp(1-Math.abs(row.sleep-7.5)/5,0,1)*100):null,weight:.3,kind:'Transparent design rule; not learned'},
   {name:'Reported stress',value:finite(row.stress)?Math.round((10-row.stress)*10):null,weight:.3,kind:'Self-report; not inferred from sensors'},
   {name:'BP change from reference',value:finite(row.sys)&&finite(row.dia)&&baseline?Math.round(clamp(1-(Math.abs(row.sys-baseline.sys)+Math.abs(row.dia-baseline.dia))/70,0,1)*100):null,weight:.1,kind:'Relative change; not a BP diagnosis'}];
  const available=parts.filter(p=>p.value!==null),weight=available.reduce((s,p)=>s+p.weight,0),rawScore=available.length?Math.round(available.reduce((s,p)=>s+p.value*p.weight,0)/weight):null;
  const urgentBP=finite(row.sys)&&row.sys>180||finite(row.dia)&&row.dia>120;
  const score=urgentBP?null:rawScore;
  let actions=[];
  if(finite(row.sleep)&&row.sleep<7)actions.push({title:'Make room for rest',text:'Review your sleep opportunity, light exposure and workload. Protect a regular rest period and discuss persistent fatigue with your support team.'});
  if(finite(row.stress)&&row.stress>=6)actions.push({title:'Check in with someone',text:'Pause, name what is adding pressure, and plan a supportive conversation. A wearable cannot determine your mental health.'});
  if(ml!==null&&ml>.6)actions.push({title:'Review a changed pattern',text:'Check sensor quality and measurement conditions. Compare the trend with your own history and discuss persistent changes or symptoms with a qualified professional.'});
  if(finite(row.sys)&&finite(row.dia)&&baseline&&(Math.abs(row.sys-baseline.sys)>15||Math.abs(row.dia-baseline.dia)>10))actions.push({title:'Recheck your blood-pressure entry',text:'Use a validated cuff and a consistent measurement routine. Discuss unexpected repeat readings with your clinician; this prototype does not classify blood pressure.'});
  if(finite(row.sweat)&&row.sweat>=7)actions.push({title:'Add context to the sweat reading',text:'Record exercise, warmth and sensor contact. Sweat or skin conductance alone cannot identify stress or hydration needs.'});
  if(!finite(row.hr)||!finite(row.spo2)&&!personal)actions.push({title:'Check the sensor connection',text:'Some physiological readings are unavailable. Missing readings reduce the evidence available; they are not automatically a health event.'});
  if(urgentBP)actions.unshift({title:'Prioritize the blood-pressure reading',text:'A reading above 180 systolic or 120 diastolic takes priority over this index. If this is a real adult reading, follow the American Heart Association guidance: repeat after at least one minute; if still high, contact a healthcare professional promptly. With chest pain, shortness of breath, weakness, vision changes or difficulty speaking, seek emergency help immediately. In an actual mission, use mission medical protocols.',link:'https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/when-to-call-911-for-high-blood-pressure'});
  if(!actions.length)actions.push({title:'Keep a steady routine',text:'Continue tracking consistently and make time for rest, movement and connection. A favorable check-in index does not establish health or rule out a problem.'});
  return {score,ml,parts,coverage,actions,urgentBP,label:urgentBP?'Review this BP reading first':score===null?'Add a check-in':score>=75?'Less change in this check-in':score>=50?'Make space for recovery':'Give this check-in attention'};
 }
 return {train,generate,forest,checkin,avg,clamp};
})();
