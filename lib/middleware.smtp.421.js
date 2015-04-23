'use strict';
module.exports = function smtpTryAgainLater(mail, smtp) {
  smtp.send(421, 'Try again later');
};
