var http = require('http'); //http server and client functionality
var fs = require('fs'); //filesystemrelayed functionality
var path = require('path'); //fs path related functionality
var mime = require('mime'); //ability to derive a MIME type based on filename extension
var cache = {}; //contents of cached files are stored


function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents){
	response.writeHead(
		200,
		{"content-type":mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}

function serveStatic(response, cache, absPath){
	//check if file is cached in memory
	if(cache[absPath]) {
		//server file from memory
		sendFile(response, absPath, cache[absPath]);
	} 
	else {
		//check if file exists
		fs.exists(absPath, function (exists){
			if (exists){
				//read file from disk
				fs.readFile(absPath, function (err, data){
					if(err){
						send404(response);
					}
					else {
						//cache
						cache[absPath] = data;
						//and serve file from disk
						sendFile(response, absPath, data);
					}
				})
			} 
			else {
				send404(response);
			}
		});
	}

}


//create httpserver using anon function to define per-request behaviour
var server = http.createServer(function(request, response){
	var filePath = false;

	console.log("searching for... " + request.url);
	if(request.url == '/'){
		filePath = 'index.html'; //serve this as default
	} else {
		filePath =  request.url; //translate url path to relative file path

	}

	var absPath = './' +filePath;
	serveStatic(response, cache, absPath); //serve static file
});

server.listen(3000, function(){
	console.log("Server listening on port 3000.");
});

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});


//event brite key: QIY3RFGKIACEQZ32M3