/*
      Name: Yu Yamanaka
Student ID: 101008772
  Citation: I have not used any source material other than Notes and Source Code provided in official COMP 2406 website ---> http://people.scs.carleton.ca/~arunka/courses/comp2406/
*/

//Execute script when page is loaded
$(document).ready
(
	function()
	{
		var username     = prompt("Enter your name.") || "User",    //Prompt username, set "User" as default username 
		    flipCount    = 0,                                       //Counter that counts how many flips was made
		    attempt      = 0,                                       //Counter that counts attmepts made by user
		    correctMatch = 0;                                       //Counter that counts successful attempts made by user
		requestBoard();                                             //Request for new board
		
		/*Function that requests for 
		  new board, and registers 
                  new username to server*/
		function requestBoard()
		{
			//Ajax GET method to route /memory/into with query of username
			//Calls displayGame function if succeeds
			$.ajax
			({
				  method:"GET",
				     url:"/memory/intro",
				    data:{'username':username},
				 success: displayGame,
			});
		}
		
		/*Function to display gameboard*/
		function displayGame()
		{
			$("#gameboard").children().off();    //Turns off all event listener in gameboard
			$("#gameboard").empty();             //Empty out gameboard
			$("#gameboard").append('<tr></tr>'); //Appends tr selector to gameboard
			//Loop to fill gameboard with tile divs that has click listener and data of row and col
			for(var i = 0; i < 4; i++)
			{
				for(var j = 0; j < 4; j++)
				{
					div = $("<div class='tile' style = 'background-color:blue' data-row='"+i+"' data-col='"+j+"' data-matching='false'></div>").click(function(){
						chooseTile($(this).attr("data-row"), $(this).attr("data-col")) //Calls chooseTile function if tile was clicked
					});
					$("#gameboard").children().last().append(div); //Sets tile div to gameboard
				}
			$("#gameboard").append('<tr></tr>'); //Adds new tr selector
			}
			
		}
		
		/*Function to ajax call to get number in tile.
		  Inputs row and col as parameter*/
		function chooseTile(row,col)
		{
			flipCount++; //Increments flipcount
			$('div[data-row='+ row +'][data-col='+ col +']').attr("data-matching","true"); //Sets matching attribute to true
			/*Ajax call to route /memory/card with get method with query of 
                          username,row,col. Calls flipTile function uppon success*/
			$.ajax
			({
				  method:"GET",
				     url:"/memory/card",
				    data:{'username':username,'row':row,'col':col},
				 success: function(data){flipTile(data,row,col);},
			});
			
		}
		
		/*Function to flip the tile with value recieved from server.
		  Inputs data, row, col as parameter.*/
		function flipTile(data,row,col)
		{
			var flippingTile = $('div[data-row='+ row +'][data-col='+ col +']'); //Gets tile div to flip
			$("#gameboard").css("pointer-events", "none");                       //Toggle click event during flipping
			//Fade out tile, change background color and and add value after fadeOut
			flippingTile.fadeOut(500, function()
			{
				flippingTile.css("background-color", "white");        //Change background to white
				flippingTile.text(data);                              //Set text in tile to value recieved from server
				//FadeIn, Toggle click event after fadeIn
				flippingTile.fadeIn(function(){
					$("#gameboard").css("pointer-events", "auto");
				});
				//Check the matching if tile was flipped twice
				if(flipCount == 2)
				{
					checkMatching(row,col); //Calls checkMatching function
					flipCount = 0;          //Resets flip count
				}
			});
		}
		
		function checkMatching(row, col)
		{ 
			attempt++;                                                             //Increment attempt
			var matchingTile1 = $('div[data-row='+ row +'][data-col='+ col +']');  //Gets first flipped tile
			    matchingTile1.attr("data-matching", "false");                      //Sets matching attr to false
			var matchingTile2 = $('div[data-matching=true]');                      //Gets second flipped tile
			    matchingTile2.attr("data-matching", "false");                      //Sets matching attr to false
			//If value in tiles did not match, change background to blue and remove text
			if(matchingTile1.text() != matchingTile2.text())
			{
				//Delay so that user can check matching number
				window.setTimeout(function()
				{
					//Change background color to blue, removes text, than fadesIn
					matchingTile1.fadeOut(500,function()
					{
						matchingTile1.text("");
						matchingTile1.css("background-color", "blue");
						matchingTile1.fadeIn();
					});
					//Change background color to blue, removes text, than fadesIn
					matchingTile2.fadeOut(500,function()
					{
						matchingTile2.text("");
						matchingTile2.css("background-color", "blue");
						matchingTile2.fadeIn();
					});
				},1000);
			}
			//If value in tiles did match, increment correctMatch
			else
			{
				correctMatch++;
				//If 8 correct match were made, show user how many attempts were made
				if(correctMatch === 8)
				{
					//Delay so that user can check last matching number
					window.setTimeout(function()
					{	
						alert("You have guessed " + attempt + " times."); //Alert attempt
						requestBoard();                                   //Request new gameboard
					},1000);
				}
			}
		}
		
	}
);

