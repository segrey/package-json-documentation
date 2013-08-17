'use strict';

var fs = require('fs')
  , join = require('path').join
  , pathToPackageJsonDocHtml = join(__dirname, '../data/package-json-doc.html')
  , pathToCustomPackageJsonDocHtml = join(__dirname, '../data/custom-package-json-doc.html')
  ;


function savePackageJsonDocHtml(htmlContent) {
  var writeStream = fs.createWriteStream(
    pathToPackageJsonDocHtml,
    { flags: 'w' }
  );
  writeStream.end(htmlContent);
}

function loadPackageJsonDocHtml() {
  return fs.readFileSync(pathToPackageJsonDocHtml).toString();
}

function loadCustomPackageJsonDocHtml() {
  return fs.readFileSync(pathToCustomPackageJsonDocHtml).toString();
}

exports.getShortDescription = (function() {
  var shortDescriptions = {
    'name' : 'Name of package',
    'version' : 'Version of package',
    'description' : 'Description of package',
    'keywords' : 'Array of keyword strings',
    'homepage' : 'Url to the project homepage',
    'bugs' : 'Project\'s issue tracker and/or email address',
    'license' : 'License of project',
    'licenses' : 'Licenses of project',
    'author' : 'Author of package',
    'contributors' : 'Contributors of package',
    'files' : 'Files to include in project',
    'main' : 'Entry module to package',
    'bin' : 'Executable files to install into PATH',
    'man' : 'Documentation files for man',
    'directories' : 'Structure of package',
    'repository' : 'Repository of code',
    'scripts' : 'Commands to run at various times in the lifecycle of package',
    'config' : 'Configuration parameters',
    'dependencies' : 'Dependencies of package',
    'devDependencies' : 'Development dependencies of package',
    'bundledDependencies' : 'Dependencies bundled when publishing package',
    'optionalDependencies' : 'Options dependencies',
    'engines' : 'Compatible node and npm versions',
    'engineStrict' : 'Require compatible engines only',
    'os' : 'Compatible operating systems',
    'cpu' : 'Compatible CPU architectures',
    'preferGlobal' : 'true, if global installation is preferred',
    'private' : 'true, if package shouldn\'t be published',
    'publishConfig' : 'Set of config values to use at publish-time'
  };
  return function(name) {
    var res = shortDescriptions[name];
    if (res == null) {
      throw Error('No short description for ' + name);
    }
    return res;
  };
}());

exports.savePackageJsonDocHtml = savePackageJsonDocHtml;
exports.loadPackageJsonDocHtml = loadPackageJsonDocHtml;
exports.loadCustomPackageJsonDocHtml = loadCustomPackageJsonDocHtml;
