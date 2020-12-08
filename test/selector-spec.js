var test = require('tape');
var DOM = require('../');
var document = DOM.document;

function appendElement (id, parent, tag) {
  var el = document.createElement(tag || 'div');
  el.id = id;
  parent.appendChild(el);
  return el;
}

test('getElementById, getElementsByTagName, getElementsByClassName, querySelector', function (t) {
  document = new DOM.Document();

  var result;
  var el1 = appendElement(1, document.body);
  var el2 = appendElement(2, document.body);
  var el11 = appendElement(11, el1);
  var el12 = appendElement(12, el1);
  var el21 = appendElement(21, el2);
  var el22 = appendElement(22, el2);
  var el221 = appendElement(221, el22, 'span');
  var el222 = appendElement(222, el22);
  var el3 = appendElement(3, document.body);

  el21.className = 'findme first';
  el222.setAttribute('type', 'text/css');
  el221.className = 'findme';

  t.equal(document.body.appendChild(el3), el3);

  t.equal(document.getElementById(1), el1);
  t.equal(document.getElementById('2'), el2);
  t.equal(document.getElementById(3), el3);
  t.equal(document.getElementById(11), el11);
  t.equal(document.getElementById(12), el12);
  t.equal(document.getElementById(21), el21);
  t.equal(document.getElementById(22), el22);
  t.equal(document.getElementById(221), el221);
  t.equal(document.getElementById(222), el222);

  t.equal(document.getElementsByTagName('div').length, 8);

  result = document.getElementsByTagName('span');
  t.equal(result.length, 1);
  t.equal(result[0], el221);

  t.deepEqual(document.getElementsByClassName('findme')
    , [el21, el221]);

  t.deepEqual(document.getElementsByClassName(['findme'])
    , [el21, el221]);

  t.deepEqual(document.querySelector('html'), document.documentElement);
  t.deepEqual(document.querySelector('body'), document.body);

  t.deepEqual(document.querySelector('span'), el221);
  t.deepEqual(document.querySelector('#22'), el22);
  t.deepEqual(document.querySelector('div#22'), el22);
  t.deepEqual(document.querySelector('span#22'), null);

  t.deepEqual(document.querySelector('.findme'), el21);
  t.deepEqual(document.querySelector('.not_found'), null);
  t.deepEqual(document.querySelector('div.findme'), el21);
  t.deepEqual(document.querySelector('div.not_found'), null);
  t.deepEqual(document.querySelector('span.first'), null);
  t.deepEqual(document.querySelector('span.not_found'), null);
  t.deepEqual(document.querySelector('#21.findme'), el21);
  t.deepEqual(document.querySelector('div#21.findme'), el21);

  t.deepEqual(document.querySelectorAll('div')
    , [el1, el11, el12, el2, el21, el22, el222, el3]);

  t.deepEqual(document.querySelectorAll('.findme')
    , [el21, el221]);

  t.deepEqual(document.querySelectorAll('span.findme')
    , [el221]);

  t.deepEqual(document.querySelectorAll('html')
    , [document.documentElement]);

  t.deepEqual(document.querySelectorAll('body')
    , [document.body]);

  t.deepEqual(document.querySelectorAll('span.findme, div.findme')
    , [el21, el221]);

  t.deepEqual(document.querySelectorAll('body span.findme, div.findme')
    , [el21, el221]);

  t.deepEqual(document.querySelectorAll(['body span.findme', 'div.findme'])
    , [el21, el221]);

  t.deepEqual(el1.querySelectorAll('div')
    , [el11, el12]);

  t.end();
});

test('Element.matches and Element.closest', function (t) {
  document = new DOM.Document();

  var el1 = appendElement(1, document.body, 'div');
  var s1 = appendElement('s1', document.body, 'span');
  var s2 = appendElement(2, document.body, 'span');
  var a1 = appendElement(3, s2, 'a');
  var in1 = appendElement('in1', el1, 'input');
  var in2 = appendElement('in2', el1, 'input');

  s2.lang = 'en';
  s2.name = 'map[]';
  s2.setAttribute('data-space', 'a b');
  s2.setAttribute('data-plus', 'a+b');
  s2.setAttribute('data-comma', 'a,b');
  s2.setAttribute('data-x1', 'a,b]');
  s2.setAttribute('data-x2', 'a,b[');
  s2.setAttribute('data-x3', 'a,b(');
  s2.setAttribute('data-x4', 'a,b)');

  a1.href = '#A link 1';
  a1.lang = 'en-US';
  a1.foo = "en'US";

  in1.disabled = true;
  in2.required = true;

  t.equal(el1.matches('div'), true);
  t.equal(el1.matches('div, span'), true);
  t.equal(el1.matches('span'), false);
  t.equal(el1.matches('#1'), true);
  t.equal(el1.matches('#2'), false);
  t.equal(el1.matches('div#1'), true);
  t.equal(el1.matches('div#2'), false);

  t.equal(el1.matches('body > div#1'), true);
  t.equal(el1.matches('body > *'), true);
  t.equal(el1.matches('*'), true);
  t.equal(el1.matches('body > div#2'), false);
  t.equal(el1.matches('html > div#1'), false);
  t.equal(el1.matches('html > div#2'), false);

  t.equal(el1.matches('div + div'), false);
  t.equal(s1.matches('div + span'), true);
  t.equal(s2.matches('div + span'), false);
  t.equal(s2.matches('div + div'), false);

  t.equal(el1.matches('div ~ div'), false);
  t.equal(s1.matches('div ~ span'), true);
  t.equal(s2.matches('div ~ span'), true);
  t.equal(s2.matches('div ~ div'), false);

  t.equal(el1.matches('body div#1'), true);
  t.equal(el1.matches('html div#1'), true);

  t.equal(s2.matches(':empty'), false);
  t.equal(s2.matches(':link'), false);
  t.equal(a1.matches('a:empty'), true);
  t.equal(a1.matches('i:empty'), false);
  t.equal(a1.matches(':link'), true);

  t.equal(in1.matches(':enabled'), false);
  t.equal(in2.matches(':enabled'), true);
  t.equal(in1.matches(':optional'), true);
  t.equal(in2.matches(':optional'), false);

  t.equal(el1.matches('[id=1]'), true);
  t.equal(el1.matches('body [id=1]'), true);
  t.equal(el1.matches('[id=true]'), false);

  t.equal(s2.matches('[id=2]'), true);
  t.equal(s2.matches('[id=2][lang=en]'), true);
  t.equal(s2.matches('[id=2][lang="en"]'), true);
  t.equal(s2.matches('[id="2"][lang=en]'), true);
  t.equal(s2.matches('[id="2"][lang="en"]'), true);
  t.equal(s2.matches('[name="map[]"]'), true);
  t.equal(s2.matches('body [name="map[]"]'), true);

  t.equal(s2.matches('[data-space]'), true);
  t.equal(s2.matches('[data-space][data-plus]'), true);
  t.equal(s2.matches('[data-plu]'), false);
  t.equal(s2.matches('[data-space="a b"]'), true);
  t.equal(s2.matches('[data-plus="a b"]'), false);
  t.equal(s2.matches('[data-plus="a+b"]'), true);
  t.equal(s2.matches('[data-comma="a,b"]'), true);
  t.equal(s2.matches('div, [data-comma="a,b"]'), true);
  t.equal(s2.matches('div[data-comma="a,b"]'), false);
  t.equal(s2.matches('span[data-comma="a,b"]'), true);
  t.equal(s2.matches('[data-x1="a,b]"]'), true);
  t.equal(s2.matches('[data-x1="a,b["]'), false);
  t.equal(s2.matches('[data-x2="a,b["]'), true);
  t.equal(s2.matches('[data-x2="a,b]"]'), false);
  t.equal(s2.matches('[data-x3="a,b("]'), true);
  t.equal(s2.matches('[data-x3="a,b)"]'), false);
  t.equal(s2.matches('[data-x4="a,b)"]'), true);
  t.equal(s2.matches('[data-x4="a,b("]'), false);

  t.equal(s2.matches('div, [data-x1="a,b]"]'), true);
  t.equal(s2.matches('div, [data-x1="a,b["]'), false);
  t.equal(s2.matches('div, [data-x2="a,b["]'), true);
  t.equal(s2.matches('div, [data-x2="a,b]"]'), false);
  t.equal(s2.matches('div, [data-x3="a,b("]'), true);
  t.equal(s2.matches('div, [data-x3="a,b)"]'), false);
  t.equal(s2.matches('div, [data-x4="a,b)"]'), true);
  t.equal(s2.matches('div, [data-x4="a,b("]'), false);

  t.equal(s2.matches('body > [data-space]'), true);
  t.equal(s2.matches('body > [data-space][data-plus]'), true);
  t.equal(s2.matches('body > [data-plu]'), false);
  t.equal(s2.matches('body > [data-space="a b"]'), true);
  t.equal(s2.matches('body > [data-plus="a b"]'), false);
  t.equal(s2.matches('body > [data-plus="a+b"]'), true);

  t.equal(a1.matches('[data-space] a'), true);
  t.equal(a1.matches('[data-space][data-plus] a'), true);
  t.equal(a1.matches('[data-plu] a'), false);
  t.equal(a1.matches('[data-space="a b"] a'), true);
  t.equal(a1.matches('[data-plus="a b"] a'), false);
  t.equal(a1.matches('[data-plus="a+b"] a'), true);

  t.equal(a1.matches('[href="#A link 1"]'), true);
  t.equal(a1.matches("a[href='#A link 1']"), true);
  t.equal(a1.matches('[href="#A"]'), false);
  t.equal(a1.matches('[href^="#A"]'), true);
  t.equal(a1.matches('[href^="A"]'), false);
  t.equal(a1.matches('[href^="#Aa"]'), false);
  t.equal(a1.matches('[foo^="en"]'), true);
  t.equal(a1.matches('[foo^="en\'"]'), true);
  t.equal(a1.matches('[href$=" 1"]'), true);
  t.equal(a1.matches('[href$="  1"]'), false);
  t.equal(a1.matches('[href*="#A"]'), true);
  t.equal(a1.matches('[href*="#Aa"]'), false);
  t.equal(a1.matches('[href*="link"]'), true);
  t.equal(a1.matches('[href*=" 1"]'), true);
  t.equal(a1.matches('[href*="  1"]'), false);
  t.equal(a1.matches('[href~="link"]'), true);
  t.equal(a1.matches('[href~="#A"]'), true);
  t.equal(a1.matches('[href~="A"]'), false);
  t.equal(s2.matches('[lang|="en"]'), true);
  t.equal(a1.matches('[lang|="en"]'), true);
  t.equal(a1.matches('[lang|="e"]'), false);
  t.equal(a1.matches('[lang|="en-"]'), false);

  t.equal(el1.matches('div:first-child'), true);
  t.equal(el1.matches('div:not(:first-child)'), false);

  t.equal(el1.matches('div:first-of-type'), true);
  t.equal(in1.matches(':first-of-type'), true);
  t.equal(in2.matches(':first-of-type'), false);
  t.equal(el1.matches('div:not(:first-of-type)'), false);

  t.equal(el1.matches('div:last-of-type'), true);
  t.equal(in1.matches(':last-of-type'), false);
  t.equal(in2.matches(':last-of-type'), true);
  t.equal(el1.matches('div:not(:last-of-type)'), false);

  t.equal(el1.matches('div:only-of-type'), true);
  t.equal(s1.matches(':only-of-type'), false);
  t.equal(s2.matches(':only-of-type'), false);
  t.equal(in1.matches(':only-of-type'), false);
  t.equal(in2.matches(':only-of-type'), false);
  t.equal(el1.matches('div:not(:only-of-type)'), false);

  t.equal(el1.matches('div:is(:first-child, :last-child)'), true);
  t.equal(el1.matches('div:last-child'), false);
  t.equal(el1.matches('div:not(:last-child)'), true);
  t.equal(el1.matches('div:is(:first-child, :last-child)'), true);
  t.equal(el1.matches('div:is(span, a)'), false);
  t.equal(s2.matches('span:first-child'), false);
  t.equal(s2.matches('span:last-child'), true);
  t.equal(s2.matches(':only-child'), false);
  t.equal(a1.matches(':only-child'), true);
  t.equal(a1.matches(':root'), false);
  t.equal(document.body.matches(':root'), false);
  t.equal(document.documentElement.matches(':root'), true);

  t.equal(el1.closest('div'), el1);
  t.equal(el1.closest('body'), document.body);
  t.equal(el1.closest('span'), null);

  t.end();
});

test(':nth-child selector', function (t) {
  document = new DOM.Document();
  var el = document.body;
  var p1 = appendElement('p1', el, 'p');
  var p2 = appendElement('p2', el, 'p');
  var p3 = appendElement('p3', el, 'p');
  var p4 = appendElement('p4', el, 'p');
  var p5 = appendElement('p5', el, 'p');
  var p6 = appendElement('p6', el, 'p');
  var p7 = appendElement('p7', el, 'p');
  var p8 = appendElement('p8', el, 'p');
  var p9 = appendElement('p9', el, 'p');

  t.deepEqual(el.querySelectorAll(':nth-child(2n)')
    , [p2, p4, p6, p8]);

  t.deepEqual(el.querySelectorAll(':nth-child(even)')
    , [p2, p4, p6, p8]);

  t.deepEqual(el.querySelectorAll(':nth-child(2n+1)')
    , [p1, p3, p5, p7, p9]);

  t.deepEqual(el.querySelectorAll(':nth-child(odd)')
    , [p1, p3, p5, p7, p9]);

  t.deepEqual(el.querySelectorAll(':nth-child(3n+3)')
    , [p3, p6, p9]);

  t.deepEqual(el.querySelectorAll(':nth-child(4n+1)')
    , [p1, p5, p9]);

  t.deepEqual(el.querySelectorAll(':nth-child(4n+4)')
    , [p4, p8]);

  t.deepEqual(el.querySelectorAll(':nth-child(4n)')
    , [p4, p8]);

  t.deepEqual(el.querySelectorAll(':nth-child(0n+1)')
    , [p1]);

  t.deepEqual(el.querySelectorAll(':nth-child(1)')
    , [p1]);

  t.deepEqual(el.querySelectorAll(':nth-child(3)')
    , [p3]);

  t.deepEqual(el.querySelectorAll(':nth-child(5n-2)')
    , [p3, p8]);

  t.deepEqual(el.querySelectorAll(':nth-child(-n+3)')
    , [p1, p2, p3]);

  t.deepEqual(el.querySelectorAll(':nth-child(-2n+3)')
    , [p1, p3]);

  t.deepEqual(el.querySelectorAll(':nth-child(-2n+4)')
    , [p2, p4]);

  t.end();
});

test(':nth-last-child selector', function (t) {
  document = new DOM.Document();
  var el = document.body;
  var p1 = appendElement('p1', el, 'p');
  var p2 = appendElement('p2', el, 'p');
  var p3 = appendElement('p3', el, 'p');
  var p4 = appendElement('p4', el, 'p');
  var p5 = appendElement('p5', el, 'p');
  var p6 = appendElement('p6', el, 'p');
  var p7 = appendElement('p7', el, 'p');
  var p8 = appendElement('p8', el, 'p');
  var p9 = appendElement('p9', el, 'p');

  t.deepEqual(el.querySelectorAll(':nth-last-child(2n)')
    , [p2, p4, p6, p8]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(even)')
    , [p2, p4, p6, p8]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(2n+1)')
    , [p1, p3, p5, p7, p9]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(odd)')
    , [p1, p3, p5, p7, p9]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(3n+3)')
    , [p1, p4, p7]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(4n+1)')
    , [p1, p5, p9]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(4n+4)')
    , [p2, p6]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(4n)')
    , [p2, p6]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(0n+1)')
    , [p9]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(0n+3)')
    , [p7]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(1)')
    , [p9]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(3)')
    , [p7]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(5n-2)')
    , [p2, p7]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(-n+3)')
    , [p7, p8, p9]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(-2n+3)')
    , [p7, p9]);

  t.deepEqual(el.querySelectorAll(':nth-last-child(-2n+4)')
    , [p6, p8]);

  t.end();
});

test(':lang() selector', function (t) {
  document = new DOM.Document();
  var el = document.body;
  var p1 = appendElement('p1', el, 'p');
  var p2 = appendElement('p2', el, 'p');
  var p3 = appendElement('p3', p1, 'p');
  var p4 = appendElement('p4', p2, 'p');

  el.lang = 'en';
  p2.lang = 'fr-be';

  t.deepEqual(el.querySelectorAll(':lang(en)')
    , [p1, p3]);

  t.deepEqual(el.querySelectorAll(':lang(fr)')
    , [p2, p4]);

  t.end();
});
