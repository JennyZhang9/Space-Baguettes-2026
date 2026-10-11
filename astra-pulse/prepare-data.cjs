// Reproducible data preparation; preserves source units and missing values.
const fs=require('node:fs');
(async()=>{
 const records=[];
 for(const id of ['01','02','03','04','05','06']){
  const url=`https://physionet.org/files/bidmc/1.0.0/bidmc_csv/bidmc_${id}_Numerics.csv`;
  const response=await fetch(url);if(!response.ok)throw Error(`${id}: HTTP ${response.status}`);
  const csv=await response.text();const lines=csv.trim().split(/\r?\n/),header=lines.shift().split(',').map(s=>s.trim());
  if(!header.includes('HR')||!header.includes('SpO2'))throw Error('Unexpected source schema');
  const rows=lines.map(line=>line.split(',').map(v=>v.trim()===''||!Number.isFinite(Number(v))?null:Number(v)));
  records.push({id,source:url,columns:header,rows});
 }
 fs.writeFileSync(__dirname+'/research-data.js','// Exact BIDMC 1.0.0 clinical numerics. Attribution and license in README.\nwindow.BIDMC='+JSON.stringify(records)+';\n');
 console.log(`Saved ${records.length} original research records, ${records.reduce((s,r)=>s+r.rows.length,0)} observations.`);
})().catch(e=>{console.error(e.message);process.exitCode=1});
