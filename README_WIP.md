# 😱 testophobia

Taking the fear out of web application snapshot testing

## Overview

Testophobia allows you to create snapshots for your web app routes through the CLI or from a more robust config file. It offers a web viewer to quickly detect and respond to UI changes in your app. 

## Install

```bash
$ yarn add testophobia
```

or

```bash
$ npm i -D testophobia
```

## Example Usage

Testophobia can be run via the CLI with or without configuration options, as well as programmatically within a testing framework such as Mocha. There are two provided examples included in the library repo:

1. Use in normal project through configuration objects (path: examples/standalone)

2. Use within existing mocha tests (path: examples/mocha-integration)

### Usage through the command line

By default, testophobia only needs 1) the names of the routes you'd like tested, and 2) the base URL you'd like for the screenshot(http://localhost:6789 without configuration). 

ex: 

```bash
$ testophobia home about --golden --baseUrl="http://localhost:3001"
```

### Usage with configuration objects

To run this demo, make sure you start the provided dev server (path: ./examples/standalone/server.js)

```bash
$ node server.js
```

then in a separate terminal run

```bash
$ ../../bin/testophobia --golden
```

This will generate the golden screens. To compare test screens, run the same command without the `--golden` flag.

```bash
$ ../../bin/testophobia
```

### Existing Mocha Project

To run this demo, ensure you have mocha installed and run the respective test file

ex:

```bash
$ mocha ./examples/mocha-integration/about/about.spec.js
```

or install mocha locally and use npx:

```bash
$ npx mocha ./examples/mocha-integration/home/home.spec.js
```

## Example Advanced Configuration

Testophobia comes with sensible defaults (listed below), but a config file can be created for advanced usage.

- testophobia.config.js example:

```javascript
import AboutTest from "./examples/standalone/about/about-test.js";
import HomeTest from "./examples/standalone/home/home-test.js";

export default {
  baseUrl: "http://localhost:6789",
  fileType: "jpeg",
  quality: 30,
  dimensions: [
    {
      type: "desktop",
      width: 1024,
      height: 768,
      compressed: {
        width: 600,
        height: 450
      }
    },
    {
      type: "tablet",
      width: 768,
      height: 1024
    },
    {
      type: "mobile",
      width: 375,
      height: 812
    }
  ],
  testDirectory: "./test-results/test-screens",
  goldenDirectory: "./test-results/golden-screens",
  diffDirectory: "./test-results/diffs",
  threshold: 0.2,
  tests: [AboutTest, HomeTest]
};
```

- then, in ./examples/standalone/home/home-test.js:

```javascript
export default {
  name: "home",
  actions: [
    {
      type: "click",
      target: "#btn",
      delay: 400
    }
  ]
};
```

* Note that all commands available through the `testophobia.config.js` file can be passed through the command line.

## Config Options

`baseUrl`: (string) the url you'd like to run tests on | default: http://localhost:6789

`fileType`: (string) the type of screenshot you'd like (options: jpeg, png) | default: png

`quality`: (number) if jpeg fileType, the quality setting from 1-100 for the image | default: 80

`dimensions`: (array) the type and 2D dimensions to set for the screenshot | defaults: desktop (1024 x 768) and mobile (375 x 812)

- `type`: (string) the desired name of the defined device/resolution/dimension 

- `width`: (number, in px) the desired width of the screenshot

- `height`: (number, in px) the desired height of the screenshot

- `compressed`: (object) the desired dimensions for the compressed image (Note: compressed dimensions must maintain aspect ratio)

  - `width`: (number, in px) the desired width of the compressed screenshot

  - `height`: (number, in px) the desired height of the compressed screenshot

`testDirectory`: (string) desired file location for the test screenshots | default: (cwd)/testophobia/test-screens

`goldenDirectory`: (string) desired file location for the golden (reference) screenshots | default: (cwd)/testophobia/golden-screens

`diffDirectory`: (string) desired file location for the diff screenshots that highlight the disceprencies upon failure | default: (cwd)/testophobia/diffs

`threshold`: (number) sets the strictness of the comparison (from 0 to 1) | default: 0.2

`tests`: (arrray) a more detailed location to set which areas to snap, including actions and other data (required)

- `name`: (string) the name of the folder directory for the project, as well as the route (if path is not defined)

- `path`: (string) the actual path/route to use *without leading slash* (ex: page/article/why-testophobia-is-awesome)

- `delay`: (number) the amount of time (in ms) to delay before taking a screenshot for a given route

- `actions`: (array) list of actions to run on the route. Each action is an object consisting of:

  - `type`: (string) the type of action to run
  
  - `target`: (string) the target HTML element to perform the action on. Can be an id, class, or element

  - `delay`: (number) the amount of time (in ms) to delay before taking a screenshot for a given action

    - so far, supported actions include: click, scroll, input, and hover

## Action-Specific Configs

  _When the following are set as a action `type`, additional properties are required:_

- `input`: 

  - `property`: (string) the desired property for setting text on input. examples: value, textContent

  - `text`: (string) the text to input 

- `scroll`:

  - `scrollTop`: (number) the desired offset (in px) the element should be scrolled

## Contributing

coming soon
