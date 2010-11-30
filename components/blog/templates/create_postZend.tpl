{if $formError} 
	<p>Errors:</p>
  {if $subjectErrors}
  	<p>Subject Errors:</p>
		<ul>
		 {foreach from=$subjectErrors item=error}
		   <li>{$error}</li>
			{/foreach}
	  </ul>
	{/if}
	{if $contentErrors}
		<p>Content Errors:</p>
	  <ul>
	   {foreach from=$contentErrors item=error}
	     <li>{$error}</li>
	    {/foreach}
	  </ul>
  {/if}
	<br /><br />
{/if}
{$blogForm}