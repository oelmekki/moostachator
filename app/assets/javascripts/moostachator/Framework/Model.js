var Framework = window.Framework = {};

(function(){
/*
---

name: Framework.Model

description: base class for models

license: MIT-style license.

author: Olivier El Mekki

provides: [Framework.Model]

...
*/
this.Model = new Class({
  Implements: [ Events, Options ],

  options: {
    Request: Request.JSON,
    base_url: '/',
    format_extension: '',

    find: {
      path: '',
      method: 'get'
    },

    find_all: {
      path: '',
      method: 'get'
    },

    create: {
      path: '',
      method: 'post'
    },

    update: {
      path: '',
      method: 'put'
    },

    destroy: {
      path: '',
      method: 'delete'
    },

    dependencies: {}
  },

  ClassMethods: {
    _cache: new Hash(),

    find: function( params, callback_success, callback_failure ){
      var instance, request;

      callback_success = callback_success || this.default_callback_success.bind( this );
      callback_failure = callback_failure || this.default_callback_failure.bind( this );

      if ( typeOf( params ) == 'number' ){
        if ( this._cache.get( params ) ){
          this.found( callback_success, this._cache.get( params ), params );
        }
      }

      else {
        params = new Hash( params );

        request = new this.prototype.options.Request({
          url: this.compute_find_url( params ),
          method: this.prototype.options.find.method
        });

        request.addEvent( 'success', function( resp ){
          instance = this.build_from_find( resp );
          instance.is_new_record = false;
          instance.response_cache.find = resp;

          if ( instance.get( 'id' ) ){
            this._cache.set( instance.get( 'id' ), instance );
          }

          this.found( callback_success, instance, params );
        }.bind( this ));

        request.addEvent( 'failure', callback_failure );

        params = this.compute_find_params( params );
        request.send( this.prototype.options.find.method == 'get' ? params.toQueryString() : params );
      }
    },


    find_all: function( params, callback_success, callback_failure ){
      var instances, instance, request;

      callback_success = callback_success || this.default_callback_success.bind( this );
      callback_failure = callback_failure || this.default_callback_failure.bind( this );
      params = new Hash( params );

      request = new this.prototype.options.Request({
        url: this.compute_find_all_url( params ),
        method: this.prototype.options.find_all.method
      });

      request.addEvent( 'success', function( resp ){
        instances = this.build_from_find_all( resp );
        this.found_all( callback_success, instances, params );
      }.bind( this ));

      request.addEvent( 'failure', callback_failure );

      params = this.compute_find_all_params( params );
      request.send( this.prototype.options.find_all.method == 'get' ? params.toQueryString() : params );
    },


    create: function( attributes, callback_success, callback_failure ){
      var instance, request;

      instance = this.build_from_create( resp );
      instance.response_cache.create = resp;
      instance.is_new_record = false;
      instance.before_create();

      callback_success = callback_success || this.default_callback_success.bind( this );
      callback_failure = callback_failure || this.default_callback_failure.bind( this );
      attributes = new Hash( attributes );

      request = new this.prototype.options.Request({
        url: this.compute_create_url( attributes ),
        method: this.prototype.options.create.method
      });

      request.addEvent( 'success', function( resp ){
        instance.response_cache.create = resp;

        if ( instance.get( 'id' ) ){
          this._cache.set( instance.get( 'id' ), instance );
        }

        this.created( callback_success, instance, attributes );
        instance.after_create();
      }.bind( this ));

      request.addEvent( 'failure', callback_failure );

      attributes = this.compute_create_params( attributes );
      request.send( this.prototype.options.create.method == 'get' ? attributes.toQueryString() : attributes );
    },


    compute_find_url: function( params ){
      return this.prototype.options.base_url + this.prototype.options.find.path.replace( ':id', params.get( 'id' ) ) + this.prototype.options.format_extension;
    },


    compute_find_params: function( params ){
      return params.erase( 'id' );
    },


    build_from_find: function( resp ){
      return new this( resp );
    },


    found: function( callback, instance, params ){
      callback( instance, params );
    },


    compute_find_all_url: function( params ){
      return this.prototype.options.base_url + this.prototype.options.find_all.path + this.prototype.options.format_extension;
    },


    compute_find_all_params: function( params ){
      return params;
    },


    build_from_find_all: function( resp ){
      var instance, instances = [];

      resp.each( function( attributes ){
        instance = new this( attributes );
        instance.response_cache.find_all = resp;
        instance.is_new_record = false;
        instances.push( instance );
      }.bind( this ));

      return instances;
    },


    found_all: function( callback, instances, params ){
      callback( instances, params );
    },


    compute_create_url: function( params ){
      return this.prototype.options.base_url + this.prototype.options.create.path + this.options.prototype.format_extension;
    },


    compute_create_params: function( params ){
      return params;
    },


    build_from_create: function( params ){
      return new this( params );
    },


    created: function( callback, instance, attributes ){
      callback( instance, attributes );
    },


    default_callback_success: function(){
    },


    default_callback_failure: function(){
    }
  },

  response_cache : {
    find: null,
    find_all: null,
    create: null,
    update: null,
    destroy: null
  },


  initialize: function( attributes, options ){
    this.setOptions( options );

    for ( key in this.options.dependencies ){
       if ( this.options.dependencies.hasOwnProperty( key ) ){
          this.options[ key ] = this.options.dependencies[ key ];
       }
    }

    this.before_initialize();
    this._attributes = new Hash( attributes );
    this.is_new_record = ( this.get( 'id' ) ? false : true );
    this.after_initialize();
  },


  get: function( attributes ){
    var result;

    switch ( typeOf( attributes ) ){
      case 'string':
        return this._attributes.get( attributes );

      case 'array':
        result = new Hash();
        attributes.each( function( attribute ){
          result.set( attribute, this._attributes.get( attribute ) );
        }.bind( this ));
        return result;

      default:
        throw new Error( attributes + ' is neither a string nor an array' );

    }
  },


  getAttributes: function(){
    return this._attributes.getClean();
  },


  set: function( attributes, value ){
    if ( typeOf( attributes ) == 'hash' ){
      this._attributes.extend( attributes );
    }

    else {
      this._attributes[ attributes ] = value;
    }
  },


  save: function( callback_success, callback_failure ){
    ( this.is_new_record ? this._create( callback_success, callback_failure ) : this._update( callback_success, callback_failure ) );
  },


  _create: function( callback_success, callback_failure ){
    var request, attributes;

    this.before_create();
    callback_success = callback_success || this.default_callback_success.bind( this );

    request = new this.options.Request({
      url: this.compute_create_url( this._attributes ),
      method: this.options.create.method
    });

    request.addEvent( 'success', function( resp ){
      this.response_cache.create = resp;
      this.is_new_record = false;
      this.created( callback_success );
      this.after_create();
    }.bind( this ));

    request.addEvent( 'failure', callback_failure );

    attributes = this.compute_create_params( this._attributes );
    request.send( attributes.toQueryString() );
  },


  _update: function( callback_success, callback_failure ){
    var request, attributes;

    this.before_update();
    callback_success = callback_success || this.default_callback_success.bind( this );

    request = new this.options.Request({
      url: this.compute_update_url( this._attributes ),
      method: this.options.update.method
    });

    request.addEvent( 'success', function( resp ){
      this.response_cache.update = resp;
      this.updated( callback_success );
      this.after_update();
    }.bind( this ));

    request.addEvent( 'failure', callback_failure );

    attributes = this.compute_update_params( this._attributes );
    request.send( this.options.update.method == 'get' ? attributes.toQueryString() : attributes );
  },


  created: function( callback ){
    callback( this );
  },


  updated: function( callback ){
    callback( this );
  },


  destroy: function( callback_success, callback_failure ){
    var request, attributes;

    this.before_destroy();

    callback_success = callback_success || this.default_callback_success.bind( this );
    callback_failure = callback_failure || this.default_callback_failure.bind( this );

    if ( ! this.is_new_record ){
      request = new this.options.Request({
        url: this.compute_destroy_url( this._attribute ),
        method: this.options.destroy.method
      });

      request.addEvent( 'success', function( resp ){
        this.response_cache.destroy = resp;
        this.destroyed( callback_success );
        this.after_destroy();
      }.bind( this ));

      request.addEvent( 'failure', callback_failure );

      attributes = this.compute_destroy_params( this._attributes );
      request.send( this.options.destroy.method == 'get' ? attributes.toQueryString() : attributes );
    }

    else {
      throw new Error( "can't delete new record." );
    }
  },


  destroyed: function( callback ){
    callback( this );
  },


  update_attribute: function( attribute, value ){
    this._attributes[ attribute ] = value;
    this.save();
  },


  update_attributes: function( attributes ){
    this._attributes.extend( attributes );
    this.save();
  },


  default_callback_success: function(){
    this.fireEvent( 'success', this );
  },


  default_callback_failure: function(){
    this.fireEvent( 'failure', this );
  },


  compute_create_url: function( params ){
    return this.options.base_url + this.options.create.path + this.options.format_extension;
  },


  compute_create_params: function( params ){
    return params;
  },


  compute_update_url: function( params ){
    return this.options.base_url + this.options.update.path.replace( ':id',  params.get( 'id' ) ) + this.options.format_extension;
  },


  compute_update_params: function( params ){
    return params;
  },


  compute_destroy_url: function(){
    return this.options.base_url + this.options.destroy.path.replace( ':id', this.get( 'id' ) ) + this.options.format_extension;
  },


  compute_destroy_params: function( params ){
    return new Hash();
  },


  // Filters

  before_initialize: function(){
  },


  after_initialize: function(){
  },


  before_save: function(){
  },


  after_save: function(){
  },


  before_create: function(){
  },


  after_create: function(){
  },


  before_update: function(){
  },


  after_update: function(){
  },


  before_destroy: function(){
  },


  after_destroy: function(){
  }
});
}).apply(Framework);
