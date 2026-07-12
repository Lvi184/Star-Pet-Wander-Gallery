import json

with open('src/game/assets/maps/town_map.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('=== Tilesets ===')
for ts in data.get('tilesets', []):
    print(f"  - {ts['name']} (firstgid: {ts['firstgid']}, tilecount: {ts.get('tilecount', 'N/A')})")

print('\n=== Layers ===')
for l in data.get('layers', []):
    print(f"  - {l['name']} (type: {l['type']})")
