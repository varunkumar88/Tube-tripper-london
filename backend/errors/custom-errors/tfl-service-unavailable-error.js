const CustomError = require('./custom-error')

class TfLServiceUnavailableError extends CustomError {
  constructor(message) {
    super(message, 503);
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = TfLServiceUnavailableError;