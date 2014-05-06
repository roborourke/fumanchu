fumanchu
========

A very lightweight but much less good version of handlebars/mustache.

## Disclaimer

This was put together as part of a larger project where using handlebars was overkill. This
library has not been thoroughly tested and the approach to templates for arrays is a bit
clunky still. Any suggestion or questioning of my sanity is welcome :)

## Usage

Fumanchu requires a minimum of 2 parameters. A template string, and an object containing
the data used to replace special tags with.

Template tags should be placed in double braces `{{key}}` *or* double underscores `__key__`,
handy if you're generating URLs.

```js
var output = $.fumanchu( '{{title}}', { title: 'Some title' } );
// output = 'Some title'
```

Fumanchu will search an object up to 3 levels deep to find data.

```js
var output = $.fumanchu( '{{level1.level2.level3.data}}', {
  level1: {
    level2: {
	  level3: {
	    data: 'I am 4 levels deep!'
	  }
	}
  }
} );
// output = 'I am 4 levels deep!'
```

Fumanchu will accept a fallback object too which is used as a backup search.
Items in the first object with the same name will be used before items in the 2nd.

```js
var output = $.fumanchu( '{{title}} by {{author}}', {
  title: 'Some title'
}, {
  title: 'Fallback title'
  author: 'Robert O\'Rourke'
} );
// output = 'Some title by Robert O\'Rourke'
```

Templates are parsed recursively, this means a value can also contain tags for replacement.

```js
var output = $.fumanchu( '{{title}}', {
  title: 'Some title by {{author}}',
  author: 'Robert O\'Rourke'
} );
// output = 'Some title by Robert O\'Rourke'
```

Values within the hash can be objects, arrays, and even functions.

### Arrays

An array value will be looped through. The array can just contain strings but typically
it would be an array of objects. The objects should have a template specified, this lets
you modify the template per item if you wish.

```js
var output = $.fumanchu( '<ul>{{items}}</ul>', {
  items: [
    {
	  title: 'Title 1',
	  author: 'Joe Pesci',
	  template: '<li>{{title}} by {{author}}</li>'
	},
	{
	  title: 'Title 2',
	  author: 'Robert de Niro',
	  template: '<li>{{title}} by {{author}}</li>'
	}
  ]
} );
// output = '<ul><li>Title 1 by Joe Pesci</li><li>Title 2 by Robert de Niro</li></ul>'
```

Ideally you don't want to have to put the template in every time so you can add default
templates based on the object key.

```js
$.fn.fumanchu.templates.items = '<li>{{title}} by {{author}}</li>';
```

### Functions

Functions can be used as helpers and should typically return a string. The arguments passed
to the function are the objects that were passed to `$.fumanchu()`.

```js
var output = $.fumanchu( '{{titlehelper}}', {
  titlehelper: function( context ) {
    if ( context.showauthor )
      return '{{title}} by {{author}}'
	else
	  return '{{title}}'
  },
  showauthor: true,
  title: 'Some title'
  author: 'Robert O\'Rourke'
} );
// output = 'Some title by Robert O\'Rourke'
```

## Priming the templates object

Fumanchu will search the document for elements with the data attribute `data-template`. The
content of those elements will be stored as templates for use by arrays, or accessible in
functions through the global namespace.

```html
<script type="text/x-fumanchu" data-template="items">
  <li>{{title}} by {{author}}</li>
</script>
```
