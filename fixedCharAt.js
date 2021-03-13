'use strict';

module.exports = function fixedCharAt(str, idx) {
  var ret = '';
  str += '';
  var end = str.length;

  var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  while (surrogatePairs.exec(str) != null) {
    var li = surrogatePairs.lastIndex;
    if (li - 2 < idx) {
      idx++;
    } else {
      break;
    }
  }

  if (idx >= end || idx < 0) {
    return '';
  }

  ret += str.charAt(idx);

  if (
    /[\uD800-\uDBFF]/.test(ret) &&
    /[\uDC00-\uDFFF]/.test(str.charAt(idx + 1))
  ) {
    // Go one further, since one of the characters is part of a surrogate pair
    ret += str.charAt(idx + 1);
  }
  return ret;
};
