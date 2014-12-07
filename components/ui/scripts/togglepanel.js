/** 
 * Toggle panel UI component
 * Switches between two visible content areas based on the status of a checkbox
 *
 * @class togglepanel
 * @augments elation.ui.base
 * @memberof elation.ui
 * @todo this class needs updating to use the dependency system, and inherit from ui.panel
 *
 * @param {object} args
 * @param {string} args.formname
 */
elation.component.add("ui.togglepanel", {
  init: function(name, container, args) {
    this.panels = container.getElementsByClassName("ui_toggle_panel");
    this.formname = args.formname;
    for (var i = 0; i < this.panels.length; i++) {
      var inputs = this.panels[i].getElementsByTagName("INPUT");
      for (var j = 0; j < inputs.length; j++) {
        if (inputs[j].name == this.formname) {
          elation.events.add(inputs[j], "click,change", this);
        }
      }
    }
    this.setActivePanel();
  },
  handleEvent: function(ev) {
    this.setActivePanel();
  },
  setActivePanel: function() {
    for (var i = 0; i < this.panels.length; i++) {
      var selected = false;
      var inputs = this.panels[i].getElementsByTagName("INPUT");
      for (var j = 0; j < inputs.length; j++) {
        if (inputs[j].name == this.formname && inputs[j].checked) {
          selected = true;
        }
      }
      if (selected) {
        elation.html.addclass(this.panels[i], "state_selected");
      } else {
        elation.html.removeclass(this.panels[i], "state_selected");
      }
    }
  }
});
