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
  },
});

module.exports.Sample = mongoose.model('Sample', sampleSchema);

var jobSchema = new Schema({
  jobId: ObjectId,
  date: {
    type: Date,
    default: Date.now
  },
  samples: [{
    type: Schema.Types.ObjectId,
    ref: 'Sample'
  }]

});


jobSchema.statics.getCurrentJob = function(cb) {
  var newJob = new this();
  this.model('Job').findOne().sort({
    date: -1
  }).exec(function(err, job) {
    if (!err) {
      if (job == null) {
        //console.log(job);
        newJob.save(function(err, job) {
          cb(job);
          //console.log('new!');
          return;
        })
      } else {
        //console.log('exists');
        cb(job);
      }
    }
  });
}

jobSchema.statics.getTopColors = function(cb) {
  this.model('Job').findOne().sort({
    date: -1
  }).populate({
    path: 'samples',
    options: {
      limit: 3000,
      sort: {date : -1}
    }
  }).exec(function(err, job) {
    cb(job.samples.reverse());
  });


}


module.exports.Job = mongoose.model('Job', jobSchema);

var userSchema = new Schema({
  userId: ObjectId,
  facebookId : { type : Number },
  name : { type : String },
  elevated : {type : Boolean },
  owner : {type : Boolean }
});

userSchema.statics.findOrCreate = function(profile, cb) {
  var newUser = new this();
  this.model('User').findOne({facebookId : profile.id}).exec(function(err, user) {
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

module.exports.User = mongoose.model('User', userSchema);

var pageSchema = new Schema({
  pageId: ObjectId,
  subtitle : { type : String },
  monet : { type : String },
  works : { type : String },
  colorwall : { type : String },
  social : { type : String }
});

module.exports.Page = mongoose.model('Page', pageSchema);
