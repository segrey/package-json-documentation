'use strict';

var badNames = ['DESCRIPTION', 'DEFAULT VALUES', 'SEE ALSO', 'people fields: author, contributors'];

var entryNames = {
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
  'peerDependencies' : 'Peer dependencies of package',
  'bundledDependencies' : { shortDescription: 'Dependencies bundled when publishing package',
                            aliases: ['bundleDependencies']},
  'optionalDependencies' : 'Options dependencies',
  'engines' : 'Compatible node and npm versions',
  'engineStrict' : 'Require compatible engines only',
  'os' : 'Compatible operating systems',
  'cpu' : 'Compatible CPU architectures',
  'preferGlobal' : 'true, if global installation is preferred',
  'private' : 'true, if package shouldn\'t be published',
  'publishConfig' : 'Set of config values to use at publish-time'
};


function EntryStorage() {
  this.entryByName = {};
  this.entries = [];
}

EntryStorage.prototype.addEntry = function(entry) {
  this.entries.push(entry);
  if (this.entryByName[entry.name] != null) {
    throw Error('Duplicated entry ' + entry.name);
  }
  this.entryByName[entry.name] = entry;
};

EntryStorage.prototype.getEntryByName = function(entryName) {
  return this.entryByName[entryName];
};

/** @constructor */
function Entry(name, fullDescription) {
  this.name = name;
  var obj = entryNames[name];
  if (typeof obj === 'undefined') {
    throw Error('Unexpected entryName: ' + name);
  }
  if (typeof obj === 'object') {
    this.shortDescription = obj.shortDescription;
    this.aliases = obj.aliases;
  }
  else {
    this.shortDescription = obj.toString();
  }
  this.aliases = this.aliases || [];
  this.fullDescription = fullDescription;
}

function isBadPackageJsonName(entryName) {
  return badNames.indexOf(entryName) >= 0;
}

function getEntryNames() {
  return entryNames;
}

exports.Entry = Entry;
exports.EntryStorage = EntryStorage;
exports.isBadPackageJsonName = isBadPackageJsonName;
exports.getEntryNames = getEntryNames;
