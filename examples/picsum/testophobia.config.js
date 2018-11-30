export default {
  fileType: "png",
  baseUrl: 'https://picsum.photos',
  dimensions: [
    {
      type: "image",
      width: 640,
      height: 480
    }
  ],
  tests: [
    {
      name: 'home',
      path: '/640/480/?image=' + Math.floor(Math.random() * 1085)
    }
  ]
};
