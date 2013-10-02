    {* FIXME - to be replaced by the general-purpose demos component *}
    <section class="elation_demo" id="elation_demo_{$demo}" elation:component="elation.demo" elation:args.demo="{$demo}" elation:args.image="{$image}">
      <a class="elation_demo_link" href="{$url|default:'#'}">
        <div class="elation_demo_content">
          <img src="{$image}" />
        </div>
        <h3>{$demo}</h3>
      </a>
    </section>

