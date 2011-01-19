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

if (file_exists_in_path('Zend/Loader/Autoloader.php')) {
  include_once "Zend/Loader/Autoloader.php";
}

class WebApp extends App {

  public $orm;
  public $tplmgr;
  public $components;
  public $debug = false;

  function ParseRequest($page=NULL, $post=NULL) {
    Profiler::StartTimer("WebApp::Init - parserequest", 1);
    $webroot = "";
    if ($page === NULL)
      $page = $_SERVER["SCRIPT_URL"];
    if ($page === NULL) {
      if (preg_match("/^(.*?)\/go\.php$/", $_SERVER["SCRIPT_NAME"], $m)) {
        $webroot = $m[1];
      }
      $page = preg_replace("/" . preg_quote($webroot, "/") . "(.*?)(\?.*)?$/", "$1", $_SERVER["REQUEST_URI"]);
    }
    if ($post === NULL)
      $post = &$_REQUEST;

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
    $req["referer"] = $_SERVER["HTTP_REFERER"];

    if (!empty($_SERVER["PHP_AUTH_USER"]))
      $req["user"] = $_SERVER["PHP_AUTH_USER"];
    if (!empty($_SERVER["PHP_AUTH_PW"]))
      $req["password"] = $_SERVER["PHP_AUTH_PW"];

    $req["basedir"] = $webroot;
    $req["baseurl"] = $req["scheme"] . "://" . $req["host"] . $req["basedir"];
    $req["url"] = $req["baseurl"] . $req["path"];

    if ($req["basedir"] == '/') {
      $req["basedir"] = '';
    }

    if (!empty($req["args"]["req"])) {
      array_set_multi($req, $req["args"]["req"]);
    }
    Profiler::StopTimer("WebApp::Init - parserequest");

    Profiler::StartTimer("WebApp::Init - handleredirects", 1);
    $rewritefile = $this->locations["config"] . "/redirects.xml";
    if (file_exists($rewritefile)) {
      $rewrites = new SimpleXMLElement(file_get_contents($rewritefile));
      $req = $this->ApplyRedirects($req, $rewrites->rule);
    }
    Profiler::StopTimer("WebApp::Init - handleredirects");

    if (!empty($req["contenttype"]))
      $this->response["type"] = $req["contenttype"];

    return $req;
  }

  function ApplyRedirects($req, $rules) {
    $doRedirect = false;

    foreach ($rules as $rule) {
      //if (!empty($rule->match)) { // FIXME - Never ever upgrade to PHP 5.2.6.  It breaks empty() on SimpleXML objects.
      if ($rule->match) {
        $ismatch = true;
        $isexcept = false;
        $matchvars = array(NULL); // Force first element to NULL to start array indexing at 1 (regex-style)

        foreach ($rule->match->attributes() as $matchkey => $matchstr) {
          $checkstr = array_get($req, $matchkey);
          if ($checkstr !== NULL) {
            $m = NULL;
            if (substr($matchstr, 0, 1) == "!") {
              $ismatch &= ! preg_match("#" . substr($matchstr, 1) . "#", $checkstr, $m);
            } else {
              $ismatch &= preg_match("#" . $matchstr . "#", $checkstr, $m);
            }

            //Logger::Debug("Check rewrite (%s): '%s' =~ '%s' ? %s", $matchkey, $checkstr, $matchstr, ($ismatch ? "YES" : "NO"));
            if (is_array($m) && count($m) > 0) {
              if (count($m) > 1) {
                for ($i = 1; $i < count($m); $i++) {
                  $matchvars[] = $m[$i];
                }
              }
            }
          } else {
            if (substr($matchstr, 0, 1) != "!")
              $ismatch = false;
          }
        }
        if ($ismatch && !empty($rule->except)) {
          $exceptflag = true;
          foreach ($rule->except->attributes() as $exceptkey => $exceptstr) {
            $checkstr = array_get($req, $exceptkey);
            if ($checkstr !== NULL) {
              $m = NULL;
              if (substr($exceptstr, 0, 1) == "!") {
                $exceptflag &= ! preg_match("#" . substr($exceptstr, 1) . "#", $checkstr, $m);
              } else {
                $exceptflag &= preg_match("#" . $exceptstr . "#", $checkstr, $m);
              }
            }
          }
          if ($exceptflag)
            $isexcept = true;
        }
        if ($ismatch && !$isexcept) {
          // Apply nested rules first...
          if (!empty($rule->rule)) {
            $req = $this->ApplyRedirects($req, $rule->rule);
          }
          // Then process "set" command
          if (!empty($rule->set)) {
            Logger::Info("Applying redirect:\n   " . $rule->asXML());
            if (!empty($req["args"]["testredir"]))
              print "<pre>" . htmlspecialchars($rule->asXML()) . "</pre><hr />";

            foreach ($rule->set->attributes() as $rewritekey => $rewritestr) {
              if (count($matchvars) > 1 && strpos($rewritestr, "%") !== false) {
                $find = array(NULL);
                for ($i = 1; $i < count($matchvars); $i++)
                  $find[] = "%$i";

                $rewritestr = str_replace($find, $matchvars, $rewritestr);
              }
              array_set($req, (string) $rewritekey, (string) $rewritestr);
            }
            if ($rule["type"] == "redirect") {
              $doRedirect = 301;
            } else if ($rule["type"] == "bounce") {
              $doRedirect = 302;
            }
          }
          // And finally process "unset"
          if (!empty($rule->unset)) {
            $unset = false;
            foreach ($rule->unset->attributes() as $unsetkey => $unsetval) {
              if ($unsetkey == "_ALL_" && $unsetval == "ALL") {
                $req["args"] = array();
              } else if (!empty($unsetval)) {
                $reqval = array_get($req, $unsetkey);
                if ($reqval !== NULL) {
                  array_unset($req, $unsetkey);
                  $unset = true;
                }
              }
            }
            if ($unset) {
              if ($rule["type"] == "redirect") {
                $doRedirect = 301;
              } else if ($rule["type"] == "bounce") {
                $doRedirect = 302;
              }
            }
          }
          if ($doRedirect !== false)
            break;
        }
      }
    }

    if ($doRedirect !== false) {
      $origscheme = "http" . ($req["ssl"] ? "s" : "");
      if ($req["host"] != $_SERVER["HTTP_HOST"] || $req["scheme"] != $origscheme) {
        $newurl = sprintf("%s://%s%s", $req["scheme"], $req["host"], $req["path"]);
      } else {
        $newurl = $req["path"];
      }
      if (empty($req["args"]["testredir"])) {
        if (empty($req["friendly"])) {
          $querystr = makeQueryString($req["args"]);
          $newurl = http_build_url($newurl, array("query" => $querystr));
        } else {
          $newurl = makeFriendlyURL($newurl, $req["args"]);
        }

        if ($newurl != $req["url"]) {
          http_redirect($newurl, NULL, true, $doRedirect);
        }
      } else {
        print_pre($req);
      }
    }

    return $req;
  }

}
