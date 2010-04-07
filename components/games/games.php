<?

class Component_games extends Component {
  function init() {
  }

  function controller_games($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./games.tpl", $vars);
  }
  function controller_airhockey($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./airhockey.tpl", $vars);
  }
  function controller_lookup($args, $output="inline") {
    //$vars["args"] = $args;
    $response = new ComponentResponse($this->ExpandTemplatePath("./lookup.tpl"));
    if (!empty($args["word"])) {
      $response["word"] = $args["word"];
      $definitions = UrbanDictionary::lookup($args["word"]);
      $response["exists"] = !empty($definitions);
      $response["definitions"] = $definitions;
    }
    return $response;
  }
}  

class UrbanDictionary {
  static $url = "http://www.urbandictionary.com/define.php";
  static $varname = "term";

  static function lookup($word) {
    $fullurl = sprintf("%s?%s=%s", self::$url, self::$varname, urlencode($word));
    $contents = file_get_contents($fullurl);
    $definitions = array();
    if (preg_match_all('/<div class=["\']definition["\']>\s*(.*?)\s*<\/div>/i', $contents, $m)) {
      foreach ($m[1] as $def) {
        $definitions[] = str_replace("<br/>", "\n", $def);
      }
    }
    return $definitions;
  }
}