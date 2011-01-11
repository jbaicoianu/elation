<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:elation="http://www.ajaxelation.com/xmlns">
<head>
  <title>[[page.pretitle]][[page.title:{$pageTitle|default:"Untitled Page"}]][[page.appendtitle]]</title>
  
  {config}
    {dependency type="javascript" url="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"}
    {dependency type="component" name="utils.initjquery"}
    {dependency type="component" name="utils.elation"}
    {dependency type="component" name="utils.browser"}
    {dependency type="component" name="tplmgr.tplmgr"}
    {dependency type="component" name="utils.panel"}
    {dependency type="component" name="utils.ajaxlib"}
    {dependency type="component" name="utils.events"}
    {dependency type="component" name="utils.dependencies"}
    {dependency type="component" name="utils.ui"}
    {dependency type="component" name="utils.msie-xpath"}
    
    {*
    DependencyManager::add("jstemplate", array("name" => "tplmgr.tflightbox", "component" => "tplmgr/tflightbox.tpl"));
    DependencyManager::add("jstemplate", array("name" => "tplmgr.tfinfobox.closebutton", "component" => "/tplmgr/tfinfobox_closebutton.tpl"));
    *}
    
    {dependency type="jstemplate" name="ui.infobox" component="ui.infobox"}
    {dependency type="jstemplate" name="ui.lightbox" component="ui.lightbox"}
    {dependency type="jstemplate" name="ui.infobox_titlebar" component="ui.infobox_titlebar"}

  {/config}
  
  [[dependencies]]
  <meta name="viewport" content="initial-scale=1.0, user-scalable=no, maximum-scale=1.0" />
  
  {*
  <!--[if lt IE 8]>
  <object id="elation" classid="http://www.dcsdfcv.coc/"></object>
  <?import namespace="elation" implementation="#elation"?>
  <![endif]-->
  *}
  
</head>
<body{if !empty($page)} class="tf_page_{$page}"{/if}>
