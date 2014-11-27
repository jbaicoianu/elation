{dependency name="user.auth"}

<form action="/user/auth" method="post" data-elation-component="user.auth">
  <h2><span class="user_auth_label_login">Log in</span> / <span class="user_auth_label_signup">sign up</span></h2>
  {component name="ui.input" inputname="userid" placeholder="Username" value=$userid autofocus=true}
  {component name="ui.input" inputname="credentials" placeholder="Password" type="password"}
  {component name="ui.input" inputname="credentials2" placeholder="Confirm password" type="password" disabled=true}
  <input type="submit" value="Authenticate">
</form>
{if $success}<h2 class="state_success">Authenticated successfully</h2>
{else if $failed}<h2 class="state_error">Authentication failed!</h2>{/if}
