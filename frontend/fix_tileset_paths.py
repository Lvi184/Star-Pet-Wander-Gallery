import json
import os

input_path = 'public/assets/game/maps/town_map_converted.json'
output_path = 'public/assets/game/maps/town_map_fixed.json'

with open(input_path, 'r', encoding='utf-8') as f:
    map_data = json.load(f)

for tileset in map_data['tilesets']:
    if 'image' in tileset:
        image_path = tileset['image']
        if image_path.startswith('../../../../town/'):
            tileset['image'] = '/assets/game/town/Modern_Exteriors_Complete_Tileset.png'
        elif image_path.startswith('tilesets/'):
            tileset['image'] = '/assets/game/town/tilesets/' + os.path.basename(image_path)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(map_data, f, indent=2)

print('Fixed tileset paths in town_map_fixed.json')