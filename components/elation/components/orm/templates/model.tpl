{dependency name="ui.window"}
{dependency name="ui.draggable"}
{dependency name="utils.dust"}
{dependency name="utils.template"}
{dependency name="elation.orm.class"}

{foreach from=$classes key=classname item=classdef}
  {component name="elation.orm.class" classname=$classname classdef=$classdef}
{/foreach}
{set var="page.title"}ORM Model Editor{if !empty($model)} - {$model}{/if}{/set}
