<?
class DNSResolver {
  protected static $initialized = false;
  protected static $ttl = NULL;
  protected static $cache = true;
  protected static $domain = "";
  protected static $search = array();

  public static function init() {
    if (!self::$initialized) {
      $cfg = ConfigManager::singleton();
      if (isset($cfg->servers["dnsresolver"]["ttl"]))
        self::$ttl = $cfg->servers["dnsresolver"]["ttl"];
      if (isset($cfg->servers["dnsresolver"]["cache"]))
        self::$cache = $cfg->servers["dnsresolver"]["cache"];
  
      // parse /etc/resolv.conf to get domain/search suffixes
      if (file_exists("/etc/resolv.conf")) {
        $resolv = file("/etc/resolv.conf");
        for ($i = 0; $i < count($resolv); $i++) {
          if (preg_match("/^\s*(.*?)\s+(.*)\s*$/", $resolv[$i], $m)) {
            switch($m[1]) {
              case 'domain':
                self::$domain = $m[2];
                array_unshift(self::$search, self::$domain);
                break;
              case 'search':
                self::$search[] = $m[2];
                break;
            }
          }
        }
        self::$search[] = "";
      }
      self::$initialized = true;
    }
  }
  public static function lookup($hostname) {
    self::init();
    $data = DataManager::singleton();
    $records = $apc = NULL;
    $cachekey = "dnsresolver.lookup.{$hostname}";
    if (self::$cache && !empty($data->caches["apc"]) && $data->caches["apc"]->enabled) {
      $apc = $data->caches["apc"]["default"];
      $cached = $apc->get($cachekey);
      if ($cached !== false) {
        $records = unserialize($cached);
        Logger::Info("DNSResolver: found '$hostname' in APC cache");
      }
    }
    if ($records === NULL) {
      Logger::Warn("DNSResolver: Looking up '$hostname'");
      
      foreach (self::$search as $suffix) {
        $fqdn = $hostname . (!empty($suffix) ? "." . $suffix : "");
        $records = dns_get_record($fqdn, DNS_A);
        if (!empty($records))
          break;
      }
      if (self::$cache && !empty($records) && $apc !== NULL && $apc->enabled) {
        $ttl = any(self::$ttl, $records[0]["ttl"]);
        $apc->set($cachekey, serialize($records), array("lifetime" => $ttl));
      }
    }
    return $records;
  }
  public static function first($hostname) {
    $records = self::lookup($hostname);
    return ($records ? $records[0]['ip'] : NULL);
  }
  public static function any($hostname) {
    $records = self::lookup($hostname);
    if ($records) {
      return $records[rand(0, count($records)-1)]['ip'];
    }
  }
}
