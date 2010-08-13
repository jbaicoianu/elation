<div class="navigation_location">
{if !empty($location)}
 {if !empty($location->photo_url)}<img class="navigation_location_logo" src="{$location->photo_url}" />{/if}
 <div class="navigation_location_info">
   <h3>{$location->name}</h3>
   <address>
    {$location->address1}<br />
    {if !empty($location->address2)}
     {$location->address2}<br />
    {/if}
    {$location->city}, {$location->state} {$location->zip}<br />
   </address>
   {if !empty($location->rating_img_url)}<img src="{$location->rating_img_url}"/>{/if}
   <div style="font-size: .8em; font-style: italic;">
    {foreach name=categories from=$location->categories item=category}
     {$category->name}{if !$smarty.foreach.categories.last}, {/if} 
    {/foreach}
   </div>
 </div>
 <ul class="navigation_location_commands">
  <li><a href="#">Remember This</a></li>
  <li><a href="#">Take Me Here</a></li>
 </ul>
{else}
 <h4 class="error">Could not find information for the specified location</h4>
{/if}
</div>
