class DebugLogger < Logger
  def format_message( severity, timestamp, progname, msg )
    date = Time.now

    case true
      when ( msg.kind_of? Exception )
        "#{date}  #{msg.message}\n#{msg.backtrace.join "\n" }" 
      
      when ( msg.is_a? String )
        "#{date}  #{msg}\n"
    else
      "#{date}  #{msg.inspect}\n"
    end
  end
end


module Kernel
  def debug_log( msg )
    unless defined? @@debug_file
      @@debug_file = File.open( Rails.root.to_s + '/log/debug.log', 'a' )
      @@debug_file.sync = true
    end

    @@debug_logger ||= DebugLogger.new( @@debug_file )
    @@debug_logger.debug msg
  end
end
