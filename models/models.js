// The sample model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

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
  }
});

sampleSchema.statics.create = function(sample, cb) {
  var newSample = new this();
  newSample.red = sample.red;
  newSample.blue = sample.blue;
  newSample.green = sample.green;
  newSample.x = sample.x;
  newSample.y = sample.y;
  newSample.save(function(err, sample) {
    if (err) throw err;
    cb(sample);
  });
}

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
}

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
}

jobSchema.statics.addSample = function(job, sample) {
  this.model('Job').findById(job._id).exec(function(err, job) {
    job.samples.push(sample._id);
    job.sampleCount = job.samples.length;
    job.save();
  });
}

jobSchema.statics.getCurrent = function(cb) {
  this.model('Job').findOne({
    status: 'active'
  }).sort({
    date: -1
  }).exec(function(err, job) {
    if (err) throw err;
    cb(job);
  });
}

jobSchema.statics.pause = function(job) {
  this.model('Job').findById(job._id).exec(function(err, job) {
    if (err) throw err;
    job.status = 'paused';
    job.save();
  });
}

jobSchema.statics.play = function(job) {
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
      job.status = 'active';
      job.save();
      return;
    });
}

jobSchema.statics.getTopSamples = function(cb) {
  this.model('Job').findOne().sort({
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
    cb(job.samples.reverse());
  });
}

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
      if (user == null) {
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
}

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
}

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
}

module.exports.Page = mongoose.model('Page', pageSchema);
