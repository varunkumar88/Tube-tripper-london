const CustomError = require('./custom-error')

class RedisServerConnectionError extends CustomError {
  constructor(message) {
    super(message, 502);
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = RedisServerConnectionError;