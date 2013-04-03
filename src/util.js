'use strict';

var fs = require('fs'),
    join = require('path').join,
    pathToPackageJsonDocMarkDown = join(__dirname, '../data/package-json-doc.md'),
    pathToPackageJsonDocHtml = join(__dirname, '../data/package-json-doc.html')
  ;

exports.savePackageJsonDocMarkDown = function(content) {
    var writeStream = fs.createWriteStream(
        pathToPackageJsonDocMarkDown,
        { flags: 'w' }
    );
    writeStream.end(content);
};

exports.readPackageJsonDocMarkDownFileContent = function() {
  return fs.readFileSync(pathToPackageJsonDocMarkDown).toString();
};


exports.savePackageJsonDocHtml = function(htmlContent) {
    var writeStream = fs.createWriteStream(
        pathToPackageJsonDocHtml,
        { flags: 'w' }
    );
    writeStream.end(htmlContent);
};

exports.readPackageJsonDocHtmlFileContent = function() {
  return fs.readFileSync(pathToPackageJsonDocHtml).toString();
};

exports.doesItLookLikePackageJsonEntry = (function() {
  var badNames = ['DESCRIPTION', 'DEFAULT VALUES', 'SEE ALSO'];
  return function(entryName) {
    return badNames.indexOf(entryName) === -1;
  };
})();
