<?

class Component_snapshot extends Component {
  function init() {
  }

  function controller_snapshot($args, $output="inline") {
    $vars["args"] = $args;
    $res = array("width" => 1024, 
                 "height" => 768,
                 "thumbwidth" => 160,
                 "thumbheight" => 120);
    $webkit2png = "/home/bai/src/python-webkit2png/webkit2png.py";
    $convert = "/usr/bin/convert";
    $basedir = "/home/bai/elation/tmp/snapshots";

    if (!empty($args["url"])) {
      $url = $args["url"];
      if (preg_match("/^https?:\/\/([^\/]+)\//i", $url, $m)) {
        $domain = $m[1];
      } else {
        $domain = "unknown";
      }
      $sitedir = $basedir . "/" . $domain;

      if (!file_exists($sitedir)) {
        mkdir($sitedir, 0777, true);
      }
      $imgid = md5($url);
      $wait = 1;
      $timeout = 30;
      $aspectratio = "expand";
      if (preg_match("/\.(png|jpg|gif|bmp)(?:\?.*)?$/i", $url)) {
        // Optimized fetching for images
        $imgfile = sprintf("%s/%s.png", $sitedir, $imgid);
        $cmd = sprintf("wget %s -O %s", escapeshellarg($url), escapeshellarg($imgfile));
        shell_exec($cmd);
      } else {
        $imgfile = sprintf("%s/%s_%dx%d.png", $sitedir, $imgid, $res["width"], $res["height"]);
        if (!file_exists($imgfile)) {
          $cmd = sprintf("$webkit2png --log=/dev/null -F javascript -F plugins -W -x %d %d -g %d %d %s -o %s -w %d -t %d --aspect-ratio=%s", $res["width"], $res["height"], $res["width"], $res["height"], escapeshellarg($url), escapeshellarg($imgfile), $wait, $timeout, $aspectratio);
          shell_exec($cmd);
        }
      }
      $thumbfile = sprintf("%s/%s_%dx%d_thumb.png", $sitedir, $imgid, $res["width"], $res["height"]);
      if (!file_exists($thumbfile)) {
        $cmd2 = sprintf("$convert %s -resize %dx%d -background white -gravity center -extent %dx%d %s", escapeshellarg($imgfile), $res["thumbwidth"], $res["thumbheight"], $res["thumbwidth"], $res["thumbheight"], escapeshellarg($thumbfile));
        shell_exec($cmd2);
      }
      if (!file_exists($thumbfile))
        $thumbfile = $basedir . "/notfound.png";
      header("Content-type: image/png");
      $expires = 60*60*24*14;
      header("Pragma: public");
      header("Cache-Control: maxage=".$expires);
      header('Expires: ' . gmdate('D, d M Y H:i:s', time()+$expires) . ' GMT');

      print file_get_contents($thumbfile);
    }
    return "";
  }
}  
