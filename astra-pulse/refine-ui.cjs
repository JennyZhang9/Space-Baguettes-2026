const fs=require('node:fs');const filename=__dirname+'/experience.js';let text=fs.readFileSync(filename,'utf8');
const changes=[
 ['${a.text}</p></div></div>','${a.text}${a.link?` <a href="${a.link}" target="_blank" rel="noopener">AHA guidance ↗</a>`:\'\'}</p></div></div>'],
 ['if(r.saved)localStorage.setItem(\'astra-journal-v2\',JSON.stringify(journal.map(v=>({...v,saved:true}))));','if(r.saved){journal=journal.map(v=>({...v,saved:true}));localStorage.setItem(\'astra-journal-v2\',JSON.stringify(journal));}'],
 ['if(!Number.isInteger(value)||value<1||value>999999)','if(!Number.isInteger(value)||value<1||value>999999)']
];
for(const [old,value]of changes){if(!text.includes(old))throw Error('Expected UI text missing: '+old);text=text.replace(old,value)}
fs.writeFileSync(filename,text);console.log('Updated source links and browser-storage consistency.');
