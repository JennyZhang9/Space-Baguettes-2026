const fs=require('node:fs'),file=__dirname+'/browser-qa.cjs';let s=fs.readFileSync(file,'utf8');
for(const [name,id]of [['⌁Try a scenario','lab'],['♡My health journal','tracker'],['◎Explore the wearable','wearable'],['❀Wellbeing guide','wellbeing'],['◈Science & evidence','science']])s=s.replaceAll(`page.getByRole('button',{name:'${name}',exact:true})`,`page.locator('.sidebar [data-page="${id}"]')`);
s=s.replace("await page.reload();assert.equal(await page.locator('tbody tr').count(),0);", "await page.reload();await page.locator('.sidebar [data-page=\"tracker\"]').click();assert.equal(await page.locator('tbody tr').count(),0);");
s=s.replace("const assert=require('node:assert/strict');","const assert=require('node:assert/strict');let qaBrowser;");
s=s.replace("const browser=await chromium.launch({headless:true,channel:'msedge'});","const browser=await chromium.launch({headless:true,channel:'msedge'});qaBrowser=browser;");
s=s.replace("})().catch(e=>{console.error(e);process.exitCode=1});", "})().catch(async e=>{console.error(e);if(qaBrowser)await qaBrowser.close();process.exitCode=1});");
fs.writeFileSync(file,s);
