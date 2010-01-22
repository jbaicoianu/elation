Config = { 
  'panels': {
    'zoom': {
      'id': 'navigation_map_zoom',
      'anchor': 'top_left',
      'offset': [10, 10],
      'orientation': 'vertical',
      'size': 'huge',
      'items': {
        'in': {
          'type': 'button',
          'label': '+',
          'class': 'navigation_map_zoom_in',
          'click': function(ev) { ev.data.parent.extras.map.zoomIn(); }
        },
        'out': {
          'type': 'button',
          'label': '-',
          'class': 'navigation_map_zoom_out',
          'click': function(ev) { ev.data.parent.extras.map.zoomOut(); }
        }
      }
    },
    'maptype': {
      'id': 'navigation_map_maptype',
      'anchor': 'top_right',
      'offset': [10, 10],
      'orientation': 'horizontal',
      'items': {
        'traffic': {
          'type': 'button', 
          'label': 'traffic',
          'class': 'navigation_map_maptype_button_traffic',
          'click': function(ev) { if (ev.data.parent.parent.parent.toggleTraffic()) ev.data.setStatus('active'); else ev.data.setStatus('default') }
        },
        'streetmap': {
          'type': 'button', 
          'label': 'streetmap',
          'class': 'navigation_map_maptype_button_streetmap',
          'click': function(ev) { ev.data.parent.extras.map.setMapType(G_NORMAL_MAP); ev.data.setStatus('active'); ev.data.parent.items.satellite.setStatus('default');}
        },
        'satellite': {
          'type': 'button', 
          'class': 'navigation_map_maptype_button_satellite',
          'label': 'satellite',
          'click': function(ev) { ev.data.parent.extras.map.setMapType(G_HYBRID_MAP); ev.data.setStatus('active'); ev.data.parent.items.streetmap.setStatus('default');}
        }
/*
        'terrain': {
          'type': 'button', 
          'class': 'navigation_map_maptype_button_terrain',
          'label': 'terrain',
          'click': function(ev) { ev.data.parent.extras.map.setMapType(G_PHYSICAL_MAP); ev.data.setStatus('active'); ev.data.parent.items.streetmap.setStatus('default');}
        }
*/
      }
    },
    'gps': {
      'id': 'navigation_map_gps',
      'anchor': 'top_right',
      'offset': [420, 10],
      'items': {
        'status': {
          'classname':'navigation_map_gps_status'
        }
      }
    },
/*
    'media': {
      'id': 'controls',
      'anchor': 'bottom_left',
      'offset': [0, 0],
      'orientation': 'horizontal',
      'items': {
        'previous': {
          'classname':'media_action_previous_button'
        },
        'pauseplay': {
          'classname':'media_action_pauseplay_button'
        },
        'next': {
          'classname':'media_action_next_button'
        },
      }
    },
*/
    'apps': {
      'id': 'test_menu',
      'parentid': 'container',
      'anchor': 'top_left',
      'orientation': 'vertical',
      'attach': 'left',
      'offset': [0, 170],
      'collapsible': true,
      'type': 'slideout',
      'size': 'large',
      'handle': {
        'gutter': '3',
        'label': '||',
        'collapsed': true,
        'autocollapse': true
      },
      'items': {
        'map': {
          'type': 'button',
          'label': 'Map',
          'href': '/navigation.ajax',
          'click': function(ev) { 
            ajaxlib.Get(this.href);
            ev.preventDefault();
          }
        },
        'locations': {
          'type': 'button',
          'label': 'Locations',
          'href': '/navigation/location_categories.ajax',
          'click': function(ev) { 
            ajaxlib.Get(this.href);
            ev.preventDefault();
          }
        },
        'audio': {
          'type': 'button',
          'label': 'Audio',
          'href': '/audio.ajax',
          'click': function(ev) { 
            ajaxlib.Get(this.href);
            ev.preventDefault();
          }
        },
        'performance': {
          'type': 'button',
          'label': 'Performance',
          'href': '/performance.ajax',
          'click': function(ev) { 
            ajaxlib.Get(this.href);
            ev.preventDefault();
          }
        },
        'maintenance': {
          'type': 'button',
          'label': 'Maintenance',
          'href': '/maintenance.ajax',
          'click': function(ev) { 
            ajaxlib.Get(this.href);
            ev.preventDefault();
          }
        }
      }
    }
    /*
    'directions': {
      'id': 'navigation_directions',
      'anchor': 'top_right',
      'attach': 'right',
      'collapsible': true,
      'type': 'slideout',
      'offset': [0, 100],
      'orientation': 'vertical',
      'handle': {
        'label': '||',
        'collapsed': true,
        'autocollapse': false,
      },
      'items': {
        'content': {
          'type': 'component',
          'component': 'navigation.directions',
        }
      }
    },
    */
  }
}
