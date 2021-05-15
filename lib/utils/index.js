/**
 * Await an async function for each item in an array
 *
 * @param {array} arr The array to iterate over
 * @param {function} cb The function to await for each array item
 */
export const asyncForEach = async (arr, cb) => {
  for (let i = 0; i < arr.length; i++) {
    if ((await cb(arr[i], i, arr)) === true) break;
  }
};


