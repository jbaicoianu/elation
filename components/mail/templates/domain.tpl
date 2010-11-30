{if $showaccounts}
  <h2 class="mail_domain">{$domain->domain}</h2>
  <h3>Accounts</h3>
  {component name="mail.accounts" accounts=$accounts}
{else}
  <a href="?domain={$domain->domain}" class="mail_domain">{$domain->domain}</a>
{/if}
