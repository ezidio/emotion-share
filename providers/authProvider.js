var Q = require('q');

function OAuth2Provider() {
	this._providers = {};
}


OAuth2Provider.prototype.registerAPI = function(name, Oauth2API) {
	this._providers[name] = Oauth2API;
}



OAuth2Provider.prototype.initialize = function(req, res, next) {

	var self = this;

	req.session.auth = req.session.auth || {'authenticated' : false};

	req.isAuthenticated = function() {
		return this.session.auth.authenticated;
	}

	req.getUser = function() {
		return this.session.auth.user;
	}

	req.getAPI = function(providerName) {
		return self._providers[providerName].getAPI(this);
	}

	next();
}


OAuth2Provider.prototype.auth = function(providerName) {
	var self = this;
	var provider = this._providers[providerName];
	return function(req, res) {
		res.redirect(provider.getAuthorizeUrl());
	}
};

OAuth2Provider.prototype.getAPI = function(req, providerName) {
	return this._providers[providerName].getAPI(req);
}


OAuth2Provider.prototype.callback = function(providerName) {
	var self = this;
	var provider = this._providers[providerName];
	return function(req, res, next) {


		provider.getAccessToken(req.query.code)
			.then(provider.getUser)
			.then(function(user, accessToken) {
				
				var User = require('../app/user/schema').Model;

				User.find({provider : user.provider, providerId : user.providerId}, function(err, users) {

					req.session.auth[providerName] = {
						user : user,
						accessToken : accessToken
					}

					req.session.auth.authenticated = (users.length > 0);

					if (req.session.authenticated) {
				      	req.session.auth.user = {
							id    : users[0].id,
							email : users[0].email,
							name  : users[0].name
				      	}

				      	next();
					} else {
						res.redirect('/register');
					}
				});


		        next();
			});

		});

	}
}

module.exports.OAuth2 = OAuth2Provider;
module.exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}