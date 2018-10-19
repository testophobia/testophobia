/* global require, __dirname, process, describe, before, beforeEach, after, afterEach, it */

const puppeteer = require("puppeteer");
const {startMochaProjectServer, devServer} = require("../server.js");
const path = require("path");
const {expect} = require("chai");
const Testophobia = require("../../../lib/cli");

let tpConfig = {
  projectDir: process.cwd(),
  baseUrl: devServer,
  golden: true,
  routes: [
    {
      name: "home",
      behaviors: [
        {
          type: "click",
          target: "#btn"
        }
      ]
    }
  ]
};

describe("Home Page Renders Properly", function () {
  this.timeout(65000);
  this.slow(Infinity);
  let browser, page;
  let server;

  before(async () => (server = await startMochaProjectServer()));

  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => {
    browser.close();
  });

  after(() => {
    server.close();
  });

  describe("h1 is the proper text", () => {
    beforeEach(() => {
      return page.setViewport({width: 1200, height: 600});
    });
    it("Desktop h1 is correct", () => verifyElement(page, "h1", "Testophobia"));
  });

  describe("paragraph text renders", () => {
    beforeEach(() => page.setViewport({width: 375, height: 667}));
    it("Desktop paragraph is correct.", () => verifyElement(page, "p", "This is an example page."));
  });

  describe("check screenshots", () => {
    it(`${
      tpConfig.golden ? "Generate golden images" : "Screenshots match"
      }`, async () => {
        let c = await Testophobia.run(tpConfig);
        expect(c, "Testophobia ran without issues").equal(0);
      });
  });
});

const verifyElement = async (p, el, text) => {
  await p.goto(`${devServer}/home`);
  await waitForRender();
  await addSelectorScript(p);
  await waitForRender();
  const elText = await retrieveElement(p, el);
  expect(elText, `proper ${el} text`).equal(text);
};

const retrieveElement = async (p, el) => {
  const element = await p.evaluate(element => {
    const anchor = document.querySelector(element);
    return anchor.innerHTML;
  }, el);
  return element;
};

const addSelectorScript = p => {
  return p.addScriptTag({
    path: path.join(
      __dirname,
      "../../../node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js"
    )
  });
};

const waitForRender = () => new Promise(resolve => setTimeout(resolve, 2000));
