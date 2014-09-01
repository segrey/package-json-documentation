'use strict';

var jsdom = require('jsdom')
  , util = require('./util')
  , fs = require('fs')
  , join = require('path').join
  , jquery = fs.readFileSync(join(__dirname, '../lib/jquery-1.9.1.js')).toString()
  , jade = require('jade')
  , entryModel = require('./entryModel')
  , Entry = entryModel.Entry
  , EntryStorage = entryModel.EntryStorage
    ;

function buildFromHtml(pathToHtmlFile, callback) {
  console.log('Processing ' + pathToHtmlFile + ' ...');
  var htmlContent = util.loadFileContentSync(pathToHtmlFile);
  jsdom.env({
    html: htmlContent,
    src: [jquery],
    done: function (errors, window) {
      if (errors) {
        throw errors;
      }
      buildFromJQuery(window, callback);
    }
  });
}

function buildFromJQuery(window, callback) {
  var $ = window.$;
  var $body = $(window.document.body);
  var $root = $body.children('div#wrapper');
  if ($root.length !== 1) {
    throw Error('Can not find \'div#wrapper\'');
  }
  fixRelativeLinks($, $root);
  var entryStorage = new EntryStorage();
  build($, $root, entryStorage);
  callback(entryStorage);
}

function fixRelativeLinks($, $root) {
  $('a', $root).each(function (index, a) {
    var $a = $(a);
    var initialHtml = $a[0].outerHTML;
    var href = $a.attr('href');
    if (href != null) {
      var absolute = href.indexOf('http://') === 0 || href.indexOf('https://') === 0;
      if (!absolute) {
        if (href.indexOf('/') !== 0) {
          href = '/doc/files/' + href;
        }
        href = 'https://npmjs.org' + href;
        $a.attr('href', href);
      }
    }
    console.log('Anchor fixed: ' + initialHtml + '  -->  ' + $a[0].outerHTML);
  });
}

function build($, $rootElement, entryStorage) {
  var html = $rootElement.html();
  $rootElement.children('h2').each(function() {
    var $h2 = $(this);
    var name = $h2.html();
    if (entryModel.isBadPackageJsonName(name)) {
      console.info('[WARN] Bad package.json entry: ' + name);
      return;
    }
    var $end = $h2.next();
    while (!$end.is('h2') && $end.length === 1) {
      $end = $end.next();
    }
    if ($end.length > 1) {
      throw Error();
    }
    var fullDescription = getTextBetween(html, $h2, $end);
    var entry = new Entry(name, '\n' + fullDescription.trim());
    entryStorage.addEntry(entry);
  });
}

function getTextBetween(htmlContent, $start, $end) {
  var startIndex = startIndexOf(htmlContent, $start);
  var endIndex = htmlContent.length;
  if ($end.length === 1) {
    endIndex = startIndexOf(htmlContent, $end);
  }
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


function merge(primary, secondary) {
  var merged = new EntryStorage();
  Object.keys(entryModel.getEntryNames()).forEach(function (entryName) {
    var primaryEntry = primary.getEntryByName(entryName);
    var secondaryEntry = secondary.getEntryByName(entryName);
    var resultEntry;
    if (primaryEntry) {
      resultEntry = primaryEntry;
      if (secondaryEntry) {
        throw Error('Merge conflict!');
      }
    }
    else if (secondaryEntry) {
      resultEntry = secondaryEntry;
    }
    if (resultEntry) {
      merged.addEntry(resultEntry);
    }
    else {
      merged.addEntry(new Entry(entryName, null));
    }
  });
  return merged;
}

buildFromHtml(util.getPathToPackageJsonDocHtmlFile(), function(mainEntryStorage) {
  buildFromHtml(util.getPathToCustomPackageJsonDocHtmlFile(), function(customEntryStorage) {
    var mergedEntryStorage = merge(mainEntryStorage, customEntryStorage);
    var jadePath = join(__dirname, 'toXml.jade');
    var jadeContent = fs.readFileSync(jadePath).toString();
    var fn = jade.compile(jadeContent, {pretty: true});
    var xml = fn({entries: mergedEntryStorage.entries});
    var outputStream = fs.createWriteStream(join(__dirname, '../data/package-json-documentation.xml'));
    outputStream.end(xml);
    outputStream.destroy();
  });
});
