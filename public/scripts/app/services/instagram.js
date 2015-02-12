function Instagram($q, clientId, accessToken) {
	this._q = $q;
	this._clientId = clientId;
	this._accessToken = accessToken;
}

Instagram.prototype.getLastImagesForTag = function(tag) {

	var url = [
		'https://api.instagram.com/v1/tags/',tag,'/media/recent?',
		'client_id=',this._clientId,
		'&access_token=',accessToken].join('')

	var deffered = this._q.defer();

	$.ajax({
	        type: "GET",
	        dataType: "jsonp",
	        cache: false,
	        url: url,
	        success: function(result)  {
	        	deffered.resolve(result.data);
	        }
	    });
	
	return deffered.promise;
}