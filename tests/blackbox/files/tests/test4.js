module.exports = {
  testName: 'test4',
  goldens: {
    desktop: [
      '2puPvLSni6qqQvX32EAUh1kzcXmrcpoBeiD5N2E8aA6iUvpyQzHcznRqSh6prd7UxMdTf1qNQSCeD.jpeg',
      '2wfVe9DjWw72gBKzQJsvj.jpeg',
      '4Tc5tHFf96q46SVjWdvi5Ltby.jpeg',
      '59U4TdWJX3mZKNd2kXEABSNk3GQr1.jpeg',
      '6SHyPF2gH3TimaDSMtNixiyh7Ln1mSdFzumZ2vSqCDEyiFHqLhvqKbPWUy73raGuTBSzSy3a3j.jpeg',
      '9nLGvMUKhvYNzLezgt.jpeg',
      'QYz6bUdAb83oRqRDreu5EZCWX38TtGdS9z5eDHTmNV3EpwFJKxyXCgg4X8JG.jpeg',
      'QzdusAvQMorwMjbtwBktCxHE2zHgPA73CbuePUu1iV2hK2TLim3eDm8f9UwAEBkt4Gnz54MCzTs.jpeg',
      'QzdusAvQMorwMjbtwBktCxHE2zHgPA73CbuePUu1iV2hK6FfQFYqCvPqHrQWs5b4MibajYEZwaq.jpeg',
      'SXULHpHtBu7ixMqwEVA.jpeg',
      'eqsCLeaWTF2jEAbSZEqqWdA.jpeg',
      'eqsCLeaWTF2jEC36kWP7YZh.jpeg',
      'manifest'
    ],
    mobile: [
      '2puPvLSni6qqQvX32EAUh1kzcXmrcpoBeiD5N2E8aA6iUvpyQzHcznRqSh6prd7UxMdTf1qNQSCeD.jpeg',
      '2wfVe9DjWw72gBKzQJsvj.jpeg',
      '59U4TdWJX3mZKNd2kXEABSNk3GQr1.jpeg',
      '6SHyPF2gH3TimaDSMtNixiyh7Ln1mSdFzumZ2vSqCDEyiFHqLhvqKbPWUy73raGuTBSzSy3a3j.jpeg',
      '9nLGvMUKhvYNzLezgt.jpeg',
      'QzdusAvQMorwMjbtwBktCxHE2zHgPA73CbuePUu1iV2hK2TLim3eDm8f9UwAEBkt4Gnz54MCzTs.jpeg',
      'QzdusAvQMorwMjbtwBktCxHE2zHgPA73CbuePUu1iV2hK6FfQFYqCvPqHrQWs5b4MibajYEZwaq.jpeg',
      'SXULHpHtBu7ixMqwEVA.jpeg',
      'eqsCLeaWTF2jEAbSZEqqWdA.jpeg',
      'eqsCLeaWTF2jEC36kWP7YZh.jpeg',
      'manifest'
    ]
  },
  dir: './sandbox/tests/site/contact',
  file: 'contact-test.js',
  contents: {
    name: 'contact',
    path: '/contact.html',
    actions: [
      {
        description: 'Scroll page to 500',
        type: 'scroll',
        target: 'html',
        scrollTop: '500',
        excludeDimensions: ['mobile']
      },
      {
        description: 'Hover the send button to see the hover state',
        type: 'hover',
        target: '.contact-form .btn-send',
        delay: 400,
        excludeDimensions: ['mobile']
      },
      {
        description: 'Click the send button to see the first validation error',
        type: 'click',
        target: '.contact-form .btn-send',
        delay: 400
      },
      {
        description: 'Enter the name',
        type: 'input',
        target: '.contact-form input[name="name"]',
        value: 'Testy Phobia'
      },
      {
        description: 'Click the send button to see the second validation error',
        type: 'click',
        target: '.contact-form .btn-send',
        delay: 400
      },
      {
        description: 'Enter the email',
        type: 'input',
        target: '.contact-form input[name="email"]',
        value: 'testy@phobia'
      },
      {
        description: 'Click the send button to see the third validation error',
        type: 'click',
        target: '.contact-form .btn-send',
        delay: 400
      },
      {
        description: 'Enter the subject',
        type: 'input',
        target: '.contact-form input[name="subject"]',
        value: 'This is the subject of the request.'
      },
      {
        description: 'Click the send button to see the last validation error',
        type: 'click',
        target: '.contact-form .btn-send',
        delay: 400
      },
      {
        description: 'Enter the Message',
        type: 'input',
        target: '.contact-form textarea[name="message"]',
        value: 'This is the main body of the request.'
      },
      {
        description: 'Click the send button',
        type: 'click',
        target: '.contact-form .btn-send',
        delay: 400
      }
    ]
  }
};
