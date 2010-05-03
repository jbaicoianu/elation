{component name="html.header"}
<h2>Database/ORM Manager</h2>

{component name="orm.models" model=$model}

{if !empty($error)}<h4 class="error">{$error|escape:html}</h4>{/if}
{if !empty($success)}<h4 class="success">{$success|escape:html}</h4>{/if}

{if !empty($ormcfg)}
 {component name="orm.view" ormcfg=$ormcfg}
{/if}

{component name="html.footer"}
