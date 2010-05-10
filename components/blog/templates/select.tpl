<form method="get">
 <select name="blogname">
  {foreach from=$blogs item=blog}
   <option value="{$blog->name}">{$blog->title}</option>
  {/foreach}  
 </select>
 <input type="submit" />
</form>
