let redis = require('redis');
const CachingService = require('../services/caching-service/caching-service');
const { RedisServerConnectionError } = require('../errors/error-handling')

jest.mock('redis');

describe('TC2 CachingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('TC2.1 get function normal flow', async () => {
    // Arrange
    const key = 'testKey';
    const value = 'testValue';
    const cachingClientMock = {
      connect: jest.fn(),
      get: jest.fn().mockReturnValue(value),
      disconnect: jest.fn(),
    };

    jest.spyOn(CachingService, 'createRedisClient')
    .mockImplementation(() => (cachingClientMock));
    
    // Act
    const actual = await CachingService.get(key);

    // Assert
    expect(CachingService.createRedisClient).toHaveBeenCalledTimes(1)
    expect(cachingClientMock.connect).toHaveBeenCalledTimes(1);
    expect(cachingClientMock.get).toHaveBeenCalledTimes(1);
    expect(cachingClientMock.get).toHaveBeenCalledWith('testKey');
    expect(cachingClientMock.disconnect).toHaveBeenCalledTimes(1);    
    expect(actual).toBe('testValue');
  });

  test('TC2.2 set function normal flow', async () => {
    // Arrange
    const key = 'testKey';
    const value = 'testValue';
    const cachingClientMock = {
      connect: jest.fn(),
      set: jest.fn(),
      expire: jest.fn(),
      disconnect: jest.fn(),
    };
    const expirationTimeInMinutes = 1;
    const actualExpirationTimeInSeconds = expirationTimeInMinutes * 60;

    jest.spyOn(CachingService, 'createRedisClient')
    .mockImplementation(() => (cachingClientMock));

    // Act
    await CachingService.set(key, value, expirationTimeInMinutes);

    // Assert
    expect(CachingService.createRedisClient).toHaveBeenCalledTimes(1);
    expect(cachingClientMock.connect).toHaveBeenCalledTimes(1);
    expect(cachingClientMock.set).toHaveBeenCalledTimes(1);
    expect(cachingClientMock.set).toHaveBeenCalledWith('testKey', JSON.stringify('testValue'));
    expect(cachingClientMock.expire).toHaveBeenCalledWith('testKey', 60);
    expect(cachingClientMock.disconnect).toHaveBeenCalledTimes(1);
  });

  test('TC2.3 get function redis client throws', async () => {
    // Arrange
    const key = 'testKey';

    jest.spyOn(CachingService, 'createRedisClient')
    .mockImplementation(() => {
      throw new Error('The error does not matter here.');
    });

    // Act & Assert
    CachingService.get(key).catch(error => {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('The error does not matter here.');
    });
  });
  
  test('TC2.4 set function redis client throws ', async () => {
    // Arrange
    const key = 'testKey';
    const value = 'testValue';
    const expirationTimeInMinutes = 1;

    jest.spyOn(CachingService, 'createRedisClient')
    .mockImplementation(() => {
      throw new Error('The error does not matter here.');
    });

    // Act & Assert
    CachingService.set(key, value, expirationTimeInMinutes).catch(error => {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('The error does not matter here.');
    });
  });
});

describe('TC10 createClient', () => {
  beforeEach(() => {
    process.env.ENV = undefined;
    process.env.REDIS_PRIMARY_ENDPOINT = undefined;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });  

  test('TC10.1 create redis client normal flow for production', async () => {
    // Arrange
    process.env.ENV = 'production';
    process.env.REDIS_PRIMARY_ENDPOINT = 'redisPrimaryEndpoint';
    const createClientMock = {
      on: jest.fn()
    }

    jest.spyOn(redis, 'createClient')
    .mockImplementation(() => createClientMock);

    // Act
    _ = await CachingService.createRedisClient();

    // Assert
    expect(redis.createClient).toHaveBeenCalledTimes(1);
    expect(redis.createClient).not.toThrow();
    expect(redis.createClient).toHaveBeenCalledWith({
      url: 'redis://redisPrimaryEndpoint',
    });
  });

  test('TC10.2 create redis client normal flow for other environment ', async () => {
    // Arrange
    process.env.ENV = 'development';
    const createClientMock = {
      on: jest.fn()
    }
    jest.spyOn(redis, 'createClient')
    .mockImplementation(() => createClientMock);

    // Act
    _ = await CachingService.createRedisClient();

    // Assert
    expect(redis.createClient).toHaveBeenCalledTimes(1);
    expect(redis.createClient).not.toThrow();
    expect(redis.createClient).toHaveBeenCalledWith();
  });
});


describe('TC11 handleRedisError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });  

  test('TC11.1 that ECONNREFUSED throws the correct message', () => {
    // Arrange
    const err = {
      code: 'ECONNREFUSED'
    }

    // Act & Assert
    try {
      CachingService.handleRedisError(err);
    } catch (error) {
      expect(error).toBeInstanceOf(RedisServerConnectionError);
      expect(error.message).toBe('The connection was refused to the cache server.');
      expect(error.code).toBe(502);
    }
  });

  test('TC11.2 that ENOTFOUND throws the correct message', () => {
    // Arrange
    const err = {
      code: 'ENOTFOUND'
    }

    // Act & Assert
    try {
      CachingService.handleRedisError(err);
    } catch (error) {
      expect(error).toBeInstanceOf(RedisServerConnectionError);
      expect(error.message).toBe('The cache server host was not found or the value was not found.');
      expect(error.code).toBe(502);
    }
  });

  test('TC11.3 that an Error throws a default message when no error code is defined', () => {
    // Arrange
    const err = {
      code: 'NOT_ERROR_FOUND_DEFINED'
    }

    // Act & Assert
    try {
      CachingService.handleRedisError(err);
    } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('An unexpected error happened when connecting to the cache server');
    }
  });
});

describe("TC3 Cache key generation", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("TC3.1 should convert query params object into hash", () => {
    // Arrange
    // Note: the time property is already deleted
    const query = JSON.stringify({
      departure: '910GACTNCTL',
      destination: '940GZZLUOXC',
      date: '2023-12-01',
      isArrivalTime: 'false'
    });

    const expectedHash = "5b10b3b7c3e54df39a0ac40f57753a560ba11cb6a3ca8c151c9adeb417545b2a";

    jest.spyOn(CachingService, "getHash");

    // Act
    const actual = CachingService.getHash(query);

    // Assert
    expect(CachingService.getHash).toHaveBeenCalledTimes(1);
    expect(CachingService.getHash).toHaveBeenCalledWith(query);
    expect(actual).toBe(expectedHash);
  });

  test("TC3.2 should round times to the closest time window interval", () => {
    // Arrange
    const date = "2023-12-01";
    const times = ["11:27", "11:28", "11:29", "11:30", "11:31", "11:32", "11:33"];
    const interval = 5;

    const expectedRoundedTimes = ["11:25", "11:30", "11:30", "11:30", "11:30", "11:30", "11:35"];

    const spy = jest.spyOn(CachingService, "getClosestTimeInterval");

    times.forEach((time, index) => {
      // Act
      const roundedTime = CachingService.getClosestTimeInterval(date, time, interval);

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(roundedTime).toBe(expectedRoundedTimes[index]);
      spy.mockClear();
    });
  });

  test("TC3.3 should convert query object into cache key", () => {
    // Arrange
    // Note that this test will assume the default time interval of 5 minutes of the getClosestTimeInterval method.
    const query = {
      departure: '910GACTNCTL',
      destination: '940GZZLUOXC',
      date: '2023-12-01',
      time: '11:00',
      isArrivalTime: 'false'
    };
    const queryWithoutTime = {
      departure: '910GACTNCTL',
      destination: '940GZZLUOXC',
      date: '2023-12-01',
      isArrivalTime: 'false'
    };

    const expectedJourneyHash = "5b10b3b7c3e54df39a0ac40f57753a560ba11cb6a3ca8c151c9adeb417545b2a";
    const expectedCacheKey = "11:00:5b10b3b7c3e54df39a0ac40f57753a560ba11cb6a3ca8c151c9adeb417545b2a";

    jest.spyOn(CachingService, "generateCacheKey");
    const hashSpy = jest.spyOn(CachingService, "getHash");
    jest.spyOn(CachingService, "getClosestTimeInterval");

    // Act
    const actualCacheKey = CachingService.generateCacheKey(query);

    // Assert
    expect(CachingService.generateCacheKey).toHaveBeenCalledTimes(1);
    expect(CachingService.generateCacheKey).toHaveBeenCalledWith(query);
    expect(CachingService.getHash).toHaveBeenCalledTimes(1);
    expect(CachingService.getHash).toHaveBeenCalledWith(JSON.stringify(queryWithoutTime));
    expect(hashSpy.mock.results[0].value).toBe(expectedJourneyHash);
    expect(CachingService.getClosestTimeInterval).toHaveBeenCalledTimes(1);
    expect(CachingService.getClosestTimeInterval).toHaveBeenCalledWith(query.date, query.time);
    expect(actualCacheKey).toBe(expectedCacheKey);
  });

  test("TC3.4 cache key should be null if missing query property", () => {
    // Arrange
    // simulate missing "time" property in query object
    const query = {
      departure: '910GACTNCTL',
      destination: '940GZZLUOXC',
      date: '2023-12-01',
      isArrivalTime: 'false'
    };

    jest.spyOn(CachingService, "generateCacheKey");

    // Act
    const actualCacheKey = CachingService.generateCacheKey(query);

    // Assert
    expect(CachingService.generateCacheKey).toHaveBeenCalledTimes(1);
    expect(CachingService.generateCacheKey).toHaveBeenCalledWith(query);
    expect(actualCacheKey).toBe(null);
  });
});
