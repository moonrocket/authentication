var config      = require('../../config/config');
var url 	= require('url'); 

module.exports = function(req, res, next){

	if (req.isAuthenticated()) return next();
   
	if (req.accepts('html')) res.redirect(config.rootns+'/');
  
	else if (req.accepts('json')) res.json(400,{error: "not logged"});
   	
	else res.redirect(config.rootns+'/');

}
