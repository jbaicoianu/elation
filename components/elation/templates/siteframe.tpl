{component name="html.header"}
{* dependency type="component" name="elation" *}
{set var="page.title"}Elation Client/Server MVC Framework{/set}

<div id="container">
  {component name="elation.header"}

  {component name="html.content" content=$content}

</div>

{component name="html.footer"}
