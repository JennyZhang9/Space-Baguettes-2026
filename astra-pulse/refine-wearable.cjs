const fs=require('node:fs'),file=__dirname+'/experience.js';let s=fs.readFileSync(file,'utf8');
const old="if(qs('#space'))bindWrist();}",replacement="if(qs('#space')){bindWrist();addSensorArrows();}}";if(!s.includes(old))throw Error('Wearable hook not found');s=s.replace(old,replacement);
s+=String.raw`
function addSensorArrows(){
 const paths={ppg:'M-75 35 H-45 L-14 59',oxygen:'M200 90 H165 L127 78',eda:'M15 218 V178 L39 150',motion:'M188 -37 H156 L119 15',temp:'M-55 -47 H-17 L24 -8'};
 const positions={ppg:[-80,26,'Pulse'],oxygen:[166,111,'Oxygen'],eda:[-5,232,'Skin response'],motion:[136,-48,'Motion'],temp:[-68,-60,'Temperature']};
 qs('.watch-case').insertAdjacentHTML('beforeend', '<svg class="sensor-leaders" viewBox="-100 -85 340 340"><defs><marker id="sensor-tip" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="#789c83"/></marker></defs>'+Object.entries(paths).map(([id,d])=>'<g role="button" tabindex="0" data-sensor="'+id+'" aria-label="Explain '+sensors[id].name+'"><path d="'+d+'" marker-end="url(#sensor-tip)"/><text x="'+positions[id][0]+'" y="'+positions[id][1]+'">'+positions[id][2]+'</text></g>').join('')+'</svg>');
 qs('.sensor-leaders').querySelectorAll('[data-sensor]').forEach(el=>{el.onpointerdown=e=>e.stopPropagation();el.onclick=()=>openSensor(el.dataset.sensor);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openSensor(el.dataset.sensor)}}});
}
`;
fs.writeFileSync(file,s);console.log('Added clickable sensor leader arrows.');
