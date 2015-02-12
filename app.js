/**
 * Module dependencies.
 */
/*
   Root User:     admin
   Root Password: F3n1385vjZK8
   Database Name: app

Connection URL: mongodb://$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/
*/
var connectionStr ='mongodb://localhost/eventos';


if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connectionStr = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
require('mongoose').connect(connectionStr);

var INSTAGRAM_OAUTH2 = {
    clientID: 'b60e8c6eb815451090549e1bcba94d46',
    clientSecret: 'bc821c1b922043b4a2534ef18346f990',
    callbackURL: 'http://localhost:8080/auth/instagram/callback',
    passReqToCallback : true
};

var path = require('path');

var passport = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new InstagramStrategy(INSTAGRAM_OAUTH2, function(req, accessToken, refreshToken, profile, done) {

  req.session.auth = req.session.auth || {};

  req.session.auth.instagram = {
    accessToken : accessToken,
    refreshToken  : refreshToken
  }

    process.nextTick(function () {

      return done(null, profile);
    });
  }
));

// all environments
var ipaddr  = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port    = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var express = require('express');
var app = express();
app.set('port', port);
app.set('ip', ipaddr);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', require('ejs-locals'));

//app.use(require('express-partials')());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/login',function(req, res){	
	if (req.isAuthenticated()) { 
		res.redirect('/');
	} else {
		res.render('login', {layout : false});	
	}
});

app.get('/', ensureAuthenticated, function(req, res){	
  console.log('#######################');
  console.log(req.user);

	res.render('index', {
    user        : req.user, 
    auth        : req.session.auth
  });
});


app.get('/events', ensureAuthenticated, function(req, res) {
  res.render('event/index')
});

app.get('/events/:id', ensureAuthenticated, function(req, res) {
  res.render('event/event', {id : req.params.id})
});

var EventAPIController = require('./app/events/api');

app.get('/api/events', ensureAuthenticated, EventAPIController.listEvents);
app.post('/api/events', ensureAuthenticated, EventAPIController.createEvent);
app.get('/api/events/:id', ensureAuthenticated, EventAPIController.getEvent);

app.get('/api/events/:id/medias', ensureAuthenticated, EventAPIController.getEventMedia);
app.get('/api/events/:id/medias/new', ensureAuthenticated, EventAPIController.getNewMedias);

var http = require('http');
var server= http.createServer(app);
server.listen(app.get('port'),app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port') + ', ip '+app.get('ip'));
  console.log("HOST: "+process.env.OPENSHIFT_MONGODB_DB_HOST);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    res.locals.user = req.user;
    return next(); 
  }
  res.redirect('/login')
}