elation.component.add("stats.queries", {
  init: function(name, container, args) {
console.log(args);
    this.graph = new $jit.Sunburst({
        //id container for the visualization
        injectInto: container,
        //Distance between levels
        levelDistance: 75,
        //Change node and edge styles such as
        //color, width and dimensions.
        Node: {
          overridable: true,
          type: 'gradient-multipie',
          lineWidth: 5
        },
        //Select canvas labels
        //'HTML', 'SVG' and 'Native' are possible options
        Label: {
          type: 'Native',
          size: 14,
          color: "#ffffff",
        },
        //Change styles when hovering and clicking nodes
        NodeStyles: {
          enable: true,
          type: 'Native',
          stylesClick: {
            'color': '#33dddd'
          },
          stylesHover: {
            'color': '#dddd33'
          },
          duration: 0
        },
        //Add tooltips
        Tips: {
          enable: true,
          onShow: function(tip, node) {
            var html = "<div class=\"tip-title\">" + node.id + "</div>"; 
            var data = node.data;
            if("count" in data) {
              html += "<b>Count:</b> " + data.count + " (" + data.cached + " cached)";
            }
            if("time" in data) {
              html += "<br /><b>Cumulative Time:</b> " + data.time.toFixed(3) + " s";
              html += "<br /><b>Time-per-query:</b> " + (data.time / data.count).toFixed(3) + " s";
            }
            tip.innerHTML = html;
          }
        },
        //implement event handlers
        Events: {
          enable: true,
          onClick: function(node) {
            if(!node) return;
            //elation.stats.queries('queries').graph.root = node.id;
            //elation.stats.queries('queries').graph.refresh();
            elation.stats.queries('queries').setRoot(node.id);
          }
        }
    });
    if (args) {
      this.args = args;
      this.graph.loadJSON(args);
    }
    this.graph.refresh();
  },
  setRoot: function(id) {
    var node = this.graph.graph.getNode(id);
    console.log(id, this.graph);
    /*
    this.graph.graph.removeNode(this.graph.root);
    this.graph.graph.addNode(node);
    this.graph.root = id;
    console.log(this.graph.graph);
    console.log(this.args, elation.utils.arrayget(this.args, id));
    */
    var ptr = this.args;
    var keyparts = id.split('.');
    keyparts.shift();
    while (ptr && keyparts.length > 0) {
      if (ptr['children'])
        ptr = ptr['children'][keyparts.shift()];
    }
    if (ptr) {
      this.graph.loadJSON(ptr);
      this.graph.refresh();
    }
  }
  
});
