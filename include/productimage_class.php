<?
class TFProductImage {
  protected $realurl;
  public $urls = array();

  private static $cfg = null;
  private static $cache = array();

  function __construct($realurl) {
    $this->SetRealURL($realurl);
  }

  function SetRealURL($realurl) {
    $this->realurl = $realurl;
  }

  function GenerateURL($dimensions, $args=NULL) {
    //Profiler::StartTimer("TFProductImage::GenerateURL()");
    $urlhash = md5($this->realurl);
    $dimensions = $this->ParseDimensions($dimensions);
    $dim = reset($dimensions); // Get first item and reset array pointer
    $dimensionstr = $dim[0] . "x" . $dim[1];
    if (!empty(self::$cache[$urlhash]) && !empty(self::$cache[$urlhash][$dimensionstr])) {
      $ret = self::$cache[$urlhash][$dimensionstr];
      if(!is_array($this->urls))
        $this->urls = array();
       $this->urls = array_merge($this->urls,self::$cache[$urlhash]);
    } else {
      $cfg = ConfigManager::singleton();
      $sitecfg = $cfg->current["dependencies"]["image"];
      $servercfg = $cfg->servers["image"];
      
      $host = any($args["host"], $sitecfg["host"], $servercfg["host"]);
      $skipcache = any($args["skipcache"], $sitecfg["skipcache"], $servercfg["skipcache"], false);
      $ssl = any($args["ssl"], $sitecfg["ssl"], $servercfg["ssl"], false);
      $direct = any($args["direct"], $sitecfg["direct"], $servercfg["direct"], false);
      $matte = any($args["matte"], $sitecfg["matte"], $servercfg["matte"], true);
      $resize = any($args["resize"], $sitecfg["resize"], $servercfg["resize"], 1.0);
      
      $siteid = any($args["siteid"], 0);
      $category = any($args["category"], "miscellaneous");
      foreach ($dimensions as $dimstr=>$dim) {
        $img = $this->FixOriginURL($this->realurl, $dim);
        if ($direct) {
          $this->urls[$dimstr] = $img;
        } else {
          $imgURL = "http" . ($ssl ? "s" : "") . "://" . $host . "/images/" . $this->encodeImageUrl($img, $dim[0], $dim[1], $siteid, $category);
          $imgURLExtras = array();
          
          if (!empty($skipcache))
            $imgURLExtras[] = "bypass=1";
          if (isset($matte))
            $imgURLExtras[] = "m=" . (any($dim[2]["m"], $matte) ? 1 : 0);
          if (!empty($resize))
            $imgURLExtras[] = "g=" . any($dim[2]["g"], $resize);
          $imgArgs = implode("&", $imgURLExtras);
          $fullURL = $imgURL . (!empty($imgArgs) ? "?" . $imgArgs : "");
          $this->urls[$dimstr] = $fullURL;
        }
      }
      $ret = $this->urls[$dimensionstr];
      self::$cache[$urlhash][$dimensionstr] = $ret;
    }
    //Profiler::StopTimer("TFProductImage::GenerateURL()");
    return $ret;
  }
  function ParseDimensions($dimensions) {
    // Parse all forms of dimension argument:
    // - single string (eg, "150x150" or "100x100,150x150,300x300")
    // - single-dimensional array (eg, [150, 150])
    // - multi-dimensional array (eg, [[100, 100], [150, 150], [300, 300]])

    $ret = array();
    if (is_string($dimensions)) { // string
      $dimensionstrs = explode(",", $dimensions);
      foreach ($dimensionstrs as $dim) {
        $pdim = $this->ParseDimension($dim);
        $ret[$pdim[0] . "x" . $pdim[1]] = $pdim;
      }
    } else if (is_array($dimensions)) {
      if (is_array($dimensions[0])) { // multi-dimensional array
        foreach ($dimensions as $dim) {
          if (count($dim) == 2) {
            $ret[$dim[0] . "x" . $dim[1]] = $dim;
          }
        }
      } else { // single-dimensional array
        if (count($dimensions) == 2) {
          $ret[$dimensions[0] . "x" . $dimensions[1]] = $dimensions;
        }
      }
    }
    return $ret;
  }
  function ParseDimension($dimension) {
    // Parse a single dimension string
    
    if (preg_match("/^(\d+)x(\d+)(?:\:(.*?))?$/", $dimension, $m)) {
      $args = array();
      if (!empty($m[3])) {
        $tmp = explode(";", $m[3]);
        foreach ($tmp as $t) {
          list($k,$v) = explode("=", $t);
          $args[$k] = any($v,1);
        }
      }
      $ret = array($m[1], $m[2]);
      if (!empty($args))
        $ret[] = $args;
    }
    return $ret;
  }
  function FixOriginURL($img, $dimensions) {
    // Hacks to coax larger images out of known-manipulable imageservers

    if (stripos($img, "shopping.com/images/di/") !== false) {               // Shopping.com
      $img = str_replace("100x100", $dimensions[0] . "x" . $dimensions[1], $img);
    } else if (stripos($img, "http://image.shopzilla.com/resize") === 0) {  // ShopZilla.com
      if (preg_match("/[&?]sq=/", $url) !== false)
        $img = preg_replace("/([&?])sq=\d+/", "\\1sq=" . $dimensions[0], $img);
      else
        $img .= (strpos($img, "?") ? "&" : "?") . "sq=" . $dimensions[0];
    }
    
    /*
      if (preg_match("/^file:(.*?)$/", $this->product->image, $m)) {
      // Forward CNET image requests to i26 (FIXME - server shouldn't be hardcoded)
        $img = "http://i26.fatlens.com/images/$m[1]";
      }
    */
      
    return $img;
  }

  function encodeImageUrl($url, $width, $height, $siteid, $category) {
    //Profiler::StartTimer("TFProductImage::encodeImageUrl()");
    $prefix = pack ("SSLa*xa*x", $width, $height, $siteid,
                    $category, $url);
    $str = $prefix . "lekrots";
    $crc = crc32($str);

    $str = pack("La*x", $crc, $prefix);
    $comp = gzdeflate($str);
    
    $final = pack("S", strlen($str)) . $comp;
    $b64 = base64_encode($final);
    $ret = strtr($b64, "+/=", "-_*");
    //Profiler::StopTimer("TFProductImage::encodeImageUrl()");
    return $ret;
  }
}

