/*global jQuery */
/*!
* fumanchu.js 0.1
*
* Copyright 2014, Robert O'Rourke sanchothefat.com
*/
(function($){

	// slightly rubbish handlebars-esque templating thing
	$.fn.fumanchu = function( template, context, fallback, args ) {

		var t = this;

		// set defaults
		$.fn.fumanchu.context = context || {};
		$.fn.fumanchu.fallback = fallback || context;
		$.fn.fumanchu.args = args || {};

		// avoid breaking catastrophically
		if ( $.type( template ) === 'undefined' )
			return '';

		// if template is a function then run it
		if ( $.type( template ) === 'function' )
			template = template.apply( t, [ $.fn.fumanchu.context, $.fn.fumanchu.fallback, $.fn.fumanchu.args ] );

		// if template is an object then look for a template & override context
		if ( $.type( template ) === 'object' ) {

			// regular object, check for template entry
			if ( template.template ) {
				$.fn.fumanchu.context = template;
				template = template.template;

			// check if its a jquery selection & try to get content out
			} else {
				try {
					template = template.html();
				} catch(e) {
				}
			}
		}

		// replace any double bracketed strings or double underscored
		return template.toString().replace( /(?:__|{{)([a-z0-9\.]+)(?:}}|__)/gi, function( match, p1, offset, s ) {
			// get object property
			var val = $.fn.fumanchu.getpath( p1, $.fn.fumanchu.context, $.fn.fumanchu.fallback ),
				out = '',
				tpl = $.fn.fumanchu.templates[ p1 ] || $( '[data-template="' + p1 + '"]' ).html();

			// store template if found
			if ( ! $.fn.fumanchu.templates[ p1 ] && tpl )
				$.fn.fumanchu.templates[ p1 ] = tpl;

			// array type
			if ( $.type( val ) === 'array' ) {
				$.each( val, function( i, item ) {
					if ( $.type( item ) === 'object' ) {
						if ( ! item.template && tpl )
							item.template = tpl;
						$.fn.fumanchu.context = item;
					}
					out += t.fumanchu( item, $.fn.fumanchu.context, $.fn.fumanchu.fallback, { list: val, index: i } );
				} );
			// object type
			} else if ( $.type( val ) === 'object' && val.template ) {
				out = t.fumanchu( val.template, val, $.fn.fumanchu.fallback, args );
			// function type
			} else if ( $.type( val ) === 'function' ) {
				out = val.apply( t, [ $.fn.fumanchu.context, $.fn.fumanchu.fallback, args ] );
			// boolean
			} else if ( $.type( val ) === 'boolean' ) {
				out = val ? '1' : '0';
			// number
			} else if ( $.type( val ) === 'number' ) {
				out = $.fn.fumanchu.numberformat( val, $.fn.fumanchu.fallback );
			// string
			} else if ( $.type( val ) === 'string' ) {
				out = val;
			}

			return t.fumanchu( out, $.fn.fumanchu.context, $.fn.fumanchu.fallback, $.fn.fumanchu.args );
		} );
	};

	// searches an object and returns any found path
	$.fn.fumanchu.getpath = function getpath( path, object, fallback ) {
		path = path.split( '.' );
		if ( path.length == 4 && object && object[ path[0] ] && object[ path[0] ][ path[1] ] && object[ path[0] ][ path[1] ][ path[2] ] && object[ path[0] ][ path[1] ][ path[2] ][ path[3] ] )
			return object[ path[0] ][ path[1] ][ path[2] ][ path[3] ];
		if ( path.length == 3 && object && object[ path[0] ] && object[ path[0] ][ path[1] ] && object[ path[0] ][ path[1] ][ path[2] ] )
			return object[ path[0] ][ path[1] ][ path[2] ];
		if ( path.length == 2 && object && object[ path[0] ] && object[ path[0] ][ path[1] ] )
			return object[ path[0] ][ path[1] ];
		if ( path.length == 1 && object && object[ path[0] ] )
			return object[ path[0] ];
		// if we get here try again from the fallback object
		if ( fallback && object !== fallback ) {
			return $.fn.fumanchu.getpath( path.join( '.' ), fallback );
		}
		// empty string if nothing found
		return '';
	};

	// template cache
	$.fn.fumanchu.templates = {};

	// number handling function
	$.fn.fumanchu.numberformat = function( num, fallback ) {
		return num;
	};

	// prime template cache
	$( document ).ready( function() {
		$( '[data-template]' ).each( function() {
			$.fn.fumanchu.templates[ $( this ).data( 'template' ) ] = $( this ).html();
		} );
	} );

})(jQuery);
