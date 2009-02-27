<?php
return array(
	'connection' => array(
		'dsn' => 'sqlite:test.sq3',
		'dialect' => 'sqlite'
	),
	'classes' => array(
		'Address' => array(
			'table' => 'addresses',
			'plural' => 'Addresses',
			'props' => array(
				'AddressID'	=> array('id', 'int', array('pk'=>true, 'autoIncrement'=>true)),
				'UserID'	=> array('user_id', 'int'),
				'Street'	=> array('street', 'varchar')
			)
		),
		'Bug' => array(
			'table' => 'bugs',
			'props' => array(
				'ID' 	=> array('id', 'int', array('pk'=>true, 'autoIncrement'=>true)),
				'Title'		=> array('title', 'varchar'),
				'ProjectID' => array('project_id', 'int'),
				'Test_One'	=> array('title', 'varchar') // test an identifier with an underscore on it
			),
			'associations' => array(
				array('many-to-one', 'Project', array('key'=>'ProjectID'))
			)
		),
		'Machine' => array(
			'table' => 'machines',
			'props' => array(
				'Name' 			=> array('name', 'varchar', array('pk'=>true)),
				'Description'	=> array('description', 'varchar')
			)
		),
		'Project' => array(
			'table' => 'projects',
			'props' => array(
				'ProjectID' 	=> array('id', 'int', array('pk'=>true, 'autoIncrement'=>true)),
				'Name'			=> array('name', 'varchar'),
				'CreatedDate' 	=> array('created_date', 'datetime', array('defaultExpr'=>"datetime(current_timestamp, 'localtime')")),
				'StatusID'		=> array('status_id', 'int', array('default'=>1)),
				'Description'	=> array('description', 'varchar', array('default'=>'Default Description'))
			),
			'associations' => array(
				array('one-to-many', 'Bug', array('key'=>'ProjectID'))
			)
		),
		'User' => array(
			'table' => 'users',
			'props' => array(
				'UserID' 	=> array('id', 'int', array('pk'=>true, 'autoIncrement'=>true)),
				'FirstName' => array('first_name', 'varchar'),
				'LastName'	=> array('last_name', 'varchar')
			),
			'associations' => array(
				array('one-to-many', 'Address', array('key'=>'UserID', 'name'=>'WorkAddress', 'plural'=>'WorkAddresses'))
			)
		),
		'Profile' => array(
			'table' => 'profiles',
			'props' => array(
				'ProfileID' 	=> array('id', 'int', array('pk'=>true, 'autoIncrement'=>true)),
				'UserID' 		=> array('user_id', 'int')
			),
			'associations' => array(
				array('one-to-one', 'User', array('key'=>'UserID'))
			)
		)
	)
);
