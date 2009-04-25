<?

class Component_audio_playback extends Component {
  function init() {
  }

  function controller_playback($args, $output="inline") {
    $vars["args"] = $args;

    $playback = $this->parent->getMPDPlayback();
    $vars["song"] = $playback->getCurrentSong();

    if ($output == "ajax") {
      $ret["songtitle"] = $this->GetTemplate("./playback.tpl", $vars);
    } else {
      $ret = $this->GetTemplate("./playback.tpl", $vars);
    }
    return $ret;
  }
  function controller_test($args, $output="inline") {
    $playback = $this->parent->getMPDPlayback();
    $playlist = $this->parent->getMPDPlaylist();
    $song = $playback->getCurrentSong();
    print_pre(get_class_methods($playlist));
    print_pre($song);

    print_pre($playlist->getPlaylistInfoId($song["Id"]));
    return "";
  }
  function controller_pause($args, $output="inline") {
    Profiler::StartTimer("audio.playback.pause");
    Profiler::StartTimer("audio.playback.pause - get status");
    $playback = $this->parent->getMPDPlayback();
    $status = $playback->getStatus();
    Profiler::StopTimer("audio.playback.pause - get status");
    Profiler::StartTimer("audio.playback - init");
    if ($status['state'] == 'play' || $status['state'] == 'pause') {
      $playback->pause();
    } else {
      $playback->play();
    }
    Profiler::StopTimer("audio.playback.pause");
  }
  function controller_play($args, $output="inline") {
    $playback->play();
  }
  function controller_previous($args, $output="inline") {
    $playback->previousSong();
  }
  function controller_next($args, $output="inline") {
    $playback->nextSong();
  }
}  
