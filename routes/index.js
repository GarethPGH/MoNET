var express = require('express');
var router = express.Router();
var parser = require('parse-rss');
var passport = require('passport');

var Sample = require('../models/models.js').Sample;
var Job = require('../models/models.js').Job;

var color = {
  red: 255,
  green: 255,
  blue: 255
};

var calibration = {
  red: 0,
  green: 0,
  blue: 0,
  gain: 0,
  time: 0,
  setwhite: 0,
  reset: function() {
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
  Page.updateOrCreate(null, function(err, page) {
    if (err) throw err;
    parser('http://blog.projectmo.net/rss', function(err, out) {
      if (err) throw err;
      var latest = out[0];
      latest.summary = latest.summary.replace(/<(?:.|\n)*?>/gm, '').slice(0, -1);
      res.render('index', {
        title: 'Project MoNET',
        route: "index",
        latest: latest,
        page: page
      });
    });
  });
});

router.get('/colorwall', function(req, res, next) {
  res.render('colorwall', {
    title: 'Project MoNET:Colorwall',
    route: "index"
  });
});

router.get('/gallery', function(req, res, next) {
  res.sendfile('public/gallery/MoNetCanvas.html');
});



router.get('/colorwall1', function(req, res, next) {
  var id = req.query.id;
  console.log(id);
  Job.getTopSamples(function(colors) {
    console.log(colors);
    res.render('colorwall1', {
      title: 'Project MoNET:Colorwall',
      colors: colors
    });
  });
});

router.get('/simulator', function(req, res, next) {
  res.render('simulator', {
    title: 'Project MoNET:Simulator'
  });
});

router.get('/sample/:red/:green/:blue', function(req, res, next) {
  //console.log(req.params);
  color = req.params;
  res.set('Content-Type', 'application/json');
  res.send(calibration);
  calibration.reset();
});

router.get('/color', function(req, res, next) {
  res.render('color', {
    title: 'Project MoNET:Color Sampler'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {
    title: 'Project MoNET:Log In',
    heading: "You must be authorized to do this.",
    message: "Please click below to login. You will be directed to authorize this app through Facebook, " +
      "which is our identity provider. Once authorized, one of our admins will need to elevate your privileges " +
      "so that you may access the private areas."
  });
});

router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    //console.log(req.user.name);
    // Successful authentication, redirect home.
    res.redirect('/');
  });


//Admin DB stuff
var User = require('../models/models.js').User;
var Page = require('../models/models.js').Page;

//Private stuff, don't read or the app will break!
router.get('/private/:dest', function(req, res, next) {
  console.log(req.params.dest);
  if (req.user) {
    if (req.user.elevated || req.user.owner) {
      switch (req.params.dest) {

        case "users":
          User.find().exec(function(err, users) {
            res.render("users", {
              title: 'Project MoNET:User Management',
              users: users
            });
          });
          break;


        case "frontpage":
          Page.findOne().exec(function(err, page) {
            res.render("frontpage", {
              title: 'Project MoNET:Front Page Editor',
              page: page
            });
          });
          break;

        case "works":
          page = req.query.page || 0;
          Job.get(5, page, function(err, works) {
            res.render("works", {
              title: 'Project MoNET:Work Control',
              works: works
            });
          });
          break;

        default:
          res.redirect('/');
      }
    } else {
      console.log('not priv');
      res.render('blocked', {
        title: 'Not Authorized'
      });
    }
  } else {
    console.log('not auth');
    res.redirect('/login');
  }
});



//For updating admin stuff
router.put('/private/:dest', function(req, res, next) {
  if (req.user) {
    if (req.user.elevated || req.user.owner) {
      var data = req.body;

      switch (req.params.dest) {
        case "users":
          console.log(data._id, data.elevated);
          User.update(data, function(status) {
            res.send({
              result: status
            })
          });
          break;

        case "frontpage":
          Page.updateOrCreate(data, function(err, page) {
            if (!err) {
              res.send({
                result: "success"
              });
            } else {
              res.send({
                result: "failure"
              });
            }
          });
          break;

        case "works":
          switch (data.action) {
            case "add":
              Job.create(function(job) {
                console.log(job);
              });
              break;
          }
          break;

      }
    }
  }
});

module.exports = router;
