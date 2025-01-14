const { createClient } = require('redis');
const envEnum = require('../../enums/envEnum')
const crypto = require("crypto");
const {RedisServerConnectionError} = require('../../errors/error-handling')

class CachingService {
  /**
   * Defines a key-value pair into the redis caching system.
   * @param {any} key
   * @param {any} value
   * @param {any} expirationTime The amount of time in minutes that it takes the key to expire
   * @remarks The expirationTime is the recommendedMaxAgeMinutes in the TfL response.
   * @throws {RedisServerConnectionError} For errors with a specific error code
   * @throws {Error} For errors not accounted for
   */
  static async set(key, value, expirationTime) {
    let cachingClient = this.createRedisClient();
    
    await cachingClient.connect();
    await cachingClient.set(key, JSON.stringify(value));
    // The TfL recommendedMaxAgeMinutes is in minutes but redis uses seconds
    const expirationTimeInSeconds =  expirationTime * 60
    await cachingClient.expire(key, expirationTimeInSeconds);
    await cachingClient.disconnect();
  }

  /**
   * Obtains the value of a key-value pair, or null if the key-value pair is not set.
   * @param {string} key The key of the key-value pair.
   * @returns {Promise<string|null>} Promises the value from the key-value pair, or null if not found.
   * @throws {RedisServerConnectionError} For errors with a specific error code
   * @throws {Error} For errors not accounted for
   */
  static async get(key) {
    let cachingClient = this.createRedisClient();

    await cachingClient.connect();
    let value =  await cachingClient.get(key);
    await cachingClient.disconnect();
    return value;
  }
  
  /**
   * Client initializer to connect the redis caching system.
   * @returns {RedisClientType} The redis client.
   * @throws {RedisServerConnectionError} For errors with a specific error code
   * @throws {Error} For errors not accounted for
   */
  static createRedisClient() {
    if (process.env.ENV.toLowerCase() === envEnum.PRODUCTION.toLowerCase()) {
      return createClient({
        // The REDIS_PRIMARY_ENDPOINT can be found on the redis cluster on AWS, change it if needed.
        // ALWAYS keep the 'redis://' otherwise AWS returns an invalid protocol error.
        url: `redis://${process.env.REDIS_PRIMARY_ENDPOINT}`
      })
      .on('error', err => this.handleRedisError(err));
    }
    else {
      // It will listen on the 127.0.0.1 (localhost) and on the port 6379 (default port)
      // Make sure that linux command ($ redis-server) starts the redis server
      return createClient()
      .on('error', err => this.handleRedisError(err));
    }
  }

  /**
   * Manages the redis errors when creating the client
   * @param {any} err Information about the specific error
   * @throws {RedisServerConnectionError} For errors with a specific error code
   * @throws {Error} For errors not accounted for
   */
  static handleRedisError(err){
    switch (err.code) {
      case 'ECONNREFUSED': throw new RedisServerConnectionError('The connection was refused to the cache server.');
      case 'ENOTFOUND': throw new RedisServerConnectionError('The cache server host was not found or the value was not found.');
      default: throw new Error('An unexpected error happened when connecting to the cache server');
    }      
  }

  /**
   * Generates a cache key of the query object to be used in the Redis key-value cache.
   * @param journeyModelRequest {Object} Contains the journey parameters.
   * @returns {string|null} Cache key of format "HH:mm:queryHash".
   */
  static generateCacheKey(journeyModelRequest) {
    if (!journeyModelRequest ||
       !journeyModelRequest.departure || 
       !journeyModelRequest.destination || 
       !journeyModelRequest.date || 
       !journeyModelRequest.time || 
       !journeyModelRequest.isArrivalTime) {
      return null;
    }

    // Do not consider the time of the journey when creating the journey hash, because we group journey responses on time windows
    const journeyModelRequestWithoutTime = {...journeyModelRequest};
    delete journeyModelRequestWithoutTime.time;

    const journeyHash = this.getHash(JSON.stringify(journeyModelRequestWithoutTime));
    const roundedTime = this.getClosestTimeInterval(journeyModelRequest.date, journeyModelRequest.time);
    return `${roundedTime}:${journeyHash}`;
  }

  /**
   * Generates a hash from a string.
   * @param data {String} The string to be hashed.
   * @returns {string} The hash of the string.
   */
  static getHash(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Rounds time to the nearest time window interval.
   * @param date {String} Date in "YYYY-MM-DD".
   * @param time {String} Time in "HH:mm".
   * @param interval {int} The time window interval. For example, a value of 5 means that time will be rounded to the
   * closest 5 minute interval (11:28 -> 11:30, 11:32 -> 11:30).
   * @returns {string} Rounded time in "HH:mm".
   */
  static getClosestTimeInterval(date, time, interval = 5) {
    const formattedTime = new Date(`${date} ${time}`);

    // coefficient to convert minutes to milliseconds
    const coefficient = 1000 * 60 * interval;
    let roundedTime = new Date(Math.round(formattedTime.getTime() / coefficient) * coefficient);
    return roundedTime.toLocaleTimeString("en-GB", {hour: "2-digit", minute:"2-digit"});
  }
}

module.exports = CachingService;
