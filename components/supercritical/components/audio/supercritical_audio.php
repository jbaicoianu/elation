<?

// Fail gracefully if this system doesn't have Net_MPD installed
if (file_exists("/usr/share/php/Net/MPD.php")) {
  include_once("Net/MPD.php");

  if (class_exists("Net_MPD", false)) {
    include_once("/usr/share/php/Net/MPD/Admin.php");
    include_once("/usr/share/php/Net/MPD/Database.php");
    include_once("/usr/share/php/Net/MPD/Playback.php");
    include_once("/usr/share/php/Net/MPD/Playlist.php");
    include_once("festival.php");
  }
}

class Component_supercritical_audio extends Component {
  private $playback;
  private $playlist;

  function init() {
  }

  function controller_audio($args, $output="inline") {
    $vars["args"] = $args;

    if ($output == "ajax")
      $ret["index_content"] = $this->GetTemplate("./audio.tpl", $vars);
    else
      $ret = $this->GetTemplate("./audio.tpl", $vars);

    return $ret;
  }
  function controller_status($args, $output="inline") {
    return $this->GetTemplate("./status.tpl", $vars);
  }
  function controller_festival($args, $output="inline") {
    if (!empty($args["say"])) {
      $festival = new Festival();
      $festival->Say($args["say"]);
    }

    return $this->GetTemplate("./festival.tpl", $vars);
  }

  function &getMPDPlayback() {
    if (class_exists("Net_MPD", false)) {
      if (empty($this->playback))
        $this->playback = Net_MPD::factory('Playback');

      if (!$this->playback->isConnected() && !$this->playback->connect()) {
        print "Error connecting to MPD (playback)";
      }
    }

    return $this->playback;
  }
  function &getMPDPlaylist() {
    if (class_exists("Net_MPD", false)) {
      if (empty($this->playlist))
        //$this->playlist = Net_MPD::factory('Playlist');

      if (!$this->playlist->isConnected() && !$this->playlist->connect()) {
        print "Error connecting to MPD (playlist)";
      }
    } 
    return $this->playlist;
  }
}  
