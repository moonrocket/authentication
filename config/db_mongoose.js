module.exports = function (app, mongoose) {

	var connect = function () {
	    var options = {
		server: {
		   socketOptions: { keepAlive: 1 }
		}, 
		auto_reconnect: true
	    }
	    mongoose.connect(app.config.db.mongodb.url, options)
	}
	
	mongoose.connection.on('error', function (err) {
		console.error(' Mongo db connection error. check if your mongo db is running'); 
	}); 

	mongoose.connection.on('disconnect', function () {
		connect(); 
	});

	connect(); 
}
