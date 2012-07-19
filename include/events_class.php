<?php
class ElationEvent {
  public $type;
  public $target;
  public $data;

  public function __construct($target, $type, $data=null) {
    $this->target = $target;
    $this->type = $type;
    $this->data = $data;
  }
}
class ElationEventable {
  protected $eventlist = array();

  public function addEventListener($type, $fn) {
    if (!is_array($this->eventlist[$type])) {
      $this->eventlist[$type] = array();
    }
    $this->eventlist[$type][] = $fn;
  }
  public function triggerEvent($type, $data=null) {
    $ev = new ElationEvent($this, $type, $data);
    if (!empty($this->eventlist[$type])) {
      foreach ($this->eventlist[$type] as $fn) {
        call_user_func($fn, $ev);
      }
    } 
  }
}

