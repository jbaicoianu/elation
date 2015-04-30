<?php
include_once("include/common_funcs.php");
include_once("include/datawrappers/connectionwrapper_class.php");

/**
 * class XMLRPCWrapper
 * Make XMLRPC requests
 * @package Framework
 * @subpackage Datasources
 */
class XMLRPCWrapper extends ConnectionWrapper {
  function Open() {
    return true;
  }

  function Close() {
    return true;
  }
  
  function Query($queryid, $method, $args=NULL, $extras=NULL) {
    $request = "";
    if (is_array($method)) {
      foreach ($method as $m) {
        foreach ($m as $k=>$v) {
          $request .= xmlrpc_encode_request($k, $v);
        }
      }
    } else {
      $request = xmlrpc_encode_request($method, $args);
    }
    //print_pre($request);
    $context = stream_context_create(array('http' => array(
                                                           'method' => "POST",
                                                           'header' => "Content-Type: text/xml",
                                                           'content' => $request
                                                           )));
    
    $file = file_get_contents($this->cfg["url"], false, $context);
    $response = xmlrpc_decode($file);
    if (xmlrpc_is_fault($response)) {
      trigger_error("xmlrpc: $response[faultString] ($response[faultCode])");
    } else {
      $ret = $response;
    }
    return $ret;
  }
}

