<?php

class OutletTestCase extends UnitTestCase {

	function setUp () {
		// create database
		$pdo = Outlet::getInstance()->getConnection();

		switch (DATABASE_DRIVER) {
			case 'mysql':	OutletTestSetup::createMySQLTables( $pdo );		break;
                        case 'pgsql':	OutletTestSetup::createPostgresTables( $pdo );		break;
			case 'sqlite': 
			default: 		OutletTestSetup::createSQLiteTables( $pdo );
		}	

		$pdo->exec('DELETE FROM projects');
                $pdo->exec('DELETE FROM addresses');
		$pdo->exec('DELETE FROM bugs');
		$pdo->exec('DELETE FROM machines');
		$pdo->exec('DELETE FROM users');
		$pdo->exec('DELETE FROM watchers');
                $pdo->exec('DELETE FROM profiles');
	}

	function tearDown () {
            
	}
}

class OutletTestSetup {
	function createSQLiteTables ($pdo) {
		// create projects table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS projects (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT,
				created_date TEXT NOT NULL,
				status_id INTEGER NOT NULL,
				description TEXT NOT NULL
			)
		");

		// create addresses table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS addresses (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL,
				street TEXT
			)
		");

		// create bugs table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS bugs (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				project_id INTEGER NOT NULL,
				user_id INTEGER,
				title TEXT,
                test_one INTEGER,
                time_to_fix FLOAT
			)
		");

		// create users table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				first_name TEXT,
				last_name TEXT
			)
		");

                // create profiles table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS profiles (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL
			)
		");

		// create watchers table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS watchers (
				user_id INTEGER,
				bug_id INTEGER,
				PRIMARY KEY (user_id, bug_id)
			)	
		");

		// create machines table (table with a varchar as a PK)
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS machines (
				name TEXT PRIMARY KEY,
				description TEXT		
			)
		");
	}

	function createMySQLTables ($pdo) {
		// create projects table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS projects (
				id INTEGER PRIMARY KEY AUTO_INCREMENT,
				name TEXT,
				created_date TEXT NOT NULL,
				status_id INTEGER NOT NULL,
				description TEXT NOT NULL
			)
		");

		// create addresses table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS addresses (
				id INTEGER PRIMARY KEY AUTO_INCREMENT,
				user_id INTEGER NOT NULL,
				street TEXT
			)
		");

		// create bugs table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS bugs (
				id INTEGER PRIMARY KEY AUTO_INCREMENT,
				project_id INTEGER NOT NULL,
				user_id INTEGER,
				title TEXT,
                test_one INTEGER,
                time_to_fix FLOAT
			)
		");

		// create users table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTO_INCREMENT,
				first_name TEXT,
				last_name TEXT
			)
		");

                // create profiles table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS profiles (
				id INTEGER PRIMARY KEY AUTO_INCREMENT,
				user_id INTEGER NOT NULL
			)
		");

		// create watchers table
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS watchers (
				user_id INTEGER,
				bug_id INTEGER,
				PRIMARY KEY (user_id, bug_id)
			)
		");

		// create machines table (table with a varchar as a PK)
		$pdo->exec("
			CREATE TABLE IF NOT EXISTS machines (
				name VARCHAR(255) PRIMARY KEY,
				description TEXT
			)
		");$i++;
	}

        function createPostgresTables ($pdo) {
		// create projects table
                if (!$pdo->query("SELECT EXISTS(SELECT relname FROM pg_class WHERE relname = 'projects')")->fetchColumn()){
                    $pdo->exec("
                            CREATE TABLE projects (
                                    id SERIAL,
                                    name TEXT,
                                    created_date TIMESTAMP,
                                    status_id INTEGER NOT NULL,
                                    description TEXT NOT NULL
                            );
                    ");
                
                    // tests configuration
                    $pdo->exec("ALTER TABLE projects_id_seq RENAME TO projects_id_seq_test");
                }

		// create addresses table
                if (!$pdo->query("SELECT EXISTS(SELECT relname FROM pg_class WHERE relname = 'addresses')")->fetchColumn()){
                    $pdo->exec("
                            CREATE TABLE addresses (
                                    id SERIAL,
                                    user_id INTEGER NOT NULL,
                                    street TEXT
                            )
                    ");
                }

		// create bugs table
                if (!$pdo->query("SELECT EXISTS(SELECT relname FROM pg_class WHERE relname = 'bugs')")->fetchColumn()){
                    $pdo->exec("
                            CREATE TABLE bugs (
                                    id SERIAL,
                                    project_id INTEGER NOT NULL,
                                    user_id INTEGER,
                                    title TEXT,
                                    test_one INTEGER,
                                    time_to_fix FLOAT8
                            )
                    ");
                }

		// create users table
                if (!$pdo->query("SELECT EXISTS(SELECT relname FROM pg_class WHERE relname = 'users')")->fetchColumn()){
                    $pdo->exec("
                            CREATE TABLE users (
                                    id SERIAL,
                                    first_name TEXT,
                                    last_name TEXT
                            )
                    ");
                }

                // creates profiles table
                if (!$pdo->query("SELECT EXISTS(SELECT relname FROM pg_class WHERE relname = 'profiles')")->fetchColumn()){
                    $pdo->exec("
                            CREATE TABLE profiles (
                                    id SERIAL,
                                    user_id INTEGER NOT NULL
                            )
                    ");
                }

		// create watchers table
                if (!$pdo->query("SELECT EXISTS(SELECT relname FROM pg_class WHERE relname = 'watchers')")->fetchColumn()){
                    $pdo->exec("
                            CREATE TABLE watchers (
                                    user_id INTEGER,
                                    bug_id INTEGER,
                                    PRIMARY KEY (user_id, bug_id)
                            )
                    ");
                }

		// create machines table (table with a varchar as a PK)
                if (!$pdo->query("SELECT EXISTS(SELECT relname FROM pg_class WHERE relname = 'machines')")->fetchColumn()){
                    $pdo->exec("
                            CREATE TABLE machines (
                                    name TEXT PRIMARY KEY,
                                    description TEXT
                            )
                    ");
                }
	}
}
