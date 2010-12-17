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
			this.panelmap[name] = this.panels.length;
			this.panels.push(args || {});
    }
		
		this.Init(name, args);
  }

  this.Init = function(name, args) {
    var panel = this.panels[this.panelmap[name]] || null;
		
    if (args) {
			if (args.id)
				panel.element = $("#"+args.id);
			
			panel.items = {};
			if (args.cfg && args.cfg.items) {
				$.each(args.cfg.items, function(k, v) {
					panel.items[k] = new elation.panel.add_item(k, v, panel);
				});
			}
			
			if (panel.cfg.jsobject && panel.cfg.jsobject != "false") {
				var obj = eval(panel.cfg.jsobject);
				
				if (typeof obj == 'function') {
					panel.jsobj = new obj(this, panel);
					elation[panel.name] = panel.jsobj;
				}
			}
			
			if (panel.cfg.navigation == "true") {
				panel.container = document.getElementById(panel.cfg.targetid);
				this.lis = $('div.tf_utils_panel_' + name + ' ul li');;
        
        for (var i=0; i<this.lis.length; i++)
          if (elation.html.hasclass(this.lis[i], 'selected'))
            panel.li = this.lis[i];
				
				for (var item in panel.items) {
					var	element = panel.items[item].element;
					
					if (typeof element == 'object' && element.length > 0) {
						elation.events.add(element[0], 'click', this);
						element[0].onselectstart = function() { return(false); };
					}
				}
				
				panel.item = this.get_item(panel, $('div.tf_utils_panel_' + name + ' ul li.selected')[0]);
			}
			
			panel.content = {};
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
		
		// find the proper panel for event and item for target
		for (var key in this.panelmap) {
			var	panel	= this.panels[this.panelmap[key]],
					item	= this.get_item(panel, target);
			
			if (item)
				break;
		}
		
		if (arrayGet(item, 'args.unselectable'))
			return;
		
		event.preventDefault();
		event.stopPropagation();
		
		if (item.name == panel.item.name)
			return;
		  
    if (typeof pandoraLog == 'object') {
			pandoraLog.mouseovertype = item.name;
    }
    
    if (typeof googleAnalytics == 'object') {
      googleAnalytics.mouseovertype = item.name;
      if (item.name == "shoplikeme")
        googleAnalytics.trackEvent(['tab', 'shoplikeme']);
      else if (item.name == "theweb")
        googleAnalytics.trackEvent(['tab', 'theWeb']);
			else if (item.name == "nearby")
        googleAnalytics.trackEvent(['tab', 'nearby']);
      else if (item.name == "shoplikefriends")
        googleAnalytics.trackEvent(['tab', 'shoplikefriends']);
			else if (item.name == "myfinds")
        googleAnalytics.trackEvent(['tab', 'myfinds']);
      else
        googleAnalytics.trackEvent(['popup_tab', googleAnalytics.mouseovertype]);
    }
		
		this.load_tab_content(panel, target, item);
	}
	
	this.load_tab_content = function(panel, target, item) {
		var	target = (typeof target == 'string')
					? document.getElementById(target)
					: target,
				panel = (typeof panel == 'object')
					? panel
					: this.panels[this.panelmap[panel]],
				item = item || this.get_item(panel, target);
		
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
			
			return panel.item = item;
		}
		
		this.select_item(item, panel);
		
		// cache content of tab for later retrieval
		if (!panel.cfg.nocache) {
			if ($('img.tf_results_ajax_spinner',panel.container).length == 0) // kludgy - dont save content if content still loading
				panel.content[panel.item.name] = panel.container.innerHTML;
			}
			panel.item = item;
			
			if (!panel.cfg.nocache) {
			// if cached copy exists use that
			if (panel.content[item.name]) 
				return panel.container.innerHTML = panel.content[item.name];
		} else {
			// tab fade-in effect
			if (elation.browser && elation.browser.type != 'msie')
				$(panel.container).animate({ opacity: 0 }, 'fast');
		}
		if (!panel.container.style.minHeight)
			panel.container.style.minHeight = panel.container.offsetHeight + 'px';
		
		if (panel.cfg.spinner)
			panel.container.innerHTML = panel.cfg.spinner;
		
		// Merge args from both the panel and any specified contentcomponentargs
		var urlargs = {};
		
		if (typeof panel.args == 'object') 
			for (var k in panel.args) 
				if (panel.args.hasOwnProperty(k)) 
					urlargs[k] = panel.args[k];
		
		if (typeof item.args.contentcomponentargs == 'object') 
			for (var k in item.args.contentcomponentargs) 
				if (item.args.contentcomponentargs.hasOwnProperty(k)) 
					urlargs[k] = item.args.contentcomponentargs[k];
		
		urlargs['targetid'] = panel.cfg.targetid;
		urlargs['tab'] = item.args.argname;
		panel.active_argname = item.args.argname;
		
		var parms = elation.utils.encodeURLParams(urlargs);
		
		if (panel.jsobj && panel.jsobj.args)
			parms = parms + (parms ? '&' : '') + elation.utils.encodeURLParams(panel.jsobj.args);
		
		var componentname = item.args.contentcomponent || panel.cfg.contentcomponent;
		
		// ajax-fetch tab content
		ajaxlib.Queue({
			url: componentname, 
			args: parms,
			callback: [ 
				this, 
				function() {
					// tab fade-in effect
					if (elation.browser && elation.browser.type != 'msie')
						$(panel.container).css({ opacity: 0 })
							.animate({ opacity: 1 }, 'fast')
							.animate({ opacity: 'auto' }, 0);
					
				} 
			]
		});
	}
  
	this.select_item = function(item, panel) {
		var	li = arrayGet(item, 'element'),
        li = li.length > 0 ? li[0] : li;
		
		if (elation.html.hasclass(li, 'tf_utils_state_disabled'))
			return;
		
		if (panel.li) 
			elation.html.removeclass(panel.li, 'selected');
		
		elation.html.addclass(li, 'selected');
		
		return panel.li = li;
	}
	
  this.set_args = function(panelname, args) {
		var panel, item;
		
  	if (panel = this.panels[this.panelmap[panelname]]) {
      for (var key in args) 
        arraySet(panel.args, key, args[key]);
			
			for (var item_key in panel.items) {
				item = panel.items[item_key];
				if ((item.args.disableiffalse && !elation.utils.isTrue(args[item.args.disableiffalse])) || (item.args.disableiftrue && elation.utils.isTrue(args[item.args.disableiftrue])) || (item.args.disableifempty && elation.utils.isEmpty(args[item.args.disableifempty]))) {
					elation.html.addclass(item.element[0], 'tf_utils_state_disabled');
          
          if(item.args.disabledtype)
  					elation.html.addclass(item.element[0], 'tf_utils_state_disabled_'+item.args.disabledtype);
        }
			}
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
			
			this.element = $("ul.tf_utils_panel_content li#" + this.panel.id + "_" + this.name);
			
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

elation.extend('myfinds_picker', function(parent, panel) {
	this.parent = parent;
	this.panel = panel;
	this.args = { mode: 'store' };
	this.done = {};
	this.selected = { brand: [], store: [] };
	this.selected_ids = { brand: {}, store: {} };
	
	this.init = function() {
		this.content = document.getElementById('tf_picker_tab_content');
		this.search_input = document.getElementById('tf_picker_search_input');
		this.btnCancel = document.getElementById('tf_picker_cancel');
		this.btnDone = document.getElementById('tf_picker_done');
		this.modeul = document.getElementById('tf_picker_mode');
		this.modeli = elation.utils.getOnly(this.modeul, 'li');
		this.catul = document.getElementById('tf_picker_category');
		this.catli = elation.utils.getOnly(this.catul, 'li');		
		
		elation.ui.infobox.get('lightbox').dragging = false;
		
		for (var i=0; i<this.modeli.length; i++) {
			var li = this.modeli[i],
					input = li.getElementsByTagName('input')[0];
			
			elation.events.add(input, 'change', this);
		}
		
		if (googleAnalytics) {
			var storebrand = document.getElementById('tf_picker_radio_stores').checked ? 'store' : 'brand';
			
			googleAnalytics.trackPageViewWrapper('/virt_slm/personalize/storebrandpicker/'+storebrand+'/');
		}
		
		elation.events.add(this.search_input, 'keyup,blur', this);
		elation.events.add([ this.btnCancel, this.btnDone ], 'click', this);
	}
	
	this.add = function(mode, category, items) {
		var div = document.getElementById('tf_picker_tab_content'),
				inputs = div.getElementsByTagName('input');
		
		if (!items)
			return;
		
		this.items = {};
		
		if (mode) {
			this.args.mode = mode;
			
			if (!this.default_mode)
				this.default_mode = mode;
		}
		
		if (category) {
			this.category = category;
			
			if (googleAnalytics) {
				var gacat = category.toLowerCase();
						secat = gacat.split(' ')[0];
				
				if (secat != 'search') {
					this.search_input.value = '';
					googleAnalytics.trackEvent([ 'sbpicker', 'tab', gacat ]);
				}
			}
		}
		
		for (var i=0; i<items.length; i++) {
			var item = items[i],
					id = 'tf_picker_checkbox_' + item.id;
			
			if (this.selected_ids[mode][id]) {
				var input = document.getElementById(id);
						parent = elation.utils.getParent(input, 'li');
				
				input.checked = true;
				elation.utils.addclass(parent, 'selected');
			}
			
			this.items[id] = item;
		}
		
		elation.events.add(inputs, 'change', this);
	}
	
	this.handleEvent = function(event) {
		var event = event || window.event,
				target = event.target || event.srcElement;
		
		if (typeof this[event.type] == 'function')
			return this[event.type](event, target);
	}
	
	this.blur = function(event, target) {
		if (googleAnalytics) {
			var mode = this.args.mode.toLowerCase(),
					term = target.value;
			
			if (term && term != this.term) 
				googleAnalytics.trackEvent([ 'sbpicker', mode + '_search', term ]);
			
			this.term = term;
		}
	}
	
	this.keyup = function(event, target) {
		var parms = 'targetid=tf_picker_tab_content&tab='+(this.panel.active_argname || 1)+
				'&mode='+this.args.mode+'&search='+target.value;
		
		ajaxlib.Queue({
			method: 'GET', 
			url: '/myfinds/picker_content',
			args: parms,
			callback: [
				this,
				function(response) {
					//console.log('response',response);
				}
			]
		});
	}
	
	this.click = function(event, target) {
		if (target == this.btnCancel)
			elation.lightbox.hide();
		
		var sent = { store: 0, brand: 0 },
				request = {},
				e = encodeURIComponent,
				s = JSON.stringify;
		
		for (var key in this.selected) {
			var itemid = '',
					listname = 'saved_'+key+'s',
					itemtype = key;
			
			for (var i=0; i<this.selected[key].length; i++) {
				var item = this.selected[key][i],
						id = key == 'brand' ? item.display_name : item.id;
				
				itemid += (itemid ? ',' : '') + id;
				
				sent[key] = i + 1;
			}
			
			if (itemid) {
				request[key] = {				
					itemid: itemid, 
					itemtype: itemtype, 
					listname: listname
				}
			}
		}
		
		if (sent['store'] || sent['brand']) {
			if (googleAnalytics) {
				if (sent['store'] > 0) {
					googleAnalytics.trackEvent([ 'sbpicker', 'store', 'save' ]);
				} if (sent['brand'] > 0) {
					googleAnalytics.trackEvent([ 'sbpicker', 'brand', 'save' ]);
				}
			}
			
			ajaxlib.Queue({
				method: 'POST', 
				url: '/myfinds/picker_save',
				args: 'scount='+sent['store']+'&bcount='+sent['brand']+'&json='+e(s(request)),
				callback: [
					this,
					function() {
						var tabs = $("ul.tf_myfinds_page_main_tabs").data("tabs");
						
						if (this.default_mode == 'store') {
							ajaxlib.Get('/myfinds/page_stores_brands?pagetype=saved_stores');
						} else if (this.default_mode == 'brand') {
							ajaxlib.Get('/myfinds/page_stores_brands?pagetype=saved_brands');
						}
					}
				]
			});
		} else
			elation.lightbox.hide();
	}
	
	this.change = function(event, target) {
		var parent = elation.utils.getParent(target, 'li');
		
		if (parent == this.modeli[0] || parent == this.modeli[1]) {
			if (parent == this.modeli[0]) 
				this.args.mode = 'store';
			else
				this.args.mode = 'brand';
			
			this.search_input.value = '';
			this.parent.load_tab_content(this.panel, this.catli[0]);
			
			return;
		}
		
		var item = this.items[target.id],
				sel = this.selected[this.args.mode],
				selid = this.selected_ids[this.args.mode];
		
		if (item) {
			if (elation.html.hasclass(parent, 'selected')) {
				elation.utils.removeclass(parent, 'selected');
				sel.splice(item.added_index, 1);
				delete item.added_index;
			} else {
				item.added_index = sel.length;
				sel.push(item);
				selid[target.id] = true;
				elation.utils.addclass(parent, 'selected');
			}
		}
		
		return false;
	}
	
	this.init();
});
