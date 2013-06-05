{dependency name="elation.dbsync"}

<h1>Sharded Database Sync</h1>
<form action="/elation/dbsync">
{component name="utils.select" id="dbsync_bucket" label="Bucket" selectname="bucket" items=$buckets selected=$bucket autosubmit=true}
</form>
<table>
{foreach from=$lists key=list item=servers}
  <tr class="dbsync_list">
    <td>{$list}</td>
      {foreach from=$servers key=server item=obj}
        <td class="dbsync_{$obj.0}">{$server} {if !empty($obj.1)}({$obj.1.4|date_format:"%b %d %H:%M:%S"}){else}(missing){/if}</td>
      {/foreach}
  </tr>
{/foreach}
</table>
