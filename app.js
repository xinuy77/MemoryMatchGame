// load necessary modules
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');

const ROOT = "./public_html";

// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server listening on port 2406');
var dictionary = {}; //Dictionary of different users
function handleRequest(req, res) {
	
	//process the request
	console.log(req.method+" request for: "+req.url);
	
	//parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;

		
	//the callback sequence for static serving...
	fs.stat(filename,function(err, stats){
		/*if path was /memory/intro, check method*/
		if(urlObj.pathname ==="/memory/intro")
		{
			/*If method was GET, create a new gameboard,
			  and add user object to dictionary*/
			if(req.method === "GET")
			{	
				var user,                        //user object that stores gameboard
				    gameBoard = new Array(4),    //4 x 4 Gameboard
				    numbers   = new Array(16);   //Numbers to input in gameboard
				//Loop to fill numbers array with numbers 1-8
				for(var i = 0; i < 8; i++)
					numbers[i] = i + 1;
				//Loop to fill numbers array with index of 8-16 with numbers 1-8
				for(var i = 8; i < 16; i++)
					numbers[i] = i + 1 - 8;
				var j, x; //tmp value used in next loop
				//Loop to shuffle numbers in numbers array
				for(var i = numbers.length; i; i--)
				{
					j              = Math.floor(Math.random() * i);	
		                        x              = numbers[i - 1];
					numbers[i - 1] = numbers[j];
					numbers[j]     = x;
				}
				//Loop to fill row of gmaeBoard array with col of length 4
				for(var i = 0; i < 4; i++)
					gameBoard[i] = new Array(4);
				var counter = 0; //Couter value used in next loop
				//Loop to fill gameBoard array with elements in numbers array
				for(var i = 0; i < 4; i++)
				{
					for(var j = 0; j < 4; j++)
					{
						gameBoard[i][j] = numbers[counter];
						counter++;
					}
				}
				user                              = {name:urlObj.query.username, gameBoard:gameBoard}; //Sets user Object with username and gameBoard
				dictionary[urlObj.query.username] = user; //Sets userObject in dictionary array, sets key as username
				//Loop to print gameBoard to console
				for(var i = 0; i < 4; i++)
				{
					var out = "";
					for(var j = 0; j < 4; j++)
					{
						out += "" + gameBoard[i][j];
					}
					console.log(out);
				}
				//Respond 200
				res.writeHead(200);
				res.end();
			}
		}
		//if route was /memory/card, check method
		else if(urlObj.pathname === "/memory/card")
		{
			/*if method was GET, get element at row x col
			  data from gameBoard in specified user object 
		          stored in dictionary*/
			if(req.method === "GET")
			{
				var row      = urlObj.query.row,    //Requested row
				    col      = urlObj.query.col,    //Requested col
				    response = dictionary[urlObj.query.username].gameBoard[row][col]; //Response from server, which stores element in gameBoard at row x col in specified user obj
				res.end(JSON.stringify(response));  //Sends response
			}
		}
		//respond error if err
		else if(err)
		{       //try and open the file and handle the error, handle the error
			respondErr(err);
		}
		//Responds index.html as default 
		else
		{
			//Serve index.html if it exists
			if(stats.isDirectory())	filename+="/index.html";
			fs.readFile(filename,"utf8",function(err, data){
				if(err)respondErr(err);
				else respond(200,data);
			});
		}

	});
			
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		var url = ROOT + "/404.html";  //url path to 404.html
		//Serve 404 if it exists
		fs.readFile(url,"utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			respond(404,data);
		});
	}
		
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err); //Print error info to console
		//Serve404 if ENOENT otherwise, responde 500 with error message
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(500,err.message);
		}
	}
		
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
	
};//end handle request







