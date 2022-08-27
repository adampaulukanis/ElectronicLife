'use strict';

const { dirPlus } = require('./utils.js');

module.exports = class WallFollower {
  constructor() {
    this.direction = 's';
  }

  act(view) {
    let start = this.direction;
    if (view.look(dirPlus(this.direction, -3)) != ' ') {
      start = this.direction = dirPlus(this.direction, -2);
    }
    while (view.look(this.direction) != ' ') {
      this.direction = dirPlus(this.direction, 1);
      if (this.direction == start) break;
    }

    return { type: 'move', direction: this.direction };
  }
};
