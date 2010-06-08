<?php
$root = preg_replace("|/htdocs$|", "", getcwd());
ini_set("include_path", ".:$root/include:/usr/share/php");

putenv('TZ=America/Los_Angeles');
chdir($root);

//For Zend
$path = "$root/lib" . PATH_SEPARATOR . "$root/include/forms";
set_include_path($path . PATH_SEPARATOR . get_include_path());

include_once("include/webapp_class.php");
include_once("lib/profiler.php");

Profiler::StartTimer("Total");
$webapp = new WebApp($root, $_REQUEST);
$webapp->Display();
Profiler::StopTimer("Total");

if (!empty($_REQUEST["_timing"]))
  print Profiler::Display();


