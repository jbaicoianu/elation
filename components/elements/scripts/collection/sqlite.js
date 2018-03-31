elation.require(['elements.collection.localindexed'], function() {
  /**
    * elation.collection.sqlite - nodejs sqlite-backed collection

   * @class sqlite
   * @augments elation.collection.localindexed
   * @memberof elation.collection
   * @alias elation.collection.sqlite
   *
   * @param {object} args
   * @param {string} args.dbfile Path to database file
   * @param {string} args.table Name of database table
   * @param {object} args.schema Associative array describing table schema
   * @param {boolean} args.autocreate Create schema automatically if supplied
    */
  elation.elements.define('collection.sqlite', class extends elation.elements.collection.localindexed {
    init() {
      super.init();
      this.dbfile = this.args.dbfile || '';
      this.table = this.args.table;
      this.apiargs = this.args.apiargs;
      this.schema = this.args.schema;
      //this.data = { items: [], count: 0 };

      var fs = require('fs');
      var exists = fs.existsSync(this.dbfile);
      var fpath = fs.realpathSync(this.dbfile);
      console.log('exists?', exists, fpath);

      var sqlite = require('sqlite3')
      this.db = new sqlite.Database(this.dbfile);

      if (this.args.autocreate && this.args.schema) {
        this.create(this.args.schema);
      }

      Object.defineProperties(this, {
        items: { get: this.getitems }
      });
    }
    load() {
      if (this.loading) {
        this.cancel();
      }
      this.loading = true;
      elation.events.fire({type: "collection_load_begin", element: this});
      var items = [];
      this.db.each("SELECT * FROM " + this.table, function(err, row) {
        items.push(row);
      }, function() {
        this.processResponse(items);
      }.bind(this));
      //this.data = { items: items, count: items.length };
    }
    getitems() {
      if (!this.data) {
        this.data = { items: [], count: 0 };
        this.load();
      }
      return this.data.items;
    }
    processResponse(data, args) {
      this.rawdata = this.parseData(data);
      var newdata = this.transformData(this.rawdata);
      if (!this.data) {
        this.data = { items: [], count: 0 };
      }
      if (newdata.items) {
        Array.prototype.push.apply(this.data.items, newdata.items);
      }
      if (newdata.count) {
        this.data.count = newdata.count;
      }
      this.buildindex();
      this.loading = false;
      elation.events.fire({type: "collection_load", element: this});
    }
    save() {
      var updates = [];
      var items = this.items;
      var batchsize = 100;

      console.log('save items!', items.length);
      for (var i = 0; i < items.length; i+= batchsize) {
        var thisbatch = Math.min(batchsize, items.length - i);
        this.savebatch(items.slice(i, i + thisbatch));
      }
    }
    savebatch(items) {
      var sql = 'INSERT OR REPLACE INTO ' + this.table;
      var cols = [], pholders = [];
      for (var k in this.schema) {
        cols.push(k);
        pholders.push('?');
      }
      sql += '(' + cols.join(', ') + ') VALUES ';
      var allvals = [],
          allpholders = [];
      for (var i = 0; i < items.length; i++) {
        var vals = [];
        var item = items[i];
        for (var k in this.schema) {
          vals.push(item[k]);
          allvals.push(item[k]);
        }
        allpholders.push('(' + pholders.join(', ') + ')');
        //allvals.push(vals);
      }
      sql += allpholders.join(',');
      console.log('   save item batch: ', items.length);
      this.db.run(sql, allvals, function(err) { if (err) console.log('error while inserting:', err); });
      //console.log(sql, allvals);
    }
    parseData(data) {
      return data;
    }
    create(schema) {
      var sql = 'CREATE TABLE IF NOT EXISTS ' + this.table;
      var sqlargs = [];
      for (var k in schema) {
        sqlargs.push(k + ' ' + schema[k]);
      }
      sql += ' (' + sqlargs.join(', ') + ')';

      console.log('run sql: ', sql);
      this.db.run(sql, function(err) { console.log('done sqling: ', err); })
    }
  });
});
