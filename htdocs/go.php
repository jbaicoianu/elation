<?
$root = preg_replace("|/htdocs$|", "", getcwd());
ini_set("include_path", ".:$root/include");
putenv('TZ=America/Los_Angeles');
chdir($root);

include_once("include/webapp_class.php");

$webapp = new WebApp($root, $_REQUEST);
$webapp->Display();


