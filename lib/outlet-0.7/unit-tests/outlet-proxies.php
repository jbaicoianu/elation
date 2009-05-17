<?php
class Address_OutletProxy extends Address implements OutletProxy { 
} 
class Bug_OutletProxy extends Bug implements OutletProxy { 
  function getProject() { 
    if (is_null($this->ProjectID)) return parent::getProject(); 
    if (is_null(parent::getProject()) && isset($this->ProjectID)) { 
      parent::setProject( Outlet::getInstance()->load('Project', $this->ProjectID) ); 
    } 
    return parent::getProject(); 
  } 
  function setProject(Project $ref) { 
    if (is_null($ref)) { 
      throw new OutletException("You can not set this to NULL since this relationship has not been marked as optional"); 
      return parent::setProject(null); 
    } 
    $this->ProjectID = $ref->ProjectID; 
    return parent::setProject($ref); 
  } 
} 
class Machine_OutletProxy extends Machine implements OutletProxy { 
} 
class Project_OutletProxy extends Project implements OutletProxy { 
  function getBugs() { 
    $args = func_get_args(); 
    if (count($args)) { 
      if (is_null($args[0])) return parent::getBugs(); 
      $q = $args[0]; 
    } else { 
      $q = ''; 
    } 
    if (isset($args[1])) $params = $args[1]; 
    else $params = array(); 
    $q = trim($q); 
    if (stripos($q, 'where') !== false) { 
      $q = '{Bug.ProjectID} = '.$this->ProjectID.' and ' . substr($q, 5); 
    } else { 
      $q = '{Bug.ProjectID} = '.$this->ProjectID. ' ' . $q; 
    }
    $query = Outlet::getInstance()->from('Bug')->where($q, $params); 
    if (!parent::getBugs() instanceof OutletCollection) { 
      parent::setBugs( new OutletCollection( $query ) ); 
    } else { 
      parent::getBugs()->setQuery( $query ); 
    } 
    return parent::getBugs(); 
  } 
} 
class User_OutletProxy extends User implements OutletProxy { 
  function getWorkAddresses() { 
    $args = func_get_args(); 
    if (count($args)) { 
      if (is_null($args[0])) return parent::getWorkAddresses(); 
      $q = $args[0]; 
    } else { 
      $q = ''; 
    } 
    if (isset($args[1])) $params = $args[1]; 
    else $params = array(); 
    $q = trim($q); 
    if (stripos($q, 'where') !== false) { 
      $q = '{Address.UserID} = '.$this->UserID.' and ' . substr($q, 5); 
    } else { 
      $q = '{Address.UserID} = '.$this->UserID. ' ' . $q; 
    }
    $query = Outlet::getInstance()->from('Address')->where($q, $params); 
    if (!parent::getWorkAddresses() instanceof OutletCollection) { 
      parent::setWorkAddresses( new OutletCollection( $query ) ); 
    } else { 
      parent::getWorkAddresses()->setQuery( $query ); 
    } 
    return parent::getWorkAddresses(); 
  } 
  function getBugs() { 
    if (parent::getBugs() instanceof OutletCollection) return parent::getBugs(); 
    $q = Outlet::getInstance()->from('Bug') 
        ->innerJoin('watchers ON watchers.bug_id = {Bug.ID}') 
        ->where('watchers.user_id = ?', array($this->UserID)); 
    parent::setBugs( new OutletCollection( $q ) ); 
    return parent::getBugs(); 
  } 
} 
class Profile_OutletProxy extends Profile implements OutletProxy { 
  function getUser() { 
    if (is_null($this->UserID)) return parent::getUser(); 
    if (is_null(parent::getUser()) && $this->UserID) { 
      parent::setUser( Outlet::getInstance()->load('User', $this->UserID) ); 
    } 
    return parent::getUser(); 
  } 
} 
