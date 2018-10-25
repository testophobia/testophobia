export default {
  fileType: "png",
  baseUrl: 'https://picsum.photos/640/480/?image=' + Math.floor(Math.random() * 1085),
  dimensions: [
    {
      type: "image",
      width: 640,
      height: 480
    }
  ],
  tests: [
    {name: 'home'}
  ]
};
