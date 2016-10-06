var express = require('express');
var router = express.Router();
var parser = require('parse-rss');
var passport = require('passport');
var Sample = require('../models/models.js').Sample;
var Job = require('../models/models.js').Job;
var Status = require('../models/models.js').Status;
var Calibration = require('../models/models.js').Calibration;
var cleanSlate = require('../models/models.js').cleanSlate;
var Command = require('../models/models.js').Command;

var currentCommandId = 1;

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

router.get('/gallery', function(req, res, next) {
  res.sendfile('MoNETGallery/MoNetCanvas.html');
});


router.get('/colorwall1', function(req, res, next) {
  var id = req.query.id;
  //console.log(id);
  Job.getTopSamples(function(colors) {
    //console.log(colors);
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
  var color = req.params;
  res.set('Content-Type', 'application/json');
  res.send(calibration);
  calibration.reset();
});

router.get('/motor/:direction', function(req, res, next) {
  //console.log(req.params);
  motor.direction = req.params.direction == 'cw' ? 'ccw' : 'cw';
  res.set('Content-Type', 'application/json');
  res.send(motor);
});

router.get('/color', function(req, res, next) {
  Job.getCurrent( function (job) {
      console.log('got job ', job);
      var data = {
        job : job
      };
      res.render('color2', {
        title: 'Project MoNET:Color Sampler', data : data
      });
  });
});

/*We're using funky dot notation for incoming messages from the robot. We're just going to stick everything in one request.
  This will serve three purposes:
    -give next command to the robot as a response.
    -mark the previous command as finished
    -update periodic/emergency status
*/

            //robotcontol/mowpjf38qe.fetch  .0         .0    .0    .0    .0    .0    .0    .429495  .4294995 .0     .0     .-60    .1
router.get('/robotcontol/:hardwareID.:action.:commandId.:xPos.:yPos.:xLimMax.:yLimMax.:signal.:status', function(req ,res, next) {
  console.log(req.params);
  res.set('Content-Type', 'application/json');
  if(req.params.hardwareID == "mowpjf38qe") {
    Status.updateStatus( req.params, function (err, status) {
      Status.ssUpdate(req.params.commandId);
      console.log("status.message",status.message);

      if( parseInt(req.params.status) >= 5 &&  parseInt(req.params.status) <= 12 ) {
        Command.purgePending();
      }


      if( req.params.action == "status") {
        console.log("got status");
        res.json({message : "OK"});
      } else {
        var completeCommandId = 0;
        if ( req.params.action == "complete") {
            completeCommandId = req.params.commandId;
        }
        Command.next(completeCommandId, function (cmd) {
          console.log('cmd',JSON.stringify(cmd));
          Status.ssUpdate(req.params.commandId);
          res.set('Content-Type', 'application/json');
          var command = {};
          if(cmd === null) {
            console.log("null command");
            command = { message : 'nothing waiting'};
            console.log(JSON.stringify(command));
            res.json(command);
            return;
          } else {
            Job.getCurrent( function (job) {
              console.log("not null command");
              command = {
                    cr: 1,
                    cid : cmd.commandId,
                    x : parseInt((cmd.x/job.width) * req.params.xLimMax), //x destination
                    y : parseInt((cmd.y/job.height) * req.params.yLimMax) , //y destination
                    s : job.speed, //speed at which the steppers will move for this command
                    r : cmd.magenta,//parseInt(Math.random() * paintTop), //paint pump rates
                    g : cmd.yellow,//parseInt(Math.random() * paintTop),
                    b : cmd.cyan,//parseInt(Math.random() * paintTop * 0.25),
                    w : cmd.white,
                    k : cmd.black,
                    m : 0,
                    d : cmd.dispense === true ? 255 : 0 ,
                    cl : 0,
                    pm : job.paintMultiplier
                  };
                  console.log(JSON.stringify(command));
                  res.json(command);
                  return;
                });

              }



          });
        }
      });

  } else {
    res.json({ message : "Invalid HardwareID!" });
  }
});

router.get('/cmd/:commandId', function(req, res, next) {
  Command.next(req.params.commandId, function (cmd) {
    Status.ssUpdate(req.params.commandId);
    console.log(JSON.stringify(cmd));
    res.set('Content-Type', 'application/json');
    if(!cmd) cmd = { message : 'nothing waiting'};
    res.json(cmd);
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
  if ( !process.env.OPENSHIFT_MONGODB_DB_PASSWORD || req.user ) {
    if ( !process.env.OPENSHIFT_MONGODB_DB_PASSWORD || req.user.elevated || req.user.owner ) {
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

          case "clean_slate":
          cleanSlate( function () {
            res.redirect('/');
          });
          break;

          case "portrait":
          res.render('points', {
            title: 'Project MoNET:Portrait Creator'
          });
          break;

          case "monitor":
          res.render('monitor', {
            title: 'Project MoNET:Robot Monitor'
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
  if ( !process.env.OPENSHIFT_MONGODB_DB_PASSWORD || req.user) {
    if ( !process.env.OPENSHIFT_MONGODB_DB_PASSWORD || req.user.elevated || req.user.owner) {
      var data = req.body;

      switch (req.params.dest) {
        case "users":
          console.log(data._id, data.elevated);
          User.update(data, function(status) {
            res.send({
              result: status
            });
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
          //console.log(data);
          switch (data.action) {
            case "add":
              Job.create(function(job) {
                res.send({
                  result: "success"
                });
              });
              break;
            case "play":
              Job.play(data.id, function(job) {
                res.send({
                  result: "success"
                });
              });
              break;
            case "pause":
              Job.pause(data.id, function(job) {
                res.send({
                  result: "success"
                });
              });
              break;
            case "update":
              Job.userUpdate(data, function(job) {
                res.send({
                  result: "success"
                });
              });
              break;
          }
          break;

      }
    }
  }
});

module.exports = router;
