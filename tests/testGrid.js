'use strict';

const assert = require('assert');
const Grid = require('../src/Grid.js');
const Vector = require('../src/Vector.js');

describe('Grid', function () {
  let v1, v2, grid;
  const VALUE = 'test value';
  before(function () {
    // runs once before the first test in this block
    v1 = new Vector(1, 1);
    v2 = new Vector(10, 10);
    grid = new Grid(3, 3);
  });

  it('isInside(Vector) works', function () {
    assert(grid.isInside(v1));
    assert(grid.isInside(v2) === false);
  });

  it('set(Vector, value) works', function () {
    assert(grid.set(v1, 'test value') === undefined);
    assert(grid.space[v1.x + grid.width * v1.y] === VALUE);
  });

  it('get(Vector) returns the correct value', function () {
    assert(grid.get(v1) === VALUE);
    assert(grid.get(v2) === undefined);
  });

  it('forEach');
});
