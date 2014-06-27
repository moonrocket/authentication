var path = require('path')
  , rootPath = path.normalize(__dirname + '/../')
  , rootheme = "/public"+"/devoops" ;

var config = {
	
	server:{
		port: process.env.UFRONT_PORT || 8080 , 
		hostname: process.env.UFRONT_HOST || 'localhost'
	} 
 	, db:{ 
		mongodb:{
			url:process.env.UFRONT_MONGODB_URI || 'mongodb://localhost/ufront'
		}
	}
	, root: rootPath
	, rootns: "/app1"
	, theme:{  
		styles: [
			 { href: "/public/plugins/bootstrap/bootstrap.min.css", rel:"stylesheet" }
			, { href: "/public/css/font-awesome.css", rel:"stylesheet" }
			, { href: "/public/css/font-awesome.min.css", rel:"stylesheet" } 
		//	, { href: rootheme+"/css/style.css", rel:"stylesheet" } 
		]
		, scripts:[
			{ src: "/public/plugins/jquery/jquery-2.1.0.min.js" 		}
			, { src: "/public/plugins/jquery-ui/jquery-ui.min.js" 	}
			, { src: "/public/plugins/bootstrap/bootstrap.min.js" 	}
			, { src: "/public/plugins/justified-gallery/jquery.justifiedgallery.min.js" }
		]
	}
	, defaultlocale: 'en-US' 

};

module.exports = config; 

