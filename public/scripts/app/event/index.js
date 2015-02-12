function EventController($scope, $http) {
	this.$scope = $scope;
	this.$http = $http;

	$scope.events = [];

	this.load();
}

EventController.prototype.load = function() {
	var $scope = this.$scope;
	this.$http.get('/api/events').then(function(result) {
		$scope.events = result.data;
	});
}

EventController.prototype.save = function() {
	var $scope = this.$scope;
	this.$http.post('/api/events', $scope.event).then(function(result) {
		$scope.events.push(result.data);
	});
}

angular.module('app.events', [])

.controller('EventController', EventController);

angular.bootstrap(document, ['app.events']);