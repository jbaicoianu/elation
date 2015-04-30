<?php
require_once("PHPUnit/Framework.php");
include_once("lib/logger.php");
include_once("lib/profiler.php");
include_once("include/common_funcs.php");
include_once("include/datamanager_class.php");

class DataManagerTest extends PHPUnit_Framework_TestCase {
  
  public $servers = array(
    "sources" => array(
      "db" => array(
        "default" => array(
          "driver" => "sqlite",
          "file" => "tmp/unittest.sqlite"
        ),
        "unittest" => array(
          "driver" => "sqlite",
          "file" => "tmp/test.sqlite"
        )
      )
    )
  );
  public $data;

  public function setUp() {
    $cfg->servers = $this->servers;
    $data = DataManager::singleton($cfg);
  }

  /**
    * Test creation of tables
    *
    * @dataProvider providerOfTables
    */
  public function testCreate($table) {
    $q = DataManager::QueryCreate($table["keyprefix"].".unittest.testcreate", $table["name"], $table["schema"]);
    $this->assertTrue($q, "Create table '{$table["name"]}'");
  }
  /**
    * Test insertion of data into table
    *
    * @dataProvider providerOfTables
    */
  public function testInsert($table) {
    for ($i = 1; $i <= count($table["rows"]); $i++) { 
      $q = DataManager::QueryInsert($table["keyprefix"].".testinsert", $table["name"], $table["rows"][$i-1]);
      $this->assertEquals($q, $i, "Number of rows in '{$table["name"]}' is $q after $i inserts");
    }
  }
  /**
    * Test selection of data, caching enabled
    *
    * @dataProvider providerOfTables
    */
  public function testSelect($table) {
    $q = DataManager::Query($table["keyprefix"].".select.all", "SELECT * FROM {$table["name"]}");
    $this->assertEquals($q->numrows, count($table["rows"]), "Check that rows returned by select is right ({$q->numrows} == " . count($table["rows"]) . ")");

    // Compare each row against the expected original value
    for ($i = 0; $i < $q->numrows; $i++) {
      foreach ($table["rows"][$i] as $k=>$v) {
        $this->assertEquals($q->rows[$i]->{$k}, $v, "Check value for '$k' in row $i of {$table["name"]} is equal ('{$q->rows[$i]->{$k}}' == '$v')");
      }
    }
    
  }
  /**
    * Test updating data
    *
    * @dataProvider providerOfTables
    */
  public function testUpdate($table) {
    foreach ($table["updates"] as $update) {
      $where = "";
      foreach ($update[1] as $k=>$v) {
        $where .= (!empty($where) ? " AND " : "") . "$k='$v'";
      }
      $q = DataManager::QueryUpdate($table["keyprefix"].".select.alls", $table["name"], $update[0], $where);
      $this->assertSame($q, true);
    }
  }
  /**
    * Test selecting data after it has been updated
    *
    * @dataProvider providerOfTables
    */
  public function testSelectAfterUpdate($table) {
    $q = DataManager::Query($table["keyprefix"].".select.all", "SELECT * FROM {$table["name"]}");
    $this->assertEquals($q->numrows, count($table["rows"]), "Check that rows returned by select is right ({$q->numrows} == " . count($table["rows"]) . ")");

    // Build a list of expected values so we have something to compare against
    $expected = $table["rows"];
    foreach ($table["updates"] as $update) {
      for ($i = 0; $i < count($expected); $i++) {
        $equals = true;
        foreach ($update[1] as $k=>$v) {
          $equals = $equals && $expected[$i][$k] == $v;
        }
        if ($equals) {
          foreach ($update[0] as $k=>$v) {
            $expected[$i][$k] = $v;
          }
        }
      }
    }

    // Compare each row against the expected original value
    for ($i = 0; $i < $q->numrows; $i++) {
      foreach ($expected[$i] as $k=>$v) {
        $this->assertEquals($q->rows[$i]->{$k}, $v, "Check value for '$k' in row $i of {$table["name"]} is equal ('{$q->rows[$i]->{$k}}' == '$v')");
      }
    }
  }
  /**
    * Test deleting all data from a table
    *
    * @dataProvider providerOfTables
    */
  public function testDelete($table) {
    $q = DataManager::QueryDelete($table["keyprefix"].".select.all", $table["name"]);
    $this->assertTrue($q, "Delete all rows from '{$table["name"]}'");
    $qcount = DataManager::Query($table["keyprefix"]."count", "SELECT COUNT(*) AS cnt FROM {$table["name"]}");
    $this->assertEquals($qcount->rows[0]->cnt, 0, "Check no rows still exist in '{$table["name"]}'");
  }
  public function testDrop() {
    // TODO - test and functionality both need to be implemented
    if (file_exists($this->servers["sources"]["db"]["default"]["file"])) {
      unlink($this->servers["sources"]["db"]["default"]["file"]);
    }
    $this->assertTrue(false, "Drop functionality still needs to be implemented!");
  }

  public function providerOfTables() {
    $tables = array(
      array(
        array(
          "keyprefix" => "db.unittest.testtable",
          "name" => "testtable",
          "schema" => array(
            "col1 TEXT NOT NULL", 
            "col2 INTEGER NOT NULL DEFAULT 0"
          ),
          "rows" => array(
            array("col1" => "first row", "col2" => 1),
            array("col1" => "second row", "col2" => 2),
            array("col1" => "third row", "col2" => 3),
          ),
          "updates" => array(
            // Format is: array($updatearray, $wherestatement)
            array(array("col1" => "original row"), array("col2" => 1)),
            array(array("col1" => "middle row"), array("col2" => 2)),
            array(array("col1" => "last row"), array("col2" => 3)),
          )
        )
      )
    );
    return $tables;
  }
}

