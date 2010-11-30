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

  function controller_view($args, $output = 'inline') {
  	$vars['args'] = $args;
		
    if (!empty($args["blogname"])) {
      $vars["blogname"] = $args["blogname"];

      try {
        $vars["blog"] = $this->orm->load("Blog", $vars["blogname"]);
      } catch(Exception $e) {
        print_pre($e->getMessage());
      }
    }

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
	 * @return object ComponentResponse
	 */
  public function controller_create_postZend($args, $output="inline") 
	{
    $vars["args"] = $args;
    $vars["blogname"] = $args["blogname"];

    if (!empty($args["blog"])) {
      $vars["blog"] = $args["blog"];
      $vars["blogname"] = $vars["blog"]->blogname;
    } 
		else if (!empty($args["blogname"])) {
      $vars["blogname"] = $args["blogname"];
      try {
        $vars["blog"] = $this->orm->load("Blog", $vars["blogname"]);
      } catch(Exception $e) {
      }
    }

    if (empty($vars["blog"])) {
      $vars["blogs"] = $this->orm->select("Blog");
      $ret = $this->GetComponentResponse("./select.tpl", $vars);
    } 
		else {
      $vars["formname"] = $formname = "blogpost";

			$form = new Elation_Form(array('file' => 'components/blog/blog.model', 
			                               'class' => 'Blog',
																		 'variables' => array('[[validator1]]' => 'Alnum', 
																		                      '[[validator2]]' => 'Alpha')), 
			                         Elation_Form::ELATION_OPTIONS_ZEND);
			
			$blogName = new Zend_Form_Element_Hidden(array("name" => 'blogname', "value" => $vars["blogname"]));
      $form->addElement($blogName);
			
      $vars['blogForm'] = $form->render('blog.form', $args); //use a component to route the form through
			//$vars['blogForm'] = $form->render(); //or use the default Zend_Form renderer

      if (!empty($args["blogpost"])) {
        if($form->isValid($args)) {
	        $args["blogpost"]["timestamp"] = new DateTime();
	        $blogpost = $vars[$formname] = new BlogPost($args["blogpost"]);
	        $blogpost->SetBlog($vars["blog"]);
					
	        if ($blogpost->isValid()) {
	          if ($blogpost->Save()) {
	            // FIXME - make configurable
							//Perhaps redirect back to this controller so we can show success
	            header("Location: ?blogname=" . urlencode($vars["blogname"]) . "#blog_posts_create_success:" . $blogpost->blogpostid);
	          }
	        }
				}
        else {
					$vars['formError'] = true;
					$formErrors = $form->getMessages();
					$vars['subjectErrors'] = $formErrors['subject'];
					$vars['contentErrors'] = $formErrors['content'];
        }				
      }
			
      $ret = $this->GetComponentResponse("./create_postZend.tpl", $vars);  
    }
    return $ret;
  }	
	
	/**
	 * For testing of the form only
	 * 
	 * @param object $args
	 * @param object $output [optional]
	 * @return 
	 */
	public function controller_test($args, $output="inline")
	{
		//print_pre($args); die;
		$form = new Elation_Form(array('file' => 'components/blog/blog.model', 'class' => 'Blog'), Elation_Form::ELATION_OPTIONS_ZEND);
		$args['blogForm'] = $form->render('blog.form', $args);
		return $this->GetComponentResponse('./test.tpl', $args);
	}
	
	/**
	 * Populates and generates the form ... it's called from ElationForm::render
	 * as the context. Passes in the form to the component controller for dissection 
	 * and use to render a template. More flexible than zend's default rendering or
	 * using those stupid form decorators
	 * 
	 * @param object $args
	 * @param object $output [optional]
	 * @return object ComponentResponse
	 */
	public function controller_form($args, $output="inline")
	{
		//print_pre($args); die;
		$form = $args['form'];
		$args['subject'] = any($args['blogpost']['subject'], $form->getElement('subject')->getValue());
		$args['content'] = any($args['blogpost']['content'], $form->getElement('content')->getValue());
		return $this->GetComponentResponse('./form.tpl', $args);
	}
} 

