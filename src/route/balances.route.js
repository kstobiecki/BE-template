const { Router: expressRouter } = require('express');
const { getProfile } = require('../middleware/getProfile');
const balancesController = require('../controller/balances.controller');
const router = expressRouter();

/**
 * @returns information if deposit was successful
 */
router.post('/deposit/:userId', getProfile, balancesController.deposit);

module.exports = router;
