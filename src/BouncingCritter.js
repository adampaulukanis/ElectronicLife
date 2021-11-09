'use strict';

const { randomElement, directionNames } = require('./utils.js');

class BouncingCritter {
  constructor() {
    this.direction = randomElement(directionNames);
  }

  act(view) {
    if (view.look(this.direction) !== ' ') {
      this.direction = view.find(' ') || 's';
    }
    return { type: 'move', direction: this.direction };
  }
}

module.exports = BouncingCritter;
