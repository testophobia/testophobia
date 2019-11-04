module.exports = {
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
