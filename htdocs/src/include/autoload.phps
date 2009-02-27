<?
class ClassMapper {
  static $classes = array(
  );
}
       
function __autoload($class) {
  if (isset(ClassMapper::$classes[$class])) {
    require_once(ClassMapper::$classes[$class]);
  } else if (file_exists("include/" . strtolower($class) . "_class.php")) {
    require_once("include/" . strtolower($class) . "_class.php");
  } else {
    throw new Exception("Class ($class) is not in the ClassMapper.");
  }
}
