/* 
  Copyright (c) 2005 James Baicoianu

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/* 
  Simple AJAX library - this works by sending requests to the server, which
  returns results as XML-encapsulated XHTML, which is then placed in the 
  target div automatically.

  Typical response:

  <responses>
   <response target="id-of-status-div">
    <![CDATA[
     <h1>Data updated successfully</h1>
    ]]>
   </response>
   <response target="id-of-data-div">
    <![CDATA[
     (xhtml representation of updated data)
    ]]>
   </response>
   <response type="javascript">
    <![CDATA[
     JavascriptCode();
    ]]>
  </responses>

  Any number of <response></response> blocks can be returned in response to
  a single request, thus giving the backend direct control over every
  named element on the webpage.

  Supports full command queueing - multiple calls to Queue() can be made, followed
  by a single call to Go() to retrieve them all at once (currently only using a
  single XMLHttpRequest object - if needed, could be extended to thread multiple
  XMLHttpRequest objects for parallelized data retrieval
*/

elation.extend("ajax", new function() {
	this.Queue = function (obj) {
    // if args is object, convert to string.  this might not be the best place to put this.
    if (elation.utils.arrayget(obj, 'args') && typeof obj.args == 'object')
      obj.args = elation.utils.encodeURLParams(obj.args);
    
    if (obj.constructor.toString().indexOf("Array") != -1) {
      for (var i = 0; i < obj.length; i++) {
        if (!obj[i].method) obj[i].method = "GET";
        this.urlqueue.push(obj[i]);
      }
    } else {
      if (!obj.method) obj.method = "GET";
      this.urlqueue.push(obj);
    }

    if (this.xmlhttpReady())
      this.Go();
  }
  this.Get = function (url, params, args) {
    // FIXME - handle generating url using params array
    var req = this.parseURL(url);
    this.ProcessRequest(req, args);
  }
  this.Post = function (form, params, args) {
    // FIXME - handle merging params array into form request
    var req = this.parseForm(form);
    this.ProcessRequest(req, args);
  }
  this.Inject = function(targetid, url, params, args) {
    if (!args)
      args = {};
    
    args.callback = function(html) {
      var destination = document.getElementById(targetid);
      
      if (destination)
        destination.innerHTML = html;
    }
    
    this.Get(url, params, args);
  }
  this.ProcessRequest = function (req, args) {
    if (typeof args != 'undefined') {
      req.history = args.history || false;

      if (args.callback) 
        req.callback = args.callback;
      if (args.failurecallback) 
        req.failurecallback = args.failurecallback;
      if (args.timeout) 
        req.timeout = args.timeout;
      if (args.timeoutcallback) 
        req.timeoutcallback = args.timeoutcallback;
    }
    this.Queue(req);
  }

  this.Go = function() {
    if (this.urlqueue.length > 0) {
      obj = this.urlqueue.shift();
      //this._get(url);
      if (!this._go(obj))
        this.urlqueue.unshift(obj);
    }
  }
  
  this.parseURL = function(turl) {
    var ret = new Object();
    ret.method = "GET";

    var url = new String(turl); // JavaScript passes a reference to the A HREF, not an actual string 

    if (url.indexOf("?") > 0) {
      ret.url = url.substr(0, url.indexOf("?"));
      ret.args = url.substr(url.indexOf("?") + 1);
    } else {
      ret.url = url;
      ret.args = "";
    }
    return ret;
  }

  this.parseForm = function(form) {
    var ret = new Object();
    ret.method = (form.getAttribute("method") ? form.getAttribute("method").toUpperCase() : "GET");
    ret.url = form.getAttribute("action");

    ret.args = "";
    for (var i = 0; i < form.elements.length; i++) {
      element = form.elements[i];
      var name = new String(element.name); // for some reason, element.name isn't a String by default
      
      if (name.length > 0 && name != "undefined" && element.value != "undefined" && !element.disabled) {
        if (element.type == "checkbox") {
          ret.args += "&" + escape(name) + "=" + (element.checked ? (element.getAttribute("value") ? escape(element.value) : 1) : 0);
        } else if (element.type == "radio") {
          if (element.checked) {
            ret.args += "&" + escape(name) + "=" + escape(element.value);
          }
        } else {
	        ret.args += "&" + escape(name) + "=" + escape(element.value).replace(/\+/g, "%2B");
        }
      }
    }

    return ret;
  }

  this.xmlhttpReady = function() {
    if (this.xmlhttp.readyState > 0 && this.xmlhttp.readyState < 4) {
      return false;
    }
		
    return true;
  }

  this.processResponse = function(data, nobj) {
    // If there's no obj variable, this isn't being called from a closure so use the function argument instead
    if (typeof obj == 'undefined') { 
      obj = nobj;
    }
    // If this isn't an ajaxlib response, just return the raw data
    if (!data.responses) {
      return data;
    } 
    var responses = data.responses;
    if (
      (typeof elation.search != 'undefined' && typeof elation.search.backbutton != 'undefined') && 
      (typeof search != 'undefined' && search.urlhash) && 
      (typeof obj != 'undefined' && obj.url == '' && !elation.utils.isTrue(obj.ignore))
    ) {
      elation.search.backbutton.add(responses, obj);
    }
    
    // Used to keep track of registered dependencies, etc. while all responses are processed
    var common = { 
      inlinescripts: [],
      data: {},
      dependencies: {}
    };
		
    for (var i = 0; i < responses.length; i++) {
      var type = responses[i].type || 'xhtml';
      
      if (typeof this.responsehandlers[type] == 'function') {
        this.responsehandlers[type](responses[i], common);
      } else {
        console.log('No handler for type ' + type);
      }
    }
		
    // Process all CSS and JS dependencies into URLs
    var cssparms = '', javascriptparms = '';
    for (var key in common.dependencies.css) {
      if (common.dependencies.css.hasOwnProperty(key)) {
        if (common.dependencies.css[key].length > 0) {
          cssparms += key + '=' + common.dependencies.css[key].join('+') + '&';
        }
      }
    }
    for (var key in common.dependencies.javascript) {
      if (common.dependencies.javascript.hasOwnProperty(key)) {
        if (common.dependencies.javascript[key].length > 0) {
          javascriptparms += key + '=' + common.dependencies.javascript[key].join('+') + '&';
				}
      }
    }
    var batch = new elation.file.batch();
    if (cssparms.length > 0)
      batch.add('/css/main?'+cssparms.substr(0,cssparms.length-1),'css');
    if (javascriptparms.length > 0)
      batch.add('/scripts/main?'+javascriptparms.substr(0,javascriptparms.length-1),null,true);
		
    common.inlinescripts.push("elation.component.init();");
    // Execute all inline scripts
    var execute_scripts = function() {
      if (common.inlinescripts.length > 0) {
        var script_text = '';
        for (var i = 0; i < common.inlinescripts.length; i++) {
          if (!common.inlinescripts[i] || typeof common.inlinescripts[i] == 'undefined') 
            continue;
          else
            script_text += common.inlinescripts[i] + '\n';
        }
        try {
          eval(script_text);
        } catch(e) {
          batch.callback(script_text);
        }
      }
    }
		
    // FIXME - this had a delay of 1ms when type='data' and name='infobox.data' was passed, I'm sure there was a reason but it doesn't work with the way this is done now... 
    execute_scripts();  // no timer makes priceslider happy!  no ugly delay.

    // If caller passed in a callback, execute it
    if (typeof obj != 'undefined' && obj.callback) {
      try {
        elation.ajax.executeCallback(obj.callback, common.data);
      } catch(e) {
        batch.callback(function() { elation.ajax.executeCallback(obj.callback, common.data); });
      }
    }
  }
  
  var register_inline_scripts = function(common, element) {
    var scripts = element.getElementsByTagName("SCRIPT");
    
    if (scripts.length > 0) {
      for (var i = 0; i < scripts.length; i++) {
        if (typeof scripts[i].text == 'string') {
          common.inlinescripts.push(scripts[i].text);
        } else if (scripts[i].src) {
          console.log('elation.ajax: found inline script with src parameter');
        }
      }
    }
  }
  this.responsehandlers = {
    'infobox': function(response, common) {
      var content = response['_content'],
          name = response['name'],
          infobox;
      
      if (name && content) {
        infobox = elation.ui.infobox.get(name);
        
        if (infobox) { 
          infobox.ajax_continue(content);
          register_inline_scripts(common, infobox.elements.container);
        }
      }
    },
    'notify': function(response, common) {
      var content = response['_content'],
          name = response['name'],
          infobox;
      
      elation.ui.notify.show(name, content);
    },
    'xhtml': function(response, common) {
      if (response['target'] && response['_content']) {
        var targetel = document.getElementById(response['target']);
        
        if (targetel) {
          if (response['append'] == 1 || response['append'] == 'true') {
            targetel.innerHTML += response['_content'];
          } else {
            //thefind.func.ie6_purge(targetel);
            
            if (response['target'] == 'tf_search_results_main') {
              response['_content'] += "<div style='position:absolute;background:red;width:100%;height:100%;'></div>"
            }
            var infobox = elation.ui.infobox.target(targetel);
            
            if (infobox)
              infobox.animate_inject(response['_content'], targetel);
            else
              targetel.innerHTML = response['_content'];
          }
          
          register_inline_scripts(common, targetel);
					
          /* repositions infobox after ajax injection, use responsetype ["infobox"] if applicable */
          if (elation.ui && elation.ui.infobox && infobox && infobox.args.reposition) {
            common.inlinescripts.push("elation.ui.infobox.position('"+infobox.name+"', true);");
          }
        }
      }
    },
    'javascript': function(response, common) {
      if (response['_content']) {
        common.inlinescripts.push(response['_content']);
			}
    },
    'data': function(response, common) {
      if (response['name'] && response['_content']) {
        common.data[response['name']] = elation.JSON.parse(response['_content']);
				
        /* FIXME - this also seems like an odd place for infobox-related code (see above) */
        if (response['name'] == 'infobox.content') {
          var	text = elation.JSON.parse(response['_content']),
              div = document.createElement('div');
          
          //thefind.func.ie6_purge(div);
          div.innerHTML = text;
          
          register_inline_scripts(common, div);
					
          /* repositions infobox after ajax injection, use responsetype ["infobox"] if applicable */
          var infobox = elation.ui.infobox.getCurrent();
          
          if (infobox && infobox.args.reposition)
            common.inlinescripts.push("elation.ui.infobox.position('"+infobox.name+"', true);");
        }
      }
    },
    'dependency': function(response, common) {
      if (response['deptype'] == 'component' && response['name']) {
        var name = response['name'].split('.', 2); // FIXME - this won't work with "deep" components (eg. thefind.search.filters.color)
        if (name[0] && response['subtypes']) {
          var subtypes = response['subtypes'].split(',');
          for (var i = 0; i < subtypes.length; i++) {
            if (!common.dependencies[subtypes[i]])
              common.dependencies[subtypes[i]] = [];
            if (!common.dependencies[subtypes[i]][name[0]])
              common.dependencies[subtypes[i]][name[0]] = [];
            common.dependencies[subtypes[i]][name[0]].push(name[1]);
          }
        }
      }
    },
    'debug': function(response, common) {
      if (response['_content']) {
        var debugcontainer = document.getElementById('tf_debug_tab_logger');
        if (debugcontainer) {
          //thefind.func.ie6_purge(debugcontainer);
					debugcontainer.innerHTML += response['_content'];
        }
				
				if (typeof tf_debugconsole != 'undefined')
          tf_debugconsole.scrollToBottom();
      }
    },
    'args': function(response, common) {
      // FIXME: need to ask James what is being sent as responsetype == args
    }
  }


  this.translateXML = function(dom) { // Convert an XML object into a simple object
    var ret = {};
    if (dom && dom.childNodes) {
      var tagname = dom.tagName;
      ret[tagname] = [];
      for (var i = 0; i < dom.childNodes.length; i++) {
        var res = dom.childNodes.item(i);
        if (res.nodeType == 1) { // Right now we only understand ELEMENT_NODE types
          var newres = {};
          for (var j = 0; j < res.attributes.length; j++) {
            newres[res.attributes[j].nodeName] = res.attributes[j].nodeValue;
          }
          newres['_content'] = (res.firstChild ? res.firstChild.nodeValue : false);
          ret[tagname].push(newres);
        }
      }
    }
    return ret;   
  }

  this._go = function(obj) { 
    var docroot = this.docroot;

    // Need to assign these to local variables so the subfunction can access them
    var xmlhttp = this.xmlhttp;
    var processResponse = this.processResponse;
    var timeouttimer = false;

    if (obj.history) {
      this.setHistory(obj.args);

      if (this.iframe) {
        this.iframe.src = "/ajax-blank.htm?" + obj.args + "#" + obj.url;
        // We'll get back to the processing once the iframe has loaded.  Bail out early here.
        return;
      }
    }
    if (!obj.cache) {
      obj.args = (obj.args && obj.args.length > 0 ? obj.args + "&" : "") + "_ajaxlibreqid=" + (parseInt(new Date().getTime().toString().substring(0, 10)) + parseFloat(Math.random()));
    }

    if (obj.timeout && obj.timeoutcallback) {
      timeouttimer = window.setTimeout(function() { obj.failurecallback = false; xmlhttp.abort(); obj.timeoutcallback(); }, obj.timeout || 5000);
    }

    readystatechange = function() {
      if (xmlhttp.readyState == 4) {
        if (timeouttimer)
          window.clearTimeout(timeouttimer);

        if (xmlhttp.status == 200) {
         if (xmlhttp.responseXML) {
            var dom = xmlhttp.responseXML.firstChild;
            var results = [];
            
            processResponse.call(elation.ajax, elation.ajax.translateXML(dom), obj);
            
            if (obj.callback) {
              elation.ajax.executeCallback(obj.callback, xmlhttp.responseText);
            }
          } else if (xmlhttp.responseText) {
            if (obj.callback) {
              elation.ajax.executeCallback(obj.callback, xmlhttp.responseText);
            }
          }
        } else {
          if (obj.failurecallback) {
            elation.ajax.executeCallback(obj.failurecallback);
          }
        }
        setTimeout('elation.ajax.Go()', 0);
      }
    }

    //alert('trying '+obj.method+' '+obj.url);
    try {
      if (obj.method == "POST") {
        xmlhttp.open(obj.method, obj.url, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlhttp.setRequestHeader("X-Ajax", "1");
        xmlhttp.onreadystatechange = readystatechange;
        xmlhttp.send(obj.args);
      } else if (obj.method == "GET") {
        xmlhttp.open(obj.method, obj.url + "?" + obj.args, true);
        //xmlhttp.setRequestHeader("X-Ajax", "1");
        xmlhttp.onreadystatechange = readystatechange;
        xmlhttp.send(null);
      } else if (obj.method == "SCRIPT") {
        var url = (obj.url.match(/^https?:/) ? obj.url : this.host + obj.url);
        if (obj.args) url += '?' + elation.utils.encodeURLParams(obj.args);
        elation.file.get('javascript', url);
      }
    } catch (e) {
      if (typeof console != 'undefined') {
        console.log(e);
      }
      if (obj.failurecallback) {
        elation.ajax.executeCallback(obj.failurecallback, e);
      }
      return false;
    }
    return true;
  }

  this.setHistory = function(hash) {
    // FIXME - history shoult also store page, not just query string
    this.docroot.location.hash = hash;
    this.lasthash = this.docroot.location.hash;
  }

  this.checkHistory = function() {
    if (this.docroot.location.hash != this.lasthash) {
      this.processHash(this.docroot.location.hash);
      this.lasthash = this.docroot.location.hash;
    }
  }

  this.processHash = function(hash) {
    return false;
    var url = String(document.location);
    /*
    if (hash.length > 0)
      if (url.indexOf("#") > 0)
        this.Get(url.substr(0, url.indexOf("#")) + "?" + hash.substr(1));
      else
        this.Get(url + "?" + hash.substr(1));
    else
      this.Get(url.replace("#", "?"));
    */
    var url = elation.utils.parseURL(document.location.href);
    //console.log(document.location.href, url);
    url.hash = "";
    var hashparts = hash.split("&");
    for (var i = 0; i < hashparts.length; i++) {
      var argparts = hashparts[i].split("=");
      url.args[argparts[0]] = url.args[argparts[1]];
    }
    //console.log(elation.utils.makeURL(url));

  }

  this.setLoader = function(target, img, text) {
    if (!text) text = "";
    if (e = document.getElementById(target)) {
			//thefind.func.ie6_purge(e);
      e.innerHTML = '<div style="text-align: center;">' + text + '<img src="' + img + '" alt="Loading..." /></div>';
    }
  }

  this.getHTTPObject = function() {
    if (!this.xmlhttp) {
      var xmlhttp = false;
      
      if (typeof ActiveXObject != 'undefined') {
        try {
          xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
          try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (E) {
            xmlhttp = false;
          }
        }
      } 
      
      if (!xmlhttp && typeof XMLHttpRequest != "undefined") {
        try {
          xmlhttp = new XMLHttpRequest();
        } catch (e) {
          xmlhttp = false;
        }
      }
      this.xmlhttp = xmlhttp;
    }
    return this.xmlhttp;
  }
  
  this.getIFRAMEObject = function(iframeID) {
    /*
      dynamic IFRAME code
      original JS by Eric Costello (glish.com) for ADC
      http://developer.apple.com/internet/webcontent/iframe.html
  
      courtesy of http://jszen.blogspot.com/2005/03/dynamic-old-school-iframes.html
    */
    if (!this.iframe) {
      //FIXME this is because james is angry... and because ie6 is reporting an ssl erro because of the iframe
      return;
      var iframe, iframeDocument;
    
      if (document.createElement) {   
        try {
         
          var tempIFrame = document.createElement('iframe');
          tempIFrame.setAttribute('id',iframeID);
          tempIFrame.style.border = '0px';
          tempIFrame.style.width = '0px';
          tempIFrame.style.height = '0px';
          iframe = document.body.appendChild(tempIFrame);
            
          if (document.frames) {
            
            /* IE5 Mac only allows access to the document
            of the IFrame through frames collection */
              
            iframe = document.frames[iframeID];
          }
            
        } catch (ex) {
          
          /* This part is CRAZY! -- scottandrew */
      
          /* IE5 PC does not allow dynamic creation and 
          manipulation of an iframe object. Instead, we'll fake
          it up by creating our own objects. */
          var iframeHTML = '\<iframe id="' + iframeID + '"';
          iframeHTML += ' style="border:0px; width:0px; height:0px;"';
          iframeHTML += '><\/iframe>';
          document.body.innerHTML += iframeHTML;
//
iframe = new Object();
          iframe.document = new Object();
          iframe.document.location = new Object();
          iframe.document.location.iframe = 
            document.getElementById(iframeID);
          iframe.document.location.replace = 
            function(location) {
              this.iframe.src = location;
            }
        }
      }
      this.iframe = document.getElementById(iframeID);
    }
    return this.iframe;
  }

  this.executeCallback = function() {
    var args = [];
    for (var i = 0; i < arguments.length; i++)
      args[i] = arguments[i];
		
    var callback = args.shift();
		
    if (callback) {
      if (callback.constructor.toString().indexOf("Array") != -1 && callback.length == 2) {
        // If array is passed, use first element as thisObject, and second element as function reference
				callback[1].apply(callback[0], args);
      } else {
        callback.apply(this, args);
      }
    }
  }
  this.link = function(link, history) {
    this.Get(link, null, {history: history});
    return false;
  }
  this.form = function(form, history) {
    this.Post(form, null, {history: history});
    return false;
  }


  // AJAX object initialization
  this.getHTTPObject(); 
  if (elation.browser.type == "msie") {
    this.getIFRAMEObject("hiddeniframe");
  }

  this.lasthash = "";
  this.urlqueue = new Array();
  this.docroot = document;
  this.host = document.location.protocol + '//' + document.location.host;
});

/*
// AJAX child for use within an IFRAME 
function ajaxChild(url) {
  var qstr = url.substr(url.indexOf("?")+1, (url.indexOf("#") - url.indexOf("?") - 1));
  var file = url.substr(url.indexOf("#")+1);

  if (file.length > 0 && qstr.length > 0) {
    if (parent.elation.ajax) { // Workaround for when iframe finishes loading before parent does
      parent.elation.ajax.Get(file + "?" + qstr);
    } else {
      setTimeout('parent.elation.ajax.Get("' + file + '?' + qstr + '")', 100);
    }
  }
}
*/
//setTimeout(function() { setInterval(function() { elation.ajax.checkHistory(); }, 100); }, 1000);

// Convenience functions to use within webpages
function ajaxLink(ajaxlib, link, history) {
  elation.ajax.link(link, history);
  return false;
}

function ajaxForm(ajaxlib, form, history) {
  elation.ajax.form(form, history);
  return false;
}

ajaxlib = elation.ajax;
