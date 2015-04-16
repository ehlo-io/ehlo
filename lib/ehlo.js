'use strict';

var SMTPServer = require('smtp-server').SMTPServer
  , ehlo = {}
;


ehlo.options = {
  port: 10025
  , api: ''
};

ehlo.start = function() {
  console.log('Starting ehlo');
  console.log(this.options);
  var smtp = new SMTPServer();

  smtp.listen(
    this.options.port
    , function() {
      console.log('Listening on port [' + ehlo.options.port + ']');
    }
  );
};

ehlo.stop = function() {
  console.log('Stopping ehlo');
};

module.exports = ehlo;
