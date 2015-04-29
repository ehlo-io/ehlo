'use strict';
var logger = require('./logger');
module.exports = function smtpTryAgainLater(mail, smtp) {
  logger.warn(
    '[%s] Send smtp [421]'
    , smtp.session.id
  );
  smtp.send(421, 'Try again later');
};
