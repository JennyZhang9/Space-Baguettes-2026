const fs=require('node:fs'),file=__dirname+'/experience.js';let s=fs.readFileSync(file,'utf8');
const replace=(old,value)=>{if(!s.includes(old))throw Error('Expected source not found: '+old);s=s.replace(old,value)};
replace("${pages.find(p=>p[0]===currentPage)[2]}</span></header>","${pages.find(p=>p[0]===currentPage)[2]}</span><div class=\"team-mascot\" title=\"Space Baguettes · exploration with a human touch\"><span>Space Baguettes</span><img src=\"baguette-astronaut.svg\" alt=\"Baguette astronaut mascot\" width=\"48\" height=\"48\"></div></header>");
replace('</div></div></div><div class="sensor-arrows">','</div><button class="external-cuff-model" data-sensor="cuff" aria-label="Explore the external blood-pressure cuff"><span class="cuff-arm"></span><span class="cuff-wrap"></span><span class="cuff-display"><small>CUFF</small><strong>120/80</strong><small>mmHg</small></span><span class="cuff-port"></span></button></div></div><div class="sensor-arrows">');
replace("temp:'M-55 -47 H-17 L24 -8'","temp:'M-55 -47 H-17 L24 -8',cuff:'M265 177 H245 L217 128'");
replace("temp:[-68,-60,'Temperature']","temp:[-68,-60,'Temperature'],cuff:[177,193,'External cuff']");
fs.writeFileSync(file,s);console.log('Added baguette mascot and a separate cuff with a clickable diagram arrow.');
