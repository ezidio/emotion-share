var Event = require('./schema').Model;

var renderJson = function(res) {
	return function(result) {
		res.json(result);
	}
}

module.exports = {
	updateEventMedias : function(event, newMedias) {
		event.media = event.media.concat(newMedias);
      	return event.saveQ();
	},


	getEvent : function(req, res) {
		if (!req.params.id) {
			return res.send(400, 'O Id deve ser especificado');
		}

		Event.findOne({_id : req.params.id}).execQ().then(renderJson(res));

	},

	getEventMedia : function(req, res) {
		if (!req.params.id) {
			return res.send(400, 'O Id deve ser especificado');
		}

		Event.findOne({_id : req.params.id}).execQ().then(function(event) {
			event.media.sort(function(a, b) {
				return b.created_time - a.created_time;
			});

			res.json(event.media);
		});

	},


	getNewMedias : function(req, res) {
		if (!req.params.id) {
			return res.send(400, 'O Id deve ser especificado');
		}
 		
 		var instagram = require('../../providers/instagram/api');

		Event.findOne({_id : req.params.id}).execQ().then(function(event) {
			instagram.searchNewMedia(event)([])
	        .then(function(medias) {
				medias.sort(function(a, b) {
					return b.created_time - a.created_time;
				});

	        	event.media = event.media.concat(medias);
      			event.saveQ().then(function() {
	          		res.json(medias);
      			}, function(err) {
		          	res.emit(500, err);
		        });
	        });
		});
	},

	listEvents : function(req, res) {
	  Event.find({ user : req.user._id}, "_id title tag").execQ().then(renderJson(res));
	},

	createEvent : function(req, res) {
	  
	  var newEvent = new Event({
	    user : req.user._id,
	    title : req.body.title,
	    tag : req.body.tag
	  });

	  return newEvent.saveQ().then(renderJson(res));

/*
	  return newEvent.saveQ()
	  	.then(function(object) {
	  		
			  var rest = require('restler');

			  var token = req.session.auth.instagram.accessToken;
			  var query = {
			  	callback_url : '',
			  	verify_token : '',
			  	aspect : 'media'
			  	object : 'token',
			  	object_id : req.body.tag,
			  	client_id : '',
			  	client_secret : ''

			  }

			  rest.post('https://api.instagram.com/v1/subscriptions/').on('complete', function(result) {
			    if (result instanceof Error) {
			      res.send(500, result.message);
			    } else {
	  			  res.json(object);
			    }
			  });

	  	});
*/

	}
};