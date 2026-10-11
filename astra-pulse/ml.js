// Seeded browser-local Isolation Forest using actual baseline measurements.
window.trainIsolationForest=function(rows,trees=64){
 const features=r=>[r.hr,r.resp,r.spo2],valid=r=>features(r).every(Number.isFinite),training=rows.slice(0,16).filter(valid).map(features);
 if(training.length<8)throw Error('At least eight complete baseline samples are required.');
 let seed=2026;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const c=n=>{if(n<=1)return 0;let h=0;for(let k=1;k<n;k++)h+=1/k;return 2*h-2*(n-1)/n};
 const maxDepth=Math.ceil(Math.log2(training.length));
 function tree(points,depth=0){if(points.length<=1||depth>=maxDepth)return {size:points.length};const ranges=[0,1,2].map(f=>({f,min:Math.min(...points.map(p=>p[f])),max:Math.max(...points.map(p=>p[f]))})).filter(r=>r.max>r.min);if(!ranges.length)return {size:points.length};const r=ranges[Math.floor(random()*ranges.length)],split=r.min+random()*(r.max-r.min);return {f:r.f,split,left:tree(points.filter(p=>p[r.f]<split),depth+1),right:tree(points.filter(p=>p[r.f]>=split),depth+1)}}
 const forest=Array.from({length:trees},()=>tree(training));
 function path(t,p,d=0){return t.size!==undefined?d+c(t.size):path(p[t.f]<t.split?t.left:t.right,p,d+1)}
 return {trees,samples:training.length,maxDepth,score:r=>valid(r)?2**(-forest.reduce((s,t)=>s+path(t,features(r)),0)/trees/c(training.length)):null};
};
// Add an explicit training panel to the scenario lab after each render.
window.mountML=function(){
 const main=document.querySelector('main');if(!main||!document.querySelector('#evaluate'))return;
 const section=document.createElement('section');section.className='card';section.style.marginTop='20px';section.innerHTML='<div class="eyebrow">Machine learning · trained locally</div><h2 style="margin-top:10px">Let the baseline teach the model.</h2><p>Isolation Forest learns a multivariate reference from the first 16 real measurements. Random feature splits isolate unusual observations in fewer steps. It uses heart rate, respiration, and SpO₂—not a diagnosis or a language model.</p><button class="primary" id="train-ml">Train 64-tree Isolation Forest ↗</button><div id="ml-output" aria-live="polite" style="margin-top:18px"></div><p style="font-size:11px">Training window: 0–150 seconds. Scoring window: 160–480 seconds. Very small, single-record dataset; no population-level validation. Missing features yield no score. Score cutoff 0.65 is illustrative and uncalibrated.</p>';main.insertBefore(section,main.querySelector('footer'));
 document.querySelector('#train-ml').onclick=()=>{
  const baseline=RESEARCH.map((r,i)=>({t:i*10,hr:r[0],resp:r[2],spo2:r[3]}));
  const model=window.trainIsolationForest(baseline);
  const current=series(0,mode==='research'?'stable':scenario).map(r=>({...r,score:model.score(r)}));
  const valid=current.slice(16).filter(r=>r.score!==null),flags=valid.filter(r=>r.score>.65),last=current[index];
  document.querySelector('#ml-output').innerHTML=`<div class="grid stats">${stat('Trees trained',model.trees,'','Seed 2026 · deterministic','#ece9f6','⌘')}${stat('Training samples',model.samples,'','Real data only · 3 features','#eaf0e5','◈')}${stat('Current anomaly score',fmt(last.score,3),'','0–1 score · higher is more unusual','#e7eff1','⌁')}${stat('Scored window flags',flags.length,'/ '+valid.length,'Cutoff >0.65 · missing rows excluded','#f4ece3','↗')}</div><h3>Out-of-window anomaly scores</h3>${mlChart(current)}<p>Training uses the unmodified research baseline even when scenario injections are enabled. Scoring uses your current scenario. This preserves separation between training observations and injected test changes.</p><div class="tablewrap"><table><tr><th>Elapsed</th><th>HR</th><th>Respiration</th><th>SpO₂</th><th>ML score</th></tr>${current.slice(16).filter((r,i)=>i%4===0).map(r=>`<tr><td>${r.t}s</td><td>${fmt(r.hr,1)}</td><td>${r.resp}</td><td>${r.spo2??'Missing'}</td><td>${fmt(r.score,3)}</td></tr>`).join('')}</table></div>`;
 };
};
function mlChart(rows){const x=i=>48+i/48*630,y=s=>200-s*160;let paths=[],p=[];rows.forEach((r,i)=>{if(r.score===null){if(p.length)paths.push(p.join(' '));p=[]}else p.push(`${p.length?'L':'M'}${x(i)},${y(r.score)}`)});if(p.length)paths.push(p.join(' '));return `<svg class="chart" viewBox="0 0 710 245" role="img" aria-label="Isolation Forest anomaly scores over elapsed seconds"><line x1="48" x2="678" y1="${y(.65)}" y2="${y(.65)}" stroke="#b39483" stroke-dasharray="5 5"/><text x="48" y="${y(.65)-8}" fill="#977b6b" font-size="11">Illustrative cutoff 0.65</text>${paths.map(p=>`<path d="${p}" fill="none" stroke="#a18abc" stroke-width="3"/>`).join('')}<text x="8" y="45" font-size="11">1.0</text><text x="8" y="200" font-size="11">0.0</text><text x="48" y="230" font-size="11">0s</text><text x="650" y="230" font-size="11">480s</text></svg>`}
new MutationObserver(()=>{if(document.querySelector('#evaluate')&&!document.querySelector('#train-ml'))window.mountML()}).observe(document.querySelector('#app'),{childList:true});
