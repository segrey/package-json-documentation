'use strict';

var badNames = ['DESCRIPTION', 'DEFAULT VALUES', 'SEE ALSO', 'people fields: author, contributors'];

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

EntryStorage.prototype.contains = function(entryName) {
  return !!this.entryByName[entryName];
};

/** @constructor */
function Entry(name, shortDescription, fullDescription) {
  this.name = name;
  this.shortDescription = shortDescription;
  this.fullDescription = fullDescription;
}

function isBadPackageJsonName(entryName) {
  return badNames.indexOf(entryName) >= 0;
}

exports.Entry = Entry;
exports.EntryStorage = EntryStorage;
exports.isBadPackageJsonName = isBadPackageJsonName;
