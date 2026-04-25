elation.require(['elements.elements'], function() {
  /**
   * Base class for every Elation custom element. Provides the lifecycle
   * (`init` → `create` → `render`), the typed-attribute system via
   * `defineAttributes`, event dispatch with elation-style bubbling, and a
   * small set of helpers shared by every element (`refresh`, `show` / `hide`,
   * `enable` / `disable`, `addclass` / `removeclass` / `hasclass`, `toCanvas`).
   *
   * Extend this class directly for elements with no other parent, or extend
   * a more specific subclass like `elation.elements.ui.list` or
   * `elation.elements.ui.button` to inherit its behavior. Register the
   * subclass with `elation.elements.define(name, classdef)` so the tag name
   * is wired up with the browser's custom element registry and the class
   * lands in the correct namespace.
   *
   * Every base-class instance ships with a handful of attributes useful to
   * any element: `name` (an arbitrary identifier), `flex` (CSS flex
   * shorthand applied during render), `editable` and `preview` flags, and
   * `deferred` (defers `render()` to a render loop). These are inherited
   * by every subclass on top of whatever attributes that subclass adds in
   * its own `defineAttributes` call.
   *
   * @class base
   * @hideconstructor
   * @memberof elation.elements
   *
   * @param {object} args
   * @param {string} args.name
   * @param {string} args.flex
   * @param {string} args.template
   * @param {boolean} args.editable
   * @param {boolean} args.preview
   * @param {boolean} args.deferred
   */
  elation.elements.define('base', class extends elation.elements.mixin(HTMLElement) {
  }, true);
});

