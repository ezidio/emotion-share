var clientID=  'b60e8c6eb815451090549e1bcba94d46';

angular.module('app.index', [])

.controller('IndexController', function($scope, $q, $interval) {


	var instagramAPI = new Instagram($q, clientID, window.accessToken);

	$scope.imageMap = {};
	$scope.images = [];
	$scope.updatedImagesStack = [];


	this.showUpdatedImage = function() {
		if ($scope.updatedImagesStack.length > 0) {
			$scope.updatedImage = $scope.updatedImagesStack.shift();
		} else {
			$scope.updatedImage = $scope.images.pop();
			$scope.images.unshift($scope.updatedImage);
		}
	}

	this.updateImages = function(images) {
		for (var i = 0; i < images.length; i++) {
	        		
    		var img = images[i];
    		var id = img.id;

    		if (!$scope.imageMap.hasOwnProperty(id)) {
    			console.log('adicionando imagem '+id);

    			var image = {
    				id : id,
    				img : img.images.standard_resolution.url,
    				caption : img.caption.text,
    				user : {
    					name : img.user.full_name,
    					img : img.user.profile_picture
    				}
    			};

    			$scope.imageMap[id] = $scope.images.length;
    			$scope.images.unshift(image);
    			$scope.updatedImagesStack.push(image);
    		}
    	};
	}

	this.callForImages = function() {
		instagramAPI.getLastImagesForTag(this._tag).then($.proxy(this.updateImages, this));
	}

	this.showLastImagesForTag = function(tag) {
		
		$scope.images = [];
		$scope.imageMap = {};
		$scope.updatedImagesStack = [];

		$interval.cancel(this._getImagesTimeout);
		$interval.cancel(this._showUpdatedImageTimeout);

		this._tag = tag;
		this._getImagesTimeout = $interval($.proxy(this.callForImages, this), 1000);
		this._showUpdatedImageTimeout = $interval($.proxy(this.showUpdatedImage, this), 10000);
	}


});