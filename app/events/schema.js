var mongoose = require('mongoose-q')();
var Schema = mongoose.Schema;

var eventSchema = new Schema({
	user : String,
	tag: String,
	title : String,
	created_time : { type: Date, default: Date.now },
	media : [{
		id : String,
		created_time : Number,
		caption : String,
		provider : String,
		location : {
			latitude : Number,
			longitude : Number
		},
		images : {
			standard : String,
			thumbnail : String
		},
		user : {
			name : String,
			picture : String
		}
	}]
});

//eventSchema.index({ tag: 1 }); // schema level
eventSchema.methods.containsMedia = function(provider, id) {
	for(var i in this.media) {
		var media = this.media[i];
		if (media.provider == provider && media.id == id) {
			return true;
		}
	}
	return false;
}
eventSchema.statics.findByUser = function (user, cb) {
  this.find({ userId : user.id }, cb);
}

eventSchema.statics.findByTag = function (tag, cb) {
  this.find({ tag : tag }, cb);
}


module.exports.Schema = eventSchema;
module.exports.Model = mongoose.model('Event', eventSchema);