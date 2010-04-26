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

elation.extend("ajax", new function () {
	this.Queue = function (obj) {
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
          ret.args += "&" + escape(name) + "=" + (element.checked ? "1" : "0");
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

  this.processResponse = function(dom, docroot, obj, ignore) {
		//if (thefind && thefind.ajax_back_button && typeof search != 'undefined' && search.urlhash && !ignore)
			//thefind.ajax_back_button.add(dom, docroot, obj);
		
		//alert('xmlresponse'+dom);
    if (!dom) return;
    
    //var batch = new thefind.func.dependencies_batch();
    
    var data = {}, components = {}, css = {}, js = {};
    var inlinescripts = [];
		
    for (var i = 0; i < dom.childNodes.length; i++) {
      var res = dom.childNodes.item(i);

      if (res.nodeType == 1) { // Right now we only understand ELEMENT_NODE types
        var typeattr = res.attributes.getNamedItem("type");
        var type = "xhtml"; // default the type to standard XHTML
        if (typeattr)
          type = typeattr.nodeValue;
        
        if (type == "xhtml") {
          var targetattr = res.attributes.getNamedItem("target");
          if (targetattr) {
            var target = targetattr.nodeValue;
            var append = res.attributes.getNamedItem("append");
						
            var content = res.firstChild.nodeValue;
            var element = docroot.getElementById(target);
            if (element) {
              if (append && (append.nodeValue == 1 || append.nodeValue == "true")) {
                element.innerHTML += content;
              } else {
								//alert(content);
                element.innerHTML = content;
								//alert('done');
              }
              
              var scripts = element.getElementsByTagName("SCRIPT");
              if (scripts.length > 0) {
                for (var j = 0; j < scripts.length; j++) {
                  if (typeof scripts[j].src == 'string' && scripts[j].src.length > 0) {
                      console.log(scripts[j]);
                      var blah = document.createElement("SCRIPT");
                      blah.src = scripts[j].src;
                      element.removeChild(scripts[j]);
                      document.getElementsByTagName("HEAD")[0].appendChild(blah);
                  } else if (typeof scripts[j].text == 'string') {
                    var text = scripts[j].text;
                    //batch.callback(text);
                    inlinescripts.push(text);
                  } else if (scripts[j].src) {
                  }
                }
              }
            }
          }
        } else if (type == "javascript") {
          var content = res.firstChild.nodeValue;
          //batch.callback(content);
          inlinescripts.push(content);
        } else if (type == "data") {
          var nameattr = res.attributes.getNamedItem("name");
          var content = res.firstChild;
          if (nameattr && content) {
            data[nameattr.nodeValue] = JSON.parse(content.nodeValue);
          }
        } else if (type == "debug") {
          var content = res.firstChild.nodeValue;
          var debugcontainer = document.getElementById('tf_debug_tab_logger');
          if (debugcontainer)
            debugcontainer.innerHTML += content;
        } else if (type == "dependency") {
          deptype = isNull(res.attributes) ? '' : res.attributes.getNamedItem("deptype").nodeValue;
          
          switch (deptype) {
            case 'javascript':
              var  url = isNull(res.attributes) ? '' : res.attributes.getNamedItem("url").nodeValue;
							
              batch.add(url + '&async=2');
              break;
            case 'component':
              var  name = isNull(res.attributes) 
                ? '' 
                : res.attributes.getNamedItem("name").nodeValue.split('.');
							
              if (name[0]) {
								if (name[0]+name[1] == 'searchinfobox') break;
								if (name[0]+name[1] == 'searchnoresults') break;
								if (name[0]+name[1] == 'localsettings') break;
								
                var num = typeof name[1] == 'undefined' ? 0 : 1;
                if (!components[name[0]])
                  components[name[0]] = [];
								
                components[name[0]].push(name[num]);
              }
              break;
            case 'placemark':
              break;
            case 'css':
              break;
          }
        }
      }
    }
		
    var parms = '', key;
    
    for (var key in components) 
      if (components[key].length > 0) 
        parms += key + '=' + components[key].join('+') + '&';
    
    if (parms.length > 0) {
      //batch.add('/css/main?'+parms.substr(0,parms.length-1),'css');
      batch.add('/scripts/main?'+parms.substr(0,parms.length-1),null,true);
    }
		
    if (inlinescripts.length > 0) {
        inlinescripts.push("console.log('done');");
      for (var i = 0; i < inlinescripts.length; i++) {
				if (!inlinescripts[i] || typeof inlinescripts[i] == 'undefined') 
					continue;
				
					eval(inlinescripts[i]);
      }
    }
		
    // If caller passed in a callback, execute it
    if (obj && obj.callback) {
      elation.ajax.executeCallback(obj.callback, data);
    }
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
            processResponse(dom, docroot, obj);
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

    try {

      //console.log('trying '+obj.method+' '+obj.url);
      if (obj.method == "POST") {
        xmlhttp.open(obj.method, obj.url, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlhttp.setRequestHeader("X-Ajax", "1");
        xmlhttp.onreadystatechange = readystatechange;
        xmlhttp.send(obj.args);
      } else {
        xmlhttp.open(obj.method, obj.url + "?" + obj.args, true);
        xmlhttp.setRequestHeader("X-Ajax", "1");
        xmlhttp.onreadystatechange = readystatechange;
        xmlhttp.send(null);
      }
    } catch (e) {
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
    url = String(document.location);
    if (hash.length > 0)
      if (url.indexOf("#") > 0)
        this.Get(url.substr(0, url.indexOf("#")) + "?" + hash.substr(1));
      else
        this.Get(url + "?" + hash.substr(1));
    else
      this.Get(url.replace("#", "?"));
  }

  this.setLoader = function(target, img, text) {
    if (!text) text = "";
    if (e = document.getElementById(target)) {
      e.innerHTML = '<div style="text-align: center;">' + text + '<img src="' + img + '" alt="Loading..." /></div>';
    }
  }

  this.getHTTPObject = function() {
    if (!this.xmlhttp) {
      var xmlhttp = false;
      /*@cc_on @*/
      /*@if (@_jscript_version >= 5)
        // JScript gives us Conditional compilation, we can cope with old IE versions.
        // and security blocked creation of the objects.
        try {
          xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
          try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (E) {
            xmlhttp = false;
          }
        }
      @end @*/
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

  // AJAX object initialization
  this.getHTTPObject(); 
  if (elation.browser.type == "msie") {
    this.getIFRAMEObject("hiddeniframe");
  }

  this.lasthash = "";
  this.urlqueue = new Array();
  this.docroot = document;

  this.link = function(link, history) {
    this.Get(link, history);
    return false;
  }
  this.form = function(form, history) {
    this.Post(form, history);
    return false;
  }

  // AJAX child for use within an IFRAME 
  this.child = function(url) {
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
});
