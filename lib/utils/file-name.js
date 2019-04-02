/* global require, exports, Buffer */
const {cleanFileName} = require('.');
const Base58 = require('bs58');

exports.getIntialFileName = scaled => {
  return Base58.encode(Buffer.from('initial-state', 'binary')) + ((!scaled) ? '-unscaled' : '');
};

exports.getActionFileName = (index, action) => {
  const desc = cleanFileName(action.description);
  const target = cleanFileName(action.target);
  const name = (desc) ? desc : `${index}-${action.type}-${target}`;
  return Base58.encode(Buffer.from(name, 'binary'));
};
