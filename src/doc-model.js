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
      else {
        buildFromJQuery(html, window, callback);
      }
    }
  });
}

function fixRelativeLinks($, $root) {
  $('a', $root).each(function (index, a) {
    var $a = $(a);
    var href = $a.attr('href');
    if (href != null) {
      var absolute = href.indexOf('http://') === 0 || href.indexOf('https://') === 0;
      if (!absolute) {
        if (href.indexOf('/') !== 0) {
          href = '/doc/' + href;
        }
        href = 'https://npmjs.org' + href;
        $a.attr('href', href);
      }
    }
    console.log('Fixed href: ' + $a[0].outerHTML);
  });
}

function buildFromJQuery(htmlContent, window, callback) {
  var $ = window.$;
  var $body = $(window.document.body);
  var entryStorage = new EntryStorage();
  var $root = $body.children('div');
  fixRelativeLinks($, $root);
  var rootContent = $root[0].outerHTML;
  $root.children('h2').each(function() {
    var $h2 = $(this);
    var name = $h2.html();
    if (util.doesItLookLikePackageJsonEntry(name)) {
      var customLibraries = provideCustomLibraries(name);
      if (customLibraries != null) {
        customLibraries.forEach(function(entry) {
          entryStorage.addEntry(entry);
        });
      }
      else {
        var $end = $h2.next();
        while (!$end.is('h2')) {
          $end = $end.next();
        }
        var shortDescription = util.getShortDescription(name);
        var fullDescription = getTextBetween(rootContent, $h2, $end);
        var entry = new Entry(name, shortDescription, fullDescription);
        entryStorage.addEntry(entry);
      }
    }
  });
  var libs = addCustomEntries();
  libs.forEach(function(entry) {
    entryStorage.addEntry(entry);
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

function provideCustomLibraries(entryName) {
  if (entryName === 'people fields: author, contributors') {
    return [
      new Entry('author',
        util.getShortDescription('author'),
        '<p>The "author" is one person.  A "person"\n' +
        'is an object with a "name" field and optionally "url" and "email", like this:</p>\n' +
        '<pre><code>{ "name" : "Barney Rubble"\n' +
        ', "email" : "b@rubble.com"\n' +
        ', "url" : "http://barnyrubble.tumblr.com/"\n' +
        '}\n' +
        '</code></pre>\n' +
        '<p>Or you can shorten that all into a single string, and npm will parse it for you:</p>\n' +
        '<pre><code>"Barney Rubble &lt;b@rubble.com&gt; (http://barnyrubble.tumblr.com/)\n' +
        '</code></pre>\n' +
        '<p>Both email and url are optional either way.</p>\n' +
        '<p>npm also sets a top-level "maintainers" field with your npm user info.</p>\n'
      ),
      new Entry(
        'contributors',
        util.getShortDescription('contributors'),
        '<p>The "contributors" is an array of "person".  A "person"\n' +
        'is an object with a "name" field and optionally "url" and "email", like this:</p>\n' +
        '<pre><code>{ "name" : "Barney Rubble"\n' +
        ', "email" : "b@rubble.com"\n' +
        ', "url" : "http://barnyrubble.tumblr.com/"\n' +
        '}\n' +
        '</code></pre>\n' +
        '<p>Or you can shorten that all into a single string, and npm will parse it for you:</p>\n' +
        '<pre><code>"Barney Rubble &lt;b@rubble.com&gt; (http://barnyrubble.tumblr.com/)\n' +
        '</code></pre>\n' +
        '<p>Both email and url are optional either way.</p>\n' +
        '<p>npm also sets a top-level "maintainers" field with your npm user info.</p>\n'
      )
    ];
  }
  return null;
}

function addCustomEntries() {
  return [
    new Entry('licenses', util.getShortDescription('licenses'),
      '<p>You should specify a license for your package so that people know how they are\n' +
      'permitted to use it, and any restrictions you\'re placing on it.</p>\n' +
      '<p>It is more verbose plural form, then "license":</p>\n' +
      '<pre><code>"licenses" : [\n' +
      '{ "type" : "MyLicense"\n' +
      ', "url" : "http://github.com/owner/project/path/to/license"\n' +
      '}\n' +
    ']\n' +
    '</code></pre>\n' +
    '<p>It\'s also a good idea to include a license file at the top level in your package.</p>\n'
    )
  ];
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
function Entry(name, shortDescription, fullDescription) {
  this.name = name;
  this.shortDescription = shortDescription;
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

