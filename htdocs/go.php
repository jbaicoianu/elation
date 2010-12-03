<?php
$root = preg_replace("|/htdocs$|", "", getcwd());
chdir($root);
addroot($root);
addroot("/home/james/elation");

putenv('TZ=America/Los_Angeles');

//ini_set("include_path", ".:$root/include:/usr/share/php");

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
