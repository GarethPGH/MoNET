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

module.exports = mongoose.model('Sample', sampleSchema);
