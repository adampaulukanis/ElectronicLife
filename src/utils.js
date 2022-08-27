'use strict';

const Vector = require('./Vector.js');

function charFromElement(element) {
  if (element == null) {
    return ' ';
  } else {
    return element.originChar;
  }
}

function elementFromChar(legend, ch) {
  if (ch === ' ') {
    return null;
  }
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt#Getting_whole_characters
  let element = new legend[ch](); // if breaks here, update your legend!
  element.originChar = ch;
  return element;
}

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

const directionNames = 'n ne e se s sw w nw'.split(' ');

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function dirPlus(dir, n) {
  let index = directionNames.indexOf(dir);
  return directionNames[(index + n + 8) % 8];
}

module.exports = {
  charFromElement: charFromElement,
  elementFromChar: elementFromChar,
  directions: directions,
  directionNames: directionNames,
  randomElement: randomElement,
  dirPlus: dirPlus,
};
