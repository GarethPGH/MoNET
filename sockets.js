var Sample = require('./models/models.js').Sample;
var Job = require('./models/models.js').Job;
var Status = require('./models/models.js').Status;

var socketIO = function(server) {
  var io = require('socket.io').listen(server);
  /**
   * Listen on provided port, on all network interfaces.
   */
   //Socket io listeners
   io.on('connection', function(socket) {
     console.log('connected!');


     socket.on('new color', function(color) {

       var message = {};

       Job.getCurrent(function(job) {
         if (job !== null) {
           //console.log(color);
           message = {
             message: 'Color added by ' + color.source,
             data: color,
             sample_id: {}
           };

           Sample.create(color, function(sample) {
             Job.addSample(job, sample);
             message.sample_id = sample._id;
             socket.emit('add success', sample._id);
             io.sockets.emit('message', message);
           });
         } else {
           message = {
             message: "Can't add because no job is active"
           };
           io.sockets.emit('message', message);
         }
       });
     });

     socket.on("status_request", function () {
       Status.findOne().exec( function(err, status) {
         if(err) console.log(err);
         socket.emit("status_update", status);

       });
     });


   });



};
module.exports = socketIO;
