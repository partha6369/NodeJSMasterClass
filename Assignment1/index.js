/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var caller = '';

 // Configure the server to respond to all requests with a string
var server = http.createServer(function(req,res){

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;
  console.log(JSON.stringify(queryStringObject))
  // Find out if "From" exists in Query String.
  // If so, then extract the query parameter as the name of the caller
  // Else, leave the caller as blank
  caller = '';
  if (queryStringObject !== undefined) {
    if (queryStringObject.From !== undefined) {
      caller = queryStringObject.From;
    }
  }

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
      buffer += decoder.write(data);
  });
  req.on('end', function() {
      buffer += decoder.end();

      // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      var data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : buffer
      };

      // Route the request to the handler specified in the router
      chosenHandler(data,function(statusCode,payload){

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object'? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload, null, 3);

        // Return the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        console.log("Returning this response: ",statusCode,payloadString);

      });

  });
});

// Start the server
server.listen(5000,function(){
  console.log('The server is up and running now');
});

// Define all the handlers
var handlers = {};

// Hello handler
handlers.hello = function(data,callback){
  // IF caller is not blank, then include caller in greeting
  // Else, provide a greeting without caller
  if (caller !== undefined && caller !== '') {
    callback(200,{'message':'Hello ' + caller + ', from Partha Majumdar from Bangalore, India'});
  } else {
    callback(200,{'message':'Hello from Partha Majumdar from Bangalore, India'});
  }
};

// Not found handler
handlers.notFound = function(data,callback){
  callback(404);
};

// Define the request router
var router = {
  'hello' : handlers.hello
};
