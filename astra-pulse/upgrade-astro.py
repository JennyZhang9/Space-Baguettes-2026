from pathlib import Path
p=Path(__file__).parent
f=p/'experience.js'
s=f.read_text(encoding='utf-8')
changes={
"Research dashboard":"Home", "Try a scenario":"What if?", "My health journal":"My journal", "Explore the wearable":"Devices & goals", "Sleep & lifestyle data":"Sleep data", "Science & evidence":"Data & science",
"ASTRA-PULSE":"Astro Sensor", "ASTRA<span style=\"color:#726a93\">PULSE</span>":"Astro<span>Sensor</span>",
"Real signals. Clearer context.":"Understand your daily health.",
"What would your day look like?":"Explore a different day.",
"Your wellbeing is more<br>than a sensor reading.":"Care for your whole self.",
"Our seven-dimension framework makes space for the parts of life that a wearable and a numerical index cannot measure.":"The seven dimensions of emotional wellbeing are a whole person experience that extends beyond a single metric or numerical index.",
"The journal combines your context with your own measured history.":"This journal uses your logged data to find correlation and predict the trends between your daily lifestyle and body’s physical responses.",
"Protect rest and discuss your exercise schedule with your support team.":"Take a small break from every now and then and hydrate regularly.",
"Make time for a supportive conversation.":"Make time for a supportive conversation or share a small win.",
"Check your rest space for avoidable interruptions.":"Declutter a single space to reduce daily stress.",
"Try a small action":"Explore small steps",
"type=\"number\" min=\"${min}\" max=\"${max}\" step=\"${step}\" placeholder=\"Optional\"":"type=\"text\" inputmode=\"decimal\" placeholder=\"Optional: 70 or 65-75\"",
"${label} (${unit})":"${label} (${unit.includes('10')?'_/10':unit})",
"r[id]=v===''?null:Number(v)":"const parsed=parseMeasurement(v,inputsSpec.find(s=>s[0]===id));if(parsed.error){qs('#form-status').textContent=parsed.error;return}r[id]=parsed.value;if(parsed.range){r.ranges=r.ranges||{};r.ranges[id]=parsed.range}",
"<small>${help}</small>":"<input aria-label=\"Type ${label}\" data-health-number=\"${id}\" type=\"number\" min=\"${min}\" max=\"${max}\" step=\"${step}\" value=\"${simInputs[id]}\"><small>${help}</small>",
"This site does not connect to a physical device.":"Compatible Bluetooth heart-rate devices can connect on the Devices & goals page. The illustrated hardware remains a concept.",
"<td>${escapeHTML(r.notes)}</td>":"<td>${escapeHTML(r.notes)}${r.ranges?'<br><small>Estimated ranges: '+escapeHTML(Object.entries(r.ranges).map(([k,v])=>k+': '+v.join('–')).join(', '))+'</small>':''}</td>"
}
for a,b in changes.items():
    if a not in s: print('Missing',a)
    s=s.replace(a,b)
f.write_text(s,encoding='utf-8')
f=p/'index.html';s=f.read_text(encoding='utf-8').replace('ASTRA-PULSE','Astro Sensor')
import re
s=re.sub(r'\?v=[^" ]+', '?v=20261025-astro1',s)
s=s.replace('</head>','<link rel="stylesheet" href="astro.css?v=20261025-astro1"></head>').replace('</body>','<script src="astro.js?v=20261025-astro1"></script></body>')
f.write_text(s,encoding='utf-8')
