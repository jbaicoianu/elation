    <div class="elation_demo" id="elation_demo_{$category.category}" elation:component="elation.democategory" elation:args.category="{$category.category}" elation:args.image="{$category.image}">
      <img src="{$category.image}" />
      <div class="elation_demo_content">
        <h3>{$category.title}</h3>
        {if !empty($category.description)}{$category.description}{/if}
      </div>
      {if !empty($category.url)}
        <a class="elation_demo_link elation_button_large" href="{$category.url}">See it</a>
      {/if}
    </div>

