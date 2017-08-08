<?php
namespace ElementorPro;

use Elementor\Revisions_Manager;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Upgrades {

	public function __construct() {
		add_action( 'init', [ __CLASS__, 'init' ], 20 );
	}

	public static function init() {
		$version = get_option( 'elementor_pro_version' );

		// Normal init
		if ( ELEMENTOR_PRO_VERSION === $version ) {
			return;
		}

		self::check_upgrades( $version );

		Plugin::elementor()->posts_css_manager->clear_cache();

		update_option( 'elementor_pro_version', ELEMENTOR_PRO_VERSION );
	}

	private static function _upgrade_v130() {
		global $wpdb;

		// Fix Button widget to new sizes options
		$post_ids = $wpdb->get_col(
			$wpdb->prepare(
				'SELECT `post_id` FROM %1$s WHERE `meta_key` = "_elementor_data" AND `meta_value` LIKE "%2$s";',
				$wpdb->postmeta,
				'%"widgetType":"form"%'
			)
		);

		if ( empty( $post_ids ) )
			return;

		foreach ( $post_ids as $post_id ) {
			$data = Plugin::elementor()->db->get_plain_editor( $post_id );
			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::elementor()->db->iterate_data( $data, function( $element ) {
				if ( empty( $element['widgetType'] ) || 'form' !== $element['widgetType'] ) {
					return $element;
				}

				if ( ! isset( $element['settings']['submit_actions'] ) ) {
					$element['settings']['submit_actions'] = [ 'email' ];
				}

				if ( ! empty( $element['settings']['redirect_to'] ) ) {
					if ( ! in_array( 'redirect', $element['settings']['submit_actions'] ) ) {
						$element['settings']['submit_actions'][] = 'redirect';
					}
				}

				if ( ! empty( $element['settings']['webhooks'] ) ) {
					if ( ! in_array( 'webhook', $element['settings']['submit_actions'] ) ) {
						$element['settings']['submit_actions'][] = 'webhook';
					}
				}

				return $element;
			} );

			self::save_editor( $post_id, $data );
		}
	}

	private static function save_editor( $post_id, $posted ) {
		// Change the global post to current library post, so widgets can use `get_the_ID` and other post data
		if ( isset( $GLOBALS['post'] ) ) {
			$global_post = $GLOBALS['post'];
		}
		$GLOBALS['post'] = get_post( $post_id );

		$editor_data = self::_get_editor_data( $posted );

		// We need the `wp_slash` in order to avoid the unslashing during the `update_post_meta`
		$json_value = wp_slash( wp_json_encode( $editor_data ) );

		$is_meta_updated = update_metadata( 'post', $post_id, '_elementor_data', $json_value );

		if ( $is_meta_updated ) {
			Revisions_Manager::handle_revision();
		}

		// Restore global post
		if ( isset( $global_post ) ) {
			$GLOBALS['post'] = $global_post;
		} else {
			unset( $GLOBALS['post'] );
		}

		do_action( 'elementor/editor/after_save', $post_id, $editor_data );
	}

	private static function _get_editor_data( $data, $with_html_content = false ) {
		$editor_data = [];

		foreach ( $data as $element_data ) {
			$element = Plugin::elementor()->elements_manager->create_element_instance( $element_data );

			if ( ! $element ) {
				continue;
			}

			$editor_data[] = $element->get_raw_data( $with_html_content );
		} // End Section

		return $editor_data;
	}

	private static function _upgrade_v140() {
		global $wpdb;

		// Move all posts columns to classic skin (Just add prefix)
		$post_ids = $wpdb->get_col(
			$wpdb->prepare(
				'SELECT `post_id` FROM %1$s WHERE `meta_key` = "_elementor_data" AND `meta_value` LIKE "%2$s";',
				$wpdb->postmeta,
				'%"widgetType":"posts"%'
			)
		);

		if ( empty( $post_ids ) )
			return;

		foreach ( $post_ids as $post_id ) {
			$data = Plugin::elementor()->db->get_plain_editor( $post_id );
			if ( empty( $data ) ) {
				continue;
			}

			$data = Plugin::elementor()->db->iterate_data( $data, function( $element ) {
				if ( empty( $element['widgetType'] ) || 'posts' !== $element['widgetType'] ) {
					return $element;
				}

				$fields_to_change = [
					'columns',
					'columns_mobile',
					'columns_tablet',
				];

				foreach ( $fields_to_change as $field ) {
					// TODO: Remove old value later
					$new_field_key = 'classic_' . $field;
					if ( isset( $element['settings'][ $field ] ) && ! isset( $element['settings'][ $new_field_key ] ) ) {
						$element['settings'][ $new_field_key ] = $element['settings'][ $field ];
					}
				}

				return $element;
			} );

			Plugin::elementor()->db->save_editor( $post_id, $data );
		}
	}

	private static function check_upgrades( $elementor_pro_version ) {
		// It's a new install
		if ( ! $elementor_pro_version ) {
			return;
		}

		$elementor_pro_upgrades = get_option( 'elementor_pro_upgrades', [] );

		$upgrades = [
			'1.3.0'  => '_upgrade_v130',
			'1.4.0'  => '_upgrade_v140',
		];

		foreach ( $upgrades as $version => $function ) {
			if ( version_compare( $elementor_pro_version, $version, '<' ) && ! isset( $elementor_upgrades[ $version ] ) ) {
				self::$function();
				$elementor_pro_upgrades[ $version ] = true;
				update_option( 'elementor_pro_upgrades', $elementor_pro_upgrades );
			}
		}
	}
}
