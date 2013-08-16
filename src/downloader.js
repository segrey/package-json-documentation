'use strict';
var util = require('./util'),
  request = require('request');

function downloadHtmlPage(callback) {
  var url = 'https://npmjs.org/doc/json.html';
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
//    util.savePackageJsonDocMarkDown(body);
//    generateHtmlFromMarkDownAndSave(body);
    util.savePackageJsonDocHtml(body);
  }
});

function generateHtmlFromMarkDownAndSave(markDownContent) {
  var md = require('node-markdown').Markdown;
  var html = md(markDownContent);
  html = '<html><body>' + html + '</body></html>';
}
