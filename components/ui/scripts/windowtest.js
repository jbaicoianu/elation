elation.require(['ui.window', 'ui.buttonbar'], function() {
  elation.component.add('ui.windowtest', function() {
    this.init = function() {
      this.container.style.webkitTransformStyle = 'preserve-3d';
      this.container.style.MozTransformStyle = 'preserve-3d';
      this.windows = [];
      this.buttons = elation.ui.buttonbar(null, elation.html.create({append: this.container}), {
        buttons: {
          'shuffle': { label: 'shuffle', events: { click: elation.bind(this, this.shuffle) } },
          'cascade': { label: 'cascade', events: { click: elation.bind(this, this.cascade) } }
        }
      });
      var videos = [ 'hPzNl6NKAG0', '2XID_W4neJo' ];

      for (var i = 0; i < 10; i++) {
        var pos = [Math.random() * window.innerWidth * .75, Math.random() * window.innerHeight * .75];
        var size = [Math.max(20, Math.floor(Math.random() * window.innerWidth * .5)), Math.floor(Math.random() * window.innerHeight * .5)];
        this.windows[i] = elation.ui.window(null, elation.html.create({append: this.container}), {
          title: 'Kitty ' + i + ' (' + size[0] + 'x' + size[1] + ')',
          position: pos,
          content: '<img src="http://placekitten.com/' + size[0] + '/' + size[1] + '">'
        });
      }
  /*
      for (var i = 0; i < videos.length; i++) {
        var pos = [Math.random() * window.innerWidth * .75, Math.random() * window.innerHeight * .75];
        var size = [Math.max(200, Math.floor(Math.random() * window.innerWidth * .5)), Math.floor(Math.random() * window.innerHeight * .5)];
        this.windows[i] = elation.ui.window(null, elation.html.create({append: this.container}), {
          title: 'Kitty Video ' + i,
          position: pos,
          content: '<iframe width=560 height=315 src="//youtube.com/embed/' + videos[i] + '?html5=1" frameborder=0 allowfullscreen></iframe>'
          //content: '<iframe width=700 height=315 src="http://www.thefind.com" frameborder=0 allowfullscreen></iframe>'
        });
      }
  */
    }
    this.shuffle = function() {
      for (var i = 0; i < this.windows.length; i++) {
        var pos = [Math.random() * window.innerWidth * .75, Math.random() * window.innerHeight * .75];
        this.windows[i].setposition(pos, true);
      }
    }
    this.cascade = function() {
      for (var i = 0; i < this.windows.length; i++) {
        this.windows[i].windownum = i+1;
        this.windows[i].setposition([(i+1) * 30, (i+1) * 30], true);
      }
    }
  });
});
