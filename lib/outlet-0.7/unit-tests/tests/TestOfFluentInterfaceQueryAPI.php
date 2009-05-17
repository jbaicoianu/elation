<?php

class TestOfFluentInterfaceQueryAPI extends OutletTestCase {

	function testSimpleSelect () {
		$outlet = Outlet::getInstance();

		$p = new Project;
		$p->setName('Project 1');

		$outlet->save($p);

                $p = new Project;
		$p->setName('Project 2');

		$outlet->save($p);

                $this->assertEqual(count($outlet->from('Project')->find()), 2);
	}

        function testFindOne () {
		$outlet = Outlet::getInstance();

		$p = new Project;
		$p->setName('Project 1');

		$outlet->save($p);

                $this->assertTrue($outlet->from('Project')->findOne() === $p);
	}

        /*
          Currently not implemented
        function testEagerFetchingOneToMany () {
                // insert a project and some bugs
		$project = new Project;
		$project->setName('Cool Project');

		$bug1 = new Bug;
		$bug1->Title = 'Bug 1';
		$project->addBug( $bug1 );

		$bug2 = new Bug;
		$bug2->Title = 'Bug2';
		$project->addBug( $bug2 );

		$outlet = Outlet::getInstance();

		$outlet->save($project);

                // clear cache because it will be used to check if bugs were loaded
                $outlet->clearCache();

                $projects = $outlet->from('Project')->with('Bug')->find();
                $this->assertEqual(2, count(OutletMapper::$map['Bug']));
        }
       
        function testEagerFetchingManyToMany () {
                // Implement.....
        }
         
         */

        function testEagerFetchingOneToOne () {
                $user = new User;
		$user->FirstName = 'Alvaro';
		$user->LastName = 'Carrasco';

		$outlet = Outlet::getInstance();
		$outlet->save($user);

		$profile = new Profile;
		$profile->setUserID( $user->UserID );

		$outlet = Outlet::getInstance();

		$outlet->save( $profile );

                // clear cache because it will be used to check if user was loaded
                $outlet->clearCache();

                // Postgres won't work if 'User' is used as an alias for a table
                $profile = $outlet->from('Profile')->with('User Users')->find();
                $this->assertEqual(1, count(OutletMapper::$map['User']));
        }

        function testEagerFetchingManyToOne () {
                $bug = new Bug;
		$bug->Title = 'Test Bug';

		$project = new Project;
		$project->setName('Test Project');

		$bug->setProject( $project );

		$outlet = Outlet::getInstance();

		$outlet->save( $bug );

                // clear cache because it will be used to check if project was loaded
                $outlet->clearCache();

                $bug = $outlet->from('Bug')->with('Project')->find();
                $this->assertEqual(1, count(OutletMapper::$map['Project']));
        }

        function testPagination () {
                $outlet = Outlet::getInstance();
                $totalRecords = 25;

                for ($i = 0; $i < $totalRecords; $i++){
                    $project = new Project;
                    $project->setName('Test Project '.$i);
                    
                    $outlet->save( $project );
                }

                $this->assertEqual(10, count($outlet->from('Project')->limit(10)->find()));

                $this->assertEqual(5, count($outlet->from('Project')->limit(10)->offset(20)->find()));
        }
}