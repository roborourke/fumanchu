/*global jQuery */
/*!
* fumanchu.js 0.1
*
* Copyright 2014, Robert O'Rourke sanchothefat.com
*/
(function($){

	// slightly rubbish handlebars-esque templating thing
	$.fumanchu = function( template, context, fallback, args ) {

		var t = this;

		// default delimiters
		if ( ! $.fumanchu.regex ) {
			$.fumanchu.register( '{{', '}}' );
			$.fumanchu.register( '__', function( out ) { return escape( out ); } );
		}

		// set defaults
		$.fumanchu.context = context || {};
		$.fumanchu.fallback = fallback || context;
		$.fumanchu.args = args || {};

		// avoid breaking catastrophically
		if ( $.type( template ) === 'undefined' )
			return '';

		// if template is a function then run it
		if ( $.type( template ) === 'function' )
			template = template.apply( t, [ $.fumanchu.context, $.fumanchu.fallback, $.fumanchu.args ] );

		// if template is an object then look for a template & override context
		if ( $.type( template ) === 'object' ) {

			// regular object, check for template entry
			if ( template.template ) {
				$.fumanchu.context = template;
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
		return template.toString().replace( $.fumanchu.regex, function( match, p1, p2, p3, p4, p5, offset, s ) {
			// get object property
			var val = $.fumanchu.getpath( p2, $.fumanchu.context, $.fumanchu.fallback ),
				out = '',
				tpl = p5 || $.fumanchu.templates[ p2 ] || $( '[data-template="' + p2 + '"]' ).html();

			// store template if found
			if ( ! $.fumanchu.templates[ p2 ] && tpl )
				$.fumanchu.templates[ p2 ] = tpl;

			console.log( p1, p2, p3, p4, p5 );

			// object type w. template
			if ( $.type( val ) === 'object' && ( tpl || val.template ) ) {
				// check p5 is anything, use as template
				if ( val.template )
					tpl = val.template;
				out = t.fumanchu( tpl, val, $.fumanchu.fallback, args );
			// array|object type
			} else if ( $.type( val ) === 'array' || $.type( val ) === 'object' ) {
				$.each( val, function( i, item ) {
					if ( $.type( item ) === 'object' ) {
						if ( ! item.template && tpl )
							item.template = tpl;
						$.fumanchu.context = item;
					}
					out += t.fumanchu( item, $.fumanchu.context, $.fumanchu.fallback, { list: val, index: i } );
				} );
			// function type
			} else if ( $.type( val ) === 'function' ) {
				out = val.apply( t, [ $.fumanchu.context, $.fumanchu.fallback, args ] );
			// number
			} else if ( $.type( val ) === 'number' ) {
				out = $.fumanchu.numberformat( val, $.fumanchu.fallback );
			// boolean
			} else if ( $.type( val ) === 'boolean' ) {
				out = val ? '1' : '0';
			// string
			} else if ( $.type( val ) === 'string' ) {
				out = val;
			}

			// run delimeter process
			out = $.fumanchu.delimiters[ p1 ].callback( out );

			return t.fumanchu( out, $.fumanchu.context, $.fumanchu.fallback, $.fumanchu.args );
		} );
	};

	// searches an object and returns any found path
	$.fumanchu.getpath = function getpath( path, object, fallback ) {
		path = path.split( '.' );
		if ( path.length == 4 && object && object[ path[0] ] && object[ path[0] ][ path[1] ] && object[ path[0] ][ path[1] ][ path[2] ] && $.type( object[ path[0] ][ path[1] ][ path[2] ][ path[3] ] ) !== 'undefined' )
			return object[ path[0] ][ path[1] ][ path[2] ][ path[3] ];
		if ( path.length == 3 && object && object[ path[0] ] && object[ path[0] ][ path[1] ] && $.type( object[ path[0] ][ path[1] ][ path[2] ] ) !== 'undefined' )
			return object[ path[0] ][ path[1] ][ path[2] ];
		if ( path.length == 2 && object && object[ path[0] ] && $.type( object[ path[0] ][ path[1] ] ) !== 'undefined' )
			return object[ path[0] ][ path[1] ];
		if ( path.length == 1 && object && $.type( object[ path[0] ] ) !== 'undefined' )
			return object[ path[0] ];
		// if we get here try again from the fallback object
		if ( fallback && object !== fallback ) {
			return $.fn.fumanchu.getpath( path.join( '.' ), fallback );
		}
		// empty string if nothing found
		return '';
	};

	// regex
	$.fumanchu.regex = null;

	// add delimiters
	$.fumanchu.delimiters = {};

	// register new delimiters
	$.fumanchu.register = function() {
		if ( ! arguments || ! arguments.length )
			return;

		open = arguments[0];
		close = false;
		callback = false;
		if ( arguments.length === 3 ) {
			close = arguments[1];
			callback = arguments[2];
		} else if ( arguments.length === 2 ) {
			if ( $.type( arguments[1] ) === 'string' )
				close = arguments[1];
			if ( $.type( arguments[1] ) === 'function' )
				callback = arguments[1];
		}

		if ( $.type( open ) !== 'string' )
			return;

		// use same delimiter for close as open if not supplied
		if ( ! close )
			close = open;

		// add standard callback
		if ( $.type( callback ) !== 'function' )
			callback = function( out ) { return out; }

		// store delimiter using opener as key
		$.fumanchu.delimiters[ open ] = {
			open: open,
			close: close,
			callback: callback
		};

		// rebuild regex
		$.fumanchu.regex = new RegExp( '(' +
			$.map( $.fumanchu.delimiters, function( d, key ) { return d.open; } ).join( '|' ) +
			')([a-z0-9\.]+)(' +
			$.map( $.fumanchu.delimiters, function( d, key ) { return d.close; } ).join( '|' ) +
			')((.*?)(?:\\1)\/\\2(?:\\3))?', 'gim' );

	};

	// template cache
	$.fumanchu.templates = {};

	// number handling function
	$.fumanchu.numberformat = function( num, fallback ) {
		return '' + num;
	};

	// prime template cache
	$( document ).ready( function() {
		$( '[data-template]' ).each( function() {
			$.fumanchu.templates[ $( this ).data( 'template' ) ] = $( this ).html();
		} );
	} );

	// allow collection usage, to alter 'this' in callbacks
	$.fn.fumanchu = $.fumanchu;

})(jQuery);
