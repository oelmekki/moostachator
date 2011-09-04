$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "moostachator/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "moostachator"
  s.version     = Moostachator::VERSION
  s.authors     = ["Olivier El Mekki"]
  s.email       = ["oelmekki@gmail.com"]
  s.homepage    = "https://github.com/oelmekki/moostachator"
  s.summary     = "A mootools/mustache rails engine"
  s.description = "Moostachator is a rails mountable engine that provides mvtc (model, view, template, controller) server/client side support through mustache, mustache.js and mootools."

  s.files = Dir["{app,config,db,lib}/**/*"] + ["MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 3.1.0"
  s.add_dependency "mootools-rails"
  s.add_dependency "mustache"
  s.add_dependency "babilu"

  s.add_development_dependency "sqlite3"
end
