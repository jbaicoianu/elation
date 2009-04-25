<?
class Festival {
  function Say($text) {
    $cmd = sprintf("echo '(SayText \"%s\")' |festival_client", escapeshellcmd($text));
    exec($cmd);
  }
}