<?php
/**
 * Provides a class that extends Zend_Form and builds the basic form from a
 * JSON .model file. All Zend_Form options are available. Configuration through
 * the .model file is limited to element options, validators, and filters
 * 
 * @category    Elation
 * @package     Elation_Zend_Ext
 * @subpackage  Elation_Form
 * @author      Lucian Hontau
 */
class Elation_Form extends Zend_Form 
{ 
  const REGULAR_OPTIONS = 1;
	const ELATION_OPTIONS = 2;
	const ELATION_ZEND_JSON_OPTIONS = 3;

  public function __construct($options = null, $optionType = self::REGULAR_OPTIONS) 
  { 
	  if($optionType == self::ELATION_OPTIONS) {
	  	$this->processJSONModel($options);
			parent::__construct();
	  }
		else if($optionType == self::ELATION_ZEND_JSON_OPTIONS) {
			$formOptions = $this->processZendJSONModel($options);
			parent::__construct($formOptions);
		}
		else {
		  parent::__construct($options);
		}
  }
	
	/**
	 * Reads a "class" from a JSON model and populates the form with 
	 * the elements specified therein 
	 * 
	 * @param object $options
	 * @return bool success
	 */
	public function processJSONModel($options)
	{
		$modelFile = $options['file'];
		$objectClass = $options['class'];
		
		$jsonFile = file_get_contents($modelFile);
		
		if($jsonFile !== false) {
			$jsonData = json_decode($jsonFile, true);

			if($jsonData != NULL) {
				//print_pre($jsonData); die;
				try {
					foreach($jsonData['classes'][$objectClass]['form']  as $key => $val) {
						$this->addElement($this->createElementFromConfig($val, $key));
					}		
				}
				catch (Exception $e) {}
			}
		}
		else {
			return false;
		}
		
		return true;
	}
	
	/**
	 * Creates an element with validators, filters, errors, etc. from an array of values previously
	 * read from the JSON model file
	 * 
	 * @param object $values
	 * @return Zend_Form_Element || array on failure (for graceful failure when use
	 *   with Zend_Form::addElement()
	 */
	protected function createElementFromConfig($values, $elementName = NULL)
	{
		$formElement = array();
		$validators = $filters = $errors = NULL;
		
		if(array_key_exists('validators', $values)) {
			$validators = $values['validators'];
			unset($values['validators']); 
		}
		
		if(array_key_exists('filters', $values)) {
      $filters = $values['filters'];
			unset($values['filters']); 
    }
		
	   if(array_key_exists('errors', $values)) {
      $errors = $values['errors'];
      unset($values['errors']); 
    }	
    
		//Do some sanity checks
		($values['type'] == 'input') ? $type = $values['type'] = 'text' : $type = $values['type'];
		($elementName == NULL) ? $elementName = $values['name'] : 0;
		
		try {
		  $formElement = $this->createElement($type, $elementName, $values);
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
		
		if($errors) {
			$this->addErrorMessages($errors);
		}
		
		return $formElement;
	}
	
	/**
	 * Adds a validator to a form element based on an array of options previously
	 * read from the JSON model. Modifies $formElement in place
	 * 
	 * @param object $formElement
	 * @param object $validator
	 * @return bool success
	 */
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
		
		try {
		  $formElement->addValidator($validator['type'], $breakChain, $options);
		}
		catch (Exception $e) {
			return false;
		}
		
		return true;
	}
	
	/**
   * Adds a filter to a form element based on an array of options previously
   * read from the JSON model. Modifies $formElement in place
   * 
	 * @param object $formElement
	 * @param object $filter
	 * @return bool success 
	 */
	protected function addFilterFromConfig($formElement, $filter)
	{
	  $options = array();
    
    if(array_key_exists('options', $filter)) {
      $options = $filter['options'];
    }	
		
		try {
		  $formElement->addFilter($filter['type'], $options);
		}
		catch (Exception $e) {
			return false;
		}
		
		return true;
	}
}