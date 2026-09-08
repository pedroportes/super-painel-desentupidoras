import urllib.request
import urllib.parse
import json

query = """[out:json][timeout:25];
area["name"="Patos de Minas"]["admin_level"="8"]->.a;
(
  node["place"~"suburb|neighbourhood"](area.a);
  way["place"~"suburb|neighbourhood"](area.a);
  relation["place"~"suburb|neighbourhood"](area.a);
);
out tags;"""

url = "https://overpass-api.de/api/interpreter"
data = urllib.parse.urlencode({'data': query}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        names = sorted(list(set([el.get('tags', {}).get('name') for el in res['elements'] if el.get('tags', {}).get('name')])))
        print(f"Total: {len(names)}")
        for n in names:
            print(f'"{n}",')
except Exception as e:
    print('Erro:', e)
