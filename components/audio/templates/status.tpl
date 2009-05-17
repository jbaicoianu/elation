{*
    <script type='text/javascript' 
        src='http://getfirebug.com/releases/lite/1.2/firebug-lite-compressed.js'></script>
*}
<script type="text/javascript" src="/scripts/components/audio/controller.js"></script>
   <div id="audio_controls">
    <a class="media_action_previous_button"></a>
    <a class="media_action_pauseplay_button"></a>
    <a class="media_action_next_button"></a>
    <div id="songtitle">Please Wait...</div>
   </div>

  <script type="text/javascript">
   setInterval("if (ajaxlib) ajaxlib.Get('/audio/playback.ajax');", 4000);

{literal}
/*
   var player = document.getElementById('media_player');
   addEvent(player, "error", function() { alert('error'); });
   addEvent(player, "abort", function() { alert('abort'); });
   addEvent(player, "empty", function() { alert('empty'); });
   addEvent(player, "emptied", function() { alert('emptied'); });
   addEvent(player, "dataunavailable", function() { alert('dataunavailable'); });
   addEvent(player, "error", function() { alert('error'); });
   addEvent(player, "ended", function() { player.play(); });
   addEvent(player, "waiting", function() { alert('waiting'); });
*/
var player = new AudioController(null, {controls: 'audio_controls'});
{/literal}
  </script>
