import json
import sys

def convert_infinite_map(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        map_data = json.load(f)
    
    print(f"Original map: infinite={map_data.get('infinite')}, height={map_data.get('height')}")
    
    if not map_data.get('infinite'):
        print("Map is not infinite, no conversion needed")
        return
    
    tilewidth = map_data['tilewidth']
    tileheight = map_data['tileheight']
    
    min_x = float('inf')
    max_x = -float('inf')
    min_y = float('inf')
    max_y = -float('inf')
    
    for layer in map_data['layers']:
        if layer['type'] == 'tilelayer' and 'chunks' in layer:
            for chunk in layer['chunks']:
                chunk_x = chunk['x'] / tilewidth
                chunk_y = chunk['y'] / tileheight
                min_x = min(min_x, chunk_x)
                max_x = max(max_x, chunk_x + chunk['width'])
                min_y = min(min_y, chunk_y)
                max_y = max(max_y, chunk_y + chunk['height'])
    
    actual_width = int(max_x - min_x)
    actual_height = int(max_y - min_y)
    
    print(f"Calculated bounds: min_x={min_x}, max_x={max_x}, min_y={min_y}, max_y={max_y}")
    print(f"Actual dimensions: {actual_width} x {actual_height} tiles")
    
    map_data['width'] = actual_width
    map_data['height'] = actual_height
    map_data['infinite'] = False
    
    for layer in map_data['layers']:
        if layer['type'] == 'tilelayer' and 'chunks' in layer:
            chunk_width = layer['chunks'][0]['width']
            chunk_height = layer['chunks'][0]['height']
            
            data = [0] * (actual_width * actual_height)
            
            for chunk in layer['chunks']:
                chunk_x = chunk['x'] / tilewidth
                chunk_y = chunk['y'] / tileheight
                
                for i, tile in enumerate(chunk['data']):
                    local_x = i % chunk_width
                    local_y = i // chunk_width
                    global_x = chunk_x + local_x
                    global_y = chunk_y + local_y
                    data_x = int(global_x - min_x)
                    data_y = int(global_y - min_y)
                    
                    if 0 <= data_x < actual_width and 0 <= data_y < actual_height:
                        data[data_y * actual_width + data_x] = tile
            
            layer['data'] = data
            layer['width'] = actual_width
            layer['height'] = actual_height
            layer.pop('chunks', None)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(map_data, f, indent=2)
    
    print(f"Converted map saved to: {output_path}")
    print(f"Tilesets: {[ts['name'] for ts in map_data.get('tilesets', [])]}")
    print(f"Layers: {[l['name'] for l in map_data.get('layers', [])]}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python convert_infinite_map.py <input_json> <output_json>")
        sys.exit(1)
    
    convert_infinite_map(sys.argv[1], sys.argv[2])
