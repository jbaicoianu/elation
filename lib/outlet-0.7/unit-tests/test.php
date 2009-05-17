<?php
if (isset($_SERVER['argv'][1])) {
	define('DATABASE_DRIVER', $_SERVER['argv'][1]);
} elseif (isset($_GET['driver'])) {
	define('DATABASE_DRIVER', $_GET['driver']);
} else {
	define('DATABASE_DRIVER', 'sqlite');
}

set_include_path('../classes'.PATH_SEPARATOR.get_include_path());

chdir(dirname(__FILE__));

// simpletest
require_once 'simpletest/unit_tester.php';
require_once 'simpletest/reporter.php';

// outlet
require_once 'outlet/Outlet.php';
require_once 'entities.php';
require_once 'OutletTestCase.php';

// basic setup
switch (DATABASE_DRIVER) {
	case 'sqlite':
            $conf = include('outlet-config-sqlite.php');
            break;
        case 'mysql':
            $conf = include('outlet-config-mysql.php');
            break;
        case 'pgsql':
            $conf = include('outlet-config-pgsql.php');
            break;
	default: throw new Exception('Unsupported database driver: '.DATABASE_DRIVER);
}
Outlet::init($conf);
Outlet::getInstance()->createProxies();
//require 'outlet-proxies.php';

$test = new GroupTest('All Tests');
$test->addTestFile('tests/TestOfSimpleOperations.php');
$test->addTestFile('tests/TestOfRelationships.php');
$test->addTestFile('tests/TestOfIdentityMap.php');
$test->addTestFile('tests/TestOfFluentInterfaceQueryAPI.php');

if (isset($_SERVER['HTTP_HOST'])) {
	$test->run(new HtmlReporter);
} else {
	$test->run(new TextReporter);
}
