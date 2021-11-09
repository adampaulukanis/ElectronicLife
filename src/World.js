'use strict';

const Grid = require('./Grid.js');
const Vector = require('./Vector.js');
const View = require('./View.js');
const { charFromElement, elementFromChar, directions } = require('./utils.js');

class World {
  constructor(map, legend) {
    /*
     * Sprawdzaj czy na mapie nie ma non-BMP znaków
     *
     * BUG: taki znak musi być ostatnią ,,literką'', inaczej wywala program. Czemu?
     * SOLUTION: Nie używaj fixedCharAt(): zwraca '' jeśli index jest niewłaściwy
     */
    let grid = new Grid(map[0].length, map.length);
    this.grid = grid;
    this.legend = legend;

    map.forEach((line, y) => {
      /*
       * I have learnt the hard way that if I use for instance multi-byte characters (like this 🌱) than
       * iterating over such string does not work.
       * e.g.: '🌱🌱🌱🌱'[2] gives garbage.
       *
       * More examples: https://flaviocopes.com/javascript-unicode/ bottom of the page
       */
      [...line].forEach((x, index) => {
        grid.set(new Vector(index, y), elementFromChar(legend, x));
      });

      /*
    for (let x = 0, chr; x < line.length; x++) {
       // Oto zagadka: co zrobić jeśli znajdziesz tutaj z angielskiego: non-BMP characters?
      if (((chr = require('./getWholeChar.js')(line, x)) === false)) {
        continue
      }
      // grid.set(new Vector(x, y), elementFromChar(legend, require('./getWholeChar.js')(line, x)))
      grid.set(new Vector(x, y), elementFromChar(legend, chr))
    }
    */
    });
  }

  toString() {
    let output = '';
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        let element = this.grid.get(new Vector(x, y));
        output += charFromElement(element);
      }
      output += '\n';
    }
    return output;
  }

  turn() {
    let acted = [];
    this.grid.forEach(function (critter, vector) {
      if (critter.act && acted.indexOf(critter) === -1) {
        acted.push(critter);
        this.letAct(critter, vector);
      }
    }, this);
  }

  letAct(critter, vector) {
    let action = critter.act(new View(this, vector));
    if (action && action.type === 'move') {
      let dest = this.checkDestination(action, vector);
      if (dest && this.grid.get(dest) == null) {
        this.grid.set(vector, null);
        this.grid.set(dest, critter);
      }
    }
  }

  checkDestination(action, vector) {
    //if (directions.hasOwnProperty(action.direction)) {
    if (Object.prototype.hasOwnProperty.call(directions, action.direction)) {
      let dest = vector.add(directions[action.direction]);
      if (this.grid.isInside(dest)) {
        return dest;
      }
    }
  }
}

module.exports = World;
