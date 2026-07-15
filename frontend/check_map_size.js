import { bgtiles, objmap, animatedsprites } from './src/components/pixi/gentle.js';

console.log('bgtiles structure:');
console.log('  bgtiles.length (layers):', bgtiles.length);
console.log('  bgtiles[0].length (y):', bgtiles[0].length);
console.log('  bgtiles[0][0].length (x):', bgtiles[0][0].length);

console.log('\nobjmap structure:');
console.log('  objmap.length (layers):', objmap.length);
console.log('  objmap[0].length (y):', objmap[0].length);
console.log('  objmap[0][0].length (x):', objmap[0][0].length);

console.log('\nanimatedsprites:');
const xs = animatedsprites.map(s => s.x);
const ys = animatedsprites.map(s => s.y);
console.log('  x range:', Math.min(...xs), '-', Math.max(...xs));
console.log('  y range:', Math.min(...ys), '-', Math.max(...ys));

console.log('\nCalculated world size:');
console.log('  worldWidth:', bgtiles[0][0].length * 32);
console.log('  worldHeight:', bgtiles[0].length * 32);