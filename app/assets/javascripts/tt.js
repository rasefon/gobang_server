$(document).ready(function(){
   var canvas = $("#canvas")[0];
   var context = canvas.getContext("2d");

   var margin = 50;

   var is_gaming = false, is_player_turn = true;
   var is_first_step = true;

   var board = new Array(15);
   for (var i=0; i<15; i++) {
      board[i] = new Array(15);
   }

   function resetBoard() {
      for (var i=0; i<15; i++) {
         for (var j=0; j<15; j++) {
            board[i][j] = 0;
         }
      }
      is_gaming = true;
      is_player_turn = true;
      is_first_step = true;
   }

   function windowToCanvas(canvas, x, y) {
      var bbox = canvas.getBoundingClientRect();
      return { x: x - bbox.left * (canvas.width  / bbox.width),
         y: y - bbox.top  * (canvas.height / bbox.height)
      };
   }

   function drwaBoard() {
      context.fillStyle = 'rgba(200,160,60,1.0)';
      context.fillRect(0, 0, 800, 800);

      var x0 = 50, y0 = 50, width = 700, height = 700;
      context.beginPath();
      for (var i = 1; i < 16; i++) {
         context.moveTo(x0*i, y0);
         context.lineTo(x0*i, y0+width);
      }

      for (var j = 1; j < 16; j++) {
         context.moveTo(x0, y0*j);
         context.lineTo(x0+height, y0*j);
      }
      context.stroke();
   }

   function calcBoardPos(x, y) {
      var tmpX = parseInt(((x-50)/50).toFixed()), tmpY = parseInt(((y-50)/50).toFixed());
      if (tmpX < 0) {
         tmpX = 0;
      }

      if (tmpY < 0) {
         tmpY = 0;
      }

      return {x: tmpY, y: tmpX};
   }

   function drawPiece(bx, by, pieceType) {
      if (pieceType == 'b') {
         context.fillStyle = "#000000";
      }
      else if (pieceType == 'w') {
         context.fillStyle = "#FFFFFF";
      }

      context.beginPath();
      var rx = (50+by*50), ry = (50+bx*50), radius = 15;
      context.beginPath();
      context.arc(rx, ry, radius, 0, 2*Math.PI);
      context.closePath();
      context.fill();
   }

   function game_over_checker(result, status, xhr) {
      if (result.is_game_over) {
         //show which side won.
         if (result.black_win) {
            alert("black wins");
         }
         else {
            alert("white wins");
         }
         is_gaming = false;
      }
   }

   function game_over() {
      // Check if game is over.
      var opt_game_over = {
         type: "GET",
         url: "/board/0/game_over",
         dataType: "json",
         success: game_over_checker
      }

      $.ajax(opt_game_over);
   }

   canvas.onmousedown = function (e) {
      if (is_gaming && is_player_turn) {
         var loc = windowToCanvas(canvas, e.clientX, e.clientY);
         var bp = calcBoardPos(loc.x, loc.y);

         var step_success = function(result, status, xhr) {
            drawPiece(bp.x, bp.y, 'b');
            game_over();
            if (is_gaming) {
               // Get computer steps
               alert("cp step");
               var opt = {
                  type: "GET",
                  url:  "/board/0/computer_turn",
                  dataType: "json",
                  success: function (result, status, xhr) {
                     var x0 = parseInt(result.x0);
                     var y0 = parseInt(result.y0);
                     var x1 = parseInt(result.x1);
                     var y1 = parseInt(result.y1);
                     drawPiece(x0, y0, 'w');
                     drawPiece(x1, y1, 'w');
                     is_player_turn = true;
                     is_first_step = true;
                     // Check if game is over.
                     game_over();
                  }
               }
               $.ajax(opt);
               is_first_step = false;
            }
         }

         var step_fail = function(xhr, status, error) {
            alert("invalid step!");
         }

         if (board[bp.x][bp.y] == 0) {
            if (is_first_step) {
               var opt = {
                  type: "POST",
                  url: "/board",
                  data: {x: bp.x, y: bp.y, first_step: 1},
                  dataType: "json",
                  success: function() {
                     game_over();
                  }
               }
               $.ajax(opt);
               
               drawPiece(bp.x, bp.y, 'b');
               board[bp.x][bp.y] = 1;
               is_first_step = false;
            }
            else {
               var opt = {
                  type: "POST",
                  url: "/board",
                  data: {x: bp.x, y: bp.y, first_step: 0},
                  dataType: "json",
                  success: step_success,
                  error: step_fail
               }
               $.ajax(opt);
            }
         }
      }
   }

   $("#new-board").click(function (event) {
      var new_board_success = function(result, status, xhr) {
         resetBoard();
         drwaBoard();
         alert("success");
      }

      var new_board_error = function(xhr, status, error) {
         alert("error");
         is_gaming = false;
      }
      opt = {
         type: "GET",
         url: "/board/new",
         dataType: "json",
         success: new_board_success,
         error: new_board_error
      }

      $.ajax(opt);
   });

   drwaBoard();
});
