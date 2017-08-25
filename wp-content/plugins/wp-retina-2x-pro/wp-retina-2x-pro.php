<?php
/*
Plugin Name: WP Retina 2x Pro
Plugin URI: http://meowapps.com
Description: Make your website look beautiful and crisp on modern displays by creating + displaying retina images.
Version: 5.1.4
Author: Jordy Meow
Author URI: http://meowapps.com
Text Domain: wp-retina-2x
Domain Path: /languages

Originally developed for two of my websites:
- Jordy Meow (http://offbeatjapan.org)
- Haikyo (http://offbeatjapan.org)
*/

global $wr2x_picturefill, $wr2x_retinajs, $wr2x_lazysizes,
	$wr2x_retina_image, $wr2x_core;

$wr2x_version = '5.1.4';
$wr2x_retinajs = '2.0.0';
$wr2x_picturefill = '3.0.2';
$wr2x_lazysizes = '3.0.0';
$wr2x_retina_image = '1.7.2';

// Admin
require( 'wr2x_admin.php');
$wr2x_admin = new Meow_WR2X_Admin( 'wr2x', __FILE__, 'wp-retina-2x' );

// Core
require( 'core.php' );
$wr2x_core = new Meow_WR2X_Core( $wr2x_admin );
$wr2x_admin->core = $wr2x_core;

// Pro Core
require( 'meowapps/core.php' );
new MeowAppsPro_WR2X_Core( 'wr2x', __FILE__, 'wp-retina-2x',
	$wr2x_version, $wr2x_core, $wr2x_admin );

?>
