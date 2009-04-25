function CarPC(mapdiv) {

  this.init = function(mapdiv) {
    this.mapdiv = mapdiv;
    this.map = new GMap(document.getElementById(mapdiv));
    //this.map.addControl(new GOverviewMapControl(new GSize(200,200)));

    for (var k in Config.panels) {
      if (Config.panels[k].id && !document.getElementById(Config.panels[k].id)) { // Only create the panel if it doesn't already exist
        var gpanel = new GMapPanelControl(this, {'panel': Config.panels[k]});
        this.map.addControl(gpanel);
      }
    }

    this.map.enableDoubleClickZoom() ;
    this.map.enableContinuousZoom() ;
    //this.map.enableScrollWheelZoom();

    this.follow = true;
    this.mode = "live";

    this.history = new Array();
    if (this.mode == "playback") {
      this.playback = new Object();
      this.playback.trip = 41;
      this.playback.offset = 0;
      this.playback.steptime = 1000;
      this.playback.step = 1;
      this.gpsurl = "/gps-playback.fcgi";
    } else {
      this.gpsurl = "/_gps.fcgi";
    }
this.gpsurl = null;

    this.loadArrows();
    this.loadIcons();
    this.markerpool = new MarkerPool(this.map);

    this.waypoints_enabled = false;
    this.waypoints = new Object();

    // FIXME - should auto-zoom to last-known gps position
    this.map.centerAndZoom(new GPoint(-121.993653, 37.350945), 3);

    this.xmlhttp = GXmlHttp.create();

    GEvent.addListener(this.map, 'dragstart', function() {
      carpc.setFollow(false);
    });
    GEvent.addListener(this.map, 'moveend', function() {
      if (!carpc.lastwaypointupdate || carpc.lastwaypointupdate.distanceFrom(carpc.map.getCenter()) > Math.pow(35, 20 / carpc.map.getZoom())) {
        carpc.getWaypoints(carpc.map.getBoundsLatLng(), carpc.map.getZoom());
        carpc.lastwaypointupdate = carpc.map.getCenter();
      }
    });
    GEvent.addListener(this.map, 'zoom', function() {
        carpc.getWaypoints(carpc.map.getBoundsLatLng(), carpc.map.getZoom());
    });

    if (this.mode == "playback") {
      document.getElementById("controls").innerHTML = '<a href="#" onclick="carpc.playback.step = -1; return false;">&lt;</a> <a href="#" onclick="carpc.playback.step = 0; return false;">||</a> <a href="#" onclick="carpc.playback.step = 1; return false;">&gt;</a> | <a href="#" onclick="carpc.playback.steptime = 2000; return false;">slow</a> <a href="#" onclick="carpc.playback.steptime = 1000; return false;">normal</a> <a href="#" onclick="carpc.playback.steptime = 250; carpc.playback.step *= 2; return false;">fast</a>';
    }

//    this.getPosition();
    if (this.mode == "playback") {
      setTimeout("carpc.playbackTrip(true);", 100);
    } else if (this.mode == "live") {
      setTimeout("carpc.getPosition();", 100);
    }

    //this.initDirections();
  }

  this.loadArrows = function() {
    this.arrowdirections = new Array("N", "NE", "E", "SE", "S", "SW", "W", "NW", "N");

    this.arrows = new Array();
    for (i = 0; i < 360; i += 15) {
      this.arrows[i] = new Image();
      this.arrows[i].src = "/arrows/arrow-" + i + ".png";
    }

  }
  this.loadIcons = function() {
    this.markertypes = new Object(/*"default", "poi", "friend", "restaurant", "bar", "parking"*/);
    this.markertypes[5] = "parking";
    this.markertypes[6] = "gas";

    this.markericons = new Array();
    for (var i in this.markertypes) {
      this.markericons[i] = new GIcon();
      this.markericons[i].image = "/markers/" + this.markertypes[i] + "-small.png";
      this.markericons[i].iconSize = new GSize(20, 20);
      this.markericons[i].iconAnchor = new GPoint(10, 10);
      this.markericons[i].infoWindowAnchor = new GPoint(10, 10);
    }
  }

  this.updatePosition = function(pos) {
    if (!pos.latlng) return;
    var latlng = new GLatLng(pos.latlng[0], pos.latlng[1]);

    document.getElementById("dist").innerHTML = Math.round(mps2mph(pos.vel[0]) * 10) / 10 + "mph, Heading " + Math.round(pos.vel[1]) + "&deg; (" + this.arrowdirections[Math.round(pos.arrow / 45)] + ")";

    if (!this.selfmarker) {
      // Create the initial marker icon
      var selfmarkericon = new GIcon();
      selfmarkericon.image = this.arrows[pos.arrow].src;
      selfmarkericon.iconSize = new GSize(15, 15);
      selfmarkericon.iconAnchor = new GPoint(8, 8);

      this.selfmarker = new GMarker(latlng, selfmarkericon, true);
      this.map.addOverlay(this.selfmarker);
      // Make sure we stay on top of everything else
      this.selfmarker.images[0].style.zIndex = 500;
    } else {
      this.selfmarker.point = latlng;
      this.selfmarker.redraw(true);
      if (this.selfmarker.images[0] != this.arrows[pos.arrow]) {
        this.selfmarker.images[0].src = this.arrows[pos.arrow].src;
      }
    }

    if (this.follow) {
        this.map.panTo(latlng);
    }
  }

  this.getPosition = function() {
    if (this.gpsurl) {
      // Make this call synchronously to avoid getting data out of sequence
      this.xmlhttp.open("GET", this.gpsurl, false);
      this.xmlhttp.send(null);
      parseResponse(this.xmlhttp.responseText, this);

      if (this.history[this.history.length - 1]) {
        this.updatePosition(this.history[this.history.length - 1]);
      }
      setTimeout('carpc.getPosition()', 1000);
    }
  }

  this.playbackTrip = function(firstcall) {
    if (this.history.length - 10 <= this.playback.offset && !this.playback.awaitingresponse) {
      var xmlhttp = GXmlHttp.create();
      var parent = this;

      // The first call should be synchronous so we have data to work with immediately
      xmlhttp.open("GET", this.gpsurl + "?trip=" + this.playback.trip + "&num=100&offset=" + (this.playback.offset + (firstcall ? 0 : 10)), !firstcall);
      xmlhttp.send(null);

      if (firstcall) {
        parseResponse(xmlhttp.responseText, parent);
      } else {
        parent.playback.awaitingresponse = true;
        xmlhttp.onreadystatechange = function() { 
          if (xmlhttp.readyState == 4 && xmlhttp.responseText) {
            parent.playback.awaitingresponse = false;
            parseResponse(xmlhttp.responseText, parent);
          }
        }
      }

    }

    if (this.history[this.playback.offset]) {
      this.updatePosition(this.history[this.playback.offset]);
      this.playback.offset += this.playback.step;
 
      setTimeout('carpc.playbackTrip(false)', this.playback.steptime);
    }
  }

  this.toggleFollow = function() {
    this.setFollow(!this.follow);
  }

  this.setFollow = function(newstatus) {
    this.follow = newstatus;
    var followdiv = document.getElementById("follow");
    if (newstatus) {
      followdiv.style.color = 'green';
      followdiv.innerHTML = "ON";
    } else {
      followdiv.style.color = 'red';
      followdiv.innerHTML = "OFF";
    }
  }

  this.getWaypoints = function(bounds, zoom) {
    if (carpc.waypoints_enabled) {
      // First, let's remove any markers that aren't supposed to be shown at this zoom level, and aren't within our field of view
      for (var key in carpc.waypoints) {
        if (carpc.waypoints[key].visible && (carpc.waypoints[key].zoom > zoom || !carpc.map.getBounds().contains(carpc.waypoints[key].pos))) {
          //carpc.map.removeOverlay(carpc.waypoints[key].marker);
          carpc.markerpool.releaseMarker(carpc.waypoints[key].marker.poolid);
          carpc.waypoints[key].visible = false;
        }
      }

      var xmlhttp = GXmlHttp.create();

      // FIXME - should pre-load slightly over the edges of the map
      // document.getElementById("controls").innerHTML = "(" + bounds.maxY + "," + bounds.maxX + ") (" + bounds.minY + "," + bounds.minX + ")";

      xmlhttp.open("GET", "/waypoints.fcgi?action=list&tr=" + bounds.maxY + "," + bounds.maxX + "&bl=" + bounds.minY + "," + bounds.minX + "&zoom=" + zoom, true);
      xmlhttp.send(null);
    
      xmlhttp.onreadystatechange = function() { 
        if (xmlhttp.readyState == 4 && xmlhttp.responseText) {
          var waypoints = xmlhttp.responseText.split("\n");
          for (var i = 0; i < waypoints.length; i++) {
            if (waypoints[i]) {
              var tmp = waypoints[i].split("|");
              var num = tmp[0];
              if (!carpc.waypoints[num]) {
                var pos = tmp[2].split(",");
                carpc.waypoints[num] = new Object();
                carpc.waypoints[num].num = num;
                carpc.waypoints[num].type = tmp[1];
                carpc.waypoints[num].pos = new GLatLng(pos[0], pos[1]);
                carpc.waypoints[num].name = tmp[3];
                carpc.waypoints[num].address = tmp[4];
                carpc.waypoints[num].zoom = tmp[5];
                carpc.waypoints[num].visible = true;
  
                carpc.waypoints[num].marker = carpc.markerpool.getMarker(num);
              } else if (!carpc.waypoints[num].visible) {
                carpc.waypoints[num].marker = carpc.markerpool.getMarker(num);
                carpc.waypoints[num].visible = true;
              }
            }
          }
        }
      }
    }
  }

  this.getWaypointInfo = function(wpid) {
    // Make this call synchronously to avoid getting data out of sequence
    var xmlhttp = GXmlHttp.create();

    xmlhttp.open("GET", "/waypoints.fcgi?action=info&wid=" + wpid, false);
    xmlhttp.send(null);
    return xmlhttp.responseText;
  }

  this.toggleTraffic = function() {
    if (!this.traffic) {
      this.traffic = new GTrafficOverlay({incidents: true});
      this.map.addOverlay(this.traffic);
    }
    if (this.showtraffic == true) {
      this.traffic.hide();
      this.showtraffic = false;
    } else {  
      this.traffic.show();
      this.showtraffic = true;
    }
    return this.showtraffic;
  }

  this.initDirections = function() {
    this.directions = new GDirections(this.map);
    GEvent.addListener(this.directions, 'load', this.processDirections);
  }
  this.getDirections = function(from, to) {
    this.directions.load("from:" + from + " to:" + to, {getSteps: true});
  }
  this.processDirections = function() {
    var panel = document.getElementById('navigation_directions_results');
panel.innerHTML = "";
var dirlist = document.createElement('UL');
dirlist.id = "navigation_directions_steps";
dirlist.className = "ui_scrollable orientation_vertical";
var distancediv = document.createElement('DIV');
distancediv.id = "navigation_directions_summary";
    var numroutes = this.getNumRoutes();
    for (var i = 0; i < numroutes; i++) {
      var route = this.getRoute(i);
var distance = route.getDistance();
var duration = route.getDuration();
distancediv.innerHTML = distance.html + " (about " + duration.html + ")";
//console.log("Route: ", route);
//console.log(route.getSummaryHtml());
      var numsteps = route.getNumSteps();
//console.log(numsteps + ' steps');
      for (var j = 0; j < numsteps; j++) {
        var step = route.getStep(j);
        var dirhtml = step.getDescriptionHtml();
var dirli = document.createElement('LI');
dirli.innerHTML = dirhtml + '<span class="navigation_directions_steps_distance">' + step.getDistance().html + '</span>';
dirlist.appendChild(dirli);
        dir = dirhtml.replace(/(<([^>]+)>)/ig,""); 
        var r = {
         'Blvd': 'Boulevard',
         'St': 'Street',
         'Expy': 'Expressway',
         'Ave': 'Avenue',
         'Fwy': 'Freeway',
         'Rte': 'Route',
         'Dr': 'Drive',
         'Rd': 'Road',
         'Pkwy': 'Parkway',
         'Ft': 'Fort',
         'I-': 'Interstate ',
         'N': 'North',
         'NW': 'North West',
         'NE': 'North East',
         'S': 'South',
         'SW': 'South West',
         'SE': 'South East',
         'So\.': 'South',
         'E': 'East',
         'W': 'West',
         'US': 'U S',
         '(\\d)0(\\d)': '$1 oh $2',
         '(\\d)(\\d\\d)': '$1 $2',
         'onto': 'on to',
        }
        for (var k in r) {
          var re = new RegExp("\\b"+k+"\\b", "g");
          dir = dir.replace(re, r[k]);
        }
        //console.log('Step ' + j + ': ' + dir);
        ajaxlib.Get('/audio/festival?say=' + encodeURIComponent(dir));
      }
    }

panel.appendChild(distancediv);
panel.appendChild(dirlist);
dirlist.scrollTop = 0;
    var blah = new UIScrollable(this, {element: dirlist});
  }

  // Initialize CarPC class
  this.init(mapdiv);
}

function MarkerPool(map) {
  this.init = function(map) {
    this.map = map;
    this.pool = new Array();
    this.allocatechunk = 5;
    this.loadIcons();
  }

  this.loadIcons = function() {
    this.markertypes = new Array("default", "poi", "friend", "restaurant", "bar", "parking", "gas");

    this.icons = new Array();
    for (var i = 0; i < this.markertypes.length; i++) {
      this.icons[i] = new Image();
      this.icons[i].src = "/markers/" + this.markertypes[i] + "-small.png";
    }

    // And one final blank icon for "disabled" markers
    this.icons[9999] = new Image();
    this.icons[9999].src = "/markers/none.png";

    this.baseicon = new GIcon();
    this.baseicon.image = this.icons[0].src;
    this.baseicon.iconSize = new GSize(20, 20);
    this.baseicon.shadowSize = new GSize(0, 0);
    this.baseicon.iconAnchor = new GPoint(10, 10);
    this.baseicon.infoWindowAnchor = new GPoint(10, 10);

  }

  this.allocateMarkers = function(num) {
    for (var i = 0; i < num; i++) {
      var poolid = this.pool.length;
      this.pool[poolid] = new GMarker(new GLatLng(0, 0), this.baseicon);
      this.pool[poolid].poolid = poolid;
      this.pool[poolid].used = false;
      this.map.addOverlay(this.pool[poolid]);
    }
    return this.pool.length;
  }

  this.getMarker = function(waypointid) {
    var marker;

    for (var num = 0; num < this.pool.length; num++) {
      if (this.pool[num].used == false) {
        marker = this.pool[num];
        this.pool[num].used = true;
        break;
      }
    }

    // If we iterated over the whole pool and didn't find an unused marker, preallocate some more
    if (!marker) {
      var num = this.pool.length;
      this.allocateMarkers(this.allocatechunk);
      this.pool[num].used = true;
      marker = this.pool[num];
    }

    return this.changeMarker(marker, waypointid);
  }

  this.changeMarker = function(marker, waypointid) {
if (!marker.images) {
document.getElementById("controls").innerHTML += ".";
return false;
}
    if (marker.images[0] != this.icons[carpc.waypoints[waypointid].type]) {
      marker.images[0].src = this.icons[carpc.waypoints[waypointid].type].src;
    }
    marker.point = carpc.waypoints[waypointid].pos;
    marker.redraw(true);

    GEvent.addListener(marker, "click", function() {
      var info = carpc.getWaypointInfo(waypointid);
      marker.openInfoWindowHtml('<div class="markerinfo">' + info + '</div>');
    });

    return marker;
  }

  this.releaseMarker = function(poolid) {
    // Google Maps leaks memory if we actually remove the icon, so let's just move it into the middle of the ocean
    this.pool[poolid].point = new GLatLng(0, 0);
    this.pool[poolid].redraw(true);
    this.pool[poolid].used = false;
    this.pool[poolid].images[0].src = this.icons[9999].src;
    GEvent.clearInstanceListeners(this.pool[poolid]);
  }

  this.init(map);
}

// convert meters per second to MPH
function mps2mph(mps) {
  return mps / 0.44704;
}

function parsePosition(posstr) {
  var ret = new Object();

  var tmp = posstr.split(":");
  ret.time = tmp[0];
  if (tmp[1])
    ret.latlng = tmp[1].split(",");
  if (tmp[2]) {
    ret.vel = tmp[2].split(",");
    ret.arrow = chooseDirectionArrow(ret.vel[1]);
  }
  if (tmp[3])
    ret.error = tmp[3].split(",");

  return ret;
}
function parseResponse(response, parent) {
  var lines = response.replace(/\s*$/, "").split("\n");
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].length > 0) {
      var pos = parsePosition(lines[i]);
      parent.history[carpc.history.length] = pos;
//      document.getElementById("controls").innerHTML = "e[loc] = " + pos.error[0] + ", e[speed] = " + pos.error[1] + ", e[heading] = " + pos.error[2];
    }
  }
}

function chooseDirectionArrow(heading) {
  var arrow = Math.round(heading / 15) * 15;
  if (arrow == 360) arrow = 0;
  return arrow;
}

function createMarker(type, point, html) {
  var marker = new GMarker(point, carpc.markericons[type]);
  GEvent.addListener(marker, "click", function() {
    marker.openInfoWindowHtml('<div class="markerinfo">' + html.replace(/\\n/g, "<br />") + '</div>');
  });
  return marker;
}

function GMapPanelControl(parent, args) {
  this.parent = parent;
  this.args = args;
}
GMapPanelControl.prototype = new GControl();
GMapPanelControl.prototype.initialize = function(map) {
  this.panel = new UIPanel(this, this.args.panel, {'map':map});

  if (this.panel.parentid) {
    var el = document.getElementById(this.panel.parentid);
// FIXME - OH NO, DUP PANELS!!!
    if (el) el.appendChild(this.panel.container);
  } else {
    map.getContainer().appendChild(this.panel.container);
  }
  return this.panel.container;
}

GMapPanelControl.prototype.getDefaultPosition = function() {
  var anchors = {'top_left': G_ANCHOR_TOP_LEFT,
                 'top_right': G_ANCHOR_TOP_RIGHT,
                 'bottom_left': G_ANCHOR_BOTTOM_LEFT,
                 'bottom_right': G_ANCHOR_BOTTOM_RIGHT,
                };

  return new GControlPosition(anchors[this.panel.anchor], new GSize(this.panel.offset[0], this.panel.offset[1]));
}
