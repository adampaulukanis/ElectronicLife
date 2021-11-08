'use strict';

const assert = require('assert');
const World = require('../src/World.js');

describe('World', function () {
  it('toString()', function () {
    const world = new World(['xyz', '   ', 'zyx'], {
      ' ': null,
      x: function () {},
      y: function () {},
      z: function () {},
    });
    const string_world = world.toString();
    assert(typeof string_world === 'string');
    assert(string_world.length === 12); // \n counts as one character
  });

  it('turn()');

  it('letAct(critter, vector)');

  it('checkDestination(action, vector)');
});
