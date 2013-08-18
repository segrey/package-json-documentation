'use strict';

var fs = require('fs')
  , join = require('path').join
  , pathToPackageJsonDocHtmlFile = join(__dirname, '../data/package-json-doc.html')
  , pathToCustomPackageJsonDocHtmlFile = join(__dirname, '../data/custom-package-json-doc.html')
  ;


function savePackageJsonDocHtml(htmlContent) {
  var writeStream = fs.createWriteStream(
    pathToPackageJsonDocHtmlFile,
    { flags: 'w' }
  );
  writeStream.end(htmlContent);
}

function loadFileContentSync(pathToFile) {
  return fs.readFileSync(pathToFile).toString();
}

function getPathToPackageJsonDocHtmlFile() {
  return pathToPackageJsonDocHtmlFile;
}

function getPathToCustomPackageJsonDocHtmlFile() {
  return pathToCustomPackageJsonDocHtmlFile;
}

exports.savePackageJsonDocHtml = savePackageJsonDocHtml;
exports.loadFileContentSync = loadFileContentSync;
exports.getPathToPackageJsonDocHtmlFile = getPathToPackageJsonDocHtmlFile;
exports.getPathToCustomPackageJsonDocHtmlFile = getPathToCustomPackageJsonDocHtmlFile;
