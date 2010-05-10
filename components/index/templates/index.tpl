{component name="html.header"}

  <div id="container">
    {* component name="utils.navigation" *}
    {* component name="utils.status" *}
    <div id="index_content">
      {component name=$contentcomponent componentargs=$args}
    </div>
  </div>

{component name="html.footer"}
