{if !empty($success)}<h2>Success</h2>{/if}
<form class="elation_demos_create">
 <ul>
  {if $varname == "newdemo"}
    <li><label for="demoname">Name:</label> <input id="demoname" name="{$varname}[demoname]" value="{$demo.demoname|escape:html}" /></li>
  {else}
    <li><label for="category">Category:</label> <input id="category" name="{$varname}[category]" value="{$demo.category|escape:html}" /></li>
  {/if}
  <li><label for="demo_title">Title:</label> <input id="demo_title" name="{$varname}[title]" value="{$demo.title|escape:html}" /></li>
  <li><label for="demo_image">Image:</label> <input id="demo_image" name="{$varname}[image]" value="{$demo.image|escape:html}" /></li>
  <li><label for="demo_url">URL:</label> <input id="demo_url" name="{$varname}[url]" value="{$demo.url|escape:html}" /></li>
  {if $varname == "newdemo"}
    <li><label for="demo_category">Category:</label> <input id="demo_category" name="{$varname}[category]" value="{$demo.category|escape:html}" /></li>
  {/if}
  <li><label for="demo_description">Description:</label> <textarea id="demo_description" name="{$varname}[description]">{$demo.description|escape:html}</textarea></li>
 </ul>
 <input type="submit" />
</form>
{dependency name="demos.create"}
