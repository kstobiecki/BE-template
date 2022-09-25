const { Router: expressRouter } = require('express');
const { getProfile } = require('../middleware/getProfile');
const contractController = require('../controller/contract.controller');
const router = expressRouter();

/**
 * @returns contract by id belonging to a profile
 */
router.get('/:id', getProfile, contractController.getContract);
/**
 * @returns contracts belonging to a profile with status not terminated
 */
router.get('/', getProfile, contractController.getContracts);

module.exports = router;
