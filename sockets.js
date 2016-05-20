var Sample = require('./models/models.js').Sample;
var Job = require('./models/models.js').Job;


var socketIO = function(server) {
  var io = require('socket.io').listen(server);
  /**
   * Listen on provided port, on all network interfaces.
   */

  io.on('connection', function(socket) {
    console.log('connected!');


    socket.on('new color', function(color) {
      console.log(color);
      var message = {
        message: 'Server got it!',
        data: color
      }


      var sample = new Sample();
      sample.red = color.r;
      sample.green = color.g;
      sample.blue = color.b;
      sample.x = color.x;
      sample.y = color.y;
      sample.save(function(err, sample) {
        if (err) throw err;
        Job.getCurrentJob(function(job) {
          job.samples.push(sample._id);
          job.save();
        });

        socket.broadcast.emit('message', message);
      });
    });
  });
}
module.exports = socketIO;