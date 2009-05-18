/*
* LabeledMarker Class, v1.2
*
* Copyright 2007 Mike Purvis (http://uwmike.com)
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*       http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* This class extends the Maps API's standard GMarker class with the ability
* to support markers with textual labels. Please see articles here:
*
*       http://googlemapsbook.com/2007/01/22/extending-gmarker/
*       http://googlemapsbook.com/2007/03/06/clickable-labeledmarker/
*/

/**
 * Constructor for LabeledMarker, which picks up on strings from the GMarker
 * options array, and then calls the GMarker constructor.
 *
 * @param {GLatLng} latlng
 * @param {GMarkerOptions} Named optional arguments:
 *   opt_opts.labelText {String} text to place in the overlay div.
 *   opt_opts.labelClass {String} class to use for the overlay div.
 *     (default "LabeledMarker_markerLabel")
 *   opt_opts.labelOffset {GSize} label offset, the x- and y-distance between
 *     the marker's latlng and the upper-left corner of the text div.
 */
function LabeledMarker(latlng, opt_opts){
  this.latlng_ = latlng;
  this.opts_ = opt_opts;

  this.labelText_ = opt_opts.labelText || "";
  this.labelClass_ = opt_opts.labelClass || "LabeledMarker_markerLabel";
  this.labelOffset_ = opt_opts.labelOffset || new GSize(0, 0);
  this.labelOrientation_ = opt_opts.labelOrientation || "topleft";
  this.labelId_ = opt_opts.labelId || null;
  this.labelType_ = opt_opts.labelType || null;
  
  this.clickable_ = opt_opts.clickable || true;
  this.title_ = opt_opts.title || "";
  this.labelVisibility_  = true;
  this.labelInitialized_ = false;
   
  if (opt_opts.draggable) {
  	// This version of LabeledMarker doesn't support dragging.
  	opt_opts.draggable = false;
  }
  
  GMarker.apply(this, arguments);
};

  
// It's a limitation of JavaScript inheritance that we can't conveniently
// inherit from GMarker without having to run its constructor. In order for 
// the constructor to run, it requires some dummy GLatLng.
LabeledMarker.prototype = new GMarker(new GLatLng(0, 0));

/**
 * Is called by GMap2's addOverlay method. Creates the text div and adds it
 * to the relevant parent div.
 *
 * @param {GMap2} map the map that has had this labeledmarker added to it.
 */
LabeledMarker.prototype.initialize = function(map) {
  // Do the GMarker constructor first.
  GMarker.prototype.initialize.apply(this, arguments);
  
  this.map_ = map;
};

LabeledMarker.prototype.initializeLabel_ = function() {
  if (this.labelInitialized_) return (this.div_ != null);

  var divclassname = this.labelClass_;
  if (typeof this.labelType_ != 'undefined') 
    divclassname += " " + this.labelClass_ + "_type_" + this.labelType_;

  this.div_ = document.createElement("div");
  this.div_.className = divclassname;
  this.div_.innerHTML = this.labelText_;
  this.div_.style.position = "absolute";
  this.div_.style.cursor = "pointer";
  this.div_.title = this.title_;
  
  this.map_.getPane(G_MAP_MARKER_PANE).appendChild(this.div_);
	//console.log(this.labelOrientation_);
  this.setLabelOrientation_();
  var self = this;
  var imgs = this.div_.getElementsByTagName("IMG");
  if (imgs.length > 0) {
    for (var i = 0; i < imgs.length; i++) { 
      imgs[i].onload = function() { self.setLabelOrientation_(); self.redrawLabel_(true); };
    }
  }

  if (this.clickable_) {
    /**
     * Creates a closure for passing events through to the source marker
     * This is located in here to avoid cluttering the global namespace.
     * The downside is that the local variables from initialize() continue
     * to occupy space on the stack.
     *
     * @param {Object} object to receive event trigger.
     * @param {GEventListener} event to be triggered.
     */
    function newEventPassthru(obj, event) {
      return function() { 
        GEvent.trigger(obj, event);
      };
    }
  
    // Pass through events fired on the text div to the marker.
    var eventPassthrus = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout'];
    for(var i = 0; i < eventPassthrus.length; i++) {
      var name = eventPassthrus[i];
      GEvent.addDomListener(this.div_, name, newEventPassthru(this, name));
    }
  }

  this.labelInitialized_ = true;
  return (this.div_ != null);
};

LabeledMarker.prototype.setLabelOrientation_ = function(orientation,newclass) {
  var o = this.labelOrientation_;
  if (typeof orientation != 'undefined') {
    o = this.labelOrientation_ = orientation;
  }
	
	if (newclass) {
		this.labelClass_ = "tf_local_marker_container tf_local_marker_" + orientation;
		this.div_.className = this.labelClass_;
	}
	
  if (this.div_) {
    var width = this.div_.offsetWidth;
    var height = this.div_.offsetHeight;
		//console.log(o,width,height,this);
    if (o == "bottomleft") {
      this.labelOffset_.width = -1 * width;
    } else if (o == "topleft") {
      this.labelOffset_.width = -1 * width;
      this.labelOffset_.height = -1 * height;
    } else if (o == "topright") {
      this.labelOffset_.height = -1 * height;
    } else if (o == "center") {
      this.labelOffset_.width = -1 * (width / 2);
      this.labelOffset_.height = -1 * (height / 2);
    }
  }
}

/**
 * Call the redraw() handler in GMarker and our our redrawLabel() function.
 *
 * @param {Boolean} force will be true when pixel coordinates need to be recomputed.
 */
LabeledMarker.prototype.redraw = function(force) {
  GMarker.prototype.redraw.apply(this, arguments);
  this.redrawLabel_(force);
};

/**
 * Moves the text div based on current projection and zoom level.
 */
LabeledMarker.prototype.redrawLabel_ = function(force) {
    if (force) {
      if (this.initializeLabel_()) {
        // Calculate the DIV coordinates of two opposite corners of our bounds to
        // get the size and position of our rectangle
        var p = this.map_.fromLatLngToDivPixel(this.latlng_);
        var z = GOverlay.getZIndex(this.latlng_.lat());
  
        // Now position our div based on the div coordinates of our bounds
        this.div_.style.left = (p.x + this.labelOffset_.width) + "px";
        this.div_.style.top = (p.y + this.labelOffset_.height) + "px";
        this.div_.style.zIndex = z; // in front of the marker
      }
    }
};

/**
 * Remove the text div from the map pane, destroy event passthrus, and calls the
 * default remove() handler in GMarker.
 */
 LabeledMarker.prototype.remove = function() {
  GEvent.clearInstanceListeners(this.div_);
  if (this.div_.outerHTML) {
    this.div_.outerHTML = ""; //prevent pseudo-leak in IE
  }
  if (this.div_.parentNode) {
    this.div_.parentNode.removeChild(this.div_);
  }
  this.div_ = null;
  this.labelInitialized_ = false;
  GMarker.prototype.remove.apply(this, arguments);
};

/**
 * Return a copy of this overlay, for the parent Map to duplicate itself in full. This
 * is part of the Overlay interface and is used, for example, to copy everything in the 
 * main view into the mini-map.
 */
LabeledMarker.prototype.copy = function() {
  return new LabeledMarker(this.latlng_, this.opts_);
};


/**
 * Shows the marker, and shows label if it wasn't hidden. Note that this function 
 * triggers the event GMarker.visibilitychanged in case the marker is currently hidden.
 */
LabeledMarker.prototype.show = function() {
  GMarker.prototype.show.apply(this, arguments);
  if (this.labelVisibility_) {
    this.showLabel();
  } else {
    this.hideLabel();
  }
};


/**
 * Hides the marker and label if it is currently visible. Note that this function 
 * triggers the event GMarker.visibilitychanged in case the marker is currently visible.
 */
LabeledMarker.prototype.hide = function() {
  GMarker.prototype.hide.apply(this, arguments);
  this.hideLabel();
};


/**
 * Repositions label and marker when setLatLng is called.
 */
LabeledMarker.prototype.setLatLng = function(latlng) {
  this.latlng_ = latlng;
  GMarker.prototype.setLatLng.apply(this, arguments);
  this.redrawLabel_();
};

/**
 * Sets the visibility of the label, which will be respected during show/hides.
 * If marker is visible when set, it will show or hide label appropriately.
 */
LabeledMarker.prototype.setLabelVisibility = function(visibility) {
  this.labelVisibility_ = visibility;
  if (!this.isHidden()) { // Marker showing, make visible change
    if (this.labelVisibility_) {
      this.showLabel();
    } else {
      this.hideLabel();
    }
  }
};


/**
 * Returns whether label visibility is set on.
 * @return {Boolean}  
 */
LabeledMarker.prototype.getLabelVisibility = function() {
  return this.labelVisibility_;
};


/**
 * Hides the label of the marker.
 */
LabeledMarker.prototype.hideLabel = function() {
  if (this.labelInitialized_) {
    //console.log("make INVISIBLE");
    this.div_.style.visibility = 'hidden';
  }
};


/**
 * Shows the label of the marker.
 */
LabeledMarker.prototype.showLabel = function() {
//console.log("make visible");
  this.initializeLabel_();
  this.div_.style.visibility = 'visible';
};
/**
 * Sets the label of the marker.
 */
LabeledMarker.prototype.setLabel = function(label) {
//console.log("make visible");
  this.labelText_ = label;
  this.initializeLabel_();
  this.div_.innerHTML = label;
};

LabeledMarker.prototype.setType = function(type) {
  this.labelType_ = type;
  this.refreshDivClassname_();
}
LabeledMarker.prototype.refreshDivClassname_ = function() {
  var divclassname = this.labelClass_;
  if (typeof this.labelType_ != 'undefined') 
    divclassname += " " + this.labelClass_ + "_type_" + this.labelType_;
  this.div_.className = divclassname;
}
