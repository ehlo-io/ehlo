'use strict';
var humanSize = require('human-size');
module.exports = function size() {
  return function(mail, smtp, next) {
    mail.size = humanSize(mail.raw.length);

    return next();
  };
}
