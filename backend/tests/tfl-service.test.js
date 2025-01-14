const TfLService = require('../services/tfl-service/tfl-service')

const {
  TfLDisambiguationError,
  TfLBadRequest,
  TfLNotFoundError,
  TfLServiceUnavailableError,
  InvalidParametersError
} = require('../errors/error-handling')
const JourneyModelRequest = require( '../models/journey-model-request' );
const axios = require("axios");
const moment = require('moment');

jest.mock('redis');
jest.mock('moment');

describe('TfLService', () => {
  beforeEach(() => {
    process.env.TfL_BASE_URL = undefined;
    process.env.TfL_JOURNEY_ENDPOINT = undefined;
    process.env.TfL_APP_ID = undefined;
    process.env.TfL_APP_KEY = undefined;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('planJourney normal flow', async () => {
    // Arrange
    const query = {
      departure: 'departure',
      destination: 'destination',
      date: 'date',
      time: 'time',
      isArrivalTime: 'isArrivalTime',
    };
    const axiosData = {
      data: {
        test: 'test',
        testObject: {
          testObjectChild : 'testObjectChild'
        },
        recommendedMaxAgeMinutes: 5,
      }
    };

    jest.spyOn(TfLService, 'buildJourneyUrl')
    .mockImplementation(() => 'mockedUrl');
    jest.spyOn(axios, 'get')
    .mockImplementation(() => axiosData);

    // Act
    var actual = await TfLService.planJourney(new JourneyModelRequest(query))
    // Assert
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('mockedUrl', { headers: { 'Content-Type': 'multipart/form-data' }});
    expect(actual).toEqual({
      test: 'test',
      testObject: {
        testObjectChild : 'testObjectChild'
      },
      recommendedMaxAgeMinutes: 5,
    });
  });

  test.each([
    [null],
    [makeQuery(null, 'destination', 'date', 'time', 'isArrivalTime')],
    [makeQuery('departure', null, 'date', 'time', 'isArrivalTime')],
    [makeQuery('departure', 'destination', null, 'time', 'isArrivalTime')],
    [makeQuery('departure', 'destination', 'date', null, 'isArrivalTime')],
    [makeQuery('departure', 'destination', 'date', 'time', null)],
  ])('planJourney parameter does not have data or does not have all data', async (query) => {
    // Arrange
    // Act & Assert
    TfLService.planJourney(new JourneyModelRequest(query)).catch(error => {
      expect(error).toBeInstanceOf(InvalidParametersError);
      expect(error.message).toBe("Invalid parameters for journey planning.");
      expect(error.code).toBe(400);
    });
  });

  test('buildJourneyUrl departing', async () => {
    // Arrange
    process.env.TfL_BASE_URL = 'TfL_BASE_URL';
    process.env.TfL_JOURNEY_ENDPOINT = 'TfL_JOURNEY_ENDPOINT';
    process.env.TfL_APP_ID = 'TfL_APP_ID';
    process.env.TfL_APP_KEY = 'TfL_APP_KEY';

    const query = {
      departure: '910GACTNCTL',
      destination: '940GZZLUOXC',
      date: '2023-12-01',
      time: '11:00',
      isArrivalTime: 'false'
    };

    moment.mockReturnValueOnce({ format: () => '2023/12/01' });
    moment.mockReturnValueOnce({ format: () => '11:00' });

    const expected = `TfL_BASE_URLTfL_JOURNEY_ENDPOINT/910GACTNCTL/to/940GZZLUOXC`+
    `?date=2023/12/01&time=11:00&timeIs=departing&mode=tube&app_id=TfL_APP_ID&app_key=TfL_APP_KEY`;

    // Act
    var actual = TfLService.buildJourneyUrl(new JourneyModelRequest(query));

    // Assert
    expect(actual).toEqual(expected);
  });

  test('buildJourneyUrl arriving', async () => {
    // Arrange
    process.env.TfL_BASE_URL = 'TfL_BASE_URL';
    process.env.TfL_JOURNEY_ENDPOINT = 'TfL_JOURNEY_ENDPOINT';
    process.env.TfL_APP_ID = 'TfL_APP_ID';
    process.env.TfL_APP_KEY = 'TfL_APP_KEY';

    const query = {
      departure: '910GACTNCTL',
      destination: '940GZZLUOXC',
      date: '2023-12-01',
      time: '11:00',
      isArrivalTime: 'true'
    };

    moment.mockReturnValueOnce({ format: () => '2023/12/01' });
    moment.mockReturnValueOnce({ format: () => '11:00' });

    const expected = `TfL_BASE_URLTfL_JOURNEY_ENDPOINT/910GACTNCTL/to/940GZZLUOXC`+
    `?date=2023/12/01&time=11:00&timeIs=arriving&mode=tube&app_id=TfL_APP_ID&app_key=TfL_APP_KEY`;

    // Act
    var actual = TfLService.buildJourneyUrl(new JourneyModelRequest(query));

    // Assert
    expect(actual).toEqual(expected);
  });

  test.each([
    [makeMockAxiosGet(300, ''), TfLDisambiguationError, 'TfL returned disambiguation options.', 300],
    [makeMockAxiosGet(400, 'Bad request message'), TfLBadRequest, 'Bad request message', 400],
    [makeMockAxiosGet(404, ''), TfLNotFoundError, 'No journey found for your inputs.', 404],
    [makeMockAxiosGet(503, ''), TfLServiceUnavailableError, 'The TfL service is currently unavailable, try again later.', 503],
  ])('planJourney errorHandling', async (mockAxiosGet, errorInstance, message, code ) => {
    // Arrange
    const query = {
      departure: 'departure',
      destination: 'destination',
      date: 'date',
      time: 'time',
      isArrivalTime: 'isArrivalTime',
    };

    jest.spyOn(TfLService, 'buildJourneyUrl')
    .mockImplementation(() => 'mockedUrl');
    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockRejectedValue(mockAxiosGet);

    // Act & Assert
    try {
      _ = await TfLService.planJourney(new JourneyModelRequest(query))
    } catch (error) {
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('mockedUrl', { headers: { 'Content-Type': 'multipart/form-data' }});
      
      expect(error).toBeInstanceOf(errorInstance);
      expect(error.message).toEqual(message);
      expect(error.code).toEqual(code);
    }
  });

  
  test('planJourney errorHandling default error', async () => {
    // Arrange
    const query = {
      departure: 'departure',
      destination: 'destination',
      date: 'date',
      time: 'time',
      isArrivalTime: 'isArrivalTime',
    };

    jest.spyOn(TfLService, 'buildJourneyUrl')
    .mockImplementation(() => 'mockedUrl');
    const axiosGetSpy = jest.spyOn(axios, 'get');
    axiosGetSpy.mockRejectedValue(makeMockAxiosGet(999, ''));

    // Act & Assert
    try {
      _ = await TfLService.planJourney(new JourneyModelRequest(query))
    } catch (error) {
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith('mockedUrl', { headers: { 'Content-Type': 'multipart/form-data' }});
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual('An unexpected error occurred when requesting data to the TfL API.');
    }
  });
});

function makeQuery(departure, destination, date, time, isArrivalTime) {
  return {
    departure,
    destination,
    date,
    time,
    isArrivalTime,
  };
}

function makeMockAxiosGet(status, message) {
  return {
    response: {
      status,
      data: { message },
    },
  };
}