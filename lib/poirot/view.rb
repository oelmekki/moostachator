module Poirot
  class View < Mustache

    def initialize(view_context, template_source)
      @view_context = view_context
      @locals = view_context.view_renderer.instance_variable_get( :@_partial_renderer ).instance_variable_get( :@locals )
      self.template = template_source
      assign_variables!
    end

    def respond_to?(method_sym, include_private = false)
      if view_context.respond_to?(method_sym) 
        true
      else
        super
      end
    end

    def method_missing(method_name, *args, &block)
      if instance_variable_defined?( "@#{method_name}" ) && args.empty?
        instance_variable_get("@#{method_name}")
      else
        view_context.send(method_name,*args, &block)
      end
    end

    private

    attr_reader :view_context

    def assign_variables!
      variables = view_context.instance_variable_names.select{|name| name =~ /^@[^_]/}
      variables.each do |name|
        instance_var = view_context.instance_variable_get(name)
        instance_variable_set(name, instance_var)
        self[name.tr('@','').to_sym] = instance_var
      end

      ( @locals || {} ).each do |name, val|
        instance_variable_set("@#{name}", val)
        self[name] = val
      end

    end
  end
end
