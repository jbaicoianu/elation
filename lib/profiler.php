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

// profiler.php - timer class used to debug speed problems
// Registers itself as $GLOBALS["profiler"], then all subsequent calls can be made as static function calls
// ie: Profiler::StartTimer("blah");  Profiler::StopTimer("blah");  Profiler::Display();

//$GLOBALS["profiler"] =& new Profiler(); 

class Profiler {
  private static $times;
  private static $count;
  private static $scratch;
  private static $overhead = 0;
  public static $enabled = true;
  public static $level = 1;
  public static $log = 0;
    
  function __construct() {
    //$this->Initialize();

    $overhead_start = microtime(true);
    $overhead_end = microtime(true);
    self::$overhead = 0;//self::GetTimeDiff($overhead_start, $overhead_end);
  } 
  
  function Initialize() {
    //$this->StartTimer("profiler");
  }

  public static function setLevel($level) {
    self::$level = $level;
  }
  public static function Add($name, $value) {
    if (!isset(self::$times[$name]))
      self::$times[$name] = $value;
    else
      self::$times[$name] += $value;
  }
  public static function StartTimer($name, $level=2) {
    //if (!self::$enabled) return;

    if ($level <= self::$level) {
      if (empty(self::$scratch->start[$name])) { // only start timer if we don't already have one active
        self::$scratch->start[$name] = microtime(true);
        if (!isset(self::$times[$name]))
          self::$times[$name] = 0;
      }
      self::$count[$name] = (isset(self::$count[$name]) ? self::$count[$name] + 1 : 1);
    }
  }
  
  public static function StopTimer($name) {
    //if (!self::$enabled) return;

    if (!empty(self::$scratch->start[$name])) {
      $time = self::GetTimeDiff(self::$scratch->start[$name], microtime(true));
      unset(self::$scratch->start[$name]);
      self::$times[$name] += ($time - self::$overhead);
    }
  }  
  
  public static function GetTime($name) {
    $time = null;
    if (isset(self::$times[$name])) {
      $time = self::$times[$name];
      if (!empty(self::$scratch->start[$name]))            
        $time += self::GetTimeDiff(self::$scratch->start[$name], microtime(true));
    }
    return $time;
  }
  
  public static function GetTimeDiff($s, $e) {
    /*
    $start = explode(" ", $s);
    $end = explode(" ", $e);
    return ((float) $end[0] + (float) $end[1]) - ((float) $start[0] + (float) $start[1]);
    */
    return $e - $s;
  }
  
  public static function Display() {
    //if (!self::$enabled) return;

    $ret = "<div id=\"tf_debug_profiler\">\n <table>\n";
    $ret .= "  <tr><th>Name</th><th>#</th><th>Time Total</th><th>Time/execution</th></tr>\n";
    foreach (self::$times as $k=>$t) {
      $ret .= "  <tr><td>$k</td><td>" . self::$count[$k] . "</td><td class=\"timeTotal\">" . sprintf("%.1f", self::GetTime($k) * 1000) . "</td><td class=\"timePerExecution\">" . sprintf("%.1f", (self::GetTime($k) / self::$count[$k]) * 1000) . "</td></tr>\n";
    }
    $ret .= " </table>\n</div>";

    return $ret;
  }
  public static function Log($path, $label=NULL) {

    $ret = "";
    foreach (self::$times as $k=>$t) {
      $ret .= sprintf("%s\t%d\t%.1f\n", $k, self::$count[$k], (self::GetTime($k) * 1000));
    }
    
    $fname = "timing-" . (!empty($label) ? "$label-" : "") . date("YmdHis") . "-" . (rand() % 10000) . ".txt";

    if (!is_dir($path . "/timing")) {
      mkdir($path . "/timing", 0777, true);
    }

    if (($f = fopen("$path/timing/$fname", "w")) !== false) {
      fputs($f, $ret);
      fclose($f);
    } else {
    }
  }
}

