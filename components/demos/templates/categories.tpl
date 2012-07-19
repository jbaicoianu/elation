  <section class="elation_homepage_demos elation_clear_after">
<ul class="elation_demo_categories">
{foreach from=$categories item=category}
 <li>{component name="demos.category" category=$category}</li>
{/foreach}
</ul>
</section>
{dependency name="demos"}

