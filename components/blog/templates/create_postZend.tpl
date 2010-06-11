{if $saved}<h4 class="html_form_status_success">Post saved successfully</h4>{/if}
{if $formError == true}
	<p>Error!</p>
  {component name="html.zendForm.error" formHTML=$formHTML}
{else}	
  <p>Regular</p>
  {component name="html.zendForm" modelFile=$modelFile modelClass=$modelClass formConfigType=$formConfigType postCreateCallback=$postCreateCallback formClass=$formClass formname="blogpost" formhandler="blog.create_postZend"}
{/if}