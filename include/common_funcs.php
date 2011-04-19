<?
/**
 * Function: print_pre
 * Args    : array, buffer, tag
 *
 * Using patent pending PRE technology print_pre delivers a powerful visual and user experience.  
 * Fast and reliable, print_pre out shines print_r out of the box, but with minimal configuration 
 * will change how you look at arrays forever.
 *
 * @return string
 */
function print_pre($obj, $buffer=false, $tag="pre") {
  $buf = "<$tag>print_pre: " . print_r($obj, true) . "</$tag>";
  if (!$buffer)
    print $buf;
  return $buf;
}
function print_ln($obj, $buffer=false, $quiet=false) {
  $buf = (!$quiet ? "print_ln: " : "") . str_replace("\n", "  ", print_r($obj, true));
  if (!$buffer)
    print $buf;
  else
    return $buf;
}


/**
 * Function: any
 * Args    : ...
 * 
 * Returns first non-null value from list of args (or last one if none are true)
 *
 * @return mixed
 */
function any() {
  $args = func_get_args();
  foreach ($args as $arg) {
    if ( (($last = $arg) !== NULL) && ($arg !== "") ) {
      return $arg;
    }
  }
  return $last;
}

function all() {
  $ret = array();
  foreach (func_get_args() as $arg) {
    if ($arg !== NULL) {
      if (is_array($arg))
        $ret = array_merge_recursive($ret, $arg);
      else 
        $ret[] = $arg;
    }
  }
  return $ret;
}

function stripslashes_deep($value)
{
  $value = is_array($value) ?
    array_map('stripslashes_deep', $value) :
    stripslashes($value);

  return $value;
}

function nicetime($date)
{
  if(empty($date)) {
    return "never";
  }
   
  $periods         = array("second", "minute", "hour", "day", "week", "month", "year", "decade");
  $lengths         = array("60","60","24","7","4.35","12","10");
   
  $now             = time();
  if ($date instanceOf DateTime) {
    $unix_date = $date->format("U");
  } else {
    $unix_date         = strtotime($date);
  }
   
  // check validity of date
  if(empty($unix_date)) {   
    return "Bad date";
  }

  // is it future date or past date
  if($now >= $unix_date) {   
    $difference     = $now - $unix_date;
    $tense         = "ago";
       
  } else {
    $difference     = $unix_date - $now;
    $tense         = "from now";
  }
   
  for($j = 0; $difference >= $lengths[$j] && $j < count($lengths)-1; $j++) {
    $difference /= $lengths[$j];
  }
   
  $difference = round($difference);
   
  if($difference != 1) {
    $periods[$j].= "s";
  }
   
  return "$difference $periods[$j] {$tense}";
}

function json_indent($json, $maxdepth=999) {
    $result    = '';
    $pos       = 0;
    $strLen    = strlen($json);
    $indentStr = '  ';
    $newLine   = "\n";
    $inquotes  = false;

    for($i = 0; $i <= $strLen; $i++) {

      // Grab the next character in the string
      $char = $json[$i]; //substr($json, $i, 1);

      // If this character is the end of an element,
      // output a new line and indent the next line
      if(($char == '}' || $char == ']') && !$inquotes) {
        if ($pos-- < $maxdepth) {
          $result .= $newLine;
          for ($j=0; $j<$pos; $j++) {
            $result .= $indentStr;
          }
        }
      }

      // Add the character to the result string
      $result .= $char;

      // We don't want to mess with formatting if we're inside a string
      if ($char == '"' && $json[$i-1] != '\\')
        $inquotes = !$inquotes;

      // If the last character was the beginning of an element,
      // output a new line and indent the next line
      if (($char == ',' || $char == '{' || $char == '[') && !$inquotes) {
        if ($char == '{' || $char == '[') {
          $pos ++;
        }
        if ($pos < $maxdepth) {
          $result .= $newLine;
          for ($j = 0; $j < $pos; $j++) {
            $result .= $indentStr;
          }
        }
      }
    }

    return $result;
}

function array_diff_assoc_recursive($array1, $array2) {
  if (is_array($array1)) {
    foreach($array1 as $key => $value) {
      if(is_array($value)) {
        if(!isset($array2[$key])) {
          $difference[$key] = $value;
        } elseif(!is_array($array2[$key])) {
          $difference[$key] = $value;
        } else {
          $new_diff = array_diff_assoc_recursive($value, $array2[$key]);
          if($new_diff !== FALSE) {
            $difference[$key] = $new_diff;
          }
        }
      } elseif(!isset($array2[$key]) || $array2[$key] !== $value) {
        $difference[$key] = $value;
      }
    }
  }
  return !isset($difference) ? FALSE : $difference;
}

// trimbo
function object_to_array($obj, $keymap=NULL) {
  $arr = array();
  if (get_class($obj) == "SimpleXMLElement") {
    foreach ($obj->attributes() as $k=>$v) {
      $arr[$k] = (string) $v;
    }
    foreach ($obj->children() as $k=>$v) {
      $arr["_children"][$k] = (string) $v;
    }
    $content = (string) $obj;
    if (!empty($content))
      $arr["_content"] = $content;
  } else if (is_object($obj) || is_array($obj)) {
    foreach ($obj as $k=>$v) {
      if (is_object($v) || is_array($v)) {
        $arr[$k] = object_to_array($v);
      } else {
        $arr[$k] = (string) $v;
      }
    }
  }
  return $arr;
}
/* new
function object_to_array($obj, $keyprefix="") {
  $arr = array();

  if (get_class($obj) == "SimpleXMLElement") {
    if($obj->attributes()) {
      foreach ($obj->attributes() as $k=>$v) {
        $arr[$keyprefix.$k] = (string) $v;
      }
    }

    if($obj->children()) {
      foreach ($obj->children() as $k=>$v) {
        $arr["_children"][$keyprefix.$k] = (string) $v;
      }
    }

    $content = (string) $obj;
    if (!empty($content)) {
      $arr["_content"] = $content;
    }
  }
  else if (is_object($obj) || is_array($obj)) {
    foreach ($obj as $k=>$v) {
      if (is_object($v) || is_array($v)) {
        $arr[$keyprefix.$k] = object_to_array($v);
      } else {
        $arr[$keyprefix.$k] = (string) $v;
      }
    }
  }
  
  return $arr;
}
*/
function object_set(&$obj, $key, $value, $delim=".") {
  $ret = true;

  $keyparts = explode($delim, $key);

  $ptr =& $obj;
  while (($keypart = array_shift($keyparts)) !== NULL) {
    if ($keypart !== "") {
      if (is_object($ptr)) {
        if (!isset($ptr->{$keypart})) {
          $ptr->{$keypart} = array();
          $ptr =& $ptr->{$keypart};
        } else {
          $ptr =& $ptr->{$keypart};
        }
      } else if (is_array($ptr) || $ptr === NULL) {
        if (!isset($ptr[$keypart])) {
          $ptr[$keypart] = array();
          $ptr =& $ptr[$keypart];
        } else { 
          $ptr =& $ptr[$keypart];
        }
      } else {
        $ret = false;
        break;
      }
    }
  }

  if ($ret) {
    $ptr = $value;
  }

  //Profiler::StopTimer("array_set");
  return $ret;
}
function array_set(&$arr, $key, $value, $delim=".") {
  //Profiler::StartTimer("array_set");
  $ret = true;

  $keyparts = explode($delim, $key);

  $ptr =& $arr;
  while (($keypart = array_shift($keyparts)) !== NULL) {
    if ($keypart !== "") {
      if (!isset($ptr[$keypart])) {
        $ptr[$keypart] = array();
        $ptr =& $ptr[$keypart];
      } else { 
        if (is_array($ptr)) {
          $ptr =& $ptr[$keypart];
        } else {
          $ret = false;
          break;
        }
      }
    }
  }

  if ($ret) {
    if (is_array($ptr) && is_array($value)) // If they're both arrays, merge them
      $ptr = array_merge($ptr, $value);
    else
      $ptr = $value;
  }

  //Profiler::StopTimer("array_set");
  return $ret;
}
function array_set_multi(&$arr, $values, $keys=NULL) {
  Profiler::StartTimer("array_set_multi");
  if ($keys === NULL) {
    $tmp = array_keys($values); 
    $keys = array_combine($tmp, $tmp);
  }
  asort($keys, SORT_STRING);
  //print_pre($keys);
  
  $subelements = array();
  
  foreach ($keys as $key=>$fullkey) {
    list($topkey, $subkey) = explode(".", $key, 2);

    if (empty($subkey)) { // If we're already at a leaf, just set it
      //print "set $topkey<br />";
      $arr[$topkey] = $values[$fullkey];
    } else {
      if (isset($arr[$topkey]) && !is_array($arr[$topkey])) {
        //print "skip $topkey<br />";
        Logger::Error("Failed to set $fullkey: already a node?");
        continue;
      } else { 
        if (!isset($arr[$topkey]))
          $arr[$topkey] = array();

        if (strpos($subkey, ".") === FALSE) // Shortcut for leaf nodes to cut down on recursion (same effect as leaf case above)
          $arr[$topkey][$subkey] = $values[$fullkey];
        else
          $subelements[$topkey][$subkey] = $fullkey;

      }
    }
  }
  foreach ($subelements as $k=>$v) {
    array_set_multi($arr[$k], $values, $v);
  }
  Profiler::StopTimer("array_set_multi");
}
function array_unset(&$arr, $key, $delim=".") {
  $ret = true;

  $keyparts = explode($delim, $key);

  $ptr =& $arr;
  $keypartlast = $ptrlast = NULL;

  while ($keypart = array_shift($keyparts)) {
    if (!isset($ptr[$keypart]))
      $ptr[$keypart] = array();

    if (is_array($ptr)) {
      $keypartlast = $keypart;
      $ptrlast =& $ptr;
      $ptr =& $ptr[$keypart];
    } else {
      $ret = false;
      break;
    }
  }

  if ($ret) {
    unset($ptrlast[$keypartlast]);
  }

  return $ret;
}
function array_get(&$arr, $key, $delim=".") {
  //Profiler::StartTimer("array_get");
  $ret = true;

  $keyparts = explode($delim, $key);

  $ptr =& $arr;
  while ($keypart = array_shift($keyparts)) {
    if (is_array($ptr)) {
      if (isset($ptr[$keypart])) {
        $ptr =& $ptr[$keypart];
      } else {
        $ret = false;
        break;
      }
    } else {
      $ret = false;
      break;
    }
  }

  //Profiler::StopTimer("array_get");
  return ($ret ? $ptr : NULL);
}

/**
 * Check if a file exists in the include path (modified)
 *
 * @version     1.2.1
 * @author      Aidan Lister <aidan@php.net>
 * @link        http://aidanlister.com/repos/v/function.file_exists_incpath.php
 * @param       string     $file       Name of the file to look for
 * @return      mixed      The full path if file exists, FALSE if it does not
 */
function file_exists_in_path ($file, $realpath=false, $directory=false)
{
    $paths = explode(PATH_SEPARATOR, get_include_path());
 
    foreach ($paths as $path) {
        // Formulate the absolute path
        $fullpath = $path . DIRECTORY_SEPARATOR . $file;
        // Check it
        if (file_exists($fullpath) || ($directory && is_dir($fullpath))) {
            return ($realpath ? realpath($path) : $path);
        }
    }
 
    return false;
}

function dir_exists_in_path($dir, $realpath=false) {
  return file_exists_in_path($dir, $realpath, true);
}
function friendly_url($url, $encode=true) {
  $vals = array(
                "_"=>"//", // technically this replaces "_" with "__"
                "/"=>"_",
                "+"=>"&&", // technically this replaces "+" with "++"
                "&"=>"+",
                "-"=>"~",
                " "=>"-",
                "%"=>"%25",
                "\""=>"%22",
                "'"=>"%27",
             );
  if($encode) {
    $ret = str_replace(array_keys($vals),array_values($vals),$url);
  } else {
    $ivals = array_reverse($vals, true);
    $ret = str_replace(array_values($ivals),array_keys($ivals),str_replace(" ", "+", $url));
  }
  return $ret;
}
function encode_friendly($url) {
  return friendly_url($url, true);
}
function decode_friendly($url) {
  return friendly_url($url, false);
}

function str_map($str, $map, $reverse=false) {
  if (!empty($map)) {
    if (!$reverse && !empty($map[$str])) {
      $str = $map[$str];
    } else {
      $tmp = array_search($str, $map);
      if ($tmp !== false)
        $str = $tmp;
    }
  }
  return $str;
}

function str_varreplace($str, $vars) {
  foreach ($vars as $k=>$v) {
    $replace["[[".$k."]]"] = $v;
  }
  return str_replace(array_keys($replace), array_values($replace), $str);
}
/*
 * PHP's internal base_convert sucks with numbers > 32bit.  
 * This function treats the number as a string and does the processing that way.
 * Copied from comments in http://us.php.net/base_convert and modified to support up to base 64
 */
function unfucked_base_convert ($numstring, $frombase, $tobase) {
  $chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_^";
  $tostring = substr($chars, 0, $tobase);

  $length = strlen($numstring);
  $result = '';
  for ($i = 0; $i < $length; $i++) {
    $number[$i] = strpos($chars, $numstring{$i});
  }
  do {
    $divide = 0;
    $newlen = 0;
    for ($i = 0; $i < $length; $i++) {
      $divide = $divide * $frombase + $number[$i];
      if ($divide >= $tobase) {
        $number[$newlen++] = (int)($divide / $tobase);
        $divide = $divide % $tobase;
      } elseif ($newlen > 0) {
        $number[$newlen++] = 0;
      }
    }
    $length = $newlen;
    $result = $tostring{$divide} . $result;
  }
  while ($newlen != 0);
  return $result;
}


function md5unpack($str, $bitsize) {
  $parts = unpack("c*c", md5($str, true));
  switch($bitsize) {
  case 8:
    $p = pack("cccc", 0, 0, 0, $parts["c1"]);
    break;
  case 16:
    $p = pack("cccc", 0, 0, $parts["c1"], $parts["c2"]);
    break;
  case 24:
    $p = pack("cccc", 0, $parts["c1"], $parts["c2"], $parts["c3"]);
    break;
  case 32:
  default:
    $p = pack("cccc", $parts["c1"], $parts["c2"], $parts["c3"], $parts["c4"]);
    break;
  }
  $whole = unpack("Nret", $p);
  return $whole["ret"];
}

function intshrink($ddkey) {
  return unfucked_base_convert($ddkey, 10, 62);
}
function intgrow($ddkey) {
  return unfucked_base_convert($ddkey, 62, 10);
}
/* replaced by unpack versions, which are 3x faster
function md5int8($data) {
  return unfucked_base_convert(substr(md5($data), 0, 2), 16, 10);
}
function md5int16($data) {
  return unfucked_base_convert(substr(md5($data), 0, 4), 16, 10);
}
function md5int32($data) {
  return unfucked_base_convert(substr(md5($data), 0, 8), 16, 10);
}
*/

function md5int8($data) { return md5unpack($data, 8); }
function md5int16($data) { return md5unpack($data, 16); }
function md5int24($data) { return md5unpack($data, 24); }
function md5int32($data) { return md5unpack($data, 32); }
function md5int64($data) {
  return unfucked_base_convert(substr(md5($data), 0, 16), 16, 10);
}
function md5int128($data) {
  return unfucked_base_convert(md5($data), 16, 10);
}
function makeRequestURL($page, $args=NULL, $ignore=NULL) {
  //Profiler::StartTimer("makeRequestURL");
  $ret = $page;
  if (!empty($args))
    $ret .= (strpos($ret, "?") ? "&" : "?") . http_build_query($args);

  if (! empty($ignore)) {
    foreach ($ignore as $ign) {
      $match[] = "/[&?]" . preg_quote(urlencode($ign)) . "=[^&#]+/";
      $replace[] = "";
   }
  }
  if (!empty($match))
    $ret = preg_replace($match, $replace, $ret);

  //Profiler::StartTimer("makeRequestURL");
  return $ret;
}
function object_to_xml($obj, $container="", $level=0) {
  $tabs = str_repeat("\t",$level);
  if (is_array($container)) {
    $properties = $container[1];
    $container = $container[0];
  } else {
    $properties = array();
  }
  if (is_object($obj)) {
    $xml = $tabs . "<$container";
    $properties = array_merge($properties, get_object_vars($obj));
    $attributes = $children = array();
    foreach ($properties as $k=>$v) {
      if (is_object($v) || is_array($v))
        $children[$k] = $v;
      else
        $attributes[$k] = $v;
    }
    foreach ($attributes as $k2=>$v2) {
      if ($v2 !== NULL)
        $xml .= sprintf(' %s="%s"', htmlspecialchars($k2), htmlspecialchars($v2));
    }
    if (!empty($children)) {
      $xml .= ">\n";
      foreach ($children as $k2=>$v2) {
        $xml .= object_to_xml($v2, $k2, $level+1);
      }
      $xml .= $tabs . "</" . $container . ">\n";
    } else {
      $xml .= " />\n";
    }
  } else if (is_array($obj)) {
    $subxml = "";
    $allnumeric = true;
    foreach ($obj as $k=>$v) {
      $subcontainer = $k;
      if (is_object($v)) {
        $allnumeric = false;
        $subcontainer = get_class($v);
      } else if (is_numeric($k)) {
        $subcontainer = array($container, array("id" => $k));
      }
      $subxml .= object_to_xml($v, $subcontainer, $level+1);
    }
    if (!$allnumeric) {
      $xml = $tabs . "<$container";
      foreach ($properties as $k=>$v) {
        $xml .= sprintf(' %s="%s"', htmlspecialchars($k), htmlspecialchars($v));
      }
      $xml .= ">\n";
    }
    $xml .= $subxml;
    if (!$allnumeric) {
      $xml .= $tabs . "</" . $container . ">\n";
    }
  } else {
    if ($obj !== NULL)
      $xml .= sprintf("%s<%s>%s</%s>\n", $tabs, $container, $obj, $container);
  }
  return $xml;
}
function makeQueryString($args) {
  return implode("&", array_map(create_function('$k, $v', 'return $k . "=" . urlencode($v);'), array_keys($args), array_values($args)));
}
function makeFriendlyURL($page="/", $urlargs=NULL, $queryargs=NULL) {
  $url = $page;

  if (!empty($urlargs) && is_array($urlargs)) {
    $urlargs = array_flatten($urlargs);
    foreach ($urlargs as $k=>$v) {
      $url .= ($url[strlen($url)-1] != "/" ? "/" : "") . "$k-" . encode_friendly($v);
    }
  }

  if (!empty($queryargs) && is_array($queryargs)) {
    $urlseperator .= "?";
    foreach ($queryargs as $k=>$v) {
      if (is_array($v)) {
        foreach ($v as $k2=>$v2) {
          $url .= $urlseperator . urlencode($k . "[" . $k2 . "]") . "=" . urlencode($v2);
          $urlseperator = "&";
        }
      } else {
        $url .= $urlseperator . urlencode($k) . "=" . urlencode($v);
      }
      $urlseperator = "&";
    }
  }
  return $url;
}
function array_flatten(&$arr, $prefix="") {
  $ret = array();
  if (empty($arr)) {
    return $ret;
  }
  foreach ($arr as $k=>$v) {
    $fullkeyname = (!empty($prefix) ? "$prefix." : "") . $k;
    if (is_array($v))
      $ret = array_merge($ret, array_flatten($arr[$k], $fullkeyname));
    else
      $ret[$fullkeyname] = $v;
  }
  return $ret;
}
function ucwordssmart($str) {
  $str = ucwords($str);
  return str_replace(array("And ", "To ", "Or "), array("and ", "to ", "or "), $str);
}

function obfuscateString($str) {
  $ret = "$$" . base64_encode(gzdeflate($str));
  return $ret;
}

function unobfuscateString($str) {
  if (substr($str, 0, 2) == '$$') {
    if (strpos($str, ' ')) {
      return substr($str, 2); 
    } else {
      return gzinflate(base64_decode(substr($str, 2)));
    }
  } else {
    return $str;
  }
}

/**
 * performs a 302 redirect to the url specified
 * but the php can still continue
 *
 * @param string $url
 * @param array $args hash of extra query string args
 * @see   header()
 * @see   queryString()
 */
function redirect1($url, $args = array()) {
  if (ob_get_contents()) ob_end_clean();
  ob_start();
  //if ($args) $url .= '?' . queryString($args);
  if ($args) $url = makeRequestURL($url, $args);
  http_redirect("$url");
  /*
  header('Connection: close');

  $size=ob_get_length();
  header("Content-Length: $size");
  */
  ob_flush();
  flush();
}
function bsize($s) {
  foreach (array('','K','M','G') as $i => $k) {
    if ($s < 1024) break;
    $s/=1024;
  }
  return sprintf("%5.1f %sBytes",$s,$k);
}

// Take a hex string and return a color string in a format the backend supports
function hex2rgbstr($color) {
  // Check to make sure we're working with a valid color
  if (!preg_match("/^[0-9a-f]{6}$/i", $color)) 
    return false;

  $rgb = array(0, 0, 0);
  for ($i = 0; $i < 3; $i++) {
    $rgb[$i] = hexdec(substr($color, $i * 2, 2));
  }

  return "rgb" . implode(".", $rgb);
}
function rgb2hex($rgb) {
  $rgbstr = "";
  if (!empty($rgb) && is_array($rgb)) {
    foreach ($rgb as $c) {
      $rgbstr .= str_pad(dechex($c), 2, "0");
    }
  }
  return $rgbstr;
}
function hsv2rgb($hsv)
{
  $H = $hsv[0];
  $S = $hsv[1];
  $V = $hsv[2];

  $Hi = floor($H*6);

  $f = ($H*6) - $Hi;

  $p = $V * (1 - $S);
  $q = $V * (1 - $f*$S);
  $t = $V * (1 - (1-$f)*$S);

  switch($Hi)
    {
    case 0:
      $R = $V*255;
      $G = $t*255;
      $B = $p*255;
      break;

    case 1:
      $R = $q*255;
      $G = $V*255;
      $B = $p*255;
      break;

    case 2:
      $R = $p*255;
      $G = $V*255;
      $B = $t*255;
      break;

    case 3:
      $R = $p*255;
      $G = $q*255;
      $B = $V*255;
      break;

    case 4:
      $R = $t*255;
      $G = $p*255;
      $B = $V*255;
      break;

    case 5:
      $R = $V*255;
      $G = $p*255;
      $B = $q*255;
      break;
    default:
      return NULL;
    }

  return array($R, $G, $B);
}
function color2hex($color) {
  $hsv[0] = ($color >> 16) / 360;
  $hsv[1] = ($color >> 8 & 255) / 255;
  $hsv[2] = ($color & 255) / 255;
  return rgb2hex(hsv2rgb($hsv));
}
if (!function_exists('gzdecode')) {
  function gzdecode ($data) {
    $flags = ord(substr($data, 3, 1));
    $headerlen = 10;
    $extralen = 0;
    $filenamelen = 0;
    if ($flags & 4) {
      $extralen = unpack('v' ,substr($data, 10, 2));
      $extralen = $extralen[1];
      $headerlen += 2 + $extralen;
    }
    if ($flags & 8) // Filename
      $headerlen = strpos($data, chr(0), $headerlen) + 1;
    if ($flags & 16) // Comment
      $headerlen = strpos($data, chr(0), $headerlen) + 1;
    if ($flags & 2) // CRC at end of file
      $headerlen += 2;
    $unpacked = gzinflate(substr($data, $headerlen));
    if ($unpacked === FALSE)
      $unpacked = $data;
    return $unpacked;
  }
}
/**
 * This function determines if the user agent is a bot or not.
 */
function isBot() {
  /**
   * @todo - update the list of bots here
   * (last updated on 7/23/07)
   */
  $bot_user_agents = array("im2-",
                           "googlebot",
                           "adsbot-google",
                           "mediapartners-google",
                           "slurp",
                           "yahoo-mmcrawler",
                           "msnbot",
                           "quibot",
                           "becomebot",
                           "jeeves /teoma",
                           "jeeves",
                           "teoma",
                           "pingdom",
                           "gigabot",
                           "mj12bot",
                           "shopwiki",
                           "lmqueuebot",
                           "irlbot",
                           "geniebot",
                           "iaarchive",
                           "ia_archiver",
                           "openwebspider",
                           "w3c-checklink",
                           "jakarta commons",
                           "python-urllib",
                           "voyager /1.0",
                           "libwww-perl",
                           "RPT-HTTPClient");
  for ($i=0; $i<count($bot_user_agents); $i++) {
    if ( (stripos($_SERVER['HTTP_USER_AGENT'], $bot_user_agents[$i]) !== false) ) {
      return true;
    }
  }
  return false;
}

function is_json($str) {
  $str = trim($str);
  return (($str[0] == '{' && $str[-1] == '}') || ($str[0] == '[' && $str[-1] == ']') || ($str[0] == '"' && $str[-1] == '"'));
}
