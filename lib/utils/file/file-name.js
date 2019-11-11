/* global require, exports, Buffer */
const Base58 = require('bs58');

/**
 * Clean a file name string, replacing non-alphanumeric characters with hyphens
 */
exports.cleanFileName = s => {
  if (!s) return 0;
  return s.replace(/ /g, '-').replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/g, '-'); //eslint-disable-line no-useless-escape
};

/**
 * Get the encoded name of the initial test snapshot file
 */
exports.getIntialStateFileName = scaled => {
  return Base58.encode(Buffer.from('initial-state', 'binary')) + (!scaled ? '-unscaled' : '');
};

/**
 * Get the encoded name of the test action snapshot file
 */
exports.getActionFileName = (index, action, skipEncode) => {
  const desc = exports.cleanFileName(action.description);
  const target = exports.cleanFileName(action.target);
  const genName = `${index}-${action.type}-${target}`;
  const name = desc ? desc : genName;
  return skipEncode ? (desc ? action.description : genName) : Base58.encode(Buffer.from(name, 'binary'));
};
