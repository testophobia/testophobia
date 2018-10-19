/* global require, exports, __dirname */

const express = require("express");
const app = express();
const path = require("path");

exports.startServer = (routes, server) => {
  app.use(express.static(path.join(__dirname, routes.index)));
  app.get("/", (req, res) => res.sendFile(path.join(__dirname, routes.index)));
  app.get("/home", (req, res) => res.sendFile(path.join(__dirname, routes.index))
  );
  app.get("/about", (req, res) => res.sendFile(path.join(__dirname, routes.about))
  );
  return app.listen(server.split(":")[2]);
};
