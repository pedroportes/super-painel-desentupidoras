import urllib.request
import urllib.parse
import json

url = "https://overpass-api.de/api/interpreter?data=" + urllib.parse.quote("""
[out:json][timeout:25];
area["name"="Uruguaiana"]["admin_level"="8"]->.a;
(
  node(area.a)["place"~"suburb|neighbourhood|quarter"];
  way(area.a)["place"~"suburb|neighbourhood|quarter"];
  relation(area.a)["place"~"suburb|neighbourhood|quarter"];
);
out tags;
""")

req = urllib.request.Request(url, headers={'User-Agent': 'AntigravityBot/1.0 (contact@desentupidoras.com)'})
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        names = sorted(list(set([el.get('tags', {}).get('name') for el in res['elements'] if el.get('tags', {}).get('name')])))
        print(f"Total: {len(names)}")
        for n in names:
            print(f'"{n}",')
except Exception as e:
    print('Erro:', e)
