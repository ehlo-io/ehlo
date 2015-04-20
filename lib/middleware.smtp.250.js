'use strict';
module.exports = function smtpActionCompleted(mail, smtp) {
  smtp.send();
};
