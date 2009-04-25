<form action="/navigation/directions" method="POST" onsubmit="carpc.getDirections(this.navigation_directions_from.value, this.navigation_directions_to.value); return false;">
  <label for="navigation_directions_from">From</label>
  <input id="navigation_directions_from" name="directions[from]" value="Santa Clara, CA" />

  <label for="navigation_directions_to">To</label>
  <input id="navigation_directions_to" name="directions[to]" value="San Francisco, CA" />

  <input type="submit" />
</form>
<div id="navigation_directions_results">
</div>
<script type="text/javascript">carpc.initDirections()</script>
