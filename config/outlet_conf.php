<?
require_once("outlet/Outlet.php");

Outlet::init(array(
  'connection' => array(
    'dsn' => 'sqlite:tmp/elation.sqlite',
    'dialect' => 'sqlite'
  ),
  'classes' => array(
  )
));
