<?php

class Address {
	public $AddressID;
	public $UserID;
	public $Street;
}

class Bug {
	public $ID;
	public $Title;
	public $ProjectID;

	// test member with underscore
	public $Test_One;

    // test float
    public $TimeToFix;

	private $project;
	private $watchers;

	function getProject () {
		return $this->project;
	}
	function setProject (Project $p) {
		$this->project = $p;	
	}

	function getWatchers () {
		return $this->watchers;	
	}
	function setWatchers (Collection $watchers) {
		$this->watchers = $watchers;
	}
	function addWatcher(User $watcher) {
		$this->watcher[] = $watcher;
	}
}

class Machine {
	public $Name;
	public $Description;
}

class Project {
	private $ProjectID;
	private $Name;
	private $CreatedDate;
	private $StatusID;
	private $Description;

	private $bugs;
	
	function __construct () {
		$this->bugs = new Collection;
	}
	
	function __call ($method, $args) {
		if (strpos($method, 'get') === 0) {
			$prop = substr($method, 3);
			return $this->$prop;
		} elseif (strpos($method, 'set') === 0) {
			$prop = substr($method, 3);
			return $this->$prop = $args[0];
		} else {
			throw new Exception('Undefined method: Project->' . $method);
		}
	}

	function getBugs () {
		return $this->bugs;
	}
	function setBugs (Collection $bugs) {
		$this->bugs = $bugs;
	}
	function addBug (Bug $bug) {
		$this->bugs[] = $bug;
	}
}


class Profile {
	private $ProfileID;
	private $UserID;

	private $user;
	
	function getProfileID () {
		return $this->ProfileID;
	}
	function setProfileID ($id) {
		$this->ProfileID = $id;
	}
	
	function getUserID () {
		return $this->UserID;
	}
	function setUserID ($id) {
		$this->UserID = $id;
	}

	public function getUser () {
		return $this->user;
	}
	public function setUser (User $u) {
		$this->user = $u;	
	}
}


class User {
	public $UserID;
	public $FirstName;
	public $LastName;

	private $addresses;
	private $bugs;
	
	function __construct () {
		$this->addresses = new Collection;
		$this->bugs = new Collection;
	}

	public function getWorkAddresses () {
		return $this->addresses;
	}
	public function setWorkAddresses(Collection $addresses) {
		$this->addresses = $addresses;
	}
	public function addWorkAddress(Address $addr) {
		$this->addresses[] = $addr;
	}
	
	public function getBugs () {
		return $this->bugs;
	}
	public function setBugs (Collection $bugs) {
		$this->bugs = $bugs;
	}
}

