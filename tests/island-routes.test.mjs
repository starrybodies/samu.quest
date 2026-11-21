import assert from 'node:assert/strict';
import test from 'node:test';
import { locations, doorway, walkingRoute, walkable } from '../world/island-ground.js';

test('a visitor can walk from the dock or any landmark to every other entrance', () => {
  const starts = [{ id: 'dock', x: -1.6, z: 7.7 }, ...locations.map(place => ({
    id: place.id, ...doorway(place)
  }))];
  for (const from of starts) {
    for (const destination of locations) {
      const entrance = doorway(destination);
      const path = walkingRoute(from, entrance);
      assert.ok(path.length, from.id + ' to ' + destination.id);
      assert.deepEqual(path.at(-1), entrance);
      let current = from;
      for (const next of path) {
        const length = Math.hypot(next.x - current.x, next.z - current.z);
        const samples = Math.max(1, Math.ceil(length / .035));
        for (let i = 0; i <= samples; i++) {
          const x = current.x + (next.x - current.x) * i / samples;
          const z = current.z + (next.z - current.z) * i / samples;
          assert.ok(walkable(x, z), from.id + ' crosses an obstacle on the way to ' + destination.id);
        }
        current = next;
      }
    }
  }
});
