<form action="{$webapp->request.basedir}/elation/orm">
  <label for="tf_admin_orm_models">Models</label> <select id="tf_admin_orm_models" name="model" onchange="this.form.submit();">
   <option></option>
   {foreach from=$models item=m}
     <option{if $model == $m} selected="selected"{/if}>{$m}</option>
   {/foreach}
  </select>
  <input type="hidden" name="ormaction" value="view" />
</form>
