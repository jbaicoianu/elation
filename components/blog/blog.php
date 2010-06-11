<?php

class Component_blog extends Component {
  function init() {
    $this->orm = OrmManager::singleton();
    $this->orm->LoadModel("blog");
  }

  function controller_blog($args, $output="inline") {
    $vars["blogs"] = $this->orm->select("Blog");
    return $this->GetComponentResponse("./blog.tpl", $vars);
  }

  function controller_summary($args) {
    if (!empty($args["blogname"])) {
      $vars["blogname"] = $args["blogname"];
      $vars["blog"] = $this->orm->load("Blog", $vars["blogname"]);
    } else if (!empty($args["blog"])) {
      $vars["blog"] = $args["blog"];
      $vars["blogname"] = $vars["blog"]->blogname;
    }
    return $this->GetComponentResponse("./summary.tpl", $vars);
  }

  function controller_view($args) {
    if (!empty($args["blogname"])) {
      $vars["blogname"] = $args["blogname"];

      try {
        $vars["blog"] = $this->orm->load("Blog", $vars["blogname"]);
      } catch(Exception $e) {
        print_pre($e->getMessage());
      }
    }
		
    $this->addFormVarsToView($vars, array($vars["blogname"]));

    return $this->GetComponentResponse("./view.tpl", $vars);
  }
	
  function controller_create($args, $output="inline") {
    if (!empty($args["blog"])) {
      $vars["blog"] = new Blog;
      $vars["blog"]->blogname = $args["blog"]["blogname"];
      $vars["blog"]->title = $args["blog"]["title"];
      $vars["blog"]->subtitle = $args["blog"]["subtitle"];
      $vars["blog"]->owner = $args["blog"]["owner"];
    
      try {
        $this->orm->save($vars["blog"]);
        $vars["success"] = true;
        header("Location: /blog#blog_create_success:" . $vars["blog"]->blogname);
      } catch(Exception $e) {
        $vars["success"] = false;
        print_pre($e);
      }
    }

    return $this->GetComponentResponse("./create.tpl", $vars);
  }
	
  function controller_posts($args, $output="inline") {
    $vars["args"] = $args;

    $vars["blog"] = $args["blog"];
    if (!empty($vars["blog"])) {
      $vars["posts"] = $vars["blog"]->GetBlogposts("ORDER BY {BlogPost.timestamp} DESC");
      $vars["postcount"] = $vars["posts"]->count();
    }

    return $this->GetComponentResponse("./posts.tpl", $vars);
  }
	
  function controller_create_post($args, $output="inline") {
    $vars["args"] = $args;
    $vars["blogname"] = $args["blogname"];
    $vars["header"] = $args["header"];

    if (!empty($args["blog"])) {
      $vars["blog"] = $args["blog"];
      $vars["blogname"] = $vars["blog"]->blogname;
    } else if (!empty($args["blogname"])) {
      $vars["blogname"] = $args["blogname"];
      try {
        $vars["blog"] = $this->orm->load("Blog", $vars["blogname"]);
      } catch(Exception $e) {
      }
    }

    if (empty($vars["blog"])) {
      $vars["blogs"] = $this->orm->select("Blog");
      $ret = $this->GetComponentResponse("./select.tpl", $vars);
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
        $args["blogpost"]["timestamp"] = new DateTime();
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
      $ret = $this->GetComponentResponse("./create_post.tpl", $vars);
    }
    return $ret;
  }
	
	/**
	 * Similar to the above function, but uses Elation's Zend Framework integration,
	 * specifically Zend_Form and associated components to created the form from the JSON
	 * .model file, validate/filter it, and display it.
	 * 
	 * @param object $args
	 * @param object $output [optional]
	 * @return 
	 */
  public function controller_create_postZend($args, $output="inline") 
	{
    //print_pre($args); die;
		
    $vars["args"] = $args;
    $vars["blogname"] = $args["blogname"];
    //$vars["header"] = $args["header"];

    if (!empty($args["blog"])) {
      $vars["blog"] = $args["blog"];
      $vars["blogname"] = $vars["blog"]->blogname;
    } else if (!empty($args["blogname"])) {
      $vars["blogname"] = $args["blogname"];
      try {
        $vars["blog"] = $this->orm->load("Blog", $vars["blogname"]);
      } catch(Exception $e) {
      }
    }

    if (empty($vars["blog"])) {
      $vars["blogs"] = $this->orm->select("Blog");
      $ret = $this->GetComponentResponse("./select.tpl", $vars);
    } else {
      $vars["formname"] = $formname = "blogpost";
      /*$vars["elements"] = array("_blogname" => array("type" => "hidden", "fullname" => "blogname", value => $vars["blogname"]),
                                "subject" => array("type" => "input", "name" => "subject", "label" => "Subject:", "value" => "(no subject)"),
                                "content" => array("type" => "textarea", "name" => "content", "label" => "Content:"),
                                "_submit" => array("type" => "submit", "value" => "Add Post")
                                );
      */
      $this->addFormVarsToView($vars, array($vars["blogname"]));

      $vars["saved"] = false;
      $vars["valid"] = false;
			
      if (!empty($args["blogpost"])) {
        $args["blogpost"]["timestamp"] = new DateTime();
        $blogpost = $vars[$formname] = new BlogPost($args["blogpost"]);
        $blogpost->SetBlog($vars["blog"]);
				
				$zendFormComponent = new Blog_PostForm();
				$form = $zendFormComponent->getForm(array_merge($vars, $args, array('formname' => "blogpost", 'formhandler' => "blog.create_postZend")));
				
        if ($blogpost->isValid() && $form->isValid($args)) {
          $vars["valid"] = true;
          if ($blogpost->Save()) {
            // FIXME - make configurable
            header("Location: ?blogname=" . urlencode($vars["blogname"]) . "#blog_posts_create_success:" . $blogpost->blogpostid);
          }
        }
      }
      $ret = $this->GetComponentResponse("./create_postZend.tpl", $vars);
    }
    return $ret;
  }	
	
	protected function addFormVarsToView(&$vars, $params)
	{
    $vars['modelFile'] = "components/blog/blog.model";
    $vars['modelClass'] = "Blog";
    $vars['formConfigType'] = Elation_Form::ELATION_OPTIONS_ZEND;
		$vars['postCreateCallback'] = array("class" => __CLASS__, "method" => "addExtraFields", "params" => $params);
		$vars['formClass'] = "Blog_PostForm";
	}
	
	public static function addExtraFields($form, $params)
	{
		$formName = new Zend_Form_Element_Hidden(array("name" => 'blogname', "value" => $params[0]));
		$form->addElement($formName);
	}
} 

