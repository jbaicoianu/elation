<a class="mail_account mail_account_type_{if empty($account->active)}inactive{elseif !empty($account->forward)}forward{else}full{/if}" href="mailto:{$account->username}@{$account->domain}">{$account->username}@{$account->domain}</a>

{if !empty($account->forward)}Forward: {$account->forward} {/if}
