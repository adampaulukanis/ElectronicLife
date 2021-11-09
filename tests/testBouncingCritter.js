'use strict';

const assert = require('assert');
const BouncingCritter = require('../src/BouncingCritter.js');

describe('BouncingCritter', function () {
  it('New critter has a random direction', function () {
    /* Idea is that if there is a number of critters each should not have the
     * same direction */
    let o1, o2;
    o1 = new BouncingCritter();
    do {
      o2 = new BouncingCritter();
    } while (o2.direction === o1.direction);
    assert(o1.direction !== o2.direction);
  });

  it('A critter moves', function () {
    let o = new BouncingCritter();
    // Mock the View object
    assert(o.act({ look: () => ' ' }).type === 'move');
    assert(o.act({ look: () => 'x', find: () => null }).direction === 's');
  });
});
