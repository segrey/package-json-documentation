'use strict';
var util = require('./util'),
  request = require('request');

function downloadHtmlPage(callback) {
  var url = 'https://www.npmjs.org/doc/files/package.json.html';
  request({ uri: url }, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      callback('Error when contacting ' + url, null);
    }
    else {
      callback(null, body);
    }
  });
}

downloadHtmlPage(function(error, body) {
  if (body !== null) {
    util.savePackageJsonDocHtml(body);
  }
});
