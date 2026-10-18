"""One-time palette migration; keep skin tones and semantic warning colors intact."""
import colorsys, pathlib, re
root = pathlib.Path(__file__).resolve().parent
for name in ['style.css', 'experience.css', 'cuff-model.css', 'experience.js', 'sleep-model.js', 'cuff-model.js']:
    path = root / name
    def tint(match):
        value = match[0][1:]
        rgb = tuple(int(value[i:i+2],16)/255 for i in (0,2,4))
        h,l,s = colorsys.rgb_to_hls(*rgb)
        if 65 <= h*360 <= 185 and s > .035:
            hue = (230 if h*360 > 145 else 252)/360
            r,g,b = colorsys.hls_to_rgb(hue,l,min(.5,max(.16,s)))
            return '#'+''.join(f'{round(v*255):02x}' for v in (r,g,b))+value[6:]
        return match[0]
    text = re.sub(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b',tint,path.read_text(encoding='utf-8'))
    if name in ['experience.js','sleep-model.js']:
        for old,new in {'#f4ece3':'#e8edfc','#f1eddf':'#eeebfa','#f2e7eb':'#efe9fa','#b69173':'#778dc4'}.items():
            text=text.replace(old,new)
    path.write_text(text,encoding='utf-8')
entry=root/'index.html'
entry.write_text(re.sub(r'\?v=[^" ]+', '?v=20261018-cosmic2',entry.read_text(encoding='utf-8')),encoding='utf-8')
