"""Download the user's Kaggle dataset directly and bundle it for offline use."""
import csv, hashlib, io, json, pathlib, urllib.request, zipfile
root = pathlib.Path(__file__).resolve().parent
slug = 'uom190346a/sleep-health-and-lifestyle-dataset'
def get(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'ASTRA-PULSE data preparation'})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()
metadata = json.loads(get('https://www.kaggle.com/api/v1/datasets/list?search=' + slug.split('/')[-1]))
matching = [d for d in metadata if d.get('ref') == slug]
if not matching:
    raise RuntimeError('Original dataset metadata not found')
meta = matching[0]
details = json.loads(get('https://www.kaggle.com/api/v1/datasets/view/' + slug))
meta['description'] = details.get('description', '')
meta['authorDeclaredSynthetic'] = True
raw = get('https://www.kaggle.com/api/v1/datasets/download/' + slug)
with zipfile.ZipFile(io.BytesIO(raw)) as archive:
    candidates = [n for n in archive.namelist() if n.lower().endswith('.csv')]
    if len(candidates) != 1:
        raise RuntimeError('Expected one CSV')
    csv_bytes = archive.read(candidates[0])
text = csv_bytes.decode('utf-8-sig')
reader = csv.DictReader(io.StringIO(text))
required = ['Person ID', 'Sleep Duration', 'Quality of Sleep', 'Stress Level', 'Heart Rate', 'Blood Pressure']
if not all(key in reader.fieldnames for key in required):
    raise RuntimeError('Unexpected CSV schema')
rows = list(reader)
for row in rows:
    for key in ['Person ID', 'Age', 'Sleep Duration', 'Quality of Sleep', 'Physical Activity Level', 'Stress Level', 'Heart Rate', 'Daily Steps']:
        row[key] = float(row[key]) if '.' in row[key] else int(row[key])
    sys, dia = row['Blood Pressure'].split('/')
    row['Systolic BP'], row['Diastolic BP'] = int(sys), int(dia)
bundle = {'source': 'https://www.kaggle.com/datasets/' + slug, 'creator': meta.get('ownerName'), 'license': meta.get('licenseName'), 'description': meta.get('description'), 'sha256': hashlib.sha256(csv_bytes).hexdigest(), 'rows': rows}
(root / 'sleep-health.csv').write_bytes(csv_bytes)
(root / 'sleep-data.js').write_text('// Original Kaggle dataset, plus parsed BP columns.\nwindow.SLEEP_DATA=' + json.dumps(bundle, separators=(',', ':')) + ';\n', encoding='utf-8')
(root / 'sleep-provenance.json').write_text(json.dumps(meta, indent=2), encoding='utf-8')
print(json.dumps({'rows': len(rows), 'creator': bundle['creator'], 'license': bundle['license'], 'description': bundle['description'], 'sha256': bundle['sha256']}, indent=2))
