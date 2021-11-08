'use strict';

const assert = require('assert');
const Wall = require('../src/Wall.js');

describe('Wall', function () {
  it('It does nothing', function () {
    assert(new Wall());
  });
});
