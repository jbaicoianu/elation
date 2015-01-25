elation.require("ui.base", function() {
  elation.component.add("desktop.DesktopManager", function() {
    this.defaultcontainer = {tag: 'div', classname: 'desktop'};
    this.init = function() {
			console.log('desktop', this);
			var create = elation.html.create;

			this.IconManager = new elation.desktop.IconManager(null, create('ul', 'icons', null, null, this.container), {});
			this.TaskManager = new elation.desktop.TaskManager(null, create('ul', 'tasks', null, null, this.container), {});
			this.WindowManager = new elation.desktop.WindowManager(null, create('ul', 'windows', null, null, this.container), {});
			/*
			this.IconManager.add('APP','System','');
			this.IconManager.add('APP','Terminal',elation.hack.terminal(null, null, {}));
			this.IconManager.add('APP','IRC','');
			this.IconManager.add('APP','Network Map','');
			this.IconManager.add('IMG','zuul','<img width="640" src="http://www.meobets.com/~lazarus/zuul.jpg">');
			*/
		}
  }, elation.ui.base);
  
  elation.component.add("desktop.WindowManager", function() {
    this.defaultcontainer = {tag: 'div', classname: 'windows'};
    this.init = function() {
			console.log('WindowManager', this);
			this.windows = [];
			this.zIndexStart = 1000;
			elation.events.add(null, 'focus', this);
    }

    this.focus = function(event) {
    	if (!event.element || event.element.name != 'ui.window')
    		return;

    	for (var i=0; i<this.windows.length; i++) {
    		if (this.windows[i].window == event.element) {
    			var item = this.windows.splice(i, 1)[0];
    		}
    	}

    	if (item) {
	    	this.windows.push(item);

	    	for (var i=0; i<this.windows.length; i++) {
					this.windows[i].window.container.style.zIndex = this.zIndexStart + i;
				}
			}
    }

    this.add = function(name, args) {
    	var item = elation.desktop.Window(
    		name, 
    		elation.html.create({
    			tag: 'li',
    			classname: 'window_' + name,
    			append: this.container
    		}), 
    		args || {}
    	);

			item.window.container.style.zIndex = this.zIndexStart + this.windows.length;
    	this.windows.push(item);

    	return item;
    }
  }, elation.ui.base);

	elation.component.add("desktop.Window", function() {
    this.init = function() {
			console.log('Window', this);
			this.DesktopManager = elation.component.fetch('desktop.DesktopManager', 'main');

			var args = this.args.args,
          content = args.content;

			switch(args.type) {
				case 'IMG': 
					break;
				default:
					var content = elation.utils.arrayget(elation, content)(
						args.name, 
						null, { 
							parent: this
						}
					);
          console.log('!!! content',content);
					break;
			}
      
			var index = this.DesktopManager.WindowManager.windows.length,
          wintype = args.windowtype || ui.window,
					winargs = {
						append: document.body, 
						title: args.name, 
		        content: content//,
		        //top: 50 + (30 * index),
		        //left: 100 + (30 * index)
		      };

          console.log('elation.'+wintype, args.name, winargs);
			this.window = elation.utils.arrayget(elation, wintype)(args.name, null, winargs);
    }
  }, elation.ui.base);

  elation.component.add("desktop.TaskManager", function() {
    this.init = function() {
			console.log('TaskManager', this);
			this.tasks = [];
    }

    this.add = function(name, args) {
    	var task = elation.desktop.Task(
    		name, 
    		elation.html.create({
    			tag: 'li',
    			classname: 'task_' + name,
    			content: name,
    			append: this.container
    		}), 
    		args || {}
    	);

    	this.tasks.push(task);
    }
  }, elation.ui.base);

	elation.component.add("desktop.Task", function() {
    this.defaultcontainer = {tag: 'div', classname: 'task'};
    this.init = function() {
			console.log('Task', this);
    }
  }, elation.ui.base);

  elation.component.add("desktop.IconManager", function() {
    this.init = function() {
			console.log('IconManager', this);
			this.icons = [];
    }

    this.add = function(icon) {
    	this.icons.push(icon);
    	this.container.appendChild(icon.container);
    }
  }, elation.ui.base);
	
	elation.component.add("desktop.Icon", function() {
    this.defaultcontainer = {tag: 'div', classname: 'icon noselect'};
    this.init = function() {
			console.log('Icon', this);
			elation.html.addclass(this.container, 'icon_type_'+this.args.type);

			this.DesktopManager = elation.component.fetch('desktop.DesktopManager', 'main');

      this.picture = elation.html.create({
        tag: 'div',
        classname: 'icon_picture hexagon',
        append: this.container
      });
      
      this.picture_inner = elation.html.create({
        tag: 'div',
        classname: 'icon_picture hexagon inner',
        append: this.picture
      });

			this.picture_label = elation.html.create({
  			tag: 'span',
  			classname: 'icon_picture_label',
  			content: this.args.type,
  			append: this.picture_inner
  		});

			elation.html.create({
  			tag: 'span',
  			classname: 'icon_label',
  			attributes: {
  				//"contentEditable": 'true'
  			},
  			content: this.args.name,
  			append: this.container
  		});

  		this.DesktopManager.IconManager.add(this);

  		elation.events.add(this.container, 'click,mousedown,touchstart', this);
    }

    this.click = function(event) {
    	console.log(event.type, event);
    	if (!this.window) {
    		this.window = this.DesktopManager.WindowManager.add(this.args.name, this, this.args).window;
    	}

    	if (!this.window.visible) {
    		this.window.open();
    	}

  		//this.window.focus();
    }

    this.mousedown = function(event) {
    	//console.log(event.type, event);
    	elation.html.addclass(this.container, 'icon_active');
    	elation.events.add(document.body, 'mousemove,mouseup', this)
    }

    this.mousemove = function(event) {
    	console.log(event.type, event);
    }

    this.mouseup = function(event) {
    	console.log(event.type, event);
    	elation.html.removeclass(this.container, 'icon_active');
    	elation.events.remove(document.body, 'mousemove,mouseup', this)
    }

    this.touchstart = this.mousedown;
    this.touchmove = this.mousemove;
    this.touchend = this.mouseup;
  }, elation.ui.base);
});