<?php


use Elementor\Controls_Manager;
use Elementor\Repeater;
use ElementorPro\Modules\PanelPostsControl\Controls\Group_Control_Posts;
use ElementorPro\Modules\PanelPostsControl\Module;


class ArticlesListWidget extends \Elementor\Widget_Base {

	/**
	 * @var \WP_Query
	 */
	private $_query = null;

	public function get_name() {
		return 'articles-list';
	}

	public function get_title() {
		return 'Articles list';
	}

	public function get_icon() {
		return 'eicon-slider-push';
	}

	public function get_query() {
		return $this->_query;
	}


	protected function _register_controls() {

		$this->start_controls_section(
			'section_articles',
			[
				'label' => __( 'Articles' ),
			]
		);


		$this->add_control(
			'posts_per_page',
			[
				'label'       => 'nb posts',
				'type'        => Controls_Manager::NUMBER,
				'label_block' => true,
			]
		);


		$this->add_group_control(
			Group_Control_Posts::get_type(),
			[
				'name'  => 'posts',
				'label' => __( 'Posts', 'elementor-pro' ),
			]
		);


		$this->end_controls_section();
	}

	public function query_posts() {


		$today = date( 'Ymd' );

		$query_args = Module::get_query_args( 'posts', $this->get_settings() );

		$query_args['posts_per_page'] = $this->get_settings( 'posts_per_page' );

		$query_args['meta_key'] = 'end_date';
		$query_args['orderby']  = 'meta_value';
		$query_args['order']    = 'ASC';


		$query_args['meta_query'] = array(
			array(
				'key'     => 'end_date',
				'value'   => $today,
				'compare' => '>=',
			),
		);

		$this->_query = new \WP_Query( $query_args );
	}

	public function render() {

		$this->query_posts();

		$wp_query = $this->get_query();

		$nb_posts = sizeof( $wp_query->get_posts() );

		echo '<section id="articles_list" class="nb_' . $nb_posts . '">';

		while ( $wp_query->have_posts() ) {
			$wp_query->the_post();

			$this->render_post();
		}

		echo '</section>';

		if ( ! $wp_query->found_posts ) {
			return;
		}


	}

	protected function render_post() {

		global $post;


		$id    = get_the_ID();
		$title = get_the_title();
		$link  = esc_url( get_permalink() );

		$date = complex_date( get_field( 'start_date' ), get_field( 'end_date' ) );


		$default_cat = get_term_by( 'slug', 'other', 'gfarm_eventcategory' );

		$image = get_field_or_parent( 'banner_image', get_the_ID(), 'gfarm_eventcategory' );


		if ( $image === null ) {
			$image = get_field( 'banner_image', $default_cat );
		}


		echo '
		
		<a id="' . $id . '" href="' . $link . '" class="article" style=" background-image: url(' . $image['sizes']['hd'] . ') ">
		
		<div class="content"> 
		<div class="text">
			<h1>' . $title . '</h1>
			<h2>' . $date . '</h2>
		</div>
		</div>
		</a>
		
		';


	}

}