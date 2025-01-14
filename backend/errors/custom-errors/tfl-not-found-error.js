const CustomError = require('./custom-error')

class TfLNotFoundError extends CustomError {
  constructor(message) {
    super(message, 404);
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = TfLNotFoundError;