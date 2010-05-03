<?
/*
  Copyright (c) 2005 James Baicoianu

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

class ComponentDispatcher extends Component {
  public $components = array();
  private $dispatchargs = array();

  protected static $instance;
  public static function singleton($args=NULL) { $name = __CLASS__; if (!self::$instance) { self::$instance = new $name($args); } return self::$instance; }

  function ComponentDispatcher(&$parent) {
    $this->Component("", $parent);
    self::$instance =& $this;
  }

  function Dispatch($page=NULL, $pageargs=NULL) {
    if ($page === NULL)
      $page = $_SERVER["SCRIPT_URL"];
    if ($pageargs === NULL)
      $pageargs = &$_REQUEST;
    $args = $this->ParseRequest($page, $pageargs);

    $alternateret = $this->HandleDispatchArgs($args);
    $outputtype = "html";

    $ret["page"] = $page;

    if ($page == "/") {
      $ret["component"] = "index";
      if ($component = $this->Get("index"))
        $ret["content"] = $component->HandlePayload($_REQUEST, $outputtype);
    } else if (preg_match("|^/((?:[^./]+/?)*)(?:\.(.*))?$|", $page, $m)) {
      $componentname = str_replace("/", ".", $m[1]);
      $outputtype = (isset($m[2]) ? $m[2] : "html");

      $ret["component"] = $componentname;
      $ret["type"] = $outputtype;

      if ($component = $this->Get($componentname)) {
        $componentargs = (!empty($this->dispatchargs[$componentname]) ? array_merge_recursive($args, $this->dispatchargs[$componentname]) : $args);
        $ret["content"] = $component->HandlePayload($componentargs, $outputtype);
      }
      
    }

    if ($ret['content'] instanceOf ComponentResponse) {
      $output = $ret['content']->getOutput($outputtype);
      $this->root->response["type"] = $output[0];
      $ret['content'] = $output[1];
    }
    // TODO - handle redirects and postprocessing for different output types here
    return $ret;
  }

  function ParseRequest($page, $args=array()) {
    if (get_magic_quotes_gpc())
      $args = array_map('stripslashes_deep', $args);

    // TODO - this is where any sort of URL argument remapping should happen, and there should be a corresponding function to build those URLs

    return any($args, array());
  }
  function GetDispatchArgs($name, $args=NULL) {
    $ret = $args;
    if (!empty($this->dispatchargs[$name]))
      if ($args === NULL)
        $ret = $this->dispatchargs[$name];
      else {
        $ret = array_merge_recursive($args, $this->dispatchargs[$name]);

        //print_pre("DISPATCH:");
        //print_pre($ret);
      }
    return $ret;
  }
  function HandleDispatchArgs($args) {
    if (!empty($args["_predispatch"])) {
      foreach ($args["_predispatch"] as $k=>$v) {
        if ($dispatchcomponent = $this->Get($v)) {
          $noret = $dispatchcomponent->HandlePayload($args, "dispatch");
        }
      }
    }

    // _dispatchargs are stored and merged in when this component is called later
    if (!empty($args["_dispatchargs"])) {
      foreach ($args["_dispatchargs"] as $k=>$v) {
        // TODO - this currently only works for unique elements (ie, all html.forms on a page).  
        //        We Should check for multidimensionality once placement support is added

        if (!empty($args[$k]))
          $this->dispatchargs[$v][$k] = $args[$k];
      }
    }
  }
}

class ComponentResponse implements ArrayAccess {
  public $data = array();
  private $template;
  
  function __construct($template=NULL) {
    $this->template = $template;
  }
  
  function offsetExists($name) {
    return isset($this->data[$name]);
  }
  function offsetGet($name) {
    return $this->data[$name];
  }
  function offsetSet($name, $value) {
    $this->data[$name] = $value;
  }
  function offsetUnset($name) {
    unset($this->data[$name]);
  }

  function getOutput($type) {
    $ret = array("text/html", NULL);;
    $smarty = SuperSmarty::singleton();
    switch($type) {
    case 'ajax':
      $ret = array("text/xml", $smarty->GenerateXML($this->data));
      break;
    case 'json':
      $ret = array("application/javascript", $smarty->GenerateJavascript($ret));
    case 'js':
      $ret = array("application/javascript", json_encode($this) . "\n");
      break;
    case 'txt':
      $ret = array("text/plain", $smarty->GenerateHTML($smarty->GetTemplate($this->template, NULL, $this->data)));
      break;
    case 'xml':
      $ret = array("application/xml", object_to_xml($this, "response"));
      break;
    default:
      $ret = array("text/html", $smarty->GenerateHTML($smarty->GetTemplate($this->template, NULL, $this->data)));
    }
    return $ret;
  }
}
