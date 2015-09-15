<!DOCTYPE html>
<html>
  <head>
    <title>[[page.pretitle]][[page.title:{$pageTitle|default:"Untitled Page"}]][[page.appendtitle]]</title>
    {config}
      {* dependency type="javascript" url="//ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js" *}
      {* dependency type="component" name="utils.initjquery" *}
      {dependency type="component" name="utils.elation"}
      {dependency type="component" name="utils.events"}
{*
      {dependency type="component" name="utils.browser"}
      {dependency type="component" name="utils.native"}
      {dependency type="component" name="utils.tracking"}
      {dependency type="component" name="tplmgr.tplmgr"}
      {dependency type="component" name="utils.panel"}
      {dependency type="component" name="utils.ajaxlib"}
      {dependency type="component" name="utils.dependencies"}
*}
      {if !empty($theme)}{dependency type="component" name="ui.themes.`$theme`"}{/if}
      {* dependency type="component" name="utils.ui"}
      {dependency type="onload" code="elation.component.init()"}
      {dependency type="meta" httpequiv="Content-Type" content="text/html; charset=utf-8"}
      {* dependency type="meta" name="viewport" content="initial-scale=1.0, user-scalable=yes, maximum-scale=5.0" *}
      {dependency type="meta" name="viewport" content="initial-scale=1.0, user-scalable=no, maximum-scale=1.0, width=device-width"}
    {/config}
[[dependencies]]
    {if $tracking.enabled}{component name="tracking.autotrack"}{/if}

    <script type="text/javascript">if (elation.onloads) elation.onloads.init();</script>
  </head>
  <body class="{if !empty($pagecfg.pagename)}page_{$pagecfg.pagename}{/if}{if !empty($theme)} {$theme}{/if}">
