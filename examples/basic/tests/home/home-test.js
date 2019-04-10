export default {
  name: "home",
  path: "/testophobia/examples/basic/home/index.html",
  actions: [
    {
      description: "Click the button to toggle the text color",
      excludeDimensions: ['mobile', 'tablet'],
      type: "click",
      target: "#btn"
    }
  ]
};
