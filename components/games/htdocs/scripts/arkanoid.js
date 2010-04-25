elation.extend("games.arkanoid", {
  games: [],
  init: function(container, options) {
    this.games.push(new this.game(container, options));
  },
  game: function(container, options) {
    this.container = container;
    this.options = options || {};
    this.objects = [];
    this.pos = [0, 0, 0];
    this.size = [0, 0];

    this.init = function() {
      if (typeof this.container == "string")
        this.container = document.getElementById(this.container);
  
      // sound sometimes crashes the iphone, and it doesn't fully support HTML5 audio anyway
      this.options.sound = !(this.options.sound === false || elation.browser.type == 'iphone'); 
      this.pos = [this.container.offsetLeft, this.container.offsetTop, 0];
      this.size = [this.container.offsetWidth, this.container.offsetHeight];
      this.maxspeed = this.options.maxspeed || 1000;

      // this.objects contains a list of all collidable objects
      // Start with the level bounding box (ie, the table walls)
      this.objects.push(new elation.utils.dynamics(this, {box: [[0, 0], this.size]})); 
      this.paddle =  new elation.games.common.paddle(this.container, {restrict: [[0, 0], [this.size[0], this.size[1]]]});
      console.log(this.paddle);
    }

    this.init();
  }
});
