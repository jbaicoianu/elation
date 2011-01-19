<h2>Memcache</h2>

{if !empty($tf_debug_memcache_status)}<h3 id="tf_debug_memcache_status">{$tf_debug_memcache_status}</h3>{/if}

{if $admin}
<form action="/elation/memcache" method="get" onsubmit="return elation.ajax.form(this);">
 <label>Delete Key</label>
 <input type="hidden" name="memcacheaction" value="delete" />
 <input name="memcachekey" />
 <input type="submit" />
</form>

<form action="/elation/memcache" method="get" onsubmit="return elation.ajax.form(this);">
 <input type="hidden" name="memcacheaction" value="flush" />
 <button type="submit" name="memcachetype" value="data">Flush data</button>
</form>
<form action="/elation/memcache" method="get" onsubmit="return elation.ajax.form(this);">
 <input type="hidden" name="memcacheaction" value="flush" />
 <button type="submit" name="memcachetype" value="session">Flush session</button>
</form>
{/if}
{foreach from=$stats key=key item=item}
  <table class="tf_debug_memcache_servers" border="0" cellpadding="0" cellspacing="0">
   <caption>{$key}:</caption>
   {foreach from=$item key=server item=serverstats name=servers}
    {if $smarty.foreach.servers.iteration == 1}
     <tr>
      <th>server</th>
       {foreach from=$serverstats key=statname item=statval}
        <th>{$statname}</th>
       {/foreach}
     </tr>
    {/if}
    <tr><td>{$server}</td>
    {foreach from=$serverstats key=statname item=statval}
     <td>{$statval}</td>
    {/foreach}
    </tr>
   {/foreach}
  </table>
{/foreach}
