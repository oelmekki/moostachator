(function(){

/*
---

name: Request.Mustache

description: prevent script deletion from Request

license: MIT-style license.

author: Olivier El Mekki

provides: [Request.Mustache]

...
*/
Request.Mustache = new Class({ 
  Extends: Request,

	processScripts: function(text){
		return text;
	}
});

/*
---

name: Framework.Template

description: class that handle templates

license: MIT-style license.

author: Olivier El Mekki

requires: [Mustache.js]

provides: [Framework.Template]

...
*/
this.Template = new Class({
  Implements: [ Options ],

  options: {
    Request: Request.Mustache,
    Mustache: Mustache
  },

  ClassMethods: {
    _template_cache: {},
    _partial_cache: {},
    _request_cache: {},

    request: function( name, url, callback ){
      var request, match;

      if ( typeOf( url ) == 'function' ){
        callback = url;
        url = null;
      }

      if ( this._template_cache[ name ] ){
        callback( this._template_cache[ name ] );
      }

      else if ( this._partial_cache[ name ] ){
        callback( this._partial_cache[ name ] );
      }

      else {
        if ( url ){
          request = new this.prototype.options.Request({ url: url, method: 'get', link: 'cancel' });

          request.addEvent( 'success', function( template_string ){
            var template, is_partial;
            
            template_string.replace( /<script type="text\/mustache" id=".*?"( data-partial)?>([\s\S\w\W]*?)<\/script>/, function( match, partial, content ){
              template_string = content;
              is_partial      = !! partial;
            });


            // lookup for partials
            var match = template_string.match( /\{\{>\s*(\w+)\s+\}\}/ );
            if ( match && ! this._partial_cache[ match[1] ] ){
              throw new Error( 'Template ' + name + ' needs partial ' + match[1] + ' but that one is not loaded yet. Please load it.' );
            }

            template = new Framework.Template( template_string );

            this[ is_partial ? '_partial_cache' : '_template_cache' ][ name ] = template;
            callback( template );
          }.bind( this ));

          request.send();
        }

        else {
          throw new Error( 'Template : template ' + name + ' is not cached, and no url was given for retrieval' );
        }
      }
    },


    requestAll: function( url, callback ){
      var request;

      callback = callback ||  function(){};

      if ( this._request_cache[ url ] ){
        callback( this._request_cache[ url ] );
      }

      else {
        request = new this.prototype.options.Request({ url: url, method: 'get', link: 'cancel', evalScript: true });

        request.addEvent( 'success', function( template_string, xml ){
          var templates = [];
          
          template_string = template_string.replace( /<script type="text\/mustache" id="(.*?)_template"( data-partial)?>([\s\S\w\W]*?)<\/script>/g, function( match, name, partial, template_string ){
            var template = new Framework.Template( template_string );
            templates.push({ name: name, template: template });
            this[ !! partial ? '_partial_cache' : '_template_cache' ][ name ] = template;
          }.bind( this ));

          this._request_cache[ url ] = templates;
          callback( templates );
        }.bind( this ));

        request.send();
      }
    },


    getFromPage: function( name, callback ){
      var template = document.getElement( 'script[type="text/mustache"]#' + name + '_template' );
      if ( template ){
        template = new Framework.Template( template.innerHTML );
        this._template_cache[ name ] = template;
        if ( callback ){
           callback( template );
        }

        else {
          return template;
        }
      }
    }
  },


  initialize: function( template_string ){
    this.template_string = template_string;
  },


  render: function( data ){
    return this.options.Mustache.to_html( this.template_string, data, this._rawPartials() );
  },


  toElement: function( data ){
    return Elements.from( this.render( data ) )[0];
  },


  _rawPartials: function(){
    var partials = {};

    Object.each( Framework.Template._partial_cache, function( template, name ){
      partials[ name ] = template.template_string;
    });

    return partials;
  }
});
}).apply( Framework );
