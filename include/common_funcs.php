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
function object_to_array($obj, $keymap=NULL) {
  $arr = array();
  if ($obj instanceOf SimpleXMLElement) {
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

