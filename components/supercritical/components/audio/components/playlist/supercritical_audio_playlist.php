<?

class Component_audio_playlist extends Component {
  function init() {
    $this->playlist =& $this->parent->getMPDPlaylist();
  }

  function controller_playlist($args, $output="inline") {
    $vars["args"] = $args;
    $mpdplaylistnames = $this->playlist->getPlaylists();
    $vars["currentplaylist"] = $this->playlist->getPlaylistInfo();
    $status = $this->playlist->getStatus();
    if (!empty($mpdplaylistnames)) {
      $outlet = Outlet::getInstance();
      $dbplaylists = $outlet->select("AudioPlaylist", "ORDER BY {AudioPlaylist.last_listened} DESC");
      foreach ($dbplaylists as $playlist) {
        $vars["playlists"][] = $playlist;
      }
    } else {
      print_pre("ERROR: MPD has no playlists!");
    }
    return $this->GetTemplate("./playlist.tpl", $vars);
  }

  function controller_load($args, $output="inline") {
    if (!empty($args["name"])) {
      $this->playlist->clear();
      if ($this->playlist->loadPlaylist($args["name"])) {
        //print "loaded!";
        $this->parent->getMPDPlayback()->play();
        $playlistobj = $this->getPlaylistObject($args["name"]);
        $playlistobj->last_listened = new DateTime();
        $this->root->outlet->Save($playlistobj);
      }
    }
    return $this->parent->controller_audio(array(), $output);
  }
  function controller_addstream($args, $output="inline") {
    if (!empty($args["name"]) && !empty($args["streamurl"])) {
      $vars["name"] = $args["name"];
      $vars["streamurl"] = $args["streamurl"];

      $streamplaylist = file_get_contents($vars["streamurl"]);
      if (!empty($streamplaylist)) {
        //$streamplaylist = trim(str_replace("\n\n", "\n", preg_replace("/\#.*$/m", "", $streamplaylist)));
        //$files = explode("\n", $streamplaylist);
        $files = $this->ParsePlaylist($streamplaylist);
        print_pre($files);
        if (!empty($files)) {
          $playlists = $this->playlist->getPlaylists();
          if (in_array($vars["name"], $playlists)) {
            print "Deleting playlist '{$vars["name"]}'<br />";
            $this->playlist->deletePlaylist($vars["name"]);
          }

          print "Clear playlist<br />";
          $this->playlist->clear();
          
          foreach ($files as $file) {
            print_pre("add $file");
            $this->playlist->addSong($file);
          }
          print_pre("save it");
          if ($this->playlist->savePlaylist($vars["name"])) {
            $mpdplayback = $this->parent->getMPDPlayback();
            $mpdplayback->play();

            $vars["info"] = $mpdplayback->getCurrentSong();
            print_pre($vars["info"]);

            $playlistdb = new AudioPlaylist();
            $playlistdb->name = $vars["name"];
            $playlistdb->title = $vars["name"];
            $playlistdb->streamurl = $vars["streamurl"];
            $this->root->outlet->Save($playlistdb);
          }
        }
      }
    }
  }

  function ParsePlaylist($playlist) {
    if (strpos(trim($playlist), "[playlist]") === 0)
      $ret = $this->ParsePLS($playlist);
    else
      $ret = $this->ParseM3U($playlist);
    return $ret;
  }
  function ParseM3U($m3u) {
    print_pre("Parsing as M3U");
    $filelist = trim(str_replace("\n\n", "\n", preg_replace("/\#.*$/m", "", $m3u)));
    return explode("\n", $filelist);
  }
  function ParsePLS($pls) {
    print_pre("Parsing as PLS");
    $files = array();
    if (preg_match_all("/^File(\d+)=(http:\/\/.*?)$/im", $pls, $m, PREG_PATTERN_ORDER)) {
      $files = $m[2];
    }
    return $files;
  }

  function getPlaylistObject($name) {
    if (!empty($name)) {
      try {
        $playlistobj = $this->root->outlet->Load("AudioPlaylist", $name);
      } catch(Exception $e) {
        $playlistobj = new AudioPlaylist();
        $playlistobj->name = $name;
        $playlistobj->title = $name;
        $this->root->outlet->Save($playlistobj);
      }
    } else {
      // Empty name, return empty AudioPlaylist
      $playlistobj = new AudioPlaylist();
    }
    return $playlistobj;
  }
}  
