    {dependency name="demos"}

    <div class="elation_demo" id="elation_demo_{$demo.demoname}" elation:component="elation.demo" elation:args.demo="{$demo.demoname}" elation:args.image="{$demo.image}">
      <img src="{$demo.image}" />
      <div class="elation_demo_content">
        <h3>{$demo.title}</h3>
        {if !empty($demo.description)}{$demo.description}{/if}
      </div>
      {if !empty($demo.url)}
        <a class="elation_demo_link elation_button_large" href="{$demo.url}">See it</a>
      {/if}
    </div>

