<dl>
 <dt>{$word|escape:html}</dt>
 {foreach from=$definitions item=def}
  <dd>{$def|escape:html|nl2br}</dd>
 {/foreach}
</dl>
   
