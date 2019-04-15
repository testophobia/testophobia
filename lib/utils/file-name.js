/* global require, exports, Buffer */
const {cleanFileName} = require('.');
const Base58 = require('bs58');

exports.getIntialFileName = scaled => {
  return Base58.encode(Buffer.from('initial-state', 'binary')) + ((!scaled) ? '-unscaled' : '');
};

exports.getActionFileName = (index, action, skipEncode) => {
  const desc = cleanFileName(action.description);
  const target = cleanFileName(action.target);
  const genName = `${index}-${action.type}-${target}`;
  const name = (desc) ? desc : genName;
  return (skipEncode) ? ((desc) ? action.description : genName) : Base58.encode(Buffer.from(name, 'binary'));
};