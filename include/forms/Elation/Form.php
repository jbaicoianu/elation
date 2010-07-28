<?php
/**
 * Provides a class that extends Zend_Form and builds the basic form from a
 * JSON .model file. Configuration through the .model file is limited to 
 * element options, validators, filters, and errors when using the ELATION_OPTIONS_SIMPLE
 * type but can accept a Zend_Config object or regular array using REGULAR_OPTIONS
 * and full config options in JSON format from a .model file using ELATION_OPTIONS_ZEND
 * 
 * @category    Elation
 * @package     Elation_Zend_Ext
 * @subpackage  Elation_Form
 * @extends     Zend_Form
 * @author      Lucian Hontau
 */
class Elation_Form extends Zend_Form 
{ 
  const REGULAR_OPTIONS        = 1;
	const ELATION_OPTIONS_SIMPLE = 2;
	const ELATION_OPTIONS_ZEND   = 3;

  public function __construct($options = null, $optionType = self::REGULAR_OPTIONS) 
  { 
    $this->build($options, $optionType);
  }
	
	/**
	 * Builds the actual form depending on the type of config and the options passed in.
	 * Called without arguments it just builds an empty form
	 * 
	 * @param object $options [optional]
	 * @param object $optionType [optional]
	 * @return void
	 */
	public function build($options = null, $optionType = self::REGULAR_OPTIONS) 
	{
    if($optionType == self::ELATION_OPTIONS_SIMPLE) {
      $this->processJSONModel($options);
      parent::__construct();
    }
    else if($optionType == self::ELATION_OPTIONS_ZEND) {
      $formOptions = $this->getZendJSONConfigFromModel($options);
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
	 * @return bool success status
	 */
	public function processJSONModel($options)
	{
		$modelFile = $options['file'];
		$objectClass = $options['class'];
		
		$jsonFile = file_get_contents($modelFile);
		
		if($jsonFile !== false) {
      if(array_key_exists('variables', $options)) {
        $jsonFile = $this->processConfigVariables($jsonFile, $options['variables']);
      }
						
			$jsonData = json_decode($jsonFile, true);

			if($jsonData != NULL) {
				try {
					foreach($jsonData['classes'][$objectClass]['form']  as $key => $val) {
						$element = $this->createElementFromConfig($val, $key);
						if($element) {
						  $this->addElement($element);
						}
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
	 * @return Zend_Form_Element|bool element or success status
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
			return false;
		}
		
    try {
      if(array_key_exists('required', $values) && $values['required'] == true) {
        $this->setRequired(true);
			}
    }
    catch (Exception $e) {}		
		
		if($validators) {
			foreach($validators as $validator) {
				$this->addValidatorFromConfig($formElement, $validator);
			}
		}
		
    if($filters) {
      foreach($filters as $filter) {
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
	 * @return bool success status
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
	 * @return bool success status
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
	
	/**
	 * Reads data from a .model file / class. Expects the form element to follow Zend_Config
	 * style options for initializing from the JSON. This allows all Zend_Form / Element /
	 * Filter / Errors / Decorators etc. to be configured, but the format must follow a more 
	 * rigid and different JSON structure. To see something similar in .ini see: 
	 * http://framework.zend.com/manual/en/zend.form.forms.html
	 * 
	 * @param object $options
	 * @return array|bool processed array of options or success status
	 */
	public function getZendJSONConfigFromModel($options)
	{
    $modelFile = $options['file'];
    $objectClass = $options['class'];
    
    $jsonFile = file_get_contents($modelFile);
    
    if($jsonFile !== false) {
      if(array_key_exists('variables', $options)) {
        $jsonFile = $this->processConfigVariables($jsonFile, $options['variables']);
      }

      $jsonData = json_decode($jsonFile, true);
			
      if($jsonData != NULL) {
	      try {
	       	$returnArray = $jsonData['classes'][$objectClass]['form'];
          return $returnArray;
        }
        catch (Exception $e) {
        	return false;
        }
			}
		}

		return false;
	}
	
	/**
	 * Renders the form. If $context is null or a Zend_View it'll render it
	 * normally. Otherwise, it passes the form object to a component for further
	 * processing. Note, even if passed to a second controller, it's still 
	 * possible to render the form in traditional Zend style with {$form}
	 * 
	 * @param object $context [optional]
	 * @param object $args [optional]
	 * @return string HTML output
	 */
  public function render($context = NULL, $args = array())
	{
		if($context == NULL) {
			$context = new Zend_View();
		}
		
		if($context instanceof Zend_View_Interface) {
			return parent::render($context);
		}
		else {
			$args = array_merge($args, array('form' => $this));
			$componentOutput = ComponentDispatcher::fetch($context, $args);
			return $componentOutput;
		}
	}
	
	/**
	 * Processes a JSON string and replaces variables with actual values. 
	 * Technically the string does not have to be json. The format of the
	 * The format of options should be key => value. Keys should include
	 * the enclosing double brackets, ie: [[var]]
	 * 
	 * @param string $json
	 * @param array $options
	 * @return string The processed output or void if one of the parameters isn't correct
	 */
	protected function processConfigVariables($json, $options)
	{
		if(!isset($json) || empty($json) || !isset($options) || empty($options)) {
			return;
		}
	   
    $json = str_replace(array_keys($options), array_values($options), $json);		
		return $json;
	}
}