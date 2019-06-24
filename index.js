'use strict'

const plan = [
  '############################',
  '# ~~~  #      #            #',
  '#                     o    #',
  '#           #####          #',
  '##          # o #    ##    #',
  '###            ##     #    #',
  '#            ###      #    #',
  '#    ####                  #',
  '#    ##                    #',
  '#     #                ### #',
  '#     #                    #',
  '############################'
]

/**
 * Simple class representing a point in two-dimensional space by means
 * of two coordinates.
 * TODO: I have a class for this: https://github.com/adam17/Vector
 */
function Vector (x, y) {
  this.x = x
  this.y = y
}

/**
 * Adds two vectors and returns the sum of them.
 */
Vector.prototype.plus = function (other) {
  return new Vector(this.x + other.x, this.y + other.y)
}

/**
 * To store a grid of values we can use a single array,
 * with size width × height, and decide that the element at (x,y)
 * is found at position x + (y × width) in the array.
 */
function Grid (width, height) {
  this.space = new Array(width * height)
  this.width = width
  this.height = height
}
Grid.prototype.isInside = function (vector) {
  return vector.x >= 0 && vector.x < this.width &&
         vector.y >= 0 && vector.y < this.height
}
Grid.prototype.get = function (vector) {
  return this.space[vector.x + this.width * vector.y]
}
Grid.prototype.set = function (vector, value) {
  this.space[vector.x + this.width * vector.y] = value
}
Grid.prototype.forEach = function (f, context) {
  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      let value = this.space[x + y * this.width]
      if (value != null) {
        f.call(context, value, new Vector(x, y))
      }
    }
  }
}

const directions = {
  'n': new Vector(0, -1),
  'ne': new Vector(1, -1),
  'e': new Vector(1, 0),
  'se': new Vector(1, 1),
  's': new Vector(0, 1),
  'sw': new Vector(-1, 1),
  'w': new Vector(-1, 0),
  'nw': new Vector(-1, -1)
}

function randomElement (array) {
  return array[Math.floor(Math.random() * array.length)]
}

// const directionNames = 'n ne e se s sw w nw'.split(' ')
const directionNames = Object.keys(directions)

function BouncingCritter () {
  this.direction = randomElement(directionNames)
}
BouncingCritter.prototype.act = function (view) {
  if (view.look(this.direction) !== ' ') {
    this.direction = view.find(' ') || 's'
  }
  return { type: 'move', direction: this.direction }
}

// World
function elementFromChar (legend, ch) {
  if (ch === ' ') {
    return null
  }
  let element = new legend[ch]()
  element.originChar = ch
  return element
}

function World (map, legend) {
  let grid = new Grid(map[0].length, map.length)
  this.grid = grid
  this.legend = legend

  map.forEach(function (line, y) {
    for (let x = 0; x < line.length; x++) {
      grid.set(new Vector(x, y), elementFromChar(legend, line[x]))
    }
  })
}

function charFromElement (element) {
  if (element == null) {
    return ' '
  } else {
    return element.originChar
  }
}

World.prototype.toString = function () {
  let output = ''
  for (let y = 0; y < this.grid.height; y++) {
    for (let x = 0; x < this.grid.width; x++) {
      let element = this.grid.get(new Vector(x, y))
      output += charFromElement(element)
    }
    output += '\n'
  }
  return output
}

World.prototype.turn = function () {
  let acted = []
  this.grid.forEach(function (critter, vector) {
    if (critter.act && acted.indexOf(critter) === -1) {
      acted.push(critter)
      this.letAct(critter, vector)
    }
  }, this)
}

World.prototype.letAct = function (critter, vector) {
  let action = critter.act(new View(this, vector))
  if (action && action.type === 'move') {
    let dest = this.checkDestination(action, vector)
    if (dest && this.grid.get(dest) == null) {
      this.grid.set(vector, null)
      this.grid.set(dest, critter)
    }
  }
}

World.prototype.checkDestination = function (action, vector) {
  if (directions.hasOwnProperty(action.direction)) {
    let dest = vector.plus(directions[action.direction])
    if (this.grid.isInside(dest)) {
      return dest
    }
  }
}

function Wall () {}

function View (world, vector) {
  this.world = world
  this.vector = vector
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
  let target = this.vector.plus(directions[dir])
  if (this.world.grid.isInside(target)) {
    return charFromElement(this.world.grid.get(target))
  } else {
    return '#'
  }
}

View.prototype.findAll = function (ch) {
  let found = []
  for (let dir in directions) {
    if (this.look(dir) === ch) {
      found.push(dir)
    }
  }
  return found
}

View.prototype.find = function (ch) {
  let found = this.findAll(ch)
  if (found.length === 0) {
    return null
  }
  return randomElement(found)
}

/**
 * Since directions are modeled by a set of strings, we need to define our own operation (dirPlus)
 * to calculate relative directions. So dirPlus("n", 1) means one 45-degree turn clockwise from north,
 * giving "ne". Similarly, dirPlus("s", -2) means 90 degrees counterclockwise from south, which is east.
 */
function dirPlus (dir, n) {
  const index = directionNames.indexOf(dir)
  return directionNames[(index + n + 8) % 8]
}

/**
 * There is a critter that moves along walls.
 * Conceptually, the critter keeps its left hand to the wall and follows along.
 */
function WallFollower () {
  this.dir = 's'
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
  let start = this.dir
  if (view.look(dirPlus(this.dir, -3)) !== ' ') {
    start = this.dir = dirPlus(this.dir, -2)
  }
  while (view.look(this.dir) !== ' ') {
    this.dir = dirPlus(this.dir, 1)
    if (this.dir === start) {
      break
    }
  }
  return { type: 'move', direction: this.dir }
}

// --------------------------------------------------
// Start displaying the world
// --------------------------------------------------

let world = new World(plan, { '#': Wall, 'o': BouncingCritter, '~': WallFollower })

setInterval(function () {
  world.turn()
  console.log(world.toString())
}, 1000)
