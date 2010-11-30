<form class="mail_account_create" action="account_create">
  <h3>Add Account</h3>
  <input type="hidden" name="account[domain]" value="{$account->domain|escape:html}" />
  <div>
    <input name="account[username]" value="{$account->username|escape:html}" id="mail_account_create_username" /> @ {$account->domain}
  </div>
  <ul class="mail_account_create_typeswitcher" elation:component="ui.toggle" elation:args.formname="accounttype">
    <li class="ui_toggle_panel">
      <input type="radio" name="accounttype" value="forward" id="mail_account_create_type_forward" checked/> <label for="mail_account_create_type_forward">forward</label>
      <div class="mail_account_create_accounttype">
        <label for="mail_account_create_forward">Destination</label> <input name="account[forward]" value="{$account->forward|escape:html}" id="mail_account_create_forward" />
      </div>
    </li>
    <li class="ui_toggle_panel">
      <input type="radio" name="accounttype" value="full" id="mail_account_create_type_full" /> <label for="mail_account_create_type_full">full</label>
      <div class="mail_account_create_accounttype">
        <label for="mail_account_create_pass">Password</label> <input name="account[pass]" type="password" id="mail_account_create_pass" />
        {*<label for="mail_account_create_home">Home</label> <input name="account[home]" value="{$account->home|escape:html}" id="mail_account_create_home" />*}
      </div>
    </li>
  </ul>
  <input type="submit" />
</form>
