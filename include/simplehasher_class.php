<?php

class SimpleHasher {
  private $buckets;
  private $bucketcount;

  public function __construct($buckets) {
    $this->buckets = $buckets;
    $this->bucketcount = count($this->buckets);
  }
  public function hash($str) {
    return md5int24($str);
  }

  public function lookupList($str, $num=1) {
    $position = $this->hash($str);
    //print_pre($this->buckets);
    $bucket = $this->buckets[$position % $this->bucketcount];
    $ret = array();
    foreach ($bucket["servers"] as $server) {
      $ret[] = new HashShard($bucket["name"], $server);
    }
    return $ret;
  }
}
/**
 * class HashShard
 * Represents a database shard and the server it's located on
 * @package Framework
 * @subpackage Utils
 */
class HashShard {
  public $shard;
  public $server;

  function __construct($shard, $server) {
    $this->shard = $shard;
    $this->server = $server;
  }
}
