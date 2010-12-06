{printpre var=$content}
{if !empty($contentcomponent)}{component name=$contentcomponent componentargs=$contentargs}
{else}{$content}{/if}
