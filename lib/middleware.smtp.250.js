'use strict';
var logger = require('./logger');
module.exports = function smtpActionCompleted(mail, smtp) {
  logger.verbose(
    '[%s] Send smtp [250]'
    , smtp.session.id
  );
  smtp.send();
};
