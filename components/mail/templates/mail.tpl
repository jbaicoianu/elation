{component name="html.header"}
{dependency type="component" name="utils.ui"}
{dependency type="component" name="mail"}
<script type="text/javascript">
elation.onloads.add(function() {ldelim} elation.component.init(); {rdelim});
</script>
<div id="mail_dashboard" class="ui_clear_after">
  <h1>Mail Account Manager</h1>
  <div class="mail_sidebar">
    {component name="mail.domains"}
  </div>

  {if !empty($domainname)}
    <div class="mail_main">
      {component name="mail.domain" domainname=$domainname showaccounts=1}
    </div>
  {/if}
</div>
{component name="html.footer"}
