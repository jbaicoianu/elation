# Elation Elements

Lightweight JavaScript component framework built with HTML custom elements, with an ergonomics layer that makes them easier to author and nicer to use. Ships a library of UI elements — buttons, inputs, tabs, lists, windows, wizards — plus data collection classes for binding them to live data sources.

On top of the standard custom element API, Elation layers a typed attribute system (`int`, `float`, `boolean`, `vector2`, etc.) with automatic attribute ↔ property coercion, lifecycle hooks (`init` / `create` / `render`) that fire at the right time relative to child parsing, inheritance via `elation.elements.base`, and an `elation.elements.create()` constructor that accepts an args object in place of the usual `document.createElement` + `setAttribute` dance.

## Namespaces

- **`elation.elements.ui`** — elements for building UI: buttons, inputs, tabs, lists, layouts, and feedback indicators.
- **`elation.elements.collection`** — data collection classes for backing lists and grids with live-updating data, with adapters for REST APIs, IndexedDB, and SQLite.
- **`elation`** / **`elation.utils`** / **`elation.html`** — core utilities the framework is built on.

## Creating an element

Use them in markup:

```html
<ui-tabs>
  <ui-tab label="One">Content for tab one</ui-tab>
  <ui-tab label="Two">Content for tab two</ui-tab>
</ui-tabs>
```

Or from JavaScript, either via the regular DOM API:

```js
const tabs = document.createElement('ui-tabs');
document.body.appendChild(tabs);
```

…or via `elation.elements.create()`, which takes an args object mirroring the element's attributes (and can append in the same step):

```js
const input = elation.elements.create('ui-input', {
  placeholder: 'Name',
  value: 'Ada',
  append: document.body,
});
```

The `args` table on each class page lists the keys accepted by `elation.elements.create()`; each key also maps to an HTML attribute of the same name.

See the [demo gallery](../../demos/index.html) for live examples of every element.

## Defining new elements

Register a class with `elation.elements.define(name, class)`. Dots in the name become dashes for the HTML tag: `'ui.counter'` registers `<ui-counter>` and exposes the class at `elation.elements.ui.counter`.

```js
elation.require(['elements.base'], function() {
  elation.elements.define('ui.counter', class extends elation.elements.base {
    init() {
      super.init();
      this.defineAttributes({
        value: { type: 'int', default: 0, set: this.updateDisplay },
        step:  { type: 'int', default: 1 },
      });
    }
    create() {
      this.addEventListener('click', () => this.value += this.step);
    }
    updateDisplay() {
      this.innerHTML = this.value;
      this.dispatchEvent({ type: 'change', data: this.value });
    }
  });
});
```

### Lifecycle

Three hooks, called in order:

- **`init()`** — declare attributes and set per-instance state. Call `super.init()` first.
- **`create()`** — fires once after the element is connected to the DOM and its children have parsed. Use this to wire event listeners, query children, and produce initial content.
- **`render()`** — optional; a hook for redrawing. Call `this.refresh()` to trigger it.

### Attributes

`defineAttributes({ name: descriptor })` bridges HTML attributes ↔ JS properties automatically, with type coercion. Descriptor keys:

- **`type`** — one of `int`, `float`, `boolean`, `string`, `object`, `vector2`, `callback`, and more.
- **`default`** — value used when the attribute is absent.
- **`get` / `set`** — hooks that fire on property read/write, handy for derived values or for reacting to changes.

Setting `el.value = 42` from JS writes back to the HTML attribute, and `el.setAttribute('value', '42')` or `<ui-counter value="42">` populates the typed property.

### Inheritance

Extend `elation.elements.base` for standalone elements, or an existing element class (`elation.elements.ui.list`, `elation.elements.ui.button`, `elation.elements.collection.simple`, …) to build on its behavior. See the sidebar for available base classes.
