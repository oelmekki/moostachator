Framework.Route = new Class({ 
  initialize: function( config, name ){
    if ( typeof config == 'string' ){
      if ( config.match( /:\w+/ ) ){
        this.config = { scheme: config };
      }

      else {
        this.url = config;
      }
    }

    else {
      this.config = config;

      if ( this.config.append_to && typeOf( this.config.append_to ) == 'string' ){
        this.config.append_to = [ this.config.append_to ];
      }

      if ( config.is_default ){
        this.is_default = true;
        this.default_params = new Hash( ( typeof config.is_default === true ? {} : config.is_default ) );
      }
    }

    this.name = name;
  },


  toUrl: function( params ){
    var url = '', appended = false;

    if ( this.url ){
      return this.url;
    }

    else {
      if ( this.config.append_to ){
        this.config.append_to.each( function( route_name ){
          if ( ! appended && Framework.Route.routes.get( route_name ).satisfiedBy( params ) ){
            url = Framework.Route.routes.get( route_name ).toUrl( params ) + '/';
            appended = true;
          }
        });
      }

      return url + this.config.scheme.replace( /:\w+/g, function( match ){
        match = match.replace( ':', '' );

        if ( ! this.config[ match ] ){
          this.config[ match ] = /.*/;
        }

        if ( params[ match ] ){
          if ( ( params[ match ] + '' ).match( this.config[ match ] ) ){
            return params[ match ];
          }

          else {
            return '';
          }
        }
      }.bind( this ));
    }
  },


  match: function( url, submatching ){
    var regex, match_container = [], params = new Hash(), pattern, appended = false;

    if ( this.url ){
      return url == this.url;
    }

    else {
      regex = this.config.scheme.replace( /:\w+/g, function( match ){
        match = match.replace( ':', '' );
        match_container.push({ name: match, value: null });

        if ( this.config[ match ] ){
          pattern = this.config[ match ];
          if ( typeOf( pattern ) == 'regexp' ){
            pattern = ( pattern + '' ).replace( /^\/(.*)\/[gim]*/, '$1' );
          }
        }

        else {
          pattern = '.*?';
        }

        return '(' + pattern + ')';
      }.bind( this ));

      regex = new RegExp( regex + '$' );

      if ( matches = url.replace( this.config.base_url, '/' ).match( regex ) ){
        matches.shift();

        if ( matches.length ){
          matches.each( function( value, index ){
            match_container[ index ].value = value;
          });
        }


        match_container.each( function( match ){
          params.set( match.name, match.value );
        });


        if ( this.config.append_to ){
          this.config.append_to.each( function( route_name ){
            if ( append_params = Framework.Route.routes.get( route_name ).match( url, true ) ){
              appended = true;
              params.extend( append_params );
            }
          });
        }

        return params;
      }

      else {
        return false;
      }
    }
  },


  satisfiedBy: function( params ){
    var satisfied = true;

    this.config.scheme.replace( /:\w+/g, function( match ){
      match = match.replace( ':', '' );
      if ( typeof params[ match ] == 'undefined' ){
        satisfied = false;
      }
    });

    return satisfied;
  }
});
