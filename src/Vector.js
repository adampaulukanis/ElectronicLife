'use strict';

/**
 * Simple class representing a point in two-dimensional space by means
 * of two coordinates.
 */
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Adds two vectors and returns the sum of them.
   */
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
}

module.exports = Vector;
