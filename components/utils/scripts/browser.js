/* Browser detection script - modified from http://www.quirksmode.org/js/detect.html */

elation.extend("browser", new function() {
  this.checkIt = function (string) {
    this.place = detect.indexOf(string) + 1;
    this.tmpstring = string;
    return this.place;
  }
  var detect = navigator.userAgent.toLowerCase();

  if (this.checkIt('konqueror')) {
    this.type = "Konqueror";
    this.OS = "Linux";
  } 
  else if (this.checkIt('iphone')) this.type = "iphone"
  else if (this.checkIt('android')) this.type = "android"
  else if (this.checkIt('safari')) this.type = "safari"
  else if (this.checkIt('omniweb')) this.type = "omniweb"
  else if (this.checkIt('opera')) this.type = "opera"
  else if (this.checkIt('webtv')) this.type = "webtv";
  else if (this.checkIt('icab')) this.type = "icab"
  else if (this.checkIt('msie')) this.type = "msie"
  else if (this.checkIt('firefox')) this.type = "firefox"
  else if (!this.checkIt('compatible')) {
    this.type = "netscape"
    this.version = detect.charAt(8);
  }
  else this.type = "unknown";

  if (!this.version) this.version = detect.charAt(this.place + this.tmpstring.length);

  if (!this.OS) {
    if (this.checkIt('linux')) this.OS = "linux";
    else if (this.checkIt('x11')) this.OS = "unix";
    else if (this.checkIt('mac')) this.OS = "mac"
    else if (this.checkIt('win')) this.OS = "windows"
    else this.OS = "unknown";
  }
});

// Fake console.log to prevent scripts from erroring out in browsers without firebug
if (typeof window.console == 'undefined') {
  console = new function() {
    this.log = function(str) {
        //alert(str);
    }
  }
}
