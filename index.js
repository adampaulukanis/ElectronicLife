'use strict';

const plan = [
  '############################',
  '#           #####          #',
  '##          # o #    ##    #',
  '###            ##     #    #',
  '#            ###      #    #',
  '#    ####                  #',
  '#    ##    ~     ~      ~  #',
  '#     #                #####',
  '#     #                    #',
  '############################',
];

/**
 * Simple class representing a point in two-dimensional space by means
 * of two coordinates.
 * TODO: I have a class for this: https://github.com/adam17/Vector
 */
function Vector(x, y) {
  this.x = x;
  this.y = y;
}

/**
 * Adds two vectors and returns the sum of them.
 */
Vector.prototype.plus = function (other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

/**
 * To store a grid of values we can use a single array,
 * with size width × height, and decide that the element at (x,y)
 * is found at position x + (y × width) in the array.
 */
function Grid(width, height) {
  this.space = new Array(width * height);
  this.width = width;
  this.height = height;
}
Grid.prototype.isInside = function (vector) {
  return (
    vector.x >= 0 &&
    vector.x < this.width &&
    vector.y >= 0 &&
    vector.y < this.height
  );
};
Grid.prototype.get = function (vector) {
  return this.space[vector.x + this.width * vector.y];
};
Grid.prototype.set = function (vector, value) {
  this.space[vector.x + this.width * vector.y] = value;
};
Grid.prototype.forEach = function (f, context) {
  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      let value = this.space[x + y * this.width];
      if (value != null) {
        f.call(context, value, new Vector(x, y));
      }
    }
  }
};

const directions = {
  n: new Vector(0, -1),
  ne: new Vector(1, -1),
  e: new Vector(1, 0),
  se: new Vector(1, 1),
  s: new Vector(0, 1),
  sw: new Vector(-1, 1),
  w: new Vector(-1, 0),
  nw: new Vector(-1, -1),
};

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// const directionNames = 'n ne e se s sw w nw'.split(' ')
const directionNames = Object.keys(directions);

function BouncingCritter() {
  this.direction = randomElement(directionNames);
}
BouncingCritter.prototype.act = function (view) {
  if (view.look(this.direction) !== ' ') {
    this.direction = view.find(' ') || 's';
  }
  return { type: 'move', direction: this.direction };
};

// World
function elementFromChar(legend, ch) {
  if (ch === ' ') {
    return null;
  }
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt#Getting_whole_characters
  let element = new legend[ch]();
  element.originChar = ch;
  return element;
}

function World(map, legend) {
  /*
   * Sprawdzaj czy na mapie nie ma non-BMP znaków
   *
   * BUG: taki znak musi być ostatnią ,,literką'', inaczej wywala program. Czemu?
   * SOLUTION: Nie używaj fixedCharAt(): zwraca '' jeśli index jest niewłaściwy
   */
  let grid = new Grid(map[0].length, map.length);
  this.grid = grid;
  this.legend = legend;

  map.forEach(function (line, y) {
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

function charFromElement(element) {
  if (element == null) {
    return ' ';
  } else {
    return element.originChar;
  }
}

World.prototype.toString = function () {
  let output = '';
  for (let y = 0; y < this.grid.height; y++) {
    for (let x = 0; x < this.grid.width; x++) {
      let element = this.grid.get(new Vector(x, y));
      output += charFromElement(element);
    }
    output += '\n';
  }
  return output;
};

World.prototype.turn = function () {
  let acted = [];
  this.grid.forEach(function (critter, vector) {
    if (critter.act && acted.indexOf(critter) === -1) {
      acted.push(critter);
      this.letAct(critter, vector);
    }
  }, this);
};

World.prototype.letAct = function (critter, vector) {
  let action = critter.act(new View(this, vector));
  if (action && action.type === 'move') {
    let dest = this.checkDestination(action, vector);
    if (dest && this.grid.get(dest) == null) {
      this.grid.set(vector, null);
      this.grid.set(dest, critter);
    }
  }
};

World.prototype.checkDestination = function (action, vector) {
  //if (directions.hasOwnProperty(action.direction)) {
  if (Object.prototype.hasOwnProperty.call(directions, action.direction)) {
    let dest = vector.plus(directions[action.direction]);
    if (this.grid.isInside(dest)) {
      return dest;
    }
  }
};

function Wall() {}

function View(world, vector) {
  this.world = world;
  this.vector = vector;
}

/**
 *The look method figures out the coordinates that we are trying to look at and,
 *if they are inside the grid, finds the character corresponding to the element
 *that sits there.
 *For coordinates outside the grid, look simply pretends that there is a wall,
 *so that if you define a world that isn’t walled in, the critters still won’t be
 *tempted to try to walk off the edges.
 */
View.prototype.look = function (dir) {
  let target = this.vector.plus(directions[dir]);
  if (this.world.grid.isInside(target)) {
    return charFromElement(this.world.grid.get(target));
  } else {
    return '#';
  }
};

View.prototype.findAll = function (ch) {
  let found = [];
  for (let dir in directions) {
    if (this.look(dir) === ch) {
      found.push(dir);
    }
  }
  return found;
};

View.prototype.find = function (ch) {
  let found = this.findAll(ch);
  if (found.length === 0) {
    return null;
  }
  return randomElement(found);
};

/**
 * Since directions are modeled by a set of strings, we need to define our own operation (dirPlus)
 * to calculate relative directions. So dirPlus("n", 1) means one 45-degree turn clockwise from north,
 * giving "ne". Similarly, dirPlus("s", -2) means 90 degrees counterclockwise from south, which is east.
 */
function dirPlus(dir, n) {
  const index = directionNames.indexOf(dir);
  return directionNames[(index + n + 8) % 8];
}

/**
 * There is a critter that moves along walls.
 * Conceptually, the critter keeps its left hand to the wall and follows along.
 */
function WallFollower() {
  this.dir = 's';
}

/**
 * This method only has to 'scan' the critter's surroundings, starting from its left side and going
 * clockwise until it finds an empty square. It then moves in the direction of that empty square.
 *
 * What complicates things is that a critter may end up in the middle of empty space,
 * either as its start position or as a result of walking around another critter.
 * To prevent the critter to keep on turning left at every step there is an extra check (the *if* statement)
 * to start scanning to the left only if it looks like the critter has just passed some kind of obstacle ---
 * that is, if the space behind and to the left of the critter is not empty. Otherwise, the critter starts
 * scanning directly ahead, so that it will walk straight when in empty space.
 *
 * And finally, there's a test comparing *this.dir* to *start* after every pass through the loop to make
 * sure that the loop won't run forever when the critter is walled in or crowded in by other critters and
 * can't find an empty square.
 */
WallFollower.prototype.act = function (view) {
  let start = this.dir;
  if (view.look(dirPlus(this.dir, -3)) !== ' ') {
    start = this.dir = dirPlus(this.dir, -2);
  }
  while (view.look(this.dir) !== ' ') {
    this.dir = dirPlus(this.dir, 1);
    if (this.dir === start) {
      break;
    }
  }
  return { type: 'move', direction: this.dir };
};

/**
 * To make life in our world more interesting, we will add the concepts of food and reproduction.
 * Each living thing in the world gets a new property, energy, which is reduced by performing actions and increased by
 * eating things. When the critter has enough energy, it can reproduce, generating a new critter of the same kind.
 * To keep things simple, the critters in our world reproduce asexually, all by themselves.
 */
function LifelikeWorld(map, legend) {
  World.call(this, map, legend);
}
LifelikeWorld.prototype = Object.create(World.prototype);

const actionTypes = Object.create(null);

/**
 * We’ll need a world with a different letAct method. We could just replace the method of the World prototype, but
 * I’ve become very attached to our simulation with the wall-following critters and would hate to break that old world.
 *
 * One solution is to use inheritance. We create a new constructor, LifelikeWorld, whose prototype is based on
 * the World prototype but which overrides the letAct method. The new letAct method delegates the work of actually
 * performing an action to various functions stored in the actionTypes object.
 */
LifelikeWorld.prototype.letAct = function (critter, vector) {
  const action = critter.act(new View(this, vector));
  const handled =
    action &&
    action.type in actionTypes &&
    actionTypes[action.type].call(this, critter, vector, action);
  /*
   * If the action didn’t work for whatever reason, the default action is for the creature to simply wait.
   * It loses one-fifth point of energy, and if its energy level drops to zero or below,
   * the creature dies and is removed from the grid.
   */
  if (!handled) {
    critter.energy -= 0.2;
    if (critter.energy <= 0) {
      this.grid.set(vector, null);
    }
  }
};

/**
 * The simplest action a creature can perform is "grow", used by plants.
 * When an action object like {type: "grow"} is returned, the following handler method will be called
 */
actionTypes.grow = function (critter) {
  critter.energy += 0.5;
  return true;
};

/**
 * This action first checks, using the checkDestination method defined earlier, whether the action
 * provides a valid destination. If not, or if the destination isn’t empty, or if the critter lacks the required energy,
 * move returns false to indicate no action was taken. Otherwise, it moves the critter and subtracts the energy cost.
 */
actionTypes.move = function (critter, vector, action) {
  const dest = this.checkDestination(action, vector);
  if (dest == null || critter.energy <= 1 || this.grid.get(dest) != null) {
    return false;
  }
  critter.energy -= 1;
  this.grid.set(vector, null);
  this.grid.set(dest, critter);
  return true;
};

/**
 * Eating another critter also involves providing a valid destination square.
 * This time, the destination must not be empty and must contain something with energy,
 * like a critter (but not a wall—walls are not edible).
 * If so, the energy from the eaten is transferred to the eater, and the victim is removed from the grid.
 */
actionTypes.eat = function (critter, vector, action) {
  const dest = this.checkDestination(action, vector);
  const atDest = dest != null && this.grid.get(dest);
  if (!atDest || atDest.energy == null) {
    return false;
  }
  critter.energy += atDest.energy;
  this.grid.set(dest, null);
  return true;
};

/**
 * Reproducing costs twice the energy level of the newborn critter.
 * So we first create a (hypothetical) baby using elementFromChar on the critter’s own origin character.
 * Once we have a baby, we can find its energy level and test whether the parent has enough energy to successfully
 * bring it into the world. We also require a valid (and empty) destination.
 *
 * If everything is okay, the baby is put onto the grid (it is now no longer hypothetical), and the energy is spent.
 */
actionTypes.reproduce = function (critter, vector, action) {
  const baby = elementFromChar(this.legend, critter.originChar);
  const dest = this.checkDestination(action, vector);
  if (
    dest == null ||
    critter.energy <= 2 * baby.energy ||
    this.grid.get(dest) != null
  ) {
    return false;
  }
  critter.energy -= 2 * baby.energy;
  this.grid.set(dest, baby);
  return true;
};

/**
 * We could put the critters from the old world into it, but they would just die since they don’t have an energy property.
 * So let’s make new ones. First we’ll write a plant, which is a rather simple life-form.
 *
 * Plants start with an energy level between 3 and 7, randomized so that they don’t all reproduce in the same turn.
 */
function Plant() {
  this.energy = 3 + Math.random() * 4;
}

/**
 * When a plant reaches 15 energy points and there is empty space nearby,
 * it reproduces into that empty space.
 * If a plant can’t reproduce, it simply grows until it reaches energy level 20.
 */
Plant.prototype.act = function (view) {
  if (this.energy > 15) {
    const space = view.find(' ');
    if (space) {
      return { type: 'reproduce', direction: space };
    }
  }
  if (this.energy < 20) {
    return { type: 'grow' };
  }
};

/**
 * And now let's define a plant eater
 */
function PlantEater() {
  this.energy = 20;
}

/**
 * We’ll use the * character for plants, so that’s what this creature will look for when it searches for food.
 */
PlantEater.prototype.act = function (view) {
  const space = view.find(' ');
  if (this.energy > 60 && space) {
    return { type: 'reproduce', direction: space };
  }
  const plant = view.find('*');
  if (plant) {
    return { type: 'eat', direction: plant };
  }
  if (space) {
    return { type: 'move', direction: space };
  }
};

// --------------------------------------------------
// Start displaying the world
// --------------------------------------------------

/* try to choose which plan to use */
let loadPlan = plan;
if (process.argv[2] !== undefined) {
  console.log('Trying to load a new plan ' + process.argv[2]);
  loadPlan = require('./plans.json')[process.argv[2]];
}

// start the fun
// let world = new World(loadPlan, { '#': Wall, 'o': BouncingCritter, '~': WallFollower })
let world = new LifelikeWorld(loadPlan, {
  '#': Wall,
  '*': Plant,
  O: PlantEater,
  o: BouncingCritter,
  '~': WallFollower,
});
// let world = new LifelikeWorld(loadPlan, { '🌱': Plant, '#': Wall, 'O': PlantEater, 'o': BouncingCritter, '*': Plant })

setInterval(function () {
  world.turn();
  console.log(world.toString());
}, 100);
