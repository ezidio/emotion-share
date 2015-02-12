var INSTAGRAM_OAUTH2 = {
    clientID: 'b60e8c6eb815451090549e1bcba94d46',
    clientSecret: 'bc821c1b922043b4a2534ef18346f990',
    callbackURL: 'http://localhost:3000/auth/instagram/callback',
    passReqToCallback : true
};


function searchNewInstagramMedias(event) {
  return function(newMedia) {

    var Q = require("q");
    var deferred = Q.defer();

    var Instagram = require('instagram-node-lib');
    Instagram.set('client_id', INSTAGRAM_OAUTH2.clientID);
    Instagram.set('client_secret', INSTAGRAM_OAUTH2.clientSecret);
    Instagram.tags.recent({
      name: event.tag,
      complete: function(data){

        event.media = event.media || [];

        for (var i = 0; i < data.length; i++) {
          var image = data[i];

          if (!event.containsMedia('instagram', image.id)) {

            newMedia.push({
              id : image.id,
              created_time : image.created_time,
              caption : image.caption ? image.caption.text : "",
              provider : 'instagram',
              images : {
                standard : image.images.standard_resolution.url,
                thumbnail : image.images.thumbnail.url
              },
              user : {
                name : image.user.full_name,
                picture : image.user.profile_picture
              }
            });

          }
            
        }

        console.log("found "+newMedia.length+" medias into event");
        deferred.resolve(newMedia); 
      }
    });

    return deferred.promise;

  }


}

function updateWithLastInstagramMedia(event) {

  return searchNewInstagramMedias(event)
    .then(function(newMedias) {
      event.media = event.media.concat(newMedias);
      return event.saveQ();
  });
}

module.exports = {
  searchNewMedia : searchNewInstagramMedias,
  updateEventMedia : updateWithLastInstagramMedia
}