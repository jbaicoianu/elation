class RESTWrapper extends ConnectionWrapper {
  function Open() {
    return (!empty($this->cfg["host"]));
  }

  function Close() {
    return true;
  }
  
  function Query($queryid, $query, $urlargs=array(), $extras=NULL) {
      $url = "http://" . $this->cfg["host"] . $query;
      $timeout = any($extras['timeout'], $this->cfg["timeout"]);

    if (!empty($this->cfg["urlargs"]))
      $urlargs = array_merge($this->cfg["urlargs"], $urlargs);
       
    if (!empty($urlargs)) {
      $url .= "?" . http_build_query($urlargs);
    }
    Logger::Info("RESTWrapper requesting URL '$url'");

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch, CURLOPT_HTTPGET, 1);

    if (!empty($timeout))
      curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

    if ($extras['headers']) {
      curl_setopt($ch, CURLOPT_HEADER, 1);
      curl_setopt($ch, CURLOPT_HTTPHEADER, array($extras['headers']));
    } else {
      curl_setopt($ch, CURLOPT_HEADER, 0);
    }
#echo "[QUERY]".$query."[QUERY]";
#echo "[POSTFIELDS]".$postfields ."[POSTFIELDS]";
#echo "[HEADERS]".$extras['headers']."[HEADERS]";

    Logger::Notice("REST Wrapper requesting URL: $url");
    if (!empty($extras['headers']))
      Logger::Debug($extras['headers']);
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
      $response = curl_errno($ch)."<br />".curl_error($ch);
      Logger::Error($ret);
    }
    curl_close($ch);
    switch($this->cfg["format"]) {
      case 'json':
        return json_decode($response, true);
      case 'xml':
        $xml = new SimpleXMLElement($response);
        return simplexml_to_array($xml);
      default:
        return $response;
    }
  }
}

