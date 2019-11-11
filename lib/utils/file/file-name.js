/* global require, exports, Buffer */
const Base58 = require('bs58');

/**
 * Clean a file name string, replacing non-alphanumeric characters with hyphens
 *
 * @param {string} s The file name to be cleaned
 * @return {string} The cleansed file name
 */
exports.cleanFileName = s => {
  if (!s) return 0;
  return s.replace(/ /g, '-').replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/g, '-'); //eslint-disable-line no-useless-escape
};

/**
 * Get the encoded name of the initial test snapshot file
 *
 * @param {boolean} scaled The file is the post-resizing version
 * @return {string} The encoded file name
 */
exports.getIntialStateFileName = scaled => {
  return Base58.encode(Buffer.from('initial-state', 'binary')) + (!scaled ? '-unscaled' : '');
};

/**
 * Get the encoded name of the test action snapshot file
 * @param {number} index The index of the action within the test
 * @param {object} action The test action reference
 * @param {boolean} skipEncode Skip encoding the file name (for display purposes)
 * @return {string} The encoded action file name
 */
exports.getActionFileName = (index, action, skipEncode) => {
  const desc = exports.cleanFileName(action.description);
  const target = exports.cleanFileName(action.target);
  const genName = `${index}-${action.type}-${target}`;
  const name = desc ? desc : genName;
  return skipEncode ? (desc ? action.description : genName) : Base58.encode(Buffer.from(name, 'binary'));
};
