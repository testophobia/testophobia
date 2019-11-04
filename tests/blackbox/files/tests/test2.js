module.exports = {
  testName: 'test2',
  goldens: {
    desktop: [
      '2fm1HKw4gcoXhLVNxWp77htEfe9TDSbwB3wFFV4XcgDgeS7EkhYSkVxrKqLi8V.jpeg',
      '4Tc5tHFf96q46SVjWdvi5Ltby.jpeg',
      '9nLGvMUKhvYNzLezgt.jpeg',
      'GGRrZLjhLkj6f1Xpdoz4J4rpDd.jpeg',
      'M2gR52Jm6N2s55oivx7fMfGdncpVHewcDwmw5CXLkdxj4.jpeg',
      'NX2ueh6nJoM5kmkbm1mhcLkLv8gLxtn9BJ683FQGo5tp2.jpeg',
      'manifest'
    ],
    mobile: [
      '2fm1HKw4gcoXhLVNxWp77htEfe9TDSbwB3wFFV4XcgDgeS7EkhYSkVxrKqLi8V.jpeg',
      '3G4d3v7SFaqWUTW1AeYwB3MrST2BHmcVo8ToqwZSLPRQtjTweCr.jpeg',
      '4Tc5tHFf96q46SVjWdvi5Ltby.jpeg',
      '9nLGvMUKhvYNzLezgt.jpeg',
      'DLuoppmPYDyKPXRxRQoLdK57MC.jpeg',
      'GGRrZLjhLkj6f1Xpdoz4J4rpDd.jpeg',
      'GGRrZLjhLkj6f1Xpdoz4J4tVdH.jpeg',
      'GGRrZLjhLkj6f1Xpdoz4J6LoVy.jpeg',
      'manifest'
    ]
  },
  dir: './sandbox/tests/site/home',
  file: 'home-test.js',
  contents: {
    name: 'home',
    path: '/index.html',
    actions: [
      {
        description: 'Scroll page to 500',
        type: 'scroll',
        target: 'html',
        scrollTop: '500'
      },
      {
        description: 'Scroll page to 1000',
        type: 'scroll',
        target: 'html',
        scrollTop: '1000'
      },
      {
        description: 'Scroll page to 1500',
        type: 'scroll',
        target: 'html',
        scrollTop: '1500',
        excludeDimensions: ['desktop']
      },
      {
        description: 'Scroll page to 2000',
        type: 'scroll',
        target: 'html',
        scrollTop: '2000',
        excludeDimensions: ['desktop']
      },
      {
        description: 'Click on the last article, confirm navigation',
        type: 'click',
        target: '.post-3 .more-link'
      },
      {
        description: 'Hover the home link - desktop res',
        type: 'hover',
        target: '.main-nav a[data-hover="Home"]',
        excludeDimensions: ['mobile'],
        delay: 600
      },
      {
        description: 'Click the home link - desktop res',
        type: 'click',
        target: '.main-nav a[data-hover="Home"]',
        excludeDimensions: ['mobile']
      },
      {
        description: 'Click the hamburger menu - mobile res',
        type: 'click',
        target: '.main-nav #trigger-overlay',
        excludeDimensions: ['desktop'],
        delay: 600
      },
      {
        description: 'Click the home link',
        type: 'click',
        target: '.overlay-hugeinc li:first-child a',
        excludeDimensions: ['desktop']
      }
    ]
  }
};
