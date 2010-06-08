<?php
class Elation_Form extends Zend_Form 
{ 
  public function __construct($options = null, $zendOptions = true) 
  { 
    //read .model JSON file and processing it into a zend_config object before continuing
	  if(!$zendOptions) {
	  	$options = $this->processJSONModel($options);
	  }
		
    parent::__construct($options);
  }
	
	public function processJSONModel($options)
	{
		$modelFile = $options['file'];
		$objectClass = $options['class'];
		
		$jsonFile = file_get_contents($modelFile);
		
		//print_pre($jsonFile); die;
		
		if($jsonFile !== false) {
			$jsonData = json_decode($jsonFile, true);
			//var_dump($jsonData);
			if($jsonData != NULL) {
				//print_pre($jsonData); die;
				//print_pre($jsonData['classes'][$objectClass]['form']); die;
				try {
					foreach($jsonData['classes'][$objectClass]['form']  as $key => $val) {
						$this->addElement($this->createElementFromConfig($val));
					}		
				}
				catch (Exception $e) {}
			}
		}
		else {
			return false;
		}
	}
	
	protected function createElementFromConfig($values)
	{
		
		//var_dump($values); die;
		
		$formElement = array();
		$validators = $filters = NULL;
		
		if(array_key_exists('validators', $values)) {
			$validators = $values['validators'];
			unset($values['validators']); 
		}
		
		if(array_key_exists('filters', $values)) {
      $filters = $values['filters'];
			unset($values['filters']); 
    }
    
		//print_pre($values);
		($values['type'] == 'input') ? $values['type'] = 'text' : 0;
		try {
		  $formElement = $this->createElement($values['type'], $values['name'], $values);
		}
		catch (Exception $e) {
			return array();
		}
		
    try {
      if(array_key_exists('required', $values) && $values['required'] == true) {
        $this->setRequired(true);
			}
    }
    catch (Exception $e) {}		
		
		if($validators) {
			foreach($validators as $validator) {
				//print_pre($validator);
				$this->addValidatorFromConfig($formElement, $validator);
			}
		}
		
    if($filters) {
      foreach($filters as $filter) {
        //print_pre($filter);
				$this->addFilterFromConfig($formElement, $filter);
      }
    }		
		
		return $formElement;
	}
	
	protected function addValidatorFromConfig($formElement, $validator)
	{
		$breakChain = false;
		$options = array();
		
		if(array_key_exists('breakchain', $validator)) {
			$breakChain = $validator['breakchain'];
		}
		
		if(array_key_exists('options', $validator)) {
      $options = $validator['options'];
    }
		
		$formElement->addValidator($validator['type'], $breakChain, $options);
	}
	
	protected function addFilterFromConfig($formElement, $filter)
	{
	  $options = array();
    
    if(array_key_exists('options', $filter)) {
      $options = $filter['options'];
    }	
		$formElement->addFilter($filter['type'], $options);
	}
}