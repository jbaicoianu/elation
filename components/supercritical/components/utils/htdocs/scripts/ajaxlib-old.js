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
  </responses>

  Any number of <response></response> blocks can be returned in response to
  a single request, thus giving the backend direct control over every
  named element on the webpage.

  Supports full command queueing - multiple calls to Queue() can be made, followed
  by a single call to Go() to retrieve them all at once (currently only using a
  single XMLHttpRequest object - if needed, could be extended to thread multiple
  XMLHttpRequest objects for parallelized data retrieval
*/

ajaxlib = new function() {
  this.Queue = function (url) {
    this.urlqueue.push(url);
  }

  this.Get = function (url, history) {
    // FIXME - we're circumventing the queue.  Some day it could be useful to not do so.
    // Also, we're creating a new string because javascript likes to not initialize object types correctly all the time
    this._get(new String(url), history);
  }
  this.Post = function (form, history) {
    // FIXME - need to expand queueing system to understand POST as well as GET
    this._post(form, history);
  }

  this.Go = function() {
    if (this.urlqueue.length > 0) {
      url = this.urlqueue.shift();
      this._get(url);
    }
  }
  
  this.processResponse = function(dom, docroot) {
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
            var content = res.firstChild.nodeValue;
            var element = docroot.getElementById(target);

            if (element)
              element.innerHTML = content;
          }
        } else if (type == "javascript") {
            var content = res.firstChild.nodeValue;
            eval(content);
        }
      }
    }
  }

  this._get = function (url, history) {
    var docroot = this.docroot;

    // Need to assign these to local variables so the subfunction can access them
    var xmlhttp = this.xmlhttp;
    var processResponse = this.processResponse;

    var page = url;
    var qstr = "";
    if (url.indexOf("?") > 0) {
      page = url.substr(0, url.indexOf("?"));
      qstr = url.substr(url.indexOf("?") + 1);
    }

    if (history) {
      this.setHistory(qstr);

      if (this.iframe) {
        this.iframe.src = "/ajax-blank.htm?" + qstr + "#" + page;
        // We'll get back to the processing once the iframe has loaded.  Bail out early here.
        return;
      }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.responseXML) {
        var dom = xmlhttp.responseXML.firstChild;
        processResponse(dom, docroot);
        setTimeout('ajaxlib.Go()', 0);
      }
    }
    xmlhttp.setRequestHeader("X-Ajax", "1");
    xmlhttp.setRequestHeader("User-Agent", "ajaxlib");
    xmlhttp.send(null);
  }
  this._post = function (form, history) {
    // Need to assign these to local variables so the subfunction can access them
    var xmlhttp = this.xmlhttp;
    var processResponse = this.processResponse;
    var formmethod = (form.getAttribute("method") ? form.getAttribute("method").toUpperCase() : "GET");
    var formaction = form.getAttribute("action");
    var docroot = this.docroot;

    var formvars = "";
    for (var i = 0; i < form.elements.length; i++) {
      element = form.elements[i];
      var name = new String(element.name); // for some reason, element.name isn't a String by default

      if (name.length > 0 && name != "undefined" && element.value != "undefined" && !element.disabled) {
        formvars += "&" + escape(name) + "=" + escape(element.value);
      }
    }

    if (history && formmethod == "GET") { // Only support history for GET, not POST
      this.setHistory(formvars);

      if (this.iframe) {
        this.iframe.src = "/ajax-blank.htm?" + formvars + "#" + formaction;
        // We'll get back to the processing once the iframe has loaded.  Bail out early here.
        return;
      }
    }
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.responseXML) {
        var dom = xmlhttp.responseXML.firstChild;
        processResponse(dom, docroot);
        setTimeout('ajaxlib.Go()', 0);
      }
    }

    if (formmethod == "POST") {
      xmlhttp.open(formmethod, formaction, true);
      xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xmlhttp.setRequestHeader("X-Ajax", "1");
      xmlhttp.send(formvars);
    } else {
      xmlhttp.open(formmethod, formaction + "?" + formvars, true);
      xmlhttp.setRequestHeader("X-Ajax", "1");
      xmlhttp.send(null);
    }
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
    url = String(document.location);
    if (hash.length > 0)
      if (url.indexOf("#") > 0)
        this.Get(url.substr(0, url.indexOf("#")) + "?" + hash.substr(1));
      else
        this.Get(url + "?" + hash.substr(1));
    else
      this.Get(url.replace("#", "?"));
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

  // AJAX object initialization
  this.getHTTPObject(); 
  if (browser.type == "msie") {
    this.getIFRAMEObject("hiddeniframe");
  }

  this.lasthash = "";
  this.urlqueue = new Array();
  this.docroot = document;

}

// AJAX child for use within an IFRAME 
function ajaxChild(url) {
  var qstr = url.substr(url.indexOf("?")+1, (url.indexOf("#") - url.indexOf("?") - 1));
  var file = url.substr(url.indexOf("#")+1);

  if (file.length > 0 && qstr.length > 0) {
    if (parent.ajaxlib) { // Workaround for when iframe finishes loading before parent does
      parent.ajaxlib.Get(file + "?" + qstr);
    } else {
      setTimeout('parent.ajaxlib.Get("' + file + '?' + qstr + '")', 100);
    }
  }
}

// Convenience functions to use within webpages

/*
function ajaxInit(actual) {
  // Self-referencing function - just call this function any time in the head, and we'll take care of calling it correctly when the page is fully loaded
  if (actual) {
    ajaxlib = new Ajax();
    window.setInterval("ajaxlib.checkHistory()", 250);
  } else {
    if (window.addEventListener)
      window.addEventListener("load", ajaxInit, false);
    else if (window.attachEvent)
      window.attachEvent("onload", ajaxInit);
    else
      setTimeout("ajaxInit(true)", 100);
  }
}
*/

function ajaxLink(ajaxlib, link, history) {
  ajaxlib.Get(link, history);
  return false;
}

function ajaxForm(ajaxlib, form, history) {
  ajaxlib.Post(form, history);
  return false;
}
