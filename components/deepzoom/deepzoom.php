<?
require 'Oz/Deepzoom/ImageCreator.php';

class Component_deepzoom extends Component {
  function init() {
  }

  function controller_deepzoom($args, $output="inline") {
    $vars["args"] = $args;
    if (!empty($args["img"])) {
      $dir = "./tmp/deepzoom";
      $vars["imgname"] = $args["img"];
      $vars["xmlpath"] = $dir . "/" . $vars["imgname"] . ".xml";
      if (!empty($args["url"])) {
        $pinfo = pathinfo($args["url"]);
        $vars["fileext"] = $pinfo["extension"];
        $vars["filename"] = $vars["imgname"] . "." . $vars["fileext"];
        $vars["filepath"] = $dir . "/originals/" . $vars["filename"];
        if (!file_exists($vars["filepath"])) {
          $contents = file_get_contents($args["image"]);
          if (!empty($contents)) {
            file_put_contents($vars["filepath"], $contents);
          }
        }

        
        if (!file_exists($vars["xmlpath"])) {
          $converter = new Oz_Deepzoom_ImageCreator(256, 1, $vars["fileext"]);
          $converter->create( realpath($vars["filepath"]), $dir . '/' . $vars["imgname"] . '.xml');
        }
      }
      if (file_exists($vars["xmlpath"])) {
        $img = new SimpleXMLElement(file_get_contents($vars["xmlpath"]));
        if (!empty($img)) {
          $vars["fileext"] = (string)$img["Format"];
          $vars["imgdata"] = array("size" => array((int)$img->Size["Width"], (int)$img->Size["Height"]),
                                   "tilesize" => (int)$img["TileSize"],
                                   "overlap" => (int)$img["Overlap"],
                                   "url" => "/images/components/deepzoom/" . $vars["imgname"] . "_files/{level}/{column}_{row}." . $vars["fileext"]
                                   );
        }
      }
    }

    return $this->GetTemplate("./deepzoom.tpl", $vars);
  }
}  
