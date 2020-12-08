var eventNames = require('./eventNames');

// Void elements: http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
var voidElements = {
  AREA: 1,
  BASE: 1,
  BR: 1,
  COL: 1,
  EMBED: 1,
  HR: 1,
  IMG: 1,
  INPUT: 1,
  KEYGEN: 1,
  LINK: 1,
  MENUITEM: 1,
  META: 1,
  PARAM: 1,
  SOURCE: 1,
  TRACK: 1,
  WBR: 1
};
var hasOwn = Object.prototype.hasOwnProperty;
function buildQuery (query) {
  return Array.isArray(query) ? query.join(',') : query;
}
var selector = require('selector-lite');
var elementGetters = {
  getElementById: function (id) {
    return selector.find(this, '#' + id, 1);
  },
  getElementsByTagName: function (tag) {
    return selector.find(this, tag);
  },
  getElementsByClassName: function (query) {
    return selector.find(this, '.' + buildQuery(query).replace(/\s+/g, '.'));
  },
  querySelector: function (query) {
    return selector.find(this, query, 1);
  },
  querySelectorAll: function (query) {
    return selector.find(this, buildQuery(query));
  }
};

var VALUE = Symbol('value');
var EVENTS = Symbol('events');

function emit (target, eventName) {
  target[EVENTS] && target[EVENTS][eventName] && target[EVENTS][eventName].map(function (handler) {
    handler({ target: target });
  }, target);
}

function Node () {
  throw new Error('Illegal constructor');
}

Node.prototype = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  nodeName: null,
  parentNode: null,
  ownerDocument: null,
  childNodes: null,
  get nodeValue () {
    return this.nodeType === 3 || this.nodeType === 8 ? this.data : null;
  },
  set nodeValue (text) {
    return this.nodeType === 3 || this.nodeType === 8 ? (this.data = text) : null;
  },
  get textContent () {
    return this.hasChildNodes() ? this.childNodes.map(function (child) {
      return child[child.nodeType === 3 ? 'data' : 'textContent'];
    }).join('') : this.nodeType === 3 ? this.data : '';
  },
  set textContent (text) {
    if (this.nodeType === 3) return (this.data = text);
    for (var node = this; node.firstChild;) node.removeChild(node.firstChild);
    node.appendChild(node.ownerDocument.createTextNode(text));
  },
  get firstChild () {
    if (!this.childNodes) {
      return null;
    }

    return this.childNodes[0] || null;
  },
  get lastChild () {
    return this.childNodes[this.childNodes.length - 1] || null;
  },
  get previousSibling () {
    return getSibling(this, -1) || null;
  },
  get nextSibling () {
    return getSibling(this, 1) || null;
  },
  // innerHTML and outerHTML should be extensions to the Element interface
  get innerHTML () {
    return Node.prototype.toString.call(this);
  },
  set innerHTML (html) {
    var match; var child
        ; var node = this
        ; var doc = node.ownerDocument || node
        ; var tagRe = /<(!--([\s\S]*?)--|!\[[\s\S]*?\]|[?!][\s\S]*?)>|<(\/?)([^ />]+)([^>]*?)(\/?)>|[^<]+/mg
        ; var attrRe = /([^= ]+)\s*=\s*(?:("|')((?:\\?.)*?)\2|(\S+))/g;

    for (; node.firstChild;) node.removeChild(node.firstChild);

    for (; (match = tagRe.exec(html));) {
      if (match[3]) {
        node = node.parentNode;
      } else if (match[4]) {
        child = doc.createElement(match[4]);
        if (match[5]) {
          match[5].replace(attrRe, setAttr);
        }
        node.appendChild(child);
        if (!voidElements[child.tagName] && !match[6]) node = child;
      } else if (match[2]) {
        node.appendChild(doc.createComment(htmlUnescape(match[2])));
      } else if (match[1]) {
        node.appendChild(doc.createDocumentType(match[1]));
      } else {
        node.appendChild(doc.createTextNode(htmlUnescape(match[0])));
      }
    }

    return html;

    function setAttr (_, name, q, a, b) {
      child.setAttribute(name, htmlUnescape(a || b || ''));
    }
  },
  get outerHTML () {
    return this.toString();
  },
  set outerHTML (html) {
    var frag = this.ownerDocument.createDocumentFragment();
    frag.innerHTML = html;
    this.parentNode.replaceChild(frag, this);
    return html;
  },
  get htmlFor () {
    return this.for;
  },
  set htmlFor (value) {
    this.for = value;
  },
  get className () {
    return this.class || '';
  },
  set className (value) {
    this.class = value;
  },
  get style () {
    return this.styleMap || (this.styleMap = new StyleMap());
  },
  set style (value) {
    this.styleMap = new StyleMap(value);
  },
  get value () {
    return this[VALUE] || '';
  },
  set value (value) {
    this[VALUE] = value == null ? '' : String(value);
  },
  contains: function (targetNode) {
    return this.childNodes && this.childNodes.find(childNode =>
      childNode === targetNode || childNode.contains(targetNode)
    );
  },
  hasChildNodes: function () {
    return this.childNodes && this.childNodes.length > 0;
  },
  appendChild: function (el) {
    return this.insertBefore(el);
  },
  insertBefore: function (el, ref) {
    var node = this;
    var childs = node.childNodes;

    if (el.nodeType === 11) {
      while (el.firstChild) node.insertBefore(el.firstChild, ref);
    } else {
      if (el.parentNode) el.parentNode.removeChild(el);
      el.parentNode = node;

      // If ref is null, insert el at the end of the list of children.
      childs.splice(ref ? childs.indexOf(ref) : childs.length, 0, el);
      // TODO:2015-07-24:lauri:update document.body and document.documentElement
    }
    return el;
  },
  removeChild: function (el) {
    var node = this;
    var index = node.childNodes.indexOf(el);
    if (index === -1) throw new Error('NOT_FOUND_ERR');

    node.childNodes.splice(index, 1);
    el.parentNode = null;
    return el;
  },
  replaceChild: function (el, ref) {
    this.insertBefore(el, ref);
    return this.removeChild(ref);
  },
  remove: function () {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  },
  addEventListener: function (eventName, handler) {
    this[EVENTS] = this[EVENTS] || {};
    this[EVENTS][eventName] = this[EVENTS][eventName] || [];
    this[EVENTS][eventName].push(handler);
  },
  removeEventListener: function (eventName, handler) {
    this[EVENTS] && this[EVENTS][eventName] && this[EVENTS][eventName].splice(
      this[EVENTS][eventName].indexOf(handler), 1
    );
  },
  click: function () {
    emit(this, 'click');
  },
  cloneNode: function (deep) {
    var key;
    var node = this;
    var clone = new node.constructor(node.tagName || node.data);
    clone.ownerDocument = node.ownerDocument;

    if (node.hasAttribute) {
      for (key in node) {
        if (node.hasAttribute(key)) {
          clone[key] = node[key].valueOf();
        }
      }
    }

    if (deep && node.hasChildNodes()) {
      node.childNodes.forEach(function (child) {
        clone.appendChild(child.cloneNode(deep));
      });
    }
    return clone;
  },
  toString: function () {
    return this.hasChildNodes() ? this.childNodes.reduce(function (memo, node) {
      return memo + node;
    }, '') : '';
  }
};

eventNames.map(function (eventName) {
  Node.prototype[eventName] = undefined;
});

function extendNode (obj, extras) {
  obj.prototype = Object.create(Node.prototype);
  for (var descriptor, key, i = 1; (extras = arguments[i++]);) {
    for (key in extras) {
      descriptor = Object.getOwnPropertyDescriptor(extras, key);
      Object.defineProperty(obj.prototype, key, descriptor);
    }
  }
  obj.prototype.constructor = obj;
}

function camelCase (str) {
  return str.replace(/[ _-]+([a-z])/g, function (_, a) { return a.toUpperCase(); });
}

function hyphenCase (str) {
  return str.replace(/[A-Z]/g, '-$&').toLowerCase();
}

function htmlEscape (str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function htmlUnescape (str) {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

function StyleMap (style) {
  var styleMap = this;
  if (style) {
    style.split(/\s*;\s*/g).map(function (val) {
      val = val.split(/\s*:\s*/);
      if (val[1]) styleMap[val[0] === 'float' ? 'cssFloat' : camelCase(val[0])] = val[1];
    });
  }

  function toPrimitive () {
    return Object.keys(this).map(key => [hyphenCase(key === 'cssFloat' ? 'float' : key), this[key]].join(': ')).join('; ');
  }

  var proxy = new Proxy(this, {
    get: (target, key) => {
      if (key === Symbol.toPrimitive || key === 'valueOf' || key === 'toString') {
        return toPrimitive.bind(target);
      }

      return target[key] || '';
    },
    set: (target, key, value) => {
      target[key] = String(value);
    }
  });

  return proxy;
}

function getSibling (node, step) {
  var silbings = node.parentNode && node.parentNode.childNodes;
  var index = silbings && silbings.indexOf(node);

  return silbings[index + step] || null;
}

function DocumentFragment () {
  this.childNodes = [];
}

extendNode(DocumentFragment, {
  nodeType: 11,
  nodeName: '#document-fragment'
});

function Attr (node, name) {
  this.ownerElement = node;
  this.name = name.toLowerCase();
}

Attr.prototype = {
  get value () { return this.ownerElement.getAttribute(this.name); },
  set value (val) { this.ownerElement.setAttribute(this.name, val); },
  toString: function () {
    return this.name + '="' + htmlEscape(this.value) + '"';
  }
};

function escapeAttributeName (name) {
  name = name.toLowerCase();
  if (name === 'constructor' || name === 'attributes') return name.toUpperCase();
  return name;
}

function Element (tag) {
  var element = this;
  element.nodeName = element.tagName = tag.toUpperCase();
  element.localName = tag.toLowerCase();
  element.childNodes = [];
}
HTMLElement.prototype = Object.create(Node.prototype);
HTMLElement.prototype.constructor = HTMLElement;

extendNode(Element, elementGetters, {
  get attributes () {
    var key;
    var attrs = [];
    var element = this;
    for (key in element) {
      if (key === escapeAttributeName(key) && element.hasAttribute(key)) { attrs.push(new Attr(element, escapeAttributeName(key))); }
    }
    return attrs;
  },
  matches: function (sel) {
    return selector.matches(this, sel);
  },
  closest: function (sel) {
    return selector.closest(this, sel);
  },
  namespaceURI: 'http://www.w3.org/1999/xhtml',
  nodeType: 1,
  localName: null,
  tagName: null,
  styleMap: null,
  hasAttribute: function (name) {
    name = escapeAttributeName(name);
    return name !== 'style' ? hasOwn.call(this, name)
      : !!(this.styleMap && Object.keys(this.styleMap).length);
  },
  getAttribute: function (name) {
    name = escapeAttributeName(name);
    return this.hasAttribute(name) ? '' + this[name] : null;
  },
  setAttribute: function (name, value) {
    this[escapeAttributeName(name)] = '' + value;
  },
  removeAttribute: function (name) {
    name = escapeAttributeName(name);
    this[name] = '';
    delete this[name];
  },
  toString: function () {
    var attrs = this.attributes.join(' ');
    return '<' + this.localName + (attrs ? ' ' + attrs : '') + '>' +
        (voidElements[this.tagName] ? '' : this.innerHTML + '</' + this.localName + '>');
  }
});

function HTMLElement (tag) {
  Element.call(this, tag);
}

HTMLElement.prototype = Object.create(Element.prototype);
HTMLElement.prototype.constructor = HTMLElement;

function ElementNS (namespace, tag) {
  var element = this;
  element.namespaceURI = namespace;
  element.nodeName = element.tagName = element.localName = tag;
  element.childNodes = [];
}

ElementNS.prototype = HTMLElement.prototype;

function Text (data) {
  this.data = data;
}

extendNode(Text, {
  nodeType: 3,
  nodeName: '#text',
  toString: function () {
    return htmlEscape('' + this.data);
  }
});

function Comment (data) {
  this.data = data;
}

extendNode(Comment, {
  nodeType: 8,
  nodeName: '#comment',
  toString: function () {
    return '<!--' + this.data + '-->';
  }
});

function DocumentType (data) {
  this.data = data;
}

extendNode(DocumentType, {
  nodeType: 10,
  toString: function () {
    return '<' + this.data + '>';
  }
});

function Document () {
  this.childNodes = [];
  this.documentElement = this.createElement('html');
  this.appendChild(this.documentElement);
  this.body = this.createElement('body');
  this.documentElement.appendChild(this.body);
}

function own (Element) {
  return function ($1, $2) {
    var node = new Element($1, $2);
    node.ownerDocument = this;
    return node;
  };
}

extendNode(Document, elementGetters, {
  nodeType: 9,
  nodeName: '#document',
  createElement: own(HTMLElement),
  createElementNS: own(ElementNS),
  createTextNode: own(Text),
  createComment: own(Comment),
  createDocumentType: own(DocumentType), // Should be document.implementation.createDocumentType(name, publicId, systemId)
  createDocumentFragment: own(DocumentFragment)
});

module.exports = {
  document: new Document(),
  StyleMap: StyleMap,
  Node: Node,
  Element: Element,
  HTMLElement: HTMLElement,
  Document: Document
};
