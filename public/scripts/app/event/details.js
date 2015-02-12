function DetailController($scope, $http, $interval) {
	this.$scope = $scope;	
	this.$http = $http;
	this.$interval = $interval;
}

DetailController.prototype.load = function(id) {
	var $scope = this.$scope;
	this._id = id;
	this.$http.get('/api/events/'+id).success($.proxy(this.initializeEvent, this));
}

DetailController.prototype.initializeEvent = function(event) {
	this.$scope.event = event;

	this.loadMedia();
	this.$interval($.proxy(this.verifyUpdates, this), 5000);
}

DetailController.prototype.loadMedia = function() {
	var $scope = this.$scope;
	this.$http.get('/api/events/'+this._id+'/medias').then(function(result) {
		$scope.medias = result.data;
	});
}

DetailController.prototype.verifyUpdates = function() {
	var $scope = this.$scope;
	this.$http.get('/api/events/'+this._id+'/medias/new').then(function(result) {
		var data = result.data;
		for (var i = 0; i < data.length; i++) {
			$scope.medias.unshift(data[i]);
		}
	});
}

var app = angular.module('app.event.details', [])

.controller("DetailController", DetailController);


angular.bootstrap(document, [app.name]);