function TFAdminABTests (name, args) {
  var sourceData;
  var mode = "";
  var roles = ['dev', 'test', 'live', 'elation'];
  var role = "";
  var cobrands;
  var cobrand = "";
  var dates;
  var date = "";
  var today;
  var next_version;
  var seqnum=0;
  this.init = function(args) {
    sourceData=args.sourceData;
    cobrands=args.cobrands;
    dates=args.dates;
    today=args.today;
    next_version=args.next_version;
    //mode = 'Lookup active';
    $TF('#ab_inspect_mode').change(function() {ab_Change('ab_inspect_mode'); });
    ab_Change('ab_inspect_mode');
    $TF('#ab_role_save').click(function() {$TF('#save_scope').val('role');if (sourceData&&this.form.onsubmit()) this.form.submit()});
    $TF('#ab_all_save').click(function() {$TF('#save_scope').val('all');if (sourceData&&this.form.onsubmit()) this.form.submit()});
    $TF('#ab_edit_add_item').click(function() {ab_addItem(seqnum); });
  }
  function ab_Change(changed) {
    mode = $TF('#ab_inspect_mode').val();
    if (mode == 'create') {
      switch (changed) {
      case 'ab_inspect_mode':
        ab_fillSelectOptions('ab_inspect_role', roles, 'dev','v');
        ab_fillSelectOptions('ab_inspect_cobrand', cobrands, 'thefind','v');
        ab_fillSelectOptions('ab_inspect_date', dates, today, 'v');
        ab_loadForm([]);
      default:
        role=$TF('#ab_inspect_role').val();
        cobrand=$TF('#ab_inspect_cobrand').val();
        date=$TF('#ab_inspect_date').val();
      }
    } else {
      switch (changed) {
      case 'ab_inspect_mode':
        if (typeof sourceData[mode] == 'undefined') sourceData[mode] = [];
        ab_fillSelectOptions('ab_inspect_role', sourceData[mode], null, 'k');
      case 'ab_inspect_role':
        role=$TF('#ab_inspect_role').val();
        if (typeof sourceData[mode][role] == 'undefined') sourceData[mode][role] = [];
        ab_fillSelectOptions('ab_inspect_cobrand', sourceData[mode][role], null, 'k');
      case 'ab_inspect_cobrand':
        cobrand=$TF('#ab_inspect_cobrand').val();
        if (typeof sourceData[mode][role][cobrand] == 'undefined') sourceData[mode][role][cobrand] = [];
        ab_fillSelectOptions('ab_inspect_date', sourceData[mode][role][cobrand], null, 'k');
      case 'ab_inspect_date':
        date=$TF('#ab_inspect_date').val();
        ab_loadForm(sourceData[mode][role][cobrand][date]);
      }
    }
  }
  function ab_fillSelectOptions(id, object, selected, looptype) {
    var html = "";
    switch (looptype) {
    case 'k':
    $TF.each(object, function(key, val) {
      html += '<option value="'+key+'"';
      if (key==selected) html += ' selected="selected"';
      html += '>'+key+'&emsp;<\/option>';
    });
      break;
    case 'v':
    $TF.each(object, function(key, val) {
      html += '<option value="'+val+'"';
      if (val==selected) html += ' selected="selected"';
      html += '>'+val+'&emsp;<\/option>';
    });
      break;
    }
    $TF('#'+id).html(html).unbind('change').change(function() {ab_Change(id); });
  }
  function ab_loadForm(object) {
    $TF('.ab_edit_tr').remove();
    $TF('#ab_duration').val('');
    $TF('#ab_status_inactive').attr('checked', 'checked');
    if(object) {
      for (var row=0; row<object.length; row++) {
        ab_addItem(row);
        if (object[row]['IsBase']==1) {
          $TF('#ab_radio_'+row).attr('checked', 'checked');
          $TF('#ab_duration').val(object[row]['Duration']);
          if (mode=='active') $TF('#ab_status_active').attr('checked', 'checked');
        }
        $TF('#ab_input_version_'+row).val(object[row]['Version']);
        $TF('#ab_input_config_'+row).val(object[row]['Config']);
        $TF('#ab_input_percent_'+row).val(object[row]['Percent']);
      }
      ab_calculatePercent();
    }
  }
  function ab_addItem(num) {
    var html='<tr id="ab_edit_tr_'+num+'" class="ab_edit_tr">';
    html += '<td><input type="radio" id="ab_radio_'+num+'" name="isbase_position" value="'+num+'" \/><\/td>';
    html += '<td><input type="text" size="3" id="ab_input_version_'+num+'" class="ab_version" name="version['+num+']" \/><\/td>';
    html += '<td><input type="text" size="40" id="ab_input_config_'+num+'" name="config['+num+']" \/><\/td>';
    html += '<td><input type="text" size="3" id="ab_input_percent_'+num+'" class="ab_percent" name ="percent['+num+']" \/><\/td>';
    html += '<td><input type="button" id="ab_remove_'+num+'" value="Remove Item" \/><\/td>';
    html += '<\/tr>';
    $TF('#ab_edit_tr_final').before(html);
    ab_fillSuggestedVersions();
    $TF('.ab_percent').keyup(function() {ab_calculatePercent();});
    $TF('#ab_remove_'+num).click(function() {ab_deleteItem(num);});
    seqnum++;
  }
  function ab_deleteItem(num) {
    $TF('#ab_edit_tr_'+num).remove();
    ab_fillSuggestedVersions();
    ab_calculatePercent();
  }
  function ab_calculatePercent() {
    total=0;
    $TF('.ab_percent').each(function() {total+=Number(this.value) });
    $TF('#ab_percent_total').html(total).css('color', total==100?'black':'red');
  }
  function ab_fillSuggestedVersions() {
    if (mode=='create') {
      $TF('.ab_version').each(function(n) {$TF(this).val(next_version+n)});
    }
  }
  this.ab_validate = function() {
    if ($TF('.ab_version').length == 0) {
      //should insert further deletion validation here
      if (confirm('Warning - Existing group will be deleted')) return true;
      return false;
    }
    if (typeof $TF('[name=isbase_position]:checked').val() == 'undefined') {
      alert('One item must be selected as "IsBase"');
      return false;
    }
    if ($TF('#ab_percent_total').html() != '100') {
      alert('Percentage total is not equal to 100');
      return false;
    }
    if (isNaN($TF('#ab_duration').val()) || $TF('#ab_duration').val()<1) {
      alert('Duration must be non-zero');
      return false;
    }
    if ((mode!='create') && !confirm('Warning - Existing group will be overwritten')) {
      return false;
    }
    //warn if date plus duration is less than today
    return true;
  }
}
var abtests= new TFAdminABTests();

