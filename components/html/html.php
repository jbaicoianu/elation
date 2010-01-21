<?
class Component_html extends Component {
  function init() {
  }

  function controller_html($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./html.tpl", $vars);
  }
  function controller_imagescale($args, $output="inline") {
    $vars["args"] = $args;
    return $this->GetTemplate("./imagescale.tpl", $vars);
  }
  function controller_multizoom($args, $output="inline") {
    $vars["args"] = $args;
    $vars["imgs"] = array(
      "ridgerun" => array(
        'size' => array(3627, 2424),
        'url' => 'http://gasi.ch/examples/2009/04/08/inline-multiscale-image-replacement/nytimes/ridge-run/image_files/{level}/{column}_{row}.jpg',
        'tilesize' => 256,
        'overlap' => 1
      ),
      "webtrends" => array(
        'size' => array(6740, 4768),
        'url' => '/images/components/html/multizoom/webtrendsmap/{level}/{column}_{row}.png',
        'tilesize' => 256,
        'overlap' => 1
      ),
      "flickr" => array(
        'size' => array(3456, 2304),
        'url' => 'http://gasi.ch/examples/2009/04/08/inline-multiscale-image-replacement/flickr/flickr/image_files/{level}/{column}_{row}.jpg',
        'tilesize' => 256,
        'overlap' => 1
      ),
      "openstreetmap" => array(
        'size' => array(67108864, 67108864),
        'url' => 'http://tile.openstreetmap.org/{level}/{column}/{row}.png',
        'tilesize' => 256,
        'overlap' => 0
      ),
      "thing" => array(
        'size' => array(83377, 4454),
        'url' => 'http://www.deuterror.org/dtr_img/TileGroup{collection}/{level}-{column}-{row}.jpg',
        'tilesize' => 256,
        'overlap' => 1
      ),
      "homemade" => array(
        'size' => array(2048, 1536),
        'url' => '/images/components/deepzoom/hlegius_files/{level}/{column}_{row}.jpg',
        'tilesize' => 254,
        'overlap' => 1
      ),
    );

    $vars["imgname"] = any($args["img"], "webtrends");
    $vars["img"] = any($args["imgdata"], $vars["imgs"][$vars["imgname"]]);
    return $this->GetTemplate("./multizoom.tpl", $vars);
  }
}  
