/* global require, exports, Buffer */
const {cleanFileName} = require('.');

exports.getActionFileName = (index, action) => {
  const desc = cleanFileName(action.description);
  const target = cleanFileName(action.target);
  const name = (desc) ? desc : `${index}-${action.type}-${target}`;
  return Buffer.from(name, 'binary').toString('base64');
};
