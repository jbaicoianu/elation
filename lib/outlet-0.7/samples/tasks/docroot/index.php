<?php
require 'config.php';

require '../classes/User.php';

$outlet = Outlet::getInstance();
$outlet->createProxies();

$user = new User;
$user->Username = 'Test user';

$outlet->save($user);

