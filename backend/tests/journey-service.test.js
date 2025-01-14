const JourneyService = require('../services/journey-service/journey-service')
const JourneyModelRequest = require( '../models/journey-model-request' );
const CachingService = require('../services/caching-service/caching-service');
const TfLService = require('../services/tfl-service/tfl-service');

/**
 * Covers the requirements F2 and F3
 * The mock of the responses are done accordingly to the response sample provided by the TfL API
 * https://api.tfl.gov.uk/swagger/ui/index.html?url=/swagger/docs/v1#!/Journey/Journey_JourneyResults
 */

describe('TC8 JourneyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('TC8.1 see multiple journey time options after I plan a journey', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    // The searchCriteria is the part of the object that has information about different time options
    const journeyData = {
      "searchCriteria": {
        "dateTime": "2023-12-06T14:10:00",
        "dateTimeType": "Departing",
        "timeAdjustments": {
          "earliest": {
            "date": "20231206",
            "time": "0300",
            "timeIs": "departing",
          },
          "earlier": {
            "date": "20231206",
            "time": "1410",
            "timeIs": "departing",
          },
          "later": {
            "date": "20231206",
            "time": "1410",
            "timeIs": "departing",
          },
          "latest": {
            "date": "20231207",
            "time": "0300",
            "timeIs": "departing",
          }
        }
      }
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.searchCriteria.dateTime).toEqual(`${query.date}T${query.time}:00`);
    expect(actual.searchCriteria.dateTimeType.toLowerCase()).toEqual(query.isArrivalTime === "true" ? "arriving" : "departing");
    // Check if there's multiple options
    expect(actual.searchCriteria.timeAdjustments.earliest).not.toBeNull();
    expect(actual.searchCriteria.timeAdjustments.earlier).not.toBeNull();
    expect(actual.searchCriteria.timeAdjustments.later).not.toBeNull();
    expect(actual.searchCriteria.timeAdjustments.latest).not.toBeNull();
  });
  
  test('TC8.2 see multiple departure or arrival time options that are before my specified departure or arrival time', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    // The searchCriteria is the part of the object that has information about different time options
    const journeyData = {
      "searchCriteria": {
        "dateTime": "2023-12-06T14:10:00",
        "dateTimeType": "Departing",
        "timeAdjustments": {
          "earliest": {
            "date": "20231206",
            "time": "0300",
            "timeIs": "departing",
          },
          "earlier": {
            "date": "20231206",
            "time": "1410",
            "timeIs": "departing",
          },
          "later": {
            "date": "20231206",
            "time": "1410",
            "timeIs": "departing",
          },
          "latest": {
            "date": "20231207",
            "time": "0300",
            "timeIs": "departing",
          }
        }
      }
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.searchCriteria.dateTime).toEqual(`${query.date}T${query.time}:00`);
    expect(actual.searchCriteria.dateTimeType.toLowerCase()).toEqual(query.isArrivalTime === "true" ? "arriving" : "departing");
    // Check if the options available are before the time sent
    expect(actual.searchCriteria.timeAdjustments.earliest).not.toBeNull();
    expect(
      buildDateTimeFromStrings(
      actual.searchCriteria.timeAdjustments.earliest.date,
      actual.searchCriteria.timeAdjustments.earliest.time).getTime()
    ).toBeLessThanOrEqual(buildDateTimeFromStrings(
      query.date.replace(/-/g, ''),
      query.date.replace(/:/g, '')).getTime());
    expect(actual.searchCriteria.timeAdjustments.earlier).not.toBeNull();
    expect(
      buildDateTimeFromStrings(
      actual.searchCriteria.timeAdjustments.earlier.date,
      actual.searchCriteria.timeAdjustments.earlier.time).getTime()
    ).toBeLessThanOrEqual(buildDateTimeFromStrings(
      query.date.replace(/-/g, ''),
      query.date.replace(/:/g, '')).getTime());
  });
  
  test('TC8.3 see multiple departure or arrival time options that are after my specified departure or arrival time', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    // The searchCriteria is the part of the object that has information about different time options
    const journeyData = {
      "searchCriteria": {
        "dateTime": "2023-12-06T14:10:00",
        "dateTimeType": "Departing",
        "timeAdjustments": {
          "earliest": {
            "date": "20231206",
            "time": "0300",
            "timeIs": "departing",
          },
          "earlier": {
            "date": "20231206",
            "time": "1410",
            "timeIs": "departing",
          },
          "later": {
            "date": "20231206",
            "time": "1410",
            "timeIs": "departing",
          },
          "latest": {
            "date": "20231207",
            "time": "0300",
            "timeIs": "departing",
          }
        }
      }
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.searchCriteria.dateTime).toEqual(`${query.date}T${query.time}:00`);
    expect(actual.searchCriteria.dateTimeType.toLowerCase()).toEqual(query.isArrivalTime === "true" ? "arriving" : "departing");
    // Check if the options available are after the time sent
    expect(actual.searchCriteria.timeAdjustments.later).not.toBeNull();
    expect(
      buildDateTimeFromStrings(
      actual.searchCriteria.timeAdjustments.later.date,
      actual.searchCriteria.timeAdjustments.later.time).getTime()
    ).toBeGreaterThanOrEqual(buildDateTimeFromStrings(
      query.date.replace(/-/g, ''),
      query.time.replace(/:/g, '')).getTime());
    expect(actual.searchCriteria.timeAdjustments.latest).not.toBeNull();
    expect(
      buildDateTimeFromStrings(
      actual.searchCriteria.timeAdjustments.latest.date,
      actual.searchCriteria.timeAdjustments.latest.time).getTime()
    ).toBeGreaterThanOrEqual(buildDateTimeFromStrings(
      query.date.replace(/-/g, ''),
      query.date.replace(/:/g, '')).getTime());
  });
});

describe('TC9 JourneyService', () => {
   beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  }); 

  test('TC9.1 see the name of the departure station', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "legs": [
            {
              "departurePoint": {
                "commonName": "Acton Central Station"
              }
            }
          ]
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].legs[0].departurePoint.commonName).toEqual("Acton Central Station");
  });

  test('TC9.2 see the name of the arrival station', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "legs": [
            {
              "arrivalPoint": {
                "commonName": "Acton Town"
              }
            }
          ]
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].legs[0].arrivalPoint.commonName).toEqual("Acton Town");
  });

  test('TC9.3 see the names of stations where I need to change vehicles', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "legs": [
            {
              "arrivalPoint": {
                "commonName": "Acton Town"
              }
            }
          ]
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].legs[0].arrivalPoint.commonName).toEqual("Acton Town");
  });

  test('TC9.4 see the departure time', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "startDateTime": "2023-12-06T14:10:00",
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].startDateTime).toEqual("2023-12-06T14:10:00");
  });
  
  test('TC9.5 see the arrival time', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "arrivalDateTime": "2023-12-06T14:32:00",
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].arrivalDateTime).toEqual("2023-12-06T14:32:00");
  });
  
  test('TC9.6 see the times for when I have to change vehicles', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "arrivalDateTime": "2023-12-06T14:32:00",
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].arrivalDateTime).toEqual("2023-12-06T14:32:00");
  });
  
  test('TC9.7 see the journeys duration', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "duration": 22,
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].duration).toEqual(22);
  });

  test('TC9.8 see the cost of the journey', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "fare": {
            "totalCost": 0,
          }
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].fare.totalCost).toEqual(0);
  });

  test('TC9.9 see information on potential delays', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "legs": [
            {
              "disruptions": [
                {
                  "description": "Minor delays between Paddington and Heathrow Terminals/Reading due to a person taken ill on train earlier at West Ealing. GOOD SERVICE on the rest of the line.",
                },
              ]
            }
          ]
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].legs[0].disruptions[0].description).toEqual(
      "Minor delays between Paddington and Heathrow Terminals/Reading due to a person taken ill on train earlier at West Ealing. GOOD SERVICE on the rest of the line."
    );
    expect(actual.journeys[0].legs[0].disruptions[0].description).toContain("delay")
  });

  test('TC9.10 see information on canceled rides', async () => {
    // Arrange
    const query = {
      departure: '1001002',
      destination: '1000002',
      date: '2023-12-06',
      time: '14:10',
      isArrivalTime: 'false',
    };

    const journeyData = {
      "journeys": [
        {
          "legs": [
            {
              "disruptions": [
                {
                  "description": "Central Line: Severe delays due to train cancellations. Tickets will be accepted on local buses, The Elizabeth Line, Chiltern Railways, Great Western Railway and Greater Anglia.",
                },
              ]
            }
          ]
        }
      ]
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => 'cacheKey');
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(journeyData));

    // Act
    const actual = await JourneyService.getJourney(new JourneyModelRequest(query));

    // Assert
    expect(actual.journeys[0].legs[0].disruptions[0].description).toEqual(
      "Central Line: Severe delays due to train cancellations. Tickets will be accepted on local buses, The Elizabeth Line, Chiltern Railways, Great Western Railway and Greater Anglia."
    );
    expect(actual.journeys[0].legs[0].disruptions[0].description).toContain("cancel")
  });
});

/**
 * Covers the implementation of the file
 */
describe('TC13 JourneyService - Implementation tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });


  test('TC13.1 getJourney has data in cache', async () => {
    // Arrange
    const query = {
      departure: 'departure',
      destination: 'destination',
      date: 'date',
      time: 'time',
      isArrivalTime: 'isArrivalTime',
    };
    const journeyModelRequest = new JourneyModelRequest(query);
    const cacheKey = 'cacheKey';
    const cacheValue = {
      test: 'test',
      testObject: {
        testObjectChild : 'testObjectChild'
      },
      recommendedMaxAgeMinutes: 5,
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => cacheKey);
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => JSON.stringify(cacheValue));

    // Act
    const actual = await JourneyService.getJourney(journeyModelRequest);

    // Assert
    expect(CachingService.generateCacheKey).toHaveBeenCalledTimes(1);
    expect(CachingService.generateCacheKey).toHaveBeenCalledWith(new JourneyModelRequest(query));
    expect(CachingService.get).toHaveBeenCalledTimes(1);
    expect(CachingService.get).not.toThrow();
    expect(CachingService.get).toHaveBeenCalledWith('cacheKey');
    expect(actual).toEqual({
      test: 'test',
      testObject: {
        testObjectChild : 'testObjectChild'
      },
      recommendedMaxAgeMinutes: 5,
    });
  });

  test('TC13.2 getJourney does not have data in cache and data does not have recommendedMaxAgeMinutes with number > 0', async () => {
    // Arrange
    const query = {
      departure: 'departure',
      destination: 'destination',
      date: 'date',
      time: 'time',
      isArrivalTime: 'isArrivalTime',
    };
    const journeyModelRequest = new JourneyModelRequest(query);
    const cacheKey = 'cacheKey';
    const journeyData = {
      test: 'test',
      testObject: {
        testObjectChild : 'testObjectChild'
      },
      recommendedMaxAgeMinutes: 0,
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => cacheKey);
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => null);
    jest.spyOn(CachingService, 'set')
    .mockImplementation(() => jest.fn());
    jest.spyOn(TfLService, 'planJourney')
    .mockImplementation(() => journeyData);

    // Act
    const actual = await JourneyService.getJourney(journeyModelRequest);

    // Assert
    expect(CachingService.generateCacheKey).toHaveBeenCalledTimes(1);
    expect(CachingService.generateCacheKey).toHaveBeenCalledWith(new JourneyModelRequest(query));
    expect(CachingService.get).toHaveBeenCalledTimes(1);
    expect(CachingService.get).not.toThrow();
    expect(CachingService.get).toHaveBeenCalledWith('cacheKey');
    expect(CachingService.set).toHaveBeenCalledTimes(1);
    expect(CachingService.set).toHaveBeenCalledWith(
      'cacheKey',
      {
        test: 'test',
        testObject: {
          testObjectChild : 'testObjectChild'
        },
        recommendedMaxAgeMinutes: 0,
      },
      1);
    expect(actual).toEqual({
      test: 'test',
      testObject: {
        testObjectChild : 'testObjectChild'
      },
      recommendedMaxAgeMinutes: 0,
    });
  });

  test('TC13.3 getJourney does not have data in cache', async () => {
    // Arrange
    const query = {
      departure: 'departure',
      destination: 'destination',
      date: 'date',
      time: 'time',
      isArrivalTime: 'isArrivalTime',
    };
    const journeyModelRequest = new JourneyModelRequest(query);
    const cacheKey = 'cacheKey';
    const journeyData = {
      test: 'test',
      testObject: {
        testObjectChild : 'testObjectChild'
      },
      recommendedMaxAgeMinutes: 5,
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => cacheKey);
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => null);
    jest.spyOn(CachingService, 'set')
    .mockImplementation(() => jest.fn());
    jest.spyOn(TfLService, 'planJourney')
    .mockImplementation(() => journeyData);

    // Act
    const actual = await JourneyService.getJourney(journeyModelRequest);

    // Assert
    expect(CachingService.generateCacheKey).toHaveBeenCalledTimes(1);
    expect(CachingService.generateCacheKey).toHaveBeenCalledWith(new JourneyModelRequest(query));
    expect(CachingService.get).toHaveBeenCalledTimes(1);
    expect(CachingService.get).not.toThrow();
    expect(CachingService.get).toHaveBeenCalledWith('cacheKey');
    expect(CachingService.set).toHaveBeenCalledTimes(1);
    expect(CachingService.set).toHaveBeenCalledWith(
      'cacheKey',
      {
        test: 'test',
        testObject: {
          testObjectChild : 'testObjectChild'
        },
        recommendedMaxAgeMinutes: 5,
      },
      5);
    expect(actual).toEqual({
      test: 'test',
      testObject: {
        testObjectChild : 'testObjectChild'
      },
      recommendedMaxAgeMinutes: 5,
    });
  });

  
  test('TC13.4 getJourney get cached value throws', async () => {
    // Arrange
    const query = {
      departure: 'departure',
      destination: 'destination',
      date: 'date',
      time: 'time',
      isArrivalTime: 'isArrivalTime',
    };
    const journeyModelRequest = new JourneyModelRequest(query);
    const cacheKey = 'cacheKey';
    const journeyData = {
      test: 'test',
      testObject: {
        testObjectChild : 'testObjectChild'
      },
      recommendedMaxAgeMinutes: 5,
    };

    jest.spyOn(CachingService, 'generateCacheKey')
    .mockImplementation(() => cacheKey);
    jest.spyOn(CachingService, 'get')
    .mockImplementation(() => {
      throw new Error('The error does not matter here.');
    });
    jest.spyOn(TfLService, 'planJourney')
    .mockImplementation(() => journeyData);

    // Act
    const actual = await JourneyService.getJourney(journeyModelRequest);

    // Assert
    expect(CachingService.generateCacheKey).toHaveBeenCalledTimes(1);
    expect(CachingService.generateCacheKey).toHaveBeenCalledWith(new JourneyModelRequest(query));
    expect(CachingService.get).toHaveBeenCalledTimes(1);
    expect(CachingService.get).toThrow();
    expect(TfLService.planJourney).toHaveBeenCalledTimes(1);
    expect(TfLService.planJourney).toHaveBeenCalledWith(new JourneyModelRequest(query));
    expect(actual).toEqual({
      test: 'test',
      testObject: {
        testObjectChild : 'testObjectChild'
      },
      recommendedMaxAgeMinutes: 5,
    });
  });
});

function buildDateTimeFromStrings(dateString, timeString){
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hours = timeString.substring(0, 2);
  const minutes = timeString.substring(2, 4);
  const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`)
  const timeZoneOffset = 1; // NL time
  date.setMinutes(date.getMinutes() + timeZoneOffset * 60)
  return date
}