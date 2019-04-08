export default {
  "name": "contact",
  "path": "/testophobia/examples/black-and-white/contact.html",
  "actions": [
    {
      "description": "Scroll page to 500",
      "type": "scroll",
      "target": "html",
      "scrollTop": "500",
      "excludeDimensions": ["mobile"]
    },
    {
      "description": "Hover the send button to see the hover state",
      "type": "hover",
      "target": ".contact-form .btn-send",
      "delay": 400,
      "excludeDimensions": ["mobile"]
    },
    {
      "description": "Click the send button to see the first validation error",
      "type": "click",
      "target": ".contact-form .btn-send",
      "delay": 400
    },
    {
      "description": "Enter the name",
      "type": "input",
      "target": ".contact-form input[name=\"name\"]",
      "value": "Testy Phobia"
    },
    {
      "description": "Click the send button to see the second validation error",
      "type": "click",
      "target": ".contact-form .btn-send",
      "delay": 400
    },
    {
      "description": "Enter the email",
      "type": "input",
      "target": ".contact-form input[name=\"email\"]",
      "value": "testy@phobia"
    },
    {
      "description": "Click the send button to see the third validation error",
      "type": "click",
      "target": ".contact-form .btn-send",
      "delay": 400
    },
    {
      "description": "Enter the subject",
      "type": "input",
      "target": ".contact-form input[name=\"subject\"]",
      "value": "This is the subject of the request."
    },
    {
      "description": "Click the send button to see the last validation error",
      "type": "click",
      "target": ".contact-form .btn-send",
      "delay": 400
    },
    {
      "description": "Enter the Message",
      "type": "input",
      "target": ".contact-form textarea[name=\"message\"]",
      "value": "This is the main body of the request."
    },
    {
      "description": "Click the send button",
      "type": "click",
      "target": ".contact-form .btn-send",
      "delay": 400
    }
  ]
};