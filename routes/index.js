var express = require('express');
var router = express.Router();
var parser = require('parse-rss');

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
  var colors = Job.getTopColors( function(colors) {
    res.render('colorwall1',  {title: 'Project MoNET:Colorwall', colors : colors  });
  });
});

router.get('/simulator', function(req, res, next) {
  res.render('simulator', { title: 'Project MoNET:Simulator' });
});

router.get('/sample/:red/:green/:blue', function(req, res, next) {
  console.log(req.params);
  color = req.params;
  res.set('Content-Type', 'application/json');
  res.send(calibration);
  calibration.reset();
});

router.get('/color', function(req, res, next) {
  res.render('color', { title: 'Project MoNET:Color Sampler' });
});

router.get('/calibrate', function(req, res, next) {
  if(req.query.set_gain == "up") {
    calibration.gain = 1;
  }
  if(req.query.set_gain == "down") {
    calibration.gain = -1;
  }
  if(req.query.set_time == "up") {
    calibration.time = 1;
  }
  if(req.query.set_time == "down") {
    calibration.time = -1;
  }
  if(req.query.set_white == 1) {
    calibration.setwhite = 1;
    calibration.red = 255 - color.red;
    calibration.green = 255 - color.green;
    calibration.blue = 255 - color.blue;
  }
  if(req.query.set_white == -1) {
    calibration.setwhite = 1;
    calibration.red = 0;
    calibration.green = 0;
    calibration.blue = 0;
  }
  res.send(req.query);
});

module.exports = router;
