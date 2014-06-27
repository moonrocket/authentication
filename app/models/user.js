var mongoose 	= require('mongoose'); 
var bcrypt 	= require('bcrypt-nodejs'); 
var jwt 	= require('jwt-simple'); 
var moment 	= require('moment'); 

var tokenSecret = process.env.UFRONT_TOKEN || 'dummy-secret'; 

var expiredays  = process.env.UFRONT_TOKEN_LAST || 7; 

////////// TOKEN 

var Token = mongoose.Schema({
	token: {type: String}
	, created: {type: Date, default: Date.now} 
	, expires: {type: Date}
}); 

Token.methods.hasExpired = function(expires){
	var now = Date.now(); 
	//var diff = (now.getTime() - created); 
	return expires <= now; 
}; 

var TokenModel = mongoose.model('Token', Token); 

////////// USER

var userSchema = mongoose.Schema({

	local: {
		email	:	String 
		,password: 	String 
	}, 
	google: {
		id 	: String
		,token 	: String
		,email 	: String 
		,name 	: String
	}
	, firstname: String
	, lastname: String 
	, avatar: String  
	, token: Object 
	, reset_token: String 
	, reset_token_expires_milli: Number
},
{
  	collection : 'User'
}); 

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
	//console.log("password is="+password); 
	//console.log("this.password is="+this.local.password); 
	return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.gravatar = function(size) { 
	if (!size) size = 200; 

	if (!this.local.email) {
		return 'http://gravatar.com/avatar/?s=' + size + '&d=retro';
	}

	var md5 = require('crypto').createHash('md5').update(this.local.email).digest('hex');
	return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro'; 
};

userSchema.methods.createToken = function(secret){

	var expires 	= moment().add('days', expiredays).valueOf(); 
	var secret 	= secret  || tokenSecret;
	var mail 	= this.local.email; 
	var uid 	= this.id || mail;
	var tok		= jwt.encode({iss:uid, email:mail, exp:expires}, secret); 
	var gentoken	= new TokenModel({token:tok, expires:expires});    //{token: tok, created: Date.now(), expires: expires};
	return gentoken ; 
};

userSchema.methods.decodeToken = function(token, secret){
	var secret = secret || tokenSecret; 
	var tok = jwt.decode(token, secret);
	return tok; 
}

userSchema.methods.invalidate = function(){
	this.token = null; 
	this.save(); 
}

module.exports = mongoose.model('User', userSchema);
module.exports.Token = TokenModel; 
