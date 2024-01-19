import express from 'express';
const app = express();
import fs from 'fs';
import path from 'path';
import opn from 'opn';
import chalk from 'chalk';
import {glob} from 'glob';
import {resolveNodeModuleFile, deleteGlob} from '../file/file.js';
import {readTestFileToObject} from '../test/format-tests.js';
import {writeGoldensManifest} from '../generate/generate-screenshot.js';
import {getGoldenImagesForViewer, getGoldenDirectoriesForViewer, getBrowsersForViewer} from './get-goldens-for-viewer.js';
const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

/**
 * Backend for the Testophobia Viewer
 *
 * @param {object} conf The Testophobia config file
 * @param {string} resultsDir Path containing the results.json file(s)
 */
/* istanbul ignore next */
export const serveViewer = async (conf, resultsDir) => {
  const projectDir = conf.projectDir;
  let resultsJSON;
  if (!conf.golden) {
    try {
      const results = await glob.sync(path.join(resultsDir, 'results*.json'))
      results.forEach(r => {
        if (!resultsJSON) resultsJSON = JSON.parse(fs.readFileSync(r));
        else resultsJSON.failures = resultsJSON.failures.concat(JSON.parse(fs.readFileSync(r)).failures);
      })
    } catch (e) {
      console.log('Could not locate the results file!', resultsDir);
      return;
    }
  }

  /* try to prevent any client side caching */
  app.use((req, res, next) => {
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  /* serve the viewer config */
  app.get('/viewer-config', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify({browser: conf.currentBrowser}));
  });

  /* serve the results json file or golden images when requested */
  app.get('/test-results', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(resultsJSON));
  });

  /* serve the results json file or golden images when requested */
  app.get('/test-results/*', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(getGoldenImagesForViewer(conf, req.params[0])));
  });

  /* serve the list of golden directories */
  app.get('/golden-dirs', async (req, res) => {
    res.header('Content-Type', 'application/json');
    const dirs = await getGoldenDirectoriesForViewer(conf);
    res.send(JSON.stringify(dirs));
  });

  /* serve the test images when requested */
  app.get('/images/:testIdx/:imageType', (req, res) => {
    if (resultsJSON.failures.length === 0) return res.sendStatus(200);
    const imgPath = resultsJSON.failures[req.params.testIdx][`${req.params.imageType}FileLocation`];
    if (imgPath.includes('.png')) res.header('Content-Type', 'image/png');
    else res.header('Content-Type', 'image/jpeg');
    res.sendFile(path.join(projectDir, imgPath));
  });

  /* serve the golden images when requested */
  app.get('/goldens/*', (req, res) => {
    const imgPath = req.params[0];
    if (imgPath.includes('.png')) res.header('Content-Type', 'image/png');
    else res.header('Content-Type', 'image/jpeg');
    res.sendFile(path.join(projectDir, imgPath));
  });

  const applyGolden = async testIdx => {
    const diffPath = resultsJSON.failures[testIdx][`diffFileLocation`];
    const testPath = resultsJSON.failures[testIdx][`testFileLocation`];
    const gldnPath = resultsJSON.failures[testIdx][`goldenFileLocation`];
    const testDefPath = resultsJSON.failures[testIdx].testDefinitionPath;
    const testDef = !isNaN(testDefPath) ? conf.tests[testDefPath] : await readTestFileToObject(testDefPath);
    if (conf.verbose) console.log(chalk.dim(`Apply new golden image from: ${testPath}`));
    fs.copyFileSync(path.join(projectDir, testPath), path.join(projectDir, gldnPath));
    if (diffPath) fs.unlinkSync(path.join(projectDir, diffPath));
    resultsJSON.failures.splice(testIdx, 1);
    --resultsJSON.totalTests;
    --resultsJSON.totalFailures;
    await deleteGlob(path.join(resultsDir, 'results*.json'));
    fs.writeFileSync(path.join(resultsDir, 'results.json'), JSON.stringify(resultsJSON));
    writeGoldensManifest(path.resolve(gldnPath, '..'), testDef);
  };

  /* copy the test image over as the new golden image for this test index, and remove the failure  */
  app.post('/apply-golden/:testIdx', async (req, res) => {
    await applyGolden(req.params.testIdx);
    res.sendStatus(200);
  });

  /* copy all test images over as the new golden images, and remove the failure  */
  app.post('/apply-all-goldens', async (req, res) => {
    const numFailures = resultsJSON.failures.length;
    for (let i = numFailures - 1; i >= 0; i--) {
      await applyGolden(i);
    }
    res.sendStatus(200);
  });

  /* (not used anymore) viewer produces a heartbeat, if we don't receive it anymore, stop the server  */
  app.post('/heartbeat', (req, res) => {
    res.sendStatus(200);
  });

  /* set the main viewer root directory */
  app.use(express.static(path.join(__dirname, '../../../viewer')));

  /* map any calls to node_modules to the main testophobia node_modules dir */
  app.get('/node_modules/*', (req, res) => {
    res.sendFile(resolveNodeModuleFile(req.path));
  });

  /* map all other routes back to index */
  app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../../../viewer/' + (conf.golden ? 'golden.html' : 'index.html')));
  });

  /* start the server */
  app.listen(8090);

  /* open the viewer in the default browser */
  opn('http://localhost:8090/' + (conf.golden ? 'golden.html' : 'index.html'));
};
