var async = require('async');


// The sample model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var commandSchema = new Schema({
  commadId: ObjectId,
  cyan: { type: Number },
  yellow: { type: Number },
  magenta: { type: Number },
  black: { type: Number },
  white: { type: Number },
  x: { type: Number },
  y: { type: Number },
  speed: { type: Number }
});

module.exports.Command = mongoose.model('Command', commandSchema);

var calibrationSchema = new Schema ({
  xCal : { type : Number },
  yCal : { type : Number },
  paintSpeed : { type : Number}
});

calibrationSchema.statics.findUpdateOrCreate = function(data, cb) {
  var newCal = new this();
  this.model('Calibration').findOne().exec(function(err, cal) {
    if (!err) {
      if (cal === null) {
        console.log('create new cal');
        newCal.xCal = 200;
        newCal.yCal = 200;
        newCal.paintSpeed = 10000;
        newCal.save( function(err, myCal ) {
            cb(err, myCal);
            return;
        });
      }
      if (data === null) {
        console.log('sending cal');
        cb(err, cal);
        return;
      } else {
        console.log('updating cal');
        cal.xCal = data.xCal;
        cal.yCal = data.yCal;
        cal.paintSpeed = data.paintSpeed;
        cal.save(function (err, myCal) {
          cb(err, myCal);
          return;
        });
      }
    }
  });
};

module.exports.Calibration = mongoose.model('Calibration', calibrationSchema);

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
    type: String
  },
  green: {
    type: String
  },
  blue: {
    type: String
  },
  commands: [{
      type: Schema.Types.ObjectId,
      ref: 'Command'
    }]
});

sampleSchema.statics.create = function(sample, cb) {
  var newSample = new this();
  console.log("adding to samples", sample);
  newSample.red = sample.red;
  newSample.blue = sample.blue;
  newSample.green = sample.green;
  newSample.x = sample.x;
  newSample.y = sample.y;
  newSample.save(function(err, sample) {
    if (err) throw err;

    //just going to create dots for now . . . should create other strokes



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
  format: {
    type: String
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
    job.mode = data.mode || job.mode;
    job.width = data.width || job.width;
    job.height = data.height || job.height;
    job.format = data.format || job.format;
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
  speed : { type : Number },
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


//Read status codes and switch statuses
statusSchema.statics.updateStatus = function( data, callback ) {
  var newStatus = new this();
  this.model('Status').remove({}, function (err) {
    if(err) console.log(err);
    newStatus.xPos = data.xPos;
    newStatus.yPos = data.yPos;
    newStatus.xPosNext = 0;
    newStatus.yPosNext = 0;
    newStatus.xLim = data.xLimMax;
    newStatus.yLim = data.yLimMax;
    newStatus.speed = 0;
    newStatus.signal = data.signal;
    newStatus.code = data.status;
    newStatus.c = 255;
    newStatus.y = 123;
    newStatus.m = 123;
    newStatus.k = 123;
    newStatus.w = 123;
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
      if(err) console.log(err);
      callback(err, status);
    });
    return;

  });

};


module.exports.Status = mongoose.model('Status', statusSchema);
