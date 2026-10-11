const fs=require('node:fs');
fs.writeFileSync(__dirname+'/README.md',String.raw`# ASTRA-PULSE

## 1. What the website does

ASTRA-PULSE is a Space Baguettes astronaut health research prototype for NASA Space Apps 2026. It demonstrates **gather → evaluate → act**: inspect real physiological signals, explore hypothetical changes, record personal context, and understand a practical next step.

The website includes a real-data dashboard, an interactive 30-day scenario sandbox, a personal health journal, machine-learning pattern analysis, an experimental wellbeing check-in index, a rotatable wrist wearable with clickable sensor explanations, and seven dimensions of wellbeing. The interface uses rounded cards, pastel colors, responsive layouts and readable plots.

### Open the website

Double-click this folder’s index.html, or the root index.html shortcut. No installation, build step, account or server is required. All processing is browser-local. Bundled research records work offline; optional Google Fonts have system fallbacks. For a local HTTP preview, run node preview.cjs and open http://127.0.0.1:8765 .

Real measurements are terrestrial clinical recordings, not astronaut data. Generated scenarios are explicitly synthetic. The check-in index is a transparent project demonstration, not a validated measure of overall health or all seven dimensions of wellbeing.

## 2. How to navigate and use it

### Research dashboard

Select one of six original BIDMC research records. Inspect heart rate, respiratory rate, oxygen saturation and pulse. Drag Recording position to reveal the plot up to the chosen second; the dot and vertical line mark that position. Play recording advances both the plot and cards. Missing values stay missing.

Try a scenario opens the sandbox. Track my health opens the personal journal. Explore the sensor concept opens the wrist wearable.

### Try a scenario

1. Choose a familiar preset: steady routine, short nights, demanding week, after a workout, recovery, or loose sensor contact.
2. Adjust sleep hours, heart rate, systolic/diastolic BP, reported stress and sweat context. These are hypothetical inputs, not new real observations.
3. Select the plotted measurement. Drag Viewing day to reveal observations up to that day; the displayed readings, index and next-step explanations use that day. Play days advances the story.
4. Inspect the index breakdown and expand How is this index calculated? to understand its weights and limitations.
5. Select a source record and generation seed, then press Train & generate 30 days. Generate another trace changes the seed. Download scenario CSV exports all values with provenance.

The default 30-day timeline starts with a hypothetical baseline. Selected changes build from day 11 to day 20. Heart-rate fluctuations come from a fitted empirical sampler of actual short research sequences, explicitly recentered to 62 bpm. Sleep, BP, stress and sweat are separate user-selected hypotheses. The simulation does not claim a learned causal relationship between these inputs.

### My health journal

Enter a date and whatever measurements you have. Blank means unknown, not zero. Add notes such as “recorded after exercise” or “busy day.” Blood pressure should come from a validated cuff; stress and sweat are subjective daily context.

Save check-in adds one entry per date; saving an existing date replaces it. Entries remain in session memory unless you select Save this journal in this browser. Optional browser storage persists across refreshes on that browser profile and may be visible to anyone using it. No health entries are uploaded.

Review trends, next steps and the journal table. Export CSV creates a local copy. Individual entries can be deleted. Clear journal removes session/browser entries after an in-page confirmation.

Until there are eight earlier complete entries containing HR, sleep and reported stress, the index uses available context without ML physiology. Once there are enough, the model trains on up to 30 earlier complete entries and scores the newest entry, which is held out from training. BP change requires at least three earlier complete cuff readings for a personal reference. This is not a diagnosis.

### Explore the wearable

Drag the wrist device to rotate it, scroll to zoom, or focus it and use arrow keys. Try Auto-rotate and Reset view. Click flashing sensor markers or the sensor arrow controls. Each opens a dialog explaining collection, processing, estimated outputs and limitations. Escape or the close button dismisses it.

Sensors shown: optical pulse; red/infrared oxygen estimation; skin conductance; motion; skin temperature. The external cuff is a separate manual input. Optical/EDA sensors require skin contact and are shown on the case for educational visibility. The virtual device is a CSS 3D concept, not connected hardware or a validated device design.

### Wellbeing guide

Explore physical, mental/emotional, social, spiritual/religious, intellectual, occupational and environmental wellbeing. Expand cards for small actions. Religious practice is personal and optional. The seven-dimension grouping is an educational project choice, not an official NASA diagnostic framework. A breathing illustration offers a gentle optional pause.

### Science & evidence

Find original-data attribution, the official NASA challenge, model boundaries and scientific sources. This page distinguishes real observations, generated sequences and user-entered context.

### Suggested demonstration

Replay a real recording, switch to a short-sleep or demanding-week scenario, scrub from day 1 to day 20, explain the index and next steps, generate a new trace, demonstrate a journal entry, then open a wrist sensor explanation. Finish with the provenance and limitations.

## 3. Code, datasets, training and evaluation

### Active files

| File | Responsibility |
| --- | --- |
| index.html | Entry point and script loading |
| style.css + experience.css | Pastel styling, responsive layout, charts, wearable and dialogs |
| research-data.js | Six full original research records, bundled for offline use |
| health-engine.js | Isolation Forest, empirical generation and index/action logic |
| experience.js | Navigation, interactive plots, forms, replay, CSV and wearable interactions |
| prepare-data.cjs | Reproducible source download and schema validation |
| verify-v2.cjs | Numerical, source and page-generation checks |
| browser-qa.cjs | Desktop/mobile browser interaction checks |
| preview.cjs | Local-only static preview server |

Older app.js, data.js, ml.js and verify.cjs remain as the prior prototype; index.html no longer loads them. refine-ui.cjs, refine-qa.cjs and finalize-docs.cjs are one-time development helpers, not runtime dependencies.

### Research data and license

BIDMC PPG and Respiration Dataset v1.0.0, records 01–06. Each has 481 original numerical rows at one-second intervals, 0–480 seconds: time, HR, pulse, respiration and SpO₂. Total: 2,886 observations. Values are downloaded without interpolation or changes; NaN is preserved as null. These are clinical monitor numerics from Earth, not healthy astronaut norms or raw ECG/PPG signals.

- Dataset: https://physionet.org/content/bidmc/1.0.0/
- Original CSV pattern: https://physionet.org/files/bidmc/1.0.0/bidmc_csv/bidmc_01_Numerics.csv (replace 01 with 02–06).
- Data license: Open Data Commons Attribution License v1.0, https://opendatacommons.org/licenses/by/1-0/
- Pimentel et al., Towards a Robust Estimation of Respiratory Rate from Pulse Oximeters, IEEE TBME 64(8), 1914–1923. DOI: 10.1109/TBME.2016.2613124.
- PhysioNet attribution: Pollard et al. (2026), PhysioNet as a global platform for biomedical research. DOI: 10.1038/s44360-026-00096-z.

Reproduce the download with node prepare-data.cjs (requires internet). No NASA physiological dataset, real BP, sleep, stress or EDA dataset is ingested in this version. NASA supplies the mission context and challenge brief. Keep that boundary explicit.

### Generative model

HealthEngine.train() fits an empirical block-bootstrap generator to complete HR/respiration/SpO₂ observations in the selected record’s first 240 seconds. The observed multivariate distribution and short consecutive sequences form the fitted reference. Ten-row blocks are sampled deterministically from that reference.

HealthEngine.generate() uses the sampled physiological fluctuations in an explicitly synthetic daily timeline. HR is recentered from the clinical training mean to a hypothetical 62 bpm reference, then shifted toward the selected HR target. Other daily context values follow explicitly defined scenario transitions; they are not invented learned relationships. Missing sensor contact suppresses HR and SpO₂ at selected positions.

This is an empirical generative model, not a neural generator. Its fitting is distinct from the Isolation Forest’s anomaly training. Generating thousands of additional rows would not create more independent participants or scientific evidence. The 30-day timeline is synthetic, not eight minutes of data mislabeled as observed mission days.

### Isolation Forest training

HealthEngine.forest() trains 64 randomized isolation trees. Each selects at most 64 distinct observations and recursively splits a random nonconstant feature within its observed range. Maximum depth is ceil(log2(sample count)). A seeded generator ensures reproducibility. Terminal path lengths are adjusted for leaf size; the score is 2^(-average path length / c(n)), using the expected isolation-path correction c(n).

Scenario features are recentered HR, respiration and SpO₂. Training uses the original first 240 seconds, before scenario injections; the later half remains outside training. Only the selected record is used for a model, not a hidden pooled astronaut dataset.

Personal features are HR, sleep and reported stress from at least eight earlier complete journal entries. The newest chronological entry is excluded from training. The model reports familiarity relative to the reference distribution, not illness, fitness or psychological diagnosis. Missing any feature yields no ML score.

### Experimental wellbeing check-in index

ML pattern similarity contributes 30%; sleep context 30%; reported stress 30%; relative BP change 10%. Missing terms are excluded and available weights renormalized. ML anomaly score is converted to a bounded similarity term; sleep uses distance from an illustrative 7.5-hour reference, stress uses the supplied 0–10 rating, and BP uses deviation from the defined/reference history.

These are explicit design rules and unvalidated weights. No overall-wellbeing labels were available for supervised training. This hybrid index must not be described as a medically learned overall health score. It cannot capture all seven wellbeing dimensions. Sweat affects contextual next steps but is not used to diagnose stress or hydration.

Action suggestions explain rest, supportive conversations, changed patterns, repeat BP measurements and sensor context. A BP input above 180 systolic or 120 diastolic suppresses the aggregate index and prioritizes sourced AHA guidance instead of displaying a potentially reassuring score. This adult terrestrial guidance does not replace actual mission medical protocols.

### Verification

Run node verify-v2.cjs. It checks the six original records, exact observation count, training-window separation, deterministic generation, scenario responses, missing-data scoring, six page renders and replay plot changes.

Run node --check experience.js and node --check health-engine.js for syntax. With preview.cjs running and the bundled Playwright/installed Edge available, browser-qa.cjs exercises replay, health controls, actions, training, persistence, held-out personal ML, all sensor dialogs, keyboard rotation and mobile overflow. Its package path is environment-specific and may need adjustment on another computer.

### Scientific and submission limits

Six short clinical recordings are not a long-term astronaut cohort. Same-record held-out time is not subject-held-out validation. Personal history may itself include health changes. The score, generation, action rules and wearable require domain review, calibration, longer/more diverse datasets and external testing before operational claims.

Official challenge: https://www.spaceappschallenge.org/2026/challenges/create-health-monitoring-software-for-astronauts-on-space-missions/

Sources for context and collection:

- NASA sleep risks: https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules
- NASA human health: https://www.nasa.gov/reference/fundamentals-of-human-health/
- NHLBI cuff measurement: https://www.nhlbi.nih.gov/resources/self-measured-blood-pressure-fact-sheet
- Optical sensing review: https://pmc.ncbi.nlm.nih.gov/articles/PMC9695300/
- EDA review: https://pubmed.ncbi.nlm.nih.gov/36960675/
- AHA high-BP guidance: https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/when-to-call-911-for-high-blood-pressure

Before submitting, confirm current participant and local rules, add named team credits, publish the source repository, provide a demo video and preserve dataset licenses. This prototype is not NASA affiliated and cannot guarantee nomination or awards.
`);
console.log('README rewritten: website purpose → navigation → code, data, training and evaluation.');
