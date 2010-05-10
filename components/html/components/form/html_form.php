<?
class Component_html_form extends Component {
  function init() {
  }

  function controller_form($args, $output="inline") {
    $vars["args"] = $args;
    $vars["obj"] = $args["obj"];
    $vars["elements"] = $args["elements"];
    $vars["formname"] = any($args["formname"], "htmlform");
    $vars["formhandler"] = $args["formhandler"];
    $vars["dispatchname"] = any($args["dispatchname"], $vars["formname"]);


    //print_pre($vars);
    if (empty($args[$vars["formname"]])) {
      $ret = $this->GetTemplate("./form.tpl", $vars);
    } else {
      try {
        $this->conn->save($vars[$formname]);
        $vars["success"] = true;
      } catch(Exception $e) {
        print_pre($e);
        $vars["success"] = false;
      }
      $ret = $this->GetTemplate("./create_status.tpl", $vars);
    }


    return $this->GetTemplate("./form.tpl", $vars);
  }

  function controller_element($args, $output="inline") {
    $vars["args"] = $args;
    $vars["formname"] = $args["formname"];
    $vars["element"] = $args["element"];
    // Determine full name of this form, if not explicitly set
    if (empty($vars["element"]["fullname"])) {
      $vars["element"]["fullname"] = (!empty($vars["formname"]) ? $vars["formname"] . "[" . $vars["element"]["name"] . "]" : $vars["element"]["name"]);
    }
    return $this->GetTemplate("./element.tpl", $vars);
  }
}  

