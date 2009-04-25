   <div id="audio_controls">
    <a href="javascript:void(0)" onclick="ajaxlib.Get('/audio/playback/previous');" class="media_action_previous_button"></a>
    <a href="javascript:void(0)" onclick="ajaxlib.Get('/audio/playback/pause');" class="media_action_pauseplay_button"></a>
    <a href="javascript:void(0)" onclick="ajaxlib.Get('/audio/playback/next');" class="media_action_next_button"></a>
    <div id="songtitle">Please Wait...</div>
   </div>

  <script type="text/javascript">
   setInterval("if (ajaxlib) ajaxlib.Get('/audio/playback.ajax');", 4000);
  </script>
