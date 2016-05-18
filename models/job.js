// The sample model

var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;

var jobSchema = new Schema({
    jobId: ObjectId,
     date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
