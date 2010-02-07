{if $toplevel}
  <form action="/navigation/location_categories" method="post" id="navigation_location_categories">
{/if}
<ul class="ui_scrollable">
 {foreach from=$root->children item=category}
  <li data="key:'{$category->categoryid}', select: '{$category->enabled|default:0}'">
    {*<input type="checkbox" name="showcategory[{$category->categoryid}]" value="1" id="navigation_location_category_{$category->categoryid}" {if !empty($category->enabled)}checked="checked"{/if} /> <label for="navigation_location_category_{$category->categoryid}">{$category->name}</label>*}
    {$category->name}
    {if !empty($category->children)}
      {component name="navigation.location_categories" root=$category}
    {/if}
  </li>
 {/foreach}
</ul>
{if $toplevel}
</form>

<script type="text/javascript">
{literal}
 var scrollcategories = new elation.ui.scrollable(carpc, { 'element': document.getElementById('navigation_location_categories') });
 var setSelectedCategories = function(dtnode) {
   var s = dtnode.tree.getSelectedNodes(true);
   var catstring = "";
   for (var i = 0; i < s.length; i++) {
     catstring += (catstring != "" ? " " : "") + s[i].data.key;
   }
   ajaxlib.Get("/navigation/location_categories?showcategory=" + encodeURIComponent(catstring));
 }
 $("#navigation_location_categories").dynatree({checkbox: true, 
                                                persist: true,
                                                clickFolderMode: 3,
                                                selectMode: 3,
                                                debugLevel: 0,
                                                onSelect: function(select, dtnode) { setSelectedCategories(dtnode); },
                                                onActivate: function(dtnode) { dtnode.toggleSelect(); },
                                               });
{/literal}
</script>
{/if}
