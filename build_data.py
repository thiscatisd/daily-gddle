"""Usage: python build_data.py [rated.xlsx] [useful.html|useful.json]   (both are auto-detected in this folder)
Writes data/levels.json. Needs pandas + openpyxl. Pointercrate is fetched if online."""
import sys, os, re, json, glob, urllib.request, pandas as pd

xlsx = sys.argv[1] if len(sys.argv) > 1 else next(iter(glob.glob('*.xlsx')), None)
if not xlsx: sys.exit('Put the rated-levels .xlsx in this folder, or pass its path: python build_data.py <file.xlsx>')
useful = sys.argv[2] if len(sys.argv) > 2 else next(iter(glob.glob('useful.*')), None)

df = pd.read_excel(xlsx, sheet_name='Rated')
df = df[df['Level ID'].notna()]
df = df[~df['Reward'].astype(str).str.contains('🌙')]  # classic only
CP = {'✔': 1, '✨': 2, '🔥': 3, '🌸': 4, '💎': 5}

def secs(x):
    if hasattr(x, 'total_seconds'): return int(x.total_seconds())
    if hasattr(x, 'hour'): return x.hour * 3600 + x.minute * 60 + x.second
    return None

# fame signal 1: how many rated lists a level appears in
lists = {}
if useful:
    t = open(useful, encoding='utf8').read()
    if useful.endswith('.json'):
        for l in json.loads(t)['levels']: lists[int(l['id'])] = len(l['lists'])
    else:
        for m in re.finditer(r'gdbrowser\.com/(\d+)">.*?In (\d+) lists', t, re.S):
            lists[int(m[1])] = int(m[2])

# hardest extreme demons: pointercrate top 150 (position by level id)
hard = {}
def add(demons):
    for d in demons:
        if d.get('level_id'): hard[int(d['level_id'])] = d['position']
try:
    for after in (0, 100):  # positions 1-100, then 101-150
        req = urllib.request.Request(f'https://pointercrate.com/api/v2/demons/listed/?limit=100&after={after}',
            headers={'User-Agent': 'Mozilla/5.0 (GDdle data builder)', 'Accept': 'application/json'})
        add(json.load(urllib.request.urlopen(req, timeout=20)))
except Exception as e:
    print('pointercrate fetch failed:', e)
if not hard:  # fallback: save the two API pages from your browser as pointercrate1.json / pointercrate2.json
    import glob
    for f in glob.glob('pointercrate*.json'): add(json.load(open(f, encoding='utf8')))
    print('using local pointercrate*.json:', len(hard), 'ranks' if hard else '(none found, skipping)')

out = []
for r in df.to_dict('records'):
    i = int(r['Level ID'])
    note = str(r.get('Notable Info and Fun Facts') or '')
    fame = lists.get(i, 0) + 4 * ('Weekly' in note) + ('Daily' in note) + 3 * ('Gauntlet' in note) + 3 * ('Award' in note)
    out.append({'id': i, 'n': str(r['Level Name']), 'by': str(r['Creator']), 'd': r['Difficulty'],
                'cp': CP.get(r['Rating'], 1), 'st': int(m[0]) if (m := re.search(r'\d+', str(r['Reward']))) else 0, 's': secs(r['Length']), 'f': fame, 'h': hard.get(i, 0)})

MAIN = ("Stereo Madness:Easy,Back On Track:Normal,Polargeist:Normal,Dry Out:Hard,Base After Base:Hard,"
        "Can't Let Go:Harder,Jumper:Harder,Time Machine:Harder,Cycles:Harder,xStep:Insane,Clutterfunk:Insane,"
        "Theory of Everything:Insane,Electroman Adventures:Insane,Clubstep:Easy Demon,Electrodynamix:Insane,"
        "Hexagon Force:Insane,Blast Processing:Insane,Theory of Everything 2:Easy Demon,"
        "Geometrical Dominator:Insane,Deadlocked:Easy Demon,Fingerdash:Insane,Dash:Insane").split(',')
for k, m in enumerate(MAIN, 1):
    n, d = m.split(':')
    out.append({'id': k, 'n': n, 'by': 'RobTop', 'd': d, 'cp': 0, 'st': 0, 's': None, 'f': 60, 'h': 0, 'main': 1})

os.makedirs('data', exist_ok=True)
json.dump(out, open('data/levels.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'levels;', len(lists), 'with list counts;', len(hard), 'pointercrate ranks')
