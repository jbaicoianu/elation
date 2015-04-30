<?php
/*
  Copyright (c) 2005 James Baicoianu

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

class Base {
  protected $parent;
  protected $root;
  
  function Base(&$parent) {
    $this->parent =& $parent;

    //$this->data = DataManager::singleton();
    if (isset($this->parent) && $this->parent !== NULL) {
      $this->root =& $this->GetRootObject();
      //$this->tplmgr =& $this->parent->tplmgr;
    } else {
      $this->root = NULL;
      $this->data = $this->tplmgr = NULL;
    }
  }
  
  function &GetRootObject() {
    $ptr =& $this;
    while (isset($ptr->parent) && $ptr->parent !== NULL) {
      $ptr =& $ptr->parent;
    }

    return $ptr;
  }

}
