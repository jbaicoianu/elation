  <h2 style="clear: left;">{$classname}</h2>
  <table border="1" cellspacing="0" style="float: left;">
  {foreach from=$ormclass->props key=propname item=propargs}
   <tr>
    <td>{$propname}</td><td>{$propargs.1}</td>
    <td>
     {foreach from=$propargs.2 key=argkey item=argval}
      {$argkey}: {$argval};
     {/foreach}
    </td>
   </tr>
  {/foreach}
  </table>
  <div style="float: left; margin-left: 1em;">
    <h4>SQL:
    <form action="{$webapp->request.basedir}/elation/orm" style="display: inline-block; margin-left: 1em;">
     <input type="submit" name="ormaction" value="create" />
     <input type="hidden" name="model" value="{$model}" />
     <input type="hidden" name="classname" value="{$classname}" />
    </form></h4>
    <pre>{$sql}</pre>
  </div>
