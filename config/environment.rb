# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Initialize the Rails application.
Rails.application.initialize!
Rails.logger = Logger.new("STDOUT")
Rails.logger.level = 0

if $board.nil?
   require 'socket'
   $board = TCPSocket.new('localhost', 27015)
end

