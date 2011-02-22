<?
include_once("include/common_funcs.php");
include_once("include/datawrappers/connectionwrapper_class.php");

/**
 * class RemotefileWrapper
 * Returns the contents of any HTTP resource.  Supports GET and POST
 * @package Framework
 * @subpackage Datasources
 */
class RemotefileWrapper extends ConnectionWrapper {
  function Open() {
    return true;
  }

  function Close() {
    return true;
  }
  
  function Query($querid, $query, $postfields=NULL, $extras=NULL) {
    if(!empty($query) && preg_match("/^https?:\/\//",$query)) {
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
      if ($postfields) {
#        $custom_request="POST /boomsvc30/SimpleTxEmail.asmx HTTP/1.1";
#        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $custom_request);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields);
      } else {
        curl_setopt($ch, CURLOPT_HTTPGET, 1);
      }
      if ($extras['timeout']) {
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $extras['timeout']);
      }
      if ($extras['headers']) {
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array($extras['headers']));
      } else {
        curl_setopt($ch, CURLOPT_HEADER, 0);
      }
#echo "[QUERY]".$query."[QUERY]";
#echo "[POSTFIELDS]".$postfields ."[POSTFIELDS]";
#echo "[HEADERS]".$extras['headers']."[HEADERS]";
      Logger::Notice("Remotefile Wrapper requesting URL: $query");
      if (!empty($postfields))
        Logger::Debug($postfields);
      if (!empty($extras['headers']))
        Logger::Debug($extras['headers']);
      $ret = curl_exec($ch);
      if (curl_errno($ch)) {
        $ret=curl_errno($ch)."<br />".curl_error($ch);
        Logger::Error($ret);
      }
      curl_close($ch);
    }
#echo "[RETURN]".($ret)."[RETURN]";
    return $ret;
  }
}

