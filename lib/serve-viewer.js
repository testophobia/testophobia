/* global require, exports, __dirname */
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const opn = require('opn');
const chalk = require("chalk");

exports.serveViewer = (conf, resultsPath) => {
  const projectDir = conf.projectDir;
  const resultsJSON = JSON.parse(fs.readFileSync(resultsPath));

  /* try to prevent any client side caching */
  app.use((req, res, next) => {
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  /* serve the results json file when requested */
  app.get('/results.json', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(resultsJSON));
  });

  /* serve the test images when requested */
  app.get('/images/:testIdx/:imageType', (req, res) => {
    const imgPath = resultsJSON.failures[req.params.testIdx][`${req.params.imageType}FileLocation`];
    if (imgPath.includes('.png'))
      res.header('Content-Type', 'image/png');
    else
      res.header('Content-Type', 'image/jpeg');
    res.sendFile(path.join(projectDir, imgPath));
  });

  /* copy the test image over as the new golden image for this test index, and remove the failure  */
  app.post('/apply-golden/:testIdx', (req, res) => {
    const diffPath = resultsJSON.failures[req.params.testIdx][`diffFileLocation`];
    const testPath = resultsJSON.failures[req.params.testIdx][`testFileLocation`];
    const gldnPath = resultsJSON.failures[req.params.testIdx][`goldenFileLocation`];
    if (conf.verbose) console.log(chalk.dim(`Apply new golden image from: ${testPath}`));
    fs.copyFileSync(path.join(projectDir, testPath), path.join(projectDir, gldnPath));
    fs.unlinkSync(path.join(projectDir, diffPath));
    resultsJSON.failures.splice(req.params.testIdx, 1);
    --resultsJSON.totalTests;
    --resultsJSON.totalFailures;
    fs.writeFileSync(resultsPath, JSON.stringify(resultsJSON));
    res.sendStatus(200);
  });

  /* set the main viewer root directory */
  app.use(express.static(path.join(__dirname, '../viewer')));

  /* map any calls to node_modules to the main testophobia node_modules dir */
  app.use('/node_modules/', express.static(path.join(__dirname, '../node_modules/')));

  /* start the server */
  app.listen(8090);

  /* open the viewer in the default browser */
  opn('http://localhost:8090/index.html');
};