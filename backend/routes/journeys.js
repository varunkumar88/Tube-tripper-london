const express = require('express');
const router = express.Router();
const journeyService = require('../services/journey-service/journey-service')
const JourneyModelRequest = require('../models/journey-model-request')

/**
 * fetches journey objects from either the cache in the case of a cache hit, or from the TfL API in the case of a cache
 * miss or expired cache.
 */
router.get("/journey-results", async (req, res) => {
    try {
        const journeyModelRequest = new JourneyModelRequest(req.query);
        const journey = await journeyService.getJourney(journeyModelRequest);
        res.status(200).json(journey);
    } catch (error) {
        res.status(error.code ?? 500).json({message: error.message});
    }
})

module.exports = router;
