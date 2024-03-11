elation.require(['utils.template'], function() {
  elation.extend('elements', {
    initialized: false,
    uniqueids: {},
    types: {},
    activeElements: new Set(),

    init() {
      elation.elements.initialized = true;

      // Set up a mutation observer so we can keep track of all our elements and any style changes that require updates
      this.observer = new window.MutationObserver(mutations => mutations.forEach(this.observe.bind(this)))
      this.observer.observe(window.document, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true
      })

    },
    observe(mutation) {
      if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
        for (let addition of mutation.addedNodes) {
          if (addition.tagName == 'LINK') {
            // new external CSS file, refresh elements when it finishes loading
            addition.addEventListener('load', (ev) => { elation.elements.refresh();});
          } else if (addition.tagName == 'STYLE') {
            // new inline CSS, refresh elements now
            elation.elements.refresh();
          } else if (addition instanceof elation.elements.base) {
            // New element, add it to our list of active elements
            this.activeElements.add(addition);
          }
        }
        for (let removal of mutation.removedNodes) {
          // Remove elements from activeElements set
          if (this.activeElements.has(removal)) {
            this.activeElements.delete(removal);
          }
        }
      }
    },
    refresh() {
      this.activeElements.forEach(el => el.refresh());
    },
    define: function(name, classdef, notag) {
      var elementname = name.replace(/\./g, '-'),
          componentname = name.replace(/-/g, '.');
      elation.extend('elements.' + componentname, classdef);

      if (!notag) {
        customElements.define(elementname, classdef);
      }

      //console.log('define element:', name, '<' + elementname + '>');
    },
    create: function(type, attrs={}) {
      var elementname = type.replace(/\./g, '-');
      var element = document.createElement(elementname);

      if (!elation.elements.initialized) {
        elation.elements.init();
      }

      if (element) {
        if (attrs.append) {
          elation.html.attach(attrs.append, element, attrs.before);
          delete attrs.append;
        }
        for (var k in attrs) {
          if (k == 'innerHTML') {
            element[k] = attrs[k];
          } else {
            // FIXME - this should be handled by the type coersion system
            if (elation.utils.isObject(attrs[k])) {
              element[k] = attrs[k];
            } else if (attrs[k] === true) {
              element.setAttribute(k, '');
            } else if (!(attrs[k] === false || attrs[k] === undefined || attrs[k] === null)) {
              element.setAttribute(k, attrs[k]);
            }
          }
        }
      }
      return element;
    },
    registerType: function(type, handler) {
      this.types[type] = handler;
    },
    fromString: function(str, parent) {
      let container = document.createElement('div');
      container.innerHTML = str;

      var nodes = container.querySelectorAll('*');
      var elements = {
        length: nodes.length
      };
      for (var i = 0; i < elements.length; i++) {
        elements[i] = nodes[i];
        let elname = elements[i].getAttribute('name');
        if (elname) {
          elements[elname] = elements[i];
        }
        if (elements[i].id) {
          elements[elements[i].id] = elements[i];
        }
      }

      if (parent) {
        while (container.childNodes.length > 0) {
          parent.appendChild(container.childNodes[0]);
        }
      }
      return elements;
    },
    fromTemplate: function(tplname, parent) {
      return elation.elements.fromString(elation.template.get(tplname, parent), parent);
    },
    getEvent: function(type, args) {
      var ev = new Event(type);
      for (var k in args) {
        ev[k] = args[k];
      }
      return ev;
    },
    getUniqueId: function(type) {
      if (!type) {
        type = 'element';
      }
      // Initialize to zero
      if (!this.uniqueids[type]) this.uniqueids[type] = 0;

      // Increment the counter for this type as we generate our new name
      return type + '_' + (++this.uniqueids[type]);
    },
    mixin: function(BaseClass) {
      return class extends BaseClass {
        constructor() {
          super();
          this.initElation();
        }
        initElation() {
          this._elation = {
            properties: {},
            classdef: {
            }
          };
          this.init();
          //this.initAttributes();
        }
        init() {
          this.defineAttributes({
            deferred: { type: 'boolean', default: false },
            template: { type: 'string' },
            name: { type: 'string' },
            //classname: { type: 'string' },
            preview: { type: 'boolean', default: false },
            hover: { type: 'boolean', default: false },
            editable: { type: 'boolean', default: false },
            flex: { type: 'string' }
          });
          elation.events.add(this, 'mouseover', (ev) => this.onhover(ev));
          elation.events.add(this, 'mouseout', (ev) => this.onunhover(ev));
        }
        defineAttributes(attrs) {
          for (var k in attrs) {
            this.defineAttribute(k, attrs[k]);
          }
        }
        defineAttribute(attrname, attrdef) {
          this._elation.classdef[attrname] = attrdef;
          Object.defineProperty(this, attrname, {
            configurable: true,
            enumerable: true,
            get: () => { 
              return this.getProperty(attrname)
            },
            set: (v) => {
              this.setProperty(attrname, v);
            }
          });
          //var observer = new MutationObserver((ev) => console.log('now they mutate', ev, this); );
          //observer.observe(this, {attributes: true});
        }
        initAttributes() {
          var attributes = this.getAttributeNames();
          for (var i = 0; i < attributes.length; i++) {
            var attrname = attributes[i];
            if (attrname.indexOf('.') != -1) {
              elation.utils.arrayset(this, attrname, this.getAttribute(attrname));
            }
          }
        }
        setProperty(k, v, skip) {
          // TODO - type coersion magic happens here
          elation.utils.arrayset(this._elation.properties, k, v);
//this._elation.properties[k] = v;
//console.log(this._elation.properties);
//if (v == '[object HTMLElement]') debugger;
          let classdef = this._elation.classdef[k];
          if (!skip && !classdef.innerHTML) {
            if (classdef.type == 'boolean') {
              if (v) {
                this.setAttribute(k, '');
              } else {
                this.removeAttribute(k);
              }
            } else {
              if (elation.elements.types[classdef.type]) {
                this.setAttribute(k, elation.elements.types[classdef.type].write(v));
              } else {
                this.setAttribute(k, v);
              }
            }
            if (classdef.set) {
              classdef.set.call(this, v);
            }
          }
        }
        getProperty(k) {
          // TODO - type coersion magic happens here
          let prop = elation.utils.arrayget(this._elation.properties, k, null);
          let classdef = this._elation.classdef[k];
          if (classdef.get) {
            return this.getPropertyAsType(classdef.get.call(this, k), classdef.type);
          //} else if (k in this._elation.properties) {
          //  return this._elation.properties[k];
          } else if (prop !== null) {
            return this.getPropertyAsType(prop, classdef.type);
          } else if (this.hasAttribute(k)) {
            return this.getPropertyAsType(this.getAttribute(k), classdef.type);
          } else if (typeof classdef.default != 'undefined') {
            return classdef.default;
          }
        }
        getPropertyAsType(value, type) {
          switch (type) {
            case 'boolean':
              return (value || value === '');
            case 'integer':
              return value|0;
            case 'float':
              return +value;
            case 'callback':
              if (elation.utils.isString(value)) {
                return new Function('event', value);
              }
              return value;
            default:
              if (elation.elements.types[type]) {
                return elation.elements.types[type].read(value);
              }
              return value;
          }
        }
        connectedCallback() {
          // FIXME - the document-register-element polyfill seems to throw away any object setup we do in the constructor, if that happened just re-init
          if (!this._elation) this.initElation();

          this.initAttributes();
          if (this.create && !this.created) {
            // Call the element's create function asynchronously so that its childNodes can populate
            setTimeout(() => this.create(), 0);
            this.created = true;
          }
          this.dispatchEvent({type: 'elementconnect'});
        }
        handleEvent(ev) {
          if (typeof this['on' + ev.type] == 'function') {
            this['on' + ev.type](ev);
          }
        }
        dispatchEvent(ev) {
          if (typeof this['on' + ev.type] == 'function') {
            this['on' + ev.type](ev);
          }
          //var evobj = elation.elements.getEvent(ev);
          //super.dispatchEvent(evobj);
          let element = ev.element = this;
          //ev.target = element;
          let fired = elation.events.fire(ev);
          if (ev.bubbles) {
            while ((element = element.parentNode) && !elation.events.wasBubbleCancelled(fired)) {
              let bubbleev = elation.events.clone(ev, {target: this, currentTarget: element, element: element})
              //ev.element = element;
              //ev.currentTarget = element;
              fired = elation.events.fire(bubbleev);
            }
          }
        }
         /*
         * Handle default element creation.  If template is specified, use it for our contents.
         */
        create() {
          if (this.template) {
            this.innerHTML = elation.template.get(this.template, this);
          }
        }

        /**
         * Mark data as dirty, and then start the render loop if not already active
         * @function refresh
         * @memberof elation.elements.base#
         */
        refresh() {
          this.needsUpdate = true;
          if (this.deferred) {
            if (!this.renderloopActive) {
              this.setuprenderloop();
            }
          } else {
            this.render();
          }
        }
        /**
         * Refresh all of this element's children
         * @function refreshChildren
         * @memberof elation.elements.base#
         */
        refreshChildren() {
          for (var i = 0; i < this.childNodes.length; i++) {
            var node = this.childNodes[i];
            if (node instanceof elation.elements.base) {
              node.refresh();
              node.refreshChildren();
            }
          }
        }
        /**
         * Hook into the browser's animation loop to make component renders as efficient as possible
         * This also automatically rate-limits updates to the render speed of the browser (normally 
         * 60fps) rather than triggering a render every time data changes (which could be > 60fps)
         * 
         * @function renderloop
         * @memberof elation.elements.base#
         */
        setuprenderloop() {
          requestAnimationFrame(this.renderloop.bind(this));
        }

        renderloop() {
          if (this.needsUpdate) {
            this.render();
//if (this.image) this.toCanvas();
            this.needsUpdate = false;
            this.renderloopActive = true;
            this.setuprenderloop();
          } else {
            this.renderloopActive = false;
          } 
        }
        /**
         * Update the component's visual representation to reflect the current state of the data
         * 
         * @function render
         * @abstract
         * @memberof elation.elements.base#
         */
        render() {
          if (this.flex && this.flex != this.style.flex) {
            this.style.flex = this.flex;
          }
          if (this.canvas) {
            this.updateCanvas();
          }
        }
        /**
         * Add an HTML class to this component
         * @function addclass
         * @memberof elation.ui.base#
         */
        addclass(classname) {
          if (!elation.html.hasclass(this, classname)) {
            elation.html.addclass(this, classname);
          }
        }
        /**
         * Remove an HTML class from this component
         * @function removeclass
         * @memberof elation.ui.base#
         */
        removeclass(classname) {
          if (elation.html.hasclass(this, classname)) {
            elation.html.removeclass(this, classname);
          }
        }
        /**
         * Check whether this component has the specified class
         * @function hasclass
         * @memberof elation.ui.base#
         * @returns {bool}
         */
        hasclass(classname) {
          return elation.html.hasclass(this, classname);
        }
        /**
         * Make this component visible 
         * @function show
         * @memberof elation.ui.base#
         */
        show() {
          if (this.hidden) {
            this.hidden = false;
            this.removeclass('state_hidden');
            this.refresh();
          }
        }
        /**
         * Make this component invisible 
         * @function hide
         * @memberof elation.ui.base#
         */
        hide() {
          this.hidden = true;
          this.addclass('state_hidden');
        }
        /**
         * Enable this component
         * @function enable
         * @memberof elation.ui.base#
         */
        enable() {
          this.enabled = true;
          this.removeclass('state_disabled');
        }
        /**
         * Disable this component
         * @function disable
         * @memberof elation.ui.base#
         */
        disable() {
          this.enabled = false;
          this.addclass('state_disabled');
        }
        /**
         * Set this component's hover state
         * @function hover
         * @memberof elation.ui.base#
         */
        onhover() {
          this.hover = true;
        }
        /**
         * Unset this component's hover state
         * @function unhover
         * @memberof elation.ui.base#
         */
        onunhover() {
          this.hover = false;
        }
        /**
         * Sets the orientation of this component
         * @function setOrientation
         * @memberof elation.ui.base#
         * @param {string} orientation
         */
        setOrientation(orientation) {
          if (this.orientation) {
            this.removeclass('orientation_' + this.orientation);
          }
          this.orientation = orientation;
          this.addclass('orientation_' + this.orientation);
        }
        addPropertyProxies(element, properties) {
          properties = (elation.utils.isString(properties) ? properties.split(',') : properties);
          for (var i = 0; i < properties.length; i++) {
            ((p) => {
              // Set current value
              if (typeof this[p] != 'undefined' && this[p] !== null) {
                element[p] = this[p];
              }
              // Define getter and setter to proxy requests for this property to another element
              Object.defineProperty(this, p, { get: function() { return element[p]; }, set: function(v) { element[p] = v; } });
            })(properties[i]);
          }
        }
        addEventProxies(element, events) {
          var passiveEvents = ['touchstart', 'touchmove', 'touchend', 'mousewheel'];
          events = (elation.utils.isString(events) ? events.split(',') : events);
          for (var i = 0; i < events.length; i++) {
            elation.events.add(element, events[i], (ev) => { 
              //this.dispatchEvent({type: ev.type, event: ev }); 
              this.dispatchEvent(ev);
            }, (passiveEvents.indexOf(events[i]) != -1 ? {passive: true} : false));
          }
        }
        /**
         * Render this element to an image
         */
        toCanvas(width, height, scale) {
          if (typeof width == 'undefined') {
            width = this.offsetWidth;
          }
          if (typeof height == 'undefined') {
            height = this.offsetHeight;
          }
          if (typeof scale == 'undefined') {
            scale = 1;
          }
          if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.crossOrigin = 'anonymous';
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvasscale = scale;
            document.body.appendChild(this.canvas);

            this.observer = new MutationObserver(() => {
              // Rate limit refreshes to avoid too many updates
              if (this.refreshtimer) clearTimeout(this.refreshtimer);
              this.refreshtimer = setTimeout(() => {
                // Use requestIdleCallback to reduce the amount of jank when updating
                requestIdleCallback(() => {
                  this.updateCanvas();
                  this.refreshqueued = false;
                  this.refreshtimer = false;
                }, { timeout: 20 });
              }, 50);
              //this.refresh();
            });
            this.observer.observe(this, { subtree: true, childList: true, attributes: true, characterData: true });
          }
          var img = new Image();

          // We need to sanitize our HTML in case someone provides us with malformed markup.
          // We use SVG to render the mark-up, and since SVG is XML it means we need well-formed data
          // However, for whatever reason, <br> amd <hr> seem to break things, so we replace them with
          // styled divs instead.

          //var sanitarydiv = document.createElement('div');
          //sanitarydiv.innerHTML = this.outerHTML;



/*
          if (this.stylesheetsChanged()) {
            let fetches = [];
            // Fetch all active stylesheets, so we can inject them into our foreignObject
            for (let i = 0; i < document.styleSheets.length; i++) {
              let stylesheet = document.styleSheets[i];
              fetches[i] = fetch(stylesheet.href).then(r => r.text()).then(t => { return { url: stylesheet.href, text: t, order: i }; });
            }
            this.stylecachenames = this.getStylesheetList();
            Promise.all(fetches).then((stylesheets) => {
              var styletext = '';
              // Make sure stylesheets are loaded in the same order as in the page
              stylesheets.sort((a, b) => { return b.order - a.order; });
              for (var i = 0; i < stylesheets.length; i++) {
                styletext += stylesheets[i].text.replace(/\/\*[^\*]+\*\//g, '').replace(/</g, '&lt;');
              }
              this.styletext = styletext;
              this.updateCanvas(); 
            });
          } else {
            this.updateCanvas(); 
          }
*/
          this.updateCanvas(); 
          return this.canvas;
        }
        async updateCanvas() {
          if (this.loading) return;
          this.loading = true;

          var width = this.canvas.width,
              height = this.canvas.height;

          var ctx = this.canvas.getContext('2d');

          var imgtags = this.getElementsByTagName('img');
          var images = [],
              promises = [];

          if (!this.imagecache) this.imagecache = {};

          for (var i = 0; i < imgtags.length; i++) {
            if (imgtags[i].src.substring(0, 5) == 'data:') {
              //promises.push(this.fetchImage(imgtags[i].src));
              promises.push(new Promise(resolve => resolve(imgtags[i].src)));
              images[i] = imgtags[i].src;
            } else {
              promises.push(this.fetchImage(imgtags[i].src));
              images[i] = imgtags[i].src;
            }
          }

          if (this.stylesheetsChanged()) {
            await this.updateStylesheets();
          }

          Promise.all(promises).then((imgdata) => {

            for (var i = 0; i < imgtags.length; i++) {
              //content = content.replace(images[i], imgdata[i]);
              if (imgtags[i].src.substring(0, 5) != 'data:') {
                imgtags[i].src = imgdata[i];
              }
            }

            var content = this.outerHTML.replace(/<br\s*\/?>/g, '<div class="br"></div>');
            content = content.replace(/<hr\s*\/?>/g, '<div class="hr"></div>');
            content = content.replace(/<img(.*?)>/g, "<img$1 />");
            content = content.replace(/<input(.*?)>/g, "<input$1 />");

            for (var i = 0; i < imgtags.length; i++) {
              //content = content.replace(images[i], imgdata[i]);
              //imgtags[i].src = images[i];
            }


            var img = new Image();
            img.eager = true;
            var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
                       '<foreignObject requiredExtensions="http://www.w3.org/1999/xhtml" width="' + (width / this.canvasscale) + '" height="' + (height / this.canvasscale) + '" transform="scale(' + this.canvasscale + ')">' +
                       '<html xmlns="http://www.w3.org/1999/xhtml"><body class="dark janusweb">' +
                       '<style>' + encodeURIComponent(this.styletext) + '</style>' +
                       content +
                       '</body></html>' +
                       '</foreignObject>' +
                       '</svg>';
            var url = 'data:image/svg+xml,' + data;
            img.addEventListener('load', () => { 
              this.canvas.width = width;
              this.canvas.height = height;
              ctx.drawImage(img, 0, 0) 
              this.loading = false;
              elation.events.fire({element: this.canvas, type: 'asset_update'});
            });
            img.addEventListener('error', (err) => { 
              console.log('Error generating image from HTML', err, img, content);
              this.loading = false;
            });
            img.src = url;
          });
        }
        queryParentSelector(selector) {
          var node = this.parentNode;
          while (node) {
            if (node.matches && node.matches(selector)) {
              return node;
            }
            node = node.parentNode;
          }
          return null;
        }
        blobToDataURL(blob) {
          return new Promise((resolve, reject) => {
            var a = new FileReader();
            a.onload = function(e) {resolve(e.target.result);}
            a.readAsDataURL(blob);
          });
        }

        async fetchImage(src) {
          if (this.imagecache[src]) {
            return this.imagecache[src];
          } else {
            return fetch(this.getFullURL(src))
                      .then(r => r.blob())
                      .then(d => { let u = this.blobToDataURL(d); this.imagecache[src] = u; return u;});
          }
        }
        getFullURL(src) {
          // FIXME - egregious hack for CORS white building prototype.  Do not check this in!
          let proxyurl = 'https://p.janusvr.com/';
          if (src.indexOf(proxyurl) != 0) {
            return proxyurl + src;
          }
          return src;
        }
        toString() {
          if (!this.id) {
            this.id = elation.elements.getUniqueId(this.nodeName.toLowerCase());
          }
          return '#' + this.id;
        }
        fromString(str) {
          this.elements = elation.elements.fromString(str, this);
          return this.elements;
        }
        fromTemplate(tplname, obj) {
          this.elements = elation.elements.fromTemplate(tplname, this);
          return this.elements;
        }
        stylesheetsChanged() {
          if  (!this.styletext) return true;

          let stylesheets = this.getStylesheetList();
          if (stylesheets != this.stylecachenames) return true;

          return false;
        }
        async updateStylesheets(proxy='') {
          let fetches = [];
proxy = elation.engine.assets.corsproxy;
console.log('UPDATE STYLESHEETS');
          // Fetch all active stylesheets, so we can inject them into our foreignObject
          for (let i = 0; i < document.styleSheets.length; i++) {
            let stylesheet = document.styleSheets[i];
            fetches[i] = fetch(proxy + stylesheet.href).then(r => r.text()).then(t => { return { url: stylesheet.href, text: t, order: i }; });
          }
          this.stylecachenames = this.getStylesheetList();
          let stylesheets = await Promise.all(fetches);
          var styletext = '';
          // Make sure stylesheets are loaded in the same order as in the page
          stylesheets.sort((a, b) => { return b.order - a.order; });
          for (var i = 0; i < stylesheets.length; i++) {
            styletext += stylesheets[i].text.replace(/\/\*[^\*]+\*\//g, '').replace(/</g, '&lt;');
          }
          this.styletext = styletext;

          return styletext;
        }
        getStylesheetList() {
          return Array.prototype.map.call(document.styleSheets, n => n.href).join(' ');
        }
      };
    }
  });
});

