{dependency name="user"}
<h2>{$user->userid|default:'(not logged in)'}</h2>
{if $user->loggedin}
  <a href="/user/logout" data-elation-component="user.logoutlink">log out</a>
{else}
  {component name="user.auth"}
{/if}
