{component name="html.header"}
{dependency type="component" name="elation"}
{set var="page.title"}Elation Client/Server MVC Framework{/set}

<div id="container">
  <h1><a href="/">Elation</a></h1>

  {component name="elation.navigation"}

  {component name="html.content" content=$content}

</div>

{component name="html.footer"}
