const { Router: expressRouter } = require('express');
const { getProfile } = require('../middleware/getProfile');
const jobsController = require('../controller/jobs.controller');
const router = expressRouter();

/**
 * @returns all unpaid jobs for a profile
 */
router.get('/unpaid', getProfile, jobsController.unpaid);

/**
 * @returns information if payment was successful
 */
router.post('/:job_id/pay', getProfile, jobsController.pay);

module.exports = router;
