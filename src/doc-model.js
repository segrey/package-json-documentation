'use strict';

var jsdom = require('jsdom')
  , util = require('./util')
  , fs = require('fs')
  , join = require('path').join
  , jquery = fs.readFileSync(join(__dirname, '../lib/jquery-1.9.1.js')).toString()
  , jade = require('jade')
    ;

function buildFromHtml(html, callback) {
  jsdom.env({
    html: html,
    src: [jquery],
    done: function (errors, window) {
      if (errors) {
        callback(errors);
      }
      buildFromJQuery(html, window, callback);
    }
  });
}

function buildFromJQuery(htmlContent, window, callback) {
  var $ = window.$;
  var $body = $(window.document.body);
  var entryStorage = new EntryStorage();
  $body.children('h2').each(function() {
    var $h2 = $(this);
    var name = $h2.html();
    if (util.doesItLookLikePackageJsonEntry(name)) {
      var $end = $h2.next();
      while (!$end.is('h2')) {
        $end = $end.next();
      }
      var fullDescription = getTextBetween(htmlContent, $h2, $end);
      var entry = new Entry(name, fullDescription);
      entryStorage.addEntry(entry);
    }
  });
  callback(null, entryStorage);
}

function getTextBetween(htmlContent, $start, $end) {
  var startIndex = startIndexOf(htmlContent, $start);
  var endIndex = startIndexOf(htmlContent, $end);
  if (startIndex >= endIndex) {
    throw Error('Something wrong');
  }
  startIndex += $start[0].outerHTML.length;
  return htmlContent.substring(startIndex, endIndex);
}

function startIndexOf(htmlContent, $obj) {
  var tag = $obj[0].outerHTML;
  var startInd = htmlContent.indexOf(tag);
  if (startInd === -1) {
    throw Error('element "' + tag + '" not found');
  }
  if (htmlContent.indexOf(tag, startInd + 1) !== -1) {
    throw Error('Duplicated element "' + tag + '"');
  }
  return startInd;
}

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

/** @constructor */
function Entry(name, fullDescription) {
  this.name = name;
  this.fullDescription = fullDescription;
}


buildFromHtml(util.readPackageJsonDocHtmlFileContent(), function(error, entryStorage) {
  if (entryStorage != null) {
    var jadePath = join(__dirname, 'toXml.jade');
    var jadeContent = fs.readFileSync(jadePath).toString();
    var fn = jade.compile(jadeContent, {pretty: true});
    var xml = fn({entries: entryStorage.entries});
    var outputStream = fs.createWriteStream(join(__dirname, '../data/package-json-documentation.xml'));
    outputStream.end(xml);
    outputStream.destroy();
  }
});

