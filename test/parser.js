
var DOM = require('../');
var fs = require('fs');
var path = require('path');
var test = require('tape');

test('replace document', function (t) {
  var src = readFile('./test/samp1.html');
  var document = new DOM.Document();

  document.documentElement.outerHTML = src;
  t.equal('' + document, src);

  var header = document.getElementById('header');
  var comment = header.firstChild;
  t.equal(comment.nodeType, 8);
  t.equal(comment.data, 'My favorite operators are > and <!');

  document.innerHTML = '<html></html>';
  t.equal('' + document, '<html></html>');

  document.innerHTML = src;
  t.equal('' + document, src);

  t.end();
});

test('atom', function (t) {
  var src = readFile('./test/atom.xml');
  var document = new DOM.Document();

  document.documentElement.outerHTML = src;

  t.equal(document.querySelectorAll('feed').length, 1);
  t.equal(document.querySelectorAll('feed>link').length, 2);
  t.equal(document.querySelectorAll('entry>link').length, 3);
  // t.equal("" + document, src)

  t.end();
});

/*
test("rdf", function (t) {
    var src = readFile("./test/rdf.xml")
    , document = new DOM.Document()

    document.innerHTML = src

    //t.equal(document.querySelectorAll("rdf\\:Description").length, 4)
    //t.equal("" + document, src)

    t.end()
})

test("rss", function (t) {
    var src = readFile("./test/rss.xml")
    , document = new DOM.Document()

    document.documentElement.outerHTML = src

    t.equal(document.documentElement.querySelectorAll("rss").length, 1)

    //t.equal("" + document, src)

    t.end()
})

*/

function readFile (fileName) {
  return fs.readFileSync(path.resolve(fileName.split('?')[0]), 'utf8').trim();
}
