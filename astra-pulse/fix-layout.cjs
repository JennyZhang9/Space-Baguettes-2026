const fs=require('node:fs');
const file=__dirname+'/experience.js';
const source=fs.readFileSync(file,'utf8');
const badge='<span class="badge">Local · no uploads</span>';
if(!source.includes(badge))throw Error('Expected header badge not found');
fs.writeFileSync(file,source.replace(badge,''));
console.log('Removed the ambiguous header badge.');
