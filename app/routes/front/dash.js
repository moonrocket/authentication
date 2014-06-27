//"use strict"; 

var config 	= require('../../../config/config');  
//var User 	= require(config.root+'/app/models/user');
//var mongoose 	= require('mongoose');

function DashFront (dico) {
	this.version = '0.1'; 
	this.dico = dico; 
}

//return home page
DashFront.prototype.getRoot = function(req, res, next, user, locale){
 	var prefl = locale; 
	if (this.dico.hasOwnProperty(prefl)){
		var hint = this.dico[prefl]['hint_mail'];
	} 
        res.render('index.ejs', { rootns: config.rootns, theme: config.theme , hint:hint||""});

}

module.exports = DashFront; 
