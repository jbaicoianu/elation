<?php
//set_include_path(get_include_path() . PATH_SEPARATOR . '/usr/share/php');

$root = preg_replace("|/htdocs$|", "", getcwd());
chdir($root);
elation_readpaths($root);

putenv('TZ=America/Los_Angeles');

include_once("include/webapp_class.php");
include_once("lib/profiler.php");

Profiler::StartTimer("Total");
$webapp = new WebApp($root, $_REQUEST);
$webapp->Display();
Profiler::StopTimer("Total");

if (!empty($_REQUEST["_timing"]))
  print Profiler::Display();

function elation_addroot($roots) {
  $path = explode(PATH_SEPARATOR, get_include_path());
  if (!is_array($roots)) {
    $roots = array($roots);
  }
  
  if ($path[0] == ".") // . should always be first
    array_shift($path);
  $path = array_merge($roots, $path);
  array_unshift($path, ".");

  set_include_path(implode(PATH_SEPARATOR, $path));
}
function elation_readpaths($root) {
  $matches = array(); 
  $homedir = '';
  
  // FIXME - Linux-specific expansion of ~/ in paths for developer directories.  Is there a clean way to make this cross-platform?
  $homedirMatches = preg_match('@/home/\w*/@', $root, $matches);
  if($homedirMatches > 0) {
    $homedir = $matches[0];
  }
   
  $paths = file_get_contents('config/elation.path');
  
  if($paths !== false) {
    $paths = explode(PHP_EOL, $paths);
    $newpaths = array($root);
    foreach($paths as $path) {
      if(!empty($path)) {
        if($homedir) {
          $path = str_replace('~/', $homedir, $path);
        }
        $newpaths[] = $path;
      }
    }
    elation_addroot($newpaths);
  }
}
