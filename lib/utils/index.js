/* global exports */

/**
 * Await an async function for each item in an array
 */
exports.asyncForEach = async (arr, cb) => {
  for (let i = 0; i < arr.length; i++) {
    if ((await cb(arr[i], i, arr)) === true) break;
  }
};


