<?

class Component_blog extends Component {
  function init() {
    $this->conn = Outlet::getInstance();
    $orm = OrmManager::singleton();
    $orm->LoadModel("blog");
  }

  function controller_blog($args, $output="inline") {
    $ret = $this->GetComponentResponse("./blog.tpl");

    $ret["blogs"] = $this->conn->select("Blog");
/*
    if (!empty($vars["blog"])) {
      $ret = $this->GetTemplate("./blog.tpl", $vars);
    } else {
      $ret = $this->GetTemplate("./blog_notfound.tpl", $vars);
    }
*/
    return $ret;
  }

  function controller_summary($args) {
    $ret = $this->GetComponentResponse("./summary.tpl");
    if (!empty($args["blogname"])) {
      $ret["blogname"] = $args["blogname"];
      $ret["blog"] = $this->conn->load("Blog", $ret["blogname"]);
    } else if (!empty($args["blog"])) {
      $ret["blog"] = $args["blog"];
      $ret["blogname"] = $ret["blog"]->blogname;
    }
    return $ret;
  }

  function controller_view($args) {
    $ret = $this->GetComponentResponse("./view.tpl");
    if (!empty($args["blogname"])) {
      $ret["blogname"] = $args["blogname"];

      try {
        $ret["blog"] = $this->conn->load("Blog", $ret["blogname"]);
      } catch(Exception $e) {
        print_pre($e->getMessage());
      }
    }

    return $ret;
  }
  function controller_create($args, $output="inline") {
    $vars = $this->GetComponentResponse("./create.tpl");
    
    if (!empty($args["blog"])) {
      $vars["blog"] = new Blog;
      $vars["blog"]->blogname = $args["blog"]["blogname"];
      $vars["blog"]->title = $args["blog"]["title"];
      $vars["blog"]->subtitle = $args["blog"]["subtitle"];
      $vars["blog"]->owner = $args["blog"]["owner"];
    
      try {
        $this->conn->save($vars["blog"]);
        $vars["success"] = true;
        header("Location: /blog#blog_create_success:" . $vars["blog"]->blogname);
      } catch(Exception $e) {
        $vars["success"] = false;
        print_pre($e);
      }
    }

    return $vars;
  }
} 

