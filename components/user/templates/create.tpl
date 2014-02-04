<h1>Create User</h1>
<form action="/user/create" method="post">
  <label for="userid">Email</label> <input name="userid" value="{$userid}">
  <label for="credentials">Password</label> <input name="credentials" type="password">
  <input type="submit" value="Create">
</form>
