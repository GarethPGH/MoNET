// The sample model

var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;

var sampleSchema = new Schema({
    sampleId: ObjectId,
    red: {type: String},
    green: {type: String},
    blue: {type: String},
});

module.exports.Sample = mongoose.model('Sample', sampleSchema);

var jobSchema = new Schema({
    jobId: ObjectId,
     date: { type: Date, default: Date.now },
     samples: [
        {type: Schema.Types.ObjectId, ref: 'Sample'}
     ]

});

module.exports.Job = mongoose.model('Job', jobSchema);
