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
  $unix_date         = strtotime($date);
   
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
