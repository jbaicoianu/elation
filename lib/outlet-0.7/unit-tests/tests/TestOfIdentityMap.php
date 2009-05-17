<?php

class TestOfIdentityMap extends OutletTestCase {

	/**
	 * Try indirectly saving the same project twice
	 * and make sure it only gets inserted once
	 */
	function testIndirectSave () {
		$outlet = Outlet::getInstance();

		$p = new Project;
		$p->setName('Project 1');

		$b1 = new Bug;
		$b1->Title = 'Bug 1';
		$b1->setProject($p);

		$outlet->save($p);

		$b2 = new Bug;
		$b2->Title = 'Bug 2';
		$b2->setProject($p);

		$outlet->save($b2);

		$this->assertEqual(
			count($outlet->select('Project', 'where {Project.Name} = ?', array('Project 1'))),
			1,
			'Only one project inserted'
		);
	}

        function testMap () {
                $outlet = Outlet::getInstance();

		$p = new Project;
		$p->setName('Project 1');

		$outlet->save($p);

                $p_map = $outlet->select('Project', 'where {Project.ProjectID} = ?', array($p->getProjectID()));
                $p_map = $p_map[0];

                $this->assertTrue($p === $p_map, 'Diferent object on identity map');

                $outlet->clearCache();

                $p_map = $outlet->select('Project', 'where {Project.ProjectID} = ?', array($p->getProjectID()));
                $p_map = $p_map[0];

                $this->assertTrue($p !== $p_map, 'Equal object on identity map');
        }
}

