//"use strict"; 

var config 	= require('../../../config/config');  
var User 	= require(config.root+'/app/models/user');
var mongoose 	= require('mongoose');
var async 	= require('async'); 
var crypto 	= require('crypto'); 

//var Mailer 	= require(config.root+'/app/helper/mailer);  


function UsersFront (passport, dico) {
	this.version = '0.1', 
	this.passport = passport; 
	this.dico 	= dico; 
}

// return a login page or login info
UsersFront.prototype.getLogin = function (req, res, next, user){

        // todo: allow getting email from uid
        if (!user) user="";
	var loginmsg = req.flash('loginMessage'); 
        res.render('login.ejs', { message: loginmsg,user:user, rootns:config.rootns, theme:config.theme});

}

// authenticate the user
UsersFront.prototype.postLogin = function (req, res, next, user, locale){
	var self = this; 

	this.passport.authenticate('local-login', function(err,user,info){
	   var _self = self; 
	   if (err) return next(err); 
	   if (!user) { 
		var msg = "user not found";
                if (_self.dico.hasOwnProperty(locale)) msg = _self.dico[locale].popup_user_notfound;
		req.flash('loginMessage', msg); 
		return res.redirect(config.rootns+'/login'); 
	   }
	   req.logIn(user, function(err) { 

		if (err) return next(err);
		// store the email in the session
		req.session.email = user.email; 
		// storing the user token 
		var tok = user.createToken(user.id); 
		req.session.token = tok; // may remove later  
		return res.redirect(config.rootns+'/profile'); 
	   });
	})(req,res,next);
}

UsersFront.prototype.getSignup = function (req, res, next, user) {
	var msg = req.flash('signupMessage');
	res.render('signup.ejs', {message: msg, rootns:config.rootns , user:user, theme:config.theme}); 
}

UsersFront.prototype.postSignup = function (req, res, next, locale) {
//        process.nextTick(function() {
	    var email = req.body.email; 
	    var password = req.body.password; 
	    var self = this; 
            if (email == null || email=="" || password == null || password=="") return res.redirect(config.rootns+'/signup');
	    User.findOne({ 'local.email' : email }, function(err, user){
		var _self = self; 
                if (err) { return done(err); }
                if (user) {
			var msg = "email taken"; 
			if (_self.dico.hasOwnProperty(locale)) msg = _self.dico[locale].popup_mail_taken;  
		    req.flash('signupMessage', msg); 
                    return res.redirect(config.rootns+'/signup');
                } else {
                    var newUser = new User();
                    newUser.local.email = email ;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.save(function(err) {
                        if (err) {
                                throw err;
                        }
                        req.logIn(newUser, function(err){
				res.redirect(config.rootns+'/profile');
			});
                    });
                }
            });
  //      });
}

UsersFront.prototype.postLogout = function (req,res,next){
	req.logout();
        res.redirect(config.rootns+'/');
}


UsersFront.prototype.getProfile = function(req,res,next, locale){
        res.render('profile.ejs',{
                                user:req.user
                                , rootns:config.rootns
        });
}

//////////// USERS API 


// get a list of all users  
UsersFront.prototype.getUsers = function(req,res,next,locale){
	console.log("not implemented yet"); 
	next(); 
} 

UsersFront.prototype.getUser = function (req,res,next,locale, id){
	console.log("not implemented: get user in db for is="+id); 	
	next(); 
}


module.exports = UsersFront; 
