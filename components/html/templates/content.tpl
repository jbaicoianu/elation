{if !empty($contenttemplate)}{include file=$contenttemplate}
{elseif !empty($contentcomponent)}{component name=$contentcomponent componentargs=$contentargs}
{else}{$content}{/if}
