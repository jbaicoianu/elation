<?
class Component_blog_posts extends Component {
  function init() {
    $this->conn = $this->parent->conn;
  }

  function controller_posts($args, $output="inline") {
    $vars["args"] = $args;

    $vars["blog"] = $args["blog"];
    $vars["posts"] = $vars["blog"]->GetBlogposts("ORDER BY {BlogPost.timestamp} DESC");

    return $this->GetTemplate("./posts.tpl", $vars);
  }
  function controller_create($args, $output="inline") {
    $vars["args"] = $args;
    $vars["blogname"] = $args["blogname"];
    $vars["header"] = $args["header"];

    if (!empty($args["blog"])) {
      $vars["blog"] = $args["blog"];
      $vars["blogname"] = $vars["blog"]->blogname;
    } else if (!empty($args["blogname"])) {
      $vars["blogname"] = $args["blogname"];
      try {
        $vars["blog"] = $this->conn->load("Blog", $vars["blogname"]);
      } catch(Exception $e) {
      }
    }

    if (empty($vars["blog"])) {
      $vars["blogs"] = $this->conn->select("Blog");
      $ret = $this->GetTemplate("./create_selectblog.tpl", $vars);
    } else {
      $vars["formname"] = $formname = "blogpost";
      $vars["elements"] = array("_blogname" => array("type" => "hidden", "fullname" => "blogname", value => $vars["blogname"]),
                                "subject" => array("type" => "input", "name" => "subject", "label" => "Subject:", "value" => "(no subject)"),
                                "content" => array("type" => "textarea", "name" => "content", "label" => "Content:"),
                                "_submit" => array("type" => "submit", "value" => "Add Post")
                                );
      
      $vars["saved"] = false;
      $vars["valid"] = false;
      if (!empty($args["blogpost"])) {
        $blogpost = $vars[$formname] = new BlogPost($args["blogpost"]);
        $blogpost->SetBlog($vars["blog"]);

        if ($blogpost->isValid()) {
          $vars["valid"] = true;
          if ($blogpost->Save()) {
            // FIXME - make configurable
            header("Location: ?blogname=" . urlencode($vars["blogname"]) . "#blog_posts_create_success:" . $blogpost->blogpostid);
          }
        }
      }
      $ret = $this->GetTemplate("./create.tpl", $vars);
    }
    return $ret;
  }
}  
