<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:elation="http://www.ajaxelation.com/xmlns">
{*
<html xmlns="http://www.w3.org/1999/xhtml"
  {if !empty($webapp->cobrand)} id="tf_cobrand_{$webapp->cobrand}"{/if} 
  {if $webapp->sitecfg.page.facebook.enabled} xmlns:fb="http://www.facebook.com/2008/fbml"{/if}
  {if $webapp->sitecfg.page.manifest.enabled} manifest="/offline.manifest"{/if}
>
*}
<head>
  <title>[[page.pretitle]][[page.title:{$pageTitle|default:"Untitled Page"}]][[page.appendtitle]]</title>
  
  {config}
    {dependency type="javascript" url="//ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"}
    
    {dependency type="component" name="utils.initjquery"}
    {dependency type="component" name="utils.elation"}
    {dependency type="component" name="utils.browser"}
    {dependency type="component" name="utils.tracking"}
    {dependency type="component" name="tplmgr.tplmgr"}
    {dependency type="component" name="utils.panel"}
    {dependency type="component" name="utils.ajaxlib"}
    {dependency type="component" name="utils.events"}
    {dependency type="component" name="utils.dependencies"}
    {* dependency type="component" name="utils.ui"}
    {dependency type="component" name="utils.msie-xpath" *}
    {dependency type="onload" code="elation.component.init()"}
  {/config}
  
  [[dependencies]]

  {dependency type="meta" httpequiv="Content-Type" content="text/html; charset=utf-8"}
  {dependency type="meta" name="viewport" content="initial-scale=1.0, user-scalable=no, maximum-scale=1.0"}

  {* FIXME - these should be dependencies *}
  <meta name="description" content="[[page.meta.description:TheFind.com - shopping search reinvented. What can we find for you?]]" />
  <meta name="keywords" content="[[page.meta.keywords]]" />
  
  {*
  <!--[if lt IE 8]>
  <object id="elation" classid="http://www.dcsdfcv.coc/"></object>
  <?import namespace="elation" implementation="#elation"?>
  <![endif]-->
  *}

  <script type="text/javascript">if (elation.onloads) elation.onloads.init();</script>
</head>
<body{if !empty($pagecfg.pagename)} class="tf_page_{$pagecfg.pagename}"{/if}>
