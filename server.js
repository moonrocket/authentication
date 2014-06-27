var express	= require('express'); 
var mongoose 	= require('mongoose'); 
var passport 	= require('passport'); 

var config 	= require(__dirname + '/config/config.js'); 
var port 	= process.env.PORT || 8080; 

var app 	= express(); 

app.config 	= config ; 

// CONNECT TO THE DATABASE 
require('./config/db_mongoose')(app, mongoose); 

// CONFIGURE THE PASSPORT AUTHENTICATION HANDLERS
require('./config/passport')(app, passport); 

app.use('/public', express.static(__dirname+'/public'));


// CONFIGURE THE EXPRESS (and routes)
require('./config/express')(app, express, passport); 

// starting server listeners 
app.listen(app.get('port'), function(){
	console.log('your wonder port is: ' + app.get('port')); 
}); 


module.exports = app; 
