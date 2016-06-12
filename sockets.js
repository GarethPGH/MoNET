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

      var message = {};

      Job.getCurrent(function(job) {
        if (job != null) {
          console.log(color);
          message = {
            message: 'Color added by ' + color.source,
            data: color,
            sample_id: {}
          }

          Sample.create(color, function(sample) {
            Job.addSample(job, sample)
            message.sample_id = sample._id
            socket.emit('add success', sample._id);
            io.sockets.emit('message', message);
          });
        } else {
          message = {
            message: "Can't add because no job is active"
          }
          socket.emit('message', message);
        }
      });
    });
  });
}
module.exports = socketIO;
