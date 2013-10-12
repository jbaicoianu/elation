<h1>Authenticate User</h1>
<form action="/user/auth" method="post">
  <label for="userid">Email</label> <input name="userid" value="{$userid}">
  <label for="credentials">Password</label> <input name="credentials" type="password">
  <input type="submit" value="Authenticate">
</form>
{if $success}<h2 class="state_success">Authenticated successfully</h2>
{else if $failed}<h2 class="state_error">Authenticated failed!</h2>{/if}
