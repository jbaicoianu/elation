<?php

class Component_elation_notes extends Component {
  function init() {
  }

  function controller_notes($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetComponentResponse("./notes.tpl", $vars);
  }
}  
