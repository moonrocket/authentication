var LocalStrategy = require('passport-local').Strategy; 
var User          = require('../app/models/user');

module.exports = function(app, passport) {

   // Used to serialize the user
   passport.serializeUser(function(user, done) {
        done(null, user.id);
   });

   // Used to deserialize the user
   passport.deserializeUser(function(id,done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
   });

   // local signup
   passport.use('local-signup', new LocalStrategy({
	usernameField: 'email', 
	passwordField: 'password', 
     },
     function(email, password, done) {
	console.log("PASSPORT >> LOCAL SIGNUP");
 	process.nextTick(function() {
	    console.log("try to find element in mongodb ...");
	    User.findOne({ 'local.email' : email }, function(err, user){
	   	if (err) { return done(err); }
		if (user) { 
			console.log("email already taken"); 
		    return done(null, false, { message:'email already taken'});
		} else { 
		    console.log("creating new user"); 
		    var newUser = new User(); 
		    newUser.local.email = email ; 
		    newUser.local.password = newUser.generateHash(password);
		    newUser.save(function(err) {
			if (err) {
				console.log(err)
				throw err; 
			}
			return done(null, newUser); 
		    }); 
		}
	    });
	}); 	
 	  
   }));

   // LOGIN 
   passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
     },
     function(email, password, done) {
	console.log("PASSPORT >> fetching in mongodb ..."); 
	process.nextTick(function(){
            User.findOne({ 'local.email' : email }, function(err, user){
                if (err) return done(err);
                if (!user) {
		    console.log("user not found");
		    return done(null, false, {message:'user not found'}); 
                } 
		if (!user.validPassword(password)){ 
			console.log("wrong password"); 
			return done(null, false, {message:'wrong password'});
		}
		console.log(user);
		return done(null, user); 
            });
	});
   }));


   passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
	},
      function(email, password, done) {
	User.findOne( { 'local.email': email }, function (err,user){
		if (err) return done(err); 
		if (!user) {
		   return done(null, false, { message:'you are not registered' });
		}
		if (!user.validPassword(password)) {
		   return done(null, false, { message:'invalid login or password' }); 
		}
		return done(null, user)
	});  
	
	// process.nextTick(function() {
		var newu = newUser(); 
		newu.local.email="test@test.net"; 
		return done(null,newu); 
	  // });
      }
   ));

};
