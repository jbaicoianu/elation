{dependency name="user.auth"}

<form action="/user/auth" method="post" data-elation-component="user.auth">
  <h2>Log in / sign up</h2>
  {*
  <label for="userid">Email</label> <input name="userid" value="{$userid}">
  <label for="credentials">Password</label> <input name="credentials" type="password">
  *}
  {component name="ui.input" inputname="userid" placeholder="Email" value=$userid}
  {component name="ui.input" inputname="credentials" placeholder="Password" type="password"}
  <input type="submit" value="Authenticate">
</form>
{if $success}<h2 class="state_success">Authenticated successfully</h2>
{else if $failed}<h2 class="state_error">Authentication failed!</h2>{/if}
