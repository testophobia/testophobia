/* global require, exports, Buffer */
const {cleanFileName} = require('.');
const Base58 = require('bs58');

exports.getIntialFileName = scaled => {
  return Base58.encode(Buffer.from('initial-state', 'binary')) + (!scaled ? '-unscaled' : '');
};

exports.getActionFileName = (index, action, skipEncode) => {
  const desc = cleanFileName(action.description);
  const target = cleanFileName(action.target);
  return skipEncode ? action.description : Base58.encode(Buffer.from(desc, 'binary'));
};
