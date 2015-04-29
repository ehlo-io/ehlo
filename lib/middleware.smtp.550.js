'use strict';
var logger = require('./logger');
module.exports = function smtpMailboxUnavailable(mail, smtp) {
  logger.error(
    '[%s] Send smtp [550]'
    , smtp.session.id
  );
  smtp.send(550, 'Mailbox unavailable');
};
