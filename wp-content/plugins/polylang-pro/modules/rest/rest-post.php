<?php

/**
 * Expose terms language and translations in the REST API
 *
 * @since 2.2
 */
class PLL_REST_Post extends PLL_REST_Translated_Object {

	/**
	 * Constructor
	 *
	 * @since 2.2
	 *
	 * @param object $model         Instance of PLL_Model
	 * @param array  $content_types Array of of post types or taxonomies
	 */
	public function __construct( &$model, $content_types ) {
		parent::__construct( $model, $content_types );

		$this->type = 'post';
		$this->id   = 'ID';
	}
}