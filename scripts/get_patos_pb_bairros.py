import urllib.request
import json
import re

# Wikipedia API for Patos (Paraíba)
url = "https://pt.wikipedia.org/w/api.php?action=parse&page=Patos&prop=wikitext&format=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        wikitext = data.get('parse', {}).get('wikitext', {}).get('*', '')
        # search for bairros or subdivisions
        print("Length:", len(wikitext))
        for line in wikitext.split('\n'):
            if 'bairro' in line.lower() or 'centro' in line.lower() or 'zona' in line.lower() or 'distrito' in line.lower():
                print(line[:120])
except Exception as e:
    print('Error:', e)
