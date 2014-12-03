elation.extend("utils.math.gcd", function(t1, t2) {
  var gcd = 1;
  if (t1 > t2) {
    t1 = t1 + t2;
    t2 = t1 - t2;
    t1 = t1 - t2;
  }
  if ((t2 == (Math.round(t2 / t1)) * t1)) {
    gcd = t1
  } else {
    for (var i = Math.round(t1 / 2); i > 1; i--) {
      if ((t1 == (Math.round(t1 / i)) * i) && (t2 == (Math.round(t2 / i)) * i)) {
        gcd = i;
        i=-1;
      }
    }
  }
  return gcd;  
});
elation.extend("utils.math.lcm", function(t1, t2) {
  var cm = 1;
  var f = elation.utils.math.gcd(t1,t2);
  cm = t1 * t2 / f;
  return cm;
});
elation.extend("utils.math.clamp", function(value, min, max) {
  return Math.max(Math.min(value, max), min);
});
elation.extend("utils.math.percent2value", function(percent, min, max) {
  return ((max - min) * percent) + min;
});
elation.extend("utils.math.value2percent", function(value, min, max) {
  return (value - min) / (max - min);
});
elation.extend("utils.math.arraysub", function(a1, a2) {
  var ret = [];
  for (var i = 0; i < a1.length; i++) {
    ret[i] = a1[i] - a2[i];
  }
  return ret;
});
elation.extend("utils.math.arrayadd", function(a1, a2) {
  var ret = [];
  for (var i = 0; i < a1.length; i++) {
    ret[i] = a1[i] + a2[i];
  }
  return ret;
});
elation.extend('utils.math.vector3.dot', function(A, B) {
  var D = [ 
        A[0] * B[0],
        A[1] * B[1],
        A[2] * B[2]
      ],
      C = D[0] + D[1] + D[2];
  
  return C;
});
elation.extend('utils.math.vector3.normalize', function(A) {
  var length = elation.utils.math.vector3.magnitude(A),
      B = [
        A[0] / length,
        A[1] / length,
        A[2] / length
      ],
      C = [
        (isNaN(B[0]) ? 0 : B[0]),
        (isNaN(B[1]) ? 0 : B[1]),
        (isNaN(B[2]) ? 0 : B[2])
      ];
  
  return C;
});
elation.extend('utils.math.vector3.subtract', function(A, B) {
  var C = [
        A[0] - B[0],
        A[1] - B[1],
        A[2] - B[2]
      ];
  
  return C;
});
elation.extend('utils.math.vector3.distance', function(B, C) {
  var A = elation.utils.math.vector3.subtract(B, C),
      distance = elation.utils.math.vector3.magnitude(A);
  
  return distance;
});
elation.extend('utils.math.vector3.magnitude', function(A) {
  var sx = Math.pow(A[0], 2),
      sy = Math.pow(A[1], 2),
      sz = Math.pow(A[2], 2),
      magnitude = Math.sqrt(sx + sy + sz);
  
  return magnitude;
});
// FIXME - there might be something buggy with this but I don't remember clearly
elation.extend('utils.math.vector3.quat2euler', function(q, degrees) {
  var sqx   = q.x * q.x,
      sqy   = q.y * q.y,
      sqz   = q.z * q.z,
      yaw   = Math.atan2(2 * q.y * q.w - 2 * q.x * q.z, 1 - 2 * sqy - 2 * sqz),
      pitch = Math.atan2(2 * q.x * q.w - 2 * q.y * q.z, 1 - 2 * sqx - 2 * sqz),
      roll  = Math.asin(2 * q.x * q.y + 2 * q.z * q.w),
      r2d   = function(rad) { return rad * 180 / Math.PI; };
  
  if (degrees)
    return [ r2d(yaw), r2d(pitch), r2d(roll) ];
  else
    return [ yaw, pitch, roll ];
});
elation.extend('utils.math.point.translate', function(x, y, tx, ty) {
  return { x: x+tx, y: y+ty };
});
elation.extend('utils.math.point.rotate', function(X, Y, angle, tx, ty) {
  var x, y;
  
  switch (typeof X) {
    case "number":
      break;
    case "object":
      if (typeof X.length == 'number') {
        ty = tx ? tx : X.length > 4 ? X[4] : 0;
        tx = ty ? ty : X.length > 3 ? X[3] : 0;
        angle = Y ? Y : X.length > 2 ? X[2] : 0;
        Y = X[1];
        X = X[0];
      } else {
        var get = elation.utils.arrayget,
            a = function(o, k, b) { 
              return b ? b : get(o, k) ? get(o, k) : 0; 
            };
        
        ty = a(X, 'ty', ty);
        tx = a(X, 'tx', tx);
        angle = a(X, 'angle', Y);
        Y = get(X, 'y');
        X = get(X, 'x');
      }
      
      break;
    default:
      return null;
  }
  
  x = X * Math.cos(angle) - Y * Math.sin(angle);
  y = X * Math.sin(angle) + Y * Math.cos(angle);
  
  if (tx && ty)
    var translate = elation.utils.math.point.translate(x, y, tx, ty),
        x = translate.x,
        y = translate.y;
  
  return { x: x, y: y, X: X, Y: Y, angle: angle };
});
elation.extend('utils.math.object.rotate', function(obj, angle) {
  var rotated = [];
  
  for (var i=0; i<obj.length; i++) {
    var point = obj[i],
        tmp = elation.utils.math.point.rotate(point, angle);
    
    rotated.push(tmp);
  }
  
  return rotated;
});