<?php
class Component_html_zendForm extends Component 
{
  public function init() {}

  public function controller_zendForm($args, $output="inline") 
	{
    $vars["args"] = $args;
    $vars["formname"] = any($args["formname"], "htmlform");
    $vars["formhandler"] = $args["formhandler"];
    $vars["dispatchname"] = any($args["dispatchname"], $vars["formname"]);

		$formGen = new $args['formClass'];
		$form = $formGen->getForm($args);

		$vars['formHTML'] = $form->render();
		
		return $this->GetTemplate("./zendForm.tpl", $vars);
  }
	
	public function controller_zendForm_error($args, $output='inline')
	{
		//print_pre($args); die;
		$vars['formHTML'] = $args['formHTML'];
		return $this->GetTemplate("./zendForm.tpl", $vars);
	}
}  

