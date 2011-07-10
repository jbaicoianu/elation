[
{foreach from=$components item=c name=components}
  {jsonencode var=$c}{if !$smarty.foreach.components.last},{/if} 
{/foreach}
]
