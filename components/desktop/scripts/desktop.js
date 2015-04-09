elation.require("ui.base", function() {
  elation.component.add("desktop.DesktopManager", function() {
    this.defaultcontainer = {tag: 'div', classname: 'desktop'};
    this.init = function() {
			var create = elation.html.create;

			this.IconManager = new elation.desktop.IconManager(null, create('ul', 'icons', null, null, this.container), {});
			this.TaskManager = new elation.desktop.TaskManager(null, create('ul', 'tasks', null, null, this.container), {});
			//this.WindowManager = new elation.window.manager(null, create('ul', 'windows', null, null, this.container), {});
		}
  }, elation.ui.base);

  elation.component.add("desktop.TaskManager", function() {
    this.init = function() {
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
			this.icons = [];
    }

    this.add = function(icon) {[]
    	this.icons.push(icon);
    	this.container.appendChild(icon.container);
    }
  }, elation.ui.base);
	
	elation.component.add("desktop.Icon", function() {
    this.defaultcontainer = {tag: 'div', classname: 'icon noselect'};
    this.init = function() {
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

      // FIXME - the world isn't quite ready for this yet...
      //this.moveable = elation.ui.moveable('icon_'+this.args.name, this.container, {});

  		elation.events.add(this.container, 'click,mousedown,touchstart', this);
    }

    this.execute = function() {
      var args = this.args,
          content = args.content;

      switch (args.type) {
        case 'HTML':
          break;
        case 'IMG':
          break;
        case 'WWW':
          break;
        default:
          var content = elation.utils.arrayget(elation, content)(
            null, null, { parent: this }
          );
          break;
      }

      var index = elation.window.manager.windows.length,
          wintype = args.windowtype || 'none',
          winargs = {
            windowname: args.windowname || null,
            name: args.windowid || null,
            append: document.body,
            parent: this.picture,
            title: args.title, 
            content: typeof content == 'string' ? content : content.container,
            top: 50 + (30 * index),
            left: 100 + (30 * index)
          };

      console.log('init window', args.windowname, wintype, winargs, index, content)
      if (wintype == 'none')
        this.window = content.window;
      else {
        this.window = new elation.utils.arrayget(elation, wintype)(winargs.name, null, winargs);
      }

      if (typeof content == 'object') {
        content._window = this.window;
      }
    }

    this.click = function(event) {
    	//if (!this.window) {
        this.execute();
    	//}

    	if (this.window && !this.window.visible) {
    		this.window.open();

        (function(self) {
          setTimeout(function(){
            self.window.focus();
          }, 2);
        })(this);
      }
    }

    this.mousedown = function(event) {
    	//console.log(event.type, event);
    	elation.html.addclass(this.container, 'icon_active icon_spin');
    	elation.events.add(document.body, 'mousemove,mouseup', this)
    }

    this.mousemove = function(event) {
    	//console.log(event.type, event);
    }

    this.mouseup = function(event) {
    	//console.log(event.type, event);
    	elation.html.removeclass(this.container, 'icon_active');
    	elation.events.remove(document.body, 'mousemove,mouseup', this);
      (function(self) {
        setTimeout(function() {
          elation.html.removeclass(self.container, 'icon_spin');
        },800)
      })(this);
    }

    this.touchstart = this.mousedown;
    this.touchmove = this.mousemove;
    this.touchend = this.mouseup;
  }, elation.ui.base);
});