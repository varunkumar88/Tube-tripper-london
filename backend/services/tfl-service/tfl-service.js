require('dotenv').config()
const axios = require("axios");
const moment = require('moment');
const {
  TfLDisambiguationError,
  TfLBadRequest,
  TfLNotFoundError,
  TfLServiceUnavailableError,
  InvalidParametersError
} = require('../../errors/error-handling')

/**
 * Handles all requests to the Transport for London (TfL) API
 */
class TfLService {
  /**
   * Requests the TfL API to fetch journeys based on the journey parameters
   * @param journeyModelRequest The object that contains the journey parameters
   * @returns {object} resolves to the response.data property
   * @throws {InvalidParametersError} For errors with a specific error code
   * @throws {Error} For errors not accounted for
   */
  static async planJourney(journeyModelRequest) {
    if (!journeyModelRequest ||
      !journeyModelRequest.departure ||
      !journeyModelRequest.destination ||
      !journeyModelRequest.date ||
      !journeyModelRequest.time ||
      !journeyModelRequest.isArrivalTime) {
      throw new InvalidParametersError("Invalid parameters for journey planning.");
    }

    try {
      const response = await axios.get(
          this.buildJourneyUrl(journeyModelRequest),
          { headers: { 'Content-Type': 'multipart/form-data' }}
        );
      return response.data;
    } catch (error) {
      switch (error.response.status) {
        // if TfL is uncertain what is meant with the from and to inputs, it will return disambiguation options
        // with status code 300. We have not implemented logic to handle this, so return an error message instead.
        case 300: throw new TfLDisambiguationError('TfL returned disambiguation options.');
        // other TfL errors (the response contains a detailed error message)
        case 400: throw new TfLBadRequest(error.response.data?.message);
        case 404: throw new TfLNotFoundError('No journey found for your inputs.');
        case 503: throw new TfLServiceUnavailableError('The TfL service is currently unavailable, try again later.');
        default: throw new Error('An unexpected error occurred when requesting data to the TfL API.');
      }
    }
  };

  /**
   * Constructs the url that is going to be used to make request to the TfL API
   * @param {JourneyModelRequest} journeyModelRequest The data container
   * @returns {string} The url.
   */
  static buildJourneyUrl(journeyModelRequest){
    const from = journeyModelRequest.departure;
    const to = journeyModelRequest.destination;
    const date = moment(journeyModelRequest.date, ["YYYY/MM/DD", "YYYY-MM-DD"]).format("YYYYMMDD");
    const time = moment(journeyModelRequest.time, "HH:mm").format("HHmm");
    const timeIs = journeyModelRequest.isArrivalTime === "true" ? "arriving" : "departing";

    const url = `${process.env.TfL_BASE_URL}${process.env.TfL_JOURNEY_ENDPOINT}/${from}/to/${to}`+
    `?date=${date}&time=${time}&timeIs=${timeIs}&mode=tube&app_id=${process.env.TfL_APP_ID}&app_key=${process.env.TfL_APP_KEY}`;
    return url;
  }
}

module.exports = TfLService;
