<?php

class Component_ui extends Component {
  public function init() {
    OrmManager::LoadModel("ui");
  }

  public function controller_ui($args) {
    $vars = array();
    $vars["events"] = array(
/*
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
*/
    );
    $vars["listitems"] = array(
      "item 1",
      "item 2",
      "item 3",
      "item 4",
      "item 5",
      "item 6",
      "item 7",
      "item 8",
      "item 9",
      "item 10",
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
        "content" => "Without saying a word, Queequeg, in his wild sort of way, jumped upon the bulwarks, from thence into the bows of one of the whale-boats hanging to the side; and then bracing his left knee, and poising his harpoon, cried out in some such way as this: \"Cap'ain, you see him small drop tar on water dere? You see him? well, spose him one whale eye, well, den!\" and taking sharp aim at it, he darted the iron right over old Bildad's broad brim, clean across the ship's decks, and struck the glistening tar spot out of sight."
      ),
      array(
        "title" => "Accordion Item #2",
        "content" => "\"Quick, Bildad,\" said Peleg, his partner, who, aghast at the close vicinity of the flying harpoon, had retreated towards the cabin gangway. \"Quick, I say, you Bildad, and get the ship's papers. We must have Hedgehog there, I mean Quohog, in one of our boats. Look ye, Quohog, we'll give ye the ninetieth lay, and that's more than ever was given a harpooneer yet out of Nantucket.\""
      ),
      array(
        "title" => "Accordion Item #3",
        "content" => "So down we went into the cabin, and to my great joy Queequeg was soon enrolled among the same ship's company to which I myself belonged.  When all preliminaries were over and Peleg had got everything ready for signing, he turned to me and said, \"I guess, Quohog there don't know how to write, does he? I say, Quohog, blast ye! dost thou sign thy name or make thy mark?\""
      ),
      array(
        "title" => "Accordion Item #4",
        "content" => "But at this question, Queequeg, who had twice or thrice before taken part in similar ceremonies, looked no ways abashed; but taking the offered pen, copied upon the paper, in the proper place, an exact counterpart of a queer round figure which was tattooed upon his arm; so that through Captain Peleg's obstinate mistake touching his appellative, it stood something like this: Quohog. his X mark."
      ),
      array(
        "title" => "Accordion Item #5",
        "content" => "Meanwhile Captain Bildad sat earnestly and steadfastly eyeing Queequeg, and at last rising solemnly and fumbling in the huge pockets of his broad-skirted drab coat, took out a bundle of tracts, and selecting one entitled \"The Latter Day Coming; or No Time to Lose,\" placed it in Queequeg's hands, and then grasping them and the book with both his, looked earnestly into his eyes, and said, \"Son of darkness, I must do my duty by thee; I am part owner of this ship, and feel concerned for the souls of all its crew; if thou still clingest to thy Pagan ways, which I sadly fear, I beseech thee, remain not for aye a Belial bondsman. Spurn the idol Bell, and the hideous dragon; turn from the wrath to come; mind thine eye, I say; oh! goodness gracious! steer clear of the fiery pit!\""
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
    $vars["listitems"] = (is_array($listitems) && $vars["chunksize"] > 1 ? array_chunk($listitems, $vars["chunksize"], true) : $listitems);
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
  function controller_slider($args) {
    $vars["class"] = any($args["class"], false);
    $vars["id"] = any($args["id"], "ui_window_" . $vars["inputname"]);
    $vars["title"] = any($args["title"], "(untitled)");
    $vars["content"] = any($args["content"], "");
    return $this->GetComponentResponse("./slider.tpl", $vars);
  }
}  
