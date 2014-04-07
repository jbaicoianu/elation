/*
**	elation panel component
**		
**		Contents:
**			Panel
*/

elation.extend('panel', new function(options) {
  this.options = options;
  this.panels = [];
  this.panelmap = {};

	this.add = function(name, args, data, content, parent) {
    if (!this.panelmap[name]) {
    	//console.log(name, args, data, content, parent);
			this.panelmap[name] = this.panels.length;
			this.panels.push(args || {});
    }
		
		this.Init(name, args);
  }

  this.Init = function(name, args) {
		//console.log('attemping to Init', name, args);

    var panel = this.panels[this.panelmap[name]] || null;
		
    if (args) {
			if (args.id)
				panel.element = $TF("#"+args.id);
			
			if (args.targetid)
				panel.cfg.targetid = args.targetid;

			panel.items = {};
			if (args.cfg && args.cfg.items) {
				$TF.each(args.cfg.items, function(k, v) {
					panel.items[k] = new elation.panel.add_item(k, v, panel);
				});
			}
      if (panel.cfg) {
        if (panel.cfg.jsobject && panel.cfg.jsobject != "false") {
          var obj = eval(panel.cfg.jsobject);
          
          if (typeof obj == 'function') {
            panel.jsobj = new obj(this, panel);
            elation[panel.name] = panel.jsobj;

            if (typeof panel.jsobj.init == 'function')
              panel.jsobj.init();
          }
        }
        if (panel.cfg.navigation == "true") {
          panel.container = document.getElementById(panel.cfg.targetid);
          this.lis = $TF('div.tf_utils_panel_' + name + ' ul li');;
          
          for (var i=0; i<this.lis.length; i++) {
            if (elation.html.hasclass(this.lis[i], 'selected')) {
              panel.li = this.lis[i];
          	}
          }

          for (var key in panel.items) {
            var	item = panel.items[key],
                element = item.element;
            
            if (typeof element == 'object' && element.length > 0) {
              elation.events.add(element[0], 'click', this);
              element[0].onselectstart = function() { return(false); };
              
              
              if (item.args.selected && item.args.contentcomponent && item.args.nopopup) {
                (function(self, buh, el) {
                  setTimeout(function() {
                    self.load_tab_content(panel, el, buh);
                  },1);
                })(this, item, element[0]);
              }
              
            }
          }
          
          panel.item = this.get_item(panel, $TF('div.tf_utils_panel_' + name + ' ul li.selected')[0]);
        }
        
        if (panel.cfg.animation) {
          var type = panel.cfg.animation;
          
          elation.html.addClass(panel.container, 'animation_'+type+'_init');
          elation.html.addClass(panel.container, 'animation_'+type);
        }
      }
      
      if (panel.container) {
				panel.content = {};
      	panel.content[panel.item.name] = panel.container.innerHTML;
    	}
		}
		//console.log('Init panel', panel, panel.container);
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
		
		// find the proper panel for event and item for target
		for (var key in this.panelmap) {
			var	panel	= this.panels[this.panelmap[key]],
					item	= this.get_item(panel, target);
			
			if (item)
				break;
		}
		
		if (elation.utils.arrayget(item, 'args.unselectable'))
			return;
		
		event.preventDefault();
		event.stopPropagation();
		
		if (item.name == panel.item.name)
			return;
		
    if (panel.cfg.animation) 
      elation.html.removeClass(panel.container, 'animation_'+panel.cfg.animation);
		
    this.load_tab_content(panel, target, item);
	}
	
	this.load_tab_content = function(panel, target, item, msg) {
		//console.log('load tab',panel, item, target, msg);
    ajaxlib.xmlhttp.abort();

    this.tracking = true;
    if(item == null){
      //if item is null, This function is invoked manually instead of a click event
      //set tracking false
      this.tracking = false;
    }
    
		var	target = (typeof target == 'string')
					? document.getElementById(target)
					: target,
				panel = (typeof panel == 'object')
					? panel
					: this.panels[this.panelmap[panel]],
				item = item || this.get_item(panel, target);
		
    if (typeof pandoraLog == 'object') {
			pandoraLog.mouseovertype = item.name;
    }
    
    if (typeof googleAnalytics == 'object') {
      googleAnalytics.mouseovertype = item.name;
      pagetype = googleAnalytics.pagetype;
      
      switch (panel.name) {
        case 'tabs':
          googleAnalytics.trackEvent(['tab', item.name, pagetype]);
          break;
        
        case "infocard_popup":
          if( item.name == 'about_store') item.name = 'store';
          if(this.tracking) googleAnalytics.trackEvent(['quick look tab', item.name,'',1,'false']);
          break;
        
        default:
          if (pagetype)
            googleAnalytics.trackEvent([panel.name, item.name, pagetype]);
          else
            googleAnalytics.trackEvent([panel.name, item.name]);
          
          break;
      }
    }
    
		if (!panel.container) {
			var href = target.getElementsByTagName('a').length > 0
						? target.getElementsByTagName('a')[0].href
						: '';
			
			if (href) {
				var	input = elation.find('input.tf_search_input_element')[0],
            query = input 
              ? input.value
              : '',
						queryString;
				
				// stop tab switch reloading on default_query
				if (query == elation.default_query)
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
			
			this.select_item(item, panel);
			
    //console.log('container',panel);
			return panel.item = item;
		}
		
		this.select_item(item, panel);
		
		// cache content of tab for later retrieval
		if (!panel.cfg.nocache) {
      //console.log('switch',panel, panel.container);
			//if (!panel.fetching && !panel.content[panel.item.name]) // dont save content if content is being fetched
				
    }
    
    panel.item = item;
    if (!panel.cfg.nocache && !item.args.nocache) {
      // if cached copy exists use that
      if (panel.content[item.name]) {
        if (panel.cfg.animation) {
          setTimeout(function() {
            elation.html.addClass(panel.container, 'animation_'+panel.cfg.animation);
            panel.container.innerHTML = panel.content[item.name];
          }, 200);
        }
        
    //console.log('cached',item);
        return;
      }
		} else {
			// tab fade-in effect
			//if (elation.browser && elation.browser.type != 'msie')
			//	$TF(panel.container).animate({ opacity: 0 }, 'fast');
		}
		if (!panel.container.style.minHeight)
			panel.container.style.minHeight = panel.container.offsetHeight + 'px';
		
		if (panel.cfg.spinner || msg)
			panel.container.innerHTML = msg || panel.cfg.spinner;
		
		// Merge args from both the panel and any specified contentcomponentargs
		var urlargs = {};
		
		if (typeof panel.args == 'object') 
			for (var k in panel.args) 
				if (panel.args.hasOwnProperty(k)) 
					urlargs[k] = panel.args[k];
		
    //console.log('args?',item);
    if (!item.args)
      return;
    
		if (typeof item.args.contentcomponentargs == 'object') 
			for (var k in item.args.contentcomponentargs) 
				if (item.args.contentcomponentargs.hasOwnProperty(k)) 
					urlargs[k] = item.args.contentcomponentargs[k];
		
		urlargs['targetid'] = panel.cfg.targetid;
		urlargs['tab'] = item.args.argname;
		panel.active_argname = item.args.argname;
		
		var parms = elation.utils.encodeURLParams(urlargs);
		
		if (panel.jsobj) {
      if (typeof panel.jsobj.setTab == 'function')
        panel.jsobj.setTab(target, item, panel);
      
      if (panel.jsobj.args)
        parms = parms + (parms ? '&' : '') + elation.utils.encodeURLParams(panel.jsobj.args);
		}
    
		var componentname = item.args.contentcomponent || panel.cfg.contentcomponent;
    
    //console.log('ajax',parms); 
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
					
          if (panel.cfg.animation) {
            setTimeout(function() {
              elation.html.addClass(panel.container, 'animation_'+panel.cfg.animation);
            }, 200);
          }
          if (panel.jsobj && typeof panel.jsobj.success == 'function') {
            panel.jsobj.success(response);
          }
 
          panel.content[item.name] = panel.container.innerHTML;
        }
			]
		});
	}
  
	this.select_item = function(item, panel) {
		var	li = elation.utils.arrayget(item, 'element');
    
    if (!li)
      return;
    
    var li = li.length > 0 ? li[0] : li;
		
		if (elation.html.hasclass(li, 'tf_utils_state_disabled'))
			return;
		
		if (panel.li) 
			elation.html.removeclass(panel.li, 'selected');
		
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

		return panel.li = li;
	}
	
  this.set_args = function(panelname, args) {
		var panel, item;
  	if (panel = this.panels[this.panelmap[panelname]]) {
  		//console.log('setting args',panelname, panel, args);
      for (var key in args) 
        elation.utils.arrayset(panel.args, key, args[key]);
			
			for (var item_key in panel.items) {
				item = panel.items[item_key];
				if ((item.args.disableiffalse && !elation.utils.isTrue(args[item.args.disableiffalse])) || (item.args.disableiftrue && elation.utils.isTrue(args[item.args.disableiftrue])) || (item.args.disableifempty && elation.utils.isEmpty(args[item.args.disableifempty]))) {
					elation.html.addclass(item.element[0], 'tf_utils_state_disabled');
          
          if(item.args.disabledtype)
  					elation.html.addclass(item.element[0], 'tf_utils_state_disabled_'+item.args.disabledtype);
        }
			}

			this.Init(panelname, panel.args);
		}
  }
	
	this.get_item = function(panel, target) {
		for (var key in panel.items) {
			var	item = panel.items[key],
					element = item.element[0];
			
			if (target == element) 
				return item;
		}
		
		return false;
	}
	
  this.add_item = function(name, args, panel, content) {
    this.name = name;
    this.args = args || {};
    this.panel = panel;
		
    this.init = function() {
      if (!this.panel) 
				return;
			
			this.element = $TF("ul.tf_utils_panel_content li#" + this.panel.id + "_" + this.name);
			
			if (this.args.contentcomponent && !this.args.nopopup && this.element.length > 0) {
				var panelname = this.panel.name.replace(/\./g, "_") + "_" + this.name;
				
				elation.ui.infobox.add(
					panelname, 
					{
						width:			this.args.contentwidth		|| '20em',
						titlebar:		this.args.contenttitle		|| true,
						label:			this.args.contentlabel		|| false,
						loading:		this.args.contentloading	|| false,
            fullscreen: this.args.fullscreen			|| false,
            absolute:   this.args.absolute				|| false,
            animation:  this.args.animation			|| '',
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
					this.element[0]
				);
			}
    }
		
    this.init();
  }
});
