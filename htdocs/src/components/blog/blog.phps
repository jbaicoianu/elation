<?
include("blog_model.php");

class Component_blog extends Component {
  function init() {
    $this->conn = Outlet::getInstance();
    $this->conn->createProxies();
  }

  function controller_blog($args, $output="inline") {
    $vars["args"] = $args;
    $vars["blogname"] = $args["blogname"];

    try {
      $vars["blog"] = $this->conn->load("Blog", $vars["blogname"]);
    } catch(Exception $e) {
    }

    if (!empty($vars["blog"])) {
      $ret = $this->GetTemplate("./blog.tpl", $vars);
    } else {
      $ret = $this->GetTemplate("./blog_notfound.tpl", $vars);
    }
    return $ret;
  }

  function controller_create($args, $output="inline") {
    $vars["args"] = $args;
    
    $vars["blog"] = new Blog;
    $vars["blog"]->blogname = "supercritical";
    $vars["blog"]->title = "Supercritical Industries, LLC";
    $vars["blog"]->subtitle = "Our Business is Serious Business";
    $vars["blog"]->owner = "james";
    
    try {
      $this->conn->save($vars["blog"]);
      $vars["success"] = true;
    } catch(Exception $e) {
      $vars["success"] = false;
      print_pre($e);
    }

    return $this->GetTemplate("./create.tpl", $vars);
  }
} 

