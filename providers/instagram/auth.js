var Q = require('q');
var OAuth2 = require('oauth').OAuth2;
var InstagramAPI = require('./api').InstagramAPI;

function InstagramProvider(params) {

	this.config = {
		clientID : params.clientID,
		clientSecret : params.clientSecret,
		callbackURL : params.callbackURL,
	    authorizationURL : 'https://api.instagram.com/oauth/authorize/',
	    tokenURL : 'https://api.instagram.com/oauth/access_token',
	    userURL : 'https://api.instagram.com/v1/users/self'
	}

	this.oauth2 = new OAuth2(
		this.config.clientID, 
		this.config.clientSecret,
      	'', 
      	this.config.authorizationURL, 
      	this.config.tokenURL, 
      	this.config.customHeaders);
}


InstagramProvider.prototype.getAuthorizeUrl = function() {
	var params = {
	    client_id : this.config.clientID,
	    redirect_uri : this.config.callbackURL,
	    response_type : 'code'
	}
	return this.oauth2.getAuthorizeUrl(params);
}

InstagramProvider.prototype.getAccessToken = function(code) {
	var deferred = Q.defer();
	var options = { grant_type: 'authorization_code', redirect_uri: this.config.callbackURL }

    this.oauth2.getOAuthAccessToken(code, options,  function(err, accessToken, refreshToken, params) {
    	deferred.resolve(accessToken);
    });
    return deferred.promise;
}

InstagramProvider.prototype.getUser = function(accessToken) {
	var deferred = Q.defer();
	this.oauth2.get(this.config.userURL, accessToken, function (err, body, res) {
	    if (err) { return done(new InternalOAuthError('failed to fetch user', err)); }
	    
		var json = JSON.parse(body);
      
		var user = { provider: 'instagram' };
		user.providerId = json.data.id;
		user.name = json.data.full_name;
		user.username = json.data.username;
		deferred.resolve(user, accessToken);
	});
	return deferred.promise;
}

InstagramProvider.prototype.getAPI = function(req) {
	return new InstagramAPI(this.oauth2, req.session.auth.instagram.accessToken);
}

InstagramProvider.prototype.getRecentMedia = function(tag, access_token) {
	var deferred = Q.defer();
	var url = ['https://api.instagram.com/v1/tags/',tag,'/media/recent'].join('');

	this.oauth2.get(url, access_token, function(err, result) {
		var result = JSON.parse(result);
		var images = result.data;
		var result = [];
		for (var i = 0; i < images.length; i++) {
	        		
    		var img = images[i];

			result.push({
				id : img.id,
				created_time : img.created_time,
				caption : img.caption.text,
				location : img.location,
				images : {
					standard : img.images.standard_resolution.url,
					thumbnail : img.images.thumbnail.url
				},
				user : {
					name : img.user.full_name,
					picture : img.user.profile_picture
				}
			});

    	};

		deferred.resolve(result);
	});

	return deferred.promise;
}

module.exports.InstagramProvider = InstagramProvider;