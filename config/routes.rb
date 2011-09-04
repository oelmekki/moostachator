Moostachator::Engine.routes.draw do
  match 'templates(/:group)'      => 'templates#all', :via => :get
  match 'template/:template_name' => 'templates#one', :via => :get
end
