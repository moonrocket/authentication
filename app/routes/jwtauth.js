var config      = require('../../config/config');
var User        = require(config.root+'/app/models/user');
var Token 	= require(config.root+'/app/models/user').Token;
var url 	= require('url'); 
var jwt 	= require('jwt-simple');

module.exports = function(req, res, next){

	var goturl 	= url.parse(req.url, true); 
	var token 	= (req.body && req.body.access_token) || goturl.query.access_token || req.headers['x-access-token']; 

	if (token) {
		try { 
			var decoded = User.decode(token); 
			if (decoded && decoded.iss) {
				if (Token.hasExpired(decoded.exp)) {
					console.log("Token has expired ! "); 
					if (req.accepts('html')){
						return res.redirect(config.rootns+'/'); 
					} else {
						return res.json(400, {error: "token has expired"}); 
					}
				} 
                		User.findOne({'_id':decoded.iss}, function(err, user){
                        		if (!err) {
						console.log("Token checked with success"); 
						req.user = user; 
						return next(); 
					}
				});
			} else {
				return next(); 
			}
                } catch (err) {
			return next(); 
		}
        } else { 
		console.log("no token found ! "); 
		next(); 
	}
}
