'use strict';

const LifelikeWorld = require('./src/LifelikeWorld.js');
const Wall = require('./src/Wall.js');
const { directionNames, randomElement } = require('./src/utils.js');

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

function BouncingCritter() {
  this.direction = randomElement(directionNames);
}
BouncingCritter.prototype.act = function (view) {
  if (view.look(this.direction) !== ' ') {
    this.direction = view.find(' ') || 's';
  }
  return { type: 'move', direction: this.direction };
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
