Moostachator is a rails-3.1 engine thought to let you share your templates between server and client side.

Load a page, it's generated through server side, no wait for domready.

Want to go to an other page using js? Generate the page with mustache.js.

The javascript framework provided also handle pushtate routing (with hashtag routing fallback). So your users can benefit of fast javascript rendering (client side rendering), and fast reloading (server side rendering) without any need for you to duplicate dom generation.

# Installation

1°) Add in your Gemfile :

    gem 'moostachator', :git => 'git://github.com/oelmekki/moostachator.git'

2°) run "bundle install"

3°) Add in your config/routes.rb :

    mount Moostachator::Engine => "/moostachator"

4°) Create directory app/templates/

5°) Add in your app/assets/javascripts/application.js :

    //= require mootools
    //= require mootools-more
    //= require mootools_ujs
    //= require moostachator/mustache
    //= require moostachator/Framework/ClassMethods
    //= require moostachator/Framework/Model
    //= require moostachator/Framework/HashChange
    //= require moostachator/Framework/Route
    //= require moostachator/Framework/RouterModule
    //= require moostachator/Framework/Template
    //= require moostachator/Framework/View
    //= require moostachator/Framework/Controller


You're done.


# Usage

## Create a page

Add your mustache template in app/templates/<controller_name>/<action_name>.html.mustache

Add your view class in app/views/<controller_name>/<action_name>.rb

Example from poirot :

    app/views/posts/post_list_view.rb

    module Posts
      class PostListView < Poirot::View
        def foo
          "bar"
        end

        def post_link
          post_path(post)
        end
      end
    end


## Get templates from javascript

Load and cache all templates :

    Framework.Template.requestAll( '/moostachator/templates' );

You can then access a template this way :

    Framework.Template.request( '<controller_name>_<template_name>', function( template ){
      var template_string = template.render( data ); // bind object data to mustache template and render it as string
      var $template = template.toElement( data ); // bind object data to mustache template and return template as Element
    });


If you doesn't want to load all templates, but only one when needed, you can rather pass an url :

    Framework.Template.request( '<controller_name>_<template_name>', '/moostachator/templates/<controller_name>_<template_name>', function( template ){
      var template_string = template.render( data ); // bind object data to mustache template and render it as string
      var $template = template.toElement( data ); // bind object data to mustache template and return template as Element
    });

Don't be afraid of repeating this command. If the template is already cached, it will be used without firing request.


## i18n

Thanks to babilu, all your locales are available through I18n object. See [the project page](https://github.com/toretore/babilu) for more on its usage.

In mustache templates, you can use _i to access locales :

    {{_i.articles.title}}

Is the same as erb :

    <%=t 'articles.title' %>


## javascript mvtc framework

moostachator includes my [moo-nojs-mvc framework](https://github.com/oelmekki/moo-nojs-mvc). See its documentation for more.


# Aknowledgment

Moostachator is based upon some great libs :

* [mustache](https://github.com/defunkt/mustache), the logic free templating engine

* [mustache.js](https://github.com/janl/mustache.js), mustache javascript support

* [poirot](https://github.com/olivernn/poirot), rails mustache support

* [babilu](https://github.com/toretore/babilu), make locales accessible through javascript
