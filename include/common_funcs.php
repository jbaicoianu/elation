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
function object_to_array($obj, $keyprefix="") {
  $arr = array();
  if ($obj instanceOf SimpleXMLElement) {
    foreach ($obj->attributes() as $k=>$v) {
      $arr[$keyprefix.$k] = (string) $v;
    }
    foreach ($obj->children() as $k=>$v) {
      $arr["_children"][$keyprefix.$k] = (string) $v;
    }
    $content = (string) $obj;
    if (!empty($content))
      $arr["_content"] = $content;
  } else if (is_object($obj) || is_array($obj)) {
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
  //Profiler::StartTimer("array_set_multi");
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

