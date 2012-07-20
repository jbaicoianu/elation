elation.extend("stats", new function() {
  this.graph = function(id, data, cfg) {
    this.id = id;
    this.data = data;
    this.cfg = cfg || {};

    this.init = function() {
      if (typeof this.cfg.precision == 'undefined')
        this.cfg.precision = 2;
      if (typeof this.cfg.tiplabel == 'undefined')
        this.cfg.tiplabel = "req/sec";

      (function(self) {
        self.labelnum = 0;
        self.areaChart = new $jit.AreaChart({  
          injectInto: self.id,
          animate: false,
          showAggregates: false,

          showLabels: function(name, accumLeft, accumRight, node) {
            //console.log(self.labelnum, self.data.values[1].label, name, accumLeft, accumRight);
            if (name == self.data.values[1].label) {
              //console.log('reset it');
              self.labelnum = 0;
            }
            return ((self.labelnum++ % Math.floor(self.data.values.length / 10)) == 0);
          },
          type: 'stacked',
          //type: 'stacked:gradient',
          orientation: 'horizontal',  
          selectOnHover: true,
          offset: 40,
          labelOffset: 0,  
          Label: {  
            type: 'HTML', //can be 'Native' or 'HTML'  
            size: 14,  
            family: 'Arial',  
            color: 'black',
            position: 'absolute',
            style: 'infovis_axis_label'  
          },
          //enable tips  
          Tips: {  
            enable: true,  
            onShow: function(tip, elem, node) {  
            //console.log(self, tip, elem, node);
              //tip.innerHTML = '<div class="infovis_label"><strong>'+ elem.name + "</strong>: " + elem.value.toFixed(self.cfg.precision) + " " + self.cfg.tiplabel + "<br />" + node.data.$label + "</div>";  
              var sum = 0;
              var tiphtml = '<div class="infovis_label tf_utils_clear_after"><strong>' + self.cfg.timeunit + ' of ' + (node.data.$label || node.name) + "</strong><dl>";
              for (var i = 0; i < node.data.value.length; i++) {
                if (node.data.value[i][1] > 0) {
                  sum += node.data.value[i][1];
                  tiphtml += "<dt" + (elem.name == self.data.label[i] ? ' class="tf_state_active"' : '') + ">" + self.data.label[i] + "</dt>";
                  tiphtml += "<dd" + (elem.name == self.data.label[i] ? ' class="tf_state_active"' : '') + ">" + node.data.value[i][1].toFixed(self.cfg.precision) + " " + self.cfg.tiplabel + "</dd>";
                }
              }
              if (self.cfg.tiptotal)
                tiphtml += '<dt class="infovis_label_total">Total</dt><dd class="infovis_label_total">' + sum.toFixed(self.cfg.precision) + " " + self.cfg.tiplabel + "</dd>";
              tiphtml += "</dl></div>";
              tip.innerHTML = tiphtml;
            }  
          },  
        });
      })(this);
      this.areaChart.loadJSON(this.data);
      this.drawlegend();
    }
    this.drawlegend = function() {
      if (!this.legend) {
        this.legend = document.createElement("DIV");
        this.legend.className = "tf_stats_graph_legend";
        document.getElementById(this.id).appendChild(this.legend);
      }
      var legend = this.areaChart.getLegend(); 
      if (legend) {
        var html = '<form id="legend_form"><ul id="legend_list">';
        for (var k in legend) {
          html += '<li>' + /*'<input type="checkbox" checked="checked" value="' + k + '" id="legend_label_' + k + '" />' +*/ ' <label for="legend_label_' + k + '"><span class="legend_colorkey" style="background-color: ' + legend[k] + '"></span>' + k + '</label></li>';
        }
        html += '</ul></form>';
        this.legend.innerHTML = html;

        var inputs = this.legend.getElementsByTagName("INPUT");
        for (var i = 0; i < inputs.length; i++) {
          elation.events.add(inputs[i], "click", this);
        }
      }
    }
    this.handleEvent = function(ev) {
      switch(ev.type) {
        case 'click':
          var active = [];
          for (var k = 0; k < ev.target.form.elements.length; k++) {
            if (ev.target.form.elements[k].checked)
              active.push(ev.target.form.elements[k].value);
          }
          console.log(active);
          (function(areaChart, data, active) { 
            console.log(data);
            areaChart.restore();
            setTimeout(function() {  areaChart.filter.apply(areaChart, active); }, 100);
          })(this.areaChart, this.data, active);
          ev.stopPropagation();
          break;
      }
    }
    this.init();
  }
});
