var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "name": String,
	//"email" : {type : String, unique : true},
	"facebook" : {
		"id" : String,
		"token" : String
	},
	"instagram" : {
		"id" : String,
		"token" : String	
	}
});

//userSchema.index({ provider : 1, providerId : 1 }, {unique : true}); // schema level

module.exports.Schema = userSchema;
module.exports.Model = mongoose.model('User', userSchema);