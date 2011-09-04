module Moostachator
  class TemplatesController < ApplicationController
    layout false

    def all
      group           = params[ :group ] || '*'
      templates_glob  = Rails.root.join( 'app', 'templates', group, '*' )
      @templates      = {}
      @partials       = {}

      Dir.glob( templates_glob ).each do |file_name|
        # isolate controller and template name in mustache template path. Ignore non mustache files
        if file_name                                  =~ /.*\/(\w+)\/(.*?)(?:\.\w{2})?(\.html)?\.mustache/
          controller_name, template_name, is_partial  = $1, $2, ! $3
          full_name                                   = ( is_partial ? '' : controller_name + '_' ) + template_name.gsub( /^_/, '' )
          content                                     = File.read( file_name )

          ( is_partial ? @partials : @templates )[ full_name ] = content
        end
      end
    end
  
    def one
      @full_name                      = params[ :template_name ]
      controller_name, template_name  = @full_name.split( /_+/ )
      template_dir                    = Rails.root.join( 'app', 'templates', controller_name )
      paths                           = {}
      paths[ 'general_template' ]     = template_dir.join( template_name + '.html.mustache' )
      paths[ 'localized_template' ]   = template_dir.join( '%s.%s.html.mustache' % [ template_name, I18n.locale ] )
      paths[ 'general_partial' ]      = template_dir.join( template_name + '.mustache' )
      paths[ 'localized_partial' ]    = template_dir.join( '%s.%s.mustache' % [ template_name, I18n.locale ] )

      paths = paths.drop_while { |key, path| ! File.exists?( path ) }
      throw Exception.new( "No template found for #{@full_name}" ) if paths.empty?

      @is_partial = paths.first[0].include?( 'partial' )
      @template   = File.read( paths.first[1] )
    end
  end
end
