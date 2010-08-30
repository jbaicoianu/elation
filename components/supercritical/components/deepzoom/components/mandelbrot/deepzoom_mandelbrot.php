<?
include_once("lib/profiler.php");

class Component_deepzoom_mandelbrot extends Component {
    public $maxiterations = 200; // people are assholes
    public $maxsize = array(1000000, 1000000);
    public $framemin = array(-1.5, -1);
    public $framemax = array(0.5, 1);
    public $tilesize = 256;
    public $iterations = 200;

  function init() {
  }

  function maxlevel($size) {
    return ceil(log(max($size[0], $size[1])) / log(2));
  }
  function levelinfo($level, $options) {
    $ret["width"] = ceil($options["maxsize"][0] / pow(2, $level));
    $ret["height"] = ceil($options["maxsize"][1] / pow(2, $level));
    $ret["columns"] = ceil($ret["width"] / $options["tilesize"]);
    $ret["rows"] = ceil($ret["height"] / $options["tilesize"]);
    $ret["tilesize"] = array(min($options["tilesize"], $ret["width"]), min($options["tilesize"], $ret["height"]));

      
    return $ret;
  }
  function frame($row, $column, $levelinfo, $options) {
    $scaledtilesize = array(
                            bcdiv(bcsub($options["framemax"][0], $options["framemin"][0]), $levelinfo["columns"]),
                            bcdiv(bcsub($options["framemax"][1], $options["framemin"][1]), $levelinfo["rows"])
    );
    $ret["min"] = array(
      bcadd(bcmul($scaledtilesize[0], $column), $options["framemin"][0]),
      bcadd(bcmul($scaledtilesize[1], $row), $options["framemin"][1])
    );
    $ret["max"] = array(
      bcadd($ret["min"][0], $scaledtilesize[0]),
      bcadd($ret["min"][1], $scaledtilesize[1])
    );
    
    return $ret;
  }

  function options($args) {
    $ret["maxsize"] = (!empty($args["maxsize"]) ? explode("x", $args["maxsize"]) : $this->maxsize);
    $ret["framemin"] = (!empty($args["framemin"]) ? explode(",", $args["framemin"]) : $this->framemin);
    $ret["framemax"] = (!empty($args["framemax"]) ? explode(",", $args["framemax"]) : $this->framemax);
    $ret["tilesize"] = any($args["tilesize"], $this->tilesize);
    $ret["iterations"] = any($args["iterations"], $this->iterations);
    if ($ret["iterations"] > $this->maxiterations) 
      $ret["iterations"] = $this->maxiterations;
    return $ret;
  }
  function cacheinfo($level, $column, $row, $options) {
    $ret["dir"] = "./tmp/mandelbrot/{$options['iterations']}_{$options['tilesize']}/{$level}";
    $ret["file"] = "{$column}_{$row}.png";
    $ret["path"] = $ret["dir"] . "/" . $ret["file"];

    if (!file_exists($ret["dir"]))
      mkdir($ret["dir"], 0777, true);

    return $ret;
  }

  function controller_seed($args) {
    $options = $this->options($args);
    $maxlevel = $this->maxlevel($options["maxsize"]);
    $level = $args["level"];
    $maxlevel = $this->maxlevel($options["maxsize"]);
    $levelinfo = $this->levelinfo($maxlevel - $level, $options);
    print "Generating level $level (" . ($levelinfo["rows"] * $levelinfo["columns"]) . " tiles): ";
    flush();
    for ($i = 0; $i < $levelinfo["rows"]; $i++) {
      for ($j = 0; $j < $levelinfo["columns"]; $j++) {
        $cache = $this->cacheinfo($level, $j, $i, $options);
        $frame = $this->frame($i, $j, $levelinfo, $options);
        if (!file_exists($cache["path"])) {
          $this->generate_mandelbrot($cache["path"], $levelinfo["tilesize"], $frame["min"], $frame["max"], $options["iterations"]);
          print ".";
        } else {
          print "o";
        }
        flush();
      }
    }
    print " done\n";
  }
  function controller_mandelbrot($args) {
    bcscale(100);
    $options = $this->options($args);

    $level = any($args["level"], 8);
    $row = any($args["row"], 0);
    $column = any($args["column"], 0);
    
    $cache = $this->cacheinfo($level, $column, $row, $options);

    if (!file_exists($cache["path"])) {
      $maxlevel = $this->maxlevel($options["maxsize"]);
      $levelinfo = $this->levelinfo($maxlevel - $level, $options);
      $frame = $this->frame($row, $column, $levelinfo, $options);
      
      //$this->generate_mandelbrot($cache["path"], $levelinfo["tilesize"], $frame["min"], $frame["max"], $options["iterations"]);
      $this->generate_mandelbrot_c($cache["path"], $levelinfo["tilesize"], $options["framemin"], $options["framemax"], $options["iterations"], $level, $row, $column);
      /*
       print_pre($level);
       print_pre("Full size: " . $maxsize[0] . " x " . $maxsize[1]);
       print_pre("Scaled size: $lwidth x $lheight");
       print_pre("$numcolumns x $numrows");
       print_pre($scaledtilesize);
       
       print_pre($min);
       print_pre($max);
       return;
      */
    }

    header("Content-type: image/png");
    print file_get_contents($cache["path"]);
  }
  function generate_mandelbrot($fname, $size, $min, $max, $iterations) {
    $img = ImageCreate($size[0], $size[1]);

    $colors = array(); 
    $colors['inside'] = imagecolorallocate($img, 0, 0, 0); 
    
    Profiler::startTimer("palette");
    $palette = imagecreatefrompng("palette.png"); 
    for ($i=0; $i < imagesx($palette); $i++) { 
      $rgb = imagecolorat($palette, $i, 0); 
      $colors[$i] = imagecolorallocate($img, ($rgb >> 16) & 0xFF, ($rgb >> 8) & 0xFF, $rgb & 0xFF); 
    } 
    Profiler::stopTimer("palette");


    Profiler::startTimer("mainloop");
    for ($i = 0; $i < $size[0]; $i++) {
      for ($j = 0; $j < $size[1]; $j++) {
        Profiler::startTimer("math");
        $x = $min[0] + $i * (($max[0] - $min[0]) / ($size[0] - 1));
        $y = $min[1] + $j * (($max[1] - $min[1]) / ($size[1] - 1));
        
        $iteration = 0;
        $z0 = 0;
        $z1 = 0;
        $x2 = $y2 = 0;

        while ($iteration <= $iterations && $x2 + $y2 <= 4) {
          $z1 = (2 * $z0 * $z1) + $y;
          $z0 = $x2 - $y2 + $x;

          $x2 = $z0 * $z0;
          $y2 = $z1 * $z1;
          $iteration++;
        }
        Profiler::stopTimer("math");

        Profiler::startTimer("setpixel");
        $color = $colors[($iteration == $iterations ? 'inside' : $iteration)];
        ImageSetPixel($img, $i, $j, $color);
        Profiler::stopTimer("setpixel");
      }
    }
    Profiler::stopTimer("mainloop");
    Profiler::startTimer("saveimage");
    ImagePNG($img, $fname); 
    Profiler::stopTimer("saveimage");

    //print Profiler::display();
  }
  function generate_mandelbrot_c($fname, $size, $min, $max, $iterations, $level, $row, $col) {
    $cmd = "./mandelbrot " .
      escapeshellarg($fname) . " " . 
      escapeshellarg($size[0]) . " " . 
      escapeshellarg($size[1]) . " " . 
      escapeshellarg($min[0]) . " " . 
      escapeshellarg($min[1]) . " " . 
      escapeshellarg($max[0]) . " " . 
      escapeshellarg($max[1]) . " " . 
      escapeshellarg($iterations) . " " . 
      escapeshellarg($level) . " " . 
      escapeshellarg($row) . " " . 
      escapeshellarg($col);

    $output = shell_exec($cmd);
    /*
    print_pre($cmd);
    print_pre($output);
    */
  }
}  
