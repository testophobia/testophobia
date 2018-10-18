/* global require */
const { startServer } = require("../shared/start-server");
const routes = {
  index: "../../examples/standalone/home/index.html",
  home: "../../examples/standalone/home/index.html",
  about: "../../examples/standalone/about/about.html"
};
const devServer = "http://localhost:6789";

startServer(routes, devServer);
