elation.require(['utils.worker'], function() {
  elation.define('utils.workerpool', {
    src: false,
    component: false,
    scriptsuffix: null,
    num: 4,
    pool: false,
    queue: false,

    _construct: function(args) {
      elation.class.call(this, args);
      this.pool = [];

      this.clearQueue();
      //this.createWorkers();
    },
    clearQueue: function() {
      this.queue = [];
      this.inprogress = 0;
      this.promises = {};
    },
    createWorkers: function() {
      if (elation.env.isWorker || typeof Worker == 'undefined') return;
      if (this.src) {
        for (var i = 0; i < this.num; i++) {
          var worker = new Worker(this.src);
          elation.events.add(worker, 'message', elation.bind(this, this.workerMessage));
          this.pool.push(worker);
          this.update();
        }
      } else if (this.component) {
        for (var i = 0; i < this.num; i++) {
          var worker = new elation.worker.thread(this.component, this.scriptsuffix);
          elation.events.add(worker, 'message', elation.bind(this, this.workerMessage));
          this.pool.push(worker);
          this.update();
        }
      }
    },
    sendMessage: function(type, msg) {
      var jobid = this.getJobID();
      var encmsg = {type: type, data: msg};
      this.pool.forEach(function(worker) {
        worker.postMessage(encmsg);
      });
    },
    addJob: function(jobdata) {
      var promise = new Promise(elation.bind(this, function(resolve, reject) {
        var jobid = this.getJobID();
        this.promises[jobid] = {resolve: resolve, reject: reject};
        this.queue.push({id: jobid, data: jobdata});
        this.update();
      }));
      return promise;
    },
    update: function() {
      if (this.queue.length > 0 && this.isWorkerAvailable()) {
        // If we have pending items and an available worker, let's go
        var worker = this.getWorker();
        if (worker) {
          var job = this.queue.shift();
          worker.postMessage({type: 'job', data: job});
        }
      }
    },
    isWorkerAvailable: function() {
      return (this.pool.length > 0 || this.pool.length < this.num);
    },
    getWorker: function() {
      if (this.pool.length > 0) {
        this.inprogress++;
        return this.pool.shift();
      } else if (this.pool.length + this.inprogress < this.num) {
        this.inprogress++;
        return this.createWorker();
      }
    },
    createWorker: function() {
      if (elation.env.isWorker || typeof Worker == 'undefined') return;
      if (this.src) {
        var worker = new Worker(this.src);
        elation.events.add(worker, 'message', elation.bind(this, this.workerMessage));
        return worker;
      } else if (this.component) {
        var worker = new elation.worker.thread(this.component, this.scriptsuffix);
        elation.events.add(worker, 'message', elation.bind(this, this.workerMessage));
        return worker;
      }
      return null;
    },
    getJobID: function() {
      return Math.round(Math.random() * 1e10);
    },
    workerMessage: function(ev) {
      var id = ev.data.id,
          data = ev.data.data,
          worker = ev.target;
      if (ev.data.message == 'finished') {
        if (this.promises[id]) {
          this.promises[id].resolve(data);
          delete this.promises[id];
        }
        this.releaseWorker(worker);
      } else if (ev.data.message == 'error') {
        if (this.promises[id]) {
          this.promises[id].reject(data);
          delete this.promises[id];
        }
        this.releaseWorker(worker);
      }
    },
    releaseWorker: function(worker) {
        this.inprogress--;
        this.pool.push(worker);
        this.update();
    }
  });
});
