/* global require, exports */
const {cleanFileName} = require('.');

exports.getActionFileName = (index, action) => {
  const desc = cleanFileName(action.description);
  const target = cleanFileName(action.target);
  return (desc) ? desc : `${index}-${action.type}-${target}`;
};
