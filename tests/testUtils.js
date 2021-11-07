'use strict';

const assert = require('assert');
const {
  charFromElement,
  elementFromChar,
  directions,
  directionNames,
  randomElement,
} = require('../src/utils.js');

describe('utils', function () {
  describe('charFromElement(element)', function () {
    it('If element is null, than return ` `', function () {
      assert(charFromElement(null) === ' ');
    });

    it('Else return originChar', function () {
      assert(charFromElement({ originChar: 'hello' }) === 'hello');
    });
  });

  describe('elementFromChar(legend, ch)', function () {
    it('If ch is ` `, than return null', function () {
      assert(elementFromChar({}, ' ') === null);
    });

    it('Returns element = new legend[ch]()', function () {
      const me = function () {};
      const legend = { me: me };
      assert(elementFromChar(legend, 'me').originChar === 'me');
    });
  });

  describe('directions', function () {
    it('Defines eight cardinal directions', function () {
      assert(Object.keys(directions).length === 8);
    });

    it('directionNames are OK', function () {
      assert(directionNames.join('') === 'nneesesswwnw');
    });
  });

  describe('randomElement(array)', function () {
    it('Returns random element from provided array', function () {
      assert(randomElement([1]) === 1);
      const rand = randomElement([1, 2, 3]);
      assert(rand >= 1 || rand <= 3);
    });
  });
});
