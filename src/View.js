'use strict';

const { charFromElement, directions, randomElement } = require('./utils.js');

class View {
  constructor(world, vector) {
    this.world = world;
    this.vector = vector;
  }

  look(dir) {
    /**
     *The look method figures out the coordinates that we are trying to look at and,
     *if they are inside the grid, finds the character corresponding to the element
     *that sits there.
     *For coordinates outside the grid, look simply pretends that there is a wall,
     *so that if you define a world that isn’t walled in, the critters still won’t be
     *tempted to try to walk off the edges.
     */
    let target = this.vector.add(directions[dir]);
    if (this.world.grid.isInside(target)) {
      return charFromElement(this.world.grid.get(target));
    } else {
      return '#';
    }
  }

  findAll(ch) {
    let found = [];
    for (let dir in directions) {
      if (this.look(dir) === ch) {
        found.push(dir);
      }
    }
    return found;
  }

  find(ch) {
    let found = this.findAll(ch);
    if (found.length === 0) {
      return null;
    }
    return randomElement(found);
  }
}

module.exports = View;
