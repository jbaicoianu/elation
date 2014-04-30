/*
**	elation panel component
**		
**		Contents:
**			Panel
*/

elation.extend('panel', new function(options) {
  this.panels = [];
  this.panelmap = {};

	this.add = function(name, args, data, content, parent) { //return;
		var panel = new elation.panel.obj(name, parent, args),
				name = args.uid ? name + '_' + args.uid : name;

		if (this.panelmap[name])
			this.panelmap[name] += ',' + this.panels.length;
		else
			this.panelmap[name] = this.panels.length;
		
		this.panels.push(panel);
  }

  this.get = function(name) {
  	return this.panels[this.panelmap[name]];
  }

  this.set_args = function(name, args) {
  	console.log('[panel] attempt set_args', name, this.panelmap[name], typeof this.panels[this.panelmap[name]], args);
  	return this.panels[this.panelmap[name]].set_args(args);
  }
});

elation.extend('panel.obj', function(name, parent, args) {
	this.name = name;
	this.parent = parent;
  this.args = args;
  this.content = {};

  this.init = function(args) {
		console.log('[panel] init start', name, args, this);
    if (args) {
		  this.cfg = args.cfg;

	  	if (args.id)
				this.element = elation.id("#" + args.id + (args.uid ? '_' + args.uid : ''));
			
			this.set_items(args); 

      if (this.cfg) {
        if (this.cfg.jsobject && this.cfg.jsobject != "false") {
          var obj = eval(this.cfg.jsobject);
          
          if (typeof obj == 'function') {
            this.jsobj = new obj(elation.panel, this);
            
            // FIXME: this could be done better...
            elation[this.name] = this.jsobj;

            if (typeof this.jsobj.init == 'function')
              this.jsobj.init();
          }
        }
        if (this.cfg.navigation == "true") {
          this.container = elation.id('#' + this.cfg.targetid);

          console.log('[panel] init navigation', this.cfg.targetid, this.container);
    			this.lis = elation.find('#'+ args.id + (args.uid ? '_' + args.uid : '') + ' ul li');

          for (var i=0; i<this.lis.length; i++) {
            if (elation.html.hasclass(this.lis[i], 'selected')) {
              this.li = this.lis[i];
          	}
          }

          for (var key in this.items) {
            var	item = this.items[key],
                element = item.element;
            
           	//console.log('[panel] init selected item', this.name, item, element);
            if (element) {
              elation.events.add(element, 'click', this);
              element.onselectstart = function() { return false; };
              
              if (item.args.selected && item.args.contentcomponent && item.args.nopopup) {
                (function(self, buh, el) {
                  setTimeout(function() {
                    self.load_tab_content(el, buh);
                  }, 1);
                })(this, item, element);
              }
            }
          }
          
          this.item = this.get_item(elation.find('div.tf_utils_panel_' + name + ' ul li.selected', this.element, true));
        }
        
        this.initAnimations();
      }
      
      console.log('[panel] init save content', this.container, this.item, elation.find('div.tf_utils_panel_' + name + ' ul li.selected', true));
      if (this.container && this.item) {
				this.content = {};
      	this.content[this.item.name] = this.container.innerHTML;
    	}
		}

	  elation.events.fire("panel_init", this);
	}
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
	this.set_items = function(args) {
		this.items = {};

		console.log('[panel] set_items', this.name, this, this.args.cfg, this);
		if (this.cfg && this.cfg.items) {
			for (var key in this.cfg.items) {
				this.items[key] = new elation.panel.add_item(key, this, this.cfg.items[key]);
			}
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
		
		var	item	= this.get_item(target);
		
		if (elation.utils.arrayget(item, 'args.unselectable'))
			return;
		
		event.preventDefault();
		event.stopPropagation();
		
		if (item && this.item && item.name == this.item.name)
			return;
		
		//if (!this.container && this.args.targetid || !item) {
		//	item = this.reinit(target);
		//}

		console.log('[panel] EVENT click', item, this);
    
    if (!this.container && this.cfg.targetid) {
    	this.initAnimations();
    	this.container = elation.id('#'+this.cfg.targetid);
		}

		if (this.cfg.animation) 
      elation.html.removeClass(this.container, 'animation_'+this.cfg.animation);
		
    this.load_tab_content(target, item);
	}
	
	this.load_tab_content = function(target, item, msg) {
		console.log('[panel] tab load start', this.name, item, target, msg);
    ajaxlib.xmlhttp.abort();
		
    //this.tracking = true;
    //if(item == null){
      ////if item is null, This function is invoked manually instead of a click event
      ////set tracking false
      //this.tracking = false;
    //}
    
		var	target = (typeof target == 'string')
					? document.getElementById(target)
					: target,
				item = item || this.get_item(target);
		
    if (typeof pandoraLog == 'object') {
			pandoraLog.mouseovertype = item.name;
    }
    
    if (typeof googleAnalytics == 'object') {
      googleAnalytics.mouseovertype = item.name;
      pagetype = googleAnalytics.pagetype;
      
      switch (this.name) {
        case 'tabs':
          googleAnalytics.trackEvent(['tab', item.name, pagetype]);
          break;
        
        case "infocard_popup":
          //if( item.name == 'about_store') item.name = 'store';
          //if(this.tracking) googleAnalytics.trackEvent(['quick look tab', item.name,'',1,'false']);
          break;
        
        default:
          if (pagetype)
            googleAnalytics.trackEvent([this.name, item.name, pagetype]);
          else
            googleAnalytics.trackEvent([this.name, item.name]);
          
          break;
      }
    }

		if (!this.container) {
			var href = target.getElementsByTagName('a').length > 0
						? target.getElementsByTagName('a')[0].href
						: '';
			
			if (href) {
				var	input = elation.find('input.tf_search_input_element')[0],
            query = input 
              ? input.value
              : '',
						queryString;
				
				// HACKY: stop tab switch reloading on default_query
				if (elation.default_query && query == elation.default_query)
					query = '';
				
				if (query)
					query = encodeURIComponent(query);
        
				(query) ? queryString = (href.indexOf('?') == -1 ? '?' : '&') + 'query=' + query : queryString = '';
        
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

      console.log('panel tab load ended:  no container', this.name, this, item);
			
			this.loadtab_status = 'no_container';
		  elation.events.fire("panel_tabload", this);
			
			return this.item = item;
		}
		
		this.select_item(item);
		
		// cache content of tab for later retrieval
		if (!this.cfg.nocache) {
      //console.log('switch',panel, panel.container);
			//if (!panel.fetching && !panel.content[panel.item.name]) // dont save content if content is being fetched
    }
    
    this.item = item;
    if (!this.cfg.nocache && !this.args.nocache) {
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
        
      	console.log('[panel] tab load ended: used cache version', this.name, item.name, this, item);
				
				this.loadtab_status = 'cached_version';
		  	elation.events.fire("panel_tabload", this);
		  	elation.events.fire("panel_tabload_cached", this);
		    
		    return;
      }
		}

		if (!this.container.style.minHeight)
			this.container.style.minHeight = this.container.offsetHeight + 'px';
		
		if (this.cfg.spinner || msg)
			this.container.innerHTML = msg || this.cfg.spinner;
		
		// Merge args from both the panel and any specified contentcomponentargs
		var urlargs = {};
		
		if (typeof this.args == 'object') 
			for (var k in this.args) 
				if (typeof this.args[k] != 'object') 
					urlargs[k] = this.args[k];
		
    if (!item.args) {
      console.log('[panel] load no args for ajax', item);
			
			this.loadtab_status = 'no_ajax';
		  elation.events.fire("panel_tabload", this);
		  
		  return;
    }
    
		if (typeof item.args.contentcomponentargs == 'object') 
			for (var k in item.args.contentcomponentargs) 
				if (item.args.contentcomponentargs.hasOwnProperty(k)) 
					urlargs[k] = item.args.contentcomponentargs[k];
		
		urlargs['targetid'] = this.cfg.targetid;
		urlargs['tab'] = item.args.argname;
		this.active_argname = item.args.argname;
		
		var parms = elation.utils.encodeURLParams(urlargs);
		
		if (this.jsobj) {
      if (typeof this.jsobj.setTab == 'function')
        this.jsobj.setTab(target, item, this);
      
      if (this.jsobj.args)
        parms = parms + (parms ? '&' : '') + elation.utils.encodeURLParams(this.jsobj.args);
		}
    
		var componentname = item.args.contentcomponent || this.cfg.contentcomponent,
				self = this;
    
    console.log('[panel] ajax fetching', this.name, item.name, parms);
    this.loadtab_ajaxparms = parms;

		// ajax-fetch tab content
		ajaxlib.Queue({
			url: componentname, 
			args: parms,
			callback: [ 
				this, 
				function(response) {
					// tab fade-in effect
					//if (elation.browser && elation.browser.type != 'msie')
					//	$TF(panel.container).css({ opacity: 0 })
					//		.animate({ opacity: 1 }, 'fast')
					//		.animate({ opacity: 'auto' }, 0);
					
          if (self.cfg.animation) {
            setTimeout(function() {
              elation.html.addClass(self.container, 'animation_' + self.cfg.animation);
            }, 200);
          }
          if (self.jsobj && typeof self.jsobj.success == 'function') {
            self.jsobj.success(response);
          }
 
          self.content[item.name] = self.container.innerHTML;
					elation.events.fire("panel_tabload_complete", this);
        }
			]
		});

		this.loadtab_status = 'fetching_ajax';
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
	
  this.set_args = function(args) {
		console.log('[panel] set_args', this.name, args, this);
		var item;

    for (var key in args) 
      elation.utils.arrayset(this.args, key, args[key]);
		
		for (var key in this.items) {
			item = this.items[key];
			
			if ((item.args.disableiffalse && !elation.utils.isTrue(args[item.args.disableiffalse])) || (item.args.disableiftrue && elation.utils.isTrue(args[item.args.disableiftrue])) || (item.args.disableifempty && elation.utils.isEmpty(args[item.args.disableifempty]))) {
				elation.html.addclass(item.element, 'tf_utils_state_disabled');
        
        if (item.args.disabledtype)
					elation.html.addclass(item.element, 'tf_utils_state_disabled_'+item.args.disabledtype);
      }
		}

		//this.init(args);
	}
	
	this.get_item = function(target) {
		console.log('[panel] get_item', this.name, target, this.items);
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

		this.element = elation.find('li#'+this.panel.args.id+'_'+this.name, this.panel.element, true);
		
		//console.log('panel add_item', this.name, this.panel.element, this.panel, this.element);
		
		// FIXME: is this still used for anything?
		if (this.args.contentcomponent && !this.args.nopopup && this.element) {
			var panelname = this.panel.name.replace(/\./g, "_") + "_" + this.name;
			
			console.log('[panel_items] ######### POPUP USED', panelname, this);
			/*
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
		}
  }
	
  this.init(args);
});
