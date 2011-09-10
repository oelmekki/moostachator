(function(){
/*
---

name: Framework.View

description: base class for views

license: MIT-style license.

author: Olivier El Mekki

provides: [Framework.View]

...
*/
this.View = new Class({
  Implements: [ Options ],

  options: {
    selectors: {},
    dependencies: {}
  },


  initialize: function( $element, options ){
    this.setOptions( options );

    for ( key in this.options.dependencies ){
       if ( this.options.dependencies.hasOwnProperty( key ) ){
          this.options[ key ] = this.options.dependencies[ key ];
       }
    }

    this.$element = $element;

    if ( this.options.async_run && ! this.fireEvent ){
      Object.append( this, Events.prototype );
    }
  },


  run: function(){
  },


  get: function( key ){
    var $el, selector, cache = true, multiple, within;

    if ( key == 'body' ){
      return document.getElement( 'body' );
    }

    if ( key == 'window' ){
      return window;
    }

    if ( key == 'document' ){
      return document;
    }

    if ( this.hasOwnProperty( '$' + key ) ){
      return this[ '$' + key ];
    }

    else if ( this[ 'get' + key.capitalize() ] ){
      return this[ 'get' + key.capitalize() ]();
    }

    selector = this.options.selectors[ key ];

    if ( typeof selector == 'undefined' ){
      throw new Error( 'view: Can\'t find "' + key + '" selector' );
    }

    within = 'element';

    if ( typeOf( selector ) !== 'string' ){
      if ( selector.hasOwnProperty( 'cache' ) ){
        cache = selector.cache;
      }

      if ( selector.hasOwnProperty( 'within' ) ){
        within = selector.within;
      }

      if ( typeof( selector.multiple ) != 'undefined' ){
        multiple = selector.multiple;
      }
      
      else {
        multiple = !! key.match( /s$/ );
      }

      selector = selector.sel;
    }

    else {
      if ( key.match( /s$/ ) ){
        multiple = true;
      }
    }

    if ( ! this.get( within ) ){
      throw new Error( 'Selector "' + key + '" is supposed to be in "' + within + '" context. Would be better if that context element could be found.' );
    }

    $el = this.get( within )[ multiple ? 'getElements' : 'getElement' ]( selector );

    if ( cache ){
      this[ '$' + key ] = $el;
    }

    return $el;
  }
});
}).apply(Framework);
