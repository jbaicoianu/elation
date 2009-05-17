<?php

class Collection extends ArrayObject {
	public function add ($obj) {
		return $this->append($obj);	
	}
	public function remove ($obj) {}
	
	public function removeAll () {
		$this->exchangeArray(array());
	}
}
