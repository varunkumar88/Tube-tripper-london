const CustomError = require('./custom-error')

class TfLDisambiguationError extends CustomError {
  constructor(message) {
    super(message, 300);
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = TfLDisambiguationError;