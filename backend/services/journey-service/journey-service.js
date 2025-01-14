const cachingService = require('../caching-service/caching-service')
const tflService = require("../tfl-service/tfl-service")

/**
 * Handles the journey request flow.
 */
class JourneyService {
  /**
   * Requests the journey from either the cache service or the TfL service
   * @param {JourneyModelRequest} journeyModelRequest
   * @returns {object} The journey object
   */
  static async getJourney(journeyModelRequest) {
    const cacheKey = cachingService.generateCacheKey(journeyModelRequest);
    
    let cacheValue;
    try {
      cacheValue = await cachingService.get(cacheKey);
    } catch (error) {
      const journey = await tflService.planJourney(journeyModelRequest);
      return journey;
    }
    
    if (cacheValue != null) {
      return JSON.parse(cacheValue);
    } else {
      const journey = await tflService.planJourney(journeyModelRequest);
      await cachingService.set(cacheKey, journey, journey.recommendedMaxAgeMinutes == 0 ? 1 : journey.recommendedMaxAgeMinutes);
      return journey;
    }
  }
}

module.exports = JourneyService