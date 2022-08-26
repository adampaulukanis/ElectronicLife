'use strict';

const World = require('./src/World.js');
const Wall = require('./src/Wall.js');
const BouncingCritter = require('./src/BouncingCritter.js');

const plan = [
  '############################',
  '#     #       #    #      ##',
  '#                          #',
  '#           #####          #',
  '##          # o #    ##    #',
  '###            ##     #    #',
  '#            ###      #    #',
  '#    ####                  #',
  '#    ##          o         #',
  '#     #   o            #####',
  '#o    #                    #',
  '############################',
];

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
let world = new World(loadPlan, {
  '#': Wall,
  '~': Wall,
  o: BouncingCritter,
});

setInterval(function () {
  world.turn();
  console.log(world.toString());
}, 100);
