var express = require('express');
var router = express.Router();
var parser = require('parse-rss');
var passport = require('passport');

var Sample = require('../models/models.js').Sample;
var Job = require('../models/models.js').Job;

var color = { red : 255, green : 255, blue: 255 };

var calibration = {
  red: 0,
  green : 0,
  blue : 0,
  gain : 0,
  time: 0,
  setwhite : 0,
  reset : function () {
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.gain = 0;
    this.time = 0;
    this.setwhite = 0;
  }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  parser('http://blog.projectmo.net/rss', function(err, out){
    if (err) throw err;
    var latest = out[0];
    latest.summary = latest.summary.replace(/<(?:.|\n)*?>/gm, '').slice(0,-1);
    res.render('index', { title: 'Project MoNET', route : "index", latest : latest });
  });
});

router.get('/colorwall', function(req, res, next) {
  res.render('colorwall', { title: 'Project MoNET:Colorwall', route : "index" });
});

router.get('/colorwall1', function(req, res, next) {
  var id = req.query.id;
  //console.log(id);
  var colors = Job.getTopColors( function(colors) {
    res.render('colorwall1',  {title: 'Project MoNET:Colorwall', colors : colors  });
  });
});

router.get('/simulator', function(req, res, next) {
  res.render('simulator', { title: 'Project MoNET:Simulator' });
});

router.get('/sample/:red/:green/:blue', function(req, res, next) {
  //console.log(req.params);
  color = req.params;
  res.set('Content-Type', 'application/json');
  res.send(calibration);
  calibration.reset();
});

router.get('/color', function(req, res, next) {
  res.render('color', { title: 'Project MoNET:Color Sampler' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Project MoNET:Authorize' });
});

router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    //console.log(req.user.name);
    // Successful authentication, redirect home.
    res.redirect('/');
  });

module.exports = router;
