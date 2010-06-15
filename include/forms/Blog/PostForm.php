<?php
class Blog_PostForm
{
  public function getForm($args)
  {
    $formName = any($args["formname"], "htmlform");
    $dispatchName = any($args["dispatchname"], $formName);

    $form = new Elation_Form(array('file' => $args['modelFile'], 'class' => $args['modelClass']), $args['formConfigType']);
    
		/*
    $hiddenDispatch = new Zend_Form_Element_Hidden(array("name" => $dispatchName, "value" => $args["formhandler"]));
    $hiddenDispatch->setBelongsTo('_predispatch');
    $form->addElement($hiddenDispatch);
    */
		
    if(array_key_exists('postCreateCallback', $args) && array_key_exists('class',  $args['postCreateCallback']) && array_key_exists('method',  $args['postCreateCallback'])){
      $params = NULL;
      if(array_key_exists('params',  $args['postCreateCallback'])) {
        $params = $args['postCreateCallback']['params'];
      }
      call_user_func(array($args['postCreateCallback']['class'], $args['postCreateCallback']['method']), $form, $params);
    }
    
    $form->setView(new Zend_View());
    
    return $form;   
  }	
}
