function TestController($scope, $http, $interval) {
	this.$scope = $scope;	
	this.$http = $http;
	this._url = "/api/test/events";
	this._tag = "copa";
	this._pages = [];
	this.load();
}


TestController.prototype.changeTag = function() {
	this._tag = this.$scope.newTag;
	this._pages = [];
	this._nextMaxId = undefined;
	this.load();
}

TestController.prototype.load = function() {
	var self = this;
	var params = {
		'tag' : this._tag

	};
	if (this._nextMaxId) {
		params.max_tag_id = this._nextMaxId;
	}

	this.$http.get(this._url, {'params' : params}).success(function(result) {
		self._pages.push(result.data);
		self._nextMaxId = result.pagination.next_max_id;
	});
}


var app = angular.module('app.event.details', [])

.controller("TestController", TestController);


angular.bootstrap(document, [app.name]);