{* TODO
    after save, return to same selectors instead of startup defaults
    make date arrays key = day_of_era; so js validation can do arithmetic (eg date plus duration is less than today)
    enter config using adtool method
    fix selector fill routines - use jQuery.each instead of for-loops
 *}


<h2>ABTests</h2>
  <b style="color:red">{$err_msg}</b>
  <form name="abtest" id="abtest" action ="/elation/abtests" method="post" onsubmit="if(abtests.ab_validate()) return ajaxForm(ajaxlib, this)" >
    <input type="hidden" id="save_scope" name="save_scope" value="unpatched" />
    <b>&emsp;Mode </b>
      <select id="ab_inspect_mode">
        <option value="inactive">Lookup Inactive</option>
        <option value="active" selected="selected">Lookup Active</option>
        <option value="create">Create New</option>
      </select>
    <b>&emsp;Role </b><select id="ab_inspect_role" name="role"></select>
    <b>&emsp;Cobrand </b><select id="ab_inspect_cobrand" name="cobrand"></select>
    <b>&emsp;Start Date </b><select id="ab_inspect_date" name="effective_dt"></select>
    <table id="ab_edit" style="margin:10px;background-color:#ddd" cellspacing="6px">
      <tr id="ab_edit_tr_head">
        <th>IsBase</th><th>Version</th><th>Configuration</th><th>Percent</th><th></th>
      </tr>
     <tr id="ab_edit_tr_final">
      <td colspan="3"><input type="button" value="Add Item" id="ab_edit_add_item" /></td>
      <td><b id="ab_percent_total"></b></td>
      <td></td>
     </tr>
    </table>
    <b>&emsp;Duration Days </b><input type="text" size="3" id="ab_duration" name="duration" />
    <b>&emsp;Inactive </b><input type="radio" id="ab_status_inactive" name="status" checked="checked" value="inactive" />
    <b>&emsp;Active </b><input type="radio" id="ab_status_active" name="status" value="active" />
    <br /><br />
    &emsp;<input type="button" id="ab_role_save" value="Save in Selected Role" />
    &emsp;<input type="button" id="ab_all_save" value="Save in All Roles" />
</form>
<script type="text/javascript">
  var args = 
  {ldelim}
    sourceData:{jsonencode var=$abtest},
    cobrands:{jsonencode var=$cobrands},
    dates:{jsonencode var=$dates},
    today:{$dates.0},
    next_version:{$last_version}+1
  {rdelim}
    abtests.init(args);
</script>
{dependency type="component" name="utils.abtests"}
