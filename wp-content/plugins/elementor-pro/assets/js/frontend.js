/*! elementor-pro - v1.5.5 - 03-07-2017 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ElementorProFrontend = function( $ ) {
	var self = this;

	this.config = ElementorProFrontendConfig;

	this.modules = {};

	var handlers = {
		form: require( 'modules/forms/assets/js/frontend/frontend' ),
		countdown: require( 'modules/countdown/assets/js/frontend/frontend' ),
		posts: require( 'modules/posts/assets/js/frontend/frontend' ),
		slides: require( 'modules/slides/assets/js/frontend/frontend' ),
        share_buttons: require( 'modules/share-buttons/assets/js/frontend/frontend' )
	};

	var initModules = function() {
		self.modules = {};

		$.each( handlers, function( moduleName ) {
			self.modules[ moduleName ] = new this( $ );
		} );
	};

	this.init = function() {
		$( window ).on( 'elementor/frontend/init', initModules );
	};

	this.init();
};

window.elementorProFrontend = new ElementorProFrontend( jQuery );

},{"modules/countdown/assets/js/frontend/frontend":2,"modules/forms/assets/js/frontend/frontend":4,"modules/posts/assets/js/frontend/frontend":9,"modules/share-buttons/assets/js/frontend/frontend":13,"modules/slides/assets/js/frontend/frontend":15}],2:[function(require,module,exports){
module.exports = function() {
	elementorFrontend.hooks.addAction( 'frontend/element_ready/countdown.default', require( './handlers/countdown' ) );
};

},{"./handlers/countdown":3}],3:[function(require,module,exports){
var Countdown = function( $countdown, endTime, $ ) {
	var timeInterval,
		elements = {
			$daysSpan: $countdown.find( '.elementor-countdown-days' ),
			$hoursSpan: $countdown.find( '.elementor-countdown-hours' ),
			$minutesSpan: $countdown.find( '.elementor-countdown-minutes' ),
			$secondsSpan: $countdown.find( '.elementor-countdown-seconds' )
		};

	var updateClock = function() {
		var timeRemaining = Countdown.getTimeRemaining( endTime );

		$.each( timeRemaining.parts, function( timePart ) {
			var $element = elements[ '$' + timePart + 'Span' ],
				partValue = this.toString();

			if ( 1 === partValue.length ) {
				partValue = 0 + partValue;
			}

			if ( $element.length ) {
				$element.text( partValue );
			}
		} );

		if ( timeRemaining.total <= 0 ) {
			clearInterval( timeInterval );
		}
	};

	var initializeClock = function() {
		updateClock();

		timeInterval = setInterval( updateClock, 1000 );
	};

	initializeClock();
};

Countdown.getTimeRemaining = function( endTime ) {
	var timeRemaining = endTime - new Date(),
		seconds = Math.floor( ( timeRemaining / 1000 ) % 60 ),
		minutes = Math.floor( ( timeRemaining / 1000 / 60 ) % 60 ),
		hours = Math.floor( ( timeRemaining / ( 1000 * 60 * 60 ) ) % 24 ),
		days = Math.floor( timeRemaining / ( 1000 * 60 * 60 * 24 ) );

	if ( days < 0 || hours < 0 || minutes < 0 ) {
		seconds = minutes = hours = days = 0;
	}

	return {
		total: timeRemaining,
		parts: {
			days: days,
			hours: hours,
			minutes: minutes,
			seconds: seconds
		}
	};
};

module.exports = function( $scope, $ ) {
	var $element = $scope.find( '.elementor-countdown-wrapper' ),
		date = new Date( $element.data( 'date' ) * 1000 );

	new Countdown( $element, date, $ );
};

},{}],4:[function(require,module,exports){
module.exports = function() {
	elementorFrontend.hooks.addAction( 'frontend/element_ready/form.default', require( './handlers/form' ) );
	elementorFrontend.hooks.addAction( 'frontend/element_ready/subscribe.default', require( './handlers/form' ) );

	elementorFrontend.hooks.addAction( 'frontend/element_ready/form.default', require( './handlers/recaptcha' ) );
};

},{"./handlers/form":7,"./handlers/recaptcha":8}],5:[function(require,module,exports){
module.exports = elementorFrontend.Module.extend( {
	getDefaultSettings: function() {
		return {
			selectors: {
				form: '.elementor-form'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' ),
			elements = {};

		elements.$form = this.$element.find( selectors.form );

		return elements;
	},

	bindEvents: function() {
		this.elements.$form.on( 'form_destruct', this.handleSubmit );
	},

	handleSubmit: function( event, response ) {
		if ( 'undefined' !== typeof response.data.redirect_url ) {
			location.href = response.data.redirect_url;
		}
	}
} );

},{}],6:[function(require,module,exports){
module.exports = elementorFrontend.Module.extend( {

	getDefaultSettings: function() {
		return {
			selectors: {
				form: '.elementor-form',
				submitButton: '[type="submit"]'
			},
			action: 'elementor_pro_forms_send_form',
			ajaxUrl: elementorProFrontend.config.ajaxurl
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' ),
			elements = {};

		elements.$form = this.$element.find( selectors.form );
		elements.$submitButton = elements.$form.find( selectors.submitButton );

		return elements;
	},

	bindEvents: function() {
		this.elements.$form.on( 'submit', this.handleSubmit );
	},

	beforeSend: function() {
		var $form = this.elements.$form;

		$form
			.animate( {
				opacity: '0.45'
			}, 500 )
			.addClass( 'elementor-form-waiting' );

		$form
			.find( '.elementor-message' )
			.remove();

		$form
			.find( '.elementor-error' )
			.removeClass( 'elementor-error' );

		$form
			.find( 'div.elementor-field-group' )
			.removeClass( 'error' )
			.find( 'span.elementor-form-help-inline' )
			.remove()
			.end()
			.find( ':input' ).attr( 'aria-invalid', 'false' );

		this.elements.$submitButton
			.attr( 'disabled', 'disabled' )
			.find( '> span' )
			.prepend( '<span class="elementor-button-text elementor-form-spinner"><i class="fa fa-spinner fa-spin"></i>&nbsp;</span>' );

	},

	getFormData: function() {
		var formData = new FormData( this.elements.$form[ 0 ] );
		formData.append( 'action', this.getSettings( 'action' ) );
		formData.append( 'referrer', location.toString() );

		return formData;
	},

	onSuccess: function( response, status ) {
		var $form = this.elements.$form;

		this.elements.$submitButton
				.removeAttr( 'disabled' )
				.find( '.elementor-form-spinner' )
				.remove();

		$form
			.animate( {
				opacity: '1'
			}, 100 )
			.removeClass( 'elementor-form-waiting' );

			if ( ! response.success ) {
				if ( response.data.errors ) {
					jQuery.each( response.data.errors, function( key, title ) {
						$form
							.find( '#form-field-' + key )
							.parent()
							.addClass( 'elementor-error' )
							.append( '<span class="elementor-message elementor-message-danger elementor-help-inline elementor-form-help-inline" role="alert">' + title + '</span>' )
							.find( ':input' ).attr( 'aria-invalid', 'true' );
					} );

					$form.trigger( 'error' );
				}
				$form.append( '<div class="elementor-message elementor-message-danger" role="alert">' + response.data.message + '</div>' );
			} else {
				$form.trigger( 'submit_success', response.data );

				// For actions like redirect page
				$form.trigger( 'form_destruct', response.data );

				$form.trigger( 'reset' );

				if ( 'undefined' !== typeof response.data.message && '' !== response.data.message ) {
					$form.append( '<div class="elementor-message elementor-message-success" role="alert">' + response.data.message + '</div>' );
				}
			}
	},

	onError: function( xhr, desc ) {
		var $form = this.elements.$form;

		$form.append( '<div class="elementor-message elementor-message-danger" role="alert">' + desc + '</div>' );

		this.elements.$submitButton
			.html( this.elements.$submitButton.text() )
			.removeAttr( 'disabled' );

		$form
			.animate( {
				opacity: '1'
			}, 100 )
			.removeClass( 'elementor-form-waiting' );

		$form.trigger( 'error' );
	},

	handleSubmit: function( event ) {
		var self = this,
			$form = this.elements.$form;

		event.preventDefault();

		if ( $form.hasClass( 'elementor-form-waiting' ) ) {
			return false;
		}

		this.beforeSend();

		jQuery.ajax( {
			url: self.getSettings( 'ajaxUrl' ),
			type: 'POST',
			dataType: 'json',
			data: self.getFormData(),
			processData: false,
			contentType: false,
			success: self.onSuccess,
			error: self.onError
		} );
	}
} );

},{}],7:[function(require,module,exports){
var FormSender = require( './form-sender' ),
	Form = FormSender.extend();

var RedirectAction = require( './form-redirect' );

module.exports = function( $scope ) {
	new Form( { $element: $scope } );
	new RedirectAction( { $element: $scope } );
};

},{"./form-redirect":5,"./form-sender":6}],8:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	var $element = $scope.find( '.elementor-g-recaptcha:last' );

	if ( ! $element.length ) {
		return;
	}

	var addRecaptcha = function( $element ) {
		var widgetId = grecaptcha.render( $element[0], $element.data() ),
			$form = $element.parents( 'form' );

		$element.data( 'widgetId', widgetId );

		$form.on( 'reset error', function() {
			grecaptcha.reset( $element.data( 'widgetId' ) );
		} );
	};

	var onRecaptchaApiReady = function( callback ) {
		if ( window.grecaptcha ) {
			callback();
		} else {
			// If not ready check again by timeout..
			setTimeout( function() {
				onRecaptchaApiReady( callback );
			}, 350 );
		}
	};

	onRecaptchaApiReady( function() {
		addRecaptcha( $element );
	} );
};

},{}],9:[function(require,module,exports){
module.exports = function() {
	var PostsModule = require( './handlers/posts' ),
		CardsModule = require( './handlers/cards' ),
		PortfolioModule = require( './handlers/portfolio' );

	elementorFrontend.hooks.addAction( 'frontend/element_ready/posts.classic', function( $scope ) {
		new PostsModule( { $element: $scope } );
	} );

	elementorFrontend.hooks.addAction( 'frontend/element_ready/posts.cards', function( $scope ) {
		new CardsModule( { $element: $scope } );
	} );

	elementorFrontend.hooks.addAction( 'frontend/element_ready/portfolio.default', function( $scope ) {
		if ( ! $scope.find( '.elementor-portfolio' ).length ) {
			return;
		}

		new PortfolioModule( { $element: $scope } );
	} );
};

},{"./handlers/cards":10,"./handlers/portfolio":11,"./handlers/posts":12}],10:[function(require,module,exports){
var PostsHandler = require( './posts' );

module.exports = PostsHandler.extend( {
	getSkinPrefix: function() {
		return 'cards_';
	}
} );

},{"./posts":12}],11:[function(require,module,exports){
var PostsHandler = require( './posts' );

module.exports = PostsHandler.extend( {
	getElementName: function() {
		return 'portfolio';
	},

	getSkinPrefix: function() {
		return '';
	},

	getDefaultSettings: function() {
		var settings = PostsHandler.prototype.getDefaultSettings.apply( this, arguments );

		settings.transitionDuration = 450;

		jQuery.extend( settings.classes, {
			active: 'elementor-active',
			item: 'elementor-portfolio-item',
			ghostItem: 'elementor-portfolio-ghost-item'
		} );

		return settings;
	},

	getDefaultElements: function() {
		var elements = PostsHandler.prototype.getDefaultElements.apply( this, arguments );

		elements.$filterButtons = this.$element.find( '.elementor-portfolio__filter' );

		return elements;
	},

	getOffset: function( itemIndex, itemWidth, itemHeight ) {
		var settings = this.getSettings(),
			itemGap = this.elements.$postsContainer.width() / settings.colsCount - itemWidth;

		itemGap += itemGap / ( settings.colsCount - 1 );

		return {
			left: ( itemWidth + itemGap ) * ( itemIndex % settings.colsCount ),
			top: ( itemHeight + itemGap ) * Math.floor( itemIndex / settings.colsCount )
		};
	},

	getClosureMethodsNames: function() {
		var baseClosureMethods = PostsHandler.prototype.getClosureMethodsNames.apply( this, arguments );

		return baseClosureMethods.concat( [ 'onFilterButtonClick' ] );
	},

	filterItems: function( term ) {
		var $posts = this.elements.$posts,
			activeClass = this.getSettings( 'classes.active' ),
			termSelector = '.elementor-filter-' + term;

		if ( '__all' === term ) {
			$posts.addClass( activeClass );

			return;
		}

		$posts.not( termSelector ).removeClass( activeClass );

		$posts.filter( termSelector ).addClass( activeClass );
	},

	removeExtraGhostItems: function() {
		var settings = this.getSettings(),
			$shownItems = this.elements.$posts.filter( ':visible' ),
			emptyColumns = ( settings.colsCount - $shownItems.length % settings.colsCount ) % settings.colsCount,
			$ghostItems = this.elements.$postsContainer.find( '.' + settings.classes.ghostItem );

		$ghostItems.slice( emptyColumns ).remove();
	},

	handleEmptyColumns: function() {
		this.removeExtraGhostItems();

		var settings = this.getSettings(),
			$shownItems = this.elements.$posts.filter( ':visible' ),
			$ghostItems = this.elements.$postsContainer.find( '.' + settings.classes.ghostItem ),
			emptyColumns = ( settings.colsCount - ( ( $shownItems.length + $ghostItems.length ) % settings.colsCount ) ) % settings.colsCount;

		for ( var i = 0; i < emptyColumns; i++ ) {
			this.elements.$postsContainer.append( jQuery( '<div>', { 'class': settings.classes.item + ' ' + settings.classes.ghostItem } ) );
		}
	},

	showItems: function( $activeHiddenItems ) {
		$activeHiddenItems.show();

		setTimeout( function() {
			$activeHiddenItems.css( {
				opacity: 1
			} );
		} );
	},

	hideItems: function( $inactiveShownItems ) {
		$inactiveShownItems.hide();
	},

	arrangeGrid: function() {
		var $ = jQuery,
			self = this,
			settings = self.getSettings(),
			$activeItems = this.elements.$posts.filter( '.' + settings.classes.active ),
			$inactiveItems = this.elements.$posts.not( '.' + settings.classes.active ),
			$shownItems = this.elements.$posts.filter( ':visible' ),
			$activeOrShownItems = $activeItems.add( $shownItems ),
			$activeShownItems = $activeItems.filter( ':visible' ),
			$activeHiddenItems = $activeItems.filter( ':hidden' ),
			$inactiveShownItems = $inactiveItems.filter( ':visible' ),
			itemWidth = $shownItems.outerWidth(),
			itemHeight = $shownItems.outerHeight();

		this.elements.$posts.css( 'transition-duration', settings.transitionDuration + 'ms' );

		self.showItems( $activeHiddenItems );

		if ( elementorFrontend.isEditMode() ) {
			self.fitImages();
		}

		self.handleEmptyColumns();

		if ( self.isMasonryEnabled() ) {
			self.hideItems( $inactiveShownItems );

			self.showItems( $activeHiddenItems );

			self.handleEmptyColumns();

			self.runMasonry();

			return;
		}

		$inactiveShownItems.css( {
			opacity: 0,
			transform: 'scale3d(0.2, 0.2, 1)'
		} );

		$activeShownItems.each( function() {
			var $item = $( this ),
				currentOffset = self.getOffset( $activeOrShownItems.index( $item ), itemWidth, itemHeight ),
				requiredOffset = self.getOffset( $shownItems.index( $item ), itemWidth, itemHeight );

			if ( currentOffset.left === requiredOffset.left && currentOffset.top === requiredOffset.top ) {
				return;
			}

			requiredOffset.left -= currentOffset.left;

			requiredOffset.top -= currentOffset.top;

			$item.css( {
				transitionDuration: '',
				transform: 'translate3d(' + requiredOffset.left + 'px, ' + requiredOffset.top + 'px, 0)'
			} );
		} );

		setTimeout( function() {
			$activeItems.each( function() {
				var $item = $( this ),
					currentOffset = self.getOffset( $activeOrShownItems.index( $item ), itemWidth, itemHeight ),
					requiredOffset = self.getOffset( $activeItems.index( $item ), itemWidth, itemHeight );

				$item.css( {
					transitionDuration: settings.transitionDuration + 'ms'
				} );

				requiredOffset.left -= currentOffset.left;

				requiredOffset.top -= currentOffset.top;

				setTimeout( function() {
					$item.css( 'transform', 'translate3d(' + requiredOffset.left + 'px, ' + requiredOffset.top + 'px, 0)' );
				} );
			} );
		} );

		setTimeout( function() {
			self.hideItems( $inactiveShownItems );

			$activeItems.css( {
				transitionDuration: '',
				transform: 'translate3d(0px, 0px, 0px)'
			} );

			self.handleEmptyColumns();
		}, settings.transitionDuration );
	},

    activeFilterButton: function( filter ) {
        var activeClass = this.getSettings( 'classes.active' ),
            $filterButtons = this.elements.$filterButtons,
            $button = $filterButtons.filter( '[data-filter="' + filter + '"]' );

        $filterButtons.removeClass( activeClass );

        $button.addClass( activeClass );
    },

	setFilter: function( filter ) {
		this.activeFilterButton( filter );

		this.filterItems( filter );

		this.arrangeGrid();
	},

	refreshGrid: function() {
		this.setColsCountSettings();

		this.arrangeGrid();
	},

	bindEvents: function() {
		PostsHandler.prototype.bindEvents.apply( this, arguments );

		this.elements.$filterButtons.on( 'click', this.onFilterButtonClick );
	},

	isMasonryEnabled: function() {
		return !! this.getElementSettings( 'masonry' );
	},

	run: function() {
		PostsHandler.prototype.run.apply( this, arguments );

		this.setColsCountSettings();

		this.setFilter( '__all' );

		this.handleEmptyColumns();
	},

	onFilterButtonClick: function( event ) {
		this.setFilter( jQuery( event.currentTarget ).data( 'filter' ) );
	},

	onWindowResize: function() {
		PostsHandler.prototype.onWindowResize.apply( this, arguments );

		this.refreshGrid();
	},

	onElementChange: function( propertyName ) {
		PostsHandler.prototype.onElementChange.apply( this, arguments );

		if ( 'classic_item_ratio' === propertyName ) {
			this.refreshGrid();
		}
	}
} );

},{"./posts":12}],12:[function(require,module,exports){
module.exports = elementorFrontend.Module.extend( {
	getElementName: function() {
		return 'posts';
	},

	getSkinPrefix: function() {
		return 'classic_';
	},

	bindEvents: function() {
		var cid = this.getModelCID();

		elementorFrontend.addListenerOnce( cid, 'resize', this.onWindowResize );
	},

	getClosureMethodsNames: function() {
		return elementorFrontend.Module.prototype.getClosureMethodsNames.apply( this, arguments ).concat( [ 'fitImages', 'onWindowResize', 'runMasonry' ] );
	},

	getDefaultSettings: function() {
		return {
			classes: {
				fitHeight: 'elementor-fit-height',
				hasItemRatio: 'elementor-has-item-ratio'
			},
			selectors: {
				postsContainer: '.elementor-posts-container',
				post: '.elementor-post',
				postThumbnail: '.elementor-post__thumbnail',
				postThumbnailImage: '.elementor-post__thumbnail img'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$postsContainer: this.$element.find( selectors.postsContainer ),
			$posts: this.$element.find( selectors.post )
		};
	},

	fitImage: function( $post ) {
		var settings = this.getSettings(),
			$imageParent = $post.find( settings.selectors.postThumbnail ),
			$image = $imageParent.find( 'img' ),
			image = $image[0];

		if ( ! image ) {
			return;
		}

		var imageParentRatio = $imageParent.outerHeight() / $imageParent.outerWidth(),
			imageRatio = image.naturalHeight / image.naturalWidth;

		$imageParent.toggleClass( settings.classes.fitHeight, imageRatio < imageParentRatio );
	},

	fitImages: function() {
		var $ = jQuery,
			self = this,
			itemRatio = getComputedStyle( this.$element[0], ':after' ).content,
			settings = this.getSettings();

		this.elements.$postsContainer.toggleClass( settings.classes.hasItemRatio, !! itemRatio.match( /\d/ ) );

		if ( self.isMasonryEnabled() ) {
			return;
		}

		this.elements.$posts.each( function() {
			var $post = $( this ),
				$image = $post.find( settings.selectors.postThumbnailImage );

			self.fitImage( $post );

			$image.on( 'load', function() {
				self.fitImage( $post );
			} );
		} );
	},

	setColsCountSettings: function() {
		var currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			settings = this.getElementSettings(),
			skinPrefix = this.getSkinPrefix(),
			colsCount;

		switch ( currentDeviceMode ) {
			case 'mobile':
				colsCount = settings[ skinPrefix + 'columns_mobile' ];
				break;
			case 'tablet':
				colsCount = settings[ skinPrefix + 'columns_tablet' ];
				break;
			default:
				colsCount = settings[ skinPrefix + 'columns' ];
		}

		this.setSettings( 'colsCount', colsCount );
	},

	isMasonryEnabled: function() {
		return !! this.getElementSettings( this.getSkinPrefix() + 'masonry' );
	},

	initMasonry: function() {
		this.elements.$posts.imagesLoaded().always( this.runMasonry );
	},

	runMasonry: function() {
		var $ = jQuery,
			elements = this.elements;

        elements.$posts.css( {
            marginTop: '',
            transitionDuration: ''
        } );

		this.setColsCountSettings();

		var colsCount = this.getSettings( 'colsCount' ),
			hasMasonry = this.isMasonryEnabled() && colsCount >= 2;

		elements.$postsContainer.toggleClass( 'elementor-posts-masonry', hasMasonry );

		if ( ! hasMasonry ) {
			elements.$postsContainer.height( '' );

			return;
		}

		var heights = [],
			distanceFromTop = elements.$postsContainer.position().top,
			$shownPosts = elements.$posts.filter( ':visible' );

		$shownPosts.each( function( index ) {
			var row = Math.floor( index / colsCount ),
				indexAtRow = index % colsCount,
				$post = $( this ),
				itemPosition = $post.position(),
				itemHeight = $post.outerHeight();

			if ( row ) {
				$post.css( 'margin-top', '-' + ( itemPosition.top - distanceFromTop - heights[ indexAtRow ] ) + 'px' );

				heights[ indexAtRow ] += itemHeight;
			} else {
				heights.push( itemHeight );
			}
		} );

		elements.$postsContainer.height( Math.max.apply( Math, heights ) );
	},

	run: function() {
		// For slow browsers
		setTimeout( this.fitImages, 0 );

		this.initMasonry();
	},

	onInit: function() {
		elementorFrontend.Module.prototype.onInit.apply( this, arguments );

		this.bindEvents();

		this.run();
	},

	onWindowResize: function() {
		this.fitImages();

		this.runMasonry();
	},

	onElementChange: function() {
		this.fitImages();

		setTimeout( this.runMasonry );
	}
} );

},{}],13:[function(require,module,exports){
module.exports = function() {
	if ( ! elementorFrontend.isEditMode() ) {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/share-buttons.default', require( './handlers/share-buttons' ) );
	}
};

},{"./handlers/share-buttons":14}],14:[function(require,module,exports){
var HandlerModule = elementorFrontend.Module,
	ShareButtonsHandler;

ShareButtonsHandler = HandlerModule.extend( {
	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		var elementSettings = this.getElementSettings(),
			classes = this.getSettings( 'classes' ),
			isCustomURL = elementSettings.share_url && elementSettings.share_url.url,
			shareLinkSettings = {
				classPrefix: classes.shareLinkPrefix
			};

		if ( isCustomURL ) {
			shareLinkSettings.url = elementSettings.share_url.url;
		} else {
			shareLinkSettings.url = location.href;
			shareLinkSettings.title = elementorProFrontend.config.postTitle;
			shareLinkSettings.text = elementorProFrontend.config.postDescription;
		}

		this.elements.$shareButton.shareLink( shareLinkSettings );

		var shareCountProviders = jQuery.map( elementorProFrontend.config.shareButtonsNetworks, function( network, networkName ) {
			return network.has_counter ? networkName : null;
		} );

		this.elements.$shareCounter.shareCounter( {
			url:  isCustomURL ? elementSettings.share_url.url : location.href,
			providers: shareCountProviders,
			classPrefix: classes.shareCounterPrefix,
			formatCount: true
		} );
	},
	getDefaultSettings: function() {
		return {
			selectors: {
				shareButton: '.elementor-share-btn',
				shareCounter: '.elementor-share-btn__counter'
			},
			classes: {
				shareLinkPrefix: 'elementor-share-btn_',
				shareCounterPrefix: 'elementor-share-btn__counter_'
			}
		};
	},
	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$shareButton: this.$element.find( selectors.shareButton ),
			$shareCounter: this.$element.find( selectors.shareCounter )
		};
	}
} );

module.exports = function( $scope ) {
	new ShareButtonsHandler( { $element: $scope } );
};

},{}],15:[function(require,module,exports){
module.exports = function() {
	elementorFrontend.hooks.addAction( 'frontend/element_ready/slides.default', require( './handlers/slides' ) );
};

},{"./handlers/slides":16}],16:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	var $slider = $scope.find( '.elementor-slides' );

	if ( ! $slider.length ) {
		return;
	}

	$slider.slick( $slider.data( 'slider_options' ) );

	// Add and remove animation classes to slide content, on slider change
	if ( '' === $slider.data( 'animation' ) ) {
		return;
	}

	$slider.on( {
		beforeChange: function() {
			var $sliderContent = $slider.find( '.elementor-slide-content' );

			$sliderContent.removeClass( 'animated ' + $slider.data( 'animation' ) ).hide();
		},

		afterChange: function( event, slick, currentSlide ) {
			var $currentSlide = $( slick.$slides.get( currentSlide ) ).find( '.elementor-slide-content' ),
				animationClass = $slider.data( 'animation' );

			$currentSlide
				.show()
				.addClass( 'animated ' + animationClass );
		}
	} );
};

},{}]},{},[1])
//# sourceMappingURL=frontend.js.map
