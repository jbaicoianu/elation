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
elation.extend("utils.math.clamp", function(val, min, max) {
  return Math.max(Math.min(val, max), min);
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
