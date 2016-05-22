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
        console.log(job);
        newJob.save(function(err, job) {
          cb(job);
          console.log('new!');
          return;
        })
      } else {
        console.log('exists');
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
    cb(job.samples.revese());
  });

}


module.exports.Job = mongoose.model('Job', jobSchema);
