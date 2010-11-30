{if $saved}<h4 class="html_form_status_success">Post saved successfully</h4>{/if}
{component name="html.form" obj=$post elements=$elements formname="blogpost" formhandler="blog.create_post"}
