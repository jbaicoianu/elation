<?php

class Component_ui extends Component {
  public function init() {
    OrmManager::LoadModel("ui");
  }

  public function controller_ui($args) {
    $vars = array();
    $vars["events"] = array(
      "button1" => array(
        "click" => "elation.notes.notes('notes1').load('test1');"
      ),
      "button2" => array(
        "click" => "elation.notes.notes('notes1').load('test2');",
        "mouseover" => "this.container.style.background = 'pink';",
        "mouseout" => "this.container.style.background = '';"
      ),
      "list1" => array(
        "init" => "console.log('list1 initialized');"
      ),
      "notes1" => array(
        "dataload" => "elation.ui.list('list1').setItems(ev.data);"
      )
    );
    $vars["listitems"] = array(
    );
    $vars["tabitems"] = array(
      array(
        "label" => "Tab One",
        "name" => "tab_one",
        "tooltip" => "This is Tab One"
      ),
      array(
        "label" => "Tab Two",
        "name" => "tab_two",
        "tooltip" => "This is Tab Two"
      ),
      array(
        "label" => "Tab Three",
        "name" => "tab_three",
        "tooltip" => "This is Tab Three"
      ),
    );
    $vars["treeviewitems"] = array(
      array(
        "label" => "Item One",
        "name" => "item_one",
        "tooltip" => "This is Item One"
      ),
      array(
        "label" => "Item Two",
        "name" => "item_two",
        "tooltip" => "This is Item Two",
        "items" => array(
          array(
            "label" => "Child one",
            "name" => "item_two_child_one"
          ),
          array(
            "label" => "Child two",
            "name" => "item_two_child_two"
          ),
          array(
            "label" => "Child three",
            "name" => "item_two_child_three"
          )
        )
      ),
      array(
        "label" => "Item Three",
        "name" => "item_three",
        "tooltip" => "This is Item Three"
      ),
    );
    $vars["buttonbaritems"] = array(
      array(
        "label" => "Button 1",
      ),
      array(
        "label" => "Button 2",
      ),
      array(
        "label" => "Button 3"
      )
    );
    $vars["accordionitems"] = array(
      array(
        "title" => "Accordion Item #1",
        "content" => "This is the content for accordion item #1\n\nSuper cool shit"
      ),
      array(
        "title" => "Accordion Item #2",
        "content" => "This is the content for accordion item #2"
      ),
      array(
        "title" => "Accordion Item #3",
        "content" => "This is the content for accordion item #2"
      ),
      array(
        "title" => "Accordion Item #4",
        "content" => "This is the content for accordion item #4"
      ),
      array(
        "title" => "Accordion Item #5",
        "content" => "This is the content for accordion item #5"
      ),
    );
    return $this->GetComponentResponse("./ui.tpl", $vars);
  }
  public function controller_button($args) {
    // elation:args tag id classname type label
    // elation:events click mouseover mouseout mousemove mousedown mouseup
    // elation:output html

    $vars = array();
    $vars["tag"] = any($args["tag"], "button");
    $vars["id"] = $args["id"];
    $vars["type"] = any($args["type"], "default");
    $vars["label"] = any($args["label"], ($vars["type"] == "default" ? any($vars["id"], "Submit") : ""));
    $vars["events"] = $args["events"];
    $vars["classname"] = "ui_button ui_button_" . $vars["type"] . " " . $args["classname"];
    return $this->GetComponentResponse("./button.tpl", $vars);
  }
  public function controller_list($args) {
    $vars = array();
    $listitems = any($args["items"], array());
    if ($listitems instanceOf Collection) {
      $listitems = $listitems->toArray();
    }
    $vars["tag"] = 'ul';
    $vars["id"] = $args["id"];
    $vars["events"] = $args["events"];
    $vars["class"] = $args["class"];
    $vars["itemclass"] = $args["itemclass"];
    $vars["chunksize"] = any($args["chunksize"], 1);
    $vars["chunks"] = $args["chunks"];
    if (!empty($vars["chunks"])) {
      $vars["chunksize"] = ceil(count($listitems) / $vars["chunks"]);
    }
    $vars["itemcomponent"] = any($args["itemcomponent"], "ui.listitem");
    $vars["listitems"] = array_chunk($listitems, $vars["chunksize"], true);
    return $this->GetComponentResponse("./list.tpl", $vars);
  }
  public function controller_listitem($args) {
    $vars["item"] = $args["item"];
    $vars["itemname"] = $args["itemname"];
    return $this->GetComponentResponse("./listitem.tpl", $vars);
  }
  function controller_select($args) {
    // elation:args tag id classname label
    // elation:events click mouseover mouseout mousemove mousedown mouseup change
    // elation:output html

    $vars["selectname"] = $args["selectname"];
    $vars["id"] = any($args["id"], "ui_select_" . $vars["selectname"]);
    $vars["class"] = $args["class"];
    $vars["label"] = any($args["label"], false);
    $vars["events"] = $args["events"];
    $vars["items"] = any($args["items"], array());
    if (is_string($vars["items"])) {
      $tmp = explode(";", $vars["items"]);
      $vars["items"] = array_combine($tmp, $tmp);
    }
    $vars["selected"] = $args["selected"];
    if (!empty($vars["selected"]) && !(isset($vars["items"][$vars["selected"]]) || in_array($vars["selected"], $vars["items"]))) {
      $vars["items"][$vars["selected"]] = $vars["selected"];
    }
    if (empty($vars["items"])) {
      $vars["items"][] = "[select items]";
    }
    $vars["autosubmit"] = !empty($args["autosubmit"]);
    $vars["tabindex"] = $args["tabindex"];
    return $this->GetComponentResponse("./select.tpl", $vars);
  }
  function controller_input($args) {
    $vars["inputname"] = $args["inputname"];
    $vars["class"] = any($args["class"], false);
    $vars["label"] = any($args["label"], false);
    $vars["id"] = any($args["id"], "ui_input_" . $vars["inputname"]);
    $vars["value"] = any($args["value"], "");
    $vars["type"] = any($args["type"], "");
    $vars["placeholder"] = any($args["placeholder"], "");
    $vars["disabled"] = any($args["disabled"], false);
    $vars["autofocus"] = any($args["autofocus"], false);
    return $this->GetComponentResponse("./input.tpl", $vars);
  }
  function controller_textarea($args) {
    $vars["inputname"] = $args["inputname"];
    $vars["class"] = any($args["class"], false);
    $vars["label"] = any($args["label"], false);
    $vars["id"] = any($args["id"], "ui_textarea_" . $vars["inputname"]);
    $vars["value"] = any($args["value"], "");
    return $this->GetComponentResponse("./textarea.tpl", $vars);
  }
  function controller_accordion($args) {
    $vars["class"] = any($args["class"], false);
    $vars["id"] = any($args["id"], "ui_accordion_" . $vars["inputname"]);
    $vars["items"] = any($args["items"], "");
    return $this->GetComponentResponse("./accordion.tpl", $vars);
  }
  function controller_window($args) {
    $vars["class"] = any($args["class"], false);
    $vars["id"] = any($args["id"], "ui_window_" . $vars["inputname"]);
    $vars["title"] = any($args["title"], "(untitled)");
    $vars["content"] = any($args["content"], "");
    return $this->GetComponentResponse("./window.tpl", $vars);
  }
}  
