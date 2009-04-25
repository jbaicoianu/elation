{component name="html.header"}
<script type="text/javascript" src="/scripts/components/iphone/sylvester.src.js"></script>
<script type="text/javascript" src="/scripts/components/iphone/test.js"></script>
<link rel="stylesheet" href="/css/components/iphone/iphone.css" />

<div id="icanvas">
</div>

<div class="icontrols">
{*
 <a href="#" onclick="rootcanvas.setInputMode('rotate'); return false">Rotate</a>
 <a href="#" onclick="rootcanvas.setInputMode('move'); return false">Move</a>
 <a class="icontrol_up" href="#" onclick="rootcanvas.setInputMode('rotate'); return false">Rotate</a>
 <a href="#" onclick="rootcanvas.setInputMode('move'); return false">Move</a>
*}
</div>

<script type="text/javascript">
{literal}
var objects = {
  'box': {
    'origin': [0,0,-1000],
    'rotate': [30,30,0],
    'classname': 'quakecube',
    'dynamics': {
      'mass': 50,
      'velocity': [0, 0, 0],
      'drag': 0.8,
      'friction': 0.8,
    },
    'polygons': [
      [[0, 0, 128], [0, 0, 0], [256,256], 'p_front'], // front
      [[0, 0, -128], [0, 180, 0], [256,256],'p_back'],  // back
      [[-128, 0, 0], [0, -90, 0],[256,256],'p_left'], // left
      [[128, 0, 0], [0, 90, 0],[256,256],'p_right'], // right
      [[0,-128,0], [-90, 0, 0],[256,256],'p_top'],
      [[0,128,0], [90, 0, 0],[256,256],'p_bottom'],
    ]
  },
  'otherbox': {
    'origin': [100,100,-400],
    'rotate': [45,-45,0],
    'classname': 'brickcube',
    'polygons': [
      [[0, 0, 50], [0, 0, 0], [100,100], '<img src="http://www.thefind.com/images/logos/thefind_small.png" />'], // front
      [[0, 0, -50], [0, 180, 0], [100,100]],  // back
      [[-50, 0, 0], [0, -90, 0], [100,100]], // left
      [[50, 0, 0], [0, 90, 0], [100,100]], // right
      [[0,-50,0], [-90, 0, 0], [100,100]],
      [[0,50,0], [90, 0, 0], [100,100]],
    ]
  },
/*
  'level': {
    'origin': [0, 0, 0],
    'rotate': [0,0,0],
    'classname': 'game_level',
    'polygons': [
      [[-1024, -256, -2048], [0, 0, 0], [2048,512], 'p_wall'],
      //[[-1024, 0, -5000], [0, 45, 0], [5120,5120], 'p_wall'],
      //[[-256, 0, -512], [0, 90, 0], [512,512], 'p_wall'],
      //[[-256, 0, -1024], [0, 90, 0], [512,512], 'p_wall'],
    ],
  }
*/
};

var controls = {
  'sticks': {
    'strafemove': {
      'classname': "control_stick_strafemove",
      'events': {
        'axismove': function(ev, parent, object) {
          object.dynamics.addForce('strafemove', [-ev.x * 100, 0, -ev.y * 200]);
        }
      }
    },
    'look': {
      'classname': "control_stick_look",
      'events': {
        'axismove': function(ev, parent, object) {
          //object.rotateRel([ev.x/100, ev.y/100, 0]);
          object.dynamics.setAngularVelocity([ev.y/5, ev.x/5, 0]);
        }
      }
    },
  },
/*
  'buttons': {
    'up': {
      'label': 'W',
      'classname': 'button_up',
      'events': {
        'touchstart,mousedown': function(ev, parent, object) { 
          //object.dynamics.setAccelerationZ(10);
          object.dynamics.addForce("button_up", [0,0,25000]);
        },
        'touchend,mouseup': function(ev, parent, object) { 
          //object.dynamics.setVelocityZ(0);
          object.dynamics.removeForce("button_up");
        },
      },
    },
    'down': {
      'label': 'S',
      'classname': 'button_down',
      'events': {
        'touchstart,mousedown': function(ev, parent, object) { 
          //object.dynamics.setVelocityZ(-100);
          object.dynamics.addForce("button_down", [0,0,-25000]);
        },
        'touchend,mouseup': function(ev, parent, object) { 
          //object.dynamics.setVelocityZ(0);
          object.dynamics.removeForce("button_down");
        },
      },
    },
    'left': {
      'label': 'A',
      'classname': 'button_left',
      'events': {
        'touchstart,mousedown': function(ev, parent, object) { 
          //object.dynamics.setVelocityX(100);
          object.dynamics.addForce("button_left", [10000,0,0]);
        },
        'touchend,mouseup': function(ev, parent, object) { 
          //object.dynamics.setVelocityX(0);
          object.dynamics.removeForce("button_left");
        },
      },
    },
    'right': {
      'label': 'D',
      'classname': 'button_right',
      'events': {
        'touchstart,mousedown': function(ev, parent, object) { 
          //object.dynamics.setVelocityX(-100);
          object.dynamics.addForce("button_right", [-10000,0,0]);
        },
        'touchend,mouseup': function(ev, parent, object) { 
          //object.dynamics.setVelocityX(0);
          object.dynamics.removeForce("button_right");
        },
      },
    }
  }
*/
};

var rootcanvas = new iCanvas('icanvas', false);
rootcanvas.addObjects(objects);
rootcanvas.addControls(controls);
rootcanvas.go();

//setTimeout(function() { rootcanvas.objects["box"].rotateRel([10,10,10]); }, 10);
{/literal}
</script>

{component name="html.footer"}
