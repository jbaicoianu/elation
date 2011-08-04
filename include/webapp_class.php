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

include_once("lib/logger.php");
include_once("lib/profiler.php");
include_once("include/common_funcs.php");
include_once("include/app_class.php");

class WebApp extends App {

  public $orm;
  public $tplmgr;
  public $components;
  public $debug = false;

  function ParseRequest($page=NULL, $post=NULL) {
    Profiler::StartTimer("WebApp::Init - parserequest", 1);
    $webroot = "";
    if ($page === NULL) {
      if (preg_match("/^(.*?)\/index\.php$/", $_SERVER["SCRIPT_NAME"], $m)) {
        $webroot = $m[1];
      }
//print_pre($_SERVER);
      if (isset($_SERVER["PATH_INFO"])) {
        $page = $_SERVER["PATH_INFO"];
        $webroot = $_SERVER["SCRIPT_NAME"];
      } else if (isset($_SERVER["SCRIPT_URL"])) {
        $page = $_SERVER["SCRIPT_URL"];
      } else if (empty($_SERVER["REDIRECT_URL"])) {
        $webroot = $_SERVER["SCRIPT_NAME"];
        $page = "/";
      } else {
        $page = preg_replace("/" . preg_quote($webroot, "/") . "(.*?)(\?.*)?$/", "$1", $_SERVER["REQUEST_URI"]);
        if ($page == "/index.php") {
          $page = "/";
        }
      }
    }
    if ($post === NULL) {
      $post = array();
    }
    if (!empty($_GET)) {
      $post = array_merge($post, $_GET);
    }
    if (!empty($_POST)) {
      $post = array_merge($post, $_POST);
    }

    $req = @parse_url($page); // FIXME - PHP sucks and throws a warning here on malformed URLs, with no way to catch as an exception

    if (!empty($req["query"]))
      parse_str($req["query"], $req["args"]);
    else
      $req["args"] = array();

    if (!empty($post)) {
      if (get_magic_quotes_gpc ()) {
        $post = array_map('stripslashes_deep', $post);
      }
      $req["args"] = array_merge($req["args"], $post);
    }
    $req["friendly"] = false;
    // Parse friendly URLs
    if (preg_match_all("/\/([^-\/]+)-([^\/]+)/", $req["path"], $m, PREG_SET_ORDER)) {
      $req["friendly"] = true;
      $friendlyargs = array();
      foreach ($m as $match) {
        $search[] = $match[0];
        $replace[] = "";
        array_set($friendlyargs, $match[1], decode_friendly($match[2]));
      }
      $req["path"] = str_replace($search, $replace, $req["path"]);
      if (empty($req["path"]))
        $req["path"] = "/";
      if (!empty($friendlyargs))
        $req["args"] = array_merge($friendlyargs, $req["args"]);
    }

    $req["host"] = $_SERVER["HTTP_HOST"];
    $req["ssl"] = !empty($_SERVER["HTTPS"]);
    $req["scheme"] = "http" . ($req["ssl"] ? "s" : "");
    $req["ip"] = $_SERVER["REMOTE_ADDR"];
    $req["user_agent"] = $_SERVER['HTTP_USER_AGENT'];
    $req["referrer"] = $_SERVER["HTTP_REFERER"];
    if (!empty($_SERVER["HTTP_REFERER"])) {
      $req["referer"] = parse_url($_SERVER["HTTP_REFERER"]);
      if (!empty($req["referer"]["query"]))
        parse_str($req["referer"]["query"], $req["referer"]["args"]);
      else
        $req["referer"]["args"] = array();
    }  

    if (!empty($_SERVER["PHP_AUTH_USER"]))
      $req["user"] = $_SERVER["PHP_AUTH_USER"];
    if (!empty($_SERVER["PHP_AUTH_PW"]))
      $req["password"] = $_SERVER["PHP_AUTH_PW"];

    $req["basedir"] = $webroot;
    $req["baseurl"] = $req["scheme"] . "://" . $req["host"] . $req["basedir"];
    //$req["url"] = $req["baseurl"] . $page;
    $req["url"] = $req["baseurl"] . $_SERVER["REQUEST_URI"]; // FIXME - This probably breaks non-root-level installs...

    if ($req["basedir"] == '/') {
      $req["basedir"] = '';
    }

    if (!empty($req["args"]["req"])) {
      array_set_multi($req, $req["args"]["req"]);
    }
    Profiler::StopTimer("WebApp::Init - parserequest");
    return $req;
  }
}
