import AboutTest from "./about/about-test.js";
import HomeTest from "./home/home-test.js";

export default {
  fileType: "jpeg",
  dimensions: [
    {
      type: "desktop",
      width: 1024,
      height: 768
    },
    {
      type: "tablet",
      width: 768,
      height: 1024
    },
    {
      type: "mobile",
      width: 350,
      height: 667
    }
  ],
  testDirectory: "./testophobia/test-screens",
  goldenDirectory: "./testophobia/golden-screens",
  diffDirectory: "./testophobia/diffs",
  threshold: 0.2,
  routes: [HomeTest, AboutTest]
};
