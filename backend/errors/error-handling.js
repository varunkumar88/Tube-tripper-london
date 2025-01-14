const InvalidParametersError = require( './custom-errors/invalid-parameters');
const RedisServerConnectionError = require( './custom-errors/redis-server-connection-error');
const TfLDisambiguationError = require('./custom-errors/tfl-disambiguation-error');
const TfLBadRequest = require('./custom-errors/tfl-bad-request-error');
const TfLNotFoundError = require('./custom-errors/tfl-not-found-error');
const TfLServiceUnavailableError = require('./custom-errors/tfl-service-unavailable-error');

module.exports = {
    InvalidParametersError,
    RedisServerConnectionError,
    TfLDisambiguationError,
    TfLBadRequest,
    TfLNotFoundError,
    TfLServiceUnavailableError,
};