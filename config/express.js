var logger 		= require('morgan');
var path 		= require('path');
//var favicon 		= require('serve-favicon');  
var morgan 		= require('morgan');
var methodOverride	= require('method-override'); 
var bodyParser		= require('body-parser'); 
var cookieParser 	= require('cookie-parser'); 
var session 		= require('express-session'); 
//var MongoStore 		= require('connect-mongo')({ session:session});
var errorHandler 	= require('errorhandler'); 

var env 		= process.env.NODE_ENV || 'development'; 
var pkg 		= require('../package.json'); 
var flash 		= require('express-flash'); 

var routes 		= require('../app/routes/simproutes');

module.exports = function (app, express, passport) {

   var allowCrossDomain = function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*"); 
	res.header("Access-Control-Allow-Credentials", true); 
	res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
	next(); 
   }; 

   app.set('env', env); 
   app.set('port', app.config.server.port || 8080); 
   app.set('views', path.join(__dirname, '../views')); 
   app.set('view engine', 'ejs'); 

//   app.use('public', express.static(path.join(__dirname, '../public')));

  // app.use(favicon(path.join(app.config.root, 'public/favicon.png'))); 

   app.use(bodyParser.urlencoded()); 
   app.use(bodyParser.json()); 
//   app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
   app.use(methodOverride());
  
   var mysession = {
        secret: pkg.name
//        ,cookie: {}
  //      , store: new MongoStore({
//		url: app.config.db.mongodb.url, 
//		collection: 'sessions', 
//		auto_reconnect: true
//        })
   }

   if ( env == 'development') {
        app.use(morgan('dev'));
   }

   if ( env == 'production') {
        app.set('trust proxy', 1)       // trust first proxy
        mysession.cookie.secure = true;
        mysession.maxAge = new Date(Date.now() + 3600000);
   }

  app.use(cookieParser(pkg.name)) ;
  app.use(session(mysession));

  app.use(passport.initialize());

/*
  app.use(passport.session({
	maxAge: new Date(Date.now() + 3600000)
  }));
*/
  app.use(passport.session()); 

  app.use(flash()); 
  // FFU: add here other models 
  
  app.use(app.config.rootns, routes); 
  //require('../app/routes/routes')(app, passport); 

  // 404 Handler
  app.use(function handleNotFound(req, res, next){
 
	res.status(404); 
  	if (req.accepts('html')){
	    res.render('404.ejs', { url: req.url, error:"404 Not Found", rootns:app.config.rootns, theme:app.config.theme});
	    return; 
	}
	if (req.accepts('json')) {
	   res.send({ error: 'Not Found' }); 
	   return; 
	}

 	res.type('txt').send('Not Found'); 
  }); 

  // Error Handler
  if (env == "development") {
	app.use(errorHandler()); 
  } else {
	app.use(function logErrors(err, req, res, next){
	   if (err.status === 404) return next(err) 
	   console.error(err.stack)
	   next(err); 
	});
	
	app.use(function respondError(err,req,res,next){
	   var status, message ; 
	   message = "there was a problem";
	   if (req.accepts('json')) { 
		res.send({error:message});
		return; 
	   } else {
	 	res.type('txt').send(message+'\n');
		return;
	   }
	});
  }
}

