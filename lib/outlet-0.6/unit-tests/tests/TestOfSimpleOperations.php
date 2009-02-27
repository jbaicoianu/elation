<?php

class TestOfSimpleOperations extends OutletTestCase {

	function testCrudOperations() {
		$outlet = Outlet::getInstance();
		$project = new Project;
		$project->Name = 'Project 1';
		
		Outlet::getInstance()->save($project);

		// test insert
		$bug = new Bug;
		$bug->Title = 'Test bug';
		$bug->ProjectID = $project->ProjectID;

		$outlet->save($bug);
		
		$id = $bug->ID;

		$this->assertNotNull( $id, 'Row inserted' );

		// test retrieve
		$bug = $outlet->load('Bug', $id);
		
		$this->assertIsA($bug, 'Bug', 'Object is a Bug');
		$this->assertEqual( $bug->Title, 'Test bug', 'Row retrieved' );

		// test update
		$bug->Title = 'New Test Bug';	

		$outlet->save($bug);

		$bug = $outlet->load('Bug', $bug->ID);

		$this->assertEqual( $bug->Title, 'New Test Bug', 'Row updated' );

		// test update when adding a relationship entity
		$bug2 = new Bug;
		$bug2->Title = 'Test bug 2';
		$project->addBug( $bug2 );

		$outlet->save($project);

		$project = $outlet->load('Project', $project->ProjectID);
		$this->assertEqual(count($project->getBugs()), 2, 'Two rows returned');

		// test assignment of many to one
		$bug3 = new Bug;
		$bug3->Title = 'Bug 3';
		$bug3->setProject( $project );

		$outlet->save($bug3);

		$project2 = new Project;
		$project2->Name = 'Project 2';
		$outlet->save($project2);

		$bug3->setProject($project2);

		$this->assertEqual($bug3->ProjectID, $project2->ProjectID, "Bug gets assigned the id of the project on setProject");

	}

	function testNonAutoIncrementingVarcharPrimaryKey () {
		$m = new Machine;
		$m->Name = 'test';
		$m->Description = 'Test machine';

		$outlet = Outlet::getInstance();

		// test insert
		$outlet->save( $m );

		$outlet->clearCache();

		// test loading
		$machine = $outlet->load('Machine', $m->Name);

		$this->assertNotNull($machine, "Machine was saved and retrieved");

		// test update
		$machine->Description = 'Updated description';

		$outlet->save($machine);
	}
	
	function testDefaults () {
		// make sure that the created date of the project is assigned
		// as per the defaultExpr setting
		// also make sure that the status or the project is set 
		// as per the default setting
		$project = new Project;
		$project->Name = 'Test Project';
		
		$outlet = Outlet::getInstance();
		
		$outlet->save($project);
		
		$project = $outlet->load('Project', $project->ProjectID);
		
		$this->assertEqual($project->CreatedDate, date("Y-m-d H:i:s"));
		$this->assertEqual($project->StatusID, 1);
		$this->assertEqual($project->Description, 'Default Description');
	}

	function testDelete () {
		$project = new Project;
		$project->Name = 'Test Project';
		
		$outlet = Outlet::getInstance();
		
		$outlet->save($project);
		
		$project = $outlet->load('Project', $project->ProjectID);

		$project_id = $project->ProjectID;

		$outlet->delete('Project', $project_id);

		// I'll have to do something better than this 
		// when I get a chance
		try {
			$project = $outlet->load('Project', $project_id);
		} catch (Exception $e) {}

		$this->assertTrue($e instanceof Exception, 'Project was deleted');			
	}

}

