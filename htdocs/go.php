<?php
set_include_path(get_include_path() . PATH_SEPARATOR . '/usr/share/php');

$root = preg_replace("|/htdocs$|", "", getcwd());
chdir($root);
addroot($root);

elation_readpaths();

putenv('TZ=America/Los_Angeles');

include_once("include/webapp_class.php");
include_once("lib/profiler.php");

Profiler::StartTimer("Total");
$webapp = new WebApp($root, $_REQUEST);
$webapp->Display();
Profiler::StopTimer("Total");

if (!empty($_REQUEST["_timing"]))
  print Profiler::Display();

function addroot($root) {
  $path = explode(PATH_SEPARATOR, get_include_path());

  if ($path[0] == ".") // . should always be first
    array_shift($path);
  array_unshift($path, "$root");
  array_unshift($path, ".");

  set_include_path(implode(PATH_SEPARATOR, $path));
}

/**
 * Read extra paths into the include path
 */
function elation_readpaths() {
  $paths = file_get_contents('config/elation.path');
  
  if($paths !== false) {
    $paths = explode(PHP_EOL, $paths);
    foreach($paths as $path) {
      if($path) {
        set_include_path(get_include_path() . PATH_SEPARATOR . $path);
      }
    }
  }
}