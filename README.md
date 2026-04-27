# Elation Elements

Lightweight JavaScript component framework built with HTML custom elements, with an ergonomics layer that makes them easier to author and nicer to use. Ships a library of UI elements — buttons, inputs, tabs, lists, windows, wizards — plus data collection classes for binding them to live data sources.

On top of the standard custom element API, Elation layers a typed attribute system (`int`, `float`, `boolean`, `vector2`, etc.) with automatic attribute ↔ property coercion, lifecycle hooks (`init` / `create` / `render`) that fire at the right time relative to child parsing, inheritance via `elation.elements.base`, and an `elation.elements.create()` constructor that accepts an args object in place of the usual `document.createElement` + `setAttribute` dance.

## Installation

### Script tag

The fastest path is a CDN include — one script, one stylesheet, every element registered:

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/elation/build/elation.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/elation/build/elation.css">

<ui-button label="Click me"></ui-button>
```

That's the whole setup. Once the bundle loads it registers every UI element and collection class with the browser's custom-element registry; markup like `<ui-button>` and `<ui-tabs>` works from then on. unpkg also serves the same artifact at `https://unpkg.com/elation/build/elation.js`.

### npm

```sh
npm install elation
```

The package's `main` field resolves to the pre-bundled `build/elation.js`, so a bundler-aware project can just import the side-effecting bundle:

```js
import 'elation';
import 'elation/build/elation.css';
```

For a non-bundler project that imports straight from `node_modules`:

```html
<script src="node_modules/elation/build/elation.js"></script>
<link rel="stylesheet" href="node_modules/elation/build/elation.css">
```

### Building only what you need

The pre-bundled `elation.js` registers the entire library — roughly 430KB un-minified. Production projects typically use a subset, so Elation ships a dependency-graph packer (`pack.js`) that resolves only the modules you actually reference. The library's own [`scripts/build.sh`](scripts/build.sh) is a thin wrapper around it — copy that script as a starting point, then change the module list at the bottom to match your slice:

```sh
node htdocs/scripts/utils/pack.js -bundle myapp \
  elements.ui.button elements.ui.input elements.collection.jsonapi
```

`pack.js` walks the `elation.require()` graph starting from each module you list, gathers every transitive dependency, and emits a single bundle plus its CSS sidecar. This is the same pattern projects like [janusweb](https://github.com/jbaicoianu/janusweb) use to ship a custom build of just the elements they need.

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

`defineAttributes({ name: descriptor })` bridges HTML attributes ↔ JS properties automatically. Descriptor keys:

- **`type`** — the attribute's value type. Controls how it's coerced between its string form on the attribute and its typed form on the property. See [Type system](#type-system) below for built-in types and how to register new ones.
- **`default`** — value used when the attribute is absent.
- **`get` / `set`** — hooks that fire on property read/write, handy for derived values or for reacting to changes.

Setting `el.value = 42` from JS writes back to the HTML attribute, and `el.setAttribute('value', '42')` or `<ui-counter value="42">` populates the typed property.

### Inheritance

Extend `elation.elements.base` for standalone elements, or an existing element class (`elation.elements.ui.list`, `elation.elements.ui.button`, `elation.elements.collection.simple`, …) to build on its behavior. See the sidebar for available base classes.

## Type system

HTML attributes are always strings; JS properties aren't. Elation's type system bridges the two: declare a type on an attribute and reads and writes coerce transparently. It's what makes `<ui-counter value="42">` produce an element whose `.value` is the number `42`, not the string `"42"` — and assigning `el.value = 43` from JS writes `value="43"` back to the markup in the same shape.

The same declaration drives the `set:` and `get:` hooks from the previous section, which fire whenever a property is read or written. `set:` is how an element reacts to its own attribute changes without writing a separate `attributeChangedCallback`.

### Built-in types

The four numeric / function / boolean types coerce in the type-system switch with no external dependencies:

- **`boolean`** (alias: `bool`) — presence is true; an absent attribute, `'0'`, or `'false'` is false. Writing `true` sets the attribute to the empty string; writing `false` removes it.
- **`integer`** (alias: `int`) — parsed with `value|0`, i.e. a 32-bit truncated integer.
- **`float`** (alias: `number`) — parsed with `+value`; non-numeric strings become `NaN`.
- **`callback`** — function values pass through; string values are wrapped in `new Function('event', value)`, so inline handlers like `onaccept="this.submit()"` work from markup the same way `onclick=` does on native elements.

One additional type ships pre-registered via `registerType()` (covered below):

- **`anchor`** — hybrid boolean / pixel-offset value used by `ui.panel`'s edge-snap attributes (`top` / `bottom` / `left` / `right`). Presence with no value or any non-numeric truthy value reads as `true`; numeric values read as the offset. Used internally by `ui.window` so the same attribute can mean either "snap to top edge" (`<ui-window top>`) or "snap with a 50px offset" (`<ui-window top="50">`).

Unrecognized type names (including `string`, `object`, `array`) pass through with no coercion. That's harmless for `string` — attribute values are strings already — but for `object` and `array` it means markup attributes don't parse; only direct JS property assignment round-trips correctly. Declaring those types is still useful as a documentation hint and so editors and the docs generator can display the intent.

### Registering new types

Anything richer — vectors, colors, URLs, dates — gets registered via `elation.elements.registerType(name, handler)`. The handler is a `{ read, write }` pair: `read` turns the raw attribute string into the typed value, and `write` turns the typed value back into a string for `setAttribute`. Core itself uses this to register `anchor`; consumers register types that depend on libraries core doesn't ship.

```js
// Anchor is registered in core, alongside ui.panel — the hybrid type
// used for edge-snap attributes. Returns true for presence with no value,
// or a number when an explicit pixel offset is supplied.
elation.elements.registerType('anchor', {
  read(value) {
    if (value === true || value === '' || value === 'true') return true;
    if (value === false || value == null || value === 'false') return false;
    const n = Number(value);
    if (isNaN(n) || n === 0) return true;
    return n | 0;
  },
  write(value) {
    if (value === true) return '';
    if (value === false || value == null) return 'false';
    return String(value);
  }
});

// And in a project that ships Three.js (e.g., Elation Engine), a
// downstream registration that depends on a runtime core won't pull in:
elation.elements.registerType('vector3', {
  read(value) {
    if (value instanceof THREE.Vector3) return value;
    const [x, y, z] = ('' + value).split(/\s+/).map(Number);
    return new THREE.Vector3(x, y, z);
  },
  write(value) {
    return `${value.x} ${value.y} ${value.z}`;
  }
});
```

With `vector3` registered, any element can declare `position: { type: 'vector3' }` and its `.position` property is a live `THREE.Vector3` while the markup stays valid as `<my-element position="1 2 3">`. Elation core registers types it can implement without external dependencies (like `anchor`); richer types are the consuming project's responsibility.

## Collections

Collections are the data layer of the library — a consistent interface for list-shaped data that changes over time. Each collection holds an array of items and emits `collection_add`, `collection_remove`, `collection_move`, and `collection_clear` events when its contents change. List-style UI elements (`ui.list`, `ui.grid`, `ui.tabs`, `ui.checklist`, …) accept a collection reference and re-render incrementally as those events fire — no manual subscriptions, no full re-renders.

### Binding a list to data

Set the `collection` property on the list element to a collection instance:

```js
const users = elation.elements.create('collection-jsonapi', {
  host: 'https://api.example.com',
  endpoint: '/users',
});

const list = elation.elements.create('ui-list', {
  collection: users,
  append: document.body,
});
// list populates when users loads, and updates whenever
// users.add() / .remove() / .move() fires.
```

For one-off load completion, listen on the collection directly:

```js
elation.events.add(users, 'collection_load', () => {
  console.log(`fetched ${users.items.length} users`);
});
```

### What ships in core

The class family covers three patterns of data backing, all built on the same event interface so any of them can drive any list element:

- **In-memory** — `simple` (the base class; an ordered array with the four mutation events).
- **Remote** — `api` (REST), `jsonapi` (parses JSON responses), `jsonpapi` (script-tag callback for cross-origin endpoints that don't ship CORS headers).
- **Persistent + indexed** — `indexed` (uniqueness enforced by a per-item key), `localindexed` (auto-saves to `localStorage` and listens for cross-tab updates), `sqlite` (Node.js sqlite3 backing, server-side only).

Plus three derivers that expose a transformed view of another collection:

- **`filter`** — apply a predicate; the derived collection contains only matching items.
- **`subset`** — re-shape a parent's raw response, so one API call can back several distinct list views.
- **`custom`** — supply an `itemcallback` that returns the items array on demand; useful for surfacing a non-array data structure (an object's keys, a `Map`, a computed view) as a collection.

See the [collection namespace](elation.elements.collection.html) in the API docs for the full per-class attribute and event reference.

## License

MIT — see [LICENSE](LICENSE).
