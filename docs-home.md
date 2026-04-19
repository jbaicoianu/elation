# Elation Elements

Lightweight JavaScript component framework. This site documents the custom elements and data collections that ship under `elation.elements`.

## Namespaces

- **`elation.elements.ui`** — custom elements for building UI: buttons, inputs, tabs, lists, layouts, and feedback indicators.
- **`elation.elements.collection`** — data collection classes for backing lists/grids with live-updating data, with adapters for REST APIs, IndexedDB, and SQLite.
- **`elation`** / **`elation.utils`** / **`elation.html`** — core utilities the framework is built on.

## Quick start

```html
<ui-tabs>
  <ui-tab label="One">Content for tab one</ui-tab>
  <ui-tab label="Two">Content for tab two</ui-tab>
</ui-tabs>
```

See the [demo gallery](../../demos/index.html) for live examples of every element.

## Conventions

- Components are registered via `elation.elements.define('ui.tabs', class { ... })`, which makes them addressable at runtime as `elation.elements.ui.tabs` and mountable in HTML as `<ui-tabs>`.
- Public attributes are declared inside each class's `init()` via `defineAttributes({...})`. These correspond to the HTML attributes authors write.
- Classes typically inherit through `elation.elements.base` → category-specific base (`elation.elements.ui.base`, `elation.elements.collection.simple`) → concrete class.
