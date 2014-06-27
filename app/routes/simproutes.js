var express 	= require('express'); 
var Router 	= express.Router(); 
var config 	= require('../../config/config'); 
var passport 	= require('passport'); 
var multipart 	= require('connect-multiparty'); 
//var lodash 	= require('lodash');
//var auth 	= require(config.root + '/app/middleware/authorization'); 
var fs 		= require('fs'); 
var multipartMiddleware = multipart({
		uploadDir:"./tmp",
		maxFilesSize: 1024*1024
	}); 

// pre-request handlers 
var jwtcheck 	= require('./jwtauth'); 
var logincheck  = require('./islogged'); 

var API = {};
var FRONT = {};

/*TODO later we'll store dico in json files
*/
var dico = {
	'en-US': {
		'hint_mail': "your email address"
		,'btn_signup': "sign up"
		,'popup_mail_taken': "mail is already taken"
		,'popup_user_notfound': "user was not found"
	}
	,'fr': {
		'hint_mail': "votre email"
		,'btn_signup': "s'enregistrer"
		,'popup_mail_taken': "l'adresse email est déjà prise"
		,'popup_user_notfound': "l'utilisater n'a pas été trouvé"
	}
}


var Users = require(config.root + '/app/routes/front/users'); 
FRONT.Users = new Users(passport, dico); 

var Dash = require(config.root + '/app/routes/front/dash'); 
FRONT.Dash = new Dash(dico); 

var ApiUsers = require(config.root + '/app/routes/api/api_users'); 
API.Users = new ApiUsers(passport, dico); 

// ====================================================================================
// 	COMMON LOGIN / LOGOUT FONCTION (HTML & JSON REQUESTS) 
// ====================================================================================

Router.route('/')
	.get(function (req, res, next) {
		var locale = firstlocale(req); 
  		if (req.accepts('html')) {
			FRONT.Dash.getRoot(req, res, next, '', locale || config.defaultlocale); 
		} else if (req.accepts('json')) {
			res.setHeader('Content-Type', 'application/json');
			res.send("hello from KOFF"); 
		} else {
			res.redirect(config.rootns+'/'); 
		}
	}); 

Router.route('/login')
	.get(function(req,res,next){
		if (req.accepts('html')){
			FRONT.Users.getLogin(req,res,next, ''); 
		}else if (req.accepts('json')){
			res.send("nothing to show here"); 
		} else {
			res.redirect(config.rootns+'/'); 
		}
	})
	.post(function(req,res,next){
		var locale = firstlocale(req); 
		if (req.accepts('html')){
			FRONT.Users.postLogin(req,res,next, '', locale); 
		}else if (req.accepts('json')){
			API.Users.postLogin(req,res,next,'', locale); 
		} else {
			res.redirect(config.rootns+'/'); 
		}
	})

Router.route('/login/:user')
        .get(function(req, res){
		var locale = firstlocale(req); 
                if (req.accepts('html')){
			FRONT.Users.getLogin(req,res,next, req.param('user'), locale);
		}else if (req.accepts('json')){
			res.json(500, 'not implemented') ; 
		} else {
			res.redirect(config.rootns+'/');
		}
        })
        .post(function(req,res,next){
		var locale = firstlocale(req); 
		if (req.accepts('html')){
			FRONT.Users.postLogin(req,res,next, locale); 
		} else if (req.accepts('json')){
			res.json(500, 'not implemented yet'); 
		} else {
			res.redirect(config.rootns+'/'); 
		}
        });

// sign up
Router.route('/signup')
	.get(function(req,res,next){
		if (req.accepts('html')) {
			FRONT.Users.getSignup(req,res,next, ''); 
		} else if (req.accepts('json')){
			res.json(400, 'nothing to show here'); 
		} else {
			res.redirect(config.rootns+'/'); 
		}
	})
	.post(multipartMiddleware, function(req,res,next){ 
		if (req.body.email != null && req.body.password == null) { 
			FRONT.Users.getSignup(req,res,next, req.body.email);
		} else {
			var locale = firstlocale(req); 
			if (req.accepts('html')){ 
				FRONT.Users.postSignup(req,res,next, locale); //(req,res,next); 
			} else if (req.accepts('json')) {
				API.Users.postSignup(req,res,next, locale);
			} else {
				res.redirect(config.rootn+'/'); 
			}
		}
	} );

// user profile
// note: will work if user is in an ongoing session, i.e. logged in. accessing user related services through API requires a token.   
Router.route('/profile')
        .get(logincheck, function(req, res,next) {
		var locale = firstlocale(req);
		if (req.user.locale == undefined || req.user.locale == "") req.user.locale = locale; 
		 if (req.accepts('html')) {
			FRONT.Users.getProfile(req,res,next,locale); 
                } else if (req.accepts('json')){
                        API.Users.getUser(req,res,next,locale); 
                }
        });
  
// user logout
// note: we use jwtcheck here but not necessary, just for test purposes 
Router.route('/logout')
        .get(jwtcheck, function(req,res,next){
		if (req.accepts('html'))
			FRONT.Users.postLogout(req,res,next); 
		else 
			API.Users.postLogout(req,res,next); 
        })
	.post(jwtcheck, function(req,res,next){
		if (req.accepts('html'))
			FRONT.Users.postLogout(req,res,next); 
		else 
			API.Users.postLogout(req,res,next); 
	});



// ====================================================================================
// 	USERS API
// ====================================================================================

Router.route('/users')
        .get(jwtcheck, function(req,res,next){
		API.Users.getUsers(req,res,next); 
        })
        .post(jwtcheck, function(req,res,next){
		API.Users.postUsers(req,res,next); 
	})




// ====================================================================================
// 	local utility functions
// ====================================================================================

function userlocal(req, res, next){
   
   var ulocale = req.get('Accept-Language');

}

// THIS NEEDS TO BE IMPROVED TO TREAT LOW PRIORITY LOCALES
function firstlocale(req){
   var locale = req.get('Accept-Language');
   var arr_locale = locale.split(",");
   return arr_locale[0];
}



module.exports = Router; 

