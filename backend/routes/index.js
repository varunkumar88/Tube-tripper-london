const express = require('express');
const router = express.Router();
const processedStationData = require("../services/station-service/processed-stations-data.json")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET station data that populates the From and To selects */
router.get("/stations", function (req, res) {
  res.status(200).json(processedStationData)
});

module.exports = router;
