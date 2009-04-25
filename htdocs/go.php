<?
$root = preg_replace("|/htdocs$|", "", getcwd());
ini_set("include_path", ".:$root/include:/usr/share/php");

putenv('TZ=America/Los_Angeles');
chdir($root);

include_once("include/webapp_class.php");
include_once("lib/profiler.php");

Profiler::StartTimer("Total");
$webapp = new WebApp($root, $_REQUEST);
$webapp->Display();
Profiler::StopTimer("Total");

if (!empty($_REQUEST["_timing"]))
  print Profiler::Display();


