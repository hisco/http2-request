# HTTP2 request

[![Greenkeeper badge](https://badges.greenkeeper.io/hisco/http2-request.svg)](https://greenkeeper.io/)

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]

Http2 Request is designed to be the simplest way possible to make http & http2 calls. It supports HTTP2 and follows redirects by default.

To be http2 compatible it uses [http2-client](https://www.npmjs.com/package/http2-client).
To make requests it uses [request](https://www.npmjs.com/package/request) - expect the API to be identical just with http2 support.

# API
The API is identical to that of request as this module just changes the http modules of request - you will actually be using request.
The only addition to the API is to disable this module behavior on request basis

```js
const request = require('h2-request');
request({
  uri : 'http://www.google.com',
  disableHttp2 : true // <-- Now it's a regular request without http2
}, function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
});
```

# Full API Documentation
To see the full API documentation:
[request Documentation](https://www.npmjs.com/package/request)

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/h2-request.svg
[npm-url]: https://npmjs.org/package/h2-request
[travis-image]: https://img.shields.io/travis/hisco/http2-request/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/hisco/http2-request
[snyk-image]: https://snyk.io/test/github/hisco/http2-request/badge.svg?targetFile=package.json
[snyk-url]: https://snyk.io/test/github/hisco/http2-request/badge.svg?targetFile=package.json