elation.extend("games.schess", {
  games: [],
  init: function(container, options) {
    this.games.push(new this.game(container, options));
  },
                               
  game: function(container, options) {
    this.container = container;
    this.options = options || {};
    this.boards = [];
  
    this.init = function() {
      if (typeof this.container == "string")
        this.container = document.getElementById(this.container);
      this.boards['main'] = new elation.games.common.board(this.container, {game: this, size: [8, 8], className: 'schess_board_main'});
    }
    this.init();
  },
  piece: function(container, options) {
    this.init = function() {
    }
    this.init(); 
  }
});
