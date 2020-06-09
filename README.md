# dom-lightning

A refactor of [dom-lite](https://github.com/litejs/dom-lite) with some stuff added.

## Development

```bash
npm i
npm test
```

## Examples

```javascript
var document = require("dom-lightning").document;

var el = document.createElement("h1");
el.id = 123;
el.className = "large";

var fragment = document.createDocumentFragment();
var text1 = document.createTextNode("hello");
var text2 = document.createTextNode(" world");

fragment.appendChild(text1);
fragment.appendChild(text2);
el.appendChild(fragment);

el.innerHTML;
// hello world
el.innerHTML = "<b>hello world</b>"
el.outerHTML;
// <h1 id="123" class="large"><b>hello world</b></h1>
el.querySelectorAll("b");
// [ "<b>hello world</b>" ]
```

## Licence

[The MIT License](https://opensource.org/licenses/MIT)
