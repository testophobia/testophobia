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
  baseUrl: 'https://testophobia.github.io/testophobia/examples/basic',
  threshold: 0.2,
  tests: 'tests/**/*-test.js',
};
