module Lucy
  def self.javascript_dir
    @js_dir ||= File.join( Rails.root, 'app', 'assets', 'javascripts' )
  end
end
