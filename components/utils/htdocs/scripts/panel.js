/*
**	elation panel component
**		
**		Contents:
**			Panel
*/

elation.extend('panel', new function(options) {
  this.panels = [];
  this.panelmap = {};
  this.preset_args = {};

	this.add = function(name, args, data, content, parent) {
		var newname = args.uid ? name + '_' + args.uid : name,
				preset_args = this.preset_args[newname];

		if (preset_args) {
			args.cfg = elation.utils.array_merge_recursive(args.cfg, preset_args);
		}

		//console.log(newname, args, preset_args);

		var panel = new elation.panel.obj(name, parent, args);

		if (this.panelmap[newname])
			this.panelmap[newname] += ',' + this.panels.length;
		else
			this.panelmap[newname] = this.panels.length + '';
		
		this.panels.push(panel);
  }

  this.get = function(name, all) {
    var ret = [], 
		    matches = [], 
		    panels = this.panels, 
		    map = this.panelmap;

    for (var key in map) {
    	if (key.search(new RegExp(name, "g")) >= 0)
    		matches.push(map[key]);
    }

    for (var i=0; i<matches.length; i++) {
    	var indexes = matches[i].split(',');

	    for (var j=0; j<indexes.length; j++)
    		ret.push(panels[indexes[j]]);
    }

		return all ? ret : ret[ret.length-1];
  }

  this.set_args = function(name, args) {
  	var map = this.panelmap[name];

  	if (map) {
			var	indexes = (typeof map == 'string' ? map.split(',') : [ map ]),
	  			index, i, panel;

	  	//console.log('[panel] attempt set_args', name, map, i, panel, args);
	  	
	  	for (var i=0; i<indexes.length; i++) {
	  		index = indexes[i];
	  		panel = this.panels[index];
	  		panel.initArgs.call(panel, args);
	  	}
  	} else {
	  	//console.log('[panel] storing set_args', name, map, args);
  		this.preset_args[name] = args;
  	}
	}
});

elation.extend('panel.obj', function(name, parent, args) {
	this.name = name;
	this.parent = parent;
  this.content = {};
	this.items = {};
	this.lis = [];

  this.init = function(args) {
		//alert('[panel] init start ' + name + ' ' + elation.utils.stringify(args.cfg));
  	
  	this.initArgs(args);
  	this.initElements(this.cfg);
		this.initItems(this.cfg.items);
		this.initObjectLinking(this.cfg.jsobject);
		this.initCaching();
    this.initAnimations();

	  elation.events.fire("panel_init", this);
	}

  this.initArgs = function(args) {
	  elation.utils.array_merge_recursive(this, args);

  	if (!this.args)
  		this.args = {};

  	for (var key in args.cfg)
  		if (typeof args.cfg[key] != 'object')
  			this.args[key] = args.cfg[key];
	}

	this.initElements = function(cfg) {
  	if (this.id)
			this.element = document.getElementById(this.id + '_inner' + (this.uid ? '_' + this.uid : ''));
		
    if (cfg.navigation) 
      this.container = document.getElementById(cfg.targetid);
  }

	this.initItems = function(items) {
		for (var key in items) {
			this.items[key] = new elation.panel.add_item(key, this, items[key]);
		}
	}

	this.initObjectLinking = function(object) {
    if (object && object != "false") {
      var instantiated_object = eval(object);
      
      if (typeof instantiated_object == 'function') {
        this.linked_object = new instantiated_object(elation.panel, this);
        
        // FIXME: this could be done better...
        elation[this.name] = this.linked_object;

        if (typeof this.linked_object.init == 'function')
          this.linked_object.init();
      } 
    }
  }

	this.initCaching = function() {
    if (this.container && this.item) {
			this.content = {};
    	this.content[this.item.name] = this.container.innerHTML;
	   	//console.log('[panel] init caching', this.item.name, this.container);
  	}
  }

	this.initAnimations = function() {
    var type = this.cfg.animation;
    
    if (type) {
      elation.html.addClass(this.container, 'animation_'+type+'_init');
      elation.html.addClass(this.container, 'animation_'+type);
    }
  }

  this.handleEvent = function(event) {
  	//alert('[panel] handleEvent: '+ event.type + ' #' + event.target.id)
		event = event || window.event;
		target = event.target || event.srcElement;
		
		switch (event.type) {
			case "click": 
				this.click(event, target); 
				break;
		}
	}
	
	this.click = function(event, target) {
		while (target && target.nodeName != 'LI') 
			target = target.parentNode;
		
		if (!target || elation.html.hasclass(target, 'tf_utils_state_disabled')) 
			return;
		
		var	item	= this.getItem(target);
		
		if (elation.utils.arrayget(item, 'args.unselectable'))
			return;
		
		event.preventDefault();
		event.stopPropagation();
		
		if (item && this.item && item.name == this.item.name)
			return;
		
		//if (!this.container && this.args.targetid || !item) {
		//	item = this.reinit(target);
		//}

		//console.log('[panel] EVENT click', item, this);
    
    if (!this.container && this.cfg.targetid) {
    	this.initAnimations();
    	this.container = elation.id('#'+this.cfg.targetid);
		}

		if (this.cfg.animation) 
      elation.html.removeClass(this.container, 'animation_'+this.cfg.animation);
		
    this.load_tab_content(target, item, '', event);
	}
	
	this.load_tab_content = function(target, item, msg, origin) {
		//console.log('[panel] tab load start: ' + this.name + ' ' + target.id);
    ajaxlib.xmlhttp.abort();
		
    this.origin = origin; 
		var	target = (typeof target == 'string')
					? document.getElementById(target)
					: target,
				item = item || this.getItem(target);
		
    if (typeof pandoraLog == 'object') {
			pandoraLog.mouseovertype = item.name;
    }
    
    if (typeof googleAnalytics == 'object') {
      googleAnalytics.mouseovertype = item.name;
      pagetype = googleAnalytics.pagetype;
      
      // FIXME - Tracking should NOT be in Elation Core.  Use custom events!
      switch (this.name) {
        case 'tabs':
          //googleAnalytics.trackEvent(['tab', item.name, pagetype]);
          //break;
        
        case "infocard_popup":
          //if( item.name == 'about_store') item.name = 'store';
          //if(this.tracking) googleAnalytics.trackEvent(['quick look tab', item.name,'',1,'false']);
          break;
        
        default:
          //if (pagetype)
            //googleAnalytics.trackEvent([this.name, item.name, pagetype]);
          //else
            //googleAnalytics.trackEvent([this.name, item.name]);
          
          break;
      }
    }

		if (!this.container) {
			var href = target.getElementsByTagName('a').length > 0
						? target.getElementsByTagName('a')[0].href
						: '';
			
			if (href) {
				var	query = elation.utils.arrayget(search, 'args.query') || '',
						queryString;
				
				// HACKY: stop tab switch reloading on default_query
				if (elation.default_query && query == elation.default_query)
					query = '';
				
				if (query)
					query = encodeURIComponent(query);
        
				(query) 
					? queryString = (elation.utils.indexOf(href,'?') == -1 ? '?' : '&') + 'query=' + query 
					: queryString = '';
        
				if ((query || !input) && href.search('/myfinds') === -1) {
				  window.location.href = href + queryString;
				} else if (input) {
          // FIXME - quick hack to disable the form-focus thing for tabs since we now have homepages for all of them
					if (true || href.search('/myfinds') !== -1) {
						window.location.href = href;
					}
					else {	
						var form = elation.utils.getParent(input, 'FORM');
						
						if (form) 
							form.action = href;
						
						elation.html.addclass(input, 'tf_util_form_error');
						input.focus();
					}
				}
			}
			
			this.select_item(item);

      //console.log('[panel] tab load ended:  no container', this.name, this, item);
			
			this.loadtab_status = 'no_container';
		  elation.events.fire("panel_tabload", this);
			
			return this.item = item;
		}
		
		this.select_item(item);
    this.item = item;

    if (!elation.utils.isTrue(this.cfg.nocache) && !elation.utils.isTrue(item.args.nocache)) {
      // if cached copy exists use that
      if (this.content && this.content[item.name]) {
        if (this.cfg.animation) {
        	var self = this;
          setTimeout(function() {
            elation.html.addClass(self.container, 'animation_'+self.cfg.animation);
            self.container.innerHTML = self.content[item.name];
          }, 200);
          delete self;
        }
        
      	//console.log('[panel] tab load ended: used cache version', this.name, item.name, this, item);
				
				this.loadtab_status = 'cached_version';
		  	elation.events.fire("panel_tabload", this);
		    
		    return;
      }
		}

		if (!this.container.style.minHeight)
			this.container.style.minHeight = this.container.offsetHeight + 'px';
		
		if (this.cfg.spinner || msg)
			this.container.innerHTML = msg || this.cfg.spinner;
		
    if (!item.args) {
      //console.log('[panel] load no args for ajax', item);
			
			this.loadtab_status = 'no_ajax';
		  elation.events.fire("panel_tabload", this);
		  
		  return;
    }
    
		// Merge args from both the panel and any specified contentcomponentargs
		var urlargs = elation.utils.array_merge_recursive(this.args, item.args.contentcomponentargs);
		
		urlargs['tab'] = item.args.argname;
		this.active_argname = item.args.argname;
		
		var parms = elation.utils.encodeURLParams(urlargs);
		
		// likely to do with the MyFinds Store/Brand picker
		// but written in a pseudo-generic way... 
		if (this.linked_object) {
      if (typeof this.linked_object.setTab == 'function')
        this.linked_object.setTab(target, item, this);
      
      if (this.linked_object.args)
        parms = parms + (parms ? '&' : '') + elation.utils.encodeURLParams(this.linked_object.args);
		}
    
		var componentname = item.args.contentcomponent || this.cfg.contentcomponent,
				self = this;
    
    //console.log('[panel] ajax fetching', this.name, item.name, urlargs, item, this);
    
    this.loadtab_ajaxparms = parms;
		this.loadtab_status = 'fetching_ajax';

		var ajax = new elation.server();

		// ajax-fetch tab content, here we go!
		ajax.Queue({
			method: 'POST',
			url: componentname,
			args: parms,
			callback: [ 
				this, 
				function(response) {
          if (self.cfg.animation) {
            setTimeout(function() {
              elation.html.addClass(self.container, 'animation_' + self.cfg.animation);
            }, 200);
          }

          if (self.jsobj && typeof self.jsobj.success == 'function') {
            self.jsobj.success(response);
          }
 
          self.content[item.name] = self.container.innerHTML;

					self.loadtab_status = 'ajax_loaded';
					elation.events.fire("panel_tabload_complete", this);
        }
			]
		});

		elation.events.fire("panel_tabload", this);
		delete self;
	}
  
	this.select_item = function(item) {
		var	li = elation.utils.arrayget(item, 'element');
    
    if (!li)
      return;
    
    var li = li.length > 0 ? li[0] : li;
		
		if (elation.html.hasclass(li, 'tf_utils_state_disabled'))
			return;
		
		if (this.li) 
			elation.html.removeclass(this.li, 'selected');
		
		elation.html.addclass(li, 'selected');

    //make a GA call for quick look view
    //  This code does NOT belong in elation core panel.js!  There shouldn't be any tracking code here.
    //  furthermore this code runs on every panel wether it has to do with the QL or not... WHY?
    /*
    if(this.tracking){
      setTimeout( function() {
       elation.results.view.quicklook_view();
      }, 1000);
    }
    */

		return this.li = li;
	}
	
	this.getItem = function(target) {
		for (var key in this.items) {
			var	item = this.items[key],
					element = item.element;
			
			if (target == element) 
				return item;
		}
		
		return false;
	}
	
	this.init(args);
});

elation.extend('panel.add_item', function(name, panel, args) {
  this.name = name;
  this.args = args || {};
  this.panel = panel;
	
  this.init = function(args) {
    if (!this.panel) 
			return;

		var panel = this.panel,
				elements = elation.find('li#'+panel.id+'_'+this.name);

		if (elements)
			for (var i=0; i<elements.length; i++)
				if (elation.utils.arrayget(elements[i], 'parentNode.parentNode.id') == panel.element.id)
					var element = this.element = elements[i];

		if (!element)
			return;

		//console.log('[panel] add_item ' + this.name + ' ' + element.id, element, elements);
    elation.events.add(element, 'click', panel);
    element.onselectstart = function() { return false; };
    
    if (elation.utils.isTrue(args.selected) && args.contentcomponent && elation.utils.isTrue(args.nopopup)) {
      (function(self) {
        setTimeout(function() {
          panel.load_tab_content.call(panel, element, self);
        }, 1);
      })(this);
    }

		if ((args.disableiffalse && !elation.utils.isTrue(panel.args[args.disableiffalse])) 
			  || (args.disableiftrue && elation.utils.isTrue(panel.args[args.disableiftrue])) 
			  || (args.disableifempty && elation.utils.isEmpty(panel.args[args.disableifempty]))) {
			
			elation.html.addclass(element, 'tf_utils_state_disabled');
      
      if (args.disabledtype)
				elation.html.addclass(element, 'tf_utils_state_disabled_'+args.disabledtype);
    }

    if (elation.utils.isTrue(args.selected)) {
    	panel.item = this;
    	panel.li = element;
    }

    panel.lis.push(element);

		// FIXME: is this still used for anything?
		if (args.contentcomponent && !args.nopopup && element) {
			var panelname = this.panel.name.replace(/\./g, "_") + "_" + this.name;
			
			//console.log('[panel_items] ######### POPUP USED', panelname, this);
		}
  }
	
  this.init(args);
});

/* takem from panel item obj, probably not needed anymore, but here for safe keeping
elation.ui.infobox.add(
	panelname, 
	{
		width:			this.args.contentwidth		|| '20em',
		titlebar:		this.args.contenttitle		|| true,
		label:			this.args.contentlabel		|| false,
		loading:		this.args.contentloading	|| false,
    fullscreen: this.args.fullscreen			|| false,
    absolute:   this.args.absolute				|| false,
    animation:  this.cfg.animation				|| '',
		lightbox: 	'tf_infobox_lightbox',
		border:			'div',
		classname:	'tf_myfinds_infobox_popup',
		activecss:	'tf_myfinds_infobox_selected',
		bgcolor:		'white',
		event:			'click',
		tailsrc:		'div',
    killscroll: true,
		vertical:		true,
		nocache:		true,
		resize:   	true,
		ajax:				true
	},
	this.args.contentcomponentargs || null,
	"/" + this.args.contentcomponent.replace(/\./, "/"),
	this.element
);
*/

/*
this.reinit = function(target) {
  target = target || elation.find('div.tf_utils_panel_' + this.name + ' ul li.selected', true);
	//this.set_items();
	this.container = elation.id('#'+this.args.targetid);
	this.item = this.get_item(target);
	console.log('[panel] re-init', this.name, this.item.name, this.item);
	this.content = {};
   	
 	if (this.container.innerHTML)
 		this.content[this.item.name] = this.container.innerHTML;

	this.initAnimations();

	return this.item || false;
}
*/
