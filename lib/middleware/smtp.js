'use strict';
var logger = require('../logger');
module.exports = function smtpReturn(code, message) {
  return function(mail, smtp) {
    logger.verbose(
      '[%s] Send smtp [%d]'
      , smtp.session.id
      , code
    );
    smtp.send(code, message);
  }
};
