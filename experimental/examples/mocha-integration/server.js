/* global require, exports */
const {startServer} = require("../shared/start-server");
const routes = {
  index: "../mocha-integration/home/index.html",
  home: "../mocha-integration/home/index.html",
  about: "../mocha-integration/about/about.html"
};
const devServer = "http://localhost:6799";

exports.startMochaProjectServer = () => startServer(routes, devServer);
exports.devServer = devServer;
