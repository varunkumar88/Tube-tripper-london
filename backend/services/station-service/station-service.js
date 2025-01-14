const station = require("./stations.json");
const stationPoints = require("./station-points.json");
const fs = require('fs');
const tubeStation = require("./tube-station")

/**
 * Processes station data and extracts relevant information.
 * @param {Array} stations - An array of station objects.
 * @param {Array} stationPoints - An array of station points objects.
 * @returns {Array} - An array containing processed station data objects.
 */
function processStationData(stations, stationPoints) {
    let stationDataArray = [];
    let uniqueTubeStations = [...new Set(tubeStation.lines)];
    stations.forEach((station) => {
        if (uniqueTubeStations.includes(station.Name)) {
            const matchingPoints = stationPoints.filter((point) => {
                return point.StationUniqueId === station.UniqueId;
            });
            if (matchingPoints.length > 0) {
                const splitId = matchingPoints[0].UniqueId.split('-');
                const stationDataObject = {
                    value: `${splitId[1]}`,
                    label: `${station.Name}`,
                };
                const existingIndex = stationDataArray.findIndex(
                    (item) => item.value === stationDataObject.value &&
                        item.label === stationDataObject.label
                );
                if (existingIndex === -1) {
                    stationDataArray.push(stationDataObject);
                }
            }
        }
    });
    sortAlphabetically(stationDataArray)
    return stationDataArray;
}

function sortAlphabetically(data) {
    // Sort the array based on the 'label' key
    const sortedData = data.sort((a, b) => a.label.localeCompare(b.label));
    return sortedData;
}

/**
 * Writes data to a JSON file.
 * @param {Array} data - The data to be written to the JSON file.
 * @param {string} fileName - The name of the output JSON file.
 */
const writeToJsonFile = (data, fileName) => {
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
};
const processedData = processStationData(station, stationPoints);
const outputFileName = 'processed-stations-data.json';
writeToJsonFile(processedData, outputFileName);