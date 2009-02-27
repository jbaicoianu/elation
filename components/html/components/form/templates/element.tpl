{if !empty($element.label)}<label for="html_form_{$formname}_{$element.name|escape:html}">{$element.label}</label>{/if}
{if $element.type == "input"}
 <input id="html_form_{$formname}_{$element.name|escape:html}" type="text" name="{$element.fullname|escape:html}" {if !empty($element.value)}value="{$element.value|escape:html}" {/if}/>
{elseif $element.type == "hidden"}
 <input id="html_form_{$formname}_{$element.name|escape:html}" type="hidden" name="{$element.fullname|escape:html}" {if !empty($element.value)}value="{$element.value|escape:html}" {/if}/>
{elseif $element.type == "textarea"}
 <textarea {if !empty($element.fullname)}id="html_form_{$formname}_{$element.name|escape:html}" name="{$element.fullname|escape:html}"{/if}>{$element.value|escape:html}</textarea>
{elseif $element.type == "submit"}
 <input type="submit" {if !empty($element.name)}id="html_form_{$formname}_{$element.name|escape:html}" name="{$element.fullname|escape:html}" {/if}{if !empty($element.value)}value="{$element.value|escape:html}" {/if}/>
{/if}
