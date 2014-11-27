elation.require(['ui.select', 'ui.panel', 'ui.label', 'ui.list', 'elation.collection'], function() {
  elation.component.add('ui.listtest', function() {
    this.defaultcontainer = { tag: 'div' };

    this.init = function() {
      this.addrate = 1;
      this.lifetime = 1;

      this.guys = elation.collection.indexed({
        index: 'label'
      });
      this.numguys = this.args.things || 100;
      //this.addguys(1000);
      this.controls = elation.ui.panel({
        append: this,
        orientation: 'horizontal'
      });
      this.selects = {
        addrate: elation.ui.select({
          append: this.controls,
          label: 'Add Rate',
          items: ['1/s', '2/s', '3/s', '4/s', '5/s', '10/s', '100/s', '1000/s', '10000/s'],
          selected: this.addrate + '/s',
          events: {
            'change': elation.bind(this, this.setrate)
          }
        }),
        lifetime: elation.ui.select({
          append: this.controls,
          label: 'Lifetime',
          items: ['1s', '10s', '100s', '1000s', '10000s'],
          selected: this.lifetime + 's',
          events: {
            'change': elation.bind(this, this.setrate)
          }
        }),
      };

      this.list = elation.ui.list({
        itemcollection: this.guys,
        classname: 'ui_listtest',
        append: this
      });
this.deferred = true;
  /*
      setInterval(elation.bind(this, function() {
        this.addguys(this.numguys);
      }), 500);
  */

      this.startadding();
    }
    this.startadding = function() {
      this.nextbatch();
      setTimeout(elation.bind(this, this.startadding), 1000);
    }
    this.addguys = function(numguys) {
      //console.log('add ' + numguys + ' guys');
      for (var i = 0; i < numguys; i++) {
        this.addrandom();
      }
    }
    this.addrandom = function() {
        var guy = {label: "New guy " + Math.floor(Math.random() * 100000)};
        //var pos = Math.floor(Math.random() * this.guys.length);
        var pos = null;
        this.guys.add(guy, pos);

          setTimeout(elation.bind(this, function() {
            this.guys.remove(guy);
          }), (1000 * this.lifetime));
    }

    this.nextbatch = function() {
      var batchsize = Math.ceil(Math.log(this.addrate) + .01);
      var batches = Math.ceil(this.addrate / batchsize);

//console.log('add ' + batches + ' batches of ' + batchsize + ' each (' + this.addrate + ')');
      for (var i = 0; i < batches; i++) {
        var thisbatchsize = Math.min(batchsize, this.addrate - (i * batchsize));
//console.log(' - ' + thisbatchsize + ' (' + batchsize + ', ' + (this.addrate - (i * batchsize)) + ')');
        setTimeout(elation.bind(this, function() {
          this.addguys(thisbatchsize);
        }), Math.random() * (1000 / 1));
      }
    }
    this.setrate = function() {
      // FIXME - instead of parseInt, we should be able to pass in key/value maps when creating ui.list objects
      this.addrate = parseInt(this.selects.addrate.value);
      this.lifetime = parseInt(this.selects.lifetime.value);
    }
  });
});
