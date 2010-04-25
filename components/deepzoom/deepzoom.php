<?
require 'Oz/Deepzoom/ImageCreator.php';

class Component_deepzoom extends Component {
  public $imagedir = "./tmp/deepzoom";

  function init() {
  }

  function controller_deepzoom($args, $output="inline") {
    $vars["args"] = $args;
    $vars["imgname"] = any($args["img"], "webtrendsmap");
    $vars["defaultlevel"] = any($args["defaultlevel"], 0);
    if (!empty($vars["imgname"])) {
      $vars["xmlpath"] = $this->imagedir . "/" . $vars["imgname"] . ".xml";
      if (!empty($args["url"])) {
        $pinfo = pathinfo($args["url"]);
        $vars["fileext"] = $pinfo["extension"];
        $vars["filename"] = $vars["imgname"] . "." . $vars["fileext"];
        $vars["filepath"] = $this->imagedir . "/originals/" . $vars["filename"];
        if (!file_exists($vars["filepath"])) {
          print "Downloading file...";
          flush();
          $contents = file_get_contents($args["url"]);
          if (!empty($contents)) {
            file_put_contents($vars["filepath"], $contents);
          }
          print "done.\n";
        }

        
        if (!file_exists($vars["xmlpath"])) {
          $converter = new Oz_Deepzoom_ImageCreator(256, 1, any($args["outputext"], $vars["fileext"]));
          $converter->create( realpath($vars["filepath"]), $this->imagedir . '/' . $vars["imgname"] . '.xml', true);
        }
      }
      if (file_exists($vars["xmlpath"])) {
        //$defaultdomain = "{random}.tiles.supcrit.net";
        $defaultdomain = "localhost";
        $img = new SimpleXMLElement(file_get_contents($vars["xmlpath"]));
        if (!empty($img)) {
          $vars["fileext"] = (string)$img["Format"];
          $vars["imgdata"] = array("size" => array((int)$img->Size["Width"], (int)$img->Size["Height"]),
                                   "tilesize" => (int)$img["TileSize"],
                                   "overlap" => (int)$img["Overlap"],
                                   "url" => (!empty($img["Url"]) ? (string)$img["Url"] : sprintf("http://%s/images/components/deepzoom/%s_files/{level}/{column}_{row}.%s", $defaultdomain, $vars["imgname"], $vars["fileext"])),
                                   );
        }
      }
    }

    return $this->GetTemplate("./deepzoom.tpl", $vars);
  }
  function controller_imagelist($args, $output="inline") {
    $vars["images"] = array();
    if ($dh = opendir($this->imagedir)) {
      while ($file = readdir($dh)) {
        if (preg_match("/^(.*)\.xml$/", $file, $m)) {
          $vars["images"][] = $m[1];
        }
      }
    }
    sort($vars["images"]);
    return $this->GetTemplate("./imagelist.tpl", $vars);
  }
  function controller_zoomtest($args, $output="inline") {
    return $this->GetTemplate("./zoomtest.tpl", $vars);
  }
  function controller_stitch() {
    $basefile = "./htdocs/world.topo.bathy.200401.3x21600x21600";
    $combined = "./htdocs/big.png";
    $tilesize = array(21600, 21600);
    $finalimg = ImageCreateTrueColor($tilesize[0] * 2, $tilesize[1] * 1);
    
    $tiles["A1"] = ImageCreateFromPng($basefile.".A1.png");

  }
  function controller_article() {
    return $this->GetTemplate("./article.tpl", $vars);
  }
}  
