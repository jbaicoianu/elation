{component name="html.header"}
<h2>Database/ORM Manager{if !empty($model)} - {$model}{/if}</h2>

{component name="elation.orm.models" model=$model}

{if !empty($error)}<h4 class="error">{$error|escape:html}</h4>{/if}
{if !empty($success)}<h4 class="success">{$success|escape:html}</h4>{/if}

{if !empty($ormcfg)}
 {component name="elation.orm.view" model=$model ormcfg=$ormcfg}
{/if}

{component name="html.footer"}
