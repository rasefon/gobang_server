class BoardController < ApplicationController
   def index
   end

   def computer_turn
      if $board
         $board.write "cp|\0"
         msg = $board.recvfrom(16)
         msg = msg.first.chomp.gsub("\0",'')
         step_arr = msg.split(',');
         render json: {"x0" => step_arr[0], "y0" => step_arr[1], "x1" => step_arr[2], "y1" => step_arr[3]}, status: 200
      end
   end

   def game_over
      if $board
         $board.write "go|\0"
         msg = $board.recvfrom(16)
         msg = msg.first.chomp.gsub("\0", '')
         if "b" == msg
            render json: {"is_game_over" => true, "black_win" => true, "white_win" => false}, status: 201
         elsif "w" == msg
            render json: {"is_game_over" => true, "black_win" => false, "white_win" => false}, status: 201
         elsif "no" == msg
            render json: {"is_game_over" => false}, status: 201
         else
            render status: 500
         end
      end
   end

   def new
      if $board
         $board.write "new|\0"
         msg = $board.recvfrom(16).first.chomp.gsub("\0",'')
         if "201" == msg
            render json: {"msg" => "Game started!"}, status: 201
         else
            render json: {"msg" => "Unknown error!"}, status: 500
         end
      else
         render json: {"msg" => "server not available"}, status: 503
      end
   end

   def create
      if $board
         if params[:first_step] == '1'
            step_msg = "|#{params[:x]},#{params[:y]}|0\0"
            $board.write step_msg
         else
            step_msg = "|#{params[:x]},#{params[:y]}|1\0"
            $board.write step_msg
            msg = $board.recvfrom(16).first.chomp.gsub("\0",'')
            if "200" == msg
               render json: {"msg" => "Computer turn"}, status: 200
            elsif "403" == msg
               render json: {"msg" => "Invalid step"}, status: 403
            end
         end
      else
         render json: {"msg" => "server not available"}, status: 503
      end
   end
end
