<div class="elation_accessviolation">
  {img src="elation/stop.png" class="elation_accessviolation_error"}
  <h2>Access Violation</h2>
  <p>You do not have access to this page.</p>
  <p>If you should have access to this page, please contact your administrator.</p>
</div>

{config}
  {set var="page.pretitle"}Access Violation - {/set}

  {dependency type="component" name="utils.elation"}
  {dependency type="component" name="utils.ajaxlib"}
  {dependency type="component" name="elation.accessviolation"}
{/config}
