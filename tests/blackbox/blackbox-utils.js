import path from 'path';
import fs from 'fs';
import sinon from 'sinon';
import stripAnsi from 'strip-ansi';
import bbconfig from './blackbox-config.js';

import {createDirectory, copyFileOrDirectory, deleteDirectory} from '../../lib/utils/file/file.js';
import {Testophobia} from '../../lib/Testophobia.js';
import {Logger} from '../../lib/Logger.js';
import {Output} from '../../lib/Output.js';

const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

const blackbox = {};
const sandboxDir = path.join(__dirname, 'sandbox');
let consoleChanges = [];
let loggerStub = null;
let spinnerStubs = [];
let parallelStub = null;

const stubLogger = (output, verbose) => {
  const logger = output._getLog();
  logger.setLevel(verbose ? Logger.DEBUG_LEVEL : Logger.INFO_LEVEL);
  loggerStub = sinon.stub(logger, '_log').callsFake((message, consoleLevel, chalkColor) => {
    if (verbose || chalkColor !== 'dim') consoleChanges.push({message: stripAnsi(message), consoleLevel, chalkColor});
    if (consoleLevel === 'error') console.error(message);
  });
  logger.fatal = function(message) {
    this._log(message, 'error', 'red');
    throw new Error('Process Exited');
  };
};

const stubOra = output => {
  let isSpinning = false;
  let spinner = new SpinnerMock();
  spinnerStubs = [];
  spinnerStubs.push(sinon.stub(spinner, 'isSpinning').returns(isSpinning));
  spinnerStubs.push(
    sinon.stub(spinner, 'start').callsFake(() => {
      if (!isSpinning) consoleChanges.push({spinner: 'start'});
      isSpinning = true;
    })
  );
  spinnerStubs.push(sinon.stub(spinner, 'stop').callsFake(() => {}));
  spinnerStubs.push(
    sinon.stub(spinner, 'succeed').callsFake(() => {
      consoleChanges.push({spinner: 'succeed'});
      isSpinning = false;
    })
  );
  spinnerStubs.push(
    sinon.stub(spinner, 'fail').callsFake(() => {
      consoleChanges.push({spinner: 'fail'});
      isSpinning = false;
    })
  );
  spinnerStubs.push(
    sinon.stub(spinner, 'text').set(val => {
      consoleChanges.push({spinner: 'message', text: stripAnsi(val)});
    })
  );
  output._setSpinner(spinner);
};

blackbox.setupTests = test => {
  test.beforeEach(t => {
    return new Promise(async resolve => {
      await deleteDirectory(sandboxDir);
      const inst = !!global.mocks ? global.mocks.instance + 1 : 1;
      global.mocks = {
        instance: inst,
        meow: () => bbconfig.getMeowResult(),
        findConfig: () => bbconfig.getFindConfigResult(),
        inquirer: () => bbconfig.getInquirerResult(),
      }
      resolve();
    });
  });

  test.afterEach.always(t => {
    return new Promise(async resolve => {
      consoleChanges = [];
      loggerStub.restore();
      spinnerStubs.forEach(s => s.restore());
      if (parallelStub) parallelStub.restore();
      resolve();
    });
  });
};

blackbox.getConsoleChanges = () => {
  return consoleChanges;
};

blackbox.createTestophobia = async verbose => {
  const output = new Output();
  stubLogger(output, verbose);
  stubOra(output);
  const t = new Testophobia();
  await t.init(sandboxDir, output);
  return t;
};

blackbox.runTestophobia = async tp => {
  try {
    await tp.run();
  } catch (e) {
    /* ignored */
  }
};

blackbox.dumpConsole = tp => {
  console.log(JSON.stringify(consoleChanges, null, 2));
};

blackbox.createEmptySandbox = (meowResult) => {
  createDirectory(sandboxDir);
  bbconfig.setMeowResult(meowResult);
};

blackbox.useBadConfigFile = async result => {
  createDirectory(sandboxDir);
  if (result) fs.writeFileSync(path.join(__dirname, `sandbox/testophobia.config${global.mocks.instance}.js`), result);
  bbconfig.setMeowResult({input: ['undefined'], flags: {}});
};

blackbox.applyConfigFile = async (skipDirs, applyUserCfg, meowResult) => {
  createDirectory(sandboxDir);
  fs.writeFileSync(path.join(__dirname, `sandbox/testophobia.config${global.mocks.instance}.js`), 'export default ' + JSON.stringify(bbconfig.getConfig()));
  bbconfig.setMeowResult(meowResult);
  bbconfig.setUserCfgInUse(Boolean(applyUserCfg));
  if (!skipDirs) {
    createDirectory('./sandbox/diffs');
    createDirectory('./sandbox/golden-screens');
    createDirectory('./sandbox/test-screens');
  }
};

blackbox.prepareTestRun = async tests => {
  blackbox.writeTestFiles(tests);
  blackbox.prepareGoldens(tests);
  const t = await blackbox.createTestophobia();
  return t;
};

blackbox.writeTestFiles = async tests => {
  tests.forEach(async t => {
    await createDirectory(t.dir);
    let tfile = t.file.slice(0, -8) + '-' + global.mocks.instance + '-test.js';
    const filepath = path.join(__dirname, t.dir, tfile);
    fs.writeFileSync(filepath, 'export default ' + JSON.stringify(t.contents));
  });
};

blackbox.prepareGoldens = async tests => {
  createDirectory(`./sandbox/golden-screens/chromium/desktop/section1`);
  createDirectory(`./sandbox/golden-screens/chromium/mobile/section1`);
  createDirectory(`./sandbox/golden-screens/chromium/desktop/section2`);
  createDirectory(`./sandbox/golden-screens/chromium/mobile/section2`);
  createDirectory(`./sandbox/golden-screens/chromium/desktop/section3`);
  createDirectory(`./sandbox/golden-screens/chromium/mobile/section3`);
  if (tests && tests.length) {
    tests.forEach(t => {
      copyFileOrDirectory(`./files/goldens/${t.testName}`, `./sandbox/golden-screens/chromium`);
    });
  }
};

blackbox.getFiles = dir => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(p => !p.startsWith('.'));
};

blackbox.stubParallel = (tp, cb) => {
  parallelStub = sinon.stub(tp, '_parallelRunComplete');
  parallelStub.callsFake(() => cb());
};

blackbox.setFileGenResult = (result, cb) => {
  bbconfig.setInquirerResult(result, cb);
};

blackbox.getGenConfigContents = () => {
  return bbconfig.getGenConfig();
};

blackbox.getGenTestContents = () => {
  return bbconfig.getGenTest();
};

class SpinnerMock {
  fail() {}
  get isSpinning() {}
  start() {}
  stop() {}
  succeed() {}
  set text(t) {}
}

export default blackbox;
