'use strict';

const World = require('./World.js');
const View = require('./View.js');
const { elementFromChar } = require('./utils.js');

const actionTypes = Object.create(null); // Because why not?

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
 * To make life in our world more interesting, we will add the concepts of food and reproduction.
 * Each living thing in the world gets a new property, energy, which is reduced by performing actions and increased by
 * eating things. When the critter has enough energy, it can reproduce, generating a new critter of the same kind.
 * To keep things simple, the critters in our world reproduce asexually, all by themselves.
 */
class LifelikeWorld extends World {
  constructor(map, legend) {
    super(map, legend);
  }

  /**
   * We’ll need a world with a different letAct method. We could just replace the method of the World prototype, but
   * I’ve become very attached to our simulation with the wall-following critters and would hate to break that old world.
   *
   * One solution is to use inheritance. We create a new constructor, LifelikeWorld, whose prototype is based on
   * the World prototype but which overrides the letAct method. The new letAct method delegates the work of actually
   * performing an action to various functions stored in the actionTypes object.
   */
  letAct(critter, vector) {
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
  }
}

module.exports = LifelikeWorld;
