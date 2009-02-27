<form method="get" class="html_form">
 <ul class="html_form_elements">
  {foreach from=$elements item=element}
   <li>{component name="html.form.element" element=$element formname=$formname}</li>
  {/foreach}
 </ul>
 <input type="hidden" name="_predispatch[{$dispatchname}]" value="blog.posts.create" />
</form>
