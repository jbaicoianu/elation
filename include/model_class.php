<?
class Model {
  function Model($args=NULL) {
    if (is_array($args) || is_object($args)) { // Clone args
      foreach ($args as $k=>$v) {
        $this->{$k} = $v;
      }
    }
  }

  function isValid() {
    return true;
  }

  function Save() {
    if ($this->isValid()) {
      $outlet = Outlet::getInstance();

        $outlet->save($this);
        $ret = true;
    }
    return $ret;
  }
}