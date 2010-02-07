elation.extend('utils.button', function(args, container) {
    this.init = function(args, container) {
        this.tag = args.tag || "BUTTON";
        this.classname = args.classname || "";
        this.label = args.label || "Submit";
        this.title = args.title || false;
        this.draggable = args.draggable || false;
        this.events = args.events || {}
        this.create();
  
        if (typeof(container) != 'undefined')
            this.addTo(container);
    }
    this.create = function() {
        this.element = document.createElement(this.tag);
        this.element.innerHTML = this.label;
        var classname = '';
        if (this.draggable) {
            classname = 'tf_utils_button_draggable';
            this.element.draggable = true;
        }
        classname += this.classname;
        this.element.className = classname;
        if (this.title)
          this.element.title = this.title;
  
        for (var k in this.events) {
            elation.events.add(this.element, k, this.events[k]);
        }
    }
    this.addTo = function(container) {
        if (typeof container != 'undefined') {
            container.appendChild(this.element);
            return true;
        }
        return false;
    }
    this.setLabel = function(label) {
        this.label = label;
        if (this.element)
            this.element.innerHTML = label;
    }
    this.init(args, container);
});

