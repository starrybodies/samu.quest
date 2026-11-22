import assert from 'node:assert/strict';
import test from 'node:test';
import { locations, doorway, walkingRoute, walkable } from '../world/island-ground.js';

import { landing, tideStars } from '../world/island-quest.js';

test('all landmark entrances and tide stars can be reached on foot from each other and the dock', () => {
  const destinations = [...tideStars, ...locations.map(place => ({
    id: place.id, ...doorway(place)
  }))];
  for (const from of [{ id: 'dock', ...landing }, ...destinations]) {
    for (const destination of destinations) {
      const entrance = { x: destination.x, z: destination.z };
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
