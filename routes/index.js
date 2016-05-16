var express = require('express');
var router = express.Router();

var Sample = require('../models/samples.js');

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
  res.render('index', { title: 'Project MoNET', route : "index" });
});

router.get('/colorwall', function(req, res, next) {
  res.render('colorwall', { title: 'Project MoNET:Colorwall', route : "index" });
});

router.get('/colorwall1', function(req, res, next) {
  res.render('colorwall1', { title: 'Project MoNET:Colorwall' });
});

router.get('/sample/:red/:green/:blue', function(req, res, next) {
  console.log(req.params);
  color = req.params;
  res.set('Content-Type', 'application/json');
  res.send(calibration);
  calibration.reset();
});

router.get('/color.json', function(req, res, next) {
  res.send(color);
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
