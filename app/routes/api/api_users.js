//"use strict"; 

var config 	= require('../../../config/config');  
var User 	= require(config.root+'/app/models/user');
var mongoose 	= require('mongoose');
var async 	= require('async'); 
var crypto 	= require('crypto'); 
var utility 	= require('utility'); 

//var Mailer 	= require(config.root+'/app/helper/mailer);  


function UsersAPI (passport, dico) {
	this.version 	= '0.1', 
	this.passport 	= passport; 
	this.dico 	= dico; 
}

// authenticate the user
UsersAPI.prototype.postLogin = function (req, res, next, user, locale){
	var self = this; 
	var loginmsg = {}; 
	this.passport.authenticate('local-login', function(err,user,info){
	   var _self = self; 
	   if (err) return next(err); 
	   if (!user) { 
		loginmsg.error = "user not found"; 
	        if (_self.dico.hasOwnProperty(locale)) loginmsg.error = _self.dico[locale].popup_user_notfound;
		res.setHeader('Content-Type','application/json');
		return res.json(404, loginmsg); 
	   }
	   req.logIn(user, function(err) { 
		if (err) return next(err);
		req.session.email = user.email;
		var token = user.createToken();  // console.log("token = "+token); 
		user.token = token; 
		user.save(function(err){
			if (err) throw err; 
		});
		
		req.session.token = token;  
		return res.jsonp(user); 
	   });
	})(req,res,next);
}

UsersAPI.prototype.postSignup = function (req, res, next, locale) {
	    var email = req.body.email; 
	    var password = req.body.password; 
            if (email == null || email=="" || password == null || password=="") return res.jsonp(400,{error: "email and password can't be null"});
            var signupmsg = {}; 
	    var self = this; 
 	    User.findOne({ 'local.email' : email }, function(err, user){
		var _self = self; 
                if (err) { return done(err); }
                if (user) {
			signupmsg.error = "email taken"; 
			if (_self.dico.hasOwnProperty(locale)) signupmsg.error = _self.dico[locale].popup_mail_taken;  
                    return res.json(404, signupmsg);
                } else {
                    // console.log("creating new user");
                    var newUser = new User();
                    newUser.local.email = email ;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.save(function(err) {
                        if (err) {
                                throw err;
                        }
                        req.logIn(newUser, function(err){
				signupmsg.user = newUser; 
				signupmsg.user.local.password = ""; 
				res.jsonp(signupmsg);
			});
                    });
                }
            });
}

UsersAPI.prototype.postLogout = function (req,res,next){
        req.logout();
        res.json(200, {message: "user logged out"});
}


UsersAPI.prototype.getUsers = function (req, res, next, locale){

}


UsersAPI.prototype.getUser = function (req,res,next,locale){
     var email = req.params.email;
     var profile={}; 
     // console.log("param email="+email); 
     User.findOne({ 'local.email' : email }, function(err, user){
     	var self = this;
        if (err) { return done(err); }
        if (!user) {
        	profile.error = "user not found";
                if (self.dico.hasOwnProperty(locale)) profile.error = self.dico[locale].popup_mail_taken;
                return res.json(404, profile);
        } else {
		if (user.avatar === undefined) {
			user.avatar = 'https://gravatar.com/avatar/'+utility.md5(user.email)+'?s=200&d=retro'; 
		}
		profile.user = user; 
		return res.jsonp(profile); 
        }
     });	
}

module.exports = UsersAPI; 
