var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sass = require('node-sass-middleware');
var path = require('path');
var routes = require('./routes/index');
var users = require('./routes/users');
var passport = require('passport');
var passport = require('passport');
var config = require('./config');
var FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

//Mongo Stuff
var mongoose = require('mongoose');
var connection_string = 'mongodb://localhost/monet';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = 'mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
mongoose.connect(connection_string);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
   sass({
       src: __dirname + '/sass',
       dest: __dirname + '/public',
       debug: true,
       indentedSyntax : true,
   })
);

app.use(express.static(path.join(__dirname, 'public')));

var User = require('./models/models.js').User;

if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  //Prod App
  passport.use(new FacebookStrategy({
      clientID: process.env.MONET_FACEBOOK_APP_ID,
      clientSecret: process.env.MONET_FACEBOOK_SECRET,
      callbackURL: "http://www.projectmo.net/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      //console.log(profile);
      //return cb(null, profile);
      User.findOrCreate(profile, cb);
    }
  ));
} else {
  //Test App for Local Development
  passport.use(new FacebookStrategy({
      clientID: config.FACEBOOKAPPID,
      clientSecret: config.FACEBOOKSECRET,
      callbackURL: "http://192.168.1.4:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      //console.log(profile);
      //return cb(null, profile);
      User.findOrCreate(profile, cb);
    }
  ));
}

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
