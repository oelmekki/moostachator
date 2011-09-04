/*
---
description: handles hashchange and back button in ie6/7. Based on Ben Alman's jquery.hashchange plugin ( http://benalman.com/projects/jquery-hashchange-plugin/ )

license: MIT-style

author: Olivier El Mekki <oelmekki@gmail.com>

provides: [HashChangeWrapper,Element.Events.hashchange]

...
*/
var HashChangeWrapper = this.HashChangeWrapper = new Class({ 
  Implements: Options,

  options: {
    iframe_page: '/javascripts/Libs/Framework/fake.html'
  },


  initialize: function( options ){
    this.setOptions( options );

    if ( window != window.parent ){
      return false;
    }

    this.hash = this.getFragment();
    this.last_hash = this.hash;

    if ( Browser.ie && ! this.supported() ){
      this.createIframe();
    }

    else {
      window.onhashchange = this.hashChanged.bind( this );
    }
  },


   historyGet: function(){
     return this.last_hash;
   },


   historySet: function( hash ){
     if ( this.iframe ){
       this.iframe_win.document.open();
       this.iframe_win.document.close();
       this.iframe_win.location.href =  this.options.iframe_page + hash;
       this.iframe_win.location.hash = hash;
     }
   },


   supported: function(){
     return 'onhashchange' in window && ( document.documentMode === undefined || document.documentMode > 7 );
   },


   getFragment: function( url ){
     url = url || window.location.href;
     return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
   },


   getIframeFragment: function(){
     return this.iframe_win.location.hash;
   },


   hashChanged: function(){
     var hash = this.getFragment();

     if ( hash !== this.hash ){
       this.historySet( this.last_hash );
       this.last_hash = this.hash;
       this.hash = hash;
       window.fireEvent( 'hashchange', hash.replace( /^#/, '' ) );
       document.fireEvent('hashchange', hash.replace( /^#/, '' ) );
     }

     else if ( this.historyGet() !== this.getIframeFragment() ){
       var previous = this.historyGet();
       window.location.href = window.location.href.replace( /#.*/, '' ) + previous;
       this.iframe_win.location.href = this.options.iframe_page + previous;
       this.iframe_win.location.hash = previous;
       this.hash = previous;
       window.fireEvent( 'hashchange', previous.replace( /^#/, '' ) );
       document.fireEvent('hashchange', previous.replace( /^#/, '' ) );
     }
   },


   createIframe: function(){
     var iframe = this.iframe = new Element( 'iframe[tabindex="-1"][title="empty"][src="' + this.options.iframe_page + '"]' ).setStyle( 'display', 'none' ).inject( document.getElement( 'body' ), 'after' );

     this.iframe.addEvent( 'load', function( event ){
       var fragment = this.getFragment();
       iframe.removeEvents( 'load' );
       this.iframe_win = $( event.target ).contentWindow;
       this.iframe_win.location.href = this.options.iframe_page + fragment;
       this.iframe_win.location.hash = fragment;
       this.hashChanged.bind( this ).periodical(50);
     }.bind( this ));
   }
});



Element.Events.hashchange = {
  onAdd: function(){
    if ( ! window.hashWrapper ){
      var options;

      options = window.hashchange_iframe_page ? { iframe_page: window.hashchange_iframe_page } : {};
      window.hashWrapper = new HashChangeWrapper( options );
    }
  }
};
