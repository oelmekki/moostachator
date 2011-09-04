Rails.application.routes.draw do

  resources :items

  mount Moostachator::Engine => "/moostachator"
  root :to => 'items#index'
end
