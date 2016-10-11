var async = require('async');


// The sample model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

  var counterSchema = Schema({
      counterFor: {type: String, required: true},
      seq: { type: Number, default: 1 }
  });

  counterSchema.statics.createNewCounter = function (counterFor, cb) {
    newCounter = new this();
    console.log(counterFor);
    newCounter.counterFor = counterFor;
    newCounter.save( function (err, count) {
      console.log(count.seq);
      cb(err, count);
    });
  };



  var counter = mongoose.model('counter', counterSchema);


var commandSchema = new Schema({
  cid: ObjectId,
  commandId: {type : Number},
  cyan: { type: Number },
  yellow: { type: Number },
  magenta: { type: Number },
  black: { type: Number },
  white: { type: Number },
  x: { type: Number },
  y: { type: Number },
  dispense : {type : Number},
  speed: { type: Number },
  complete: { type: String },
  paintMultiplier : { type: Number, default : 10 }
});

commandSchema.pre('save', function(next) {
    var doc = this;
    counter.findOneAndUpdate({counterFor: "command"}, {$inc: { seq: 1} }, {new : true, upsert : true} , function(err, thisCounter)   {
      if(err) return next(err);
        doc.commandId = thisCounter.seq;
        next();
    });
});

function passCommand (speed, dispense, sample) {
  mongoose.model('Command').generateCommand (speed, dispense, sample);
}

function emptyMove(speed, x, y, sampleId, dispense) {
  var sample = {
    _id : sampleId,
    red : 0,
    blue : 0,
    green : 0,
    x : x,
    y: y
  };
  generateCommand (speed, dispense, sample);
}

commandSchema.statics.commandFlow = function (job, sample) {
  if(typeof job.mode == "undefined" || job.mode == "Random continuous") {
    passCommand(job.speed, 'color', sample);

  } else if ( job.mode == "Random lines" ) {
    async.waterfall([
      //move some place random first
      function(callback) {
        var x = 0.5 + (Math.random() * (job.width - 1));
        var y = 0.5 + (Math.random() * (job.height - 1));
        emptyMove(job.speed, x, y, sample._id, 'no');
        callback(null);
      },
      //then draw the sample
      function(callback) {
        passCommand(job.speed, 'color', sample);
        callback(null);
      }
    ]);

  } else if ( job.mode == "Random spots" ) {
    async.waterfall([
      //move some place random first
      function(callback) {
        emptyMove(job.speed, sample.x - 0.5, sample.y, sample._id, 'no');
        callback(null);
      },
      //then draw the sample
      function(callback) {
        sample.x += 1;
        passCommand(job.speed * 10, 'color', sample);
        callback(null);
      },
      function(callback) {
        emptyMove(job.speed * 10, sample.x - 1, sample.y, sample._id, 'yes');
        callback(null);
      },
      function(callback) {
        emptyMove(job.speed * 10, sample.x, sample.y, sample._id, 'yes');
        callback(null);
      }
    ]);


  } else if ( job.mode == "Portrait" ) {

  }

};

commandSchema.statics.generateCommand = function (speed, dispense, sample) {
    var newCommand = new this();
    if(dispense === 'color') {
      var red = parseFloat(sample.red/255);
      var green = parseFloat(sample.green/255);
      var blue = parseFloat(sample.blue/255);

      var k = Math.min(1 - red, 1 - blue, 1 - green);

      var c = (1 - red - k)/(1-k);
      var y = (1 - blue - k)/(1-k);
      var m = (1 - green - k)/(1-k);
      console.log(c,y,m,k);
      newCommand.cyan = parseInt(!isNaN(c) ? c * 255 : 0) ;
      newCommand.yellow = parseInt(!isNaN(y) ? y * 255 : 0);
      newCommand.magenta = parseInt(!isNaN(m) ? m * 255 : 0);
      newCommand.white = parseInt(!isNaN(k) ? 255 - (k * 255) : 0);
      newCommand.black = parseInt(!isNaN(k) ? k * 255 : 0);
    } else {
      newCommand.cyan = 0;
      newCommand.yellow = 0;
      newCommand.magenta = 0;
      newCommand.white = 0;
      newCommand.black = 0;

    }

    if(dispense == "color" || dispense == 'yes') {
      newCommand.dispense = 255;
    } else {
      newCommand.dispense = 0;
    }


    newCommand.x = sample.x;
    newCommand.y = sample.y;

    newCommand.speed = speed;
    newCommand.complete = 'N';
    newCommand.save( function (err, command) {
      if(err) throw err;
      mongoose.model('Sample').findById(sample._id).exec( function (err, sample) {
        if(err) throw err;
        sample.commands.push(command._id);
        sample.save();
      });
    });
};

commandSchema.statics.purgePending = function () {
  mongoose.model('Command').update( { complete : 'P' }, { $set : { complete : 'N' }}, {multi : true}, function (err) {
    console.log("purging pending");
    if (err) throw err;
    return;
  });
};



commandSchema.statics.nextCmds = function (prevCmd, xLim, yLim, reqCount, cb) {
  async.series({
    complete : function (cb) {
        mongoose.model('Command').findOneAndUpdate({commandId : prevCmd, complete : 'P'}, {$set : { complete : 'Y' }}, {new : true}, function (err, oldCommand) {
          if(err) throw err;
          if(oldCommand) {
            console.log('Marking ' + oldCommand.commandId + ' as complete.');
            console.log('oldCommand', JSON.stringify(oldCommand));

          }

        cb(err);
      });
    },
    get : function (cb) {
      mongoose.model('Job').findOne({ status: 'active'}).sort({ date: -1})
        .populate({
          path : 'samples',
          populate : {
            path : 'commands',
            match : {complete : 'N'}
          }
        })
        .exec(function(err, job) {
          if (err) throw err;
          if(job === null) {
            cb(err,null);
            return;
          }
          var commands = job.samples.map( function(e) {
              return e.commands;
          });

          commands = [].concat.apply([],commands);

          if(commands.length === 0) {
            cb(err,null);
            return;
          }

          var cmdIds = [];

          for (var j = 0; j < commands.length; j++) {

            cmdIds.push(commands[j].commandId);
          }

          //cmd.paintMultiplier = job.paintMultiplier;
          //cmd.speed = job.speed;
          console.log(JSON.stringify(cmdIds));
          console.log(reqCount);
          mongoose.model('Command').find( {commandId : { $in: cmdIds}, complete : 'N'}).sort({'commandId' : 1}).limit(reqCount).exec( function (err, newCmds) {
            if (err) throw err;
            console.log("new commands" , JSON.stringify(newCmds));

            var newCmdIds = [];

            for( var k = 0; k < newCmds.length; k++) {

            var newCmd = newCmds[k];

            newCmdIds.push(newCmd.commandId);


            newCmds[k] = {
                  cr: 1,
                  cid : newCmd.commandId,
                  x : parseInt((newCmd.x/job.width) * xLim), //x destination
                  y : parseInt((newCmd.y/job.height) * yLim) , //y destination
                  s : parseInt(newCmd.dispense) == 0  ? job.speed : job.speedDispense, //speed at which the steppers will move for this command
                  r : newCmd.magenta * job.redBoost,//parseInt(Math.random() * paintTop), //paint pump rates
                  g : newCmd.yellow * job.greenBoost,//parseInt(Math.random() * paintTop),
                  b : newCmd.cyan * job.blueBoost,//parseInt(Math.random() * paintTop * 0.25),
                  w : newCmd.white * job.whiteBoost,
                  k : newCmd.black * job.blackBoost,
                  m : 0,
                  d : newCmd.dispense,
                  cl : 0,
                  pm : job.paintMultiplier
                };

              //console.log('commands', JSON.stringify(newCmds[k]));
            }

            mongoose.model('Command').update( {commandId : {$in : newCmdIds}}, { complete : 'P'},  {multi : true}, function (err) {
              if (err) throw err;
              cb(err, newCmds);
              return;

            });
          });
      });
    }
  },
  function (err, result) {
      if(err) throw err;
      var cmd = result.get;
      //Update this command as being in processData
      //mongoose.model('Command').findByIdandUpdate(get.commandId)
      cb(result.get);
    }
  );
};

module.exports.Command = mongoose.model('Command', commandSchema);


var sampleSchema = new Schema({
  sampleId: ObjectId,
  date: {
    type: Date,
    default: Date.now
  },
  x: {
    type: Number
  },
  y: {
    type: Number
  },
  red: {
    type: Number
  },
  green: {
    type: Number
  },
  blue: {
    type: Number
  },
  commands: [{
      type: Schema.Types.ObjectId,
      ref: 'Command'
    }]
});



sampleSchema.statics.createRandom = function(job, sample, cb) {
  var newSample = new this();

  console.log("adding to samples", sample);
  newSample.red = sample.red;
  newSample.blue = sample.blue;
  newSample.green = sample.green;
  newSample.x = 0.5 + (Math.random() * (job.width - 1));
  newSample.y = 0.5 + (Math.random() * (job.height - 1));
  newSample.save(function(err, mySample) {
      if (err) throw err;
      //just going to create dots for now . . . should create other strokes
      console.log('sample',JSON.stringify(mySample));
      mongoose.model('Job').addSample(job, mySample);
      mongoose.model('Command').commandFlow(job, mySample);
      cb(sample);
  });
};

module.exports.Sample = mongoose.model('Sample', sampleSchema);

var jobSchema = new Schema({
  jobId: ObjectId,
  title: {
    type: String
  },
  mode: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  width: {
    type: Number
  },
  height: {
    type: Number
  },
  speed: {
    type: Number
  },
  speedDispense: {
    type: Number
  },
  format: {
    type: String
  },
  paintMultiplier: {
    type: Number
  },
  redBoost: {
    type: Number
  },
  greenBoost: {
    type: Number
  },
  blueBoost: {
    type: Number
  },
  blackBoost: {
    type: Number
  },
  whiteBoost: {
    type: Number
  },
  xrand: {
    type: String
  },
  yrand: {
    type: String
  },
  status: {
    type: String
  },
  sampleCount: {
    type: Number
  },
  samples: [{
    type: Schema.Types.ObjectId,
    ref: 'Sample'
  }]

});

jobSchema.statics.create = function(cb) {
  var newJob = new this();
  newJob.status = 'paused';
  newJob.save(function(err, job) {
    if (err) throw err;
    cb(job);
  });
};

jobSchema.statics.userUpdate = function(data, cb) {
  this.model('Job').findById(data.id).exec(function(err, job) {
    if (err) throw err;
    job.title = data.title || job.title;
    if(!job.sampleCount) {
      job.width = data.width || job.width;
      job.height = data.height || job.height;
      job.mode = data.mode || job.mode;
    }
    job.speed = data.speed || job.speed;
    job.speedDispense = data.speedDispense || job.speedDispense;
    job.format = data.format || job.format;
    job.paintMultiplier = data.paintMultiplier || job.paintMultiplier;
    job.redBoost = data.redBoost || job.redBoost;
    job.greenBoost = data.greenBoost || job.greenBoost;
    job.blueBoost = data.blueBoost || job.blueBoost;
    job.whiteBoost = data.whiteBoost || job.whiteBoost;
    job.blackBoost = data.blackBoost || job.blackBoost;
    job.save();
    cb(job);
  });
};


jobSchema.statics.get = function(limit, page, cb) {
  this.model('Job').find()
    .limit(limit)
    .skip(limit * page)
    .select('-samples -__v')
    .sort({
      date: -1
    }).exec(function(err, jobs) {
      console.log(jobs);
      //jobs.samples = jobs.samples.length;
      cb(err, jobs);
    });
};


jobSchema.statics.addSample = function(job, sample) {
  this.model('Job').findById(job._id).exec(function(err, job) {
    job.samples.push(sample._id);
    job.sampleCount = job.samples.length;
    job.save();
  });
};

jobSchema.statics.getCurrent = function(cb) {
  this.model('Job').findOne({
    status: 'active'
  }).sort({
    date: -1
  }).exec(function(err, job) {
    if (err) throw err;
    cb(job);
  });
};

jobSchema.statics.pause = function(job, cb) {
  this.model('Job').findById(job).exec(function(err, job) {
    if (err) throw err;
    job.status = 'paused';
    job.save();
    cb(job);
  });
};

jobSchema.statics.play = function(job, cb) {
  console.log(job);
  var selectedJob = this.model('Job').findById(job);
  //console.log(selectedJob);
  var jobs = this.model('Job');
  jobs.update({
      status: {
        $ne: 'closed'
      }
    }, {
      status: 'paused'
    }, {
      multi: true
    },
    function(err) {
      if (err) throw err;
      selectedJob.exec(function(err, job) {
        job.status = 'active';
        job.save();
        cb(selectedJob);

      });
    });
};

jobSchema.statics.getTopSamples = function(cb) {
  this.model('Job').findOne({
    status: 'active'
  }).sort({
    date: -1
  }).populate({
    path: 'samples',
    options: {
      limit: 3000,
      sort: {
        date: -1
      }
    }
  }).exec(function(err, job) {
    console.log(job.samples);
    cb(job.samples.reverse());
  });
};

module.exports.Job = mongoose.model('Job', jobSchema);

var userSchema = new Schema({
  userId: ObjectId,
  facebookId: {
    type: Number
  },
  name: {
    type: String
  },
  elevated: {
    type: Boolean
  },
  owner: {
    type: Boolean
  }
});

userSchema.statics.findOrCreate = function(profile, cb) {
  var newUser = new this();
  this.model('User').findOne({
    facebookId: profile.id
  }).exec(function(err, user) {
    if (!err) {
      if (user === null) {
        //console.log('new!');
        newUser.facebookId = profile.id;
        newUser.name = profile.displayName;
        newUser.elevated = false;
        newUser.owner = false;
        newUser.save(cb(err, user));
      } else {
        //console.log('exists');
        cb(null, user);
        return;
      }
    }
  });
};

userSchema.statics.update = function(data, cb) {
  console.log(data._id);
  this.model('User').findById(data._id, function(err, user) {
    if (err) throw err;
    console.log(user);
    if (user) {
      user.elevated = data.elevated;
      user.save(function(err) {
        if (err) throw err;
        cb("success");
      });
    }
  });
};

module.exports.User = mongoose.model('User', userSchema);

var pageSchema = new Schema({
  pageId: ObjectId,
  subtitle: {
    type: String
  },
  monet: {
    type: String
  },
  works: {
    type: String
  },
  colorwall: {
    type: String
  },
  social: {
    type: String
  },
  contactus: {
    type: String
  }
});


pageSchema.statics.updateOrCreate = function(data, cb) {
  var newPage = new this();
  this.model('Page').findOne().exec(function(err, page) {
    if (!err) {
      if (page === null) {
        newPage.subtitle = "Subtitle";
        newPage.monet = "Monet";
        newPage.works = "Works";
        newPage.colorwall = "Colorwall";
        newPage.social = "Social";
        newPage.contactus = "Contact";
        newPage.save(cb(err, page));
        return;
      }
      if (data === null) {
        cb(err, page);
        return;
      } else {
        page.subtitle = data.subtitle;
        page.monet = data.monet;
        page.works = data.works;
        page.colorwall = data.colorwall;
        page.social = data.social;
        page.contactus = data.contactus;
        page.save(cb(err, page));
        return;
      }
    }
  });
};

module.exports.Page = mongoose.model('Page', pageSchema);

/*
Status codes
0 = none
1 = idle
2 = executing command
3 = paused
4 = eStopped
5 = prompt for xMin
6 = prompt for xMax
7 = prompt for yMin
8 = prompt for yMax
9 = finding for xMin
10 = finding for xMax
11 = finding for yMin
12 = finding for yMax
13 = exceeded xMin
14 = exceeded xMax
15 = exceeded yMin
16 = exceeded yMax
*/


//Handles the display status
var statusSchema = new Schema ({
  xPos : { type : Number },
  yPos : { type : Number },
  xPosNext : { type : Number },
  yPosNext : { type : Number },
  xLim : {type : Number },
  yLim : {type : Number },
  xLimIn : {type : Number },
  yLimIn : {type : Number },
  speed : { type : Number },
  xFact : {type : Number },
  yFact : { type : Number },
  signal : { type : Number },
  symbol : {type : Number },
  code : {type : Number },
  message : [String],
  c : { type : Number },
  y : { type : Number },
  m : {type : Number },
  k : {type : Number },
  w : {type : Number }
});

//Serverside status updateOrCreate
statusSchema.statics.ssUpdate = function (commandId) {
  console.log('updating status');
  mongoose.model('Command').findOne({commandId : commandId}).exec( function (err, cmd) {
    if(err) throw err;
    mongoose.model('Status').findOneAndUpdate({}, {
      $set : {
        xPosNext : cmd.x,
        yPosNext : cmd.y,
        c : cmd.cyan,
        y : cmd.yellow,
        m : cmd.magenta,
        k : cmd.black,
        w : cmd.white
      }
    },{new : true},  function (err, sta) {
      if(err) throw err;
      console.log("status",sta);
      return;
    });
  });
};

//Read status codes and switch statuses
statusSchema.statics.updateStatus = function( data, callback ) {
  var newStatus = new this();
  this.model('Status').remove({}, function (err) {
    if(err) throw err;
    mongoose.model('Job').getCurrent( function(job) {
      if(job === null) {
        newStatus.xLimIn = 0;
        newStatus.yLimIn = 0;
        newStatus.speed = 0;
      } else {
        newStatus.xLimIn = job.width;
        newStatus.yLimIn = job.height;
        newStatus.speed = job.speed;
      }
      newStatus.xPos = data.xPos;
      newStatus.yPos = data.yPos;
      newStatus.xPosNext = 0;
      newStatus.yPosNext = 0;
      newStatus.xLim = data.xLimMax;
      newStatus.yLim = data.yLimMax;
      newStatus.signal = data.signal;
      newStatus.code = data.status;
      newStatus.c = 0;
      newStatus.y = 0;
      newStatus.m = 0;
      newStatus.k = 0;
      newStatus.w = 0;
      switch (parseInt(data.status)) {
        case 1:
          newStatus.message = "Waiting for command.";
          break;
        case 2:
          newStatus.message = "Executing command.";
          break;
        case 3:
          newStatus.message = "Machine paused. Press pause to continue.";
          break;
        case 4:
          newStatus.message = "Emergency stop engaged. Unlock e-stop to continue.";
          break;
        case 5:
          newStatus.message = "Press soft button to find X minimum.";
          break;
        case 6:
          newStatus.message = "Press soft button to find X maximum.";
          break;
        case 7:
          newStatus.message = "Press soft button to find Y minimum.";
          break;
        case 8:
          newStatus.message = "Press soft button to find Y maximum.";
          break;
        case 9:
          newStatus.message = "Finding X minimum ...";
          break;
        case 10:
          newStatus.message = "Finding X maximum ...";
          break;
        case 11:
          newStatus.message = "Finding Y minimum ...";
          break;
        case 12:
          newStatus.message = "Finding Y maximum ...";
          break;
        case 13:
          newStatus.message = "X minimum hit. Machine stopped!";
          break;
        case 14:
          newStatus.message = "X maximum hit. Machine stopped!";
          break;
        case 15:
          newStatus.message = "Y minimum hit. Machine stopped!";
          break;
        case 16:
          newStatus.message = "Y maximum hit. Machine stopped!";
          break;
        case 17:
          newStatus.message = "Requested command from server.";
          break;
        case 18:
          newStatus.message = "Completed command.";
          break;
        default:
          newStatus.message = "derp";
        }
      newStatus.save(function(err,status) {
        if(err) throw(err);
        callback(err, status);
      });
      return;


    });


  });

};


module.exports.Status = mongoose.model('Status', statusSchema);

module.exports.cleanSlate = function (cb) {
  console.log("nuking everything!");
   mongoose.model('Command').remove({}, function () {
      mongoose.model('Job').remove({}, function () {
        mongoose.model('Sample').remove({}, function () {
          counter.remove({}, function () {
              cb();
          });
        });
      });
   });
};
