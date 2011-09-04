(function(){
/*
---

name: Framework.Controller

description: base class for Controllers

license: MIT-style license.

author: Olivier El Mekki

provides: [Framework.Controller]

...
*/
this.Controller = new Class({
  Implements: [ Options, Events ],

  options: {
    View:             this.View,
    events:           {},
    before_filters:   [],
    dependencies:     {},
    debug:            false,
    stopOnError:      true
  },


  initialize: function( $element, options, location ){
    if ( ! $element ){
      if ( this.options.debug ){
        throw new Error( 'Controller initialized without element' );
      }

      return false;
    }

    var run = true;

    this.setOptions( options );

    for ( key in this.options.dependencies ){
       if ( this.options.dependencies.hasOwnProperty( key ) ){
          this.options[ key ] = this.options.dependencies[ key ];
       }
    }

    this.$element = $element;
    this.createView();
    
    this.location = location || window.location;

    this.options.before_filters.each( function( filter ){
      if ( run && this[ filter ]() === false ){
        run = false;
      }
    }.bind( this ));

    this._events = {};

    if ( run ){
      if ( this.view.options && this.view.options.async_run ){
        this.view.addEvent( 'ready', function(){
          this.beforeBindEvents();

          if ( typeof ENV == 'undefined' || ENV != 'test' ){
             this.bindEvents();
          }

          this.run();
        }.bind( this ));

        this.view.run();
      }

      else {
        this.view.run();
        this.beforeBindEvents();

        if ( typeof ENV == 'undefined' || ENV != 'test' ){
           this.bindEvents();
        }

        this.run();
      }
    }
  },


  createView: function(){
    this.view = new this.options.View( this.$element, { dependencies: this.options.dependencies });
  },


  beforeBindEvents: function(){
  },


  run: function(){
  },


  bindEvents: function(){
    ( new Hash( this.options.events )).each( function( e ){
      this.bindEvent( e );
    }.bind( this ));
  },


  bindEvent: function( e ){
    var callback_name, wrapper_func, view, debug, stopOnError, final_func;

    if ( ! this.view.get( e.el ) ){
      throw new Error( 'Controller : selector "' + e.el + '" do not return any element.' );
    }

    callback_name = this._getCallbackName( e );
    view          = this.view;
    debug         = this.options.debug;
    stopOnError   = this.options.stopOnError;

    if ( e.delegate ){
      wrapper_func = function( event, callback ){
        var sel, $target;

        if ( window.crashed && stopOnError ){
          if ( this.errorCallback ){
            this.errorCallback();
          }

          return true;
        }

        $target = $( event.target );
        sel     = view.options.selectors[ e.delegate ];

        if ( ! sel ){
          throw new Error( 'You asked controller to delegate "' + e.el + '" ' + e.type + ' events on "' + e.delegate + '" elements. What about having some "' + e.delegate + '" definition in your view?' );
        }

        if ( typeof sel != 'string' ){
          sel = sel.sel;
        }

        if ( $target.getParent( sel ) ){
          $target = $target.getParent( sel );
        }

        if ( $target.match( sel ) ){
          if ( e.stop === true || ( e.type == 'click' && e.stop !== false ) ){
            event.stop();
          }

          callback( $target, event );
        }
      };
    }

    else {
      wrapper_func = function( event, callback ){
        var sel, $target;

        if ( window.crashed && stopOnError ){
          if ( this.errorCallback ){
            this.errorCallback();
          }

          return true;
        }

        if ( e.stop === true || ( e.type == 'click' && e.stop !== false ) ){
          event.stop();
        }

        $target = $( event.target );

        if ( e.ensure_element !== false ){
          sel = view.options.selectors[ e.el ];

          if ( ! sel ){
            if ( debug ){
              throw new Error( 'You asked controller to ensure element on "' + e.el + '" ' + e.type + ' events, but it\'s appear there is no "' + e.el + '" selector. ensure_element (set as default) do not work for now with dynamic getters. Please either set "ensure_element: false" in your event definition, or use a static event in your view.' );
            }
          }

          else {
            if ( typeof sel != 'string' ){
              sel = sel.sel;
            }

            if ( $target.getParent( sel ) ){
              $target = $target.getParent( sel );
            }
          }
        }

        callback( $target, event );
      };
    }

    if ( ! this[ callback_name ] ){
      this[ callback_name ] = function( $target, event ){
        if ( e.view_method ){
          this.view[ e.view_method ]( $target );
        }

        else {
          this.view[ callback_name ]( $target );
        }
      }.bind( this );
    }


    // ensure event cache key existence

    if ( ! this._events[ e.type ] ){
      this._events[ e.type ] = [];
    }

    // handles cancel delay
    if ( e.cancel_delay && e.cancel_delay > 0 ){
      final_func = function( event ){
        window.clearTimeout( this[ callback_name + '_timeout' ] );

        this[ callback_name + '_timeout' ] = window.setTimeout( function(){
          wrapper_func( event, this[ callback_name ].bind( this ) );
        }.bind( this ), e.cancel_delay );
      }.bind( this );

      this._events[ e.type ].push({ $element: this.view.get( e.el ), func: final_func });
      this.view.get( e.el ).addEvent( e.type, final_func );
    }

    // direct execution
    else {
      final_func = function( event ){
        wrapper_func( event, this[ callback_name ].bind( this ) );
      }.bind( this );

      this._events[ e.type ].push({ $element: this.view.get( e.el ), func: final_func });
      this.view.get( e.el ).addEvent( e.type, final_func );
    }
  },


  _getCallbackName: function( e ){
    if ( e.controller_method ){
      return e.controller_method;
    }

    if ( e.view_method ){
      return e.view_method;
    }

    return ( e.delegate ? e.delegate : e.el ) + e.type.capitalize() + ( e.type.match( /e$/ ) ? 'd' : 'ed' );
  },


  unregister: function(){
    Object.each( this._events, function( events, event_type ){
      events.each( function( event ){
        event.$element.removeEvent( event_type, event.func );
      });
    });
  }
});
}).apply(Framework);

window.addEvent( 'error', function(){
  window.crashed = true;
});
