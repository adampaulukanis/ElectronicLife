'use strict';

const assert = require('assert');
const Vector = require('../src/Vector.js');

describe('Vector', function () {
  it('Adding two vectors gives another vector', function () {
    const v1 = new Vector(1, 2);
    const v2 = new Vector(4, 66);
    const v3 = v1.add(v2);
    assert(v1.x === 1);
    assert(v1.y === 2);
    assert(v2.x === 4);
    assert(v2.y === 66);
    assert(v3.x === 5);
    assert(v3.y === 68);
  });
});
