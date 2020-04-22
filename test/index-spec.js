var undef;
var test = require('tape');
var DOM = require('../');
var document = DOM.document;

test('document is a Document', function (t) {
  t.equal(typeof document.createTextNode, 'function');
  t.equal(typeof document.createElement, 'function');
  t.equal(typeof document.createDocumentFragment, 'function');

  t.end();
});

test('can create nodes', function (t) {
  var el;

  el = document.createElement('h1');
  t.equal(el.nodeType, 1);
  t.equal(el.nodeName, 'H1');
  t.equal(el.nodeValue, null);
  t.equal((el.nodeValue = 'value'), 'value');
  t.equal(el.nodeValue, null);
  t.equal(el.textContent, '');

  el = document.createDocumentFragment();
  t.equal(el.nodeType, 11);
  t.equal(el.nodeName, '#document-fragment');
  t.equal(el.nodeValue, null);
  t.equal((el.nodeValue = 'value'), 'value');
  t.equal(el.nodeValue, null);
  t.equal(el.textContent, '');

  el = document.createTextNode('hello');
  t.equal(el.nodeType, 3);
  t.equal(el.nodeName, '#text');
  t.equal(el.data, 'hello');
  t.equal(el.nodeValue, 'hello');
  t.equal(el.textContent, 'hello');
  t.equal((el.data = 'world'), 'world');
  t.equal(el.data, 'world');
  t.equal(el.nodeValue, 'world');
  t.equal(el.textContent, 'world');
  t.equal((el.nodeValue = 'foo'), 'foo');
  t.equal(el.data, 'foo');
  t.equal(el.nodeValue, 'foo');
  t.equal(el.textContent, 'foo');
  t.equal((el.textContent = 'bar'), 'bar');
  t.equal(el.data, 'bar');
  t.equal(el.nodeValue, 'bar');
  t.equal(el.textContent, 'bar');

  el = document.createTextNode(null);
  t.equal('' + el, 'null');

  el = document.createTextNode(undef);
  t.equal('' + el, 'undefined');

  el = document.createTextNode(123);
  t.equal('' + el, '123');

  el = document.createComment('hello comment');
  t.equal(el.nodeType, 8);
  t.equal(el.nodeName, '#comment');
  t.equal(el.data, 'hello comment');
  t.equal(el.nodeValue, 'hello comment');
  t.equal(el.outerHTML, '<!--hello comment-->');
  t.equal((el.nodeValue = 'value'), 'value');
  t.equal(el.data, 'value');
  t.equal(el.nodeValue, 'value');
  t.equal(el.outerHTML, '<!--value-->');

  t.end();
});

test('can create elements with namespace', function (t) {
  var el = document.createElementNS(null, 'clipPath');
  t.equal('' + el, '<clipPath></clipPath>');

  t.end();
});

test('can set style parameters', function (t) {
  var el = document.createElement('div');

  t.equal(el.hasAttribute('style'), false);
  t.equal(el.hasAttribute('Style'), false);

  el.style = 'top: 1px; background-color: red; float: right';
  t.equal(el.hasAttribute('style'), true);
  t.equal(el.hasAttribute('Style'), true);
  t.equal(el.style.top, '1px');
  t.equal(el.style.cssFloat, 'right');
  t.equal(el.style.backgroundColor, 'red');

  el.style.backgroundColor = 'blue';
  el.style.cssFloat = 'left';

  t.equal(el.style.top, '1px');
  t.equal(el.style.backgroundColor, 'blue');
  t.equal(el.style + '', 'top: 1px; background-color: blue; float: left');
  t.end();
});

test('can clone HTMLElements', function (t) {
  var el = document.createElement('a');

  function testAttr (name, value, propName) {
    el[propName || name] = value;
    t.equal(el.getAttribute(name), value);
    t.equal('' + el[propName || name], value);

    el.setAttribute(name, 'val-' + value);
    t.equal(el.getAttribute(name), 'val-' + value);
    t.equal('' + el[propName || name], 'val-' + value);

    el.removeAttribute(name);
    t.equal(!!el.getAttribute(name), false);
    value = el[propName || name];
    t.equal(!!(value && ('' + value)), false);
  }

  testAttr('id', '123');
  testAttr('class', 'my-class', 'className');
  testAttr('for', 'my-field', 'htmlFor');
  testAttr('style', 'top: 1px');
  testAttr('title', 'Header');
  testAttr('href', '#123');
  testAttr('href', 'http://example.com');

  var clone, deepClone;

  el = document.createElement('h1');
  el.appendChild(document.createElement('img'));
  el.id = 1;
  el.style.top = '5px';
  clone = el.cloneNode();
  deepClone = el.cloneNode(true);

  t.notStrictEqual(el, clone);
  t.notStrictEqual(el.style, clone.style);
  t.notStrictEqual(el.childNodes, clone.childNodes);

  t.equal(el.nodeName, 'H1');
  t.equal(el.tagName, 'H1');
  t.equal(el.localName, 'h1');
  t.equal(el.id, 1);
  t.equal(el.style.top, '5px');
  t.equal(clone.nodeName, 'H1');
  t.equal(clone.tagName, 'H1');
  t.equal(clone.localName, 'h1');
  t.equal(clone.id, 1);
  t.equal(clone.style.top, '5px');
  t.strictEqual(el.ownerDocument, clone.ownerDocument);
  t.strictEqual(el.ownerDocument, deepClone.ownerDocument);

  t.equal(deepClone.outerHTML, '<h1 id="1" style="top: 5px"><img></h1>');

  clone.id = 2;
  t.equal(el.id, 1);
  t.equal(clone.id, 2);

  t.end();
});

test('can clone Text', function (t) {
  var el, clone;

  el = document.createTextNode('hello world');
  clone = el.cloneNode();

  t.notStrictEqual(el, clone);
  t.equal('' + el, '' + clone);

  t.end();
});

test('can do stuff', function (t) {
  var div = document.createElement('div');
  div.className = 'foo bar';

  var span = document.createElement('span');
  div.appendChild(span);
  span.textContent = 'Hello!';

  var html = String(div);

  t.equal(html, '<div class="foo bar">' +
        '<span>Hello!</span></div>');

  t.equal(div.outerHTML, '<div class="foo bar">' +
        '<span>Hello!</span></div>');

  t.equal(div.innerHTML, '<span>Hello!</span>');

  var str = '<div><span id="1">Hello</span> <span>World!</span></div>';

  div.innerHTML = str;
  t.equal(div.innerHTML, str);
  t.equal(div.firstChild.tagName, 'DIV');
  t.equal(div.firstChild.firstChild.tagName, 'SPAN');

  t.equal(div.querySelectorAll('span').length, 2);

  t.end();
});

function testNode (t, mask, node) {
  var p = document.createElement('p');
  var h1 = document.createElement('h1');
  var h2 = document.createElement('h2');

  h1.textContent = 'Head';

  t.equal(node.appendChild(h2), h2);
  t.equal('' + node, mask.replace('%s', '<h2></h2>'));

  t.equal(node.insertBefore(h1, h2), h1);
  t.equal('' + node, mask.replace('%s', '<h1>Head</h1><h2></h2>'));

  t.equal(node.appendChild(h1), h1);
  t.equal('' + node, mask.replace('%s', '<h2></h2><h1>Head</h1>'));

  t.equal(node.removeChild(h1), h1);
  t.equal('' + node, mask.replace('%s', '<h2></h2>'));

  t.throws(function () {
    node.removeChild(h1);
  });

  t.equal(node.replaceChild(h1, h2), h2);
  t.equal('' + node, mask.replace('%s', '<h1>Head</h1>'));

  t.equal(node.appendChild(h2), h2);
  t.equal(node.firstChild, h1);
  t.equal(node.lastChild, h2);
  t.equal(h1.previousSibling, null);
  t.equal(h1.nextSibling, h2);
  t.equal(h2.previousSibling, h1);
  t.equal(h2.nextSibling, null);
  p.appendChild(node);
  t.equal('' + p, '<p>' + mask.replace('%s', '<h1>Head</h1><h2></h2>') + '</p>');

  t.equal(p.textContent, 'Head');
  p.textContent = 'Hello';
  t.equal('' + p, '<p>Hello</p>');

  p.removeChild(p.firstChild);
  t.equal(p.firstChild, null);
  t.equal(p.lastChild, null);
}

test('HTMLElement', function (t) {
  testNode(t, '<body>%s</body>', document.body);

  t.end();
});

test('HTMLElement.attributes', function (t) {
  var h1 = document.createElement('h1');
  h1.id = '123';
  h1.setAttribute('id2', '321');
  t.equal(h1.hasAttribute('id'), true);
  t.equal(h1.hasAttribute('ID'), true);
  t.equal(h1.hasAttribute('id2'), true);
  t.equal(h1.hasAttribute('Id2'), true);
  t.equal(h1.getAttribute('id'), '123');
  t.equal(h1.getAttribute('id2'), '321');
  t.equal(h1.getAttribute('ID'), '123');
  t.equal(h1.getAttribute('ID2'), '321');

  h1.removeAttribute('id2');
  t.equal(h1.getAttribute('id'), '123');
  t.equal(h1.getAttribute('id2'), null);
  t.equal(h1.attributes.length, 1);
  t.equal(h1.attributes[0].name, 'id');
  t.equal(h1.attributes[0].value, '123');

  t.equal(h1.getAttribute('toString'), null);
  t.equal('' + h1, '<h1 id="123"></h1>');

  h1.className = 'my-class';
  t.equal('' + h1, '<h1 id="123" class="my-class"></h1>');
  t.equal(h1.attributes.length, 2);
  t.equal(h1.attributes[1].name, 'class');
  t.equal(h1.attributes[1].value, 'my-class');

  h1.style.top = '5px';
  h1.style.left = '15px';
  t.equal('' + h1, '<h1 id="123" class="my-class" style="top: 5px; left: 15px"></h1>');
  t.equal(h1.attributes.length, 3);
  t.equal(h1.attributes[2].name, 'style');
  t.equal(h1.attributes[2].value, 'top: 5px; left: 15px');

  h1.attributes[2].value = 'top: 15px;';
  t.equal(h1.attributes[2].value, 'top: 15px');

  h1.removeAttribute('style');
  h1.removeAttribute('class');
  h1.removeAttribute('id');
  h1.setAttribute('getAttribute', 'Get me');
  t.equal(h1.getAttribute('GetAttribute'), 'Get me');
  h1.setAttribute('no-value', '');
  h1.setAttribute('constructor', 'not the constructor');
  t.equal(h1.toString(), '<h1 getattribute="Get me" no-value="" constructor="not the constructor"></h1>');
  t.equal(h1.getAttribute('no-value'), '');
  h1.removeAttribute('no-value');
  h1.removeAttribute('constructor');
  h1.removeAttribute('getAttribute');
  t.equal(h1.getAttribute('no-value'), null);
  t.equal(h1.constructor, Object.getPrototypeOf(h1).constructor);
  t.equal(h1.toString(), '<h1></h1>');

  t.end();
});

test('documentFragment', function (t) {
  var frag = document.createDocumentFragment();

  testNode(t, '%s', frag);

  t.end();
});
