{if !empty($playlists)}
  <ul id="audio_playlist_list" class="ui_panel ui_clear_after ui_scrollable orientation_vertical">
  {foreach from=$playlists item=playlist}
    <li class="ui_panel_item_button">
      <h3><a href="/audio/playlist/load.ajax?name={$playlist->name|escape:html}" onclick="ajaxlib.Get(this.href); return false;">{$playlist->title}</a></h3>
      <p class="audio_playlist_lastlistened">Last listened: {$playlist->last_listened|nicetime}</p>
    </li>
  {/foreach}
  </ul>
  <script type="text/javascript">
  var scrollaudio = new UIScrollable(carpc, {ldelim}'element': document.getElementById('audio_playlist_list'){rdelim});
  </script>
{/if}
  <form action="/audio/playlist/addstream" method="POST" onsubmit="return ajaxForm(ajaxlib, this)">
    <h2>Add Stream</h2>
    <label for="audio_playlist_addstream_name">Name</label>
    <input id="audio_playlist_addstream_name" name="name" />

    <label for="audio_playlist_addstream_streamurl">Stream URL</label>
    <input id="audio_playlist_addstream_streamurl" name="streamurl" />

    <input type="submit" value="Add Stream" />
  </form>

