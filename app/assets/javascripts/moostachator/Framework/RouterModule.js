Framework.RouterModule = new Class({ 
// options: {
//   routes: {
//     'name': 'pouet/page/:page/:status',
//     'name2': { scheme: 'kikoo/:lol', lol: /kikoo|lol/ }
//   }
// }
  initRoutes: function(){
    var first_pop = true;

    if ( ! this.options.base_path ){
      throw new Error( 'You must specify a base_path options.' );
    }

    if ( ! this.options.routes ){
      throw new Error( 'You have implemented a Router, but there is no routes options in your class' );
    }

    if ( ! this.options.nopushstate_routing && ( ! window.history || ! window.history.pushState ) ){
      this.options.nopushstate_routing = true;
    }

    this.base_domain  = this.location.href.replace( /(https?:\/\/.*?\/).*/, '$1' );
    this.base_url     = ( this.base_domain + this.options.base_path + '/' );
    this.initial_url  = this.location.href;
    this.current_url  = this.initial_url;
    this.previous_url = '';

    Framework.Route.routes = new Hash({});
    ( new Hash( this.options.routes ) ).each( function( params, name ){
      this.options.routes[ name ].base_url = params.base_url = this.base_url;
      Framework.Route.routes.set( name, new Framework.Route( params, name ) );
    }.bind( this ));

    if ( ( ! this.options.rewrite_route || ! this.rewriteRoute() ) && this.options.execute_action_on_load ){
      this.parseRoute();
    }

    if ( this.options.nopushstate_routing ){
      window.addEvent( 'hashchange', function(){
        this.parseRoute();
      }.bind( this ));
    }

    else {
      var params;

      window.onpopstate = function( event ){
        if ( first_pop ){
          first_pop = false;
        }

        else {
          if ( window.crashed ){
            window.location.reload();
          }

          else {
            this.previous_url = this.current_url;
            this.current_url  = this.location.href;

            this.parseRoute();
          }
        }
      }.bind( this );
    }
  },


  /**
   * Rewrite current route to ajax one
   */
  rewriteRoute: function(){
    var params, redirect = false;

    if ( ! this.options.nopushstate_routing ){
      return false;
    }

    Framework.Route.routes.each( function( route, name ){
      if ( ! redirect ){
        if ( ! this.location.href.match( /#!/ ) && ( params = route.match( this.location.href ) ) ){
          this.location.href = this.base_url + '#!' + route.toUrl( params );
          redirect = true;
        }
      }
    }.bind( this ));

    return redirect;
  },


  /**
   * Parse current url and set params
   */
  parseRoute: function( options ){
    var params, match_found, callback;

    options               = options || {};
    callback              = options.callback;
    options.current_url   = this.current_url;
    options.previous_url  = this.previous_url;

    Framework.Route.routes.each( function( route, name ){
      if ( ! match_found ){
        if ( params = route.match( this.location.href ) ){
          match_found = route;
        }
      }
    });

    if ( ! match_found ){
      match_found = this.getDefaultRoute();

      if ( match_found ){
        params = match_found.default_params;
      }
    }

    if ( match_found ){

      if ( callback ){
        callback( params, match_found, options );
      }

      else {
        this[ 'action' + match_found.name.capitalize() ]( params, match_found, options );
      }
    }
  },


  changeRoute: function( route_name, params ){
    var url, options;

    // change route from an element event
    if ( typeOf( route_name ) == 'element' ){
      params = new Hash();
      route_name.get( 'data-params' ).replace( /(.*?)=([^,]+),?/g, function( match, key, value ){
        params.set( key, value );
      });

      route_name = route_name.get( 'data-route' );
    }

    else {
      params = new Hash( params );
    }


    url               = Framework.Route.routes.get( route_name ).toUrl( params );
    this.previous_url = this.current_url;
    this.current_url  = this.base_url + ( this.options.nopushstate_routing ? '#!/' : '' ) + url;
    options           = { 
      previous_url: this.previous_url,
      current_url:  this.current_url
    };

    if ( this.options.nopushstate_routing ){
      this.location.href  = this.current_url;
    }

    else {
      window.history.pushState( params, '', this.current_url );
    }


    this[ 'action' + route_name.capitalize() ]( params, Framework.Route.routes.get( route_name ), options );
  },


  getDefaultRoute: function(){
    var default_route;

    Framework.Route.routes.each( function( route, name ){
      if ( route.is_default ){
        default_route = route;
      }
    });

    return default_route;
  }
});
